const cacheName = 'monotheist-public-reader-1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(['./public.html', './reader.css', './reader-list.js'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.delete('monotheist-v2').then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok) {
        try { await cache.put(request, response.clone()); } catch {}
      }
      return response;
    } catch (error) {
      const saved = await cache.match(request, {ignoreSearch: true});
      if (saved) return saved;
      throw error;
    }
  })());
});
