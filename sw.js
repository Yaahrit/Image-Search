/* ============================================================
   SERVICE WORKER — Offline Caching & PWA Support
   ============================================================ */

const CACHE_NAME = 'vision-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './css/variables.css',
  './css/base.css',
  './css/animations.css',
  './css/layout.css',
  './css/components.css',
  './js/config.js',
  './js/utils.js',
  './js/api.js',
  './js/ui.js',
  './js/app.js',
  './js/search.js',
  './js/filters.js',
  './js/modal.js',
  './js/favorites.js',
  './js/voice.js',
  './js/theme.js',
  './js/i18n.js',
  './js/shortcuts.js'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Don't cache Unsplash API calls (use network)
  if (event.request.url.includes('api.unsplash.com')) return;

  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return cacheRes || fetch(event.request);
    })
  );
});
