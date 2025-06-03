-- Migração segura para garantir que checkout funcione
-- NÃO remove tabelas existentes

-- Apenas garantir que as políticas RLS estão corretas para orders
DO $main$
BEGIN
  -- Verificar se a tabela orders existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
    
    -- Garantir que RLS está habilitado
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas antigas conflitantes
    DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
    DROP POLICY IF EXISTS "Allow public insert" ON public.orders;
    DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;
    DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.orders;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.orders;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.orders;
    
    -- Criar política simples para permitir INSERT público
    CREATE POLICY "Enable insert for everyone" ON public.orders
      FOR INSERT WITH CHECK (true);
    
    -- Garantir que políticas admin existem
    CREATE POLICY "Enable select for authenticated users" ON public.orders
      FOR SELECT USING (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable update for authenticated users" ON public.orders
      FOR UPDATE USING (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable delete for authenticated users" ON public.orders
      FOR DELETE USING (auth.role() = 'authenticated');
    
  END IF;
END $main$;

-- Recriar função de notificação para nova estrutura
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $func$
BEGIN
  -- Verificar se tabela pending_notifications existe antes de inserir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_notifications' AND table_schema = 'public') THEN
    INSERT INTO pending_notifications (type, title, body, data)
    VALUES (
      'new_order',
      '💰 Nova Compra Registrada!',
      NEW.customer_name || ' - ' || 
      TO_CHAR(NEW.total_amount_kz, 'FM999G999G990') || ' AOA',
      json_build_object(
        'order_id', NEW.id,
        'customer_name', NEW.customer_name,
        'customer_email', NEW.customer_email,
        'total', NEW.total_amount_kz,
        'status', NEW.status,
        'url', '/admin/orders'
      )
    );
  END IF;
  
  RETURN NEW;
END $func$ LANGUAGE plpgsql;

-- Recriar trigger se não existir
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Atualizar função de estatísticas diárias
CREATE OR REPLACE FUNCTION get_daily_order_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $stats$
DECLARE
  daily_orders INTEGER;
  daily_revenue DECIMAL(12,2);
  daily_profit DECIMAL(12,2);
BEGIN
  -- Contar compras do dia
  SELECT 
    COUNT(*),
    COALESCE(SUM(total_amount_kz), 0),
    COALESCE(SUM(total_amount_kz * 0.15), 0) -- Assumindo 15% de lucro médio
  INTO daily_orders, daily_revenue, daily_profit
  FROM orders 
  WHERE DATE(created_at) = target_date
    AND status = 'completed';

  RETURN json_build_object(
    'date', target_date,
    'dailyOrders', daily_orders,
    'dailyRevenue', daily_revenue,
    'dailyProfit', daily_profit,
    'message', 'Você teve o lucro líquido diário de ' || TO_CHAR(daily_profit, 'FM999G999G990') || ' AOA'
  );
END $stats$ LANGUAGE plpgsql;

-- Função de teste atualizada
CREATE OR REPLACE FUNCTION test_new_order_notification()
RETURNS void AS $test$
BEGIN
  INSERT INTO orders (
    order_number,
    customer_name, 
    customer_email, 
    customer_phone, 
    customer_address,
    total_amount_kz, 
    status
  ) VALUES (
    'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'João Silva (TESTE)',
    'joao.teste@email.com',
    '+244 999 123 456',
    'Luanda, Angola',
    15000.00,
    'completed'
  );
END $test$ LANGUAGE plpgsql;

SELECT 'Safe orders fix applied successfully!' as status; 