const CACHE_NAME = 'splp-tool-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/pdf-generator.js',
  './js/data.js',
  './js/exif.js',
  './assets/Color%20logo%20-%20no%20background%20(px%20reduction).png',
  './assets/SP Bolt 400x400.png',
  './assets/es12.png'
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
      .then(response => response || fetch(event.request))
  );
});
