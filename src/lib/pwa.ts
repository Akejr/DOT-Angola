// Sistema PWA básico (sem notificações)
import { supabase } from '@/lib/supabase';

class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  // Verificar se service worker é suportado
  private isServiceWorkerSupported(): boolean {
    return typeof window !== 'undefined' && 
           'serviceWorker' in navigator;
  }

  // Inicializar PWA
  async init() {
    if (!this.isServiceWorkerSupported()) {
      console.warn('PWA: Service Worker não suportado neste navegador');
      return;
    }

    try {
      console.log('🚀 PWA: Registering service worker...');
      
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/admin'
      });

      console.log('✅ PWA: Service worker registered successfully');

      // Listener para updates do service worker
      this.swRegistration.addEventListener('updatefound', () => {
        console.log('🔄 PWA: Service worker update found');
      });

    } catch (error) {
      console.error('❌ PWA: Service worker registration failed:', error);
    }
  }

  // Verificar se é PWA instalada
  isPWAInstalled(): boolean {
    return typeof window !== 'undefined' && 
           window.matchMedia('(display-mode: standalone)').matches ||
           (window as any).navigator?.standalone === true;
  }

  // Mostrar prompt de instalação
  async showInstallPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        e.prompt();
        e.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ PWA: App installed successfully');
            resolve(true);
          } else {
            console.log('❌ PWA: App installation declined');
            resolve(false);
          }
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        });
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Se o evento já passou, tentar forçar
      setTimeout(() => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        resolve(false);
      }, 5000);
    });
  }

  // Verificar se é iOS Safari
  private isIOSSafari(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);
  }

  // Obter informações da PWA
  getPWAInfo() {
    return {
      isInstalled: this.isPWAInstalled(),
      hasServiceWorker: this.isServiceWorkerSupported(),
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isIOSSafari: this.isIOSSafari()
    };
  }
}

// Instância única do PWA Manager
export const pwaManager = new PWAManager();

// Hook para React
export const usePWA = () => {
  const showInstallPrompt = () => pwaManager.showInstallPrompt();
  const getPWAInfo = () => pwaManager.getPWAInfo();

  return {
    showInstallPrompt,
    getPWAInfo
  };
}; 