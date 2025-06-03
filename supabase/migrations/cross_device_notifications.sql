-- Sistema de notificações cross-device para PWA
-- Tabela para armazenar notificações pendentes que serão enviadas para todos os dispositivos

CREATE TABLE IF NOT EXISTS pending_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_notifications_status ON pending_notifications(status);
CREATE INDEX IF NOT EXISTS idx_pending_notifications_created_at ON pending_notifications(created_at);

-- Habilitar RLS
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;

-- Remover política existente e recriar
DROP POLICY IF EXISTS "Allow all operations on pending_notifications" ON pending_notifications;
CREATE POLICY "Allow all operations on pending_notifications" 
ON pending_notifications FOR ALL 
USING (true) 
WITH CHECK (true);

-- Função para criar notificação de nova compra (orders)
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação pendente para todos os dispositivos
  INSERT INTO pending_notifications (type, title, body, data)
  VALUES (
    'new_order',
    '💰 Nova Compra Registrada!',
    NEW.customer_name || ' - ' || 
    TO_CHAR(NEW.total, 'FM999G999G990') || ' AOA',
    json_build_object(
      'order_id', NEW.id,
      'customer_name', NEW.customer_name,
      'customer_email', NEW.customer_email,
      'total', NEW.total,
      'status', NEW.status,
      'url', '/admin/orders'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabela orders para notificar novas compras
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Remover trigger antigo da tabela sales (se existir)
DROP TRIGGER IF EXISTS trigger_notify_new_sale ON sales;
DROP FUNCTION IF EXISTS notify_new_sale();

-- Função para marcar notificação como enviada
CREATE OR REPLACE FUNCTION mark_notification_sent(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE pending_notifications 
  SET 
    status = 'sent',
    sent_at = NOW()
  WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar notificações antigas (mais de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_notifications 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Função para obter notificações pendentes
CREATE OR REPLACE FUNCTION get_pending_notifications()
RETURNS TABLE(
  id UUID,
  type VARCHAR(50),
  title TEXT,
  body TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pn.id,
    pn.type,
    pn.title,
    pn.body,
    pn.data,
    pn.created_at
  FROM pending_notifications pn
  WHERE pn.status = 'pending'
  ORDER BY pn.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Função para simular uma compra (para teste)
CREATE OR REPLACE FUNCTION test_new_order_notification()
RETURNS void AS $$
BEGIN
  INSERT INTO orders (
    customer_name, 
    customer_email, 
    customer_phone, 
    total, 
    status,
    items
  ) VALUES (
    'João Silva (TESTE)',
    'joao.teste@email.com',
    '+244 999 123 456',
    15000.00,
    'completed',
    '[{"name": "Gift Card Steam", "quantity": 1, "price": 15000}]'::jsonb
  );
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas diárias de compras (para relatório às 20:20)
CREATE OR REPLACE FUNCTION get_daily_order_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  daily_orders INTEGER;
  daily_revenue DECIMAL(12,2);
  daily_profit DECIMAL(12,2);
BEGIN
  -- Contar compras do dia
  SELECT 
    COUNT(*),
    COALESCE(SUM(total), 0),
    COALESCE(SUM(total * 0.15), 0) -- Assumindo 15% de lucro médio
  INTO daily_orders, daily_revenue, daily_profit
  FROM orders 
  WHERE DATE(created_at) = target_date
    AND status = 'completed';

  RETURN json_build_object(
    'date', target_date,
    'dailyOrders', daily_orders,
    'dailyRevenue', daily_revenue,
    'dailyProfit', daily_profit
  );
END;
$$ LANGUAGE plpgsql;

-- Remover função antiga de sales (se existir)
DROP FUNCTION IF EXISTS test_new_sale_notification();
DROP FUNCTION IF EXISTS get_daily_sales_stats(DATE);

SELECT 'Cross-device notifications system updated for ORDERS table - conflicts resolved!' as status; 