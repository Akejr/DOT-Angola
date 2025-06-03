-- Migration para criar triggers automáticos de notificações
-- Execute este script no SQL Editor do Supabase

-- Função para criar notificação de novo pedido de importação
CREATE OR REPLACE FUNCTION notify_new_import_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação quando um novo pedido de importação for criado
  INSERT INTO notifications (title, message, type, is_active, expires_at)
  VALUES (
    CASE 
      WHEN NEW.urgency_level = 'urgent' THEN 'URGENTE - Novo Pedido de Importação'
      ELSE 'Novo Pedido de Importação'
    END,
    NEW.full_name || ' solicitou importação de: ' || NEW.product_name,
    CASE 
      WHEN NEW.urgency_level = 'urgent' THEN 'warning'
      ELSE 'info'
    END,
    true,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação de nova compra/pedido
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação quando um novo pedido for criado
  INSERT INTO notifications (title, message, type, is_active, expires_at)
  VALUES (
    'Nova Compra Efetuada',
    NEW.customer_name || ' efetuou uma compra no valor de ' || 
    to_char(NEW.total_amount_kz, 'FM999G999G999') || ' AOA (Pedido #' || NEW.order_number || ')',
    'success',
    true,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação quando status de pedido for atualizado para completed
CREATE OR REPLACE FUNCTION notify_order_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação quando um pedido for marcado como concluído
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    INSERT INTO notifications (title, message, type, is_active, expires_at)
    VALUES (
      'Pagamento Confirmado',
      'Pagamento de ' || to_char(NEW.total_amount_kz, 'FM999G999G999') || 
      ' AOA confirmado para ' || NEW.customer_name || ' (Pedido #' || NEW.order_number || ')',
      'success',
      true,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para novos pedidos de importação
DROP TRIGGER IF EXISTS trigger_notify_new_import_request ON import_requests;
CREATE TRIGGER trigger_notify_new_import_request
  AFTER INSERT ON import_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_import_request();

-- Criar trigger para novos pedidos/compras
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Criar trigger para atualizações de status de pedidos
DROP TRIGGER IF EXISTS trigger_notify_order_completed ON orders;
CREATE TRIGGER trigger_notify_order_completed
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_completed();

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
COMMENT ON FUNCTION notify_new_import_request() IS 'Cria notificação automática quando um novo pedido de importação é inserido';
COMMENT ON FUNCTION notify_new_order() IS 'Cria notificação automática quando um novo pedido/compra é inserido';
COMMENT ON FUNCTION notify_order_completed() IS 'Cria notificação automática quando um pedido é marcado como concluído';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Limpa notificações antigas e marca como inativas as notificações expiradas';

-- Inserir notificação de teste para verificar se está funcionando
INSERT INTO notifications (title, message, type, is_active, expires_at)
VALUES (
  'Sistema de Notificações Ativo',
  'O sistema de notificações automáticas foi configurado e está funcionando corretamente.',
  'success',
  true,
  (now() + interval '1 day')
);

-- Exibir confirmação
SELECT 'Triggers de notificação criados com sucesso!' as status; 