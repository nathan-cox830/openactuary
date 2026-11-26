// Life contingencies model for "The Mortality Table": an illustrative Makeham life table, survival
// probabilities, actuarial present values (whole-year model: deaths paid at the end of the year of death,
// premiums at the start of each year), net and gross level premiums, and a seeded portfolio simulation.
import { mulberry } from '../../util.js';

/** Makeham's law, force of mortality μ(x) = A + B·cˣ. Illustrative parameters, not from any published table. */
export const MAKEHAM = { A: 0.0002, B: 0.00002, c: 1.1 };
export const AGE_MIN = 30, AGE_MAX = 99;

/**
 * One-year death probabilities qₓ = 1 − exp(−∫ₓˣ⁺¹ μ) = 1 − exp(−A − B·cˣ(c − 1)/ln c), rounded to 6 decimals.
 * The rounded values ARE the case's table (what the learner sees is exactly what the model uses).
 */
export const QX = (() => {
  const { A, B, c } = MAKEHAM, q = {};
  for (let x = AGE_MIN; x <= AGE_MAX; x++) q[x] = Math.round((1 - Math.exp(-A - B * Math.pow(c, x) * (c - 1) / Math.log(c))) * 1e6) / 1e6;
  return q;
})();

/** The policy being priced and the base pricing basis. */
export const POLICY = { x: 40, n: 20, S: 250000, i: 0.05 };
/** Expense basis: share of first-year and renewal gross premium, issue expense at time 0, maintenance at the start of every policy year. */
export const EXP = { first: 0.50, renew: 0.05, issue: 200, maint: 40 };
/** The product committee's profit target for the model answer: PV profit = 5% of PV gross premium. */
export const PROFIT = 0.05;

export const qx = (age, mult = 1) => Math.min(1, QX[age] * mult);

/** ₜpₓ for t = 0..T under a mortality multiplier. */
export function survival(x = POLICY.x, T = 25, mult = 1) {
  const p = [1];
  for (let t = 0; t < T; t++) p.push(p[t] * (1 - qx(x + t, mult)));
  return p;
}
/** lₓ column with a radix of 100,000 at age x0. */
export function lx(x0 = POLICY.x, T = 25) { return survival(x0, T).map(p => 100000 * p); }

/**
 * Price the policy. o = { i, mult, lapse, n, x, S, exp, profit }.
 * Lapses (optional) happen at the end of a policy year among survivors, with no cash value.
 * Returns the yearly cash-flow table and every APV / premium the case uses.
 */
export function price(o = {}) {
  const i = o.i ?? POLICY.i, mult = o.mult ?? 1, w = o.lapse ?? 0, n = o.n ?? POLICY.n, x = o.x ?? POLICY.x, S = o.S ?? POLICY.S;
  const E = o.exp || EXP, prof = o.profit ?? 0;
  const v = 1 / (1 + i);
  let inforce = 1, A = 0, a = 0; const rows = [];
  for (let k = 0; k < n; k++) {
    const q = qx(x + k, mult), vk = Math.pow(v, k), vk1 = Math.pow(v, k + 1);
    const ben = inforce * q * vk1, ann = inforce * vk;
    rows.push({ k: k + 1, age: x + k, q, tp: inforce, vk, vk1, ben, ann });
    A += ben; a += ann;
    inforce *= (1 - q) * (1 - w);
  }
  const apvBen = S * A, P = apvBen / a;
  const G = gross(apvBen, a, E, 0), Gp = gross(apvBen, a, E, prof || PROFIT);
  return { i, v, mult, lapse: w, n, x, S, rows, A, a, npx: inforce, apvBen, P, G, Gp };
}
/** Equivalence-principle gross premium: G·ä = S·A + issue + maint·ä + first·G + renew·G·(ä − 1) + profit·G·ä. */
export function gross(apvBen, a, E = EXP, profit = 0) {
  return (apvBen + E.issue + E.maint * a) / ((1 - E.renew - profit) * a - (E.first - E.renew));
}
/** Expected PV of profit at issue per policy for gross premium G under pricing result r. */
export function pvProfit(G, r, E = EXP) {
  const prem = G * r.a, ben = r.apvBen, issue = E.issue, maint = E.maint * r.a, pexp = E.first * G + E.renew * G * (r.a - 1);
  return { prem, ben, issue, maint, pexp, outgo: ben + issue + maint + pexp, profit: prem - (ben + issue + maint + pexp) };
}

export const BASE = price();
export const DEFERRED_10 = BASE.rows[10].tp * BASE.rows[10].q;   // ₁₀|q₄₀ = ₁₀p₄₀ · q₅₀
export const AT_4 = price({ i: 0.04 });
/** Model recommendation: profit-loaded premium, rounded up to the next $5. */
export const MODEL_G = Math.ceil(BASE.Gp / 5) * 5;

/**
 * Simulate `blocks` independent blocks of `nPol` policies under mortality multiplier `mult` (seeded).
 * Each policy draws one uniform and is assigned a curtate future lifetime K (death in policy year K + 1) or survival.
 * Per block we keep the realized PV of premium-annuity units (Σ ä_{min(K+1,n)}), the PV of death benefits per $1
 * (Σ v^{K+1}), and the death count, so the block's PV profit is linear in the premium and can be evaluated for any G.
 */
export function simulate({ blocks = 400, nPol = 10000, seed = 4020, mult = 1 } = {}) {
  const r = mulberry(seed), { n, x } = POLICY, v = 1 / (1 + POLICY.i);
  const p = survival(x, n, mult), cum = [];                         // cum[k] = P(K ≤ k) = 1 − ₖ₊₁p
  for (let k = 0; k < n; k++) cum.push(1 - p[k + 1]);
  const annK = [0]; for (let m = 1; m <= n; m++) annK.push(annK[m - 1] + Math.pow(v, m - 1));   // ä certain for m payments
  const out = []; let firstDeaths = null;
  for (let b = 0; b < blocks; b++) {
    let ann = 0, Z = 0, deaths = 0; const byYear = b === 0 ? new Array(n).fill(0) : null;
    for (let j = 0; j < nPol; j++) {
      const u = r();
      if (u >= cum[n - 1]) { ann += annK[n]; continue; }
      let lo = 0, hi = n - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (u < cum[mid]) hi = mid; else lo = mid + 1; }
      ann += annK[lo + 1]; Z += Math.pow(v, lo + 1); deaths++; if (byYear) byYear[lo]++;
    }
    out.push({ ann, Z, deaths });
    if (byYear) firstDeaths = byYear;
  }
  return { blocks: out, nPol, firstDeaths, expDeaths: p.slice(0, n).map((pk, k) => nPol * (pk - p[k + 1])) };
}
/** PV profit of a simulated block at gross premium G. */
export function blockProfit(b, G, nPol, E = EXP, S = POLICY.S) {
  return G * ((1 - E.renew) * b.ann - (E.first - E.renew) * nPol) - S * b.Z - E.issue * nPol - E.maint * b.ann;
}
/** Summary of the block PV profit distribution at premium G. */
export function profitStats(sim, G) {
  const v = sim.blocks.map(b => blockProfit(b, G, sim.nPol)).sort((a, b) => a - b);
  const mean = v.reduce((s, x) => s + x, 0) / v.length;
  return { values: v, mean, pLoss: v.filter(x => x < 0).length / v.length, p5: v[Math.floor(0.05 * v.length)], min: v[0], max: v[v.length - 1] };
}
