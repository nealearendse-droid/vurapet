const CACHE_NAME = "vurapet-cache-v1";

// These are the pages/files we save for offline use
const URLS_TO_CACHE = [
  "/",
  "/dashboard",
  "/dashboard/nutrition",
  "/pets/safe-food",
  "/auth/login",
  "/auth/signup",
  "/manifest.json"
];

// When the service worker installs, cache everything
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("VuraPet: Caching pages for offline use");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Remove old caches when we update
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// When someone loads a page: try internet first, fall back to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save a fresh copy in cache while we're online
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => {
        // No internet? Serve from cache instead
        return caches.match(event.request);
      })
  );
});