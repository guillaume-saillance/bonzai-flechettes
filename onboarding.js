/*
 * Onboarding de Pilou.
 * S'affiche automatiquement au tout premier lancement pour expliquer comment
 * installer l'application sur l'appareil et sauvegarder ses données.
 * Re-consultable ensuite via openOnboarding() (bouton sur la page Règles).
 */

const ONBOARDING_KEY = "bonzai-onboarding-vu";

// Invite d'installation native (Chrome / Edge / Android) : on la capte pour
// pouvoir la déclencher depuis notre propre bouton.
let _inviteInstall = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _inviteInstall = e;
  document
    .querySelectorAll("[data-install-natif]")
    .forEach((b) => (b.hidden = false));
});
window.addEventListener("appinstalled", () => {
  _inviteInstall = null;
});

// L'app tourne-t-elle déjà en mode installé (plein écran) ?
function appInstallee() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function plateforme() {
  const ua = navigator.userAgent || "";
  // Les iPad récents se présentent comme des Mac : on les repère au tactile.
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document))
    return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

// Instructions d'installation adaptées à l'appareil.
function blocInstall() {
  if (appInstallee()) {
    return `<p class="ob-note ob-ok">✅ C'est déjà fait&nbsp;: l'application est installée sur cet appareil.</p>`;
  }
  const p = plateforme();
  if (p === "ios") {
    return `
      <ol class="ob-liste">
        <li>Touche le bouton <strong>Partager</strong> <span class="ob-ic">⬆️</span> en bas de Safari.</li>
        <li>Choisis <strong>«&nbsp;Sur l'écran d'accueil&nbsp;»</strong>.</li>
        <li>Valide avec <strong>Ajouter</strong>.</li>
      </ol>
      <p class="ob-note">⚠️ Sur iPhone, l'installation ne fonctionne que depuis <strong>Safari</strong>.</p>`;
  }
  if (p === "android") {
    return `
      <button class="btn-principal" type="button" data-install-natif hidden style="margin-bottom:.7rem">📲 Installer l'application</button>
      <ol class="ob-liste">
        <li>Ouvre le menu <strong>⋮</strong> (en haut à droite de Chrome).</li>
        <li>Touche <strong>«&nbsp;Installer l'application&nbsp;»</strong> (ou «&nbsp;Ajouter à l'écran d'accueil&nbsp;»).</li>
      </ol>`;
  }
  return `
    <button class="btn-principal" type="button" data-install-natif hidden style="margin-bottom:.7rem">📲 Installer l'application</button>
    <ol class="ob-liste">
      <li>Clique l'icône d'<strong>installation</strong> <span class="ob-ic">⊕</span> à droite de la barre d'adresse.</li>
      <li>Ou&nbsp;: menu <strong>⋮</strong> → <strong>«&nbsp;Installer Pilou&nbsp;»</strong>.</li>
    </ol>
    <p class="ob-note">Disponible sur Chrome, Edge… (pas sur Safari/Firefox ordinateur).</p>`;
}

const ONBOARDING_ETAPES = [
  {
    icone: "🎯",
    titre: "Bienvenue sur Pilou&nbsp;!",
    corps: () => `
      <p>Pilou n'a qu'un seul but&nbsp;: <strong>détrôner Xavier</strong>, grand compétiteur devant l'éternel, à de multiples jeux.</p>
      <p>Vous jouez dans la vraie vie&nbsp;; ici, vous notez juste qui gagne. Pilou tient les <strong>scores</strong>, le <strong>classement</strong> et les <strong>trophées</strong> à votre place.</p>`,
  },
  {
    icone: "📲",
    titre: "Installe-la sur ton appareil",
    corps: () => `
      <p>Pour la lancer comme une vraie application (plein écran, même sans connexion)&nbsp;:</p>
      ${blocInstall()}`,
  },
  {
    icone: "💾",
    titre: "Ne perds jamais tes scores",
    corps: () => `
      <p>Tes données restent <strong>sur cet appareil</strong>. Pense à les sauvegarder de temps en temps&nbsp;!</p>
      <p>Dans <strong>Organisation → Gérer → 💾 Sauvegarde</strong>&nbsp;:</p>
      <ul class="ob-liste">
        <li><strong>Exporter</strong>&nbsp;: télécharge un fichier de secours.</li>
        <li><strong>Importer</strong>&nbsp;: restaure, ou transfère vers un autre appareil.</li>
      </ul>`,
  },
  {
    icone: "🚀",
    titre: "C'est parti&nbsp;!",
    corps: () => `
      <p>Crée ton premier groupe, ajoute des joueurs, et lance une partie.</p>
      <p class="ob-note">Tu pourras revoir ce guide à tout moment depuis la page <strong>Règles</strong>.</p>`,
  },
];

let _obEtape = 0;

function openOnboarding() {
  _obEtape = 0;
  let overlay = document.getElementById("onboarding");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "onboarding";
    document.body.appendChild(overlay);
  }
  rendreOnboarding(overlay);
  document.body.style.overflow = "hidden";
}

function fermerOnboarding() {
  const overlay = document.getElementById("onboarding");
  if (overlay) overlay.remove();
  document.body.style.overflow = "";
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch (e) {}
}

function rendreOnboarding(overlay) {
  const etape = ONBOARDING_ETAPES[_obEtape];
  const dernier = _obEtape === ONBOARDING_ETAPES.length - 1;
  const premier = _obEtape === 0;

  overlay.innerHTML = `
    <div class="ob-carte" role="dialog" aria-modal="true" aria-label="Guide de démarrage">
      <button class="ob-passer" type="button">Passer</button>
      <div class="ob-icone">${etape.icone}</div>
      <h2 class="ob-titre">${etape.titre}</h2>
      <div class="ob-corps">${etape.corps()}</div>
      <div class="ob-points">
        ${ONBOARDING_ETAPES.map(
          (_, i) => `<span class="ob-point${i === _obEtape ? " actif" : ""}"></span>`
        ).join("")}
      </div>
      <div class="ob-actions">
        <button class="btn-secondaire ob-prec" type="button"${
          premier ? ' style="visibility:hidden"' : ""
        }>← Précédent</button>
        <button class="btn-principal ob-suiv" type="button">${
          dernier ? "Commencer 🎯" : "Suivant →"
        }</button>
      </div>
    </div>`;

  overlay.querySelector(".ob-passer").onclick = fermerOnboarding;
  overlay.querySelector(".ob-prec").onclick = () => {
    if (_obEtape > 0) {
      _obEtape--;
      rendreOnboarding(overlay);
    }
  };
  overlay.querySelector(".ob-suiv").onclick = () => {
    if (dernier) {
      fermerOnboarding();
      return;
    }
    _obEtape++;
    rendreOnboarding(overlay);
  };

  // Bouton d'installation natif (si l'invite a été captée).
  const btnInstall = overlay.querySelector("[data-install-natif]");
  if (btnInstall) {
    btnInstall.hidden = !_inviteInstall;
    btnInstall.onclick = async () => {
      if (!_inviteInstall) return;
      _inviteInstall.prompt();
      try {
        await _inviteInstall.userChoice;
      } catch (e) {}
      _inviteInstall = null;
      btnInstall.hidden = true;
    };
  }
}

// Affichage automatique au tout premier lancement.
window.addEventListener("load", () => {
  let dejaVu = true;
  try {
    dejaVu = !!localStorage.getItem(ONBOARDING_KEY);
  } catch (e) {}
  if (!dejaVu) openOnboarding();
});
