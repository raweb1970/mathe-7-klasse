// Service Worker für "Mathe fit für die 8." – ermöglicht Nutzung ohne Internetverbindung.
//
// WICHTIG bei einem Update der App: CACHE_NAME hochzählen (z.B. "mathe7-v2"),
// sonst liefert der Service Worker weiterhin die alte, zwischengespeicherte Version aus.
const CACHE_NAME = "mathe7-v1";
const APP_FILES = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategie "stale-while-revalidate": zeigt sofort die gespeicherte Version an
// (funktioniert auch offline) und lädt im Hintergrund eine aktuelle Version nach,
// die dann beim nächsten Öffnen bereitsteht.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
