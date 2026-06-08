const CORE_D_CACHE = "core-d-45-v7-5";
const CORE_D_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CORE_D_CACHE).then(cache => cache.addAll(CORE_D_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CORE_D_CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // CRÍTICO: não interceptar Google Apps Script / googleusercontent / chamadas externas.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CORE_D_CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
