import { Users, Activity, MousePointerClick, Calendar, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PageView {
  path: string;
  title: string;
  views: number;
}

type Period = 'day' | 'week' | 'month' | 'year';

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('day');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [totalSessions, setTotalSessions] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0
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

  // Função para buscar dados do Supabase
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
      const startOfYear = new Date(now.setFullYear(now.getFullYear() - 1));

      // Buscar usuários online
      const { data: onlineUsersData, error: onlineUsersError } = await supabase
        .from('online_users')
        .select('session_id')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (onlineUsersError) throw onlineUsersError;
      setOnlineUsers(onlineUsersData?.length || 0);

      // Buscar sessões por período
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('created_at, path')
        .gte('created_at', startOfYear.toISOString())
        .not('path', 'like', '/admin%')
        .not('path', 'ilike', '%admin%');

      if (sessionsError) throw sessionsError;

      // Calcular totais por período
      const sessions = sessionsData || [];
      // Filtra novamente para garantir que nenhuma página admin passe
      const filteredSessions = sessions.filter(s => {
        if (!s.path) return true;
        return !(s.path.startsWith('/admin') || s.path.includes('admin'));
      });
      
      const daySessions = filteredSessions.filter(s => new Date(s.created_at) >= startOfDay).length;
      const weekSessions = filteredSessions.filter(s => new Date(s.created_at) >= startOfWeek).length;
      const monthSessions = filteredSessions.filter(s => new Date(s.created_at) >= startOfMonth).length;
      const yearSessions = filteredSessions.length;

      setTotalSessions({
        day: daySessions,
        week: weekSessions,
        month: monthSessions,
        year: yearSessions
      });

      // Buscar páginas mais acessadas
      const { data: pageViewsData, error: pageViewsError } = await supabase
        .from('page_views')
        .select('path, title, created_at')
        .gte('created_at', startOfYear.toISOString());

      if (pageViewsError) throw pageViewsError;

      // Processar visualizações de páginas
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

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Buscar dados iniciais
  useEffect(() => {
    // Reiniciar o estado
    setTotalSessions({
      day: 0,
      week: 0,
      month: 0,
      year: 0
    });
    
    // Buscar dados
    fetchData();
  }, []);

  // Atualizar dados a cada 15 segundos
  useEffect(() => {
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#01042D]">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Atualizado {formatDistanceToNow(lastUpdated, { locale: ptBR, addSuffix: true })}
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isRefreshing}
          className={`p-2 rounded-lg transition-colors ${
            isRefreshing 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-[#01042D]/5 text-[#01042D] hover:bg-[#01042D]/10'
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usuários Online */}
        <div className="bg-gradient-to-br from-[#01042D] to-[#01042D]/90 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Usuários Online</p>
              <p className="mt-2 text-3xl font-semibold">{onlineUsers}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl">
              <Users className={`h-6 w-6 ${isRefreshing ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-white/70">
            <Activity className="h-4 w-4" />
            <span>Atualizado a cada 15 segundos</span>
          </div>
        </div>

        {/* Total de Sessões */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Sessões</p>
              <p className="mt-2 text-3xl font-semibold text-[#01042D]">{totalSessions[period]}</p>
            </div>
            <div className="bg-[#01042D]/5 p-3 rounded-xl text-[#01042D]">
              <MousePointerClick className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>{getPeriodLabel(period)}</span>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl">
        <button
          onClick={() => setPeriod('day')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            period === 'day'
              ? 'bg-white text-[#01042D] shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            period === 'week'
              ? 'bg-white text-[#01042D] shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            period === 'month'
              ? 'bg-white text-[#01042D] shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Este Mês
        </button>
        <button
          onClick={() => setPeriod('year')}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            period === 'year'
              ? 'bg-white text-[#01042D] shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Este Ano
        </button>
      </div>

      {/* Páginas Mais Acessadas */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="border-b border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-[#01042D]">Páginas Mais Acessadas</h2>
              <p className="mt-1 text-sm text-gray-500">{getPeriodLabel(period)}</p>
            </div>
            <div className="bg-[#01042D]/5 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-[#01042D]" />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {topPages[period].length > 0 ? (
            topPages[period].map((page, index) => (
              <div 
                key={page.path}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${index === 0 ? 'bg-[#01042D] text-white' : 'bg-[#01042D]/5 text-[#01042D]'}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-[#01042D]">{page.title}</p>
                    <p className="text-sm text-gray-500">{page.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[#01042D]">{page.views}</span>
                  <span className="text-sm text-gray-500">views</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              Nenhuma visualização registrada neste período
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 