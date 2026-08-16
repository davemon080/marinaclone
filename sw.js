const CACHE_NAME = 'marina-mismo-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/signin',
  '/register-type',
  '/verify-id-certificate',
  '/verify-qr-code',
  '/examination-schedules',
  '/done',
  '/static/js/logo-data.js',
  '/static/css/main.3ab323b0.chunk.css',
  '/static/js/main.1db8a6a0.chunk.js',
  '/static/js/12.40516b25.chunk.js',
  '/static/js/36.80f605f8.chunk.js',
  '/static/js/27.8834cc00.chunk.js',
  '/static/js/19.dfae8684.chunk.js',
  '/static/js/17.3d62d1c1.chunk.js',
  '/static/js/15.ad2ec10e.chunk.js',
  'https://iili.io/Cs3uV0g.png',
  'https://iili.io/Cs3Y28g.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching assets partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
