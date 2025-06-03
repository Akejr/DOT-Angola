-- Tabela para configurações PWA
CREATE TABLE IF NOT EXISTS pwa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pwa_settings_key ON pwa_settings(setting_key);

-- Habilitar RLS
ALTER TABLE pwa_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Allow all operations on pwa_settings" ON pwa_settings;
CREATE POLICY "Allow all operations on pwa_settings" 
ON pwa_settings FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pwa_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pwa_settings_timestamp ON pwa_settings;
CREATE TRIGGER update_pwa_settings_timestamp
BEFORE UPDATE ON pwa_settings
FOR EACH ROW
EXECUTE FUNCTION update_pwa_settings_timestamp();

-- Inserir configurações padrão
INSERT INTO pwa_settings (setting_key, setting_value, description) VALUES
('daily_notification_time', '20:20', 'Horário da notificação diária (HH:MM)')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
description = EXCLUDED.description;

-- Função para obter configuração PWA
CREATE OR REPLACE FUNCTION get_pwa_setting(key_name TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT setting_value INTO result
  FROM pwa_settings
  WHERE setting_key = key_name;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar configuração PWA
CREATE OR REPLACE FUNCTION update_pwa_setting(key_name TEXT, new_value TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO pwa_settings (setting_key, setting_value)
  VALUES (key_name, new_value)
  ON CONFLICT (setting_key) 
  DO UPDATE SET setting_value = new_value, updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Atualizar função de relatório diário com nova mensagem
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
    'dailyProfit', daily_profit,
    'message', 'Você teve o lucro líquido diário de ' || TO_CHAR(daily_profit, 'FM999G999G990') || ' AOA'
  );
END;
$$ LANGUAGE plpgsql;

SELECT 'PWA Settings table created successfully!' as status; 