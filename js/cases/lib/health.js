// Group medical renewal math and the illustrative dataset for "Trend Watch".
// All figures are illustrative and were built for teaching (no real employer or insurer).
import { num, sum, mulberry, Phi } from '../../util.js';

/* ---------------- dataset ---------------- */
export const CATS = ['ip', 'op', 'pr', 'rx'];
export const CAT_NAMES = { ip: 'Inpatient', op: 'Outpatient', pr: 'Professional', rx: 'Pharmacy' };
export const CAT_COLORS = { ip: 'var(--chart-3)', op: 'var(--chart-2)', pr: 'var(--chart-1)', rx: 'var(--chart-4)' };
/** State keys for the learner's selected annual trend (%) by category. */
export const TKEY = { ip: 'tIP', op: 'tOP', pr: 'tPR', rx: 'tRX' };

const MON = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
/** Experience period: April 2024 to March 2026 (24 incurred months, completed). */
export const MONTHS = Array.from({ length: 24 }, (_, i) => MON[i % 12] + ' ' + (2024 + Math.floor((i + 3) / 12)));
export const MM = [1190, 1188, 1191, 1184, 1191, 1190, 1187, 1195, 1189, 1196, 1192, 1193, 1205, 1212, 1198, 1200, 1207, 1213, 1209, 1207, 1217, 1205, 1217, 1211];
export const CLAIMS = {
  ip: [127800, 131900, 139000, 229500, 202000, 135100, 153800, 140600, 136400, 234800, 148500, 155100, 152100, 148900, 137000, 594000, 741000, 563700, 244300, 143200, 245900, 229500, 188700, 181200],
  op: [150800, 170000, 149300, 177800, 173700, 172200, 167900, 179300, 185400, 206400, 173300, 192700, 194300, 188700, 162600, 179900, 203100, 228500, 245800, 174400, 247100, 250100, 235400, 214000],
  pr: [182800, 199800, 173000, 178500, 208600, 196600, 221100, 182200, 216400, 217700, 213100, 193900, 214100, 187400, 181800, 192000, 210700, 199100, 234400, 195700, 198100, 240600, 220400, 242400],
  rx: [156200, 151800, 151500, 156600, 160400, 163900, 155200, 162400, 164100, 166800, 172400, 170700, 168300, 173200, 176900, 180200, 183000, 178800, 175900, 182000, 184200, 188000, 181900, 193800],
};
/** Monthly premium rate PMPM in force by calendar year (composite of the tier rates). */
export const RATE_HIST = { 2024: 612, 2025: 668, 2026: 745 };
export const monthRate = i => RATE_HIST[2024 + Math.floor((i + 3) / 12)];

/** Claimants with more than $100,000 of claims in a 12-month experience year (all services combined). */
export const LARGE = [
  { id: 'A', yr: 1, amt: 246800, dx: 'Cancer: surgery and chemotherapy' },
  { id: 'B', yr: 1, amt: 188300, dx: 'Cardiac surgery' },
  { id: 'C', yr: 1, amt: 112600, dx: 'Spinal fusion' },
  { id: 'D', yr: 1, amt: 104900, dx: 'Hip replacement with complications' },
  { id: 'E', yr: 2, amt: 1682400, dx: 'Premature birth: 94-day NICU stay' },
  { id: 'F', yr: 2, amt: 338500, dx: 'Leukemia' },
  { id: 'G', yr: 2, amt: 203700, dx: 'Motor vehicle trauma' },
  { id: 'H', yr: 2, amt: 141200, dx: 'Specialty drug (autoimmune)' },
  { id: 'I', yr: 2, amt: 108000, dx: 'Stroke' },
];
export const YEAR_LABEL = { 1: 'Apr 2024–Mar 2025', 2: 'Apr 2025–Mar 2026' };

/** Insurer's book-of-business trend data (allowed costs, regional commercial block), calendar years. */
export const BOOK = {
  years: [2021, 2022, 2023, 2024, 2025],
  ip: { u: [62.0, 61.4, 62.8, 63.1, 63.3], c: [21400, 22500, 24100, 25500, 27100], ul: 'Admits per 1,000', cl: 'Cost per admit' },
  op: { u: [1980, 2050, 2090, 2150, 2200], c: [760, 790, 830, 870, 905], ul: 'Visits per 1,000', cl: 'Cost per visit' },
  pr: { u: [11200, 11450, 11600, 11800, 11950], c: [152.5, 156.0, 161.5, 166.0, 171.0], ul: 'Services per 1,000', cl: 'Cost per service' },
  rx: { u: [10900, 11150, 11300, 11600, 11800], c: [118, 127.5, 139, 151, 163], ul: 'Scripts per 1,000', cl: 'Cost per script' },
};
/** Book PMPM = utilization per 1,000 per year ÷ 12,000 × unit cost. */
export const bookPmpm = k => BOOK[k].u.map((u, i) => u / 12000 * BOOK[k].c[i]);

