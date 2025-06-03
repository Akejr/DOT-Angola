import { supabase } from './supabase';

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_active?: boolean;
  expires_at?: string | null;
}

// Função para criar uma notificação
export async function createNotification(payload: NotificationPayload) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title: payload.title,
        message: payload.message,
        type: payload.type,
        is_active: payload.is_active ?? true,
        expires_at: payload.expires_at || null
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

// Função para notificar sobre novo pedido de importação
export async function notifyNewImportRequest(requestData: {
  product_name: string;
  full_name: string;
  urgency_level: 'urgent' | 'not-urgent';
}) {
  const urgencyText = requestData.urgency_level === 'urgent' ? 'URGENTE' : '';
  const title = `${urgencyText} Novo Pedido de Importação`;
  const message = `${requestData.full_name} solicitou importação de: ${requestData.product_name}`;

  return await createNotification({
    title,
    message,
    type: requestData.urgency_level === 'urgent' ? 'warning' : 'info',
    expires_at: null // Notificação permanente até ser removida manualmente
  });
}

// Função para notificar sobre nova compra efetuada
export async function notifyNewPurchase(orderData: {
  order_number: string;
  customer_name: string;
  total_amount_kz: number;
  items: Array<{ name: string; quantity: number }>;
}) {
  const title = 'Nova Compra Efetuada';
  const itemsList = orderData.items
    .map(item => `${item.quantity}x ${item.name}`)
    .join(', ');
  
  const total = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(orderData.total_amount_kz);

  const message = `${orderData.customer_name} comprou: ${itemsList}. Total: ${total} (Pedido #${orderData.order_number})`;

  return await createNotification({
    title,
    message,
    type: 'success',
    expires_at: null // Notificação permanente até ser removida manualmente
  });
}

// Função para notificar sobre pagamento confirmado
export async function notifyPaymentConfirmed(orderData: {
  order_number: string;
  customer_name: string;
  total_amount_kz: number;
}) {
  const title = 'Pagamento Confirmado';
  const total = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(orderData.total_amount_kz);

  const message = `Pagamento de ${total} confirmado para ${orderData.customer_name} (Pedido #${orderData.order_number})`;

  return await createNotification({
    title,
    message,
    type: 'success',
    expires_at: null
  });
}

// Função para limpar notificações antigas (opcional - pode ser usada em uma tarefa agendada)
export async function cleanupOldNotifications(daysOld: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .eq('is_active', false);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao limpar notificações antigas:', error);
    throw error;
  }
}

// Função para obter notificações ativas
export async function getActiveNotifications() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar notificações ativas:', error);
    throw error;
  }
}

// Função para marcar notificação como lida/inativa
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_active: false })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
}

// Hook personalizado para escutar novas notificações em tempo real
export function useRealtimeNotifications(callback: (notification: any) => void) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
} 