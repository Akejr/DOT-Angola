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
          if (cacheName !== CACHE_NAME) {
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

// Interceptar requests e servir do cache quando offline
self.addEventListener('fetch', (event) => {
  // Estratégia: Network First, fallback para cache
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a resposta é válida, clonar e armazenar no cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhou (offline), tentar servir do cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback para página offline ou default
            if (event.request.mode === 'navigate') {
              return caches.match('/admin') || new Response('Offline - Verifique sua conexão');
            }
          });
        })
    );
  }
});

// Log de inicialização
console.log('🚀 Gift Card Haven Admin Service Worker loaded successfully!'); 