-- SCRIPT FINAL PARA DASHBOARD - SOLUÇÃO DEFINITIVA
-- Execute este script no SQL Editor do Supabase

-- 1. CRIAR TABELAS NECESSÁRIAS (sem depender da tabela sessions existente)

-- Tabela para usuários online
DROP TABLE IF EXISTS online_users;
CREATE TABLE online_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT DEFAULT '127.0.0.1',
  user_agent TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para visualizações de páginas
DROP TABLE IF EXISTS page_views;
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  title TEXT,
  session_id TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões melhorada (nova tabela independente)
DROP TABLE IF EXISTS dashboard_sessions;
CREATE TABLE dashboard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT DEFAULT '127.0.0.1',
  user_agent TEXT,
  path TEXT,
  title TEXT,
  is_first_visit BOOLEAN DEFAULT true,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_online_users_last_seen ON online_users(last_seen DESC);
CREATE INDEX idx_online_users_session_id ON online_users(session_id);

CREATE INDEX idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON page_views(path);

CREATE INDEX idx_dashboard_sessions_created_at ON dashboard_sessions(created_at DESC);
CREATE INDEX idx_dashboard_sessions_ip_address ON dashboard_sessions(ip_address);
CREATE INDEX idx_dashboard_sessions_path ON dashboard_sessions(path);

-- 3. CONFIGURAR POLÍTICAS DE SEGURANÇA
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on online_users" ON online_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on page_views" ON page_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on dashboard_sessions" ON dashboard_sessions FOR ALL USING (true) WITH CHECK (true);

-- 4. INSERIR DADOS DE EXEMPLO COMPLETOS

-- Usuários online (últimos 5 minutos)
INSERT INTO online_users (session_id, ip_address, last_seen, current_page) VALUES
('user-online-1', '192.168.1.100', NOW() - INTERVAL '1 minute', '/'),
('user-online-2', '192.168.1.101', NOW() - INTERVAL '2 minutes', '/gift-cards'),
('user-online-3', '192.168.1.102', NOW() - INTERVAL '3 minutes', '/sobre'),
('user-online-4', '192.168.1.103', NOW() - INTERVAL '4 minutes', '/contato'),
('user-online-5', '192.168.1.104', NOW() - INTERVAL '30 seconds', '/'),
('user-online-6', '192.168.1.105', NOW() - INTERVAL '90 seconds', '/gift-cards')
ON CONFLICT (session_id) DO UPDATE SET
  last_seen = EXCLUDED.last_seen,
  current_page = EXCLUDED.current_page;

