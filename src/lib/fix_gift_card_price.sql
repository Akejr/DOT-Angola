-- Script para corrigir problemas de preço na tabela gift_cards
-- e atualizar a função de inserção/atualização de planos

-- 1. Primeiro vamos verificar se price é obrigatório e torná-lo nulo se necessário
DO $$
DECLARE
    column_nullable text;
BEGIN
    -- Verificar se a coluna price na tabela gift_cards permite NULL
    SELECT c.is_nullable INTO column_nullable
    FROM information_schema.columns c
    WHERE c.table_name = 'gift_cards'
      AND c.column_name = 'price';
    
    IF column_nullable = 'NO' THEN
        -- Tornar a coluna price anulável para compatibilidade com planos
        ALTER TABLE gift_cards ALTER COLUMN price DROP NOT NULL;
        RAISE NOTICE 'Coluna price agora permite valores NULL';
    END IF;
    
    -- Verificar se a coluna original_price na tabela gift_cards permite NULL
    SELECT c.is_nullable INTO column_nullable
    FROM information_schema.columns c
    WHERE c.table_name = 'gift_cards'
      AND c.column_name = 'original_price';
    
    IF column_nullable = 'NO' THEN
        -- Tornar a coluna original_price anulável para compatibilidade com planos
        ALTER TABLE gift_cards ALTER COLUMN original_price DROP NOT NULL;
        RAISE NOTICE 'Coluna original_price agora permite valores NULL';
    END IF;
END $$;

-- 2. Criar ou substituir uma função para atualizar o preço original baseado no menor preço dos planos
CREATE OR REPLACE FUNCTION update_gift_card_price()
RETURNS TRIGGER AS $$
DECLARE
    min_price decimal(10,2);
    curr_currency varchar(3);
BEGIN
    -- Selecionar o menor preço entre todos os planos
    SELECT price, currency INTO min_price, curr_currency
    FROM gift_card_plans
    WHERE gift_card_id = NEW.gift_card_id
    ORDER BY price ASC
    LIMIT 1;
    
    -- Atualizar o gift card com o menor preço e moeda
    IF min_price IS NOT NULL THEN
        UPDATE gift_cards
        SET original_price = min_price,
            price = min_price,
            currency = curr_currency
        WHERE id = NEW.gift_card_id;
        
        RAISE NOTICE 'Preço do gift card % atualizado para % %', 
                     NEW.gift_card_id, min_price, curr_currency;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar ou substituir triggers para automatizar a atualização de preço
-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_gift_card_price_insert ON gift_card_plans;
DROP TRIGGER IF EXISTS update_gift_card_price_update ON gift_card_plans;
DROP TRIGGER IF EXISTS update_gift_card_price_delete ON gift_card_plans;

-- Trigger para novos planos
CREATE TRIGGER update_gift_card_price_insert
AFTER INSERT ON gift_card_plans
FOR EACH ROW
EXECUTE FUNCTION update_gift_card_price();

-- Trigger para planos atualizados
CREATE TRIGGER update_gift_card_price_update
AFTER UPDATE ON gift_card_plans
FOR EACH ROW
EXECUTE FUNCTION update_gift_card_price();

-- Trigger para planos excluídos
CREATE TRIGGER update_gift_card_price_delete
AFTER DELETE ON gift_card_plans
FOR EACH ROW
EXECUTE FUNCTION update_gift_card_price();

-- 4. Atualizar preços de gift cards existentes com base nos planos atuais
DO $$
DECLARE
    gift_card_rec RECORD;
    min_price decimal(10,2);
    curr_currency varchar(3);
BEGIN
    -- Para cada gift card que tem planos
    FOR gift_card_rec IN 
        SELECT DISTINCT gift_card_id 
        FROM gift_card_plans
    LOOP
        -- Encontrar o menor preço entre os planos
        SELECT price, currency INTO min_price, curr_currency
        FROM gift_card_plans
        WHERE gift_card_id = gift_card_rec.gift_card_id
        ORDER BY price ASC
        LIMIT 1;
        
        -- Atualizar o gift card
        IF min_price IS NOT NULL THEN
            UPDATE gift_cards
            SET original_price = min_price,
                price = min_price,
                currency = curr_currency
            WHERE id = gift_card_rec.gift_card_id;
            
            RAISE NOTICE 'Gift Card ID % atualizado com preço % %', 
                         gift_card_rec.gift_card_id, min_price, curr_currency;
        END IF;
    END LOOP;
END $$; 