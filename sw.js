/* CroAr · service worker: funciona sin conexión */
const VERSION = 'croar-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'css/styles.css', 'js/icons.js', 'js/data.js', 'js/mapa-data.js', 'js/app.js', 'assets/fonts/catamaran-latin.woff2', 'assets/fonts/catamaran-latin-ext.woff2', 'assets/app/favicon.svg', 'assets/app/icon-192.png', 'assets/app/icon-512.png', 'assets/app/apple-touch-icon.png'];
const FOTOS = ['assets/img/abril-mar.jpg', 'assets/img/almuerzo.jpg', 'assets/img/amigos-ciudad.jpg', 'assets/img/amigos-mirador.jpg', 'assets/img/banderas.jpg', 'assets/img/bote.jpg', 'assets/img/camino-isla.jpg', 'assets/img/cine-drazen.jpg', 'assets/img/cine-hotel-pula.jpg', 'assets/img/croaticum-aula.jpg', 'assets/img/croaticum-clase.jpg', 'assets/img/dubrovnik-palacio.jpg', 'assets/img/dubrovnik-vista.jpg', 'assets/img/folclore-trajes.jpg', 'assets/img/gobierno-domovina.jpg', 'assets/img/grupo-domovina.jpg', 'assets/img/hogar-croata.jpg', 'assets/img/kolo-velebit.jpg', 'assets/img/peka.jpg', 'assets/img/priznanje.jpg', 'assets/img/san-marcos.jpg', 'assets/img/stradun-bandera.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(async (c) => {
    await c.addAll(SHELL);
    await Promise.all(FOTOS.map((f) => c.add(f).catch(() => null)));
  }).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  /* Páginas y código: primero la red (para ver cambios), si no hay conexión, la copia guardada. */
  if (req.mode === 'navigate' || /\.(html|js|css|webmanifest)$/.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
    return;
  }
  /* Fotos, íconos y tipografía: primero la copia guardada. */
  e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return res; })));
});