-- Sessões para diferentes períodos
INSERT INTO dashboard_sessions (session_id, ip_address, path, title, is_first_visit, start_time, last_seen_at, created_at) VALUES
-- Hoje
('session-today-1', '192.168.1.200', '/', 'Página Inicial', true, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '30 minutes'),
('session-today-2', '192.168.1.201', '/gift-cards', 'Gift Cards', true, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '1 hour'),
('session-today-3', '192.168.1.202', '/sobre', 'Sobre Nós', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', NOW() - INTERVAL '2 hours'),
('session-today-4', '192.168.1.203', '/contato', 'Contato', true, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '3 hours'),
('session-today-5', '192.168.1.204', '/', 'Página Inicial', true, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3.5 hours', NOW() - INTERVAL '4 hours'),
('session-today-6', '192.168.1.205', '/gift-cards', 'Gift Cards', true, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4.5 hours', NOW() - INTERVAL '5 hours'),
('session-today-7', '192.168.1.206', '/importacao', 'Importação', true, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5.5 hours', NOW() - INTERVAL '6 hours'),

-- Esta semana
('session-week-1', '192.168.1.210', '/', 'Página Inicial', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '1 day'),
('session-week-2', '192.168.1.211', '/gift-cards', 'Gift Cards', true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.5 days', NOW() - INTERVAL '2 days'),
('session-week-3', '192.168.1.212', '/sobre', 'Sobre Nós', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2.5 days', NOW() - INTERVAL '3 days'),
('session-week-4', '192.168.1.213', '/contato', 'Contato', true, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3.5 days', NOW() - INTERVAL '4 days'),
('session-week-5', '192.168.1.214', '/', 'Página Inicial', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4.5 days', NOW() - INTERVAL '5 days'),
('session-week-6', '192.168.1.215', '/gift-cards', 'Gift Cards', true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5.5 days', NOW() - INTERVAL '6 days'),

-- Este mês
('session-month-1', '192.168.1.220', '/gift-cards', 'Gift Cards', true, NOW() - INTERVAL '1 week', NOW() - INTERVAL '6.5 days', NOW() - INTERVAL '1 week'),
('session-month-2', '192.168.1.221', '/', 'Página Inicial', true, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '13 days', NOW() - INTERVAL '2 weeks'),
('session-month-3', '192.168.1.222', '/sobre', 'Sobre Nós', true, NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 weeks'),
('session-month-4', '192.168.1.223', '/contato', 'Contato', true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days', NOW() - INTERVAL '25 days'),
('session-month-5', '192.168.1.224', '/importacao', 'Importação', true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days', NOW() - INTERVAL '28 days'),

-- Este ano
('session-year-1', '192.168.1.230', '/', 'Página Inicial', true, NOW() - INTERVAL '2 months', NOW() - INTERVAL '58 days', NOW() - INTERVAL '2 months'),
('session-year-2', '192.168.1.231', '/gift-cards', 'Gift Cards', true, NOW() - INTERVAL '3 months', NOW() - INTERVAL '88 days', NOW() - INTERVAL '3 months'),
('session-year-3', '192.168.1.232', '/sobre', 'Sobre Nós', true, NOW() - INTERVAL '4 months', NOW() - INTERVAL '118 days', NOW() - INTERVAL '4 months'),
('session-year-4', '192.168.1.233', '/contato', 'Contato', true, NOW() - INTERVAL '5 months', NOW() - INTERVAL '148 days', NOW() - INTERVAL '5 months'),
('session-year-5', '192.168.1.234', '/importacao', 'Importação', true, NOW() - INTERVAL '6 months', NOW() - INTERVAL '178 days', NOW() - INTERVAL '6 months')
ON CONFLICT (session_id) DO NOTHING;

-- Visualizações de páginas (distribuídas por período)
INSERT INTO page_views (path, title, session_id, ip_address, created_at) VALUES
-- Hoje
('/', 'Página Inicial', 'view-today-1', '192.168.1.100', NOW() - INTERVAL '1 hour'),
('/gift-cards', 'Gift Cards', 'view-today-2', '192.168.1.101', NOW() - INTERVAL '2 hours'),
('/sobre', 'Sobre Nós', 'view-today-3', '192.168.1.102', NOW() - INTERVAL '3 hours'),
('/contato', 'Contato', 'view-today-4', '192.168.1.103', NOW() - INTERVAL '4 hours'),
('/', 'Página Inicial', 'view-today-5', '192.168.1.104', NOW() - INTERVAL '5 hours'),
('/gift-cards', 'Gift Cards', 'view-today-6', '192.168.1.105', NOW() - INTERVAL '6 hours'),
('/', 'Página Inicial', 'view-today-7', '192.168.1.106', NOW() - INTERVAL '30 minutes'),
('/gift-cards', 'Gift Cards', 'view-today-8', '192.168.1.107', NOW() - INTERVAL '45 minutes'),

-- Esta semana
('/', 'Página Inicial', 'view-week-1', '192.168.1.110', NOW() - INTERVAL '1 day'),
('/gift-cards', 'Gift Cards', 'view-week-2', '192.168.1.111', NOW() - INTERVAL '2 days'),
('/importacao', 'Importação', 'view-week-3', '192.168.1.112', NOW() - INTERVAL '3 days'),
('/sobre', 'Sobre Nós', 'view-week-4', '192.168.1.113', NOW() - INTERVAL '4 days'),
('/', 'Página Inicial', 'view-week-5', '192.168.1.114', NOW() - INTERVAL '5 days'),
('/contato', 'Contato', 'view-week-6', '192.168.1.115', NOW() - INTERVAL '6 days'),
('/gift-cards', 'Gift Cards', 'view-week-7', '192.168.1.116', NOW() - INTERVAL '12 hours'),
('/', 'Página Inicial', 'view-week-8', '192.168.1.117', NOW() - INTERVAL '18 hours'),
('/gift-cards', 'Gift Cards', 'view-week-9', '192.168.1.118', NOW() - INTERVAL '36 hours'),

-- Este mês  
('/gift-cards', 'Gift Cards', 'view-month-1', '192.168.1.120', NOW() - INTERVAL '1 week'),
('/', 'Página Inicial', 'view-month-2', '192.168.1.121', NOW() - INTERVAL '2 weeks'),
('/sobre', 'Sobre Nós', 'view-month-3', '192.168.1.122', NOW() - INTERVAL '3 weeks'),
('/contato', 'Contato', 'view-month-4', '192.168.1.123', NOW() - INTERVAL '25 days'),
('/importacao', 'Importação', 'view-month-5', '192.168.1.124', NOW() - INTERVAL '28 days'),
('/gift-cards', 'Gift Cards', 'view-month-6', '192.168.1.125', NOW() - INTERVAL '10 days'),
('/', 'Página Inicial', 'view-month-7', '192.168.1.126', NOW() - INTERVAL '15 days'),

-- Este ano
('/importacao', 'Importação', 'view-year-1', '192.168.1.130', NOW() - INTERVAL '2 months'),
('/', 'Página Inicial', 'view-year-2', '192.168.1.131', NOW() - INTERVAL '3 months'),
('/gift-cards', 'Gift Cards', 'view-year-3', '192.168.1.132', NOW() - INTERVAL '4 months'),
('/sobre', 'Sobre Nós', 'view-year-4', '192.168.1.133', NOW() - INTERVAL '5 months'),
('/contato', 'Contato', 'view-year-5', '192.168.1.134', NOW() - INTERVAL '6 months')
ON CONFLICT DO NOTHING;

-- 5. FUNÇÃO PARA ESTATÍSTICAS COMPLETAS DO DASHBOARD
CREATE OR REPLACE FUNCTION get_complete_dashboard_stats(period_filter text DEFAULT 'day')
RETURNS json AS $$
DECLARE
  start_date timestamp;
  online_count integer;
  unique_sessions_count integer;
  top_pages json;
BEGIN
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

  -- Contar sessões únicas no período (por IP)
  SELECT count(DISTINCT ip_address) INTO unique_sessions_count
  FROM dashboard_sessions 
  WHERE created_at >= start_date;

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
    'start_date', start_date
  );
END;
$$ LANGUAGE plpgsql;

-- 6. FUNÇÃO PARA LIMPEZA AUTOMÁTICA
CREATE OR REPLACE FUNCTION cleanup_dashboard_data()
RETURNS void AS $$
BEGIN
  -- Limpar usuários inativos (mais de 10 minutos)
  DELETE FROM online_users WHERE last_seen < NOW() - INTERVAL '10 minutes';
  
  -- Limpar dados muito antigos (mais de 2 anos)
  DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '2 years';
  DELETE FROM dashboard_sessions WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- 7. VERIFICAÇÃO FINAL E TESTE
SELECT 'SCRIPT EXECUTADO COM SUCESSO!' as status;

-- Mostrar contagens
SELECT 
  'DADOS INSERIDOS:' as info,
  (SELECT count(*) FROM online_users) as usuarios_online,
  (SELECT count(*) FROM dashboard_sessions) as sessoes_dashboard,
  (SELECT count(*) FROM page_views) as visualizacoes_pagina;

-- Teste da função
SELECT 'TESTE DA FUNÇÃO:' as info;
SELECT get_complete_dashboard_stats('day') as analytics_hoje;
SELECT get_complete_dashboard_stats('week') as analytics_semana;
SELECT get_complete_dashboard_stats('month') as analytics_mes; 