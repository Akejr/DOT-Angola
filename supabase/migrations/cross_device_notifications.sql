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

-- Políticas de segurança
CREATE POLICY "Allow all operations on pending_notifications" 
ON pending_notifications FOR ALL 
USING (true) 
WITH CHECK (true);

-- Função para criar notificação de nova venda
CREATE OR REPLACE FUNCTION notify_new_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação pendente para todos os dispositivos
  INSERT INTO pending_notifications (type, title, body, data)
  VALUES (
    'new_sale',
    '💰 Nova Venda Registrada!',
    NEW.customer_name || ' - ' || 
    TO_CHAR(NEW.total, 'FM999G999G990') || ' AOA',
    json_build_object(
      'sale_id', NEW.id,
      'customer_name', NEW.customer_name,
      'total', NEW.total,
      'url', '/admin/sales'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabela sales para notificar novas vendas
DROP TRIGGER IF EXISTS trigger_notify_new_sale ON sales;
CREATE TRIGGER trigger_notify_new_sale
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_sale();

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

-- Função para simular uma venda (para teste)
CREATE OR REPLACE FUNCTION test_new_sale_notification()
RETURNS void AS $$
BEGIN
  INSERT INTO sales (
    customer_name, 
    customer_email, 
    customer_phone, 
    total, 
    gift_card_id, 
    quantity,
    profit
  ) VALUES (
    'João Silva (TESTE)',
    'joao.teste@email.com',
    '+244 999 123 456',
    15000.00,
    (SELECT id FROM gift_cards LIMIT 1),
    1,
    2500.00
  );
END;
$$ LANGUAGE plpgsql;

SELECT 'Cross-device notifications system created successfully!' as status; 