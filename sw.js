// ─── SERVICE WORKER DE L'APPLICATION 327th ──────────────────────
// Rend le site installable comme application.
// Stratégie « réseau d'abord » : on charge toujours la dernière
// version du site ; la copie en cache ne sert que hors connexion.
// Les requêtes vers d'autres domaines (Firebase, polices...) ne
// passent pas par ici.
const CACHE = '327th-v1';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(['./', './index.html', './Logo_327th.png', './icons/327th-192.png']);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html').then(function (home) { return home || Response.error(); });
        return Response.error();
      });
    })
  );
});
