const CACHE_NAME = "riffs-store-v10";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/legal.html",
  "/404.html",
  "/manifest.json",
  "/assets/css/styles.css",
  "/assets/js/script.js",
  "/assets/js/riffs-map.js",
  "/assets/js/store-data.js",
  "/assets/img/riffs-red.webp",
  "/assets/img/fathers-day.webp",
  "/assets/img/heritage.webp",
  "/assets/img/challenge.webp",
  "/assets/img/favicon_io/favicon.ico",
  "/assets/img/favicon_io/favicon-32x32.png",
  "/assets/img/favicon_io/apple-touch-icon.png",
  "/assets/img/favicon_io/android-chrome-192x192.png",
  "/assets/img/favicon_io/android-chrome-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(response => response || caches.match("/index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const networkResponse = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cachedResponse || Response.error());

      return cachedResponse || networkResponse;
    })
  );
});
