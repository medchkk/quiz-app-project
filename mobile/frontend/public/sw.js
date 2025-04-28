// Ce fichier est un service worker personnalisé qui sera utilisé par la PWA
// Il sera automatiquement enregistré par vite-plugin-pwa

// Nom du cache
const CACHE_NAME = 'quiz-app-cache-v1';

// Liste des ressources à mettre en cache immédiatement
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/pwa-192.png',
  '/pwa-512.png',
  '/default-avatar.svg'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours');
  
  // Mise en cache des ressources essentielles
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des ressources essentielles');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation en cours');
  
  // Nettoyage des anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Stratégie "Cache First, Network Fallback" pour les ressources statiques
  if (event.request.url.includes('/static/') || 
      event.request.url.endsWith('.png') || 
      event.request.url.endsWith('.svg') || 
      event.request.url.endsWith('.css') || 
      event.request.url.endsWith('.js')) {
    
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Retourner la ressource du cache si elle existe
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau et mettre en cache
        return fetch(event.request).then((networkResponse) => {
          // Vérifier que la réponse est valide
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Mettre en cache la nouvelle ressource
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        });
      })
    );
  } else {
    // Stratégie "Network First, Cache Fallback" pour les API et autres ressources
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Mettre en cache la réponse si c'est une requête GET
          if (event.request.method === 'GET') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // En cas d'échec réseau, essayer de récupérer depuis le cache
          return caches.match(event.request);
        })
    );
  }
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
