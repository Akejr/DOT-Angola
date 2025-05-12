-- Script para configurar o sistema de notificações no Supabase

-- Criar tabela de notificações
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

-- Índice para melhorar performance das consultas de notificações ativas
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications (is_active) WHERE is_active = true;

-- Índice para expiração
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications (expires_at) WHERE expires_at IS NOT NULL;

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o campo updated_at quando uma notificação for atualizada
DROP TRIGGER IF EXISTS update_notification_timestamp ON notifications;
CREATE TRIGGER update_notification_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamp();

-- Inserir algumas notificações de exemplo
INSERT INTO notifications (title, message, type, is_active, expires_at)
VALUES 
  ('Bem-vindo!', 'Obrigado por usar o nosso sistema de gift cards.', 'info', true, NULL),
  ('Promoção', 'Aproveite 10% de desconto em todos os gift cards até o final do mês.', 'success', true, (now() + interval '30 days')),
  ('Manutenção', 'O sistema estará em manutenção no próximo domingo das 2h às 4h.', 'warning', true, (now() + interval '7 days'));

-- Políticas de segurança - Garantir que qualquer pessoa possa ler notificações
DROP POLICY IF EXISTS "Qualquer pessoa pode ler notificações" ON notifications;
CREATE POLICY "Qualquer pessoa pode ler notificações" 
  ON notifications 
  FOR SELECT 
  USING (true);

-- Apenas usuários autenticados podem criar/modificar/excluir notificações
DROP POLICY IF EXISTS "Apenas autenticados podem modificar notificações" ON notifications;
CREATE POLICY "Apenas autenticados podem modificar notificações" 
  ON notifications 
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Habilitar RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Ativar o RLS para a tabela
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

-- Função RPC para obter notificações ativas
CREATE OR REPLACE FUNCTION get_active_notifications()
RETURNS SETOF notifications AS $$
  SELECT *
  FROM notifications
  WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC;
$$ LANGUAGE SQL; 