// GTA 6 Heist Guide & Companion HUD - Service Worker
const CACHE_NAME = 'gta6-heist-cache-v27';
const PRECACHE_URLS = [
  '/',
  '/gta-6-money-guide/',
  '/gta-6-tips-and-tricks/',
  '/gta-6-endings-guide/',
  '/gta-6-relationship-guide/',
  '/gta-6-100-completion-tracker/',
  '/gta-6-tools/',
  '/gta-6-database/',
  '/gta-6-discoveries/',
  '/gta-6-glitches/',
  '/gta-6-settings/',
  '/animals.html',
  '/properties.html',
  '/vehicles.html',
  '/weapons.html',
  '/weapons-bonuses.html',
  '/radio.html',
  '/data/discoveries.json',
  '/data/glitches.json',
  '/data/animals.json',
  '/data/properties.json',
  '/data/vehicles.json',
  '/data/weapons.json',
  '/data/gun-stores.json',
  '/data/radio.json',
  '/data/cheats.json',
  '/site-config.js',
  '/assets/js/gta6-progress-store.js',
  '/assets/js/share-tools.js',
  '/assets/js/world-db-engine.js',
  '/assets/js/settings-hub.js',
  '/js/progress-store.js',
  '/js/affiliates.js?v=20261122_v23',
  '/assets/style.css?v=20261122_v23',
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
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/') ||
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

  // Network-first with cache fallback for static assets
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
