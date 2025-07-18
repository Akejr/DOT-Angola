import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Package, User, Clock, MapPin, FileText, Image, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

// Interface para pedidos de importação
interface ImportRequest {
  id: string;
  created_at: string;
  product_name: string;
  product_link: string | null;
  has_images: boolean;
  images: string[] | null;
  urgency_level: 'urgent' | 'not-urgent';
  full_name: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

// Status do pedido (cores e rótulos)
const statusConfig = {
  pending: { 
    label: 'Pendente', 
    icon: Clock, 
    color: 'bg-yellow-100 text-yellow-800' 
  },
  processing: { 
    label: 'Em processamento', 
    icon: Package, 
    color: 'bg-blue-100 text-blue-800' 
  },
  completed: { 
    label: 'Concluído', 
    icon: CheckCircle, 
    color: 'bg-green-100 text-green-800' 
  },
  cancelled: { 
    label: 'Cancelado', 
    icon: XCircle, 
    color: 'bg-red-100 text-red-800' 
  }
};

export default function ImportRequestsManager() {
  const [importRequests, setImportRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Carregar pedidos de importação
  useEffect(() => {
    async function loadImportRequests() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('import_requests')
          .select('*')
          .order('created_at', { ascending: false });
          
        // Aplicar filtro de status se selecionado
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setImportRequests(data as ImportRequest[]);
      } catch (err) {
        console.error('Erro ao carregar pedidos de importação:', err);
        setError('Falha ao carregar os pedidos de importação.');
      } finally {
        setLoading(false);
      }
    }
    
    loadImportRequests();
  }, [statusFilter]);

  // Atualizar status do pedido
  const updateRequestStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('import_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar a lista local
      setImportRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status: status as any } : req
        )
      );
      
      // Atualizar o pedido selecionado se estiver visualizando
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status: status as any } : null);
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar o status do pedido.');
    }
  };
  
  // Abrir modal de detalhes
  const openDetailModal = (request: ImportRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };
  
  // Formatar data relativa
  const formatRelativeDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: pt
      });
    } catch (err) {
      return 'Data inválida';
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: keyof typeof statusConfig }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </span>
    );
  };
  
  // Adicionar função para apagar pedido
  const deleteRequest = async (id: string) => {
    if (!confirm('Tem certeza que deseja apagar este pedido? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Primeiro, apagar as imagens do storage se existirem
      const request = importRequests.find(r => r.id === id);
      if (request?.images && request.images.length > 0) {
        for (const imageUrl of request.images) {
          const path = imageUrl.split('/').pop();
          if (path) {
            await supabase.storage
              .from('import_requests')
              .remove([path]);
          }
        }
      }

      // Apagar o pedido do banco de dados
      const { error } = await supabase
        .from('import_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Atualizar a lista local
      setImportRequests(prev => prev.filter(req => req.id !== id));
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao apagar pedido:', err);
      alert('Erro ao apagar o pedido. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg text-red-700 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">Pedidos de Importação</h1>
          </div>
          
          {/* Filtros */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
                              className="px-3 py-2 rounded-lg border border-gray-300 [font-size:16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none h-8 sm:h-10"
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
            >
              <option value="">Todos os status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {importRequests.length === 0 ? (
          <div className="bg-gray-50 p-8 sm:p-12 rounded-xl flex flex-col items-center justify-center text-center">
            <Package className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Nenhum pedido encontrado</h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md">
              {statusFilter 
                ? 'Não há pedidos com o status selecionado. Tente outro filtro.' 
                : 'Ainda não há pedidos de importação registrados no sistema.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="divide-y divide-gray-200">
                {importRequests.map((request) => (
                  <div key={request.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {request.product_name}
                        </h3>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {request.full_name}
                        </p>
                        {request.product_link && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            Link: {request.product_link.substring(0, 30)}...
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openDetailModal(request)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">
                          {formatRelativeDate(request.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency_level === 'urgent' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency_level === 'urgent' ? 'Urgente' : 'Normal'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <StatusBadge status={request.status} />
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {request.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {request.product_name}
                        </div>
                        {request.product_link && (
                          <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                            Link: {request.product_link.substring(0, 30)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.full_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {request.email} • {request.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                          {formatRelativeDate(request.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency_level === 'urgent' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency_level === 'urgent' ? 'Urgente' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Modal de Detalhes */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
            <div 
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto mx-2 sm:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                    Detalhes do Pedido de Importação
                  </h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 flex-shrink-0"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Informações do Produto */}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Informações do Produto</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Nome do Produto</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                        {selectedRequest.product_name}
                      </p>
                    </div>
                    
                    {selectedRequest.product_link && (
                      <div>
                        <span className="text-xs text-gray-500">Link do Produto</span>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">
                          <a href={selectedRequest.product_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedRequest.product_link}
                          </a>
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs text-gray-500">Nível de Urgência</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {selectedRequest.urgency_level === 'urgent' ? 'Urgente' : 'Normal'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500">Imagens</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {selectedRequest.has_images 
                          ? 'Cliente enviou imagens do produto' 
                          : 'Cliente não enviou imagens'}
                      </p>
                      {selectedRequest.images && selectedRequest.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedRequest.images.map((img, idx) => (
                            <a 
                              key={idx} 
                              href={img} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-12 h-12 sm:w-16 sm:h-16 rounded bg-gray-100 overflow-hidden border border-gray-200"
                            >
                              <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Informações do Cliente */}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Informações do Cliente</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Nome Completo</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {selectedRequest.full_name}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className="text-xs text-gray-500">Email</span>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 break-all">
                          {selectedRequest.email}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs text-gray-500">Telefone</span>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {selectedRequest.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500">Endereço</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {selectedRequest.address}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-500">Província</span>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {selectedRequest.province}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Status e Notas */}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Status do Pedido</h4>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600">Status atual:</span>
                      <StatusBadge status={selectedRequest.status} />
                    </div>
                    

                    
                    {/* Atualizar Status */}
                    <div className="pt-3">
                      <label className="text-xs text-gray-500 block mb-1">Atualizar Status</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => {
                              updateRequestStatus(selectedRequest.id, key);
                            }}
                            disabled={key === selectedRequest.status}
                            className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center ${
                              key === selectedRequest.status
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : `${config.color.replace('bg-', 'hover:bg-')} border border-gray-200`
                            }`}
                          >
                            <config.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => deleteRequest(selectedRequest.id)}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                >
                  Apagar Pedido
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs sm:text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 