// Pension math and illustrative plan data for "Promises to Keep".
// A small final-pay defined benefit plan valued with the projected unit credit cost method.
// All figures are illustrative and were built for teaching.
import { mulberry, randn } from '../../util.js';

/** Plan provisions and the board's current assumptions. Valuation date January 1, 2027. */
export const PLAN = {
  accrual: 0.015,     // 1.5% of final average salary per year of service
  retAge: 65,         // normal retirement age; benefits paid annually in advance for life
  i: 0.07,            // discount rate = expected return on plan assets
  s: 0.035,           // salary scale (annual pay increases, inflation + merit)
  mort: 1,            // mortality multiplier on the base table (1 = base)
  assets: 68000000,   // market value of assets at the valuation date
  amort: 20,          // amortization period for the unfunded liability (years, level dollar)
  lastContrib: 3400000, // what the city paid in 2026
  marketRate: 0.045,  // illustrative high-quality bond yield, for the discount-rate debate
};

/** Illustrative mortality: Makeham law, mu(x) = A + B c^x, turned into annual q(x) rounded to 6 decimals. */
export const MAKEHAM = { A: 0.0002, B: 0.000004, c: 1.12 };
export const AGE0 = 20, AGEMAX = 110;
export const Q = (() => {
  const { A, B, c } = MAKEHAM, q = [];
  for (let x = AGE0; x < AGEMAX; x++) { const p = Math.exp(-A - B * Math.pow(c, x) * (c - 1) / Math.log(c)); q.push(Math.round((1 - p) * 1e6) / 1e6); }
  q.push(1); // nobody survives past 110
  return q;
})();
export const qx = x => Q[x - AGE0];

/** Active members, grouped into cohorts of similar members (n members each, all with these values). */
export const ACTIVES = [
  { id: 'A1', n: 60, age: 27, svc: 2, sal: 52000 },
  { id: 'A2', n: 70, age: 32, svc: 6, sal: 61000 },
  { id: 'A3', n: 75, age: 37, svc: 10, sal: 68000 },
  { id: 'A4', n: 70, age: 42, svc: 14, sal: 74000 },
  { id: 'A5', n: 65, age: 47, svc: 18, sal: 80000 },
  { id: 'A6', n: 55, age: 52, svc: 22, sal: 85000 },
  { id: 'A7', n: 45, age: 57, svc: 26, sal: 90000 },
  { id: 'A8', n: 30, age: 62, svc: 30, sal: 95000 },
];
/** Retirees already receiving a life annuity (annual benefit paid at the start of each year). */
export const RETIREES = [
  { id: 'R1', n: 60, age: 68, ben: 34000 },
  { id: 'R2', n: 50, age: 74, ben: 29000 },
  { id: 'R3', n: 40, age: 81, ben: 24000 },
];
export const FOCUS = 3; // index of cohort A4, used in the step-by-step tasks
export const PAYROLL = ACTIVES.reduce((s, m) => s + m.n * m.sal, 0);
export const N_ACT = ACTIVES.reduce((s, m) => s + m.n, 0);
export const N_RET = RETIREES.reduce((s, m) => s + m.n, 0);

/** l(x) from age 20 (radix 100,000) and annuity-due factors ä(x) by backward recursion. mult scales every q(x). */
export function lifeTable(i = PLAN.i, mult = PLAN.mort) {
  const v = 1 / (1 + i), n = Q.length, l = new Array(n), a = new Array(n);
  const qa = Q.map((q, k) => k === n - 1 ? 1 : Math.min(1, q * mult));
  l[0] = 100000;
  for (let k = 1; k < n; k++) l[k] = l[k - 1] * (1 - qa[k - 1]);
  a[n - 1] = 1;
  for (let k = n - 2; k >= 0; k--) a[k] = 1 + v * (1 - qa[k]) * a[k + 1];
  return { l: x => l[x - AGE0], a: x => a[x - AGE0], v };
}

/** Annuity-due factor for n level payments: ä(n) = (1 − v^n) / d. */
export const annuityDue = (i, n) => i === 0 ? n : (1 - Math.pow(1 + i, -n)) / (i / (1 + i));
/** Level payment at the start of each year that pays off `ual` over n years at rate i (Excel PMT(i, n, -ual, 0, 1)). */
export const amortPayment = (ual, i = PLAN.i, n = PLAN.amort) => ual / annuityDue(i, n);

/**
 * Full valuation under the projected unit credit method.
 * Per active member: projected final salary F = S(1+s)^m, benefit B = accrual × (service at 65) × F,
 * PVFB = B × ä65 × v^m × l65/lx, accrued liability = PVFB × past service / total service, normal cost = PVFB / total service.
 */
