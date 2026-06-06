const CACHE = 'manfra-shop-v1';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./MANFRA-SHOP.html']))
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
  // Laisser passer Supabase et CDN
  if (url.hostname.includes('supabase.co') || url.hostname.includes('googleapis') ||
      url.hostname.includes('jsdelivr') || url.hostname.includes('cdnjs') ||
      url.hostname.includes('fonts.g')) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(r => r || caches.match('./MANFRA-SHOP.html'))
    )
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
