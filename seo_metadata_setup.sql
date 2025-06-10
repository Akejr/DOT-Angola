-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO: METADADOS SEO
-- =====================================================
-- Este script cria a tabela para armazenar metadados SEO
-- gerados automaticamente para produtos e categorias
-- =====================================================

-- Tabela de metadados SEO
CREATE TABLE IF NOT EXISTS seo_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('product', 'category')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT[], -- Array de palavras-chave
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    twitter_title VARCHAR(255),
    twitter_description TEXT,
    canonical_url TEXT,
    structured_data JSONB, -- Dados estruturados JSON-LD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índice único composto para entity_id + entity_type
    UNIQUE(entity_id, entity_type)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity_id ON seo_metadata(entity_id);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_entity_type ON seo_metadata(entity_type);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_updated_at ON seo_metadata(updated_at);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_keywords ON seo_metadata USING GIN (keywords);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_seo_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_seo_metadata_updated_at_trigger
    BEFORE UPDATE ON seo_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_seo_metadata_updated_at();

-- Configurar RLS (Row Level Security)
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública dos metadados SEO
CREATE POLICY "Allow public read access on seo_metadata" ON seo_metadata
    FOR SELECT USING (true);

-- Política para permitir inserção/atualização (pode ser restrita conforme necessário)
CREATE POLICY "Allow seo updates" ON seo_metadata
    FOR ALL USING (true);

-- =====================================================
-- FUNÇÕES AUXILIARES PARA SEO
-- =====================================================

