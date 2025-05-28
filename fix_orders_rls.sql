-- Script para corrigir as políticas RLS das tabelas orders e order_items
-- Este script resolve o erro: "new row violates row-level security policy for table 'orders'"

-- Primeiro, vamos remover todas as políticas existentes para orders e order_items
DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.orders;

DROP POLICY IF EXISTS "Allow public insert" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.order_items;

-- Criar políticas corretas para orders (permitir inserções anônimas para compras)
CREATE POLICY "Permitir inserção pública de pedidos" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura autenticada de pedidos" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização autenticada de pedidos" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão autenticada de pedidos" ON public.orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Criar políticas corretas para order_items (permitir inserções anônimas para compras)
CREATE POLICY "Permitir inserção pública de itens" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir leitura autenticada de itens" ON public.order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização autenticada de itens" ON public.order_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão autenticada de itens" ON public.order_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
    AND schemaname = 'public'
ORDER BY tablename, policyname; 