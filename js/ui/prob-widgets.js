// Interactive visuals for the Exam P random-variable lessons. Each takes a host element and renders itself.
//   distWidget      continuous distribution explorer (uniform, exponential, gamma, normal) with P(a < X < b)
//   coverageWidget  deductible / maximum covered loss / coinsurance on an exponential loss
//   jointWidget     editable 3×3 joint PMF: marginals, conditionals, E, Var, Cov, correlation, independence
//   cltWidget       central limit theorem: simulated sums of n iid claims against the normal curve
// Charts are plain SVG and use the theme's CSS variables.
import { esc, icon, mulberry, Phi } from '../util.js';

/* ---------- shared helpers ---------- */
const f = (x, dp = 4) => { if (!isFinite(x)) return '—'; const s = (+x.toFixed(dp)).toString(); return s; };
const money = x => isFinite(x) ? '$' + Math.round(x).toLocaleString('en-US') : '—';
const sl = (id, label, min, max, step, val, aria) => `<div class="sl"><label for="${id}"><span>${label}</span><output data-out="${id}"></output></label>
  <input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-k="${id}" aria-label="${esc(aria || label)}"></div>`;
const uid = (() => { let n = 0; return p => p + (++n); })();
const head = (ic, t, d) => `<div class="viz-head"><span class="viz-tag">${icon(ic)} Interactive</span><h3>${t}</h3><p class="small muted">${d}</p></div>`;
const stat = (l, v, cls = '') => `<div class="pw-stat ${cls}"><span>${l}</span><b>${v}</b></div>`;

// log-gamma (Lanczos) and the regularized lower incomplete gamma P(a, x)
function lgamma(z) {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1; let x = c[0]; for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
export function gammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) { let sum = 1 / a, term = sum; for (let n = 1; n < 500; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-14) break; } return Math.min(1, sum * Math.exp(-x + a * Math.log(x) - lgamma(a))); }
  let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; }
  return Math.max(0, 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h);
}
const PhiAcc = z => { // more accurate than the util erf for tails
  const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
};

