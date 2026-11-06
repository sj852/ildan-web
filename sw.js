// 네트워크가 되면 항상 최신 파일을 받고, 끊겼을 때만 저장해 둔 파일로 연다.
const CACHE = "ildan-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon128.png", "icon180.png", "icon192.png", "icon512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  event.respondWith(fetch(request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
    }
    return response;
  }).catch(async () => (await caches.match(request, { ignoreSearch: true }))
    ?? (request.mode === "navigate" ? caches.match("./") : Response.error())));
});
