import { supabase } from '@/lib/supabase';

const ONLINE_THRESHOLD_MINUTES = 5;

// Função auxiliar para verificar se é uma página admin
function isAdminPage(path: string): boolean {
  return path.startsWith('/admin') || path.includes('admin');
}

// Função para limpar dados de sessão do admin
export function clearAdminSession() {
  localStorage.removeItem('session_id');
  localStorage.removeItem('last_path');
}

export async function trackPageView(path: string) {
  // Validação inicial do path
  if (!path) {
    console.warn('trackPageView chamado sem path');
    return;
  }

  // Não rastrear páginas admin
  if (isAdminPage(path)) {
    console.debug('Página admin detectada, não rastreando:', path);
    clearAdminSession(); // Limpa dados de sessão ao entrar no admin
    return;
  }

  try {
    // Verifica se já existe uma sessão para este usuário
    const sessionId = localStorage.getItem('session_id');
    const lastPath = localStorage.getItem('last_path');
    
    // Verifica se o último path era uma página admin
    if (lastPath && isAdminPage(lastPath)) {
      console.debug('Última página era admin, iniciando nova sessão');
      clearAdminSession();
    }
    
    // Se for a mesma página, apenas atualiza o timestamp
    if (sessionId && path === lastPath) {
      console.debug('Mesma página, atualizando timestamp:', path);
      await supabase
        .from('sessions')
        .update({ 
          last_seen_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      return;
    }
    
    if (!sessionId) {
      console.debug('Criando nova sessão para:', path);
      // Primeira visita - cria nova sessão
      const { data: session } = await supabase
        .from('sessions')
        .insert([
          { 
            last_seen_at: new Date().toISOString(),
            path: path,
            is_first_visit: true
          }
        ])
        .select()
        .single();

      if (session?.id) {
        localStorage.setItem('session_id', session.id);
        localStorage.setItem('last_path', path);
      }
    } else {
      console.debug('Atualizando sessão existente para:', path);
      // Atualiza o timestamp e o path
      await supabase
        .from('sessions')
        .update({ 
          last_seen_at: new Date().toISOString(),
          path: path
        })
        .eq('id', sessionId);
      
      localStorage.setItem('last_path', path);
    }
  } catch (error) {
    console.error('Erro ao rastrear visualização:', error);
  }
}

export async function getAnalytics() {
  try {
    const now = new Date();
    const onlineThreshold = new Date(now.getTime() - ONLINE_THRESHOLD_MINUTES * 60000);

    // Busca sessões ativas (últimos 5 minutos)
    const { data: onlineSessions } = await supabase
      .from('sessions')
      .select('id, path')
      .gt('last_seen_at', onlineThreshold.toISOString())
      .not('path', 'like', '/admin%')
      .not('path', 'ilike', '%admin%'); // Adiciona verificação case-insensitive

    // Filtra novamente para garantir que nenhuma página admin passe
    const filteredOnlineSessions = onlineSessions?.filter(
      session => !isAdminPage(session.path)
    ) || [];

    // Conta total de sessões únicas (apenas primeiras visitas)
    const { count: totalSessions } = await supabase
      .from('sessions')
      .select('id', { count: 'exact' })
      .eq('is_first_visit', true)
      .not('path', 'like', '/admin%')
      .not('path', 'ilike', '%admin%');

    // Busca páginas mais visitadas (excluindo admin)
    const { data: pageViews } = await supabase
      .from('sessions')
      .select('path')
      .not('path', 'like', '/admin%')
      .not('path', 'ilike', '%admin%')
      .eq('is_first_visit', true);

    // Filtra novamente para garantir
    const filteredPageViews = pageViews?.filter(
      session => !isAdminPage(session.path)
    ) || [];

    const pageViewsCount = new Map<string, number>();
    filteredPageViews.forEach(session => {
      if (session.path && !isAdminPage(session.path)) {
        pageViewsCount.set(session.path, (pageViewsCount.get(session.path) || 0) + 1);
      }
    });

    const topPages = Array.from(pageViewsCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, views]) => ({ page, views }));

    return {
      onlineUsers: filteredOnlineSessions.length,
      totalSessions: totalSessions || 0,
      topPages
    };
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return {
      onlineUsers: 0,
      totalSessions: 0,
      topPages: []
    };
  }
} 