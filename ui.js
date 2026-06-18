/*
 * Habillage partagé par toutes les pages : barre d'application (logo +
 * wordmark) et barre d'onglets (en bas sur mobile, en haut sur desktop).
 * Centralisé ici pour rester cohérent et éviter la duplication.
 */

const PAGES = [
  { id: "organisation", href: "index.html", ic: "👥", label: "Organisation" },
  { id: "partie", href: "partie.html", ic: "🎯", label: "Partie" },
  { id: "classement", href: "classement.html", ic: "🏆", label: "Classement" },
  { id: "regles", href: "regles.html", ic: "📖", label: "Règles" },
];

// Pastille avatar d'un joueur (emblème, ou initiales par défaut).
function avatarHTML(joueur, px = 28) {
  const couleur = joueur.couleur || "#003049";
  const contenu = joueur.embleme ? joueur.embleme : initiales(joueur.nom);
  const fs = joueur.embleme ? Math.round(px * 0.56) : Math.round(px * 0.4);
  return `<span class="avatar" style="background:${couleur};width:${px}px;height:${px}px;font-size:${fs}px">${contenu}</span>`;
}

function monterChrome(pageActive) {
  const header = document.querySelector("header.app-bar");
  if (header) {
    header.innerHTML = `
      <img class="logo" src="logo.svg" alt="Bonzaï" width="40" height="40" />
      <div class="wordmark">
        <h1 class="nom">Bonzaï<span class="nom-suite">Fléchettes</span></h1>
        <span class="tag">Qui sera le meilleur ?</span>
      </div>`;
  }

  const nav = document.querySelector("nav.tabbar");
  if (nav) {
    nav.innerHTML = PAGES.map(
      (p) => `
      <a class="tab${p.id === pageActive ? " actif" : ""}" href="${p.href}">
        <span class="ic">${p.ic}</span><span class="lib">${p.label}</span>
      </a>`
    ).join("");
  }

  construirePied();
}

// URL publique de l'app pour le partage. Une fois hébergée (HTTP/HTTPS), on
// partage automatiquement la racine de l'app (le dossier, qui charge l'accueil).
// Le repli ne sert qu'en ouverture locale « file:// ».
const URL_PARTAGE = location.protocol.startsWith("http")
  ? location.origin + location.pathname.replace(/[^/]*$/, "")
  : "https://bonzai-flechettes.app";
const TEXTE_PARTAGE = "Bonzaï Fléchettes — Qui sera le meilleur aux fléchettes ? 🎯";

// Logos officiels (chemins SVG, viewBox 0 0 24 24). bg = fond du bouton,
// fg = couleur du logo.
const RESEAUX = [
  {
    id: "copier", titre: "Copier le lien", bg: "#fff", fg: "#5d7180",
    svg: '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
  },
  {
    id: "whatsapp", titre: "WhatsApp", bg: "#fff", fg: "#25D366",
    svg: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>',
  },
  {
    id: "facebook", titre: "Facebook", bg: "#fff", fg: "#1877F2",
    svg: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
  },
  {
    id: "instagram", titre: "Instagram", bg: "#fff", fg: "#E4405F",
    svg: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>',
  },
  {
    id: "snapchat", titre: "Snapchat", bg: "#FFFC00", fg: "#111",
    svg: '<path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.298 1.104.298.234 0 .384-.06.465-.105l-.044-.811c-.104-1.628-.235-3.654.293-4.847C7.711 1.069 11.071.793 12.045.793h.161z"/>',
  },
  {
    id: "linkedin", titre: "LinkedIn", bg: "#fff", fg: "#0A66C2",
    svg: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  },
  {
    id: "x", titre: "X (Twitter)", bg: "#fff", fg: "#000",
    svg: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  },
  {
    id: "telegram", titre: "Telegram", bg: "#fff", fg: "#26A5E4",
    svg: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
  },
];

function construirePied() {
  const pied = document.querySelector("footer");
  if (!pied) return;
  const sujet = encodeURIComponent("Idée pour Bonzaï Fléchettes");
  const corps = encodeURIComponent(
    "Bonjour,\n\nJ'ai une idée pour améliorer l'application :\n\n"
  );
  const lienMail = `mailto:guillaume@saillance.cc?subject=${sujet}&body=${corps}`;
  pied.innerHTML = `
    <div class="pied">
      <p class="pied-idee">💡 Une idée pour améliorer l'application&nbsp;?
        <a href="${lienMail}">Dites-le-nous</a> —
        <a href="mailto:guillaume@saillance.cc">guillaume@saillance.cc</a></p>
      <div class="partage">
        ${RESEAUX.map(
          (r) =>
            `<button class="part" data-net="${r.id}" title="${r.titre}" aria-label="${r.titre}" style="background:${r.bg};color:${r.fg}"><svg viewBox="0 0 24 24" aria-hidden="true">${r.svg}</svg></button>`
        ).join("")}
      </div>
      <span class="pied-note">🔒 Vos données restent privées, sur cet appareil.</span>
    </div>`;
  pied
    .querySelectorAll(".part")
    .forEach((b) => b.addEventListener("click", () => partager(b.dataset.net)));
}

function partager(net) {
  const url = URL_PARTAGE;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(TEXTE_PARTAGE);
  const liens = {
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };

  if (net === "copier") {
    copierLien(url);
    return;
  }
  // Instagram et Snapchat n'ont pas de lien de partage web : on utilise le
  // partage natif du téléphone si possible, sinon on copie le lien.
  if (net === "instagram" || net === "snapchat") {
    if (navigator.share) {
      navigator.share({ title: TEXTE_PARTAGE, url }).catch(() => {});
    } else {
      copierLien(url, `Lien copié — collez-le sur ${net} 😉`);
    }
    return;
  }
  window.open(liens[net], "_blank", "noopener");
}

function copierLien(url, message) {
  const msg = message || "Lien copié dans le presse-papier !";
  const ok = () => {
    if (typeof toast === "function") toast("🔗", msg);
    else alert(msg);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(ok, ok);
  else ok();
}

// Service worker : rend l'application installable et utilisable hors-ligne.
// Ne fonctionne qu'en HTTP(S) (pas en ouverture locale « file:// »).
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });

  // Mise à jour propre : si la page est déjà contrôlée par une ancienne
  // version, on recharge une fois quand la nouvelle prend le relais. Évite
  // l'état « moitié ancienne / moitié neuve » après un déploiement.
  if (navigator.serviceWorker.controller) {
    let majEnCours = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (majEnCours) return;
      majEnCours = true;
      window.location.reload();
    });
  }
}

// Stockage durable : demande au navigateur de ne pas purger automatiquement
// les données (utile surtout sur iOS, qui purge sinon après ~7 jours d'inactivité).
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}
