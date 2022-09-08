self.addEventListener('install', function (event) {
  console.log('[Service worker] installing service worker...', event);
  // as soon as the service worker installation finishes, we've fetch listener
  event.waitUntil(
    caches.open('static').then(function (cache) {
      console.log('[Service Worker] Precaching app shell...');
      cache.add('/')
      cache.add('/index.html');
      cache.add('/src/js/app.js');
    })
  );
});
self.addEventListener('activate', function (event) {
  console.log('[Service worker] activating service worker...', event);
  return self.clients.claim(); // it ensures that whether service workers are installed or activated correctly or not.
});
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches
      .match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request);
        }
      })
      .catch()
  );
});
