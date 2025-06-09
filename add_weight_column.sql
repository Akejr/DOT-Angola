-- Script para adicionar coluna 'weight' na tabela physical_products
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna weight (peso em kg)
ALTER TABLE physical_products 
ADD COLUMN weight DECIMAL(10,3) NULL;

-- 2. Adicionar comentário na coluna
COMMENT ON COLUMN physical_products.weight IS 'Peso do produto em quilogramas';

-- 3. Criar índice para facilitar buscas por peso (opcional)
CREATE INDEX IF NOT EXISTS idx_physical_products_weight 
ON physical_products(weight) 
WHERE weight IS NOT NULL;

-- 4. Atualizar RLS (Row Level Security) para incluir a nova coluna (se necessário)
-- As políticas existentes já devem cobrir esta coluna automaticamente

-- 5. Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'physical_products' 
AND column_name = 'weight';

-- 6. Exemplo de atualização de produtos existentes (opcional)
-- UPDATE physical_products SET weight = 1.5 WHERE name LIKE '%exemplo%';

-- 7. Consulta para verificar produtos com peso
SELECT id, name, price, weight, created_at 
FROM physical_products 
WHERE weight IS NOT NULL 
ORDER BY weight DESC;

COMMIT;

-- Comandos de verificação e manutenção:

-- Verificar estrutura da tabela
\d physical_products;

-- Verificar produtos sem peso
SELECT COUNT(*) as produtos_sem_peso 
FROM physical_products 
WHERE weight IS NULL;

-- Verificar produtos com peso
SELECT COUNT(*) as produtos_com_peso 
FROM physical_products 
WHERE weight IS NOT NULL;

-- Estatísticas de peso
SELECT 
  COUNT(*) as total_produtos,
  COUNT(weight) as produtos_com_peso,
  AVG(weight) as peso_medio,
  MIN(weight) as peso_minimo,
  MAX(weight) as peso_maximo
FROM physical_products; 