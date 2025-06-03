import { useState, useEffect } from 'react';
import { Bell, Trash2, Edit2, Plus, Check, AlertTriangle, CalendarClock, Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    is_active: true,
    expires_at: '',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        is_active: formData.is_active,
        expires_at: formData.expires_at || null,
      };

      if (editingNotification) {
        // Atualizar notificação existente
        const { error } = await supabase
          .from('notifications')
          .update(notificationData)
          .eq('id', editingNotification.id);

        if (error) throw error;
      } else {
        // Criar nova notificação
        const { error } = await supabase
          .from('notifications')
          .insert([notificationData]);

        if (error) throw error;
      }

      resetForm();
      loadNotifications();
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
      alert('Erro ao salvar notificação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
      setShowForm(false);
    }
  };

  const toggleNotificationStatus = async (notification: Notification) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !notification.is_active })
        .eq('id', notification.id);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error('Erro ao atualizar status da notificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notificação?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadNotifications();
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_active: notification.is_active,
      expires_at: notification.expires_at || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      is_active: true,
      expires_at: '',
    });
    setEditingNotification(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Gerenciar Notificações</h1>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Nova Notificação</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </div>

        {/* Lista de Notificações */}
        {loading && !showForm ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                  Crie sua primeira notificação para informar seus usuários sobre novidades, promoções ou atualizações.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="block sm:hidden">
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{notification.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleEditNotification(notification)}
                              className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {getTypeIcon(notification.type)}
                            <span className="ml-1 capitalize">{notification.type}</span>
                          </span>
                          <button 
                            onClick={() => toggleNotificationStatus(notification)}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              notification.is_active
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${notification.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            {notification.is_active ? 'Ativa' : 'Inativa'}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Criado:</span> {formatDate(notification.created_at)}
                          </div>
                          {notification.expires_at && (
                            <div>
                              <span className="font-medium">Expira:</span> {formatDate(notification.expires_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notificação</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Expiração</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{notification.title}</div>
                              <div className="text-sm text-gray-500">{notification.message}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                              {getTypeIcon(notification.type)}
                              <span className="ml-1 capitalize">{notification.type}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => toggleNotificationStatus(notification)}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                notification.is_active
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full mr-1.5 ${notification.is_active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                              {notification.is_active ? 'Ativa' : 'Inativa'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notification.expires_at ? formatDate(notification.expires_at) : 'Sem expiração'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(notification.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEditNotification(notification)}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal Formulário */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-xl max-w-xl w-full max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {editingNotification ? 'Editar Notificação' : 'Nova Notificação'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-10"
                    required
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Mensagem <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                    rows={3}
                    required
                  />
                </div>

                {/* Tipo de Notificação */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tipo de Notificação
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['info', 'success', 'warning', 'error'].map((type) => (
                      <label
                        key={type}
                        className={`
                          flex items-center p-2 rounded-lg border cursor-pointer transition-colors
                          ${formData.type === type ? `${getTypeColor(type)} border-opacity-100` : 'hover:bg-gray-50'}
                        `}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={() => setFormData({ ...formData, type: type as any })}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-center w-full">
                          {getTypeIcon(type)}
                          <span className="ml-1 sm:ml-1.5 text-xs sm:text-sm capitalize">{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Data de Expiração */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Data de Expiração <span className="text-gray-400 text-xs">(Opcional)</span>
                  </label>
                  <div className="flex items-center">
                    <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para notificações sem data de expiração.
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Ativar notificação imediatamente
                    </span>
                  </label>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 