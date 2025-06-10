-- Migration para criar triggers automáticos de notificações
-- Execute este script no SQL Editor do Supabase

-- Função para criar notificação de novo pedido de importação SOMENTE quando admin cria
CREATE OR REPLACE FUNCTION notify_new_import_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Só inserir notificação se foi criado pelo sistema administrativo
  -- Verificamos se foi criado via interface do admin (campo interno ou outras validações)
  -- Por padrão, não criamos notificação automática para pedidos de clientes
  -- Se for necessário, pode ser ativado apenas para ações específicas do admin
  
  -- DESABILITADO: Não criar notificação automática para pedidos de clientes
  -- INSERT INTO notifications (title, message, type, is_active, expires_at)
  -- VALUES (
  --   CASE 
  --     WHEN NEW.urgency_level = 'urgent' THEN 'URGENTE - Novo Pedido de Importação'
  --     ELSE 'Novo Pedido de Importação'
  --   END,
  --   NEW.full_name || ' solicitou importação de: ' || NEW.product_name,
  --   CASE 
  --     WHEN NEW.urgency_level = 'urgent' THEN 'warning'
  --     ELSE 'info'
  --   END,
  --   true,
  --   NULL
  -- );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação de nova compra/pedido SOMENTE quando admin cria
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- DESABILITADO: Não criar notificação automática para compras de clientes
  -- Só deve ser usado quando o admin criar pedidos manualmente no sistema
  
  -- INSERT INTO notifications (title, message, type, is_active, expires_at)
  -- VALUES (
  --   'Nova Compra Efetuada',
  --   NEW.customer_name || ' efetuou uma compra no valor de ' || 
  --   to_char(NEW.total_amount_kz, 'FM999G999G999') || ' AOA (Pedido #' || NEW.order_number || ')',
  --   'success',
  --   true,
  --   NULL
  -- );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação quando status de pedido for atualizado para completed SOMENTE pelo admin
CREATE OR REPLACE FUNCTION notify_order_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- DESABILITADO: Só criar notificação se foi confirmado pelo admin manualmente
  -- Evita notificações quando sistema atualiza automaticamente
  
  -- IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
  --   INSERT INTO notifications (title, message, type, is_active, expires_at)
  --   VALUES (
  --     'Pagamento Confirmado',
  --     'Pagamento de ' || to_char(NEW.total_amount_kz, 'FM999G999G999') || 
  --     ' AOA confirmado para ' || NEW.customer_name || ' (Pedido #' || NEW.order_number || ')',
  --     'success',
  --     true,
  --     NULL
  --   );
  -- END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover todos os triggers existentes
DROP TRIGGER IF EXISTS trigger_notify_new_import_request ON import_requests;
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
DROP TRIGGER IF EXISTS trigger_notify_order_completed ON orders;

-- NÃO recriar os triggers automáticos - as notificações devem ser criadas apenas manualmente pelo admin

-- Função para limpar notificações antigas automaticamente (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Deletar notificações inativas com mais de 30 dias
  DELETE FROM notifications
  WHERE is_active = false 
    AND created_at < (now() - interval '30 days');
    
  -- Marcar como inativas notificações expiradas
  UPDATE notifications 
  SET is_active = false 
  WHERE expires_at IS NOT NULL 
    AND expires_at < now() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON FUNCTION notify_new_import_request() IS 'Função desabilitada - notificações devem ser criadas manualmente pelo admin';
COMMENT ON FUNCTION notify_new_order() IS 'Função desabilitada - notificações devem ser criadas manualmente pelo admin';
COMMENT ON FUNCTION notify_order_completed() IS 'Função desabilitada - notificações devem ser criadas manualmente pelo admin';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Limpa notificações antigas e marca como inativas as notificações expiradas';

-- Remover notificação de teste antiga se existir
DELETE FROM notifications WHERE title = 'Sistema de Notificações Ativo';

-- Exibir confirmação
SELECT 'Triggers de notificação DESABILITADOS com sucesso! Agora as notificações só aparecem quando o admin criar manualmente.' as status; 