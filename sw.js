// Vera service worker v1 — app files network-first; AI and search calls are never cached
const CACHE_NAME = 'vera-v1';
const APP_SHELL = ['./','./index.html','./vera.js','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.all(APP_SHELL.map(u =>
    fetch(new Request(u,{cache:'reload'})).then(r => { if (r.ok) return c.put(u,r); }).catch(()=>{})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, cp)).catch(()=>{}); } return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
