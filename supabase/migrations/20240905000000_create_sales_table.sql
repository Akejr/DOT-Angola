-- Criar a tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_location TEXT NOT NULL,
    date DATE NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    invoice_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar um índice na data para facilitar a busca por período
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);

-- Criar um índice no número da fatura para facilitar a busca
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales(invoice_number);

-- Habilitar RLS para sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Criar as políticas de segurança para sales
CREATE POLICY "Enable read access for authenticated users"
ON sales FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
ON sales FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON sales FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON sales FOR DELETE
USING (auth.role() = 'authenticated');

-- Criar trigger para atualização automática do updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp(); 