/** Rating assumptions (renewal effective January 1, 2027, 12-month rate guarantee). */
export const ASSUME = {
  pool: 175000, poolCharge: 38.5,                    // pooling point and expected pooling charge PMPM at 2027 cost level
  poolOptions: [[100000, 64.0], [175000, 38.5], [250000, 27.0], [0, 0]],  // 0 = no pooling
  nFull: 60000,                                      // member months for full credibility
  manual: 722.0,                                     // manual claims PMPM for this group's demographics, area and plan, 2027 level, all claims
  admin: 52.0, tax: 0.02, margin: 0.03, qi: 3.5,     // admin $ PMPM, premium tax and risk margin as % of premium, quality improvement $ PMPM
  current: 745.0,                                    // current premium PMPM at 2026 rates on the projected 2027 enrollment
  mlrFloor: 0.85, employees: 505, members2027: 1210,
  budget: 6,                                         // committee's budgeted increase, %
};
export const TREND_MONTHS = 27;                      // midpoint 4/1/2025 to midpoint 7/1/2027

/* ---------------- calculations ---------------- */
/** Exponential least-squares fit (same as Excel LOGEST on x = 1..n): annual rate. */
export function expFit(y) {
  const ly = y.map(Math.log), n = y.length, x = ly.map((_, i) => i + 1);
  const mx = sum(x) / n, my = sum(ly) / n;
  const b = sum(x.map((xi, i) => (xi - mx) * (ly[i] - my))) / sum(x.map(xi => (xi - mx) ** 2));
  return Math.exp(b) - 1;
}
/** Measured trends by category: utilization, unit cost, and combined (1+u)(1+c)-1. */
export const FIT = Object.fromEntries(CATS.map(k => { const u = expFit(BOOK[k].u), c = expFit(BOOK[k].c); return [k, { u, c, t: (1 + u) * (1 + c) - 1 }]; }));

export const MM_TOT = sum(MM), MM_Y = [sum(MM.slice(0, 12)), sum(MM.slice(12))];
export const CL_TOT = Object.fromEntries(CATS.map(k => [k, sum(CLAIMS[k])]));
export const CL_Y = [0, 1].map(y => Object.fromEntries(CATS.map(k => [k, sum(CLAIMS[k].slice(12 * y, 12 * y + 12))])));
/** 24-month PMPM by category, unpooled. */
export const PMPM = Object.fromEntries(CATS.map(k => [k, CL_TOT[k] / MM_TOT]));
export const PMPM_TOT = sum(CATS.map(k => PMPM[k]));
export const PREM_Y = [0, 1].map(y => sum(MM.slice(12 * y, 12 * y + 12).map((m, j) => m * monthRate(12 * y + j))));
export const monthPmpm = i => sum(CATS.map(k => CLAIMS[k][i])) / MM[i];

/** Total claims above the pooling point d (each claimant, each 12-month year). d = 0 means no pooling. */
export const excessAt = d => d > 0 ? sum(LARGE.map(c => Math.max(0, c.amt - d))) : 0;
export const EXCESS = excessAt(ASSUME.pool);
export const credZ = (n, nFull = ASSUME.nFull) => Math.min(1, Math.sqrt(n / nFull));
export const Z = credZ(MM_TOT);

/** Model selections (annual %). */
export const MODEL_T = { tIP: '7.0', tOP: '7.5', tPR: '4.5', tRX: '10.5' };

/**
 * Full renewal build-up from selected trends (st.tIP… in %). Options let the stress bench vary the assumptions.
 * Any missing trend makes the results NaN.
 */
export function renewal(st, o = {}) {
  const shift = o.shift || 0, tm = o.tm ?? TREND_MONTHS;
  const pool = o.pool ?? ASSUME.pool, pc = o.poolCharge ?? (ASSUME.poolOptions.find(p => p[0] === pool) || [0, ASSUME.poolCharge])[1];
  const nFull = o.nFull ?? ASSUME.nFull;
  const t = Object.fromEntries(CATS.map(k => [k, num(st[TKEY[k]]) / 100 + shift / 100]));
  const tf = Object.fromEntries(CATS.map(k => [k, Math.pow(1 + t[k], tm / 12)]));
  const trended = Object.fromEntries(CATS.map(k => [k, PMPM[k] * tf[k]]));
  const comp = sum(CATS.map(k => trended[k])) / PMPM_TOT;            // composite trend factor (claim-mix weighted)
  const compAnnual = Math.pow(comp, 12 / tm) - 1;
  const excess = excessAt(pool), excessPm = excess / MM_TOT;
  const pooled = PMPM_TOT - excessPm;
  const proj = pooled * comp + pc;
  const z = credZ(MM_TOT, nFull);
  const blend = z * proj + (1 - z) * ASSUME.manual;
  const prem = (blend + ASSUME.admin) / (1 - ASSUME.tax - ASSUME.margin);
  const change = prem / ASSUME.current - 1;
  const lr = blend / prem;
  const mlr = (blend + ASSUME.qi) / (prem * (1 - ASSUME.tax));
  return { t, tf, trended, comp, compAnnual, excess, excessPm, pooled, pc, proj, z, blend, prem, change, lr, mlr, pool, nFull };
}
export const MODEL = renewal(MODEL_T);

