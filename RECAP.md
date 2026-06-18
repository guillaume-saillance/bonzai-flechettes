# 🎯 Bonzaï Fléchettes — Récapitulatif du projet

> **Bonzaï Fléchettes — Qui sera le meilleur ?**
> Application web pour déterminer qui est le meilleur aux fléchettes dans un
> groupe (famille, amis…). On joue dans la vraie vie, l'app tient le score, le
> classement et les trophées.

---

## 1. En bref

- **Type** : application web statique (HTML / CSS / JavaScript), **sans serveur ni installation** — il suffit d'ouvrir `index.html` dans un navigateur.
- **Données** : stockées **localement** sur l'appareil (`localStorage`). Rien n'est envoyé en ligne.
- **Cible** : **mobile-first**, mais responsive (tablette / desktop).
- **Aucune dépendance** : pas de framework, pas de librairie externe (animations, sons et logos faits maison).

---

## 2. Structure des fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page **Organisation** (sous-onglets *Gérer* / *Personnaliser*) |
| `partie.html` | Page **Nouvelle partie** (saisie d'une partie) |
| `classement.html` | Page **Classement** (sous-onglets *Scores* / *Palmarès*) |
| `regles.html` | Page **Règles** |
| `app.js` | Logique métier : stockage, groupes, joueurs, **calcul du score + gamification** |
| `ui.js` | Habillage partagé : barre d'app, navigation, avatars, **pied de page + partage** |
| `anim.js` | Animations maison : confettis, toasts, compteur animé, **son de victoire** |
| `onboarding.js` | Guide de démarrage au premier lancement (installation + sauvegarde) |
| `style.css` | Toute la direction artistique |
| `logo.svg` | Logo (tête de taureau + fléchette), sert aussi de favicon |
| `icone.svg` | Icône carrée (logo sur fond beige) — source des PNG d'app |
| `icone-192.png` / `icone-512.png` | Icônes de l'app installée (Android / manifest) |
| `apple-touch-icon.png` | Icône de l'app installée (iPhone / iPad) |
| `manifest.json` | Manifeste PWA (nom, icônes, couleurs, plein écran) |
| `service-worker.js` | Cache hors-ligne (PWA) |
| `apercu-logo.html` | Page d'aperçu du logo (outil interne) |
| `maquettes.html` | Maquettes des 3 ambiances DA (outil interne, historique) |

---

## 3. Fonctionnalités

### Groupes & joueurs
- Créer / **renommer** / supprimer des **groupes** (Famille, Amis…), affichés en **grille de cartes** cliquables. Chaque groupe a ses joueurs, parties, période et classement.
- Ajouter / retirer des **joueurs** dans le groupe actif.
- Le **groupe actif** est mémorisé et partagé par toutes les pages (choisi uniquement dans Organisation).

### Saisie d'une partie
- Sélection des **participants** (2+), puis **ordre d'arrivée** (1er, 2e, 3e… ; le dernier est déduit automatiquement). À 2 joueurs : simple « Qui a gagné ? ».
- **Annulation** de la dernière partie depuis le bandeau.
- Mini-podium du moment + réglage **son 🔊/🔇**.

### Classement
- **Scores** : podium illustré (top 3), classement ELO, **période** (indéterminée ou définie du… au…), dernières parties, réinitialisation.
- **Palmarès** : synthèse du groupe (records) + détail par joueur (clic → vitrine de trophées dépliée).

### Personnalisation
- **Avatar** par joueur : couleur + emblème emoji (ou initiales). Affiché partout (classement, partie, podium, organisation).

---

## 4. Le score (modèle « ELO multijoueur »)

- Chaque joueur démarre à **1000 points**.
- À chaque partie, chaque joueur est comparé à tous les autres selon l'ordre d'arrivée (série de duels, logique ELO).
- **On peut gagner comme perdre des points** (l'enjeu !), mais une victoire rapporte plus qu'une défaite ne coûte (`K_GAIN = 40`, `K_PERTE = 24`).
- Exemples (joueurs de même niveau) : duel **+20 / −12** · à 3 **+40 / 0 / −24** · à 4 **+60 / +20 / −12 / −36**.
- Le gagnant est celui qui a **le plus haut score sur la période** choisie.

### Gamification
- **Séries (score-streak)** : 3 victoires d'affilée → **+20 pts bonus**, 5 → **+40**, 10 → **+80**.
- **8 trophées** : 🎯 Première victoire · 🔥 Série de 3 · 🔥 En feu (5) · 🌋 Incandescent (10) · 🎖️ Vétéran (10 parties) · 👑 Champion (10 victoires) · 🐉 Tombeur de géant (battre +150 pts au-dessus) · 🎲 Grosse tablée (4+ joueurs).
- Tout est **recalculé depuis l'historique** (compatible annulation et périodes).

---

## 5. Direction artistique

- **Palette** : papaya `#fdf0d5` (fond), deep-space-blue `#003049` (texte), brick-red `#c1121f` & molten-lava `#780000` (accents/actions), steel-blue `#669bbc` (secondaire).
- **Typographie** : *Anton* (nom/logo), *Oswald* (titres, sportif), *Inter* (texte).
- **Logo** : tête de taureau façon « bulls » avec une fléchette en travers de la gueule (clin d'œil *bull*-seye).
- **Feel application** : barre d'onglets en bas sur mobile / en haut sur desktop, **onglet actif en pastille rouge**, cartes nettes, filets rouges sous les titres.

### Navigation
**Organisation · Partie · Classement · Règles** (4 onglets), avec sous-onglets dans Organisation et Classement.

### Animations & son
- 🎉 Confettis + 🔊 arpège de victoire + 🔥 toasts (séries, trophées débloqués).
- Compteur de score animé, flamme de série, apparition des cartes.

### Pied de page
- Lien **mailto** vers `guillaume@saillance.cc` (« Une idée pour améliorer l'application ? »).
- **Partage** avec vrais logos SVG : Copier le lien · WhatsApp · Facebook · Instagram · Snapchat · LinkedIn · X · Telegram.

---

## 6. ✅ Étapes réalisées

1. MVP du jeu (2 pages) + score ELO.
2. Confort de saisie (annuler, gain affiché, mini-podium).
3. Score gamifié + **groupes**.
4. Restructuration en pages mono-tâches + page Règles.
5. Classement multijoueur (ordre d'arrivée) + perte de points.
6. **Identité visuelle** (palette, typo, logo, feel app).
7. **Bonus** : avatars, séries, trophées, animations, son.
8. Restructuration finale de la navigation + podium + palmarès + pied de page (mailto + partage).

---

## 7. 🔜 Étapes suivantes (à arbitrer)

### À faire avant mise en ligne
- [ ] **Héberger l'app** (Netlify / Vercel / GitHub Pages…) et **remplacer `URL_PARTAGE`** dans `ui.js` par l'adresse réelle (sinon les liens de partage pointent vers le placeholder `https://bonzai-flechettes.app`).
- [ ] **Vérifier les tracés des logos SVG** de partage (corriger si l'un s'affiche mal).

### Fait
- [x] **PWA** : l'app est installable sur l'écran d'accueil et fonctionne hors-ligne (`manifest.json` + `service-worker.js` + icônes). ⚠️ Ne s'active qu'en HTTP(S) — donc effectif une fois l'app hébergée.
- [x] **Sécurité des données** : stockage persistant (anti-purge du navigateur) + **Export / Import JSON** (onglet Organisation → Gérer → Sauvegarde) pour sauvegarder et transférer entre appareils.
- [x] **Onboarding** : guide de démarrage en 4 étapes au premier lancement (installation adaptée à l'appareil + sauvegarde), re-consultable depuis la page Règles.

### Améliorations possibles
- [ ] **Plus de gamification** : nouveaux trophées, paliers de série, niveaux/XP, défis.
- [ ] **Sons supplémentaires** (trophée, série) + réglage du son global (pas seulement sur la page Partie).
- [ ] **Statistiques par joueur** : courbe d'évolution du score, taux de victoire, face-à-face.
- [ ] **Accessibilité** : contrastes, navigation clavier, libellés ARIA.
- [ ] **Variantes de jeu** (501, cricket…) si on veut aller au-delà du simple classement.

---

*Dernière mise à jour : 18/06/2026*
