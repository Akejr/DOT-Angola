-- Adicionar taxas de câmbio iniciais
INSERT INTO exchange_rates (currency, rate)
VALUES 
('EUR', 900.00),
('BRL', 200.00),
('USD', 800.00)
ON CONFLICT (currency) DO UPDATE SET 
  rate = EXCLUDED.rate,
  updated_at = now();

-- Adicionar configurações iniciais do sistema
INSERT INTO settings (
  site_name, 
  site_description, 
  contact_email, 
  contact_phone,
  whatsapp_number, 
  enable_notifications, 
  maintenance_mode, 
  default_currency
) VALUES (
  'Gift Card Haven', 
  'Compre gift cards internacionais com facilidade',
  'contato@giftcardhaven.com',
  '+244 923456789',
  '+244 931343433',
  true,
  false,
  'AOA'
)
ON CONFLICT DO NOTHING;

-- Adicionar algumas notificações de exemplo
INSERT INTO notifications (
  title, 
  message, 
  type, 
  is_active, 
  expires_at
) VALUES 
(
  'Bem-vindo ao Gift Card Haven', 
  'Agora você pode comprar gift cards internacionais em kwanzas!', 
  'info', 
  true, 
  (now() + interval '7 days')
),
(
  'Black Friday', 
  'Descontos especiais em todos os gift cards até domingo!', 
  'success', 
  true, 
  (now() + interval '3 days')
),
(
  'Manutenção Programada', 
  'O site estará indisponível para manutenção no domingo, das 02h às 04h', 
  'warning', 
  true, 
  (now() + interval '2 days')
)
ON CONFLICT DO NOTHING;

-- Adicionar políticas de segurança (Row Level Security)

-- Ativar RLS para todas as tabelas
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Permissão para ler gift cards (público)
CREATE POLICY "Gift Cards são públicos" 
ON gift_cards FOR SELECT USING (true);

-- Permissão para ler categorias (público)
CREATE POLICY "Categorias são públicas" 
ON categories FOR SELECT USING (true);

-- Permissão para ler taxas de câmbio (público)
CREATE POLICY "Taxas de câmbio são públicas" 
ON exchange_rates FOR SELECT USING (true);

-- Permissão para ler notificações ativas (público)
CREATE POLICY "Notificações ativas são públicas" 
ON notifications FOR SELECT 
USING (is_active = true AND (expires_at > now() OR expires_at IS NULL));

-- Permissão para ler configurações (público)
CREATE POLICY "Configurações são públicas" 
ON settings FOR SELECT USING (true);

-- Permissão para registrar sessões (público)
CREATE POLICY "Qualquer um pode registrar sessões" 
ON sessions FOR INSERT USING (true);

-- Permissão para atualizar sessões (requer matching user_id)
CREATE POLICY "Usuários podem atualizar próprias sessões" 
ON sessions FOR UPDATE 
USING (auth.uid() = user_id); 