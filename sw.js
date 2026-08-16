const CACHE_NAME = "bezpeka-poruch-v10";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(names => {

      return Promise.all(
        names.map(name => caches.delete(name))
      );

    }).then(() => {

      return self.clients.claim();

    })

  );

});

self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)
      .catch(() => caches.match(event.request))

  );

});
