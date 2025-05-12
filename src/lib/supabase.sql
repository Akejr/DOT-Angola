-- Tabela para gift cards (já deve existir)
-- Caso não exista, descomentar e executar:
/*
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
*/

-- Tabela para categorias (já deve existir)
-- Caso não exista, descomentar e executar:
/*
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
*/

-- Tabela para relação entre gift cards e categorias (já deve existir)
-- Caso não exista, descomentar e executar:
/*
CREATE TABLE gift_card_categories (
  gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (gift_card_id, category_id)
);
*/

-- Tabela para taxas de câmbio (já deve existir)
-- Caso não exista, descomentar e executar:
/*
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency TEXT NOT NULL UNIQUE,
  rate DECIMAL(10, 2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
*/

-- Tabela para sessões de usuários (já deve existir)
-- Caso não exista, descomentar e executar:
/*
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  ip_address TEXT
);
*/

-- Nova tabela para notificações do sistema
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nova tabela para configurações gerais do sistema
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'Gift Card Haven',
  site_description TEXT NOT NULL DEFAULT 'Compre gift cards internacionais com facilidade',
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT,
  enable_notifications BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  default_currency TEXT DEFAULT 'AOA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar o campo updated_at nas notificações
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamp();

-- Trigger para atualizar o campo updated_at nas configurações
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_timestamp
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_timestamp();

-- Primeiro, remover a função existente se houver
DROP FUNCTION IF EXISTS get_dashboard_stats();

-- Função para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $$
DECLARE
  today timestamp := date_trunc('day', now());
  week_start timestamp := date_trunc('week', now());
  month_start timestamp := date_trunc('month', now());
  year_start timestamp := date_trunc('year', now());
  
  total_gift_cards integer;
  total_sales integer := 0;
  sales_today integer := 0;
  sales_this_week integer := 0;
  sales_this_month integer := 0;
  sales_percent_change numeric := 0;
  
  users_today integer;
  users_this_week integer;
  users_this_month integer;
  users_this_year integer;
  total_users integer;
  user_percent_change numeric := 5.2; -- Valor de exemplo
  
  popular_categories json;
BEGIN
  -- Contar total de gift cards
  SELECT count(*) INTO total_gift_cards FROM gift_cards;
  
  -- Contar usuários
  SELECT count(DISTINCT user_id) INTO users_today 
  FROM sessions 
  WHERE start_time >= today AND user_id IS NOT NULL;
  
  SELECT count(DISTINCT user_id) INTO users_this_week 
  FROM sessions 
  WHERE start_time >= week_start AND user_id IS NOT NULL;
  
  SELECT count(DISTINCT user_id) INTO users_this_month 
  FROM sessions 
  WHERE start_time >= month_start AND user_id IS NOT NULL;
  
  SELECT count(DISTINCT user_id) INTO users_this_year 
  FROM sessions 
  WHERE start_time >= year_start AND user_id IS NOT NULL;
  
  SELECT count(DISTINCT user_id) INTO total_users 
  FROM sessions 
  WHERE user_id IS NOT NULL;
  
  -- Categorias populares (exemplo - deve ser ajustado para refletir dados reais)
  popular_categories := (
    SELECT json_agg(row_to_json(t)) 
    FROM (
      SELECT c.name, count(gc.gift_card_id) as count
      FROM categories c
      JOIN gift_card_categories gc ON c.id = gc.category_id
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    ) t
  );
  
  -- Retornar todas as estatísticas como JSON
  RETURN json_build_object(
    'total_gift_cards', total_gift_cards,
    'total_sales', total_sales,
    'sales_today', sales_today,
    'sales_this_week', sales_this_week,
    'sales_this_month', sales_this_month,
    'sales_percent_change', sales_percent_change,
    'popular_categories', COALESCE(popular_categories, '[]'::json),
    'users_today', users_today,
    'users_this_week', users_this_week,
    'users_this_month', users_this_month,
    'users_this_year', users_this_year,
    'total_users', total_users,
    'user_percent_change', user_percent_change
  );
END;
$$ LANGUAGE plpgsql; 