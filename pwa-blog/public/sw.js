console.log('from public folder');
let cacheData = 'appV1';
this.addEventListener('install', (event) => {
  event.waitUntill(
    caches.open(cacheData).then((cache) => {
      cache.addAll([
        '/static/js/bundle.js',
        '/static/js/main.chunk.js',
        '/static/js/0.chunk.js',
        '/index.html',
        '/',
      ]);
    })
  );
});

this.addEventListener('fetch', (event) => {
  console.warn('>>>url', event.request.url);
  if (!navigator.onLine) {
    if (event.request.url === 'http://localhost:3000/manifest.json') {
    event.waitUntill(
      this.registration.showNotification('notification', {
        body: 'Internet not working!',
        icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyRcKIq3ZLxA9Zg6mrPJbmzdvZksYWe4sHpQ&usqp=CAU.png',
      })
    );
  }
    event.respondWith(
      caches.match(event.request).then((result) => {
        if (result) {
          return result;
        }
        let requestUrl = event.request.clone();
        return fetch(requestUrl);
      })
    );
  }
});
