-- Criar tabela para push subscriptions da PWA
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Habilitar RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Allow all operations on push_subscriptions" 
ON push_subscriptions FOR ALL 
USING (true) 
WITH CHECK (true);

-- Função para limpar subscriptions antigas
CREATE OR REPLACE FUNCTION cleanup_old_push_subscriptions()
RETURNS void AS $$
BEGIN
  -- Deletar subscriptions com mais de 6 meses
  DELETE FROM push_subscriptions 
  WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscription_timestamp
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_timestamp();

-- Função para obter estatísticas diárias de vendas (para notificação às 20:00)
CREATE OR REPLACE FUNCTION get_daily_sales_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
  daily_sales INTEGER;
  daily_profit DECIMAL(12,2);
  daily_revenue DECIMAL(12,2);
BEGIN
  -- Contar vendas do dia
  SELECT 
    COUNT(*),
    COALESCE(SUM(profit), 0),
    COALESCE(SUM(total), 0)
  INTO daily_sales, daily_profit, daily_revenue
  FROM sales 
  WHERE DATE(created_at) = target_date;

  RETURN json_build_object(
    'date', target_date,
    'dailySales', daily_sales,
    'dailyProfit', daily_profit,
    'dailyRevenue', daily_revenue
  );
END;
$$ LANGUAGE plpgsql;

-- Inserir dados de exemplo para teste
INSERT INTO push_subscriptions (endpoint, keys, user_agent) VALUES
('https://fcm.googleapis.com/fcm/send/test-endpoint-1', '{"p256dh": "test-key-1", "auth": "test-auth-1"}', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)')
ON CONFLICT (endpoint) DO NOTHING;

SELECT 'PWA Push Subscriptions table created successfully!' as status; 