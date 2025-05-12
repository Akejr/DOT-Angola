import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Função auxiliar para verificar se é uma página admin
function isAdminPage(path: string): boolean {
  return path.startsWith('/admin') || path.includes('admin');
}

export function useAnalytics() {
  const location = useLocation();
  
  // Registrar sessão e usuário online
  useEffect(() => {
    const path = location.pathname;
    
    // Não registrar sessões em páginas admin
    if (isAdminPage(path)) {
      return;
    }
    
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('session_id', sessionId);
    }

    const registerSession = async () => {
      try {
        // Registrar sessão
        await supabase
          .from('sessions')
          .insert([{}]);

        // Registrar/atualizar usuário online
        await supabase
          .from('online_users')
          .upsert(
            { 
              session_id: sessionId,
              last_seen: new Date().toISOString(),
              current_page: location.pathname
            },
            { onConflict: 'session_id' }
          );

        // Configurar limpeza periódica de usuários inativos
        await supabase.rpc('cleanup_inactive_users');
      } catch (error) {
        console.error('Erro ao registrar sessão:', error);
      }
    };

    registerSession();

    // Atualizar status online periodicamente
    const interval = setInterval(async () => {
      try {
        await supabase
          .from('online_users')
          .upsert(
            { 
              session_id: sessionId,
              last_seen: new Date().toISOString(),
              current_page: location.pathname
            },
            { onConflict: 'session_id' }
          );
      } catch (error) {
        console.error('Erro ao atualizar status online:', error);
      }
    }, 30000); // Atualizar a cada 30 segundos

    // Limpar usuário ao sair
    const cleanup = async () => {
      try {
        await supabase
          .from('online_users')
          .delete()
          .eq('session_id', sessionId);
      } catch (error) {
        console.error('Erro ao limpar usuário:', error);
      }
    };

    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [location.pathname]);

  // Registrar visualização de página
  useEffect(() => {
    const path = location.pathname;
    
    // Não registrar visualizações em páginas admin
    if (isAdminPage(path)) {
      return;
    }
    
    const registerPageView = async () => {
      try {
        const title = document.title;

        await supabase
          .from('page_views')
          .insert([{ path, title }]);
      } catch (error) {
        console.error('Erro ao registrar visualização de página:', error);
      }
    };

    registerPageView();
  }, [location.pathname]);
} 