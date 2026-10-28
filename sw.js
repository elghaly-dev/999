/* Satar service worker. It keeps Satar on this phone so it opens with no
   internet after the first visit. It only touches files from this same site
   and never contacts any other address. Bump CACHE when the files change. */
var CACHE = 'satar-v3';
var CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/eye-256.webp',
  'fonts/fonts.css',
  'fonts/amiri-400-italic-arabic.woff2',
  'fonts/amiri-400-italic-latin.woff2',
  'fonts/amiri-400-normal-arabic.woff2',
  'fonts/amiri-400-normal-latin.woff2',
  'fonts/cormorant-garamond-400-italic-cyrillic.woff2',
  'fonts/cormorant-garamond-400-italic-latin.woff2',
  'fonts/cormorant-garamond-400-normal-cyrillic.woff2',
  'fonts/cormorant-garamond-400-normal-latin.woff2',
  'fonts/jost-300-normal-cyrillic.woff2',
  'fonts/jost-300-normal-latin.woff2',
  'fonts/marcellus-400-normal-latin.woff2',
  'v3/index.html',
  'v3/arab.webmanifest',
  'v3/plain.html',
  'v3/plain.webmanifest',
  'v3/christian.html',
  'v3/christian.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k.indexOf('satar-') === 0 && k !== CACHE;
      }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(req).then(function (res) {
        if (res && res.ok && res.type === 'basic' && !res.redirected) c.put(req, res.clone());
        return res;
      }).catch(function () { return null; });
      if (hit) { e.waitUntil(fresh); return hit; }
      return fresh.then(function (res) {
        if (res) return res;
        if (req.mode === 'navigate') return c.match('./');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    });
  }));
});
