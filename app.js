/*
 * Bonzaï : Qui est le meilleur aux fléchettes ?
 * Logique partagée : stockage local, groupes, classement gamifié.
 *
 * Modèle de score « ELO multijoueur » : à chaque partie, les joueurs sont
 * classés par ordre d'arrivée (1er, 2e, 3e…). Chaque joueur est comparé à tous
 * les autres comme une série de duels : finir devant quelqu'un rapporte des
 * points, finir derrière en coûte. On PEUT donc perdre des points (l'enjeu !),
 * mais une victoire rapporte plus qu'une défaite ne coûte : les gains sont
 * amplifiés davantage que les pertes.
 */

const STORAGE_KEY = "bonzai-flechettes";
const ELO_DEPART = 1000; // score de départ de chaque joueur

const K_GAIN = 200; // amplifie les points gagnés (on gagne gros)
const K_PERTE = 120; // amplifie (moins) les points perdus (l'enjeu reste réel)
const SEUIL_GEANT = 750; // écart de score à battre pour le trophée « Tombeur de géant »

// --- Gamification ----------------------------------------------------------

// Couleurs et emblèmes proposés pour les avatars des joueurs.
const PALETTE_AVATARS = [
  "#c1121f", "#003049", "#669bbc", "#780000",
  "#0f7d53", "#d98324", "#6a4c93", "#2a9d8f",
];
const EMBLEMES = [
  "🎯", "🐂", "🔥", "⭐", "⚡", "🚀", "🍀", "🎲",
  "👑", "🦊", "🐉", "🌵", "🏹", "💪", "🍺", "🌟",
];

// Trophées débloqués en rejouant l'historique du groupe.
const TROPHEES = [
  { id: "premiere", emoji: "🎯", nom: "Première victoire", desc: "Gagner une partie." },
  { id: "serie3", emoji: "🔥", nom: "Série de 3", desc: "Gagner 3 parties d'affilée." },
  { id: "serie5", emoji: "🔥", nom: "En feu", desc: "Gagner 5 parties d'affilée." },
  { id: "serie10", emoji: "🌋", nom: "Incandescent", desc: "Gagner 10 parties d'affilée." },
  { id: "veteran", emoji: "🎖️", nom: "Vétéran", desc: "Disputer 10 parties." },
  { id: "champion", emoji: "👑", nom: "Champion", desc: "Remporter 10 victoires." },
  { id: "geant", emoji: "🐉", nom: "Tombeur de géant", desc: "Battre un joueur 750 pts au-dessus de soi." },
  { id: "tablee", emoji: "🎲", nom: "Grosse tablée", desc: "Gagner une partie à 4 joueurs ou plus." },
];

// Points bonus accordés au moment où l'on atteint une série de victoires.
const BONUS_SERIE = { 3: 50, 5: 100, 10: 500 };

function tropheeParId(id) {
  return TROPHEES.find((t) => t.id === id);
}

// Initiales d'un joueur (repli quand il n'a pas d'emblème).
function initiales(nom) {
  const mots = (nom || "").trim().split(/\s+/);
  if (mots.length >= 2) return (mots[0][0] + mots[1][0]).toUpperCase();
  return (nom || "?").slice(0, 2).toUpperCase();
}

// --- Stockage --------------------------------------------------------------

function periodeDefaut() {
  return { mode: "indeterminee", debut: null, fin: null };
}

// Garantit que chaque joueur d'un groupe a une couleur et un emblème (avatar).
function normaliserGroupe(g) {
  g.joueurs = g.joueurs || [];
  g.parties = g.parties || [];
  g.periode = g.periode || periodeDefaut();
  g.joueurs.forEach((j, i) => {
    if (!j.couleur) j.couleur = PALETTE_AVATARS[i % PALETTE_AVATARS.length];
    if (j.embleme === undefined) j.embleme = "";
  });
  return g;
}

function chargerDonnees() {
  const brut = localStorage.getItem(STORAGE_KEY);
  if (!brut) return { groupes: [], groupeActifId: null };
  try {
    const d = JSON.parse(brut);
    // Migration de l'ancien format (sans groupes) vers le nouveau.
    if (d.joueurs || d.parties) {
      const g = normaliserGroupe({
        id: nouvelId(),
        nom: "Mon groupe",
        joueurs: d.joueurs || [],
        parties: d.parties || [],
        periode: d.periode || periodeDefaut(),
      });
      return { groupes: [g], groupeActifId: g.id };
    }
    d.groupes = d.groupes || [];
    d.groupes.forEach(normaliserGroupe);
    d.groupeActifId =
      d.groupeActifId || (d.groupes[0] && d.groupes[0].id) || null;
    return d;
  } catch (e) {
    return { groupes: [], groupeActifId: null };
  }
}

