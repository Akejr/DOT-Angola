import { Users, Activity, MousePointerClick, Calendar, RefreshCw, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PageView {
  path: string;
  title: string;
  views: number;
}

interface DashboardStats {
  onlineUsers: number;
  uniqueSessions: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  pendingNotifications: number;
}

type Period = 'day' | 'week' | 'month' | 'year';

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('day');
  const [stats, setStats] = useState<DashboardStats>({
    onlineUsers: 0,
    uniqueSessions: { today: 0, week: 0, month: 0, year: 0 },
    pendingNotifications: 0
  });
  const [topPages, setTopPages] = useState<Record<Period, PageView[]>>({
    day: [],
    week: [],
    month: [],
    year: []
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Função principal para buscar todos os dados
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      
      // Buscar dados em paralelo
      await Promise.all([
        fetchOnlineUsers(),
        fetchUniqueSessions(),
        fetchPageViews(),
        fetchPendingNotifications()
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Buscar usuários online (últimos 5 minutos)
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('online_users')
        .select('session_id')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (error) throw error;
      
      setStats(prev => ({
        ...prev,
        onlineUsers: data?.length || 0
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários online:', error);
      setStats(prev => ({
        ...prev,
        onlineUsers: 0
      }));
    }
  };

  // Buscar sessões únicas por dia usando a nova tabela dashboard_sessions
  const fetchUniqueSessions = async () => {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Buscar sessões usando a nova tabela dashboard_sessions
      const { data: sessionsData, error } = await supabase
        .from('dashboard_sessions')
        .select('id, ip_address, created_at')
        .gte('created_at', startOfYear.toISOString());

      if (error) throw error;

      const sessions = sessionsData || [];
      
      // Processar sessões únicas por IP por dia
      const getUniqueSessions = (fromDate: Date) => {
        const relevantSessions = sessions.filter(s => new Date(s.created_at) >= fromDate);
        const uniqueSessionsByDay = new Map();
        
        relevantSessions.forEach(session => {
          const sessionDate = new Date(session.created_at).toDateString();
          const identifier = session.ip_address || session.id;
          const key = `${sessionDate}-${identifier}`;
          
          if (!uniqueSessionsByDay.has(key)) {
            uniqueSessionsByDay.set(key, session);
          }
        });
        
        return uniqueSessionsByDay.size;
      };

      setStats(prev => ({
        ...prev,
        uniqueSessions: {
          today: getUniqueSessions(startOfToday),
          week: getUniqueSessions(startOfWeek),
          month: getUniqueSessions(startOfMonth),
          year: getUniqueSessions(startOfYear)
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      setStats(prev => ({
        ...prev,
        uniqueSessions: { today: 0, week: 0, month: 0, year: 0 }
      }));
    }
  };

  // Buscar visualizações de páginas usando a nova tabela page_views
  const fetchPageViews = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const { data: pageViewsData, error } = await supabase
        .from('page_views')
        .select('path, title, created_at')
        .gte('created_at', startOfYear.toISOString());

      if (error) throw error;

      const pageViews = pageViewsData || [];
      
      const processPageViews = (startDate: Date) => {
        const filteredViews = pageViews.filter(p => new Date(p.created_at) >= startDate);
        const pageCounts = filteredViews.reduce((acc, view) => {
          acc[view.path] = (acc[view.path] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(pageCounts)
          .map(([path, views]) => ({
            path,
            title: pageViews.find(p => p.path === path)?.title || path,
            views
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 4);
      };

      setTopPages({
        day: processPageViews(startOfDay),
        week: processPageViews(startOfWeek),
        month: processPageViews(startOfMonth),
        year: processPageViews(startOfYear)
      });
    } catch (error) {
      console.error('Erro ao buscar visualizações de páginas:', error);
      setTopPages({
        day: [],
        week: [],
        month: [],
        year: []
      });
    }
  };

  // Buscar notificações pendentes
  const fetchPendingNotifications = async () => {
    try {
      // Verificar pedidos de importação pendentes
      const { data: importRequests, error: importError } = await supabase
        .from('import_requests')
        .select('id')
        .eq('status', 'pending');

      if (importError) throw importError;

      const totalPending = importRequests?.length || 0;

      setStats(prev => ({
        ...prev,
        pendingNotifications: totalPending
      }));
    } catch (error) {
      console.error('Erro ao buscar notificações pendentes:', error);
    }
  };

  // Buscar dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Atualizar dados automaticamente a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        fetchData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isRefreshing]);

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'day': return 'hoje';
      case 'week': return 'esta semana';
      case 'month': return 'este mês';
      case 'year': return 'este ano';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01042D]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#01042D] truncate">Dashboard</h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
              Atualizado {formatDistanceToNow(lastUpdated, { locale: ptBR, addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.pendingNotifications > 0 && (
              <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs">
                <Bell className="w-3 h-3" />
                <span>{stats.pendingNotifications} pendentes</span>
              </div>
            )}
            <button 
              onClick={fetchData}
              disabled={isRefreshing}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                isRefreshing 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-[#01042D]/5 text-[#01042D] hover:bg-[#01042D]/10'
              }`}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="w-full">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-1 sm:p-1 sm:bg-gray-50 sm:rounded-xl">
            <button
              onClick={() => setPeriod('day')}
              className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                period === 'day'
                  ? 'bg-[#01042D] sm:bg-white text-white sm:text-[#01042D] sm:shadow-sm'
                  : 'bg-gray-100 sm:bg-transparent text-gray-700 sm:text-gray-600 hover:bg-gray-200 sm:hover:bg-gray-100'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                period === 'week'
                  ? 'bg-[#01042D] sm:bg-white text-white sm:text-[#01042D] sm:shadow-sm'
                  : 'bg-gray-100 sm:bg-transparent text-gray-700 sm:text-gray-600 hover:bg-gray-200 sm:hover:bg-gray-100'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                period === 'month'
                  ? 'bg-[#01042D] sm:bg-white text-white sm:text-[#01042D] sm:shadow-sm'
                  : 'bg-gray-100 sm:bg-transparent text-gray-700 sm:text-gray-600 hover:bg-gray-200 sm:hover:bg-gray-100'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                period === 'year'
                  ? 'bg-[#01042D] sm:bg-white text-white sm:text-[#01042D] sm:shadow-sm'
                  : 'bg-gray-100 sm:bg-transparent text-gray-700 sm:text-gray-600 hover:bg-gray-200 sm:hover:bg-gray-100'
              }`}
            >
              Este Ano
            </button>
          </div>
        </div>

        {/* SEÇÃO: ANÁLISE DE USUÁRIOS E TRÁFEGO */}
        <div className="space-y-4 sm:space-y-6">
          {/* Título da Seção */}
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Análise de Usuários e Tráfego</h2>
              <p className="text-xs sm:text-sm text-gray-500">Métricas de visitantes e navegação do site</p>
            </div>
          </div>

          {/* Cards de Métricas de Usuários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* Usuários Online */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 text-white min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-white/70 truncate">Usuários Online</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-semibold">{stats.onlineUsers}</p>
                </div>
                <div className="bg-white/10 p-2 sm:p-3 rounded-xl flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs sm:text-sm text-white/70">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Últimos 5 minutos</span>
              </div>
            </div>

            {/* Sessões Únicas */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Sessões Únicas</p>
                  <p className="mt-2 text-2xl sm:text-3xl font-semibold text-blue-600">{stats.uniqueSessions[period]}</p>
                </div>
                <div className="bg-blue-50 p-2 sm:p-3 rounded-xl text-blue-600 flex-shrink-0">
                  <MousePointerClick className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{getPeriodLabel(period)}</span>
              </div>
            </div>
          </div>

          {/* Páginas Mais Acessadas */}
          <div className="bg-white rounded-2xl border border-gray-100 w-full min-w-0">
            <div className="border-b border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">Páginas Mais Acessadas</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">{getPeriodLabel(period)}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg self-start sm:self-auto flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {topPages[period].length > 0 ? (
                topPages[period].map((page, index) => (
                  <div 
                    key={page.path}
                    className="flex items-center p-4 sm:p-6 hover:bg-gray-50 transition-colors min-w-0"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm flex-shrink-0
                        ${index === 0 ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{page.title}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{page.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <span className="text-base sm:text-xl font-semibold text-blue-600">{page.views}</span>
                      <span className="text-xs text-gray-500 hidden sm:inline">views</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">
                  Nenhuma visualização registrada neste período
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 