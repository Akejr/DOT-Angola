-- Script para corrigir a tabela system_settings
-- Adiciona as colunas maintenance_mode e maintenance_message se não existirem

-- Cria a função set_updated_at se não existir
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verifica se a tabela system_settings existe e cria se não existir
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona a coluna maintenance_mode se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'system_settings' AND column_name = 'maintenance_mode'
  ) THEN
    ALTER TABLE system_settings ADD COLUMN maintenance_mode BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Adiciona a coluna maintenance_message se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'system_settings' AND column_name = 'maintenance_message'
  ) THEN
    ALTER TABLE system_settings ADD COLUMN maintenance_message TEXT DEFAULT 'O site está em manutenção. Por favor, volte mais tarde.';
  END IF;
END $$;

-- Insere um registro padrão se a tabela estiver vazia
INSERT INTO system_settings (maintenance_mode, maintenance_message)
SELECT false, 'O site está em manutenção. Por favor, volte mais tarde.'
WHERE NOT EXISTS (SELECT 1 FROM system_settings LIMIT 1);

-- Atualiza a trigger para atualizar o updated_at automaticamente
DROP TRIGGER IF EXISTS set_updated_at ON system_settings;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();