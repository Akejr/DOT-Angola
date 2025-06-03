-- Script SQL Completo para Dashboard - Execute no Supabase SQL Editor
-- Este script configura todas as tabelas necessárias para o dashboard funcionar

-- 1. CRIAR/MELHORAR TABELA SESSIONS
-- Primeiro, vamos garantir que a tabela tenha a estrutura correta
DO $$
BEGIN
    -- Verificar se a coluna ip_address existe, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'ip_address') THEN
        ALTER TABLE sessions ADD COLUMN ip_address TEXT DEFAULT '127.0.0.1';
    END IF;
    
    -- Verificar se a coluna user_agent existe, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE sessions ADD COLUMN user_agent TEXT;
    END IF;
    
    -- Verificar se a coluna last_seen_at existe, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'last_seen_at') THEN
        ALTER TABLE sessions ADD COLUMN last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Verificar se a coluna start_time existe, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'start_time') THEN
        ALTER TABLE sessions ADD COLUMN start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Verificar se a coluna end_time existe, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'end_time') THEN
        ALTER TABLE sessions ADD COLUMN end_time TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Verificar se a coluna session_token existe, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sessions' AND column_name = 'session_token') THEN
        ALTER TABLE sessions ADD COLUMN session_token TEXT;
    END IF;
END $$;

-- 2. CRIAR TABELA ONLINE_USERS para rastrear usuários ativos
CREATE TABLE IF NOT EXISTS online_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT DEFAULT '127.0.0.1',
  user_agent TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA PAGE_VIEWS para rastrear visualizações
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  title TEXT,
  session_id TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ATUALIZAR DADOS EXISTENTES NA TABELA SESSIONS
-- Preencher campos que podem estar vazios
DO $$
BEGIN
    -- Só executar se as colunas existirem
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'ip_address') THEN
        UPDATE sessions 
        SET 
          ip_address = COALESCE(ip_address, '127.0.0.1')
        WHERE ip_address IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'last_seen_at') THEN
        UPDATE sessions 
        SET 
          last_seen_at = COALESCE(last_seen_at, created_at)
        WHERE last_seen_at IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'start_time') THEN
        UPDATE sessions 
        SET 
          start_time = COALESCE(start_time, created_at)
        WHERE start_time IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'session_token') THEN
        UPDATE sessions 
        SET 
          session_token = COALESCE(session_token, gen_random_uuid()::text)
        WHERE session_token IS NULL;
    END IF;
END $$;

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_path ON sessions(path);
CREATE INDEX IF NOT EXISTS idx_sessions_is_first_visit ON sessions(is_first_visit);

