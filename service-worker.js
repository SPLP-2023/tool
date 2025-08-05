const CACHE_NAME = 'strikeR-cache-v1';

const urlsToCache = [
  '/tool/index.html',
  '/tool/reports.html',
  '/tool/survey.html',
  '/tool/t&i-report.html',
  '/tool/risk-assessment.html',
  '/tool/tools.html',
  '/tool/css/styles.css',
  '/tool/js/app.js',
  '/tool/icons/icon-192x192.png',
  '/tool/icons/icon-512x512.png'
];

// Install event: cache files and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate new service worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.error(`❌ Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
});

// Fetch event: serve cached files or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Activate event: clean up old caches and take control of clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages immediately
});
