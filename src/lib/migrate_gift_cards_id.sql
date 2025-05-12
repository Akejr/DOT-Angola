-- Script para migrar o tipo da coluna ID de gift_cards de bigint para UUID, caso necessário
-- ATENÇÃO: Este script deve ser usado com cautela, pois modifica a estrutura da tabela principal
-- Faça backup do banco de dados antes de executar

-- Habilitar uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar o tipo atual da coluna id
DO $$
DECLARE
    column_type TEXT;
BEGIN
    SELECT data_type INTO column_type 
    FROM information_schema.columns 
    WHERE table_name = 'gift_cards' AND column_name = 'id';
    
    IF column_type = 'bigint' THEN
        RAISE NOTICE 'Iniciando migração da coluna id de bigint para UUID...';
    ELSE
        RAISE EXCEPTION 'A coluna id já é do tipo %. Migração não necessária.', column_type;
    END IF;
END $$;

-- Criar tabela temporária com a nova estrutura
CREATE TABLE gift_cards_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    delivery_method VARCHAR(20) DEFAULT 'code',
    original_price DECIMAL(10, 2),
    currency VARCHAR(3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copiar dados com IDs convertidos
INSERT INTO gift_cards_new (
    id,
    name,
    description,
    image_url,
    is_featured,
    delivery_method,
    original_price,
    currency,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4() as id,
    name,
    description,
    image_url,
    is_featured,
    delivery_method,
    original_price,
    currency,
    created_at,
    updated_at
FROM 
    gift_cards;

-- Criar mapeamento entre IDs antigos e novos
CREATE TABLE id_mapping (
    old_id BIGINT PRIMARY KEY,
    new_id UUID NOT NULL
);

WITH src AS (
    SELECT 
        g.id AS old_id,
        n.id AS new_id
    FROM 
        gift_cards g
    JOIN 
        gift_cards_new n ON g.name = n.name AND g.created_at = n.created_at
)
INSERT INTO id_mapping (old_id, new_id)
SELECT old_id, new_id FROM src;

-- Atualizar as tabelas relacionadas (gift_card_categories)
CREATE TABLE gift_card_categories_new (
    gift_card_id UUID NOT NULL REFERENCES gift_cards_new(id) ON DELETE CASCADE,
    category_id VARCHAR(255) NOT NULL,  -- Ajuste conforme o tipo real na sua tabela
    PRIMARY KEY (gift_card_id, category_id)
);

INSERT INTO gift_card_categories_new (gift_card_id, category_id)
SELECT 
    m.new_id,
    gc.category_id
FROM 
    gift_card_categories gc
JOIN 
    id_mapping m ON gc.gift_card_id = m.old_id;

-- [TRANSAÇÃO] As operações a seguir devem ser executadas em uma transação
-- para evitar inconsistências no banco de dados
BEGIN;

-- Renomear tabelas antigas
ALTER TABLE gift_cards RENAME TO gift_cards_old;
ALTER TABLE gift_card_categories RENAME TO gift_card_categories_old;

-- Renomear tabelas novas
ALTER TABLE gift_cards_new RENAME TO gift_cards;
ALTER TABLE gift_card_categories_new RENAME TO gift_card_categories;

-- Recriar índices e constraints
ALTER TABLE gift_card_categories ADD CONSTRAINT fk_gift_card_categories_category_id
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- Recriar RLS policies
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY gift_cards_select_policy ON gift_cards
  FOR SELECT USING (true);

CREATE POLICY gift_cards_modify_policy ON gift_cards
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY gift_card_categories_select_policy ON gift_card_categories
  FOR SELECT USING (true);

CREATE POLICY gift_card_categories_modify_policy ON gift_card_categories
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Confirmar alterações
COMMIT;

-- Verificar se a migração foi bem-sucedida
SELECT COUNT(*) AS gift_cards_count FROM gift_cards;
SELECT COUNT(*) AS gift_cards_old_count FROM gift_cards_old;
SELECT COUNT(*) AS categories_relations_count FROM gift_card_categories;
SELECT COUNT(*) AS categories_relations_old_count FROM gift_card_categories_old;

-- Se tudo estiver correto, você pode excluir as tabelas antigas depois
-- DROP TABLE gift_cards_old;
-- DROP TABLE gift_card_categories_old;
-- DROP TABLE id_mapping; 