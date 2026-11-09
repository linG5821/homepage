const doc = document.documentElement;
const body = document.body;

/* ------------------------------------------------------------------ *
 *  name: split into glyphs so it can rise out of the dark
 * ------------------------------------------------------------------ */
const nameEl = document.getElementById('name');
const NAME = 'linG5821';
nameEl.textContent = '';
[...NAME].forEach((ch, i) => {
  const span = document.createElement('span');
  span.textContent = ch;
  span.style.setProperty('--i', i);
  nameEl.appendChild(span);
});

/* ------------------------------------------------------------------ *
 *  loader
 * ------------------------------------------------------------------ */
const loader = document.getElementById('loader');
const loaderNum = document.getElementById('loaderNum');
const loaderBar = document.getElementById('loaderBar');
const video = document.getElementById('eye');
const replayHint = document.getElementById('replayHint');

body.classList.add('is-loading');

let loaded = false;
let readyAt = 0;
let finished = false;

function markReady() {
  if (loaded) return;
  loaded = true;
  readyAt = performance.now();
}

if (video) {
  if (video.readyState >= 2) markReady();
  video.addEventListener('loadeddata', markReady, { once: true });
  video.addEventListener('error', markReady, { once: true });
}
window.addEventListener('load', () => setTimeout(markReady, 300), { once: true });
setTimeout(markReady, 2400);

const start = performance.now();
function tick() {
  const t = performance.now();
  const p = loaded
    ? Math.min(100, ((t - readyAt) / 650) * 100 + 45)
    : Math.min(45, (t - start) / 24);
  const shown = Math.min(100, p);
  loaderNum.textContent = String(Math.floor(shown)).padStart(3, '0');
  loaderBar.style.width = `${shown}%`;

  if (shown >= 100 && !finished) {
    finished = true;
    endLoader();
    return;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function endLoader() {
  loader.classList.add('is-done');
  body.classList.remove('is-loading');
  doc.classList.add('is-ready');
  document.querySelector('.backdrop__media')?.classList.add('is-live');
  playEye();
  observeReveals();
  startClock();
}

/* ------------------------------------------------------------------ *
 *  the eye: play once, hold, replay on a click anywhere but links
 * ------------------------------------------------------------------ */
let playing = false;

function playEye() {
  if (!video) return;
  playing = true;
  replayHint?.classList.remove('is-live');
  try { video.currentTime = 0; } catch { /* not seekable yet */ }
  const p = video.play();
  if (p && typeof p.catch === 'function') p.catch(() => { playing = false; });
}

if (video) {
  video.addEventListener('ended', () => {
    playing = false;
    replayHint?.classList.add('is-live');
  });

  replayHint?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!playing) playEye();
  });

  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, .find, .about')) return;
    if (!playing) playEye();
  });
}

/* ------------------------------------------------------------------ *
 *  spotlight follows the pointer
 * ------------------------------------------------------------------ */
const spot = document.getElementById('spotlight');
let spotX = window.innerWidth * 0.7;
let spotY = window.innerHeight * 0.4;
let curX = spotX;
let curY = spotY;

if (spot) {
  window.addEventListener('pointermove', (e) => {
    spotX = e.clientX;
    spotY = e.clientY;
  }, { passive: true });

  (function follow() {
    curX += (spotX - curX) * 0.07;
    curY += (spotY - curY) * 0.07;
    spot.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    requestAnimationFrame(follow);
  })();
}

/* ------------------------------------------------------------------ *
 *  clock: her time, and yours
 * ------------------------------------------------------------------ */
function two(n) { return String(n).padStart(2, '0'); }

function startClock() {
  const clockEl = document.getElementById('clock');
  const statTime = document.getElementById('statTime');
  const statDate = document.getElementById('statDate');
  const statZone = document.getElementById('statZone');
  const metaTime = document.getElementById('metaTime');

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'LOCAL';
  if (statZone) statZone.textContent = zone.split('/').pop().replace(/_/g, ' ').toUpperCase();

  const update = () => {
    const d = new Date();
    const hm = `${two(d.getHours())}:${two(d.getMinutes())}`;
    const hms = `${hm}:${two(d.getSeconds())}`;
    if (clockEl) clockEl.textContent = hms;
    if (statTime) statTime.textContent = hm;
    if (metaTime) metaTime.textContent = hms;
    if (statDate) {
      const y = d.getFullYear();
      const m = two(d.getMonth() + 1);
      const day = two(d.getDate());
      statDate.textContent = `${y}.${m}.${day}`;
    }
  };

  update();
  window.setInterval(update, 1000);
}

/* ------------------------------------------------------------------ *
 *  copy the handle
 * ------------------------------------------------------------------ */
const copyBtn = document.getElementById('copy');
const copyLabel = document.getElementById('copyLabel');

if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText('linG5821');
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = 'linG5821';
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }

    if (!copyLabel) return;
    copyLabel.textContent = ok ? '已复制' : '复制失败';
    copyBtn.classList.toggle('is-done', ok);
    window.setTimeout(() => {
      copyLabel.textContent = '复制';
      copyBtn.classList.remove('is-done');
    }, 1800);
  });
}

/* ------------------------------------------------------------------ *
 *  reveals
 * ------------------------------------------------------------------ */
function observeReveals() {
  const items = document.querySelectorAll('[data-reveal]');
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 90, 460)}ms`;
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ *
 *  parallax
 * ------------------------------------------------------------------ */
const media = document.querySelector('.backdrop__media');
const wash = document.querySelector('.backdrop__wash');

if (media && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let target = 0;
  let value = 0;
  const onScroll = () => {
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    target = Math.min(1, window.scrollY / max);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  (function drift() {
    value += (target - value) * 0.05;
    media.style.transform = `translate3d(0, ${value * -5}vh, 0) scale(${1 + value * 0.05})`;
    media.style.opacity = String(Math.max(0, 1 - value * 2.6));
    if (wash) wash.style.opacity = String(1 - value * 0.35);
    requestAnimationFrame(drift);
  })();
}
