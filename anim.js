/*
 * Petites animations « maison » (aucune dépendance) :
 * confettis, toasts de récompense, et compteur de nombre animé.
 */

// Pluie de confettis depuis le haut de l'écran.
function lancerConfettis() {
  const couleurs = ["#c1121f", "#003049", "#669bbc", "#780000", "#d98324", "#fdf0d5"];
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const cx = innerWidth / 2;
  const cy = innerHeight * 0.32;
  const parts = [];
  for (let i = 0; i < 130; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 4 + Math.random() * 8;
    parts.push({
      x: cx, y: cy,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 5,
      g: 0.14 + Math.random() * 0.12,
      s: 5 + Math.random() * 6,
      rot: Math.random() * 6.28,
      vr: -0.25 + Math.random() * 0.5,
      col: couleurs[i % couleurs.length],
    });
  }

  let t = 0;
  const max = 120;
  function frame() {
    t++;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const alpha = Math.max(0, 1 - t / max);
    parts.forEach((p) => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    });
    if (t < max) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

// Notification glissante (récompense, série, trophée…).
function toast(emoji, titre, sousTitre) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span class="toast-emoji">${emoji}</span>
    <div><div class="toast-titre">${titre}</div>${
    sousTitre ? `<div class="toast-sous">${sousTitre}</div>` : ""
  }</div>`;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add("visible"));
  setTimeout(() => {
    el.classList.remove("visible");
    setTimeout(() => el.remove(), 400);
  }, 3400);
}

// Affiche plusieurs toasts en cascade (léger décalage).
function toastsEnChaine(liste) {
  liste.forEach((t, i) =>
    setTimeout(() => toast(t.emoji, t.titre, t.sous), i * 700)
  );
}

// Compteur animé d'une valeur de départ jusqu'à la valeur cible.
function animerNombre(el, valeur, duree = 650, depart = 0) {
  const debut = performance.now();
  function step(now) {
    const p = Math.min(1, (now - debut) / duree);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(depart + (valeur - depart) * eased);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = valeur;
  }
  requestAnimationFrame(step);
}

// Petit son de victoire (arpège majeur) via Web Audio — aucun fichier requis.
let _audioCtx = null;
let _sonCoupe = localStorage.getItem("bonzai-muet") === "1";

function sonActive() {
  return !_sonCoupe;
}

function basculerSon() {
  _sonCoupe = !_sonCoupe;
  localStorage.setItem("bonzai-muet", _sonCoupe ? "1" : "0");
  return !_sonCoupe;
}

function jouerSonVictoire() {
  if (_sonCoupe) return;
  try {
    _audioCtx =
      _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // Do-Mi-Sol-Do
    const t0 = ctx.currentTime;
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const gain = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const start = t0 + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      o.connect(gain).connect(ctx.destination);
      o.start(start);
      o.stop(start + 0.34);
    });
  } catch (e) {
    /* audio indisponible : on ignore */
  }
}
