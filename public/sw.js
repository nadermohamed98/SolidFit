
/**
 * Service Worker for SolidFit
 */

const CACHE_NAME = 'solidfit-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/variables.css',
  '/assets/css/base.css',
  '/assets/css/layout.css',
  '/assets/css/components.css',
  '/assets/css/animations.css',
  '/assets/css/responsive.css',
  '/assets/js/app.js',
  '/assets/js/router.js',
  '/assets/js/theme.js',
  '/assets/js/navigation.js',
  '/assets/js/utils.js',
  '/assets/js/storage.js',
  '/assets/js/components/sidebar.js',
  '/assets/js/components/navbar.js',
  '/assets/js/components/bottomNav.js',
  '/assets/js/components/progressRing.js',
  '/assets/js/components/modal.js',
  '/assets/js/pages/dashboard.js',
  '/assets/js/pages/nutrition.js',
  '/assets/js/pages/workout.js',
  '/assets/js/pages/journal.js',
  '/assets/js/pages/progress.js',
  '/assets/js/pages/coach.js',
  '/assets/js/pages/settings.js'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

