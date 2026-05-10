// service-worker.js — cache apenas do APP_SHELL
const CACHE_NAME = 'notaalta-pwa-v1.00'; // Aumente sempre que atualizar
const APP_SHELL = [
  '/',
  '/index.html',
  '/home.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instala e faz pré-cache do App Shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

// Ativa, remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Se for parte do APP_SHELL → pega do cache
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(res => {
        return res || fetch(event.request);
      })
    );
    return;
  }

  // Todo o resto → Network First
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('', { status: 404 });
      })
  );
});

// Atualização automática forçada
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