-- Função para buscar metadados SEO de um produto
CREATE OR REPLACE FUNCTION get_product_seo_metadata(product_id UUID)
RETURNS TABLE (
    title VARCHAR(255),
    description TEXT,
    keywords TEXT[],
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    structured_data JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.title,
        sm.description,
        sm.keywords,
        sm.og_title,
        sm.og_description,
        sm.og_image,
        sm.structured_data
    FROM seo_metadata sm
    WHERE sm.entity_id = product_id AND sm.entity_type = 'product';
END;
$$;

-- Função para buscar metadados SEO de uma categoria
CREATE OR REPLACE FUNCTION get_category_seo_metadata(category_id UUID)
RETURNS TABLE (
    title VARCHAR(255),
    description TEXT,
    keywords TEXT[],
    og_title VARCHAR(255),
    og_description TEXT,
    og_image TEXT,
    structured_data JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.title,
        sm.description,
        sm.keywords,
        sm.og_title,
        sm.og_description,
        sm.og_image,
        sm.structured_data
    FROM seo_metadata sm
    WHERE sm.entity_id = category_id AND sm.entity_type = 'category';
END;
$$;

-- Função para contar metadados SEO por tipo
CREATE OR REPLACE FUNCTION count_seo_metadata_by_type()
RETURNS TABLE (
    entity_type VARCHAR(20),
    total_count BIGINT,
    recent_count BIGINT -- Últimos 7 dias
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sm.entity_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN sm.updated_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_count
    FROM seo_metadata sm
    GROUP BY sm.entity_type;
END;
$$;

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar SEO quando produto é modificado
CREATE OR REPLACE FUNCTION trigger_update_product_seo()
RETURNS TRIGGER AS $$
BEGIN
    -- Marcar para atualização (pode ser processado pelo sistema de SEO automático)
    INSERT INTO seo_metadata (entity_id, entity_type, title, description, keywords, updated_at)
    VALUES (
        NEW.id, 
        'product', 
        COALESCE(NEW.name || ' | DOT Angola - Importação da Europa', 'Produto | DOT Angola'),
        COALESCE(NEW.description, 'Produto de importação da DOT Angola'),
        ARRAY['importação Angola', 'produtos Europa', NEW.name],
        NOW()
    )
    ON CONFLICT (entity_id, entity_type) 
    DO UPDATE SET 
        title = COALESCE(NEW.name || ' | DOT Angola - Importação da Europa', 'Produto | DOT Angola'),
        description = COALESCE(NEW.description, 'Produto de importação da DOT Angola'),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger aos produtos físicos
CREATE TRIGGER trigger_product_seo_update
    AFTER INSERT OR UPDATE ON physical_products
    FOR EACH ROW EXECUTE FUNCTION trigger_update_product_seo();

-- Trigger para atualizar SEO quando categoria é modificada
CREATE OR REPLACE FUNCTION trigger_update_category_seo()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO seo_metadata (entity_id, entity_type, title, description, keywords, updated_at)
    VALUES (
        NEW.id, 
        'category', 
        COALESCE(NEW.name || ' | Importação Angola - DOT', 'Categoria | DOT Angola'),
        COALESCE(NEW.description, 'Categoria de produtos para importação'),
        ARRAY['importação Angola', NEW.name || ' Angola', 'categoria ' || NEW.name],
        NOW()
    )
    ON CONFLICT (entity_id, entity_type) 
    DO UPDATE SET 
        title = COALESCE(NEW.name || ' | Importação Angola - DOT', 'Categoria | DOT Angola'),
        description = COALESCE(NEW.description, 'Categoria de produtos para importação'),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger às categorias
CREATE TRIGGER trigger_category_seo_update
    AFTER INSERT OR UPDATE ON physical_product_categories
    FOR EACH ROW EXECUTE FUNCTION trigger_update_category_seo();

-- =====================================================
-- DADOS DE EXEMPLO PARA PRODUTOS EXISTENTES
-- =====================================================

-- Gerar metadados SEO básicos para produtos existentes
INSERT INTO seo_metadata (entity_id, entity_type, title, description, keywords)
SELECT 
    p.id,
    'product',
    p.name || ' | DOT Angola - Importação da Europa',
    COALESCE(p.description, 'Importe ' || p.name || ' da Europa para Angola com segurança e qualidade garantida. Entrega em 7-15 dias úteis.'),
    ARRAY['importação Angola', 'produtos Europa', p.name, 'DOT Angola']
FROM physical_products p
WHERE p.is_active = true
ON CONFLICT (entity_id, entity_type) DO NOTHING;

-- Gerar metadados SEO básicos para categorias existentes
INSERT INTO seo_metadata (entity_id, entity_type, title, description, keywords)
SELECT 
    c.id,
    'category',
    c.name || ' | Importação Angola - DOT',
    COALESCE(c.description, 'Importe ' || c.name || ' originais para Angola. Produtos com entrega em 7-15 dias e garantia internacional.'),
    ARRAY['importação Angola', c.name || ' Angola', 'categoria ' || c.name]
FROM physical_product_categories c
ON CONFLICT (entity_id, entity_type) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
BEGIN
    -- Verificar se a tabela foi criada corretamente
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'seo_metadata') THEN
        RAISE NOTICE 'Tabela seo_metadata criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela seo_metadata não foi criada!';
    END IF;
    
    -- Mostrar estatísticas
    RAISE NOTICE 'Metadados SEO criados: %', (SELECT COUNT(*) FROM seo_metadata);
    RAISE NOTICE 'Produtos com SEO: %', (SELECT COUNT(*) FROM seo_metadata WHERE entity_type = 'product');
    RAISE NOTICE 'Categorias com SEO: %', (SELECT COUNT(*) FROM seo_metadata WHERE entity_type = 'category');
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CONFIGURAÇÃO DE SEO METADATA CONCLUÍDA!';
    RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- COMANDOS ÚTEIS PARA MANUTENÇÃO
-- =====================================================

-- Para ver estatísticas de SEO:
/*
SELECT * FROM count_seo_metadata_by_type();
*/

-- Para buscar metadados de um produto específico:
/*
SELECT * FROM get_product_seo_metadata('UUID_DO_PRODUTO');
*/

-- Para ver produtos sem metadados SEO:
/*
SELECT p.id, p.name 
FROM physical_products p 
LEFT JOIN seo_metadata sm ON p.id = sm.entity_id AND sm.entity_type = 'product'
WHERE sm.entity_id IS NULL AND p.is_active = true;
*/

-- Para atualizar metadados SEO em massa:
/*
UPDATE seo_metadata 
SET keywords = keywords || ARRAY['nova_palavra_chave']
WHERE entity_type = 'product';
*/ 