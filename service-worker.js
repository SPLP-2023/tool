// Update this version number whenever you make changes to force cache refresh
const CACHE_NAME = 'strikeR-cache-v2.0.3';

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
  '/tool/js/auto-save.js',
  '/tool/js/data.js',
  '/tool/js/pdf-generator.js',
  '/tool/js/pdf-generator-shared.js',
  '/tool/js/pdf-generator-survey.js',
  '/tool/js/pdf-generator-risk.js',
  '/tool/js/survey-report.js',
  '/tool/js/t&i-pdf-generator.js',
  '/tool/js/touch-signature.js',
  '/tool/js/risk-assessment.js',
  '/tool/js/exif.js',
  '/tool/icons/icon-192x192.png',
  '/tool/icons/icon-512x512.png'
];

// Install event: cache files and activate immediately
self.addEventListener('install', event => {
  console.log('SW installing version:', CACHE_NAME);
  self.skipWaiting(); // Activate new service worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW caching files for version:', CACHE_NAME);
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

// Fetch event: serve cached files or fetch from network with cache-busting for app files
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // If we have a cached version, check if it's a JS/CSS file that might need updating
      if (response) {
        const url = event.request.url;
        const isAppFile = url.includes('/js/') || url.includes('/css/') || url.includes('.html');
        
        // For app files, also try to fetch fresh version in background
        if (isAppFile) {
          // Serve cached version immediately but update cache in background
          fetch(event.request).then(freshResponse => {
            if (freshResponse && freshResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, freshResponse.clone());
              });
            }
          }).catch(() => {
            // Network failed, cached version is fine
            console.log('Network failed for:', url);
          });
          return response;
        }
        return response;
      }
      
      // No cached version, fetch from network
      return fetch(event.request).then(fetchResponse => {
        // Don't cache non-successful responses
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }

        // Clone the response for caching
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return fetchResponse;
      }).catch(error => {
        console.error('Fetch failed for:', event.request.url, error);
        // Network failed and no cache, return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/tool/index.html');
        }
        // For other resources, return a basic response to prevent errors
        return new Response('', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});

// Activate event: clean up old caches and take control of clients
self.addEventListener('activate', event => {
  console.log('SW activating version:', CACHE_NAME);
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ])
  );
  
  // Notify all clients that new version is active
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: CACHE_NAME
      });
    });
  });
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});
