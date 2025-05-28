-- Script completo para corrigir o problema de RLS das tabelas de pedidos
-- Execute este script no SQL Editor do Supabase para resolver o erro de compras BAI Direto

-- Verificar se as tabelas existem
DO $$
BEGIN
    -- Verificar se a tabela orders existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        -- Criar a tabela orders se não existir
        CREATE TABLE public.orders (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_number VARCHAR(50) NOT NULL UNIQUE,
            customer_name VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(50) NOT NULL,
            customer_address TEXT NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            total_amount_kz DECIMAL(15,2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_orders_order_number ON public.orders(order_number);
        CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
        CREATE INDEX idx_orders_status ON public.orders(status);
        CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
        
        RAISE NOTICE 'Tabela orders criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela orders já existe';
    END IF;

    -- Verificar se a tabela order_items existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') THEN
        -- Criar a tabela order_items se não existir
        CREATE TABLE public.order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
            gift_card_id BIGINT NOT NULL REFERENCES public.gift_cards(id) ON DELETE CASCADE,
            plan_id UUID REFERENCES public.gift_card_plans(id) ON DELETE SET NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) NOT NULL,
            unit_price_kz DECIMAL(15,2) NOT NULL,
            total_price_kz DECIMAL(15,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
        CREATE INDEX idx_order_items_gift_card_id ON public.order_items(gift_card_id);
        CREATE INDEX idx_order_items_plan_id ON public.order_items(plan_id);
        
        RAISE NOTICE 'Tabela order_items criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela order_items já existe';
    END IF;
END $$;

-- Criar ou substituir função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente (se não existir)
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS nas tabelas
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.orders;

DROP POLICY IF EXISTS "Allow public insert" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.order_items;

-- Remover qualquer outra política que possa existir
DROP POLICY IF EXISTS "Permitir inserção pública de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Permitir leitura autenticada de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Permitir atualização autenticada de pedidos" ON public.orders;
DROP POLICY IF EXISTS "Permitir exclusão autenticada de pedidos" ON public.orders;

DROP POLICY IF EXISTS "Permitir inserção pública de itens" ON public.order_items;
DROP POLICY IF EXISTS "Permitir leitura autenticada de itens" ON public.order_items;
DROP POLICY IF EXISTS "Permitir atualização autenticada de itens" ON public.order_items;
DROP POLICY IF EXISTS "Permitir exclusão autenticada de itens" ON public.order_items;

-- Criar políticas corretas que FUNCIONAM para usuários anônimos
-- Para a tabela orders: permitir inserção para todos (incluindo anônimos)
CREATE POLICY "orders_public_insert" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Para leitura, atualização e exclusão: apenas usuários autenticados
CREATE POLICY "orders_auth_select" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_auth_update" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "orders_auth_delete" ON public.orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Para a tabela order_items: permitir inserção para todos (incluindo anônimos)
CREATE POLICY "order_items_public_insert" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Para leitura, atualização e exclusão: apenas usuários autenticados
CREATE POLICY "order_items_auth_select" ON public.order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "order_items_auth_update" ON public.order_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "order_items_auth_delete" ON public.order_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas corretamente
SELECT 
    'Políticas criadas:' as info,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Comentários para documentação
COMMENT ON TABLE public.orders IS 'Tabela para armazenar pedidos de gift cards - permite inserção anônima para compras BAI Direto';
COMMENT ON TABLE public.order_items IS 'Tabela para armazenar itens de pedidos - permite inserção anônima para compras BAI Direto';

-- Mensagem de sucesso
SELECT 'RLS corrigido com sucesso! As compras BAI Direto agora devem funcionar.' as resultado; 