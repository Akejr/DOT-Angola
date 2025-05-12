-- Habilitar uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar o tipo da coluna id na tabela gift_cards
DO $$
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type INTO column_type 
    FROM information_schema.columns 
    WHERE table_name = 'gift_cards' AND column_name = 'id';
    
    IF column_type = 'bigint' THEN
        -- Tabela de planos de gift cards para id do tipo bigint
        EXECUTE '
        CREATE TABLE IF NOT EXISTS gift_card_plans (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          gift_card_id BIGINT NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )';
    ELSIF column_type = 'uuid' THEN
        -- Tabela de planos de gift cards para id do tipo uuid
        EXECUTE '
        CREATE TABLE IF NOT EXISTS gift_card_plans (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )';
    ELSE
        RAISE EXCEPTION 'Tipo de coluna id na tabela gift_cards não suportado: %', column_type;
    END IF;
END $$;

-- Índice para consulta por gift card
CREATE INDEX IF NOT EXISTS idx_gift_card_plans_gift_card_id ON gift_card_plans(gift_card_id);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_gift_card_plan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp
CREATE TRIGGER update_gift_card_plan_timestamp
BEFORE UPDATE ON gift_card_plans
FOR EACH ROW
EXECUTE FUNCTION update_gift_card_plan_timestamp();

-- Adicionar coluna delivery_method na tabela gift_cards se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'gift_cards' AND column_name = 'delivery_method'
  ) THEN
    ALTER TABLE gift_cards ADD COLUMN delivery_method VARCHAR(20) DEFAULT 'code';
  END IF;
END $$;

-- RLS (Row Level Security) para a tabela gift_card_plans
ALTER TABLE gift_card_plans ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública dos planos
CREATE POLICY gift_card_plans_select_policy ON gift_card_plans
  FOR SELECT USING (true);

-- Política para permitir apenas usuários autenticados modificarem planos
CREATE POLICY gift_card_plans_modify_policy ON gift_card_plans
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Migrar dados existentes para o novo formato (se necessário)
DO $$
DECLARE
  gift_card_record RECORD;
  column_type TEXT;
BEGIN
  -- Verificar o tipo de coluna id na tabela gift_cards
  SELECT data_type INTO column_type 
  FROM information_schema.columns 
  WHERE table_name = 'gift_cards' AND column_name = 'id';
  
  FOR gift_card_record IN SELECT id, original_price, currency FROM gift_cards 
  WHERE original_price IS NOT NULL AND currency IS NOT NULL
  LOOP
    -- Verificar se já existe um plano para este gift card
    IF NOT EXISTS (SELECT 1 FROM gift_card_plans WHERE gift_card_id = gift_card_record.id) THEN
      -- Inserir um plano padrão com o preço e moeda existentes
      INSERT INTO gift_card_plans (gift_card_id, name, price, currency)
      VALUES (
        gift_card_record.id, 
        'Plano Padrão', 
        gift_card_record.original_price, 
        gift_card_record.currency
      );
    END IF;
  END LOOP;
END $$; 