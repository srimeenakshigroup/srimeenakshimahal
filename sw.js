// ── Sri Meenakshi Mahal PWA — Service Worker ──────────────
const VERSION   = "smm-v1.1";
const CACHE     = VERSION + "-shell";
const OFFLINE_Q = "smm-offline-queue";

const SHELL = ["./index.html", "./manifest.json"];

// ── Install: cache app shell ───────────────────────────────
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ────────────────────────────
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: shell from cache, API pass-through ──────────────
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Always network-first for the Apps Script API
  if (url.hostname.includes("script.google.com")) {
    e.respondWith(fetch(e.request).catch(() =>
      new Response(JSON.stringify({ error: "offline" }), {
        headers: { "Content-Type": "application/json" }
      })
    ));
    return;
  }

  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }))
      .catch(() => caches.match("./index.html"))
  );
});

// ── Background sync: flush offline queue ──────────────────
self.addEventListener("sync", e => {
  if (e.tag === "smm-sync") {
    e.waitUntil(flushQueue());
  }
});

async function flushQueue() {
  // Queue is managed by the main thread; SW just signals readiness
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach(c => c.postMessage({ type: "FLUSH_QUEUE" }));
}

// ── Push messages from main thread ────────────────────────
self.addEventListener("message", e => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
