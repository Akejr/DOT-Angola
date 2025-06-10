-- Script para corrigir o bug das notificações automáticas
-- Execute este script no SQL Editor do Supabase

-- Remover todos os triggers que criam notificações automáticas
DROP TRIGGER IF EXISTS trigger_notify_new_import_request ON import_requests;
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;  
DROP TRIGGER IF EXISTS trigger_notify_order_completed ON orders;

-- Atualizar as funções para não criarem notificações automáticas
CREATE OR REPLACE FUNCTION notify_new_import_request()
RETURNS TRIGGER AS $$
BEGIN
  -- DESABILITADO: Não criar notificação automática para pedidos de clientes
  -- As notificações devem ser criadas apenas manualmente pelo admin
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- DESABILITADO: Não criar notificação automática para compras de clientes  
  -- As notificações devem ser criadas apenas manualmente pelo admin
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_order_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- DESABILITADO: Só criar notificação se foi confirmado pelo admin manualmente
  -- Evita notificações quando sistema atualiza automaticamente
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Limpar notificações de teste antigas
DELETE FROM notifications WHERE title = 'Sistema de Notificações Ativo';

-- Comentários atualizados
COMMENT ON FUNCTION notify_new_import_request() IS 'Função desabilitada - notificações devem ser criadas manualmente pelo admin';
COMMENT ON FUNCTION notify_new_order() IS 'Função desabilitada - notificações devem ser criadas manualmente pelo admin';  
COMMENT ON FUNCTION notify_order_completed() IS 'Função desabilitada - notificações devem ser criadas manualmente pelo admin';

-- Confirmar que foi executado
SELECT 'BUG CORRIGIDO: Triggers automáticos de notificação foram REMOVIDOS. Agora só aparecem notificações quando o admin criar manualmente.' as status; 