function sauvegarder(donnees) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donnees));
}

function nouvelId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// --- Groupes ---------------------------------------------------------------

function creerGroupe(donnees, nom) {
  nom = (nom || "").trim();
  if (!nom) return null;
  const groupe = {
    id: nouvelId(),
    nom,
    joueurs: [],
    parties: [],
    periode: periodeDefaut(),
  };
  donnees.groupes.push(groupe);
  donnees.groupeActifId = groupe.id;
  return groupe;
}

function renommerGroupe(groupe, nom) {
  nom = (nom || "").trim();
  if (!nom) return false;
  groupe.nom = nom;
  return true;
}

function supprimerGroupe(donnees, id) {
  donnees.groupes = donnees.groupes.filter((g) => g.id !== id);
  if (donnees.groupeActifId === id) {
    donnees.groupeActifId = donnees.groupes[0] ? donnees.groupes[0].id : null;
  }
}

function groupeActif(donnees) {
  return donnees.groupes.find((g) => g.id === donnees.groupeActifId) || null;
}

function definirGroupeActif(donnees, id) {
  donnees.groupeActifId = id;
}

// --- Joueurs (dans un groupe) ----------------------------------------------

function ajouterJoueur(groupe, nom) {
  nom = (nom || "").trim();
  if (!nom) return null;
  const existe = groupe.joueurs.some(
    (j) => j.nom.toLowerCase() === nom.toLowerCase()
  );
  if (existe) return null;
  const joueur = {
    id: nouvelId(),
    nom,
    couleur: PALETTE_AVATARS[groupe.joueurs.length % PALETTE_AVATARS.length],
    embleme: "",
  };
  groupe.joueurs.push(joueur);
  return joueur;
}

function supprimerJoueur(groupe, id) {
  groupe.joueurs = groupe.joueurs.filter((j) => j.id !== id);
}

// Met à jour l'avatar d'un joueur (couleur et/ou emblème).
function personnaliserJoueur(joueur, couleur, embleme) {
  if (couleur !== undefined) joueur.couleur = couleur;
  if (embleme !== undefined) joueur.embleme = embleme;
}

function joueurParId(groupe, id) {
  return groupe.joueurs.find((j) => j.id === id);
}

// --- Parties (dans un groupe) ----------------------------------------------

// `classement` : tableau des ids ordonnés du 1er (vainqueur) au dernier.
function enregistrerPartie(groupe, classement) {
  if (!classement || classement.length < 2) return null;
  const partie = {
    id: nouvelId(),
    date: new Date().toISOString(),
    classement: [...classement],
    participants: [...classement], // compat affichage
    gagnantId: classement[0],
  };
  groupe.parties.push(partie);
  return partie;
}

// Ordre d'arrivée d'une partie (gère l'ancien format sans `classement`).
function ordreClassement(partie) {
  if (partie.classement && partie.classement.length) return partie.classement;
  const autres = (partie.participants || []).filter(
    (id) => id !== partie.gagnantId
  );
  return [partie.gagnantId, ...autres];
}

// Retire et renvoie la dernière partie enregistrée (pour annuler une erreur).
function annulerDernierePartie(groupe) {
  if (groupe.parties.length === 0) return null;
  return groupe.parties.pop();
}

// --- Calcul du classement --------------------------------------------------

