// Interactive visuals for the Exam FM lessons. Each takes a host element and renders itself.
//   timelineWidget   cash flows on a timeline, valued at any focal date (equations of value)
//   amortWidget      level-payment loan: payment, schedule, interest vs principal, outstanding balance
//   priceYieldWidget bond price vs yield with the duration tangent (convexity made visible)
//   immunizeWidget   full immunization of one liability with two zero-coupon assets under rate shocks
import { esc, icon } from '../util.js';

const uid = (() => { let n = 0; return p => p + (++n); })();
const money = (x, dp = 0) => isFinite(x) ? (x < 0 ? '−$' : '$') + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }) : '—';
const f = (x, dp = 4) => isFinite(x) ? String(+x.toFixed(dp)) : '—';
const sl = (id, label, min, max, step, val) => `<div class="sl"><label for="${id}"><span>${label}</span><output data-out="${id}"></output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-k="${id}" aria-label="${esc(label)}"></div>`;
const head = (ic, t, d) => `<div class="viz-head"><span class="viz-tag">${icon(ic)} Interactive</span><h3>${t}</h3><p class="small muted">${d}</p></div>`;
const stat = (l, v, cls = '') => `<div class="pw-stat ${cls}"><span>${l}</span><b>${v}</b></div>`;
function niceStep(raw) { const p = Math.pow(10, Math.floor(Math.log10(raw))); const m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
function wire(host, id, s, draw) {
  host.addEventListener('input', e => { const k = e.target.dataset.k; if (!k || !k.startsWith(id)) return; s[k.slice(id.length)] = +e.target.value; draw(); });
}
function setOuts(host, id, s, fmts) { Object.entries(fmts).forEach(([k, fn]) => { const o = host.querySelector(`[data-out="${id + k}"]`); if (o) o.textContent = fn(s[k]); const i = host.querySelector(`#${id + k}`); if (i && +i.value !== s[k]) i.value = s[k]; }); }
/** Simple x/y line chart with optional extra series and a marker. */
function plot({ W = 520, H = 230, x0, x1, y0, y1, series, marker, xfmt = v => v, yfmt = v => v, label, xlab = '', ylab = '' }) {
  const L = 56, R = 14, T = 14, B = 34, pw = W - L - R, ph = H - T - B;
  const X = x => L + (x - x0) / (x1 - x0) * pw, Y = y => T + ph - (y - y0) / (y1 - y0) * ph;
  const xs = niceStep((x1 - x0) / 6), ys = niceStep((y1 - y0) / 5);
  let g = '';
  for (let t = Math.ceil(y0 / ys) * ys; t <= y1 + 1e-9; t += ys) g += `<line class="pw-gl" x1="${L}" y1="${Y(t)}" x2="${W - R}" y2="${Y(t)}"/><text class="pw-tick" x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${yfmt(t)}</text>`;
  for (let t = Math.ceil(x0 / xs) * xs; t <= x1 + 1e-9; t += xs) g += `<text class="pw-tick" x="${X(t)}" y="${H - 14}" text-anchor="middle">${xfmt(t)}</text>`;
  series.forEach(({ pts, cls }) => { const d = pts.filter(([x, y]) => isFinite(y)).map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))).toFixed(1)}`).join(''); g += `<path class="${cls}" d="${d}"/>`; });
  if (marker) g += `<circle class="pw-dot" cx="${X(marker[0])}" cy="${Y(marker[1])}" r="6"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}"><defs><clipPath id="clp${W}${H}"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs>
    <line class="pw-axis" x1="${L}" y1="${T + ph}" x2="${W - R}" y2="${T + ph}"/><line class="pw-axis" x1="${L}" y1="${T}" x2="${L}" y2="${T + ph}"/>${g}
    ${xlab ? `<text class="pw-tick" x="${W - R}" y="${H - 2}" text-anchor="end">${esc(xlab)}</text>` : ''}${ylab ? `<text class="pw-tick" x="${L}" y="${T - 3}">${esc(ylab)}</text>` : ''}</svg>`;
}

/* =====================================================================
   1. Cash-flow timeline
   ===================================================================== */
export function timelineWidget(host) {
  const id = uid('tl');
  const s = { i: 5, focal: 0 };
  let flows = [[0, -10000], [2, 3000], [4, 4000], [6, 5000]];
  host.innerHTML = `<div class="viz pw">
    ${head('clock', 'Cash-flow timeline', 'Edit the cash flows (negative = money out), set the interest rate, and slide the focal date. Every flow is moved to the focal date with (1 + i) raised to the time difference.')}
    <div class="pw-grid">
      <div class="pw-ctrls">
        ${sl(id + 'i', 'Effective annual rate i', 0, 15, 0.25, s.i)}
        ${sl(id + 'focal', 'Focal date t', 0, 10, 0.5, s.focal)}
        <div class="tblwrap"><table class="fm-flows"><thead><tr><th>Time</th><th>Amount</th><th></th></tr></thead><tbody data-rows></tbody></table></div>
        <button type="button" class="btn sm ghost" data-add>${icon('pencil')} Add a cash flow</button>
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function rows() {
    q('[data-rows]').innerHTML = flows.map(([t, a], k) => `<tr><td><input type="number" step="0.5" min="0" max="10" value="${t}" data-ft="${k}" aria-label="Time of cash flow ${k + 1}"></td><td><input type="number" step="100" value="${a}" data-fa="${k}" aria-label="Amount of cash flow ${k + 1}"></td><td><button type="button" class="btn sm quiet" data-del="${k}" aria-label="Remove cash flow ${k + 1}">${icon('x')}</button></td></tr>`).join('');
  }
  function draw() {
    setOuts(host, id, s, { i: v => v + '%', focal: v => 't = ' + v });
    const i = s.i / 100, val = t => flows.reduce((sum, [tk, a]) => sum + a * Math.pow(1 + i, t - tk), 0);
    const T = 10, W = 560, H = 210, L = 30, R = 30, mid = 112, pw = W - L - R, X = t => L + t / T * pw;
    const amax = Math.max(1, ...flows.map(([, a]) => Math.abs(a)));
    let g = `<line class="pw-axis" x1="${L}" y1="${mid}" x2="${W - R}" y2="${mid}"/>`;
    for (let t = 0; t <= T; t++) g += `<line class="pw-axis" x1="${X(t)}" y1="${mid - 4}" x2="${X(t)}" y2="${mid + 4}"/><text class="pw-tick" x="${X(t)}" y="${H - 6}" text-anchor="middle">${t}</text>`;
    flows.forEach(([t, a]) => { if (!(t >= 0 && t <= T) || !a) return; const h = 80 * Math.abs(a) / amax, up = a > 0; const y2 = up ? mid - h : mid + h;
      g += `<line class="fm-cf ${up ? 'in' : 'out'}" x1="${X(t)}" y1="${mid}" x2="${X(t)}" y2="${y2}"/><circle class="fm-cfd ${up ? 'in' : 'out'}" cx="${X(t)}" cy="${y2}" r="4"/><text class="pw-tick" x="${X(t) + 5}" y="${up ? y2 + 4 : y2 + 4}">${a > 0 ? '+' : '−'}${Math.abs(a).toLocaleString('en-US')}</text>`; });
    g += `<line class="pw-v med" x1="${X(s.focal)}" y1="10" x2="${X(s.focal)}" y2="${H - 22}"/><text class="pw-vt med" x="${X(s.focal) + 4}" y="20">focal date</text>`;
    q('[data-fig]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Timeline of cash flows with the focal date marked">${g}</svg><figcaption class="tiny muted">Up arrows: money received. Down arrows: money paid.</figcaption>`;
    const v0 = val(0), vf = val(s.focal), v10 = val(T);
    q('[data-stats]').innerHTML = stat(`Value at t = ${s.focal}`, money(vf, 2), 'hero') + stat('Present value (t = 0)', money(v0, 2)) + stat('Accumulated value (t = 10)', money(v10, 2)) + stat('Discount factor v', f(1 / (1 + i), 6));
    q('[data-note]').textContent = `Values at different dates are linked by (1 + i)^(time difference): ${money(v0, 2)} × ${f(1 + i, 4)}^${s.focal} = ${money(vf, 2)}. ${Math.abs(v0) < 0.5 ? 'The net present value is zero at this rate, so it is the internal rate of return.' : v0 > 0 ? 'Positive NPV: at this rate the inflows are worth more than the outflows.' : 'Negative NPV: at this rate the outflows are worth more.'}`;
  }
  host.addEventListener('input', e => {
    const d = e.target.dataset;
    if (d.ft != null) { flows[+d.ft][0] = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)); draw(); }
    else if (d.fa != null) { flows[+d.fa][1] = parseFloat(e.target.value) || 0; draw(); }
  });
  host.addEventListener('click', e => {
    if (e.target.closest('[data-add]')) { if (flows.length < 8) flows.push([Math.min(10, (flows[flows.length - 1]?.[0] || 0) + 1), 1000]); rows(); draw(); }
    const del = e.target.closest('[data-del]'); if (del && flows.length > 1) { flows.splice(+del.dataset.del, 1); rows(); draw(); }
  });
  wire(host, id, s, draw); rows(); draw();
}