/** Area-under-curve SVG: pdf over [x0, x1] with [lo, hi] shaded. */
function curveSvg({ W = 520, H = 230, x0, x1, pdf, lo, hi, ymax, label, vlines = [], curve2 = null }) {
  const L = 40, R = 12, T = 12, B = 30, pw = W - L - R, ph = H - T - B, N = 220;
  const X = x => L + (x - x0) / (x1 - x0) * pw, Y = y => T + ph - Math.min(1.05, y / ymax) * ph;
  const pts = []; for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; pts.push([x, pdf(x)]); }
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('');
  const a = Math.max(x0, Math.min(lo, hi)), b = Math.min(x1, Math.max(lo, hi));
  let area = '';
  if (b > a) { const sp = []; for (let i = 0; i <= 120; i++) { const x = a + (b - a) * i / 120; sp.push(`${X(x).toFixed(1)},${Y(pdf(x)).toFixed(1)}`); } area = `<path class="pw-area" d="M${X(a).toFixed(1)},${Y(0)} L${sp.join(' L')} L${X(b).toFixed(1)},${Y(0)} Z"/>`; }
  const ticks = []; const step = niceStep((x1 - x0) / 6); for (let t = Math.ceil(x0 / step) * step; t <= x1 + 1e-9; t += step) ticks.push(t);
  const c2 = curve2 ? (() => { const q = []; for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; q.push(`${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(curve2(x)).toFixed(1)}`); } return `<path class="pw-curve2" d="${q.join('')}"/>`; })() : '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
    <line class="pw-axis" x1="${L}" y1="${Y(0)}" x2="${W - R}" y2="${Y(0)}"/>
    ${ticks.map(t => `<line class="pw-gl" x1="${X(t)}" y1="${T}" x2="${X(t)}" y2="${Y(0)}"/><text class="pw-tick" x="${X(t)}" y="${H - 10}" text-anchor="middle">${+t.toFixed(4)}</text>`).join('')}
    ${area}<path class="pw-curve" d="${path}"/>${c2}
    ${vlines.map(([x, cls, txt]) => x >= x0 && x <= x1 ? `<line class="pw-v ${cls}" x1="${X(x)}" y1="${T}" x2="${X(x)}" y2="${Y(0)}"/><text class="pw-vt ${cls}" x="${X(x) + 4}" y="${T + 12 + (cls === 'med' ? 15 : 0)}">${esc(txt)}</text>` : '').join('')}
  </svg>`;
}
function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }

/* =====================================================================
   1. Continuous distribution explorer
   ===================================================================== */
const DISTS = {
  uniform: { name: 'Uniform', params: [['p1', 'a (lower end)', 0, 10, 0.5, 2], ['p2', 'b (upper end)', 1, 20, 0.5, 10]],
    fix: s => { if (s.p2 <= s.p1) s.p2 = s.p1 + 0.5; },
    range: s => [Math.max(0, s.p1 - 2), s.p2 + 2],
    pdf: s => x => (x >= s.p1 && x <= s.p2) ? 1 / (s.p2 - s.p1) : 0,
    cdf: s => x => x <= s.p1 ? 0 : x >= s.p2 ? 1 : (x - s.p1) / (s.p2 - s.p1),
    mean: s => (s.p1 + s.p2) / 2, vr: s => (s.p2 - s.p1) ** 2 / 12,
    tex: s => `f(x) = 1/(b − a) = 1/${f(s.p2 - s.p1, 2)} on [${f(s.p1, 2)}, ${f(s.p2, 2)}]` },
  exponential: { name: 'Exponential', params: [['p1', 'θ (mean)', 0.5, 10, 0.5, 2]],
    range: s => [0, 5 * s.p1], pdf: s => x => x < 0 ? 0 : Math.exp(-x / s.p1) / s.p1, cdf: s => x => x <= 0 ? 0 : 1 - Math.exp(-x / s.p1),
    mean: s => s.p1, vr: s => s.p1 ** 2, tex: s => `f(x) = e^(−x/${f(s.p1, 2)}) / ${f(s.p1, 2)}, x > 0` },
  gamma: { name: 'Gamma', params: [['p1', 'α (shape)', 0.5, 10, 0.5, 3], ['p2', 'θ (scale)', 0.5, 5, 0.5, 1.5]],
    range: s => [0, s.p1 * s.p2 + 4.5 * Math.sqrt(s.p1) * s.p2],
    pdf: s => x => x <= 0 ? 0 : Math.exp((s.p1 - 1) * Math.log(x) - x / s.p2 - lgamma(s.p1) - s.p1 * Math.log(s.p2)),
    cdf: s => x => gammaP(s.p1, Math.max(0, x) / s.p2), mean: s => s.p1 * s.p2, vr: s => s.p1 * s.p2 ** 2,
    tex: s => `α = ${f(s.p1, 2)}, θ = ${f(s.p2, 2)}: a sum of ${Number.isInteger(s.p1) ? s.p1 : f(s.p1, 2)} exponential waits when α is whole` },
  normal: { name: 'Normal', params: [['p1', 'μ (mean)', 0, 20, 0.5, 10], ['p2', 'σ (std. deviation)', 0.5, 6, 0.25, 2]],
    range: s => [s.p1 - 4 * s.p2, s.p1 + 4 * s.p2],
    pdf: s => x => Math.exp(-0.5 * ((x - s.p1) / s.p2) ** 2) / (s.p2 * Math.sqrt(2 * Math.PI)), cdf: s => x => PhiAcc((x - s.p1) / s.p2),
    mean: s => s.p1, vr: s => s.p2 ** 2, tex: s => `Standardize: Z = (X − ${f(s.p1, 2)}) / ${f(s.p2, 2)}` },
};
function quantile(cdf, p, lo, hi) { for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }

export function distWidget(host) {
  const id = uid('dw');
  const s = { d: 'exponential', p1: 2, p2: 0, lo: 20, hi: 60, view: 'pdf' };
  host.innerHTML = `<div class="viz pw">
    ${head('chart', 'Distribution explorer', 'Pick a distribution and drag its parameters. The shaded area is P(a < X < b). Switch to the CDF to see the same probability as a height difference.')}
    <div class="pw-tabs" role="group" aria-label="Distribution">${Object.entries(DISTS).map(([k, d]) => `<button type="button" class="chip" data-dist="${k}" aria-pressed="${k === s.d}">${d.name}</button>`).join('')}</div>
    <div class="pw-grid">
      <div class="pw-ctrls"><div data-params></div>
        ${sl(id + 'lo', 'a (interval start)', 0, 100, 1, s.lo, 'Interval start')}
        ${sl(id + 'hi', 'b (interval end)', 0, 100, 1, s.hi, 'Interval end')}
        <div class="seg" role="group" aria-label="Chart type"><button type="button" data-view="pdf" aria-pressed="true">PDF</button><button type="button" data-view="cdf" aria-pressed="false">CDF</button></div>
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function setDist(k) {
    s.d = k; const D = DISTS[k];
    D.params.forEach(([p, , , , , v]) => { s[p] = v; });
    q('[data-params]').innerHTML = D.params.map(([p, l, mn, mx, st]) => sl(id + p, l, mn, mx, st, s[p])).join('');
    host.querySelectorAll('[data-dist]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dist === k)));
    draw();
  }
  function draw() {
    const D = DISTS[s.d]; D.fix && D.fix(s);
    D.params.forEach(([p]) => { const inp = q(`#${id + p}`); if (inp) inp.value = s[p]; const o = q(`[data-out="${id + p}"]`); if (o) o.textContent = f(s[p], 2); });
    const [x0, x1] = D.range(s), pdf = D.pdf(s), cdf = D.cdf(s);
    const a = x0 + (x1 - x0) * Math.min(s.lo, s.hi) / 100, b = x0 + (x1 - x0) * Math.max(s.lo, s.hi) / 100;
    q(`[data-out="${id}lo"]`).textContent = f(a, 2); q(`[data-out="${id}hi"]`).textContent = f(b, 2);
    const prob = cdf(b) - cdf(a), m = D.mean(s), v = D.vr(s), med = quantile(cdf, 0.5, x0 - (x1 - x0), x1 + (x1 - x0));
    let ymax = 0; for (let i = 0; i <= 200; i++) ymax = Math.max(ymax, pdf(x0 + (x1 - x0) * i / 200));
    if (s.d === 'gamma' && s.p1 < 1) ymax = Math.min(ymax, 3 * pdf(m));
    const fig = s.view === 'pdf'
      ? curveSvg({ x0, x1, pdf, lo: a, hi: b, ymax: ymax || 1, label: `${D.name} density with P(a < X < b) shaded`, vlines: [[m, 'mean', 'mean'], [med, 'med', 'median']] })
      : curveSvg({ x0, x1, pdf: cdf, lo: 0, hi: 0, ymax: 1, label: `${D.name} CDF`, vlines: [[a, 'mean', `F(a)=${f(cdf(a), 3)}`], [b, 'med', `F(b)=${f(cdf(b), 3)}`]] });
    q('[data-fig]').innerHTML = fig;
    q('[data-stats]').innerHTML = stat('P(a < X < b)', prob.toFixed(4), 'hero') + stat('Mean E[X]', f(m, 3)) + stat('Variance', f(v, 3)) + stat('Std. deviation', f(Math.sqrt(v), 3)) + stat('Median', f(med, 3));
    q('[data-note]').textContent = D.tex(s) + (s.d === 'exponential' ? `. Memoryless: P(X > a + t | X > a) = P(X > t).` : s.d === 'normal' ? `. Here P(a < X < b) = Φ(${f((b - s.p1) / s.p2, 2)}) − Φ(${f((a - s.p1) / s.p2, 2)}).` : '.');
  }
  host.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; const key = k.slice(id.length); s[key] = +e.target.value; draw(); });
  host.addEventListener('click', e => {
    const d = e.target.closest('[data-dist]'); if (d) return setDist(d.dataset.dist);
    const v = e.target.closest('[data-view]'); if (v) { s.view = v.dataset.view; host.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === v))); draw(); }
  });
  setDist(s.d);
}

