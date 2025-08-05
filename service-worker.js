const CACHE_NAME = 'strikeR-cache-v1';

const urlsToCache = [
  '/tool/',
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

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
});
