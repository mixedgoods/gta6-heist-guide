// GTA 6 Heist Guide & Companion HUD - Service Worker
const CACHE_NAME = 'gta6-heist-cache-v4';
const PRECACHE_URLS = [
  '/',
  '/site-config.js',
  '/assets/style.css',
  '/assets/main.js',
  '/assets/images/logo.webp',
  '/favicon.svg',
  '/embed/clock.html',
  '/embed/calculator.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
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
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests and API endpoints
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/';

  // Network-first for HTML pages so new deploys show up immediately
  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }

  // Network-first with cache fallback for static assets (including /assets/images/logo.webp)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
