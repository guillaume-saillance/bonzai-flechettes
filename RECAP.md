# 🎯 Pilou — Récapitulatif du projet

> **Pilou — « Qui osera défier Xavier ? »**
> Application web pour désigner qui est le meilleur d'un groupe à **différents
> jeux** (on joue dans la vraie vie, l'app tient le score, le classement et les
> trophées). Clin d'œil : l'app est dédiée à **défier Xavier**, grand
> compétiteur. *(Anciennement « Bonzaï Fléchettes ».)*

> 🌐 **En ligne : https://pilou.saillance.cc**

---

## 1. En bref

- **Type** : application web statique (HTML / CSS / JavaScript), **sans serveur** — **installable (PWA)** et utilisable **hors-ligne**.
- **Concept** : on choisit **un jeu** (fléchettes, pétanque, babyfoot… ou le sien), on joue dans la vraie vie, et Pilou note **qui gagne / qui perd des points**, **jeu par jeu**.
- **Données** : stockées **localement** sur l'appareil (`localStorage`). Rien n'est envoyé en ligne.
- **Cible** : **mobile-first**, mais responsive (tablette / desktop).
- **Aucune dépendance** : pas de framework, pas de librairie externe (animations, sons, thème faits maison).

---

## 2. Structure des fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page **Jeux** (sous-onglets *Sélectionner* / *Gérer* / *Personnaliser*) |
| `partie.html` | Page **Nouvelle partie** (saisie d'une partie sur le jeu actif) |
| `classement.html` | Page **Classement** (sous-onglets *Scores* / *Palmarès*, filtre Général + par jeu) |
| `regles.html` | Page **Règles** (but du jeu, multi-jeux, score, classement, groupes) |
| `app.js` | Logique métier : stockage, **jeux**, groupes, joueurs, **score + gamification**, export/import |
| `ui.js` | Habillage partagé : barre d'app, navigation, avatars, pied + partage, **thème**, service worker (+ auto-reload), stockage persistant |
| `anim.js` | Animations maison : confettis, toasts, compteur animé, **son de victoire** |
| `onboarding.js` | Guide de démarrage au premier lancement (installation + sauvegarde) |
| `style.css` | Toute la direction artistique (variables de thème incluses) |
| `logo.png` | Logo (**photo**), sert aussi de favicon |
| `icone-192.png` / `icone-512.png` | Icônes de l'app installée (manifest) |
| `apple-touch-icon.png` | Icône de l'app installée (iPhone / iPad) |
| `manifest.json` | Manifeste PWA (nom, icônes, couleurs, plein écran) |
| `service-worker.js` | Cache hors-ligne + auto-reload à la mise à jour |
| `CNAME` | Domaine personnalisé (`pilou.saillance.cc`) |
| `apercu-logo.html` / `maquettes.html` | Outils internes **obsolètes** (anciens essais de logo/DA) |

---

## 3. Fonctionnalités

### Jeux (catalogue global)
- Un **catalogue de jeux partagé** par tous les groupes. 8 jeux fournis : 🎯 Fléchettes · ⚪ Pétanque · 🎴 Cornhole · ⚽ Babyfoot · 🏓 Ping-pong · 🎱 Billard · 🃏 Cartes · 🕹️ Flipper.
- **Sélectionner** (1ᵉʳ sous-onglet de Jeux) : on touche un jeu → il devient **actif** (bouton **Jouer** sur sa carte) ; on peut **＋ Ajouter son jeu** (nom + emoji), modifier ou supprimer (sauf s'il a des parties).
- Si on tente de jouer **sans groupe prêt**, une **alerte** en haut oriente vers *Gérer*.

### Groupes & joueurs (sous-onglet *Gérer*)
- Créer / **renommer** / supprimer des **groupes** (Famille, Amis…), en grille de cartes. Chaque groupe a ses joueurs, parties, période et classements.
- Ajouter / retirer des **joueurs**. Le **groupe actif** est mémorisé et partagé par toutes les pages.

### Saisie d'une partie
- Bandeau **Groupe + sélecteur de jeu** ; la partie est enregistrée **sur le jeu sélectionné** (`partie.jeuId`).
- Choix des **participants** (2+), puis **ordre d'arrivée** (dernier déduit). À 2 : simple « Qui a gagné ? ».
- **Annulation** de la dernière partie, mini-podium **du jeu en cours**, réglage **son 🔊/🔇** (dans l'en-tête de la carte).

### Classement
- **Filtre Général ↔ par jeu** : une barre de puces (**🏅 Général** + une puce par jeu réellement joué). Podium, tableau et historique suivent le filtre. Titre dynamique (« Classement Général » / « Classement 🎯 Fléchettes »).
- **Période** intégrée au bandeau Groupe (indéterminée ou définie du… au…).
- **Palmarès** : synthèse du groupe + détail par joueur **cliquable** (👉/👇) → vitrine de trophées.

### Personnalisation
- **Avatar** par joueur (couleur + emblème emoji).
- **🎨 Thème de l'application** : couleur principale modifiable (presets + couleur perso), appliquée partout, mémorisée.

### Sauvegarde & confort
- **Export / Import JSON** + **stockage persistant** (anti-purge).
- **Onboarding** au 1er lancement. Rechargement auto au retour de page (`pageshow`) pour éviter un affichage périmé.

---

## 4. Le score (modèle « ELO multijoueur », par jeu)

- Chaque joueur démarre à **1000 points**, **séparément pour chaque jeu**.
- À chaque partie, chaque joueur est comparé à tous les autres selon l'ordre d'arrivée (duels, logique ELO).
- **On peut gagner comme perdre des points**, mais une victoire rapporte bien plus qu'une défaite ne coûte (`K_GAIN = 200`, `K_PERTE = 50`).
- Exemples (joueurs de même niveau) : duel **+100 / −25** · à 3 **+200 / ±0 / −50** · à 4 **+300 / +100 / −25 / −75**.
- Le gagnant est celui qui a **le plus haut score sur la période** choisie.

### Gamification
- **Séries (score-streak)** : 3 victoires d'affilée → **+50 pts bonus**, 5 → **+100**, 10 → **+500**.
- **8 trophées** : 🎯 Première victoire · 🔥 Série de 3 · 🔥 En feu (5) · 🌋 Incandescent (10) · 🎖️ Vétéran (10 parties) · 👑 Champion (10 victoires) · 🐉 Tombeur de géant (battre **+500 pts** au-dessus) · 🎲 Grosse tablée (4+ joueurs).
- Tout est **recalculé depuis l'historique** (compatible annulation, périodes et filtre par jeu).

---

## 5. Direction artistique

- **Palette de base** : papaya `#fdf0d5` (fond), deep-space-blue `#003049` (texte), steel-blue `#669bbc` (secondaire).
- **Couleur principale (thème)** : variable CSS `--primaire` (défaut **bleu `#0044cc`**) ; boutons, onglet actif, accents, ombres en dérivent (`color-mix`). Le **rouge `--danger` (#c1121f)** est réservé aux actions destructrices / erreurs.
- **Typographie** : *Anton* (nom), *Oswald* (titres), *Inter* (texte).
- **Logo** : **photo** détourée, optimisée en PNG (84 Ko).
- **Feel** : barre d'onglets en bas sur mobile / en haut sur desktop ; **en-tête centré sur desktop** ; **onglet actif en pastille** (couleur du thème) ; **sélecteurs en pill** (jeu / période) ; cartes nettes ; marges iOS (safe-area) gérées.

### Navigation
**Jeux 🎮 · Partie · Classement · Règles** (4 onglets), avec sous-onglets dans Jeux (*Sélectionner 🃏 / Gérer / Personnaliser*) et Classement (*Scores / Palmarès*).

### Pied de page
- Lien **mailto** vers `guillaume@saillance.cc` + **partage** (Copier le lien · WhatsApp · Facebook · Instagram · Snapchat · LinkedIn · X · Telegram).

---

## 6. 🌐 Mise en ligne & mises à jour

- **Adresse** : **https://pilou.saillance.cc** (GitHub Pages, HTTPS forcé).
- **Dépôt** : `guillaume-saillance/bonzai-flechettes` (nom technique inchangé), public, Pages depuis `main` / racine.
- **Domaine** : sous-domaine via `CNAME` → `guillaume-saillance.github.io`.
- **Dossier de travail** : `~/Documents/GitHub/bonzai-flechettes` (clone géré via **GitHub Desktop**).

### 🔄 Pour mettre à jour
1. Modifier les fichiers (dans le clone).
2. **Incrémenter `CACHE`** (`pilou-vN`) dans `service-worker.js`.
3. **Commit + Push** dans GitHub Desktop → GitHub Pages republie tout seul (~1 min).
4. ⚠️ Clés de stockage à **ne jamais renommer** (sinon perte des données) : `bonzai-flechettes`, `bonzai-muet`, `bonzai-onboarding-vu`.

---

## 7. ✅ Étapes réalisées

1. MVP du jeu + score ELO.
2. Confort de saisie (annuler, gain affiché, mini-podium).
3. Score gamifié + **groupes**.
4. Pages mono-tâches + page Règles.
5. Classement multijoueur (ordre d'arrivée) + perte de points.
6. **Identité visuelle** (palette, typo, feel app).
7. **Bonus** : avatars, séries, trophées, animations, son.
8. Navigation + podium + palmarès + pied de page (mailto + partage).
9. **PWA** (installable + hors-ligne), **sécurité des données** (persistant + export/import), **onboarding**.
10. **Déploiement** sur GitHub Pages + domaine personnalisé + HTTPS.
11. Marges iOS, **auto-reload** à la mise à jour.
12. **Renommage → Pilou** (+ tagline & dédicace **Xavier**) + **domaine** `pilou.saillance.cc`.
13. **Thème personnalisable** (couleur principale, défaut bleu `#0044cc`).
14. **Nouveau logo** (photo).
15. **Multi-jeux** : catalogue global de jeux, jeu actif, `partie.jeuId`, migration douce (anciennes parties → Fléchettes).
16. **Page « Jeux »** (ex-Organisation) : sous-onglet *Sélectionner* (choix + ajout de jeux, bouton Jouer), bandeau Groupe.
17. **Classement Général + par jeu** (puces de filtre, titre dynamique, période dans le bandeau).
18. **Page Règles** alignée sur le concept multi-jeux.
19. **Réglage du scoring** : `K_PERTE = 50` (défaites douces), seuil géant `500`.
20. **Polish UX** : sélecteurs en pill, bouton son déplacé, en-tête centré desktop, palmarès cliquable explicite, alerte « choisis ton groupe ».

---

## 8. 🔜 Étapes suivantes (idées)

- [ ] Plus de gamification (trophées, paliers, niveaux/XP, défis), éventuellement **par jeu**.
- [ ] Statistiques par joueur (évolution du score, taux de victoire, face-à-face).
- [ ] Sons supplémentaires + réglage du son global.
- [ ] Accessibilité (contrastes, clavier, ARIA).
- [ ] Notifications (push via service externe, ou e-mail si un jour backend).
- [ ] Ménage : retirer les outils internes obsolètes (`apercu-logo.html`, `maquettes.html`).

---

*Dernière mise à jour : 19/06/2026*
