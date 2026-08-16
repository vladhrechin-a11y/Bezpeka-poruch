const CACHE_NAME = "bezpeka-poruch-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })

  );

  self.skipWaiting();

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })

  );

  self.clients.claim();

});


self.addEventListener("fetch", event => {

  const request = event.request;

  /*
   * Google Apps Script не кешуємо.
   * Дані таблиці повинні бути актуальними.
   */

  if (
    request.url.includes("script.google.com")
  ) {

    event.respondWith(
      fetch(request)
    );

    return;

  }


  /*
   * Для самої програми:
   * спочатку кеш,
   * якщо немає — Інтернет.
   */

  event.respondWith(

    caches.match(request)
      .then(cachedResponse => {

        if (cachedResponse) {

          return cachedResponse;

        }

        return fetch(request)
          .then(response => {

            if (
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ) {

              return response;

            }

            const responseClone =
              response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  request,
                  responseClone
                );

              });

            return response;

          });

      })

  );

});
