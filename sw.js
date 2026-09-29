/* NARA — Service Worker v2
   - HTML/JS/CSS/JSON: network-first (update langsung terlihat), cache sebagai cadangan offline.
   - Gambar & font: cache-first / stale-while-revalidate.
   - Navigasi saat offline tanpa cache: tampilkan offline.html. */
const VERSION = 'nara-v2-20260929h';
const CORE = [
  './', 'index.html', 'offline.html', 'manifest.json', 'script.js',
  'styles/nara.bundle.css',
  'assets/images/app-icon-192.png', 'assets/images/app-icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function put(req, res) {
  if (res && (res.ok || res.type === 'opaque')) {
    const copy = res.clone();
    caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  const isImage = req.destination === 'image';

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => put(req, r)).catch(() =>
        caches.match(req).then((m) => m || caches.match('index.html') || caches.match('offline.html'))
          .then((m) => m || caches.match('offline.html'))
      )
    );
    return;
  }

  if (isImage || isFont) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const net = fetch(req).then((r) => put(req, r)).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  if (sameOrigin) {
    e.respondWith(fetch(req).then((r) => put(req, r)).catch(() => caches.match(req)));
  }
});