export function valuation({ i = PLAN.i, s = PLAN.s, mort = PLAN.mort, assets = PLAN.assets } = {}) {
  const T = lifeTable(i, mort), R = PLAN.retAge, a65 = T.a(R);
  const act = ACTIVES.map(m => {
    const yrs = R - m.age, fas = m.sal * Math.pow(1 + s, yrs), tot = m.svc + yrs, ben = PLAN.accrual * tot * fas;
    const surv = T.l(R) / T.l(m.age), disc = Math.pow(T.v, yrs), pvfb = ben * a65 * disc * surv;
    return { ...m, yrs, fas, tot, ben, surv, disc, a65, pvfb, al: pvfb * m.svc / tot, nc: pvfb / tot };
  });
  const ret = RETIREES.map(m => { const ax = T.a(m.age); return { ...m, ax, al: m.ben * ax }; });
  const alAct = act.reduce((t, m) => t + m.n * m.al, 0), alRet = ret.reduce((t, m) => t + m.n * m.al, 0);
  const pvfb = act.reduce((t, m) => t + m.n * m.pvfb, 0) + alRet;
  const nc = act.reduce((t, m) => t + m.n * m.nc, 0);
  const AL = alAct + alRet, ual = AL - assets, pay = amortPayment(ual, i, PLAN.amort);
  return { i, s, mort, a65, act, ret, alAct, alRet, AL, pvfb, nc, assets, fr: assets / AL, ual, pay, contrib: nc + pay, pctPay: (nc + pay) / PAYROLL };
}
export const BASE = valuation();

/** Effective duration of the liability from a ±1% shift in the discount rate. */
export function duration(opts = {}) {
  const i = opts.i ?? PLAN.i;
  const lo = valuation({ ...opts, i: i - 0.01 }).AL, hi = valuation({ ...opts, i: i + 0.01 }).AL, mid = valuation({ ...opts, i }).AL;
  return { lo, hi, mid, dur: (lo - hi) / (2 * mid * 0.01) };
}

/* ---------------- 20-year funding simulation ----------------
 * Simplified open-group projection. When every assumption is met, liability and normal cost grow with payroll
 * (the salary scale, 3.5% a year); benefit payments are set so that this holds:
 *   AL(t+1) = (AL(t) + NC(t) − BP(t)) × (1 + i)   with AL(t) = AL(0)(1+g)^t.
 * Assets roll forward with random returns: A(t+1) = (A(t) + C(t) − BP(t)) × (1 + r(t)), floored at 0.
 * Contribution policy: C(t) = NC(t) + P, where P = (first-year contribution − NC(0)) stays level for 20 years.
 * Under the model contribution (P = the amortization payment) and returns exactly equal to i, the plan is
 * 100% funded after 20 years.
 */
const zCache = {};
function zs(n, years, seed) {
  const k = n + ':' + years + ':' + seed;
  if (!zCache[k]) { const r = mulberry(seed); zCache[k] = Array.from({ length: n }, () => Array.from({ length: years }, () => randn(r))); }
  return zCache[k];
}
export const SIM = { n: 2000, years: 20, seed: 2027, mu: 0.07, sd: 0.12 };
const pctile = (sorted, p) => sorted[Math.round(p * (sorted.length - 1))];

export function simulate(contrib, { mu = SIM.mu, sd = SIM.sd, n = SIM.n, years = SIM.years, seed = SIM.seed, base = BASE } = {}) {
  const g = PLAN.s, i = PLAN.i, AL0 = base.AL, NC0 = base.nc;
  const BP0 = AL0 + NC0 - AL0 * (1 + g) / (1 + i), P = contrib - NC0, Z = zs(n, years, seed);
  const cols = Array.from({ length: years + 1 }, () => new Array(n));
  for (let k = 0; k < n; k++) {
    let A = base.assets; cols[0][k] = A / AL0;
    for (let t = 0; t < years; t++) {
      const gr = Math.pow(1 + g, t);
      A = Math.max(0, (A + NC0 * gr + P - BP0 * gr) * (1 + mu + sd * Z[k][t]));
      cols[t + 1][k] = A / (AL0 * gr * (1 + g));
    }
  }
  const sorted = cols.map(c => c.slice().sort((a, b) => a - b));
  const fin = sorted[years];
  return {
    contrib, P, BP0,
    p10: sorted.map(c => pctile(c, 0.10)), p50: sorted.map(c => pctile(c, 0.50)), p90: sorted.map(c => pctile(c, 0.90)),
    fin: { p5: pctile(fin, 0.05), p25: pctile(fin, 0.25), p50: pctile(fin, 0.5), p75: pctile(fin, 0.75), p95: pctile(fin, 0.95) },
    below60: fin.filter(x => x < 0.6).length / n, above100: fin.filter(x => x >= 1).length / n,
  };
}
/** Deterministic funded ratio path when every assumption is met (returns exactly i). */
export function deterministicPath(contrib, base = BASE, years = SIM.years) {
  return simulate(contrib, { sd: 0, mu: PLAN.i, n: 1, years, base }).p50;
}
