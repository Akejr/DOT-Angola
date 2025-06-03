// Sistema PWA e Notificações Push para Admin
import { supabase } from '@/lib/supabase';

interface NotificationPermissionResult {
  permission: NotificationPermission | 'unsupported';
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

  // Verificar se notificações são suportadas
  private isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 
           'Notification' in window && 
           typeof Notification !== 'undefined';
  }

  // Verificar se service worker é suportado
  private isServiceWorkerSupported(): boolean {
    return typeof window !== 'undefined' && 
           'serviceWorker' in navigator;
  }

  // Verificar se push manager é suportado
  private isPushManagerSupported(): boolean {
    return typeof window !== 'undefined' && 
           'PushManager' in window;
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

      // Configurar notificação diária apenas se suportado
      if (this.isNotificationSupported()) {
        this.scheduleDailyNotification();
      }

      // Listener para updates do service worker
      this.swRegistration.addEventListener('updatefound', () => {
        console.log('🔄 PWA: Service worker update found');
      });

    } catch (error) {
      console.error('❌ PWA: Service worker registration failed:', error);
    }
  }

  // Solicitar permissão para notificações
  async requestNotificationPermission(): Promise<NotificationPermissionResult> {
    try {
      // Verificar se o navegador suporta notificações
      if (!this.isNotificationSupported()) {
        return {
          permission: 'unsupported',
          error: 'Este navegador não suporta notificações push. Use Chrome ou Safari mais recente.'
        };
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

      if (!this.isPushManagerSupported()) {
        console.warn('PWA: Push Manager não suportado');
        return null;
      }

      // Verificar se já está subscrito
      let subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        // Criar nova subscrição (apenas em HTTPS)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          console.warn('PWA: Push notifications requerem HTTPS');
          return null;
        }

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
      if (!this.isNotificationSupported()) {
        console.warn('Notificações não suportadas neste navegador');
        // Fallback: mostrar toast ou alert
        this.showFallbackNotification(data);
        return;
      }

      if (Notification.permission !== 'granted') {
        console.warn('Permissão para notificações não concedida');
        this.showFallbackNotification(data);
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
      this.showFallbackNotification(data);
    }
  }

  // Fallback para navegadores sem suporte a notificações
  private showFallbackNotification(data: PushNotificationData) {
    // Usar service worker se disponível
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'SHOW_FALLBACK_NOTIFICATION',
        data: data
      });
      return;
    }

    // Último recurso: alert
    alert(`${data.title}\n\n${data.body}`);
  }

  // Verificar se é PWA instalada
  isPWAInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Mostrar prompt de instalação
  async showInstallPrompt(): Promise<boolean> {
    return new Promise((resolve) => {
      let deferredPrompt: any = null;

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        deferredPrompt = e;
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Timeout para prompt
      setTimeout(() => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
            resolve(choiceResult.outcome === 'accepted');
            deferredPrompt = null;
          });
        } else {
          // Fallback para iOS/Safari
          if (this.isIOSSafari()) {
            alert('Para instalar este app:\n1. Toque no botão Compartilhar\n2. Toque em "Adicionar à Tela de Início"');
          }
          resolve(false);
        }
        
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }, 1000);
    });
  }

  // Detectar iOS Safari
  private isIOSSafari(): boolean {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && !!(window as any).MSStream === false;
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
      hasServiceWorker: this.isServiceWorkerSupported(),
      hasNotifications: this.isNotificationSupported(),
      hasPushManager: this.isPushManagerSupported(),
      notificationPermission: this.isNotificationSupported() ? Notification.permission : 'unsupported',
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isIOSSafari: this.isIOSSafari()
    };
  }
}

// Sistema de notificações para vendas
export class SalesNotificationManager {
  private pwaManager: PWAManager;
  private notificationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.pwaManager = new PWAManager();
    this.initCrossDeviceNotifications();
  }

  // Inicializar sistema de notificações cross-device
  private initCrossDeviceNotifications() {
    try {
      console.log('🔔 Iniciando sistema de notificações cross-device...');
      
      // Verificar notificações pendentes a cada 10 segundos
      this.notificationInterval = setInterval(() => {
        this.checkPendingNotifications();
      }, 10000);

      // Verificar imediatamente
      this.checkPendingNotifications();

      console.log('✅ Sistema de notificações cross-device iniciado');
    } catch (error) {
      console.error('Erro ao inicializar notificações cross-device:', error);
    }
  }

  // Verificar e processar notificações pendentes
  private async checkPendingNotifications() {
    try {
      // Buscar notificações pendentes
      const { data: notifications, error } = await supabase
        .rpc('get_pending_notifications');

      if (error) {
        console.error('Erro ao buscar notificações pendentes:', error);
        return;
      }

      if (!notifications || notifications.length === 0) {
        return;
      }

      console.log(`📬 ${notifications.length} notificação(ões) pendente(s) encontrada(s)`);

      // Processar cada notificação
      for (const notification of notifications) {
        await this.processNotification(notification);
      }

    } catch (error) {
      console.error('Erro ao verificar notificações pendentes:', error);
    }
  }

  // Processar uma notificação individual
  private async processNotification(notification: any) {
    try {
      // Mostrar notificação local
      await this.pwaManager.showLocalNotification({
        title: notification.title,
        body: notification.body,
        icon: '/pwa-icons/icon-192x192.png',
        tag: `${notification.type}-${notification.id}`,
        data: notification.data,
        requireInteraction: notification.type === 'new_sale'
      });

      // Marcar como enviada
      const { error } = await supabase
        .rpc('mark_notification_sent', { 
          notification_id: notification.id 
        });

      if (error) {
        console.error('Erro ao marcar notificação como enviada:', error);
      } else {
        console.log(`✅ Notificação ${notification.id} processada com sucesso`);
      }

    } catch (error) {
      console.error('Erro ao processar notificação:', error);
    }
  }

  // Notificação manual para teste
  async testSaleNotification() {
    try {
      // Criar uma compra de teste que vai trigger o sistema
      const { error } = await supabase
        .rpc('test_new_order_notification');

      if (error) {
        console.error('Erro ao criar compra de teste:', error);
        // Fallback para notificação local
        await this.pwaManager.showLocalNotification({
          title: '🧪 Teste - Nova Compra',
          body: 'João Silva (TESTE) - 15.000 AOA',
          tag: 'test-order',
          requireInteraction: true
        });
      } else {
        console.log('✅ Compra de teste criada - notificação será enviada automaticamente');
      }
    } catch (error) {
      console.error('Erro no teste de notificação:', error);
      // Fallback
      await this.pwaManager.showLocalNotification({
        title: '🧪 Teste - Nova Compra',
        body: 'João Silva (TESTE) - 15.000 AOA',
        tag: 'test-order',
        requireInteraction: true
      });
    }
  }

  // Configurar permissões
  async setupNotifications() {
    return await this.pwaManager.requestNotificationPermission();
  }

  // Método público para acessar PWA Manager
  getPWAManager() {
    return this.pwaManager;
  }

  // Cleanup ao destruir
  destroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
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