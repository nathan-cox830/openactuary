// Motion helpers. All of them do nothing (or jump to the end state) when the user prefers reduced motion.

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Count numbers up from zero. Mark elements with data-count="1234.5" and optional
 * data-dec="1", data-prefix="$", data-suffix="M".
 */
export function countUp(root = document) {
  root.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count); if (!isFinite(target)) return;
    const dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const show = v => pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    if (reducedMotion()) { el.textContent = show(target); return; }
    const t0 = performance.now(), dur = 900;
    const step = t => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = show(target * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/** Fade/slide elements with [data-reveal] in when they scroll into view. */
export function reveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]');
  if (reducedMotion() || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/** Short celebratory confetti burst from the top-center of the viewport. */
export function confetti({ count = 140, duration = 2600 } = {}) {
  if (reducedMotion()) return;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 120 });
  document.body.appendChild(cv);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
  const ctx = cv.getContext('2d');
  const colors = ['#22D3EE', '#67E8F9', '#8B8DFB', '#FBBF24', '#34D399', '#F472B6'];
  const parts = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - .5) * W * .3, y: H * .15,
    vx: (Math.random() - .5) * 16 * dpr, vy: (-Math.random() * 12 - 4) * dpr,
    r: (4 + Math.random() * 5) * dpr, a: Math.random() * Math.PI, va: (Math.random() - .5) * .3,
    c: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  const tick = t => {
    const k = (t - t0) / duration; ctx.clearRect(0, 0, W, H);
    parts.forEach(p => { p.vy += .35 * dpr; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
    if (k < 1) requestAnimationFrame(tick); else cv.remove();
  };
  requestAnimationFrame(tick);
}