/* =====================================================================
   2. Loan amortization
   ===================================================================== */
export function amortWidget(host) {
  const id = uid('am');
  const s = { P: 250000, r: 6, n: 30, m: 12, k: 60 };
  host.innerHTML = `<div class="viz pw">
    ${head('layers', 'Loan amortization explorer', 'A level-payment loan. Each payment first covers interest on the outstanding balance; the rest repays principal. Watch the split change over the life of the loan.')}
    <div class="seg" role="group" aria-label="Payments per year" style="margin-bottom:12px"><button type="button" data-m="12" aria-pressed="true">Monthly</button><button type="button" data-m="1" aria-pressed="false">Annual</button></div>
    <div class="pw-grid">
      <div class="pw-ctrls">
        ${sl(id + 'P', 'Amount borrowed L', 10000, 500000, 5000, s.P)}
        ${sl(id + 'r', 'Annual rate (nominal, convertible with payments)', 1, 12, 0.25, s.r)}
        ${sl(id + 'n', 'Term in years', 1, 30, 1, s.n)}
        ${sl(id + 'k', 'Balance just after payment k', 0, 360, 1, s.k)}
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <details class="disclose" style="margin-top:12px"><summary>Amortization schedule (first and last payments)</summary><div class="tblwrap" data-sched></div></details>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function draw() {
    const N = s.n * s.m; s.k = Math.min(s.k, N); const kIn = q(`#${id}k`); kIn.max = N;
    setOuts(host, id, s, { P: v => money(v), r: v => v + '%', n: v => v + ' yr', k: v => 'k = ' + v });
    const j = s.r / 100 / s.m, v = 1 / (1 + j), an = (1 - Math.pow(v, N)) / j, pmt = s.P / an;
    const bal = k => pmt * (1 - Math.pow(v, N - k)) / j;     // prospective
    const retro = k => s.P * Math.pow(1 + j, k) - pmt * (Math.pow(1 + j, k) - 1) / j;
    // yearly interest / principal totals
    const yrs = []; let B = s.P;
    for (let y = 0; y < s.n; y++) { let I = 0, Pr = 0; for (let t = 0; t < s.m; t++) { const it = B * j; I += it; Pr += pmt - it; B -= pmt - it; } yrs.push([I, Pr]); }
    const W = 520, H = 230, L = 56, R = 12, T = 12, Bm = 30, pw = W - L - R, ph = H - T - Bm, ymax = pmt * s.m * 1.05, bw = pw / s.n;
    const Y = y => T + ph - y / ymax * ph;
    let g = `<line class="pw-axis" x1="${L}" y1="${Y(0)}" x2="${W - R}" y2="${Y(0)}"/>`;
    const ys = niceStep(ymax / 5); for (let t = 0; t <= ymax; t += ys) g += `<line class="pw-gl" x1="${L}" y1="${Y(t)}" x2="${W - R}" y2="${Y(t)}"/><text class="pw-tick" x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${t >= 1000 ? Math.round(t / 1000) + 'k' : Math.round(t)}</text>`;
    yrs.forEach(([I, Pr], y) => { const x = L + y * bw + bw * 0.12, w = bw * 0.76; g += `<rect class="fm-int" x="${x}" y="${Y(I)}" width="${w}" height="${Y(0) - Y(I)}"/><rect class="fm-prin" x="${x}" y="${Y(I + Pr)}" width="${w}" height="${Y(I) - Y(I + Pr)}"/>`; if (s.n <= 15 || (y + 1) % 5 === 0) g += `<text class="pw-tick" x="${x + w / 2}" y="${H - 12}" text-anchor="middle">${y + 1}</text>`; });
    q('[data-fig]').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Interest and principal paid each year">${g}</svg><figcaption class="tiny muted"><span class="fm-key fm-int"></span> Interest &nbsp; <span class="fm-key fm-prin"></span> Principal, by loan year</figcaption>`;
    const totI = pmt * N - s.P;
    q('[data-stats]').innerHTML = stat(s.m === 12 ? 'Monthly payment' : 'Annual payment', money(pmt, 2), 'hero') + stat('Total interest', money(totI)) + stat(`Balance after payment ${s.k}`, money(bal(s.k), 2)) + stat(`Interest in payment ${Math.max(1, s.k)}`, money(bal(Math.max(1, s.k) - 1) * j, 2)) + stat(`Principal in payment ${Math.max(1, s.k)}`, money(pmt * Math.pow(v, N - Math.max(1, s.k) + 1), 2));
    const rowsAt = [1, 2, 3, null, N - 2, N - 1, N].filter((x, i, a) => x === null || (x >= 1 && a.indexOf(x) === i));
    q('[data-sched]').innerHTML = `<table><thead><tr><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance after</th></tr></thead><tbody>${rowsAt.map(k => k === null ? '<tr><td colspan="4" class="muted">…</td></tr>' : `<tr><td>${k}</td><td class="num">${money(bal(k - 1) * j, 2)}</td><td class="num">${money(pmt - bal(k - 1) * j, 2)}</td><td class="num">${money(Math.abs(bal(k)) < 0.005 ? 0 : bal(k), 2)}</td></tr>`).join('')}</tbody></table>`;
    q('[data-note]').textContent = `Payment = L / a(n) at j = ${f(j * 100, 4)}% per period over ${N} periods. Prospective balance (PV of the ${N - s.k} remaining payments) = ${money(bal(s.k), 2)}; retrospective (loan accumulated minus payments accumulated) = ${money(retro(s.k), 2)}. Principal repaid grows by the factor (1 + j) each payment.`;
  }
  host.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; const old = s.m; s.m = +b.dataset.m; s.k = Math.round(s.k * s.m / old); host.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); });
  wire(host, id, s, draw); draw();
}

