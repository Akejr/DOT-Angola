-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO: PRODUTOS FÍSICOS
-- =====================================================
-- Este script cria todas as tabelas e estruturas necessárias
-- para o sistema de produtos físicos da DOT Angola
-- =====================================================

-- Tabela de categorias de produtos físicos
CREATE TABLE IF NOT EXISTS physical_product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES physical_product_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos físicos
CREATE TABLE IF NOT EXISTS physical_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    images JSONB DEFAULT '[]'::jsonb,
    category_id UUID NOT NULL REFERENCES physical_product_categories(id) ON DELETE RESTRICT,
    subcategory_id UUID REFERENCES physical_product_categories(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_physical_product_categories_parent_id ON physical_product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_physical_product_categories_slug ON physical_product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_physical_products_category_id ON physical_products(category_id);
CREATE INDEX IF NOT EXISTS idx_physical_products_subcategory_id ON physical_products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_physical_products_slug ON physical_products(slug);
CREATE INDEX IF NOT EXISTS idx_physical_products_is_active ON physical_products(is_active);
CREATE INDEX IF NOT EXISTS idx_physical_products_is_featured ON physical_products(is_featured);
CREATE INDEX IF NOT EXISTS idx_physical_products_created_at ON physical_products(created_at);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_physical_product_categories_updated_at 
    BEFORE UPDATE ON physical_product_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physical_products_updated_at 
    BEFORE UPDATE ON physical_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security) se necessário
ALTER TABLE physical_product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_products ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública
CREATE POLICY "Allow public read access on physical_product_categories" ON physical_product_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on physical_products" ON physical_products
    FOR SELECT USING (is_active = true);

-- Políticas para operações de admin (assumindo que exists uma função is_admin())
-- Se não tiver autenticação específica, pode remover essas políticas
CREATE POLICY "Allow admin full access on physical_product_categories" ON physical_product_categories
    FOR ALL USING (true);

CREATE POLICY "Allow admin full access on physical_products" ON physical_products
    FOR ALL USING (true);

-- =====================================================
-- DADOS DE EXEMPLO (opcional)
-- =====================================================

-- Inserir categorias de exemplo
INSERT INTO physical_product_categories (name, description, slug) VALUES
('Eletrônicos', 'Produtos eletrônicos em geral', 'eletronicos'),
('Smartphones', 'Telefones inteligentes e acessórios', 'smartphones'),
('Laptops', 'Computadores portáteis e notebooks', 'laptops'),
('Acessórios', 'Acessórios diversos para eletrônicos', 'acessorios'),
('Gadgets', 'Gadgets e dispositivos inovadores', 'gadgets')
ON CONFLICT (slug) DO NOTHING;

-- Inserir subcategorias de exemplo
INSERT INTO physical_product_categories (name, description, slug, parent_id) 
SELECT 
    'Capas e Cases', 
    'Capas e cases para smartphones', 
    'capas-cases',
    id 
FROM physical_product_categories 
WHERE slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO physical_product_categories (name, description, slug, parent_id) 
SELECT 
    'Carregadores', 
    'Carregadores e cabos', 
    'carregadores',
    id 
FROM physical_product_categories 
WHERE slug = 'acessorios'
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO physical_products (name, description, slug, price, currency, images, category_id, is_featured) 
SELECT 
    'iPhone 15 Pro Max 256GB',
    'O mais avançado iPhone com câmera profissional, processador A17 Pro e design em titânio.',
    'iphone-15-pro-max-256gb',
    1199.00,
    'EUR',
    '["https://example.com/iphone15.jpg"]'::jsonb,
    id,
    true
FROM physical_product_categories 
WHERE slug = 'smartphones'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO physical_products (name, description, slug, price, currency, images, category_id, is_featured) 
SELECT 
    'MacBook Air M3 13"',
    'MacBook Air com chip M3, 8GB RAM, 256GB SSD. Ultra fino e potente.',
    'macbook-air-m3-13',
    1299.00,
    'EUR',
    '["https://example.com/macbook.jpg"]'::jsonb,
    id,
    true
FROM physical_product_categories 
WHERE slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO physical_products (name, description, slug, price, currency, images, category_id) 
SELECT 
    'AirPods Pro 2ª Geração',
    'Fones de ouvido sem fio com cancelamento ativo de ruído.',
    'airpods-pro-2gen',
    279.00,
    'EUR',
    '["https://example.com/airpods.jpg"]'::jsonb,
    id
FROM physical_product_categories 
WHERE slug = 'acessorios'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas corretamente
DO $$
BEGIN
    -- Verificar physical_product_categories
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'physical_product_categories') THEN
        RAISE NOTICE 'Tabela physical_product_categories criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela physical_product_categories não foi criada!';
    END IF;
    
    -- Verificar physical_products
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'physical_products') THEN
        RAISE NOTICE 'Tabela physical_products criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela physical_products não foi criada!';
    END IF;
    
    -- Mostrar estatísticas
    RAISE NOTICE 'Categorias criadas: %', (SELECT COUNT(*) FROM physical_product_categories);
    RAISE NOTICE 'Produtos criados: %', (SELECT COUNT(*) FROM physical_products);
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CONFIGURAÇÃO DE PRODUTOS FÍSICOS CONCLUÍDA!';
    RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- COMANDOS ÚTEIS PARA MANUTENÇÃO
-- =====================================================

-- Para verificar a estrutura hierárquica das categorias:
/*
SELECT 
    c1.name as categoria,
    c2.name as subcategoria,
    COUNT(p.id) as total_produtos
FROM physical_product_categories c1
LEFT JOIN physical_product_categories c2 ON c2.parent_id = c1.id
LEFT JOIN physical_products p ON (p.category_id = c1.id OR p.subcategory_id = c2.id)
WHERE c1.parent_id IS NULL
GROUP BY c1.id, c1.name, c2.id, c2.name
ORDER BY c1.name, c2.name;
*/

-- Para listar todos os produtos com suas categorias:
/*
SELECT 
    p.name as produto,
    p.price,
    p.currency,
    c1.name as categoria,
    c2.name as subcategoria,
    p.is_featured,
    p.is_active
FROM physical_products p
JOIN physical_product_categories c1 ON p.category_id = c1.id
LEFT JOIN physical_product_categories c2 ON p.subcategory_id = c2.id
ORDER BY p.created_at DESC;
*/

-- Para limpar dados de teste (use com cuidado!):
/*
-- DELETE FROM physical_products;
-- DELETE FROM physical_product_categories;
*/ 