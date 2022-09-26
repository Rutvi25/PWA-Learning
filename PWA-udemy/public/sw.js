importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v27';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
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

var dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
});

// cleaning or trimming the dynamic cache
// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName).then(function (cache) {
//     return cache.keys().then(function (keys) {
//       if (keys.length > maxItems) {
//         cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
//       }
//     });
//   });
// }

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
  var url = 'https://pwagram-d7a1c-default-rtdb.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) {
    // if (!(event.request.url.indexOf('http') === 0)) return;
    event.respondWith(
      fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clearAllData('posts')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    // if (!(event.request.url.indexOf('http') === 0)) return;
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHE_DYNAMIC_NAME).then(function (cache) {
                // trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              return caches.open(CACHE_STATIC_NAME).then(function (cache) {
                if (event.request.headers.get('accept').includes('text/html')) {
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

self.addEventListener('sync', function (event) {
  console.log('[Service Worker] background syncing', event);
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] syncing new posts');
    event.waitUntil(
      readAllData('sync-posts').then(function (data) {
        for (var dt of data) {
          fetch(
            'https://pwagram-d7a1c-default-rtdb.firebaseio.com/posts.json',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image:
                  'https://firebasestorage.googleapis.com/v0/b/pwagram-d7a1c.appspot.com/o/sf-boat.jpg?alt=media&token=21452f3d-3895-45d2-9241-ea2bb7d327c8',
              }),
            }
          )
            .then(function (res) {
              console.log('Sent data', res);
              if (res.ok) {
                res.json().then(function (resData) {
                  deleteItemFromData('sync-posts', resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log('Error while sending data', err);
            });
        }
      })
    );
  }
});
// notification interaction - clicks
self.addEventListener('notificationclick', function (event) {
  var notification = event.notification;
  var action = event.action;
  console.log(notification);
  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
  }
});
// notification interaction - clicks
self.addEventListener('notificationclose', function (event) {
  console.log('Notification was closed', event);
});
