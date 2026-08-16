// ══════════════════════════════════════════════════════════════
// Service Worker — çevrimdışı çalışma
// Strateji: ağ-öncelikli (network-first). Ağ varken her zaman güncel dosya
// gelir ve önbellek tazelenir; ağ yokken önbellekten servis edilir.
// Yalnız aynı origin cache'lenir — Chart.js CDN'i ve Gemini API ağa bırakılır
// (Chart yüklenemezse app.js grafiksiz devam ediyor, veri localStorage'da).
// ══════════════════════════════════════════════════════════════
const CACHE = 'ay-butce-v1';
const ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './calc.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // CDN + Gemini: dokunma
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(r => r || caches.match('./index.html'))
      )
  );
});
