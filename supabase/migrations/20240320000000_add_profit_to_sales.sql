-- Adicionar coluna de lucro na tabela de vendas
ALTER TABLE sales
ADD COLUMN profit DECIMAL(10,2) DEFAULT 0;

-- Atualizar a coluna items para incluir o campo profit
ALTER TABLE sales
ALTER COLUMN items TYPE JSONB USING items::jsonb;

-- Criar uma função para atualizar o lucro total baseado nos itens
CREATE OR REPLACE FUNCTION update_sale_profit()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular o lucro total somando o lucro de todos os itens
    NEW.profit := (
        SELECT COALESCE(SUM((item->>'profit')::DECIMAL), 0)
        FROM jsonb_array_elements(NEW.items) AS item
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar um trigger para atualizar automaticamente o lucro total
CREATE TRIGGER update_sale_profit_trigger
BEFORE INSERT OR UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION update_sale_profit();

-- Comentário explicativo
COMMENT ON COLUMN sales.profit IS 'Lucro total da venda, calculado automaticamente a partir do lucro dos itens'; 