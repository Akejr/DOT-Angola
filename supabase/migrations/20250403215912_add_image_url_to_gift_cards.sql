-- Criar a tabela de relacionamento entre gift cards e categorias
CREATE TABLE IF NOT EXISTS gift_card_categories (
  gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (gift_card_id, category_id)
);

-- Habilitar RLS para gift_card_categories
ALTER TABLE gift_card_categories ENABLE ROW LEVEL SECURITY;

-- Criar as políticas de segurança para gift_card_categories
CREATE POLICY "Enable read access for authenticated users"
ON gift_card_categories FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users"
ON gift_card_categories FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users"
ON gift_card_categories FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users"
ON gift_card_categories FOR DELETE
USING (auth.role() = 'authenticated');
