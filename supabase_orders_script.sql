-- Script para criar as tabelas de pedidos (orders) e itens de pedidos (order_items) no Supabase
-- Execute este script no SQL Editor do Supabase

-- Remover as tabelas se elas existirem (cuidado em produção!)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Criar a tabela orders (pedidos principais)
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

-- Criar a tabela order_items (itens do pedido)
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

-- Criar índices para melhor performance
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_gift_card_id ON public.order_items(gift_card_id);
CREATE INDEX idx_order_items_plan_id ON public.order_items(plan_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para orders
CREATE POLICY "Allow public insert" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated select" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Criar políticas de segurança para order_items
CREATE POLICY "Allow public insert" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated select" ON public.order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.order_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.order_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.orders IS 'Tabela para armazenar pedidos de gift cards feitos pelos clientes';
COMMENT ON COLUMN public.orders.order_number IS 'Número único do pedido gerado automaticamente';
COMMENT ON COLUMN public.orders.customer_name IS 'Nome completo do cliente';
COMMENT ON COLUMN public.orders.customer_phone IS 'Número de telefone do cliente (WhatsApp)';
COMMENT ON COLUMN public.orders.customer_address IS 'Endereço/morada do cliente';
COMMENT ON COLUMN public.orders.customer_email IS 'Email do cliente';
COMMENT ON COLUMN public.orders.total_amount_kz IS 'Valor total do pedido em Kwanzas';
COMMENT ON COLUMN public.orders.status IS 'Status do pedido: pending (pendente) ou completed (concluído)';

COMMENT ON TABLE public.order_items IS 'Tabela para armazenar os itens individuais de cada pedido';
COMMENT ON COLUMN public.order_items.order_id IS 'ID do pedido ao qual este item pertence';
COMMENT ON COLUMN public.order_items.gift_card_id IS 'ID do gift card comprado';
COMMENT ON COLUMN public.order_items.plan_id IS 'ID do plano selecionado (opcional) - UUID para compatibilidade com gift_card_plans';
COMMENT ON COLUMN public.order_items.quantity IS 'Quantidade do item';
COMMENT ON COLUMN public.order_items.unit_price IS 'Preço unitário na moeda original';
COMMENT ON COLUMN public.order_items.currency IS 'Moeda do preço original (USD, EUR, etc.)';
COMMENT ON COLUMN public.order_items.unit_price_kz IS 'Preço unitário em Kwanzas';
COMMENT ON COLUMN public.order_items.total_price_kz IS 'Preço total do item (quantidade × preço unitário) em Kwanzas';

-- Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('orders', 'order_items')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verificar se as foreign keys foram criadas corretamente
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('orders', 'order_items')
    AND tc.table_schema = 'public'; 