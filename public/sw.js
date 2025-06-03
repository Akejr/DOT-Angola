// Service Worker para Gift Card Haven Admin PWA
const CACHE_NAME = 'gch-admin-v1.0.1';
const STATIC_CACHE_NAME = 'gch-admin-static-v1.0.1';

// URLs para cache
const urlsToCache = [
  '/admin',
  '/admin/',
  '/admin/login',
  '/manifest.json',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png'
];

// Verificar se notificações são suportadas
function isNotificationSupported() {
  return 'Notification' in self && typeof Notification !== 'undefined';
}

// Verificar se vibração é suportada
function isVibrationSupported() {
  return 'vibrate' in navigator;
}

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Apenas cache requisições do admin
  if (!event.request.url.includes('/admin')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }

        // Faz a requisição para rede
        return fetch(event.request).then((response) => {
          // Verifica se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Listener para notificações push
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push received');
  
  if (!isNotificationSupported()) {
    console.warn('Service Worker: Notificações não suportadas');
    return;
  }
  
  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('Erro ao processar dados do push:', error);
    data = {
      title: 'Gift Card Haven Admin',
      body: 'Nova notificação recebida'
    };
  }

  const options = {
    body: data.body || 'Nova notificação',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    image: data.image || null,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir Admin',
        icon: '/pwa-icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/pwa-icons/icon-96x96.png'
      }
    ],
    tag: data.tag || 'admin-notification',
    requireInteraction: data.requireInteraction || false,
    vibrate: isVibrationSupported() ? [200, 100, 200] : undefined,
    sound: '/notification-sound.mp3'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Gift Card Haven Admin', options)
  );
});

// Listener para cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir ou focar na janela do admin
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Procurar janela existente do admin
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Se não encontrou, abrir nova janela
        if (clients.openWindow) {
          const targetUrl = event.notification.data?.url || '/admin';
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Listener para fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Service Worker: Notification closed');
  
  // Analytics opcional - registrar que a notificação foi fechada
  if (event.notification.data?.trackClose) {
    // Enviar evento de analytics
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId: event.notification.data.id,
        closedAt: new Date().toISOString()
      })
    }).catch(console.error);
  }
});

// Background Sync para notificações offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'daily-report') {
    event.waitUntil(sendDailyReport());
  }
});

// Função para enviar relatório diário
async function sendDailyReport() {
  try {
    console.log('📊 Service Worker: Generating daily report');
    
    // Aqui você pode fazer a lógica para buscar dados de vendas do dia
    const response = await fetch('/api/admin/daily-stats');
    const data = await response.json();
    
    if (!isNotificationSupported()) {
      console.warn('Service Worker: Não é possível mostrar notificação de relatório');
      return;
    }
    
    const notification = {
      title: '📊 Relatório Diário - Gift Card Haven',
      body: `Lucro hoje: ${data.dailyProfit || 0} AOA | Vendas: ${data.dailySales || 0}`,
      icon: '/pwa-icons/icon-192x192.png',
      badge: '/pwa-icons/icon-72x72.png',
      tag: 'daily-report',
      data: {
        url: '/admin/vendas',
        trackClose: true,
        id: 'daily-report-' + new Date().toISOString().split('T')[0]
      },
      requireInteraction: true
    };
    
    await self.registration.showNotification(notification.title, notification);
    
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
  }
}

// Listener para mensagens do app principal
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_DAILY_NOTIFICATION') {
    console.log('⏰ Service Worker: Scheduling daily notification');
    
    if (!isNotificationSupported()) {
      console.warn('Service Worker: Notificações diárias não suportadas');
      return;
    }
    
    // Em um cenário real, você usaria uma função serverless ou cron job
    // Aqui vamos simular com setTimeout
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(20, 20, 0, 0); // 20:20
    
    // Se já passou das 20:20 hoje, agendar para amanhã
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilNotification = targetTime.getTime() - now.getTime();
    
    setTimeout(async () => {
      await sendDailyReport();
      // Reagendar para o próximo dia
      setTimeout(() => {
        self.postMessage({ type: 'SCHEDULE_DAILY_NOTIFICATION' });
      }, 24 * 60 * 60 * 1000); // 24 horas
    }, timeUntilNotification);
    
    console.log(`⏰ Daily notification scheduled for: ${targetTime.toLocaleString('pt-BR')}`);
  }
  
  // Fallback notification para navegadores sem suporte nativo
  if (event.data?.type === 'SHOW_FALLBACK_NOTIFICATION') {
    console.log('📱 Service Worker: Showing fallback notification');
    const data = event.data.data;
    
    // Tentar mostrar via service worker registration
    if (isNotificationSupported() && self.registration) {
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/pwa-icons/icon-192x192.png',
        badge: '/pwa-icons/icon-72x72.png',
        tag: data.tag || 'fallback-notification'
      }).catch((error) => {
        console.error('Erro ao mostrar notificação fallback:', error);
      });
    }
  }
});

// Log de inicialização
console.log('🚀 Gift Card Haven Admin Service Worker loaded successfully!'); 