// Probabilité que A batte B selon leurs scores actuels (formule ELO).
function scoreAttendu(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

// Filtre les parties d'un groupe selon sa période choisie.
function partiesDeLaPeriode(groupe) {
  const { mode, debut, fin } = groupe.periode;
  if (mode !== "determinee") return [...groupe.parties];
  return groupe.parties.filter((p) => {
    const t = new Date(p.date).getTime();
    if (debut && t < new Date(debut).getTime()) return false;
    if (fin && t > new Date(fin).getTime() + 24 * 3600 * 1000 - 1) return false;
    return true;
  });
}

/*
 * Rejoue tout l'historique du groupe et calcule, par joueur : le score ELO,
 * les victoires/parties, la série en cours et le record, les points bonus de
 * série, et les trophées débloqués. Renvoie une table { id: stats }.
 *
 * Score : pour chaque partie, on compare chaque joueur à tous les autres selon
 * l'ordre d'arrivée (duels). Performance positive → gain (×K_GAIN), négative →
 * perte (×K_PERTE). Une série de victoires rapporte des points bonus.
 */
function calculerStats(groupe) {
  const S = {};
  groupe.joueurs.forEach((j) => {
    S[j.id] = {
      score: ELO_DEPART,
      victoires: 0,
      parties: 0,
      serie: 0,
      meilleureSerie: 0,
      bonusSerie: 0,
      trophees: new Set(),
    };
  });

  const parties = partiesDeLaPeriode(groupe).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  parties.forEach((partie) => {
    const ordre = ordreClassement(partie).filter((id) => S[id]);
    if (ordre.length < 2) return;
    const gagnant = ordre[0];

    // Écarts ELO calculés sur les scores d'avant-partie.
    const deltas = {};
    ordre.forEach((id, rang) => {
      let perf = 0;
      ordre.forEach((autreId, autreRang) => {
        if (id === autreId) return;
        const resultat = rang < autreRang ? 1 : 0;
        perf += resultat - scoreAttendu(S[id].score, S[autreId].score);
      });
      deltas[id] = (perf >= 0 ? K_GAIN : K_PERTE) * perf;
    });

    // Tombeur de géant : a-t-il battu un joueur SEUIL_GEANT+ pts au-dessus ?
    const exploit = ordre
      .slice(1)
      .some((id) => S[id].score - S[gagnant].score >= SEUIL_GEANT);

    ordre.forEach((id) => {
      S[id].score += deltas[id];
      S[id].parties += 1;
      S[id].serie = id === gagnant ? S[id].serie + 1 : 0;
    });

    const sg = S[gagnant];
    sg.victoires += 1;
    sg.meilleureSerie = Math.max(sg.meilleureSerie, sg.serie);
    if (BONUS_SERIE[sg.serie]) {
      sg.score += BONUS_SERIE[sg.serie];
      sg.bonusSerie += BONUS_SERIE[sg.serie];
    }

    // Trophées
    sg.trophees.add("premiere");
    if (sg.serie >= 3) sg.trophees.add("serie3");
    if (sg.serie >= 5) sg.trophees.add("serie5");
    if (sg.serie >= 10) sg.trophees.add("serie10");
    if (sg.victoires >= 10) sg.trophees.add("champion");
    if (exploit) sg.trophees.add("geant");
    if (ordre.length >= 4) sg.trophees.add("tablee");
    ordre.forEach((id) => {
      if (S[id].parties >= 10) S[id].trophees.add("veteran");
    });
  });

  return S;
}

// Classement trié du groupe, enrichi des données de gamification.
function calculerClassement(groupe) {
  const S = calculerStats(groupe);
  return groupe.joueurs
    .map((j) => ({
      id: j.id,
      nom: j.nom,
      couleur: j.couleur,
      embleme: j.embleme,
      score: Math.round(S[j.id].score),
      victoires: S[j.id].victoires,
      parties: S[j.id].parties,
      serie: S[j.id].serie,
      meilleureSerie: S[j.id].meilleureSerie,
      bonusSerie: Math.round(S[j.id].bonusSerie),
      trophees: [...S[j.id].trophees],
    }))
    .sort((a, b) => b.score - a.score || b.victoires - a.victoires);
}

// Renvoie une table { idJoueur: score } pour comparer avant/après une partie.
function scoresParId(groupe) {
  const map = {};
  calculerClassement(groupe).forEach((j) => (map[j.id] = j.score));
  return map;
}

// --- Utilitaires d'affichage ----------------------------------------------

function formaterDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// --- Sauvegarde (export / import) ------------------------------------------

// Sérialise toutes les données (tous les groupes) dans un paquet JSON daté.
function exporterDonneesJSON() {
  const paquet = {
    app: "bonzai-flechettes",
    version: 1,
    exporte: new Date().toISOString(),
    donnees: chargerDonnees(),
  };
  return JSON.stringify(paquet, null, 2);
}

// Nom de fichier daté, ex. « bonzai-sauvegarde-2026-06-18.json ».
function nomFichierSauvegarde() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `bonzai-sauvegarde-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(
    d.getDate()
  )}.json`;
}

/*
 * Valide puis importe un texte JSON de sauvegarde, remplaçant les données
 * actuelles. Accepte le paquet { donnees } produit par l'export, ou
 * directement un objet de données. Renvoie { ok, message?, nbGroupes? }.
 */
function importerDonneesJSON(texte) {
  let paquet;
  try {
    paquet = JSON.parse(texte);
  } catch (e) {
    return { ok: false, message: "Fichier illisible (JSON invalide)." };
  }
  const d = paquet && paquet.donnees ? paquet.donnees : paquet;
  if (!d || !Array.isArray(d.groupes)) {
    return {
      ok: false,
      message: "Ce fichier n'est pas une sauvegarde Bonzaï.",
    };
  }
  d.groupes.forEach(normaliserGroupe);
  if (!d.groupeActifId && d.groupes[0]) d.groupeActifId = d.groupes[0].id;
  sauvegarder(d);
  return { ok: true, nbGroupes: d.groupes.length };
}
