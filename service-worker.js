// ── MonBudget Service Worker ──────────────────────────────────────────────────
// Version : incrementez à chaque mise à jour pour forcer le refresh
const CACHE_NAME = "monbudget-v2";

// Fichiers à mettre en cache pour le mode hors-ligne
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ── Installation : mise en cache des assets statiques ─────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installation en cours...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Mise en cache des fichiers statiques");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

// ── Activation : suppression des anciens caches ───────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activation...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Suppression ancien cache :", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Prend le contrôle immédiatement de tous les clients
  self.clients.claim();
});

// ── Interception des requêtes : Cache First avec fallback réseau ───────────────
self.addEventListener("fetch", (event) => {
  // Ignore les requêtes non-GET
  if (event.request.method !== "GET") return;

  // Ignore les requêtes vers des APIs externes
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Trouvé dans le cache → retour immédiat
        return cachedResponse;
      }

      // Pas dans le cache → requête réseau + mise en cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Hors-ligne et pas en cache → page offline de fallback
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// ── Message handler : forcer la mise à jour ───────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
