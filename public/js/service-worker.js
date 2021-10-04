// constants that are global 
const APP_PREFIX = 'FoodFest-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/js/index.js',
  '/js/indexDB.js',
  '/manifest.json',
  '/css/styles.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// installs the service worker and adds the files to the precache so the app can use the cache
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('cache currently installing : ' + CACHE_NAME)
      return cache.addAll(FILES_TO_CACHE)
    })
  )
});

// activates the service worker
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);
      // returns a promise that will settle when the older version of the cache have been eliminated
      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeeplist.indexOf(key) === -1) {
          console.log('cache being deleted : ' + keyList[i]);
          return caches.delete(keyList[i]);
        }
      })
      );
    })
  )
});

// retrieves the cache information
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        // if cache is available, respond with cache
        console.log('cache completing response handshake with : ' + e.request.url)
        //   console.log(e.request.url)
        return request
      } else {       // if there are no cache, try fetching request
        console.log('file has not cached, fetching : ' + e.request.url)
        //   console.log(e.request.url)
        return fetch(e.request)
      }

      // You can omit if/else for console.log & put one line below like this too.
      // return request || fetch(e.request)
    })
  )
});