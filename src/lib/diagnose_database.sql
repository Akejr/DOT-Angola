-- Script para diagnosticar a estrutura atual do banco de dados
-- Este script irá mostrar os tipos de colunas nas tabelas relevantes
-- Executar este script antes de fazer qualquer alteração na estrutura do banco de dados

-- Verificar se as tabelas existem
SELECT 
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_name IN ('gift_cards', 'gift_card_categories', 'categories', 'gift_card_plans')
ORDER BY 
    table_name;

-- Verificar os tipos de colunas na tabela gift_cards
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'gift_cards'
ORDER BY 
    ordinal_position;

-- Verificar os tipos de colunas na tabela gift_card_categories (se existir)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'gift_card_categories'
ORDER BY 
    ordinal_position;

-- Verificar os tipos de colunas na tabela categories
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'categories'
ORDER BY 
    ordinal_position;

-- Verificar as constraints de chave estrangeira existentes
SELECT
    tc.table_name AS table_name,
    kcu.column_name AS column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'gift_cards' OR tc.table_name = 'gift_card_categories')
ORDER BY
    tc.table_name,
    kcu.column_name;

-- Verificar quantos registros existem em cada tabela
SELECT 'gift_cards' AS table_name, COUNT(*) AS row_count FROM gift_cards
UNION ALL
SELECT 'categories' AS table_name, COUNT(*) AS row_count FROM categories
UNION ALL
SELECT 'gift_card_categories' AS table_name, COUNT(*) AS row_count 
FROM gift_card_categories WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gift_card_categories')
ORDER BY table_name; 