const CACHE_NAME = 'riffs-store-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/script.js',
  '/assets/js/riffs-map.js',
  '/assets/js/store-data.js',
  '/assets/img/riffs-red.webp',
  '/assets/img/heritage.webp',
  '/assets/img/challange.webp',
  '/assets/img/summer-sale.webp',
  '/404.html',
  '/legal.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
