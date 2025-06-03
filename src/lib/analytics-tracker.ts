import { supabase } from '@/lib/supabase';

interface SessionData {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  title: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeTracking() {
    if (this.isInitialized) return;
    
    try {
      // Registrar sessão inicial
      await this.trackSession();
      
      // Registrar como usuário online
      await this.trackOnlineUser();
      
      // Configurar atualização periódica do status online
      this.setupOnlineStatusUpdater();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Erro ao inicializar tracking:', error);
    }
  }

  private async trackSession() {
    if (this.isAdminPage()) return;

    try {
      const sessionData = this.getSessionData();
      
      await supabase
        .from('dashboard_sessions')
        .upsert({
          session_id: this.sessionId,
          ip_address: sessionData.ipAddress,
          user_agent: sessionData.userAgent,
          path: sessionData.path,
          title: sessionData.title,
          is_first_visit: true,
          start_time: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        });
    } catch (error) {
      console.error('Erro ao registrar sessão:', error);
    }
  }

  private async trackOnlineUser() {
    if (this.isAdminPage()) return;

    try {
      const sessionData = this.getSessionData();
      
      await supabase
        .from('online_users')
        .upsert({
          session_id: this.sessionId,
          ip_address: sessionData.ipAddress,
          user_agent: sessionData.userAgent,
          last_seen: new Date().toISOString(),
          current_page: sessionData.path
        }, {
          onConflict: 'session_id'
        });
    } catch (error) {
      console.error('Erro ao registrar usuário online:', error);
    }
  }

  public async trackPageView(path?: string, title?: string) {
    if (this.isAdminPage(path)) return;

    try {
      const sessionData = this.getSessionData();
      const pagePath = path || sessionData.path;
      const pageTitle = title || sessionData.title;
      
      // Registrar visualização da página
      await supabase
        .from('page_views')
        .insert({
          path: pagePath,
          title: pageTitle,
          session_id: this.sessionId,
          ip_address: sessionData.ipAddress,
          user_agent: sessionData.userAgent,
          referrer: document.referrer || null,
          created_at: new Date().toISOString()
        });

      // Atualizar sessão com nova página
      await supabase
        .from('dashboard_sessions')
        .update({
          path: pagePath,
          title: pageTitle,
          last_seen_at: new Date().toISOString()
        })
        .eq('session_id', this.sessionId);

      // Atualizar usuário online
      await this.trackOnlineUser();
      
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  }

  private setupOnlineStatusUpdater() {
    // Atualizar status online a cada 30 segundos
    setInterval(async () => {
      if (!this.isAdminPage()) {
        await this.trackOnlineUser();
      }
    }, 30000);

    // Limpar dados ao sair da página
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/api/analytics/cleanup', JSON.stringify({
        sessionId: this.sessionId
      }));
    });
  }

  private getSessionData(): SessionData {
    return {
      sessionId: this.sessionId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      path: window.location.pathname,
      title: document.title
    };
  }

  private getClientIP(): string {
    // Em produção, isso seria obtido do servidor
    // Por enquanto, usar um IP fictício baseado no session
    return `192.168.1.${Math.floor(Math.random() * 255)}`;
  }

  private isAdminPage(path?: string): boolean {
    const currentPath = path || window.location.pathname;
    return currentPath.startsWith('/admin') || 
           currentPath.includes('admin') ||
           currentPath.includes('dashboard');
  }

  // Método público para rastrear eventos específicos
  public async trackEvent(eventName: string, data?: any) {
    if (this.isAdminPage()) return;

    try {
      await supabase
        .from('page_views')
        .insert({
          path: `event:${eventName}`,
          title: eventName,
          session_id: this.sessionId,
          ip_address: this.getClientIP(),
          user_agent: navigator.userAgent,
          referrer: JSON.stringify(data || {}),
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
    }
  }

  // Cleanup manual
  public async cleanup() {
    try {
      await supabase
        .from('online_users')
        .delete()
        .eq('session_id', this.sessionId);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}

// Instância global do tracker
const analyticsTracker = new AnalyticsTracker();

// Hook para usar em componentes React
export const useAnalyticsTracker = () => {
  const trackPageView = (path?: string, title?: string) => {
    analyticsTracker.trackPageView(path, title);
  };

  const trackEvent = (eventName: string, data?: any) => {
    analyticsTracker.trackEvent(eventName, data);
  };

  return { trackPageView, trackEvent };
};

// Função para rastreamento automático ao mudar de página
export const trackPageViewAutomatic = () => {
  // Rastrear página inicial
  analyticsTracker.trackPageView();
  
  // Rastrear mudanças de página (SPA)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(() => analyticsTracker.trackPageView(), 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => analyticsTracker.trackPageView(), 100);
  };
  
  window.addEventListener('popstate', () => {
    setTimeout(() => analyticsTracker.trackPageView(), 100);
  });
};

export default analyticsTracker; 