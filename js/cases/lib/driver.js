// Probability model for "Who's a Risky Driver?".
// Drivers belong to hidden risk classes. Given its class, a driver has at most one at-fault accident
// per year with a fixed probability, independently from year to year.
import { sum, mulberry } from '../../util.js';

export const CLASSES = ['Low', 'Medium', 'High'];
export const BASE = { prior: [0.60, 0.30, 0.10], p: [0.05, 0.10, 0.25], cost: 9000 };

/** All the quantities the case uses, for a given model {prior, p, cost}. */
export function analyze(m = BASE) {
  const { prior, p, cost } = m;
  const joint = prior.map((w, i) => w * p[i]);                       // P(class ∩ accident)
  const pA = sum(joint);                                              // law of total probability
  const post = joint.map(j => j / pA);                                // Bayes: P(class | accident)
  const both = sum(prior.map((w, i) => w * p[i] * p[i]));             // P(A1 ∩ A2)
  const a2GivenA1 = both / pA;
  const cleanJoint = sum(prior.map((w, i) => w * (1 - p[i]) * p[i])); // P(no A1 ∩ A2)
  const a2GivenClean = cleanJoint / (1 - pA);
  const surcharge = a2GivenA1 / a2GivenClean - 1;
  const postClean = prior.map((w, i) => w * (1 - p[i]) / (1 - pA));  // P(class | no accident)
  const two = prior.map((w, i) => w * p[i] * p[i] / both);           // P(class | accidents in both years)
  return { joint, pA, post, both, a2GivenA1, cleanJoint, a2GivenClean, surcharge, postClean, two,
    ppAcc: cost * a2GivenA1, ppClean: cost * a2GivenClean, ppAll: cost * pA };
}
export const A = analyze();

/**
 * Price year 2 with an accident surcharge s (e.g. 0.4 = +40%), with the base rate set so that
 * total expected premium equals total expected loss (revenue neutral). Returns premiums and loss ratios.
 */
export function priceWith(s, m = BASE) {
  const a = analyze(m);
  const nAcc = a.pA, nClean = 1 - a.pA;
  const lossAcc = m.cost * a.both, lossClean = m.cost * a.cleanJoint;  // expected year-2 loss per driver in population
  const base = (lossAcc + lossClean) / (nClean + nAcc * (1 + s));
  const premClean = base, premAcc = base * (1 + s);
  return { base, premClean, premAcc, lrClean: (lossClean / nClean) / premClean, lrAcc: (lossAcc / nAcc) / premAcc,
    subsidy: (premClean - lossClean / nClean) * nClean };               // per driver in population: >0 means clean drivers overpay
}

/** Simulate n drivers for two years (seeded, so everyone sees the same "history"). */
export function simulate(n = 10000, seed = 2026, m = BASE) {
  const r = mulberry(seed);
  const counts = { both: 0, onlyA1: 0, onlyA2: 0, neither: 0 };
  const byClass = CLASSES.map(() => ({ n: 0, a1: 0 }));
  for (let k = 0; k < n; k++) {
    const u = r(); let c = 0, acc = m.prior[0]; while (u > acc && c < 2) { c++; acc += m.prior[c]; }
    const a1 = r() < m.p[c], a2 = r() < m.p[c];
    byClass[c].n++; if (a1) byClass[c].a1++;
    if (a1 && a2) counts.both++; else if (a1) counts.onlyA1++; else if (a2) counts.onlyA2++; else counts.neither++;
  }
  return { counts, byClass, n };
}
