-- Criar tabela para armazenar configurações de promoções
CREATE TABLE IF NOT EXISTS promotion_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_percentage FLOAT NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  applies_to_all BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar comentários para documentação
COMMENT ON TABLE promotion_settings IS 'Tabela para armazenar configurações de promoções e descontos';
COMMENT ON COLUMN promotion_settings.discount_percentage IS 'Porcentagem de desconto a ser aplicada (0-100)';
COMMENT ON COLUMN promotion_settings.is_active IS 'Indica se a promoção está ativa ou não';
COMMENT ON COLUMN promotion_settings.applies_to_all IS 'Se verdadeiro, aplica-se a todos os produtos do site';

-- Criar função trigger para atualizar a coluna updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar a coluna updated_at automaticamente
DROP TRIGGER IF EXISTS update_promotion_settings_updated_at ON promotion_settings;
CREATE TRIGGER update_promotion_settings_updated_at
BEFORE UPDATE ON promotion_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 