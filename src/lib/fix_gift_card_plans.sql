-- Script para corrigir a incompatibilidade de tipos na criação da tabela gift_card_plans
-- Este script detecta automaticamente o tipo de coluna 'id' na tabela gift_cards
-- e cria a tabela gift_card_plans com o tipo correto para a chave estrangeira.

-- Habilitar uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se a tabela gift_card_plans já existe e excluí-la se necessário
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gift_card_plans'
    ) THEN
        DROP TABLE gift_card_plans CASCADE;
        RAISE NOTICE 'Tabela gift_card_plans existente foi excluída para recriação com o tipo correto.';
    END IF;
END $$;

-- Identificar o tipo da coluna id na tabela gift_cards e criar gift_card_plans com o tipo correto
DO $$
DECLARE
    id_type TEXT;
    sql_create TEXT;
BEGIN
    -- Obter o tipo da coluna id da tabela gift_cards
    SELECT data_type INTO id_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'gift_cards' 
      AND column_name = 'id';
    
    IF id_type IS NULL THEN
        RAISE EXCEPTION 'Tabela gift_cards não encontrada ou coluna id não existe.';
    END IF;
    
    RAISE NOTICE 'Tipo da coluna id na tabela gift_cards: %', id_type;
    
    -- Preparar script SQL para criar a tabela gift_card_plans com o tipo correto
    -- Aqui fazemos um mapeamento de tipos SQL para tipos PostgreSQL
    IF id_type = 'uuid' THEN
        sql_create := '
            CREATE TABLE gift_card_plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )';
    ELSIF id_type = 'bigint' THEN
        sql_create := '
            CREATE TABLE gift_card_plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                gift_card_id BIGINT NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )';
    ELSIF id_type = 'integer' THEN
        sql_create := '
            CREATE TABLE gift_card_plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                gift_card_id INTEGER NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )';
    ELSE
        -- Para outros tipos, usamos o tipo detectado literalmente
        sql_create := '
            CREATE TABLE gift_card_plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                gift_card_id ' || id_type || ' NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )';
    END IF;
    
    -- Criar a tabela
    EXECUTE sql_create;
    RAISE NOTICE 'Tabela gift_card_plans criada com sucesso usando o tipo % para gift_card_id.', id_type;
    
    -- Criar índice para otimizar consultas
    EXECUTE 'CREATE INDEX idx_gift_card_plans_gift_card_id ON gift_card_plans(gift_card_id)';
    
    -- Verificar se a tabela foi criada corretamente
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gift_card_plans'
    ) THEN
        RAISE NOTICE 'Verificação: Tabela gift_card_plans existe.';
    ELSE
        RAISE EXCEPTION 'Verificação falhou: Tabela gift_card_plans não foi criada corretamente.';
    END IF;
END $$;

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_gift_card_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp
DROP TRIGGER IF EXISTS update_gift_card_plan_timestamp ON gift_card_plans;
CREATE TRIGGER update_gift_card_plan_timestamp
BEFORE UPDATE ON gift_card_plans
FOR EACH ROW
EXECUTE FUNCTION update_gift_card_plan_timestamp();

-- Adicionar coluna delivery_method na tabela gift_cards se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'gift_cards' 
      AND column_name = 'delivery_method'
  ) THEN
    ALTER TABLE gift_cards ADD COLUMN delivery_method VARCHAR(20) DEFAULT 'code';
    RAISE NOTICE 'Coluna delivery_method adicionada à tabela gift_cards.';
  ELSE
    RAISE NOTICE 'Coluna delivery_method já existe na tabela gift_cards.';
  END IF;
END $$;

-- RLS (Row Level Security) para a tabela gift_card_plans
ALTER TABLE gift_card_plans ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública dos planos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies
    WHERE tablename = 'gift_card_plans' AND policyname = 'gift_card_plans_select_policy'
  ) THEN
    CREATE POLICY gift_card_plans_select_policy ON gift_card_plans
      FOR SELECT USING (true);
    RAISE NOTICE 'Policy gift_card_plans_select_policy criada.';
  ELSE
    RAISE NOTICE 'Policy gift_card_plans_select_policy já existe.';
  END IF;
END $$;

-- Política para permitir apenas usuários autenticados modificarem planos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies
    WHERE tablename = 'gift_card_plans' AND policyname = 'gift_card_plans_modify_policy'
  ) THEN
    CREATE POLICY gift_card_plans_modify_policy ON gift_card_plans
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Policy gift_card_plans_modify_policy criada.';
  ELSE
    RAISE NOTICE 'Policy gift_card_plans_modify_policy já existe.';
  END IF;
END $$;

-- Migrar dados existentes (se houver dados antigos nos gift_cards)
DO $$
DECLARE
  gift_card_record RECORD;
  has_original_price BOOLEAN;
BEGIN
  -- Verificar se a coluna original_price existe
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'gift_cards' 
      AND column_name = 'original_price'
  ) INTO has_original_price;
  
  IF has_original_price THEN
    FOR gift_card_record IN 
      SELECT id, original_price, currency FROM gift_cards 
      WHERE original_price IS NOT NULL 
        AND currency IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM gift_card_plans WHERE gift_card_id = gift_cards.id
        )
    LOOP
      -- Inserir um plano padrão
      INSERT INTO gift_card_plans (gift_card_id, name, price, currency)
      VALUES (
        gift_card_record.id, 
        'Plano Padrão', 
        gift_card_record.original_price, 
        gift_card_record.currency
      );
      RAISE NOTICE 'Plano padrão criado para gift card id: %', gift_card_record.id;
    END LOOP;
  ELSE
    RAISE NOTICE 'Coluna original_price não existe, pulando migração de dados.';
  END IF;
END $$;

-- Verificar se tudo foi criado corretamente
SELECT 
    table_name, 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'gift_card_plans'
ORDER BY 
    ordinal_position;

-- Informar ao usuário que o script foi concluído com sucesso
DO $$
BEGIN
  RAISE NOTICE '------------------------------------------------';
  RAISE NOTICE 'Script concluído com sucesso!';
  RAISE NOTICE 'A tabela gift_card_plans foi criada com o tipo correto';
  RAISE NOTICE 'para compatibilidade com a coluna id da tabela gift_cards.';
  RAISE NOTICE '------------------------------------------------';
END $$; 