/* =====================================================================
   3. Bond price vs yield
   ===================================================================== */
function bond(F, c, y, T) {  // semiannual coupons; c and y nominal annual (decimals)
  const n = Math.round(T * 2), r = c / 2, j = y / 2, v = 1 / (1 + j);
  let P = 0, D = 0, C = 0;
  for (let k = 1; k <= n; k++) { const cf = F * r + (k === n ? F : 0), pv = cf * Math.pow(v, k); P += pv; D += (k / 2) * pv; C += (k / 2) * (k / 2 + 0.5) * pv; }
  const mac = D / P, mod = mac / (1 + j), conv = C / P / Math.pow(1 + j, 2);
  return { P, mac, mod, conv };
}
export function priceYieldWidget(host) {
  const id = uid('py');
  const s = { c: 5, y: 6, T: 10 };
  const F = 1000;
  host.innerHTML = `<div class="viz pw">
    ${head('chart', 'Bond price–yield explorer', 'A $1,000 bond with semiannual coupons. Change the coupon rate, yield and term. The curve is the price at every yield; the dashed line is the duration estimate, and the gap between them is convexity.')}
    <div class="pw-grid">
      <div class="pw-ctrls">
        ${sl(id + 'c', 'Coupon rate (annual, paid semiannually)', 0, 12, 0.25, s.c)}
        ${sl(id + 'y', 'Yield to maturity (nominal, semiannual)', 0.5, 14, 0.25, s.y)}
        ${sl(id + 'T', 'Years to maturity', 1, 30, 1, s.T)}
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function draw() {
    setOuts(host, id, s, { c: v => v + '%', y: v => v + '%', T: v => v + ' yr' });
    const b = bond(F, s.c / 100, s.y / 100, s.T);
    const pts = [], tan = [];
    for (let k = 0; k <= 140; k++) { const y = 0.25 + k * 0.1; const p = bond(F, s.c / 100, y / 100, s.T).P; pts.push([y, p]); tan.push([y, b.P * (1 - b.mod * (y - s.y) / 100)]); }
    const ymax = Math.max(...pts.map(p => p[1])) * 1.05;
    q('[data-fig]').innerHTML = plot({ x0: 0, x1: 14.25, y0: 0, y1: ymax, series: [{ pts, cls: 'pw-curve' }, { pts: tan, cls: 'pw-curve2' }], marker: [s.y, b.P], xfmt: v => v + '%', yfmt: v => '$' + Math.round(v), label: 'Bond price against yield with the duration tangent line', xlab: 'yield' }) + `<figcaption class="tiny muted">Solid: actual price. Dashed: modified-duration estimate. The curve always sits above the tangent: convexity.</figcaption>`;
    const prem = b.P - F;
    q('[data-stats]').innerHTML = stat('Price', money(b.P, 2), 'hero') + stat(prem >= 0 ? 'Premium' : 'Discount', money(Math.abs(prem), 2)) + stat('Macaulay duration', f(b.mac, 3) + ' yr') + stat('Modified duration', f(b.mod, 3)) + stat('Convexity', f(b.conv, 2));
    const up = bond(F, s.c / 100, (s.y + 1) / 100, s.T).P, est = b.P * (1 - b.mod * 0.01 + 0.5 * b.conv * 0.0001);
    q('[data-note]').textContent = `${s.c > s.y ? 'Coupon rate above yield: the bond sells at a premium.' : s.c < s.y ? 'Coupon rate below yield: the bond sells at a discount.' : 'Coupon rate equals yield: the bond sells at par.'} If yields rise 1 point, the price becomes ${money(up, 2)}; duration alone predicts ${money(b.P * (1 - b.mod * 0.01), 2)}, and adding convexity gives ${money(est, 2)}. (Durations here are in years with semiannual compounding.)`;
  }
  wire(host, id, s, draw); draw();
}

/* =====================================================================
   4. Immunization
   ===================================================================== */
export function immunizeWidget(host) {
  const id = uid('im');
  const s = { i: 5, a: 5, b: 15, shock: 0 };
  const L = 1000000, TL = 10;
  host.innerHTML = `<div class="viz pw">
    ${head('shield', 'Immunization explorer', 'An insurer owes $1,000,000 in 10 years. It buys two zero-coupon bonds, one shorter and one longer, sized so their present value and duration match the liability at today\'s rate. Shock the rate and watch the surplus.')}
    <div class="pw-grid">
      <div class="pw-ctrls">
        ${sl(id + 'i', 'Today\'s rate i', 2, 10, 0.25, s.i)}
        ${sl(id + 'a', 'Short bond maturity', 1, 9, 1, s.a)}
        ${sl(id + 'b', 'Long bond maturity', 11, 25, 1, s.b)}
        ${sl(id + 'shock', 'Rate shock (points)', -3, 3, 0.25, s.shock)}
      </div>
      <figure class="pw-fig" data-fig></figure>
    </div>
    <div class="pw-stats" data-stats aria-live="polite"></div>
    <p class="small muted pw-note" data-note></p>
  </div>`;
  const q = sel => host.querySelector(sel);
  function draw() {
    setOuts(host, id, s, { i: v => v + '%', a: v => v + ' yr', b: v => v + ' yr', shock: v => (v > 0 ? '+' : '') + v + ' pt' });
    const i = s.i / 100, v = t => Math.pow(1 + i, -t);
    // solve: Xa v^a + Xb v^b = L v^TL and a Xa v^a + b Xb v^b = TL L v^TL  (amounts are face values paid at maturity)
    const PVL = L * v(TL), wb = (TL - s.a) / (s.b - s.a), wa = 1 - wb;
    const Xa = wa * PVL / v(s.a), Xb = wb * PVL / v(s.b);
    const surplus = r => Xa * Math.pow(1 + r, -s.a) + Xb * Math.pow(1 + r, -s.b) - L * Math.pow(1 + r, -TL);
    const pts = []; for (let k = 0; k <= 120; k++) { const r = Math.max(0.0025, i - 0.04 + k * 0.08 / 120); pts.push([r * 100, surplus(r)]); }
    const ymax = Math.max(1000, ...pts.map(p => p[1])) * 1.1;
    const r1 = i + s.shock / 100, S1 = surplus(r1);
    q('[data-fig]').innerHTML = plot({ x0: pts[0][0], x1: pts[pts.length - 1][0], y0: -ymax * 0.15, y1: ymax, series: [{ pts, cls: 'pw-curve' }, { pts: [[pts[0][0], 0], [pts[pts.length - 1][0], 0]], cls: 'pw-axis' }], marker: [r1 * 100, S1], xfmt: v => (+v.toFixed(1)) + '%', yfmt: v => '$' + Math.round(v / 1000) + 'k', label: 'Surplus of assets over the liability as the interest rate changes', xlab: 'interest rate' }) + `<figcaption class="tiny muted">Surplus = PV(assets) − PV(liability). Full immunization: zero at today's rate and positive for any shift.</figcaption>`;
    const convA = (wa * s.a * (s.a + 1) + wb * s.b * (s.b + 1)) / Math.pow(1 + i, 2), convL = TL * (TL + 1) / Math.pow(1 + i, 2);
    q('[data-stats]').innerHTML = stat(`Surplus after a ${s.shock >= 0 ? '+' : ''}${s.shock} pt shock`, money(S1), 'hero') + stat(`Short bond (pays at ${s.a})`, money(Xa)) + stat(`Long bond (pays at ${s.b})`, money(Xb)) + stat('PV of liability', money(PVL)) + stat('Duration: assets = liability', `${TL} yr`) + stat('Convexity: assets vs liability', `${f(convA, 1)} vs ${f(convL, 1)}`);
    q('[data-note]').textContent = `The amounts solve two equations at ${s.i}%: present values match and Macaulay durations match (both ${TL} years). Because the assets straddle the liability date, their convexity is higher, so any parallel shift leaves a surplus: Redington's third condition. Narrow the gap between the two maturities and the protection shrinks.`;
  }
  wire(host, id, s, draw); draw();
}
