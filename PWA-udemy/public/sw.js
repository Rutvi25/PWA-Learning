var CACHE_STATIC_NAME = 'static-v14';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

self.addEventListener('install', function (event) {
  console.log('[Service worker] installing service worker...', event);
  // as soon as the service worker installation finishes, we've fetch listener
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(function (cache) {
      console.log('[Service Worker] Precaching app shell...');
      cache.addAll(STATIC_FILES);
    })
  );
});
self.addEventListener('activate', function (event) {
  console.log('[Service worker] activating service worker...', event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service worker] removing old cache...', key);
            return caches.delete(key);
          }
        })
      );
    })
  ); // it'll wait until the clean up will be done, so that the fetch won't serve results from old cache
  return self.clients.claim(); // it ensures that whether service workers are installed or activated correctly or not.
});

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}
// Strategy: Cache then Network
self.addEventListener('fetch', function (event) {
  var url = 'https://httpbin.org/get';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
        return fetch(event.request).then(function (res) {
          cache.put(event.request, res.clone());
          return res;
        });
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME).then(function (cache) {
                if (event.request.url.indexOf('/help')) {
                  return cache.match('/offline.html');
                }
              });
            });
        }
      })
    );
  }
});

// self.addEventListener('fetch', function (event) {
//   if (!(event.request.url.indexOf('http') === 0)) return;
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request).then(function (res) {
//           return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
//             cache.put(event.request.url, res.clone());
//             return res;
//           })
//         })
//         .catch(function(err) {
//           return caches.open(CACHE_STATIC_NAME)
//             .then(function(cache) {
//               return cache.match('/offline.html')
//             })
//         })
//       }
//     })
//   );
// });

// Strategy: Network with cache fallback
// self.addEventListener('fetch', function (event) {
//   if (!(event.request.url.indexOf('http') === 0)) return;
//   event.respondWith(
//     fetch(event.request)
//       .then(function (res) {
//         return fetch(event.request).then(function (res) {
//           return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
//             cache.put(event.request.url, res.clone());
//             return res;
//           });
//         });
//       })
//       .catch(function (err) {
//         return caches.match(event.request).then(function (response) {
//           if (response) {
//             return response;
//           }
//         });
//       })
//   );
// });

// Strategy: Cache Only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Strategy: Network Only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });
