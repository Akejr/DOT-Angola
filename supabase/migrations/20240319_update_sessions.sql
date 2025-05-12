-- Adiciona a coluna is_first_visit
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN DEFAULT false;

-- Atualiza registros existentes
UPDATE sessions SET is_first_visit = true;

-- Adiciona o campo path se não existir
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS path TEXT; 