-- Índices condicionais (só criar se as colunas existem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'last_seen_at') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_last_seen_at ON sessions(last_seen_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'ip_address') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_online_users_session_id ON online_users(session_id);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_online_users_ip_address ON online_users(ip_address);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- 6. FUNÇÃO PARA LIMPAR DADOS ANTIGOS
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Limpar usuários inativos (mais de 10 minutos)
  DELETE FROM online_users WHERE last_seen < NOW() - INTERVAL '10 minutes';
  
  -- Limpar page_views muito antigos (mais de 1 ano)
  DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Limpar sessões muito antigas (mais de 1 ano)
  DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- 7. CONFIGURAR POLÍTICAS DE SEGURANÇA (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Políticas para sessions
DROP POLICY IF EXISTS "Allow public access to sessions" ON sessions;
CREATE POLICY "Allow public access to sessions" 
ON sessions FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas para online_users
DROP POLICY IF EXISTS "Allow public access to online_users" ON online_users;
CREATE POLICY "Allow public access to online_users" 
ON online_users FOR ALL 
USING (true) 
WITH CHECK (true);

-- Políticas para page_views
DROP POLICY IF EXISTS "Allow public access to page_views" ON page_views;
CREATE POLICY "Allow public access to page_views" 
ON page_views FOR ALL 
USING (true) 
WITH CHECK (true);

-- 8. INSERIR DADOS DE EXEMPLO PARA TESTE

-- Usuários online (últimos 5 minutos)
INSERT INTO online_users (session_id, ip_address, last_seen, current_page) VALUES
('online-user-1', '192.168.1.200', NOW() - INTERVAL '1 minute', '/'),
('online-user-2', '192.168.1.201', NOW() - INTERVAL '2 minutes', '/gift-cards'),
('online-user-3', '192.168.1.202', NOW() - INTERVAL '3 minutes', '/sobre'),
('online-user-4', '192.168.1.203', NOW() - INTERVAL '4 minutes', '/contato')
ON CONFLICT (session_id) DO UPDATE SET
  last_seen = EXCLUDED.last_seen,
  current_page = EXCLUDED.current_page;

-- Visualizações de páginas (vários períodos)
INSERT INTO page_views (path, title, session_id, ip_address, created_at) VALUES
-- Hoje
('/', 'Página Inicial', 'view-session-1', '192.168.1.100', NOW() - INTERVAL '1 hour'),
('/gift-cards', 'Gift Cards', 'view-session-2', '192.168.1.101', NOW() - INTERVAL '2 hours'),
('/sobre', 'Sobre Nós', 'view-session-3', '192.168.1.102', NOW() - INTERVAL '3 hours'),
('/contato', 'Contato', 'view-session-4', '192.168.1.103', NOW() - INTERVAL '4 hours'),
('/', 'Página Inicial', 'view-session-5', '192.168.1.104', NOW() - INTERVAL '5 hours'),
('/gift-cards', 'Gift Cards', 'view-session-6', '192.168.1.105', NOW() - INTERVAL '6 hours'),

-- Esta semana
('/', 'Página Inicial', 'view-session-7', '192.168.1.106', NOW() - INTERVAL '1 day'),
('/gift-cards', 'Gift Cards', 'view-session-8', '192.168.1.107', NOW() - INTERVAL '2 days'),
('/importacao', 'Importação de Produtos', 'view-session-9', '192.168.1.108', NOW() - INTERVAL '3 days'),
('/sobre', 'Sobre Nós', 'view-session-10', '192.168.1.109', NOW() - INTERVAL '4 days'),
('/', 'Página Inicial', 'view-session-11', '192.168.1.110', NOW() - INTERVAL '5 days'),
('/contato', 'Contato', 'view-session-12', '192.168.1.111', NOW() - INTERVAL '6 days'),

-- Este mês
('/gift-cards', 'Gift Cards', 'view-session-13', '192.168.1.112', NOW() - INTERVAL '1 week'),
('/', 'Página Inicial', 'view-session-14', '192.168.1.113', NOW() - INTERVAL '2 weeks'),
('/sobre', 'Sobre Nós', 'view-session-15', '192.168.1.114', NOW() - INTERVAL '3 weeks'),
('/gift-cards', 'Gift Cards', 'view-session-16', '192.168.1.115', NOW() - INTERVAL '25 days'),

-- Este ano
('/importacao', 'Importação de Produtos', 'view-session-17', '192.168.1.116', NOW() - INTERVAL '2 months'),
('/', 'Página Inicial', 'view-session-18', '192.168.1.117', NOW() - INTERVAL '3 months'),
('/gift-cards', 'Gift Cards', 'view-session-19', '192.168.1.118', NOW() - INTERVAL '4 months'),
('/sobre', 'Sobre Nós', 'view-session-20', '192.168.1.119', NOW() - INTERVAL '5 months')
ON CONFLICT DO NOTHING;

-- 9. INSERIR SESSÕES DE EXEMPLO (só se as colunas existem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'ip_address') AND
       EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sessions' AND column_name = 'start_time') THEN
        
        INSERT INTO sessions (created_at, start_time, last_seen_at, ip_address, path, is_first_visit) VALUES
        (NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '1 minute', '192.168.1.100', '/', true),
        (NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '3 minutes', '192.168.1.101', '/gift-cards', true),
        (NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '8 minutes', '192.168.1.102', '/sobre', true),
        (NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '55 minutes', '192.168.1.103', '/', true),
        (NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', '192.168.1.104', '/contato', true),
        (NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', '192.168.1.105', '/gift-cards', true),
        (NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.8 days', '192.168.1.106', '/', true),
        (NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2.9 days', '192.168.1.107', '/importacao', true),
        (NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week', NOW() - INTERVAL '6.8 days', '192.168.1.108', '/sobre', true),
        (NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '13.5 days', '192.168.1.109', '/gift-cards', true)
        ON CONFLICT DO NOTHING;
    ELSE
        -- Inserir só com colunas básicas se ip_address não existe
        INSERT INTO sessions (created_at, path, is_first_visit) VALUES
        (NOW() - INTERVAL '2 minutes', '/', true),
        (NOW() - INTERVAL '5 minutes', '/gift-cards', true),
        (NOW() - INTERVAL '10 minutes', '/sobre', true),
        (NOW() - INTERVAL '1 hour', '/', true),
        (NOW() - INTERVAL '2 hours', '/contato', true),
        (NOW() - INTERVAL '1 day', '/gift-cards', true),
        (NOW() - INTERVAL '2 days', '/', true),
        (NOW() - INTERVAL '3 days', '/importacao', true),
        (NOW() - INTERVAL '1 week', '/sobre', true),
        (NOW() - INTERVAL '2 weeks', '/gift-cards', true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 10. FUNÇÃO PARA ESTATÍSTICAS DO DASHBOARD (versão robusta)
CREATE OR REPLACE FUNCTION get_dashboard_analytics(period_filter text DEFAULT 'day')
RETURNS json AS $$
DECLARE
  start_date timestamp;
  online_count integer;
  unique_sessions_count integer;
  top_pages json;
  has_ip_address boolean;
BEGIN
  -- Verificar se a coluna ip_address existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sessions' AND column_name = 'ip_address'
  ) INTO has_ip_address;

  -- Definir data de início baseada no período
  CASE period_filter
    WHEN 'day' THEN start_date := date_trunc('day', now());
    WHEN 'week' THEN start_date := date_trunc('week', now());
    WHEN 'month' THEN start_date := date_trunc('month', now());
    WHEN 'year' THEN start_date := date_trunc('year', now());
    ELSE start_date := date_trunc('day', now());
  END CASE;

  -- Contar usuários online (últimos 5 minutos)
  SELECT count(*) INTO online_count
  FROM online_users 
  WHERE last_seen >= now() - interval '5 minutes';

  -- Contar sessões únicas no período
  IF has_ip_address THEN
    SELECT count(DISTINCT ip_address) INTO unique_sessions_count
    FROM sessions 
    WHERE created_at >= start_date;
  ELSE
    SELECT count(DISTINCT id) INTO unique_sessions_count
    FROM sessions 
    WHERE created_at >= start_date;
  END IF;

  -- Top páginas no período
  SELECT json_agg(row_to_json(t)) INTO top_pages
  FROM (
    SELECT path, title, count(*) as views
    FROM page_views 
    WHERE created_at >= start_date
    GROUP BY path, title
    ORDER BY views DESC
    LIMIT 4
  ) t;

  RETURN json_build_object(
    'online_users', online_count,
    'unique_sessions', unique_sessions_count,
    'top_pages', COALESCE(top_pages, '[]'::json),
    'period', period_filter,
    'start_date', start_date,
    'has_ip_address', has_ip_address
  );
END;
$$ LANGUAGE plpgsql;

-- 11. VERIFICAÇÃO FINAL
SELECT 'Script executado com sucesso!' as status;

-- Mostrar estrutura das tabelas
SELECT 'Sessions columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar contagem de dados
SELECT 'Data counts:' as info;
SELECT 
  (SELECT count(*) FROM sessions) as total_sessions,
  (SELECT count(*) FROM online_users) as online_users,
  (SELECT count(*) FROM page_views) as page_views;

-- Teste da função de analytics
SELECT 'Dashboard analytics test:' as info;
SELECT get_dashboard_analytics('day') as day_analytics; 