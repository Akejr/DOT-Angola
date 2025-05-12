-- Adicionar coluna slug
ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS slug TEXT;

-- Criar índice único para o slug
CREATE UNIQUE INDEX IF NOT EXISTS gift_cards_slug_idx ON gift_cards(slug);

-- Atualizar slugs existentes
UPDATE gift_cards
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        name,
        '[áàãâä]', 'a'
      ),
      '[éèêë]', 'e'
    ),
    '[^a-z0-9]+', '-', 'g'
  )
); 