-- Script para criar tabelas que faltam no Dashboard
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar e criar a estrutura correta da tabela sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  path TEXT,
  is_first_visit BOOLEAN DEFAULT false
);

-- Adicionar colunas que podem não existir
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN DEFAULT false;

-- 2. Criar tabela online_users para rastrear usuários ativos
CREATE TABLE IF NOT EXISTS online_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela page_views para rastrear visualizações de páginas
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  title TEXT,
  session_id TEXT,
  ip_address TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_online_users_session_id ON online_users(session_id);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen_at ON sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_ip_address ON sessions(ip_address);

-- 5. Função para limpar usuários inativos (mais de 10 minutos offline)
CREATE OR REPLACE FUNCTION cleanup_inactive_users()
RETURNS void AS $$
BEGIN
  DELETE FROM online_users 
  WHERE last_seen < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- 6. Políticas de segurança (RLS)
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Permitir inserção e leitura pública para analytics
CREATE POLICY "Allow public insert on online_users" 
ON online_users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on online_users" 
ON online_users FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on online_users" 
ON online_users FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on online_users" 
ON online_users FOR DELETE 
USING (true);

CREATE POLICY "Allow public insert on page_views" 
ON page_views FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on page_views" 
ON page_views FOR SELECT 
USING (true);

-- Permitir operações na tabela sessions
CREATE POLICY "Allow public insert on sessions" 
ON sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on sessions" 
ON sessions FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on sessions" 
ON sessions FOR UPDATE 
USING (true);

-- 7. Inserir dados iniciais de exemplo para teste
INSERT INTO page_views (path, title, session_id, created_at) VALUES
('/', 'Página Inicial', 'demo-session-1', NOW() - INTERVAL '1 hour'),
('/gift-cards', 'Gift Cards', 'demo-session-2', NOW() - INTERVAL '2 hours'),
('/sobre', 'Sobre Nós', 'demo-session-3', NOW() - INTERVAL '3 hours'),
('/contato', 'Contato', 'demo-session-4', NOW() - INTERVAL '4 hours'),
('/', 'Página Inicial', 'demo-session-5', NOW() - INTERVAL '5 hours'),
('/gift-cards', 'Gift Cards', 'demo-session-6', NOW() - INTERVAL '6 hours'),
('/importacao', 'Importação de Produtos', 'demo-session-7', NOW() - INTERVAL '1 day'),
('/', 'Página Inicial', 'demo-session-8', NOW() - INTERVAL '2 days'),
('/gift-cards', 'Gift Cards', 'demo-session-9', NOW() - INTERVAL '3 days'),
('/sobre', 'Sobre Nós', 'demo-session-10', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

-- Inserir sessões de exemplo (sem user_id já que não existe)
INSERT INTO sessions (id, ip_address, start_time, last_seen_at, path, is_first_visit) VALUES
(gen_random_uuid(), '192.168.1.1', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes', '/', true),
(gen_random_uuid(), '192.168.1.2', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '55 minutes', '/gift-cards', true),
(gen_random_uuid(), '192.168.1.3', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', '/sobre', true),
(gen_random_uuid(), '192.168.1.4', NOW() - INTERVAL '3 minutes', NOW() - INTERVAL '1 minute', '/contato', true),
(gen_random_uuid(), '192.168.1.5', NOW() - INTERVAL '4 minutes', NOW() - INTERVAL '2 minutes', '/', true),
(gen_random_uuid(), '192.168.1.6', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', '/importacao', true),
(gen_random_uuid(), '192.168.1.7', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1.5 days', '/', true),
(gen_random_uuid(), '192.168.1.8', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2.5 days', '/gift-cards', true)
ON CONFLICT DO NOTHING;

-- Inserir usuários online de exemplo (últimos 5 minutos)
INSERT INTO online_users (session_id, ip_address, last_seen, current_page) VALUES
('current-session-1', '192.168.1.10', NOW() - INTERVAL '2 minutes', '/'),
('current-session-2', '192.168.1.11', NOW() - INTERVAL '3 minutes', '/gift-cards'),
('current-session-3', '192.168.1.12', NOW() - INTERVAL '1 minute', '/sobre'),
('current-session-4', '192.168.1.13', NOW() - INTERVAL '4 minutes', '/contato')
ON CONFLICT (session_id) DO UPDATE SET
  last_seen = EXCLUDED.last_seen,
  current_page = EXCLUDED.current_page; 