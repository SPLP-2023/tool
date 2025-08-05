const CACHE_NAME = 'sr-cache-v1';

const ASSETS_TO_CACHE = [
  // HTML pages
  '/',
  '/index.html',
  '/reports.html',
  '/risk-assessment.html',
  '/survey.html',
  '/t&i-report.html',
  '/tools.html',

  // Manifest & Icons
  '/manifest.json',
  '/icons/SP-Bolt-192.png',
  '/icons/SP-Bolt-512.png',

  // CSS (adjust filename if different)
  '/css/style.css',

  // JavaScript (all your listed scripts)
  '/js/app.js',
  '/js/auto-save.js',
  '/js/data.js',
  '/js/exif.js',
  '/js/pdf-generator-risk.js',
  '/js/pdf-generator-shared.js',
  '/js/pdf-generator-survey.js',
  '/js/pdf-generator.js',
  '/js/risk-assessment.js',
  '/js/survey-report.js',
  '/js/touch-signature.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
