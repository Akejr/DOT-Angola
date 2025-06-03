// Sistema PWA e Notificações Push para Admin
import { supabase } from '@/lib/supabase';

interface NotificationPermissionResult {
  permission: NotificationPermission;
  subscription?: PushSubscription;
  error?: string;
}

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

class PWAManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Será configurado no servidor

  constructor() {
    this.init();
  }

  // Inicializar PWA
  async init() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('🚀 PWA: Registering service worker...');
        
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/admin'
        });

        console.log('✅ PWA: Service worker registered successfully');

        // Configurar notificação diária
        this.scheduleDailyNotification();

        // Listener para updates do service worker
        this.swRegistration.addEventListener('updatefound', () => {
          console.log('🔄 PWA: Service worker update found');
        });

      } catch (error) {
        console.error('❌ PWA: Service worker registration failed:', error);
      }
    }
  }

  // Solicitar permissão para notificações
  async requestNotificationPermission(): Promise<NotificationPermissionResult> {
    try {
      // Verificar se o navegador suporta notificações
      if (!('Notification' in window)) {
        throw new Error('Este navegador não suporta notificações');
      }

      // Verificar se já tem permissão
      if (Notification.permission === 'granted') {
        const subscription = await this.subscribeToPush();
        return { 
          permission: 'granted', 
          subscription 
        };
      }

      // Solicitar permissão
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const subscription = await this.subscribeToPush();
        return { 
          permission: 'granted', 
          subscription 
        };
      }

      return { permission };

    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return { 
        permission: 'denied', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Subscrever para push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        throw new Error('Service worker não registrado');
      }

      // Verificar se já está subscrito
      let subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Criar nova subscrição
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
      }

      // Salvar subscrição no backend
      await this.saveSubscriptionToBackend(subscription);

      console.log('✅ PWA: Push subscription created successfully');
      return subscription;

    } catch (error) {
      console.error('Erro ao subscrever push:', error);
      return null;
    }
  }

  // Salvar subscrição no backend
  private async saveSubscriptionToBackend(subscription: PushSubscription) {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
          auth: subscription.getKey('auth') ? 
            btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
        },
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, { 
          onConflict: 'endpoint' 
        });

      if (error) throw error;

      console.log('✅ PWA: Subscription saved to backend');

    } catch (error) {
      console.error('Erro ao salvar subscrição:', error);
    }
  }

  // Configurar notificação diária
  private scheduleDailyNotification() {
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'SCHEDULE_DAILY_NOTIFICATION'
      });
    }
  }

  // Mostrar notificação local
  async showLocalNotification(data: PushNotificationData) {
    try {
      if (Notification.permission !== 'granted') {
        console.warn('Permissão para notificações não concedida');
        return;
      }

      const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/pwa-icons/icon-192x192.png',
        badge: data.badge || '/pwa-icons/icon-72x72.png',
        tag: data.tag || 'admin-notification',
        data: data.data || {},
        requireInteraction: data.requireInteraction || false
      };

      const notification = new Notification(data.title, options);

      // Auto-close após 10 segundos se não for requerida interação
      if (!data.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      return notification;

    } catch (error) {
      console.error('Erro ao mostrar notificação local:', error);
    }
  }

  // Verificar se é PWA instalada
  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Mostrar prompt de instalação
  async showInstallPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      let deferredPrompt: any = null;

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
      });

      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          resolve(choiceResult.outcome === 'accepted');
          deferredPrompt = null;
        });
      } else {
        resolve(false);
      }
    });
  }

  // Utility: Converter VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Obter informações da PWA
  getPWAInfo() {
    return {
      isInstalled: this.isPWAInstalled(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotifications: 'Notification' in window,
      hasPushManager: 'PushManager' in window,
      notificationPermission: Notification.permission,
      isOnline: navigator.onLine
    };
  }
}

// Sistema de notificações para vendas
export class SalesNotificationManager {
  private pwaManager: PWAManager;

  constructor() {
    this.pwaManager = new PWAManager();
    this.initSalesListener();
  }

  // Inicializar listener para novas vendas
  private initSalesListener() {
    // Listener para mudanças na tabela sales
    const salesChannel = supabase
      .channel('sales-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sales' 
        }, 
        (payload) => {
          this.handleNewSale(payload.new as any);
        }
      )
      .subscribe();

    console.log('🔔 Sales notification listener initialized');
  }

  // Handler para nova venda
  private async handleNewSale(sale: any) {
    try {
      const totalFormatted = new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0
      }).format(sale.total);

      await this.pwaManager.showLocalNotification({
        title: '💰 Nova Venda Registrada!',
        body: `${sale.customer_name} - ${totalFormatted}`,
        icon: '/pwa-icons/icon-192x192.png',
        tag: 'new-sale',
        data: {
          saleId: sale.id,
          url: '/admin/vendas'
        },
        requireInteraction: true
      });

    } catch (error) {
      console.error('Erro ao notificar nova venda:', error);
    }
  }

  // Notificação manual para teste
  async testSaleNotification() {
    await this.pwaManager.showLocalNotification({
      title: '🧪 Teste - Nova Venda',
      body: 'João Silva - 15.000 AOA',
      tag: 'test-sale',
      requireInteraction: true
    });
  }

  // Configurar permissões
  async setupNotifications() {
    return await this.pwaManager.requestNotificationPermission();
  }
}

// Exportar instância global
export const pwaManager = new PWAManager();
export const salesNotificationManager = new SalesNotificationManager();

// Hook para React
export const usePWA = () => {
  const requestPermission = () => pwaManager.requestNotificationPermission();
  const showInstallPrompt = () => pwaManager.showInstallPrompt();
  const getPWAInfo = () => pwaManager.getPWAInfo();
  const showNotification = (data: PushNotificationData) => pwaManager.showLocalNotification(data);

  return {
    requestPermission,
    showInstallPrompt,
    getPWAInfo,
    showNotification
  };
}; 