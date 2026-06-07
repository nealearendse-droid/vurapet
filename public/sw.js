const CACHE_NAME = "vurapet-cache-v1";

const URLS_TO_CACHE = [
  "/",
  "/dashboard",
  "/dashboard/nutrition",
  "/pets/safe-food",
  "/auth/login",
  "/auth/signup",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("VuraPet: Caching pages for offline use");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle http and https requests - ignore chrome-extension and others
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache GET requests
        if (event.request.method !== "GET") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});