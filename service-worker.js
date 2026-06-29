const CACHE = 'miaula-v3';
const ASSETS = [
  '/miaula/',
  '/miaula/index.html',
  '/miaula/app.js',
  '/miaula/style.css',
  '/miaula/manifest.json',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Llamadas a la API de Anthropic siempre van a la red
  if(e.request.url.includes('anthropic.com') || e.request.url.includes('serpapi.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/miaula/')))
  );
});
