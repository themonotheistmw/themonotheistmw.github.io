const cacheName = 'monotheist-reader-v3';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(['./','./index.html','./content.json'])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.delete('monotheist-v2').then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin) return;
  event.respondWith((async()=>{
    const cache=await caches.open(cacheName);
    try {
      const response=await fetch(event.request);
      if(response.ok) await cache.put(event.request,response.clone());
      return response;
    } catch(error) {
      const saved=await cache.match(event.request);
      if(saved) return saved;
      throw error;
    }
  })());
});
