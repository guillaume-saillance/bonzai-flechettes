/*
 * Service worker de Bonzaï Fléchettes.
 * Rend l'application installable et utilisable hors-ligne en mettant ses
 * fichiers en cache. Stratégie : « stale-while-revalidate » — on répond
 * immédiatement avec la version en cache (rapide, marche hors-ligne) tout en
 * récupérant en arrière-plan une version fraîche pour la prochaine visite.
 *
 * ⚠️ Pensez à incrémenter CACHE (ex. v2, v3…) à chaque mise à jour des
 * fichiers, sinon les anciennes versions resteront servies depuis le cache.
 */

const CACHE = "bonzai-v4";

// Fichiers de l'« app shell » préchargés dès l'installation.
const ASSETS = [
  "./",
  "./index.html",
  "./partie.html",
  "./classement.html",
  "./regles.html",
  "./style.css",
  "./app.js",
  "./ui.js",
  "./anim.js",
  "./onboarding.js",
  "./logo.svg",
  "./icone-192.png",
  "./icone-512.png",
  "./apple-touch-icon.png",
  "./manifest.json",
];

// Installation : on précharge l'app shell.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciens caches.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cles) =>
        Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Requêtes : cache d'abord, puis mise à jour en arrière-plan.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cache) => {
      const reseau = fetch(e.request)
        .then((res) => {
          // On met en cache les réponses valides (y compris les polices
          // Google, qui deviennent ainsi disponibles hors-ligne).
          if (res && (res.ok || res.type === "opaque")) {
            const copie = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copie));
          }
          return res;
        })
        .catch(() => cache);
      return cache || reseau;
    })
  );
});
