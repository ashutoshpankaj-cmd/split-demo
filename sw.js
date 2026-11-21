// network-first so demo updates show up; cache only for offline
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open('v2').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request))));
