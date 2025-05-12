-- Verificar e atualizar a restrição currency na tabela gift_cards
DO $$
DECLARE
    constraint_exists boolean;
    column_exists boolean;
BEGIN
    -- Verificar se a coluna currency existe em gift_cards
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'gift_cards' 
        AND column_name = 'currency'
    ) INTO column_exists;

    IF column_exists THEN
        -- Verificar se existe alguma restrição na coluna currency
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.constraint_column_usage
            WHERE table_name = 'gift_cards' 
            AND column_name = 'currency'
        ) INTO constraint_exists;

        IF constraint_exists THEN
            -- Se existe uma restrição, modifique para incluir KWZ
            ALTER TABLE gift_cards 
            DROP CONSTRAINT IF EXISTS gift_cards_currency_check;
        END IF;

        -- Adicionar validação para aceitar KWZ como moeda válida
        ALTER TABLE gift_cards 
        ADD CONSTRAINT gift_cards_currency_check 
        CHECK (currency IN ('EUR', 'BRL', 'KWZ'));
        
        RAISE NOTICE 'Restrição de currency atualizada em gift_cards para incluir KWZ';
    ELSE
        RAISE NOTICE 'A coluna currency não existe na tabela gift_cards';
    END IF;
END $$;

-- Verificar e atualizar a restrição currency na tabela gift_card_plans
DO $$
DECLARE
    constraint_exists boolean;
BEGIN
    -- Verificar se existe alguma restrição na coluna currency
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'gift_card_plans' 
        AND column_name = 'currency'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        -- Se existe uma restrição, modifique para incluir KWZ
        ALTER TABLE gift_card_plans 
        DROP CONSTRAINT IF EXISTS gift_card_plans_currency_check;
    END IF;

    -- Adicionar validação para aceitar KWZ como moeda válida
    ALTER TABLE gift_card_plans 
    ADD CONSTRAINT gift_card_plans_currency_check 
    CHECK (currency IN ('EUR', 'BRL', 'KWZ'));
    
    RAISE NOTICE 'Restrição de currency atualizada em gift_card_plans para incluir KWZ';
END $$;

-- Verificar e atualizar a restrição currency na tabela exchange_rates
DO $$
DECLARE
    constraint_exists boolean;
    kwz_exists boolean;
BEGIN
    -- Verificar se existe alguma restrição na coluna currency
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'exchange_rates' 
        AND column_name = 'currency'
    ) INTO constraint_exists;

    IF constraint_exists THEN
        -- Se existe uma restrição, modifique para incluir KWZ
        ALTER TABLE exchange_rates 
        DROP CONSTRAINT IF EXISTS exchange_rates_currency_check;
    END IF;

    -- Adicionar validação para aceitar KWZ como moeda válida
    ALTER TABLE exchange_rates 
    ADD CONSTRAINT exchange_rates_currency_check 
    CHECK (currency IN ('EUR', 'BRL', 'KWZ'));
    
    -- Verificar se já existe uma taxa para KWZ
    SELECT EXISTS (
        SELECT 1
        FROM exchange_rates
        WHERE currency = 'KWZ'
    ) INTO kwz_exists;

    IF NOT kwz_exists THEN
        -- Adicionar taxa de câmbio para KWZ se não existir (taxa 1:1)
        INSERT INTO exchange_rates (currency, rate, updated_at)
        VALUES ('KWZ', 1.0, NOW());
        
        RAISE NOTICE 'Taxa de câmbio para KWZ adicionada com valor 1.0';
    END IF;
    
    RAISE NOTICE 'Restrição de currency atualizada em exchange_rates para incluir KWZ';
END $$;

-- Criar ou atualizar uma função para verificar se o valor de KWZ está correto
CREATE OR REPLACE FUNCTION verify_kwanza_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- Para atualizações em gift_card_plans quando a moeda é KWZ
    IF NEW.currency = 'KWZ' THEN
        -- Registrar a alteração para depuração
        RAISE NOTICE 'Plano atualizado com moeda KWZ: ID=%, Nome=%, Valor=%', 
                     NEW.id, NEW.name, NEW.price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para monitorar alterações em gift_card_plans
DROP TRIGGER IF EXISTS verify_kwanza_conversion_trigger ON gift_card_plans;
CREATE TRIGGER verify_kwanza_conversion_trigger
AFTER INSERT OR UPDATE ON gift_card_plans
FOR EACH ROW
EXECUTE FUNCTION verify_kwanza_conversion();

-- Verificar se a tabela settings existe antes de inserir
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'settings'
    ) INTO table_exists;

    IF table_exists THEN
        -- Log da alteração realizada apenas se a tabela existir
        INSERT INTO settings (site_name, site_description, default_currency)
        VALUES ('Gift Card Haven', 'Sistema atualizado com suporte a Kwanza', 'KWZ')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$; 