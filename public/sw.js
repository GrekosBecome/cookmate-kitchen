// Killer Service Worker - Self-destructs and clears all caches
self.addEventListener('install', (event) => {
  console.log('[Killer SW] Installing and taking over immediately');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Killer SW] Activated - clearing all caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[Killer SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Killer SW] All caches cleared - unregistering self');
      return self.registration.unregister();
    }).then(() => {
      console.log('[Killer SW] Unregistered - reloading page');
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});
