const APP_NAME = "Budget-Tracker"
const CACHE_NAME = "Version-01";
const DATA_CACHE_NAME = APP_NAME + CACHE_NAME;
const FILES_TO_CACHE = [
  '/',
  './index.html',
  './styles.css',
  './index.js',
  './db.js',
  './manifest.webmanifest',
  './icons/icon-72x72.png',
  './icons/icon-512x512.png',
  './icons/icon-384x384.png',
  './icons/icon-192x192.png',
  './icons/icon-152x152.png',
  './icons/icon-144x144.png',
  './icons/icon-128x128.png',
  './icons/icon-96x96.png',

];


self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});


self.addEventListener("activate", function (evt) {

  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