/* =====================================================================
   2. Deductible, maximum covered loss and coinsurance (exponential losses)
   ===================================================================== */
export function coverageWidget(host) {
  const id = uid('cw');
  const s = { th: 2000, d: 500, m: 6000, al: 80, x: 3000 };
  host.innerHTML = `<div class="viz pw">
    ${head('shield', 'Deductible and limit explorer', 'Losses are exponential with the mean you choose. Set an ordinary deductible d, a maximum covered loss u and a coinsurance rate, and watch what the insurer pays.')}
    <div class="pw-grid">
      <div class="pw-ctrls">
        ${sl(id + 'th', 'Mean loss θ', 500, 5000, 100, s.th)}
        ${sl(id + 'd', 'Deductible d', 0, 3000, 50, s.d)}
        ${sl(id + 'm', 'Maximum covered loss u', 500, 15000, 250, s.m)}
        ${sl(id + 'al', 'Coinsurance α', 50, 100, 5, s.al)}
        ${sl(id + 'x', 'One loss of size x', 0, 15000, 100, s.x)}
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  const lim = (th, k) => th * (1 - Math.exp(-k / th));           // E[X ∧ k] for exponential(θ)
  function draw() {
    if (s.m < s.d) s.m = s.d;
    const al = s.al / 100, { th, d, m, x } = s;
    ['th', 'd', 'm', 'x'].forEach(k => { q(`#${id + k}`).value = s[k]; q(`[data-out="${id + k}"]`).textContent = money(s[k]); });
    q(`[data-out="${id}al"]`).textContent = s.al + '%';
    const pay = y => al * Math.max(0, Math.min(y, m) - d);
    const perLoss = al * (lim(th, m) - lim(th, d)), sd = Math.exp(-d / th), perPay = sd > 0 ? perLoss / sd : NaN;
    const ler = lim(th, d) / th;
    // chart: payment function over loss size, with the loss density shaded underneath
    const W = 520, H = 240, L = 50, R = 14, T = 14, B = 30, pw = W - L - R, ph = H - T - B, X1 = 15000, P1 = Math.max(1, al * (m - d)) * 1.15;
    const X = v => L + v / X1 * pw, Y = v => T + ph - v / P1 * ph;
    const dens = []; const dmax = 1 / th; for (let i = 0; i <= 150; i++) { const v = X1 * i / 150; dens.push(`${X(v).toFixed(1)},${(T + ph - (Math.exp(-v / th) / th) / dmax * ph * 0.55).toFixed(1)}`); }
    const pts = [[0, 0], [d, 0], [m, pay(m)], [X1, pay(m)]];
    const ticks = [0, 3000, 6000, 9000, 12000, 15000];
    q('[data-fig]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Insurer payment as a function of loss size, with the loss density shaded">
      <path class="pw-dens" d="M${X(0)},${Y(0)} L${dens.join(' L')} L${X(X1)},${Y(0)} Z"/>
      <line class="pw-axis" x1="${L}" y1="${Y(0)}" x2="${W - R}" y2="${Y(0)}"/><line class="pw-axis" x1="${L}" y1="${T}" x2="${L}" y2="${Y(0)}"/>
      ${ticks.map(t => `<text class="pw-tick" x="${X(t)}" y="${H - 10}" text-anchor="middle">${t / 1000}k</text>`).join('')}
      <text class="pw-tick" x="${L - 6}" y="${Y(pay(m)) + 4}" text-anchor="end">${(pay(m) / 1000).toFixed(1)}k</text>
      <path class="pw-curve" d="M${pts.map(([a, b]) => `${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(' L')}"/>
      <line class="pw-v mean" x1="${X(d)}" y1="${T}" x2="${X(d)}" y2="${Y(0)}"/><text class="pw-vt mean" x="${X(d) + 4}" y="${T + 12}">d</text>
      <line class="pw-v med" x1="${X(m)}" y1="${T}" x2="${X(m)}" y2="${Y(0)}"/><text class="pw-vt med" x="${X(m) + 4}" y="${T + 12}">u</text>
      <circle class="pw-dot" cx="${X(Math.min(x, X1))}" cy="${Y(pay(x))}" r="6"/>
    </svg><figcaption class="tiny muted">Line: insurer pays α(min(x, u) − d)₊. Shaded: how likely each loss size is.</figcaption>`;
    q('[data-stats]').innerHTML = stat(`Payment on a ${money(x)} loss`, money(pay(x)), 'hero') + stat('Expected loss E[X]', money(th)) + stat('Expected payment per loss', money(perLoss)) + stat('P(payment > 0)', f(sd, 4)) + stat('Expected payment per payment', money(perPay)) + stat('Loss elimination ratio', f(ler * 100, 1) + '%');
    q('[data-note]').textContent = `Per loss: α(E[X∧u] − E[X∧d]) = ${al}(${money(lim(th, m))} − ${money(lim(th, d))}) = ${money(perLoss)}, using E[X∧k] = θ(1 − e^(−k/θ)) for exponential losses. Per payment divides by P(X > d) = e^(−d/θ).`;
  }
  host.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; s[k.slice(id.length)] = +e.target.value; draw(); });
  draw();
}

/* =====================================================================
   3. Joint PMF table
   ===================================================================== */
export function jointWidget(host) {
  const xs = [0, 1, 2], ys = [0, 1, 2];
  // claims on auto (X) and home (Y) policies for one household
  let p = [[0.30, 0.10, 0.05], [0.15, 0.12, 0.08], [0.05, 0.07, 0.08]];
  let given = 1;
  host.innerHTML = `<div class="viz pw">
    ${head('table', 'Joint distribution table', 'X = auto claims, Y = home claims for a household. Edit any cell (they must add to 1) and every summary updates.')}
    <div class="pw-grid pw-grid-joint">
      <div class="tblwrap"><table class="pw-joint" data-tbl></table></div>
      <div class="pw-ctrls">
        <div class="seg" role="group" aria-label="Condition on X">${xs.map(x => `<button type="button" data-given="${x}" aria-pressed="${x === given}">X = ${x}</button>`).join('')}</div>
        <div data-cond class="small"></div>
        <div class="row"><button type="button" class="btn sm ghost" data-preset="indep">Make X and Y independent</button><button type="button" class="btn sm quiet" data-preset="reset">Reset</button></div>
      </div>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function draw(rebuild = true) {
    const total = p.flat().reduce((a, b) => a + b, 0);
    const px = p.map(r => r.reduce((a, b) => a + b, 0)), py = ys.map((_, j) => p.reduce((a, r) => a + r[j], 0));
    const EX = xs.reduce((a, x, i) => a + x * px[i], 0), EY = ys.reduce((a, y, j) => a + y * py[j], 0);
    const EX2 = xs.reduce((a, x, i) => a + x * x * px[i], 0), EY2 = ys.reduce((a, y, j) => a + y * y * py[j], 0);
    let EXY = 0; xs.forEach((x, i) => ys.forEach((y, j) => { EXY += x * y * p[i][j]; }));
    const VX = EX2 - EX * EX, VY = EY2 - EY * EY, cov = EXY - EX * EY, rho = cov / Math.sqrt(VX * VY);
    const indep = xs.every((_, i) => ys.every((_, j) => Math.abs(p[i][j] - px[i] * py[j]) < 5e-4));
    if (rebuild) q('[data-tbl]').innerHTML = `<thead><tr><th scope="col">X \\ Y</th>${ys.map(y => `<th scope="col">Y = ${y}</th>`).join('')}<th scope="col">P(X = x)</th></tr></thead>
      <tbody>${xs.map((x, i) => `<tr${i === given ? ' class="given"' : ''}><th scope="row">X = ${x}</th>${ys.map((y, j) => `<td><input type="number" min="0" max="1" step="0.01" value="${p[i][j]}" data-c="${i},${j}" aria-label="P(X = ${x}, Y = ${y})"></td>`).join('')}<td class="num" data-px="${i}"></td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row">P(Y = y)</th>${ys.map((_, j) => `<td class="num" data-py="${j}"></td>`).join('')}<td class="num" data-tot></td></tr></tfoot>`;
    px.forEach((v, i) => { q(`[data-px="${i}"]`).textContent = f(v, 3); }); py.forEach((v, j) => { q(`[data-py="${j}"]`).textContent = f(v, 3); });
    const tot = q('[data-tot]'); tot.textContent = f(total, 3); tot.classList.toggle('bad', Math.abs(total - 1) > 1e-6);
    host.querySelectorAll('[data-tbl] tbody tr').forEach((tr, i) => tr.classList.toggle('given', i === given));
    const pg = px[given];
    const cond = ys.map((_, j) => pg > 0 ? p[given][j] / pg : NaN);
    const EYg = ys.reduce((a, y, j) => a + y * cond[j], 0);
    q('[data-cond]').innerHTML = `<b>Conditional distribution of Y given X = ${given}</b><div class="pw-bars">${ys.map((y, j) => `<div class="pw-bar"><span>Y = ${y}</span><i style="width:${Math.round((cond[j] || 0) * 100)}%"></i><b>${f(cond[j], 3)}</b></div>`).join('')}</div><span class="muted">E[Y | X = ${given}] = ${f(EYg, 3)} (row ÷ ${f(pg, 3)})</span>`;
    q('[data-stats]').innerHTML = stat('E[X]', f(EX, 3)) + stat('E[Y]', f(EY, 3)) + stat('Var(X)', f(VX, 4)) + stat('Var(Y)', f(VY, 4)) + stat('Cov(X, Y)', f(cov, 4), 'hero') + stat('Correlation ρ', f(rho, 3));
    q('[data-note]').innerHTML = Math.abs(total - 1) > 1e-6 ? `<b class="bad-t">The cells add to ${f(total, 3)}, not 1.</b> A joint PMF must total 1.`
      : indep ? `<b>Independent:</b> every cell equals P(X = x)·P(Y = y), so Cov(X, Y) = 0.`
      : `<b>Not independent:</b> for example P(X = 0, Y = 0) = ${f(p[0][0], 3)} but P(X = 0)·P(Y = 0) = ${f(px[0] * py[0], 4)}. Cov(X, Y) = E[XY] − E[X]E[Y] = ${f(EXY, 3)} − ${f(EX, 3)}·${f(EY, 3)} = ${f(cov, 4)}.`;
  }
  host.addEventListener('input', e => { const c = e.target.dataset.c; if (!c) return; const [i, j] = c.split(',').map(Number); const v = parseFloat(e.target.value); p[i][j] = isFinite(v) && v >= 0 ? v : 0; draw(false); });
  host.addEventListener('click', e => {
    const g = e.target.closest('[data-given]'); if (g) { given = +g.dataset.given; host.querySelectorAll('[data-given]').forEach(b => b.setAttribute('aria-pressed', String(b === g))); draw(false); return; }
    const pr = e.target.closest('[data-preset]'); if (!pr) return;
    if (pr.dataset.preset === 'reset') p = [[0.30, 0.10, 0.05], [0.15, 0.12, 0.08], [0.05, 0.07, 0.08]];
    else { const px = p.map(r => r.reduce((a, b) => a + b, 0)), py = ys.map((_, j) => p.reduce((a, r) => a + r[j], 0)); p = px.map(a => py.map(b => +(a * b).toFixed(4))); }
    draw(true);
  });
  draw(true);
}

/* =====================================================================
   4. Central limit theorem simulator
   ===================================================================== */
const CLAIMS = {
  exp: { name: 'Exponential (mean 1)', mu: 1, sd: 1, draw: r => -Math.log(1 - r()) },
  bern: { name: 'Claim or not (p = 0.1)', mu: 0.1, sd: Math.sqrt(0.09), draw: r => r() < 0.1 ? 1 : 0 },
  unif: { name: 'Uniform (0, 2)', mu: 1, sd: Math.sqrt(4 / 12), draw: r => 2 * r() },
  skew: { name: 'Heavy right tail (lognormal)', mu: Math.exp(0.5), sd: Math.sqrt((Math.E - 1) * Math.E), draw: r => { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.exp(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)); } },
};
export function cltWidget(host) {
  const id = uid('clt');
  const s = { c: 'exp', n: 1, seed: 7 };
  host.innerHTML = `<div class="viz pw">
    ${head('chart', 'Central limit theorem simulator', 'The chart shows 4,000 simulated totals of n independent claims, standardized. As n grows, the shape approaches the normal curve, whatever a single claim looks like.')}
    <div class="pw-tabs" role="group" aria-label="Claim distribution">${Object.entries(CLAIMS).map(([k, c]) => `<button type="button" class="chip" data-claim="${k}" aria-pressed="${k === s.c}">${c.name}</button>`).join('')}</div>
    <div class="pw-grid">
      <div class="pw-ctrls">
        ${sl(id + 'n', 'n (claims per total)', 1, 100, 1, s.n, 'Number of claims added together')}
        <div class="row"><button type="button" class="btn sm ghost" data-n="1">n = 1</button><button type="button" class="btn sm ghost" data-n="5">5</button><button type="button" class="btn sm ghost" data-n="30">30</button><button type="button" class="btn sm ghost" data-n="100">100</button></div>
        <button type="button" class="btn sm quiet" data-resim>${icon('refresh')} New simulation</button>
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function draw() {
    const C = CLAIMS[s.c], n = s.n, r = mulberry(s.seed * 1000 + n), M = 4000;
    q(`#${id}n`).value = n; q(`[data-out="${id}n"]`).textContent = n;
    const mu = n * C.mu, sd = Math.sqrt(n) * C.sd;
    const z = []; for (let k = 0; k < M; k++) { let t = 0; for (let i = 0; i < n; i++) t += C.draw(r); z.push((t - mu) / sd); }
    const lo = -4, hi = 4, nb = 32, w = (hi - lo) / nb, bins = new Array(nb).fill(0);
    z.forEach(v => { const b = Math.floor((v - lo) / w); if (b >= 0 && b < nb) bins[b]++; });
    const dens = bins.map(c => c / (M * w)), phi = x => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    const ymax = Math.max(0.45, ...dens) * 1.05;
    const W = 520, H = 230, L = 34, R = 12, T = 12, B = 30, pw = W - L - R, ph = H - T - B;
    const X = x => L + (x - lo) / (hi - lo) * pw, Y = y => T + ph - y / ymax * ph;
    const curve = []; for (let i = 0; i <= 160; i++) { const x = lo + (hi - lo) * i / 160; curve.push(`${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(phi(x)).toFixed(1)}`); }
    q('[data-fig]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Histogram of standardized sums of ${n} claims with the standard normal curve">
      <line class="pw-axis" x1="${L}" y1="${Y(0)}" x2="${W - R}" y2="${Y(0)}"/>
      ${[-3, -2, -1, 0, 1, 2, 3].map(t => `<text class="pw-tick" x="${X(t)}" y="${H - 10}" text-anchor="middle">${t}</text>`).join('')}
      ${dens.map((d, b) => `<rect class="pw-hist" x="${(X(lo + b * w) + 0.5).toFixed(1)}" y="${Y(d).toFixed(1)}" width="${(pw / nb - 1).toFixed(1)}" height="${(Y(0) - Y(d)).toFixed(1)}"/>`).join('')}
      <path class="pw-curve2" d="${curve.join('')}"/>
    </svg><figcaption class="tiny muted">Bars: simulated (S − nμ)/(σ√n). Line: standard normal density.</figcaption>`;
    const tail = z.filter(v => v > 1.645).length / M;
    q('[data-stats]').innerHTML = stat('E[S] = nμ', f(mu, 3)) + stat('SD(S) = σ√n', f(sd, 3)) + stat('Simulated P(Z > 1.645)', f(tail, 3), 'hero') + stat('Normal approximation', '0.050');
    q('[data-note]').textContent = n === 1 ? 'With n = 1 you just see one claim\'s own shape. Increase n and watch the skew wash out.' : `By the CLT, S is approximately normal with mean ${f(mu, 2)} and standard deviation ${f(sd, 3)}. The closer the simulated tail is to 0.050, the better the normal approximation for this n.`;
  }
  host.addEventListener('input', e => { if (e.target.dataset.k === id + 'n') { s.n = +e.target.value; draw(); } });
  host.addEventListener('click', e => {
    const c = e.target.closest('[data-claim]'); if (c) { s.c = c.dataset.claim; host.querySelectorAll('[data-claim]').forEach(b => b.setAttribute('aria-pressed', String(b === c))); draw(); return; }
    const nn = e.target.closest('[data-n]'); if (nn) { s.n = +nn.dataset.n; draw(); return; }
    if (e.target.closest('[data-resim]')) { s.seed++; draw(); }
  });
  draw();
}
