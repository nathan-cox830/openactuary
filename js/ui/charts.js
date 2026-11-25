// Hand-rolled SVG charts that animate in (lines draw, bars grow) and respect reduced motion via CSS.
import { esc, fmt } from '../util.js';

/**
 * Line chart.
 * series: [{ v: number[] (nulls allowed), c: css color, w?: width, label?: string, dash?: bool, area?: bool, dot?: bool }]
 * opts:   { x: labels[], yfmt: v => string, min?, max?, aria: string, h?: height, ticks?: 5 }
 */
export function lineChart(series, opts) {
  const W = 640, H = opts.h || 260, L = 52, R = 16, T = 14, B = 30; const xs = opts.x;
  const all = series.flatMap(s => s.v.filter(v => v != null && isFinite(v)));
  let lo = opts.min ?? Math.min(...all), hi = opts.max ?? Math.max(...all);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08; if (opts.min == null) lo -= pad; if (opts.max == null) hi += pad;
  const X = i => L + (W - L - R) * (xs.length === 1 ? .5 : i / (xs.length - 1));
  const Y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let g = '';
  const ticks = opts.ticks || 5;
  for (let k = 0; k <= ticks; k++) { const v = lo + (hi - lo) * k / ticks; g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${L - 8}" y="${Y(v) + 4}" text-anchor="end">${esc(opts.yfmt(v))}</text>`; }
  xs.forEach((x, i) => { if (x !== '' && x != null) g += `<text x="${X(i)}" y="${H - 9}" text-anchor="middle">${esc(x)}</text>`; });
  series.forEach((s, si) => {
    const pts = s.v.map((v, i) => (v == null || !isFinite(v)) ? null : [X(i), Y(v)]).filter(Boolean); if (!pts.length) return;
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L');
    if (s.area) g += `<path class="fade" d="${d}L${pts[pts.length - 1][0]},${Y(lo)}L${pts[0][0]},${Y(lo)}Z" fill="${s.c}" opacity=".10"/>`;
    g += `<path class="draw" pathLength="1" style="--len:1;animation-delay:${si * 60}ms" d="${d}" fill="none" stroke="${s.c}" stroke-width="${s.w || 2}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/>`;
    const e = pts[pts.length - 1];
    if (s.dot !== false) g += `<circle class="fade" cx="${e[0]}" cy="${e[1]}" r="3.5" fill="${s.c}"/>`;
    if (s.label) g += `<text class="fade" x="${Math.min(e[0] + 6, W - R - 2)}" y="${e[1] - 6}" style="fill:${s.c};font-weight:600" text-anchor="${e[0] > W - 70 ? 'end' : 'start'}">${esc(s.label)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opts.aria || 'Chart')}">${g}</svg>`;
}

/**
 * Horizontal bar chart.
 * items: [{ l: label, v: number, c: color, tag?: string }]
 * opts: { fmt: v => string, aria, labelW?: 230 }
 */
export function barChart(items, opts = {}) {
  const W = 640, rowH = 38, L = opts.labelW || 230, R = 86, H = items.length * rowH + 8;
  const f = opts.fmt || (v => fmt(v));
  const mx = Math.max(...items.map(i => isFinite(i.v) ? Math.abs(i.v) : 0)) * 1.04 || 1;
  let g = '';
  items.forEach((it, k) => {
    const y = k * rowH + 6; const ok = isFinite(it.v); const w = ok ? (W - L - R) * Math.abs(it.v) / mx : 0;
    g += `<text x="${L - 10}" y="${y + 19}" text-anchor="end" style="fill:var(--ink);font-size:12.5px;font-weight:${it.strong ? 700 : 500}">${esc(it.l)}</text>`;
    g += `<rect x="${L}" y="${y + 5}" width="${W - L - R}" height="22" rx="6" fill="var(--bg-2)"/>`;
    if (ok) g += `<rect class="grow" style="animation-delay:${k * 70}ms" x="${L}" y="${y + 5}" width="${w.toFixed(1)}" height="22" rx="6" fill="${it.c || 'var(--chart-1)'}"/>`;
    g += `<text class="fade" x="${L + w + 8}" y="${y + 20}" style="fill:var(--ink);font-family:var(--font-mono);font-size:12px;font-weight:600">${ok ? esc(f(it.v)) : '—'}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opts.aria || 'Bar chart')}">${g}</svg>`;
}

/**
 * Vertical column chart (e.g. a distribution).
 * items: [{ l: label, v: number, c?: color }]
 */
export function columnChart(items, opts = {}) {
  const W = 640, H = opts.h || 220, L = 44, R = 12, T = 12, B = 30;
  const mx = (opts.max ?? Math.max(...items.map(i => i.v))) || 1;
  const bw = (W - L - R) / items.length;
  const f = opts.yfmt || (v => fmt(v, 2));
  let g = '';
  for (let k = 0; k <= 4; k++) { const v = mx * k / 4, y = T + (H - T - B) * (1 - k / 4); g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 4}" text-anchor="end">${esc(f(v))}</text>`; }
  items.forEach((it, i) => {
    const h = (H - T - B) * it.v / mx, x = L + i * bw + bw * .14, w = bw * .72, y = H - B - h;
    g += `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(0, h)}" rx="4" fill="${it.c || 'var(--chart-1)'}" style="transform-origin:${x + w / 2}px ${H - B}px;animation:colGrow .8s var(--ease) ${i * 40}ms both"/>`;
    g += `<text x="${x + w / 2}" y="${H - 10}" text-anchor="middle">${esc(it.l)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(opts.aria || 'Column chart')}"><style>@keyframes colGrow{from{transform:scaleY(0)}}</style>${g}</svg>`;
}

/** Circular progress ring. p in [0,1]. */
export function ring(p, { size = 56, label, done = false, stroke = 6 } = {}) {
  const r = 50 - stroke, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, p)));
  const lbl = label ?? Math.round(p * 100) + '%';
  return `<div class="ring ${done ? 'done' : ''}" style="--size:${size}px" role="img" aria-label="${esc(typeof lbl === 'string' ? lbl : '')} complete">
    <svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="${r}" fill="none" stroke-width="${stroke}"/>
    <circle class="val" cx="50" cy="50" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${c.toFixed(2)}" data-off="${off.toFixed(2)}"/></svg>
    <span class="lbl">${lbl}</span></div>`;
}
/** Animate rings from 0 to their value once in the DOM. */
export function animateRings(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.querySelectorAll('.ring .val[data-off]').forEach(c => { c.style.strokeDashoffset = c.dataset.off; });
  }));
}

/**
 * Decorative hero graphic: loss development curves converging to ultimate, drawn in sequence.
 */
export function heroCurves() {
  const W = 720, H = 420; let g = '';
  for (let i = 0; i <= 6; i++) { const y = 40 + i * 56; g += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="rgba(159,179,209,.12)"/>`; }
  for (let i = 0; i <= 9; i++) { const x = 30 + i * 74; g += `<line x1="${x}" x2="${x}" y1="20" y2="${H - 20}" stroke="rgba(159,179,209,.07)"/>`; }
  const curves = [[.40, .9], [.48, .78], [.36, .72], [.52, .66], [.30, .58], [.44, .5], [.58, .44]];
  curves.forEach(([start, k], idx) => {
    const pts = []; const ult = 0.84 - idx * 0.035;
    for (let i = 0; i < 10; i++) { const t = i / 9; const v = ult - (ult - start * ult) * Math.exp(-4.2 * t * k * 1.4); pts.push([30 + i * 74, H - 40 - v * (H - 90)]); }
    const n = 10 - idx;                                         // younger years have fewer points
    const known = pts.slice(0, n), proj = pts.slice(n - 1);
    const d = 'M' + known.map(p => p.join(',')).join('L');
    const color = idx < 3 ? 'rgba(103,232,249,.95)' : idx < 5 ? 'rgba(139,141,251,.85)' : 'rgba(234,242,255,.55)';
    g += `<path class="draw" pathLength="1" style="--len:1;animation-duration:2.2s;animation-delay:${idx * 180}ms" d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (proj.length > 1) g += `<path class="fade" style="animation-delay:${1.6 + idx * .18}s" d="M${proj.map(p => p.join(',')).join('L')}" fill="none" stroke="${color}" stroke-width="1.6" stroke-dasharray="4 6" opacity=".7"/>`;
    const e = known[known.length - 1];
    g += `<circle class="fade" style="animation-delay:${1.2 + idx * .18}s" cx="${e[0]}" cy="${e[1]}" r="4" fill="${color}"/>`;
  });
  g += `<g class="fade" style="animation-delay:2.6s"><rect x="520" y="40" width="170" height="64" rx="12" fill="rgba(10,23,48,.75)" stroke="rgba(103,232,249,.35)"/>
    <text x="536" y="64" style="fill:#9FB3D1;font-size:11px;font-family:var(--font-ui);letter-spacing:.08em">PROJECTED ULTIMATE</text>
    <text x="536" y="91" style="fill:#EAF2FF;font-size:22px;font-weight:700;font-family:var(--font-display)">$21.7M</text></g>`;
  return `<svg class="chart hero-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg>`;
}