/** Build-up chart rows for a renewal result. */
export function buildUp(c) {
  return [
    { l: 'Experience PMPM, all claims', v: PMPM_TOT, c: 'var(--chart-muted)' },
    { l: 'Pooled (excess removed)', v: c.pooled, c: 'var(--chart-muted)' },
    { l: 'Trended + pooling charge', v: c.proj, c: 'var(--chart-1)' },
    { l: 'Manual rate (claims)', v: ASSUME.manual, c: 'var(--chart-2)' },
    { l: `Credibility blend (Z = ${c.z.toFixed(2)})`, v: c.blend, c: 'var(--chart-1)', strong: true },
    { l: 'Required premium', v: c.prem, c: 'var(--chart-3)', strong: true },
    { l: 'Current premium', v: ASSUME.current, c: 'var(--chart-muted)' }];
}

/** Claims PMPM a given rate change can pay for after admin, tax and margin. */
export const capacity = r => ASSUME.current * (1 + r) * (1 - ASSUME.tax - ASSUME.margin) - ASSUME.admin;

/** Leveraging example (stretch): allowed PMPM with a fixed-dollar copay PMPM that does not trend. */
export const LEV = { allowed: 200, copay: 22, trend: 0.045 };
export const levPaidTrend = (L = LEV) => (L.allowed * (1 + L.trend) - L.copay) / (L.allowed - L.copay) - 1;

/* ---------------- simulation of 2027 claims ---------------- */
/**
 * Illustrative "true" 2027 claim model for the group, per member-year:
 *  - with probability pCat a catastrophic claim, Pareto(xm, alpha);
 *  - otherwise no claims with probability p0, else lognormal(mu, s).
 * Each scenario also has a trend shock exp(shockSd · z) on the claims kept by the group.
 * Claims charged to the group = claims capped at the pooling point + the pooling charge.
 */
export const SIMP = { n: 1210, pCat: 0.003, xm: 150000, alpha: 2.2, p0: 0.12, mu: 8.293, s: 1.3, shockSd: 0.03, pool: 175000, scen: 2000, seed: 2027 };

/** Exact expected claims charged to the group, PMPM, under SIMP. */
export function simTruth(P = SIMP) {
  const d = P.pool, capL = P.xm + Math.pow(P.xm, P.alpha) * (Math.pow(d, 1 - P.alpha) - Math.pow(P.xm, 1 - P.alpha)) / (1 - P.alpha);
  const capB = Math.exp(P.mu + P.s * P.s / 2) * Phi((Math.log(d) - P.mu - P.s * P.s) / P.s) + d * (1 - Phi((Math.log(d) - P.mu) / P.s));
  const capped = P.pCat * capL + (1 - P.pCat) * (1 - P.p0) * capB;
  const shock = Math.exp(P.shockSd * P.shockSd / 2);
  const eL = P.alpha * P.xm / (P.alpha - 1), eB = Math.exp(P.mu + P.s * P.s / 2);
  const excess = P.pCat * (eL - capL) + (1 - P.pCat) * (1 - P.p0) * (eB - capB);
  return { charged: shock * capped / 12 + ASSUME.poolCharge, excessPm: excess / 12 };
}

let SIM_CACHE = null;
/** Seeded simulation: returns sorted PMPM charged to the group in each scenario. */
export function simulate(P = SIMP) {
  if (SIM_CACHE && P === SIMP) return SIM_CACHE;
  const r = mulberry(P.seed), out = [];
  for (let s = 0; s < P.scen; s++) {
    const a = r() || 1e-12, b = r();
    const shock = Math.exp(P.shockSd * Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b));
    let capped = 0;
    for (let m = 0; m < P.n; m++) {
      const u = r(), v = r(), w = r() || 1e-12, x = r();
      let X;
      if (u < P.pCat) X = P.xm * Math.pow(1 - v, -1 / P.alpha);
      else if (v < P.p0) X = 0;
      else X = Math.exp(P.mu + P.s * Math.sqrt(-2 * Math.log(w)) * Math.cos(2 * Math.PI * x));
      capped += Math.min(X, P.pool);
    }
    out.push(shock * capped / (P.n * 12) + ASSUME.poolCharge);
  }
  out.sort((x, y) => x - y);
  const res = { pm: out, mean: sum(out) / out.length };
  if (P === SIMP) SIM_CACHE = res;
  return res;
}
/** Share of simulated scenarios in which claims exceed what rate change r pays for. */
export const underProb = (sim, r) => sim.pm.filter(v => v > capacity(r)).length / sim.pm.length;

/** Illustrative actual 2027 outcome for the debrief. */
export const ACTUAL_2027 = { charged: 763.9, rxGrowth: 0.139, bigClaim: 410000 };
export const hindsightChange = () => (ACTUAL_2027.charged + ASSUME.admin) / (1 - ASSUME.tax - ASSUME.margin) / ASSUME.current - 1;
