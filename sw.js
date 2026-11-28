// Service worker Riyadh Meubel POS
// Tujuan: membuat aplikasi bisa di-install dan membuka tampilan dasar saat sinyal putus.
// Data (Google Apps Script) TIDAK PERNAH disimpan di cache, supaya transaksi selalu terbaru.
// Naikkan angka VERSI setiap kali Anda mengubah file aplikasi agar semua perangkat ikut memperbarui.
const VERSI = 'v2';
const CACHE = 'riyadh-pos-' + VERSI;
const FILE_DASAR = [
  './',
  './index.html',
  './config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILE_DASAR))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('riyadh-pos-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Hanya tangani GET milik situs sendiri. Apps Script, logo GitHub, layanan IP, dsb. lewat jaringan biasa.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Jaringan dulu, cache hanya sebagai cadangan saat offline (selalu dapat versi terbaru bila online).
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const salinan = res.clone();
          caches.open(CACHE).then(c => c.put(req, salinan));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
