self.addEventListener('install', function (event) {
  console.log('[Service worker] installing service worker...', event);
});
self.addEventListener('activate', function (event) {
  console.log('[Service worker] activating service worker...', event);
  return self.clients.claim(); // it ensures that whether service workers are installed or activated correctly or not.
});
self.addEventListener('fetch', function (event) {
  event.respondWith(fetch(event.request));
});
