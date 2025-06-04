import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, User, Phone, MapPin, Mail, Calendar, DollarSign, Eye, CheckCircle, Clock, AlertCircle, Search, Filter, Trash2, ShoppingBag } from 'lucide-react';

interface OrderItem {
  id: string;
  gift_card_id: number;
  plan_id: string | null;
  quantity: number;
  unit_price: number;
  currency: string;
  unit_price_kz: number;
  total_price_kz: number;
  gift_cards?: {
    id: number;
    name: string;
    image_url?: string;
  };
  gift_card_plans?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email: string;
  total_amount_kz: number;
  status: 'pending' | 'completed';
  created_at: string;
  order_items?: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando carregamento de pedidos...');
      
      // Query completa com JOINs para buscar nomes dos produtos
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            gift_card_id,
            plan_id,
            quantity,
            unit_price,
            currency,
            unit_price_kz,
            total_price_kz,
            gift_cards (
              id,
              name,
              image_url
            ),
            gift_card_plans (
              id,
              name,
              price,
              currency
            )
          )
        `)
        .order('created_at', { ascending: false });

      console.log('📊 Resultado da consulta completa:', { data, error, count: data?.length });

      if (error) {
        console.error('❌ Erro na consulta completa:', error);
        
        // Fallback para query simples com order_items
        console.log('🔄 Tentando query com order_items básico...');
        const { data: basicData, error: basicError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              gift_card_id,
              plan_id,
              quantity,
              unit_price,
              currency,
              unit_price_kz,
              total_price_kz
            )
          `)
          .order('created_at', { ascending: false });
          
        if (basicError) {
          console.error('❌ Erro na query básica:', basicError);
          
          // Último fallback - só orders
          console.log('🔄 Último fallback - só orders...');
          const { data: ordersOnly, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (ordersError) {
            throw ordersError;
          }
          
          console.log('✅ Fallback final funcionou:', ordersOnly?.length);
          setOrders(ordersOnly || []);
          return;
        }
        
        console.log('✅ Query básica funcionou:', basicData?.length);
        setOrders(basicData || []);
        return;
      }

      console.log(`✅ ${data?.length || 0} pedidos carregados com dados completos`);
      
      // Log detalhado dos dados para debug
      if (data && data.length > 0) {
        console.log('📦 Primeiro pedido completo:', data[0]);
        if (data[0].order_items && data[0].order_items.length > 0) {
          console.log('📦 Primeiro item com gift_card:', data[0].order_items[0]);
        }
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Atualizar a lista local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Atualizar o pedido selecionado se for o mesmo
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja deletar este pedido? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      // Remover da lista local
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Limpar seleção se for o pedido deletado
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      
      alert('Pedido deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      alert('Erro ao deletar pedido');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.order_items?.some(item => 
        item.gift_cards?.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || false);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-AO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-AO', {
      maximumFractionDigits: 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Compras Efetuadas</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Package className="w-4 h-4" />
          <span>{orders.length} pedidos total</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por número do pedido, cliente, email ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Pedidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pedidos ({filteredOrders.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedOrder?.id === order.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        #{order.order_number}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">
                          {order.status === 'pending' ? 'Pendente' : 'Concluído'}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {order.customer_name}
                    </p>
                    {order.order_items && order.order_items.length > 0 && (
                      <p className="text-xs text-gray-500 mb-1">
                        {order.order_items.length === 1 
                          ? `${order.order_items[0].gift_cards?.name || `Gift Card #${order.order_items[0].gift_card_id}`}`
                          : `${order.order_items.length} produtos diferentes`
                        }
                        {' • '}
                        {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} itens total
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(order.total_amount_kz)} Kz
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOrder(order.id);
                    }}
                    disabled={deletingOrderId === order.id}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Deletar pedido"
                  >
                    {deletingOrderId === order.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum pedido encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Detalhes do Pedido */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detalhes do Pedido</h2>
          </div>
          {selectedOrder ? (
            <div className="p-4 space-y-6">
              {/* Informações do Cliente */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Cliente</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{selectedOrder.customer_email}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-gray-600">{selectedOrder.customer_address}</span>
                  </div>
                </div>
              </div>

              {/* Produtos Comprados */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Produtos Comprados</h3>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          {item.gift_cards?.image_url && (
                            <img 
                              src={item.gift_cards.image_url} 
                              alt={item.gift_cards.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.gift_cards?.name || `Gift Card #${item.gift_card_id}`}
                            </h4>
                            {item.gift_card_plans && (
                              <p className="text-xs text-gray-500 mt-1">
                                Plano: {item.gift_card_plans.name} • {formatCurrency(item.gift_card_plans.price)} {item.gift_card_plans.currency}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <span>Qtd: {item.quantity}</span>
                                <span>•</span>
                                <span>{formatCurrency(item.unit_price_kz)} Kz cada</span>
                                {item.currency !== 'KWZ' && (
                                  <>
                                    <span>•</span>
                                    <span>({formatCurrency(item.unit_price)} {item.currency})</span>
                                  </>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.total_price_kz)} Kz
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhum item encontrado neste pedido</p>
                  </div>
                )}
              </div>

              {/* Informações do Pedido */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Informações do Pedido</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Número do Pedido:</span>
                    <span className="font-mono text-gray-900">#{selectedOrder.order_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Data do Pedido:</span>
                    <span className="text-gray-900">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de Itens:</span>
                    <span className="text-gray-900">
                      {selectedOrder.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1">
                        {selectedOrder.status === 'pending' ? 'Pendente' : 'Concluído'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedOrder.total_amount_kz)} Kz
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status === 'pending' ? 'completed' : 'pending')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedOrder.status === 'pending'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {selectedOrder.status === 'pending' ? 'Marcar como Concluído' : 'Marcar como Pendente'}
                </button>
                <button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  disabled={deletingOrderId === selectedOrder.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deletingOrderId === selectedOrder.id ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Selecione um pedido para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 