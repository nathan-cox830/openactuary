// Exam P · Univariate Random Variables problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind ('prob' | 'int' | 'num'), steps (HTML), params }.
// The site's makeProblem/buildChoices (data/exam-p/generator.js) turn these into five shuffled choices.
// 'num' is for non-probability decimals (means, variances, expected payments).
// Every template retries its random draw until at least four wrong answers display differently from the
// answer and from each other, so the common-mistake choices are always shown.
// Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
import { choose, Phi } from '../../../js/util.js';

const t = String.raw;

/* ---------- small helpers ---------- */
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
/** Decimal for display: rounded to dp places, trailing zeros trimmed, never exponent notation. */
const d = (x, dp = 4) => { let s = Number(x).toFixed(dp); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
/** "= x" when exact at dp places, "\approx x" otherwise. */
const eq = (x, dp = 4) => (Math.abs(x - Number(x.toFixed(dp))) < 1e-9 ? '= ' : '\\approx ') + d(x, dp);
/** Decimal with thousands separators: m() for HTML prose, mt() for TeX (commas wrapped in braces). */
const m = (x, dp = 2) => { const s = d(x, dp); const [a, b] = s.split('.'); return a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); };
const mt = (x, dp = 2) => m(x, dp).replace(/,/g, '{,}');
const eqm = (x, dp = 2) => (Math.abs(x - Number(x.toFixed(dp))) < 1e-9 ? '= ' : '\\approx ') + mt(x, dp);
const tex = s => `<span class="tex">${s}</span>`;
const texd = s => `<div class="texd">${s}</div>`;
const pc = k => k + '%';
const yrs = x => d(x) + (x === 1 ? ' year' : ' years');
const fact = k => { let v = 1; for (let i = 2; i <= k; i++) v *= i; return v; };
const sumA = a => a.reduce((s, x) => s + x, 0);
const pois = (lam, k) => Math.exp(-lam) * lam ** k / fact(k);
const poisCdf = (lam, k) => { let s = 0; for (let j = 0; j <= k; j++) s += pois(lam, j); return s; };
const binom = (n, p, k) => choose(n, k) * p ** k * (1 - p) ** (n - k);

/* Mirror of buildChoices' display rules, so a draw can be rejected when fewer than 4 mistakes would show. */
const fmtNum = v => Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(+v.toPrecision(Math.abs(v) >= 1 ? 6 : 4));
const fmtK = kind => kind === 'int' ? (v => Math.round(v).toLocaleString('en-US')) : kind === 'num' ? fmtNum : (v => v.toFixed(4));
function distinctWrongs(g) {
  const f = fmtK(g.kind), a = g.answer;
  const ok = v => isFinite(v) && (g.kind === 'int' ? v >= 1 && Math.abs(v - Math.round(v)) < 1e-9
    : g.kind === 'num' ? (a >= 0 ? v >= 0 : v < 0) && Math.abs(v) > 1e-9
    : +f(v) > 0 && +f(v) < 1);
  const seen = new Set([f(a)]);
  g.wrongs.forEach(v => { if (ok(v)) seen.add(f(v)); });
  return seen.size - 1;
}
/** Run a draw up to 60 times until it has a finite answer and 4 distinct displayable mistakes. */
const retry = once => (r, L) => { let g; for (let i = 0; i < 60; i++) { g = once(r, L); if (isFinite(g.answer) && distinctWrongs(g) >= 4) return g; } return g; };

/* ---------- templates ---------- */
export const TEMPLATES = [
  {
    id: 'uv-pmf-table', topic: 'rv', name: 'Claim-count distribution',
    gen: retry((r, L) => {
      let p0, p1, p2, p3;
      do { p0 = ri(r, 30, 60); p1 = ri(r, 12, 35); p2 = ri(r, 5, 20); p3 = 100 - p0 - p1 - p2; } while (p3 < 3 || p3 >= p2);
      const P = [p0, p1, p2, p3].map(x => x / 100);
      const E = P[1] + 2 * P[2] + 3 * P[3], E2 = P[1] + 4 * P[2] + 9 * P[3], V = E2 - E * E;
      const params = { level: L, p: P };
      const q0 = `The number of claims ${tex('N')} on a policy in a year is 0, 1, 2 or 3 with probabilities ${d(P[0])}, ${d(P[1])}, ${d(P[2])} and ${d(P[3])}.`;
      const meanLine = texd(t`E[N] = 0(${d(P[0])}) + 1(${d(P[1])}) + 2(${d(P[2])}) + 3(${d(P[3])}) ${eq(E)}`);
      if (L === 1) {
        const ans = P[2] + P[3];
        return { kind: 'prob', params, answer: ans, wrongs: [P[3], 1 - P[0], P[2], P[0] + P[1], 1 - P[3]],
          q: `${q0} What is the probability of at least two claims?`,
          steps: `<p>"At least two" means 2 or 3, so add those probabilities:</p>${texd(t`P(N \ge 2) = ${d(P[2])} + ${d(P[3])} ${eq(ans)}`)}<p>${tex(t`P(N > 2) = ${d(P[3])}`)} leaves out the value 2, and ${d(1 - P[0])} is the probability of at least one claim.</p>` };
      }
      if (L === 2) return { kind: 'num', params, answer: E, wrongs: [E2, 1.5, 1 - P[0], V, Math.sqrt(E2)],
        q: `${q0} Calculate the expected number of claims.`,
        steps: `<p>Weight each value by its probability:</p>${meanLine}<p>The plain average of the values, 1.5, ignores the probabilities; ${d(E2)} is ${tex('E[N^2]')}.</p>` };
      return { kind: 'num', params, answer: V, wrongs: [E2, E2 - E, E, Math.sqrt(V), E * E],
        q: `${q0} Calculate ${tex(t`\operatorname{Var}(N)`)}.`,
        steps: `${meanLine}${texd(t`E[N^2] = 1(${d(P[1])}) + 4(${d(P[2])}) + 9(${d(P[3])}) ${eq(E2)}`)}${texd(t`\operatorname{Var}(N) = E[N^2] - (E[N])^2 = ${d(E2)} - ${d(E)}^2 ${eq(V)}`)}<p>Forgetting to subtract the squared mean leaves ${d(E2)}; subtracting the mean instead of its square gives ${d(E2 - E)}.</p>` };
    }),
  },
  {
    id: 'uv-pdf-power', topic: 'rv', name: 'Finding probabilities and moments from a density',
    gen: retry((r, L) => {
      const k = ri(r, 1, 3), b = pick(r, [4, 5, 10]), K = k + 1, xk = k === 1 ? 'x' : `x^{${k}}`;
      const params = { level: L, k, b };
      const q0 = `A loss ${tex('X')}, in thousands, has density ${tex(t`f(x) = c\,${xk}`)} for ${tex(t`0 < x < ${b}`)}, and 0 elsewhere.`;
      const cLine = `<p>Find ${tex('c')} first: ${tex(t`\int_0^{${b}} c\,${xk}\,dx = c\cdot\frac{${b}^{${K}}}{${K}} = 1`)}, so ${tex(t`c = \frac{${K}}{${b}^{${K}}}`)} and ${tex(t`F(x) = (x/${b})^{${K}}`)}.</p>`;
      const E = K * b / (K + 1), E2 = K * b * b / (K + 2), V = E2 - E * E;
      if (L === 1) {
        const a1 = ri(r, 1, b - 2), a2 = ri(r, a1 + 1, b - 1);
        const F = x => (x / b) ** K, ans = F(a2) - F(a1);
        Object.assign(params, { a1, a2 });
        return { kind: 'prob', params, answer: ans, wrongs: [(a2 - a1) / b, F(a2), 1 - F(a1), ans / K, 1 - ans, (a2 / b) ** k - (a1 / b) ** k],
          q: `${q0} Calculate ${tex(t`P(${a1} < X < ${a2})`)}.`,
          steps: `${cLine}${texd(t`P(${a1} < X < ${a2}) = F(${a2}) - F(${a1}) = \left(\tfrac{${a2}}{${b}}\right)^{${K}} - \left(\tfrac{${a1}}{${b}}\right)^{${K}} ${eq(ans)}`)}<p>Treating the loss as uniform gives ${d((a2 - a1) / b)}; skipping the constant ${tex('c')} gives a total area that is not 1.</p>` };
      }
      if (L === 2) return { kind: 'num', params, answer: E, wrongs: [b / 2, E2, b * k / K, b * 0.5 ** (1 / K), b],
        q: `${q0} Calculate ${tex('E[X]')}.`,
        steps: `${cLine}${texd(t`E[X] = \int_0^{${b}} x\cdot\frac{${K}${xk}}{${b}^{${K}}}\,dx = \frac{${K}}{${K + 1}}\cdot ${b} ${eq(E)}`)}<p>${d(b / 2)} is the midpoint, which would be right only for a flat (uniform) density. The median is ${tex(t`${b}(0.5)^{1/${K}} \approx ${d(b * 0.5 ** (1 / K))}`)}.</p>` };
      return { kind: 'num', params, answer: V, wrongs: [E2, b * b / 12, Math.sqrt(V), E2 - E, E * E],
        q: `${q0} Calculate ${tex(t`\operatorname{Var}(X)`)}.`,
        steps: `${cLine}${texd(t`E[X] = \frac{${K}}{${K + 1}}\cdot ${b} ${eq(E)}, \qquad E[X^2] = \int_0^{${b}} x^2\cdot\frac{${K}${xk}}{${b}^{${K}}}\,dx = \frac{${K}}{${K + 2}}\cdot ${b}^2 ${eq(E2)}`)}${texd(t`\operatorname{Var}(X) = ${d(E2)} - ${d(E)}^2 ${eq(V)}`)}<p>${d(b * b / 12)} is the uniform variance ${tex(t`b^2/12`)}, which ignores the shape of this density.</p>` };
    }),
  },
  {
    id: 'uv-percentile', topic: 'rv', name: 'Percentiles and medians',
    gen: retry((r, L) => {
      if (L === 1) {
        const th = pick(r, [500, 800, 1000, 1200, 2000, 2500, 5000]), p = pick(r, [0.75, 0.8, 0.9, 0.95, 0.99]);
        const ans = -th * Math.log(1 - p);
        return { kind: 'num', params: { level: L, theta: th, p }, answer: ans, wrongs: [-th * Math.log(p), p * th, th * Math.log(2), th / (1 - p), th],
          q: `Claim sizes are exponential with mean ${m(th)}. Calculate the ${Math.round(p * 100)}th percentile of claim size.`,
          steps: `<p>Solve ${tex(t`F(x) = 1 - e^{-x/${th}} = ${d(p)}`)}:</p>${texd(t`x = -${th}\ln(1 - ${d(p)}) = ${th}\ln\left(\tfrac{1}{${d(1 - p)}}\right) ${eqm(ans)}`)}<p>Using ${tex(t`\ln ${d(p)}`)} instead of ${tex(t`\ln(1-${d(p)})`)} gives ${m(-th * Math.log(p))}, which is the ${Math.round((1 - p) * 100)}th percentile.</p>` };
      }
      if (L === 2) {
        const th = pick(r, [500, 1000, 2000, 3000]), al = pick(r, [2, 3, 4]), p = pick(r, [0.5, 0.75, 0.9, 0.95]);
        const ans = th * ((1 - p) ** (-1 / al) - 1);
        return { kind: 'num', params: { level: L, theta: th, alpha: al, p }, answer: ans,
          wrongs: [th * (p ** (-1 / al) - 1), th * (1 - p) ** (-1 / al), th / (al - 1), th * ((1 - p) ** (-al) - 1), th * ((1 - p) ** (-1 / al) - 1) / al],
          q: `Losses have survival function ${tex(t`S(x) = \left(\dfrac{${th}}{${th} + x}\right)^{${al}}`)} for ${tex('x > 0')}. Calculate the ${p === 0.5 ? 'median loss' : Math.round(p * 100) + 'th percentile of the loss'}.`,
          steps: `<p>The ${Math.round(p * 100)}th percentile leaves ${d(1 - p)} above it, so solve ${tex(t`S(x) = ${d(1 - p)}`)}:</p>${texd(t`\frac{${th}}{${th} + x} = ${d(1 - p)}^{1/${al}} \;\Rightarrow\; x = ${th}\left(${d(1 - p)}^{-1/${al}} - 1\right) ${eqm(ans)}`)}<p>Setting ${tex(t`S(x) = ${d(p)}`)} by mistake gives ${m(th * (p ** (-1 / al) - 1))}.</p>` };
      }
      const th = pick(r, [500, 1000, 2000]), q0 = pick(r, [0.4, 0.5, 0.6, 0.7]);
      const p = pick(r, [0.8, 0.9, 0.95].filter(x => x > q0 + 0.15));
      const ans = -th * Math.log((1 - p) / (1 - q0));
      return { kind: 'num', params: { level: L, theta: th, q0, p }, answer: ans,
        wrongs: [-th * Math.log(1 - p), -th * Math.log(1 - (p - q0)), (1 - q0) * -th * Math.log(1 - p), (1 - q0) * th, -th * Math.log(1 - p) - th * q0],
        q: `${pc(Math.round(q0 * 100))} of policies have no claim in a year. For the others, the annual payment is exponential with mean ${m(th)}. Calculate the ${Math.round(p * 100)}th percentile of the annual payment over all policies.`,
        steps: `<p>The payment ${tex('Y')} has a point mass of ${d(q0)} at 0, so for ${tex('y > 0')}:</p>${texd(t`F(y) = ${d(q0)} + ${d(1 - q0)}\left(1 - e^{-y/${th}}\right) = 1 - ${d(1 - q0)}e^{-y/${th}}`)}<p>Set ${tex(t`F(y) = ${d(p)}`)}:</p>${texd(t`e^{-y/${th}} = \frac{${d(1 - p)}}{${d(1 - q0)}} \;\Rightarrow\; y = ${th}\ln\frac{${d(1 - q0)}}{${d(1 - p)}} ${eqm(ans)}`)}<p>Ignoring the policies with no claim gives the exponential percentile ${m(-th * Math.log(1 - p))}, which is too high.</p>` };
    }),
  },
  {
    id: 'uv-mgf', topic: 'moments', name: 'Moment generating functions',
    gen: retry((r, L) => {
      if (L === 3) {
        const al = pick(r, [2, 3, 4, 5]), th = pick(r, [50, 100, 200, 250]), a = pick(r, [2, 3]), b = pick(r, [50, 100, 500]);
        const V = al * th * th, ans = a * a * V;
        return { kind: 'num', params: { level: L, alpha: al, theta: th, a, b }, answer: ans, wrongs: [a * V, V, a * a * V + b, a * a * al * th, a * a * al * al * th * th],
          q: `A claim size ${tex('X')} has moment generating function ${tex(t`M_X(t) = (1 - ${th}t)^{-${al}}`)} for ${tex(t`t < 1/${th}`)}. After expenses, the insurer's cost is ${tex(t`Y = ${a}X + ${b}`)}. Calculate ${tex(t`\operatorname{Var}(Y)`)}.`,
          steps: `<p>${tex(t`(1-\theta t)^{-\alpha}`)} is the gamma MGF, here with ${tex(t`\alpha = ${al}`)} and ${tex(t`\theta = ${th}`)}, so ${tex(t`\operatorname{Var}(X) = \alpha\theta^2 = ${al}(${th})^2 = ${mt(V)}`)}.</p>${texd(t`\operatorname{Var}(${a}X + ${b}) = ${a}^2\operatorname{Var}(X) = ${a * a}(${mt(V)}) = ${mt(ans)}`)}<p>The constant ${b} shifts the cost without changing its spread. Multiplying by ${a} instead of ${a * a} gives ${m(a * V)}.</p>` };
      }
      let xs, P;
      do {
        xs = [0, ri(r, 1, 2), ri(r, 3, 5)];
        const p0 = ri(r, 2, 6), p1 = ri(r, 2, 6); P = [p0, p1, 10 - p0 - p1].map(x => x / 10);
      } while (P[2] < 0.1);
      const E = sumA(xs.map((x, i) => x * P[i])), E2 = sumA(xs.map((x, i) => x * x * P[i])), V = E2 - E * E;
      const term = (x, p) => x === 0 ? d(p) : x === 1 ? t`${d(p)}e^{t}` : t`${d(p)}e^{${x}t}`;
      const M = xs.map((x, i) => term(x, P[i])).join(' + ');
      const params = { level: L, xs, p: P };
      const q0 = `A random variable ${tex('X')} has moment generating function ${tex(t`M_X(t) = ${M}`)}.`;
      const Eline = texd(t`E[X] = M'(0) = ${xs.filter(x => x).map(x => t`${x}(${d(P[xs.indexOf(x)])})`).join(' + ')} ${eq(E)}`);
      if (L === 1) return { kind: 'num', params, answer: E, wrongs: [E2, sumA(xs) / 3, V, Math.sqrt(E2), sumA(P.slice(1))],
        q: `${q0} Calculate ${tex('E[X]')}.`,
        steps: `<p>A sum of terms ${tex(t`p\,e^{xt}`)} is the MGF of a discrete variable: ${tex('X')} is ${xs.join(', ')} with probabilities ${P.map(x => d(x)).join(', ')}.</p>${Eline}<p>Each ${tex(t`e^{xt}`)} differentiates to ${tex(t`x\,e^{xt}`)}, which is ${tex('x')} at ${tex('t=0')}. ${d(E2)} is ${tex(t`M''(0) = E[X^2]`)}.</p>` };
      return { kind: 'num', params, answer: V, wrongs: [E2, E, E2 - E, Math.sqrt(V), E * E],
        q: `${q0} Calculate ${tex(t`\operatorname{Var}(X)`)}.`,
        steps: `<p>${tex('X')} is ${xs.join(', ')} with probabilities ${P.map(x => d(x)).join(', ')}.</p>${Eline}${texd(t`E[X^2] = M''(0) = ${xs.filter(x => x).map(x => t`${x * x}(${d(P[xs.indexOf(x)])})`).join(' + ')} ${eq(E2)}`)}${texd(t`\operatorname{Var}(X) = ${d(E2)} - ${d(E)}^2 ${eq(V)}`)}<p>${tex(t`M''(0)`)} alone is ${tex('E[X^2]')}, not the variance.</p>` };
    }),
  },
  {
    id: 'uv-binomial', topic: 'discrete', name: 'Binomial claim counts',
    gen: retry((r, L) => {
      const n = ri(r, 5, 20), p = pick(r, [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), q = 1 - p;
      const params = { level: L, n, p };
      const q0 = `An insurer covers ${n} independent buildings, each with probability ${d(p)} of a claim this year.`;
      const P1 = n * p * q ** (n - 1), P0 = q ** n;
      if (L === 1) {
        const k = ri(r, 1, Math.max(1, Math.min(3, Math.round(n * p) + 1))), ans = binom(n, p, k);
        Object.assign(params, { k });
        return { kind: 'prob', params, answer: ans, wrongs: [p ** k * q ** (n - k), choose(n, k) * p ** k, pois(n * p, k), binom(n, p, k - 1), 1 - ans],
          q: `${q0} Calculate the probability that exactly ${k} building${k > 1 ? 's have' : ' has'} a claim.`,
          steps: `<p>The count is binomial with ${tex(t`n = ${n}`)} and ${tex(t`p = ${d(p)}`)}:</p>${texd(t`P(N = ${k}) = \binom{${n}}{${k}}(${d(p)})^{${k}}(${d(q)})^{${n - k}} = ${choose(n, k)}(${d(p ** k, 6)})(${d(q ** (n - k), 6)}) ${eq(ans)}`)}<p>Leaving out ${tex(t`\binom{${n}}{${k}}`)} gives the probability of one particular set of ${k}, ${d(p ** k * q ** (n - k))}.</p>` };
      }
      if (L === 2) {
        const ans = 1 - P0 - P1;
        return { kind: 'prob', params, answer: ans, wrongs: [1 - P0, 1 - P0 - p * q ** (n - 1), P1, ans - binom(n, p, 2), 1 - P1],
          q: `${q0} Calculate the probability that at least two buildings have a claim.`,
          steps: `<p>Use the complement of "0 or 1 claims":</p>${texd(t`P(N \ge 2) = 1 - (${d(q)})^{${n}} - ${n}(${d(p)})(${d(q)})^{${n - 1}} = 1 - ${d(P0)} - ${d(P1)} ${eq(ans)}`)}<p>Forgetting the factor ${n} in ${tex('P(N=1)')} counts only one of the ${n} ways to have exactly one claim.</p>` };
      }
      const ans = P1 / (1 - P0);
      return { kind: 'prob', params, answer: ans, wrongs: [P1, 1 - P0, 1 - ans, P1 * (1 - P0), n * p * q ** n / (1 - P0)],
        q: `${q0} Given that at least one building has a claim, calculate the probability that exactly one does.`,
        steps: `<p>Condition on ${tex(t`N \ge 1`)}:</p>${texd(t`P(N = 1 \mid N \ge 1) = \frac{${n}(${d(p)})(${d(q)})^{${n - 1}}}{1 - (${d(q)})^{${n}}} = \frac{${d(P1)}}{${d(1 - P0)}} ${eq(ans)}`)}<p>${d(P1)} is the unconditional probability of exactly one claim; knowing there was at least one raises it.</p>` };
    }),
  },
  {
    id: 'uv-poisson', topic: 'discrete', name: 'Poisson claim counts',
    gen: retry((r, L) => {
      if (L === 3) {
        const lm = pick(r, [0.2, 0.25, 0.3, 0.4, 0.5]), months = pick(r, [3, 4, 6]), Lam = lm * months;
        const ans = Math.exp(-Lam) * (1 + Lam), one = Math.exp(-lm) * (1 + lm);
        return { kind: 'prob', params: { level: L, lambda: lm, months }, answer: ans, wrongs: [one, one ** months, Math.exp(-Lam), 1 - ans, Lam * Math.exp(-Lam)],
          q: `Claims on a fleet policy follow a Poisson distribution with mean ${d(lm)} per month. Calculate the probability of at most one claim in a ${months}-month period.`,
          steps: `<p>Poisson means scale with time: over ${months} months the count is Poisson with mean ${tex(t`${months}(${d(lm)}) = ${d(Lam)}`)}.</p>${texd(t`P(N \le 1) = e^{-${d(Lam)}}(1 + ${d(Lam)}) ${eq(ans)}`)}<p>${d(one ** months)} raises the one-month answer to the power ${months}. That requires at most one claim in <i>every</i> month, which is a different event.</p>` };
      }
      const lam = pick(r, [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]);
      if (L === 1) {
        const k = ri(r, 1, 3), ans = pois(lam, k);
        return { kind: 'prob', params: { level: L, lambda: lam, k }, answer: ans, wrongs: [Math.exp(-lam) * lam ** k, poisCdf(lam, k), 1 - poisCdf(lam, k - 1), Math.exp(-lam), pois(lam, k - 1)],
          q: `The number of claims reported to a branch office in a day is Poisson with mean ${d(lam)}. Calculate the probability that exactly ${k} claim${k > 1 ? 's are' : ' is'} reported tomorrow.`,
          steps: texd(t`P(N = ${k}) = \frac{e^{-${d(lam)}}\,${d(lam)}^{${k}}}{${k}!} ${eq(ans)}`) + `<p>Remember the ${tex(t`${k}!`)} in the denominator. ${d(poisCdf(lam, k))} is ${tex(t`P(N \le ${k})`)}, which also counts days with fewer claims.</p>` };
      }
      const k = ri(r, 2, 3), ans = 1 - poisCdf(lam, k - 1);
      return { kind: 'prob', params: { level: L, lambda: lam, k }, answer: ans, wrongs: [1 - poisCdf(lam, k), pois(lam, k), 1 - Math.exp(-lam), poisCdf(lam, k), 1 - pois(lam, k - 1)],
        q: `The number of claims reported to a branch office in a day is Poisson with mean ${d(lam)}. Calculate the probability that at least ${k} claims are reported tomorrow.`,
        steps: `<p>Use the complement of 0 to ${k - 1} claims:</p>${texd(t`P(N \ge ${k}) = 1 - e^{-${d(lam)}}\left(${Array.from({ length: k }, (_, j) => j === 0 ? '1' : j === 1 ? d(lam) : t`\frac{${d(lam)}^{${j}}}{${j}!}`).join(' + ')}\right) ${eq(ans)}`)}<p>Subtracting up to ${k} instead of ${k - 1} gives ${tex(t`P(N > ${k}) ${eq(1 - poisCdf(lam, k))}`)}, which leaves out ${tex(t`N = ${k}`)}.</p>` };
    }),
  },
  {
    id: 'uv-geom-negbin', topic: 'discrete', name: 'Geometric and negative binomial',
    gen: retry((r, L) => {
      const p = pick(r, [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]), q = 1 - p;
      if (L === 1) {
        const k = ri(r, 3, 6), ans = q ** (k - 1) * p;
        return { kind: 'prob', params: { level: L, p, k }, answer: ans, wrongs: [q ** k * p, p ** (k - 1) * q, 1 - q ** k, q ** (k - 1), k * p * q ** (k - 1)],
          q: `An underwriter reviews applications one at a time until finding one that must be declined. Each application, independently, is declined with probability ${d(p)}. Calculate the probability that the first decline is the application number ${k}.`,
          steps: `<p>The first ${k - 1} applications are accepted and number ${k} is declined (geometric, counting trials):</p>${texd(t`P(X = ${k}) = (${d(q)})^{${k - 1}}(${d(p)}) ${eq(ans)}`)}<p>${d(1 - q ** k)} is the chance of a decline somewhere in the first ${k}, and ${d(q ** k * p)} counts ${k} accepted applications before the decline.</p>` };
      }
      if (L === 2) {
        const k1 = ri(r, 2, 5), k2 = ri(r, 2, 4), ans = q ** k2;
        return { kind: 'prob', params: { level: L, p, k1, k2 }, answer: ans, wrongs: [q ** (k1 + k2), q ** (k2 + 1), q ** (k2 - 1), 1 - ans, q ** k1],
          q: `An underwriter reviews applications one at a time until finding one that must be declined. Each application, independently, is declined with probability ${d(p)}. The first ${k1} applications were all accepted. Calculate the probability that more than ${k2} additional applications are needed to find the first decline.`,
          steps: `<p>The geometric distribution is memoryless: the ${k1} accepted applications do not change the future. Needing more than ${k2} more means the next ${k2} are all accepted:</p>${texd(t`P(X > ${k1 + k2} \mid X > ${k1}) = (${d(q)})^{${k2}} ${eq(ans)}`)}<p>${d(q ** (k1 + k2))} is the unconditional chance that the first ${k1 + k2} are all accepted.</p>` };
      }
      const rr = pick(r, [2, 3]), k = rr + ri(r, 2, 6);
      const ans = choose(k - 1, rr - 1) * p ** rr * q ** (k - rr);
      return { kind: 'prob', params: { level: L, p, r: rr, k }, answer: ans,
        wrongs: [choose(k, rr) * p ** rr * q ** (k - rr), p ** rr * q ** (k - rr), choose(k - 1, rr - 1) * p ** (rr - 1) * q ** (k - rr), choose(k - 1, rr) * p ** rr * q ** (k - rr), choose(k - 1, rr - 1) * p ** (rr - 1) * q ** (k - rr + 1)],
        q: `A claims auditor reviews files one at a time. Each file, independently, contains an error with probability ${d(p)}. Calculate the probability that the ${rr === 2 ? 'second' : 'third'} file with an error is file number ${k}.`,
        steps: `<p>Negative binomial: file ${k} has an error, and exactly ${rr - 1} of the first ${k - 1} files do.</p>${texd(t`\binom{${k - 1}}{${rr - 1}}(${d(p)})^{${rr}}(${d(q)})^{${k - rr}} = ${choose(k - 1, rr - 1)}(${d(p ** rr, 6)})(${d(q ** (k - rr), 6)}) ${eq(ans)}`)}<p>The binomial ${tex(t`\binom{${k}}{${rr}}`)} version, ${d(choose(k, rr) * p ** rr * q ** (k - rr))}, allows the ${rr === 2 ? 'second' : 'third'} error to come before file ${k}.</p>` };
    }),
  },
  {
    id: 'uv-exponential', topic: 'continuous', name: 'Exponential waiting times',
    gen: retry((r, L) => {
      if (L === 3) {
        const md = pick(r, [10, 20, 30, 40]), ratio = pick(r, [1.5, 2, 2.5, 3, 0.5]), x = md * ratio, ans = 2 ** -ratio;
        return { kind: 'prob', params: { level: L, median: md, x }, answer: ans, wrongs: [Math.exp(-ratio), 1 - ans, Math.exp(-ratio / 2), Math.exp(-ratio * Math.log(2) ** 2), 2 ** (-1 / ratio)],
          q: `The time to settle a claim is exponential. Half of all claims settle within ${md} days. Calculate the probability that a claim takes more than ${d(x)} days to settle.`,
          steps: `<p>The median is ${md}: ${tex(t`e^{-${md}/\theta} = 0.5`)}, so ${tex(t`\theta = ${md}/\ln 2 \approx ${d(md / Math.LN2, 2)}`)}.</p>${texd(t`P(X > ${d(x)}) = e^{-${d(x)}\ln 2/${md}} = 0.5^{${d(x)}/${md}} ${eq(ans)}`)}<p>Using ${md} as the mean gives ${tex(t`e^{-${d(ratio)}} ${eq(Math.exp(-ratio))}`)}. For an exponential, the median is ${tex(t`\theta\ln 2`)}, below the mean.</p>` };
      }
      const th = pick(r, [2, 4, 5, 8, 10, 20]);
      if (L === 1) {
        const ratio = pick(r, [0.25, 0.5, 0.75, 1.25, 1.5, 2, 2.5]), a = th * ratio, ans = Math.exp(-ratio);
        return { kind: 'prob', params: { level: L, theta: th, a }, answer: ans, wrongs: [1 - ans, Math.exp(-1 / ratio), ratio * Math.exp(-ratio), Math.exp(-ratio * ratio), Math.exp(-ratio / 2)],
          q: `The time until a machine breaks down is exponential with mean ${th} years. Calculate the probability that it is still working after ${yrs(a)}.`,
          steps: texd(t`P(X > ${d(a)}) = e^{-${d(a)}/${th}} = e^{-${d(ratio)}} ${eq(ans)}`) + `<p>${d(1 - ans)} is the chance it fails within ${yrs(a)}, ${tex(t`F(${d(a)})`)}.</p>` };
      }
      const s = th * pick(r, [0.5, 1, 1.5, 2]), tt = th * pick(r, [0.25, 0.5, 0.75, 1]), ans = 1 - Math.exp(-tt / th);
      return { kind: 'prob', params: { level: L, theta: th, s, t: tt }, answer: ans,
        wrongs: [Math.exp(-tt / th), 1 - Math.exp(-(s + tt) / th), Math.exp(-(s + tt) / th), Math.exp(-s / th) - Math.exp(-(s + tt) / th), 1 - Math.exp(-s / th)],
        q: `The time until a machine breaks down is exponential with mean ${th} years. It has worked for ${yrs(s)}. Calculate the probability that it breaks down within the next ${yrs(tt)}.`,
        steps: `<p>The exponential is memoryless, so having already survived ${yrs(s)} does not matter:</p>${texd(t`P(X \le ${d(s + tt)} \mid X > ${d(s)}) = P(X \le ${d(tt)}) = 1 - e^{-${d(tt)}/${th}} ${eq(ans)}`)}<p>${d(Math.exp(-s / th) - Math.exp(-(s + tt) / th))} is the unconditional chance of breaking down between years ${d(s)} and ${d(s + tt)}; it forgets to divide by ${tex(t`P(X > ${d(s)})`)}.</p>` };
    }),
  },
  {
    id: 'uv-normal', topic: 'continuous', name: 'Normal probabilities',
    gen: retry((r, L) => {
      if (L === 3) {
        const [n, p] = pick(r, [[100, 0.2], [400, 0.1], [400, 0.2], [225, 0.2], [900, 0.1], [100, 0.5], [256, 0.5], [625, 0.2]]);
        const mu = n * p, sd = Math.sqrt(n * p * (1 - p)), k = Math.round(mu + sd * pick(r, [0.5, 0.75, 1, 1.25, 1.5, 2]));
        const z = (k - 0.5 - mu) / sd, ans = 1 - Phi(z);
        return { kind: 'prob', params: { level: L, n, p, k }, answer: ans,
          wrongs: [1 - Phi((k - mu) / sd), 1 - Phi((k + 0.5 - mu) / sd), Phi(z), 1 - Phi((k - 0.5 - mu) / (sd * sd)), 1 - Phi((k - 1.5 - mu) / sd)],
          q: `An insurer writes ${n} independent policies, each with probability ${d(p)} of a claim. Using the normal approximation with a continuity correction, calculate the probability of at least ${k} claims.`,
          steps: `<p>The count is binomial with mean ${tex(t`${n}(${d(p)}) = ${d(mu)}`)} and variance ${tex(t`${n}(${d(p)})(${d(1 - p)}) = ${d(sd * sd)}`)}, so standard deviation ${d(sd)}.</p><p>"At least ${k}" starts at ${d(k - 0.5)} on the continuous scale:</p>${texd(t`P(N \ge ${k}) \approx P\left(Z > \frac{${d(k - 0.5)} - ${d(mu)}}{${d(sd)}}\right) = 1 - \Phi(${d(z, 4)}) ${eq(ans)}`)}<p>Without the correction, ${tex(t`z = ${d((k - mu) / sd)}`)} and the answer is ${d(1 - Phi((k - mu) / sd))}.</p>` };
      }
      const mu = pick(r, [500, 1000, 2000, 5000, 10000]), sd = Math.round(mu * pick(r, [0.1, 0.2, 0.25, 0.3, 0.4]) / 20) * 20;
      if (L === 1) {
        const z = pick(r, [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5]), x = mu + z * sd, ans = 1 - Phi(z);
        return { kind: 'prob', params: { level: L, mu, sd, x }, answer: ans, wrongs: [Phi(z), 2 * ans, Phi(z) - 0.5, 1 - Phi(z / 2), 1 - Phi(z + 0.5)],
          q: `Annual claims on a block of policies are normal with mean ${m(mu)} and standard deviation ${m(sd)}. Calculate the probability that claims exceed ${m(x)}.`,
          steps: texd(t`P(X > ${mt(x)}) = P\left(Z > \frac{${mt(x)} - ${mt(mu)}}{${mt(sd)}}\right) = 1 - \Phi(${d(z)}) ${eq(ans)}`) + `<p>${d(Phi(z))} is ${tex(t`P(X < ${mt(x)})`)}, and ${d(Phi(z) - 0.5)} is the area between the mean and ${m(x)}.</p>` };
      }
      const za = -pick(r, [0.5, 0.75, 1, 1.25, 1.5]), zb = pick(r, [0.5, 1, 1.5, 2, 2.5]), a = mu + za * sd, b = mu + zb * sd, V = sd * sd;
      const ans = Phi(zb) - Phi(za);
      return { kind: 'prob', params: { level: L, mu, variance: V, a, b }, answer: ans,
        wrongs: [Phi(zb) - Phi(-za), 1 - ans, Phi(zb), Phi((b - mu) / V) - Phi((a - mu) / V), Phi(zb) + Phi(za)],
        q: `Annual claims on a block of policies are normal with mean ${m(mu)} and variance ${m(V)}. Calculate the probability that claims fall between ${m(a)} and ${m(b)}.`,
        steps: `<p>The standard deviation is ${tex(t`\sqrt{${mt(V)}} = ${mt(sd)}`)}. Standardize both ends:</p>${texd(t`z_1 = \frac{${mt(a)} - ${mt(mu)}}{${mt(sd)}} = ${d(za)}, \qquad z_2 = \frac{${mt(b)} - ${mt(mu)}}{${mt(sd)}} = ${d(zb)}`)}${texd(t`\Phi(${d(zb)}) - \Phi(${d(za)}) = \Phi(${d(zb)}) - \left(1 - \Phi(${d(-za)})\right) ${eq(ans)}`)}<p>Dividing by the variance instead of the standard deviation squeezes both z-values toward 0.</p>` };
    }),
  },
  {
    id: 'uv-gamma', topic: 'continuous', name: 'Gamma distribution',
    gen: retry((r, L) => {
      const th = pick(r, [100, 200, 250, 500, 1000, 2000]);
      if (L === 1) {
        const al = pick(r, [2, 3, 4, 5, 6]), ans = al * th * th;
        return { kind: 'num', params: { level: L, alpha: al, theta: th }, answer: ans, wrongs: [al * th, th * th, (al * th) ** 2, al * al * th, Math.sqrt(al) * th],
          q: `A claim size is gamma distributed with ${tex(t`\alpha = ${al}`)} and ${tex(t`\theta = ${th}`)}. Calculate its variance.`,
          steps: texd(t`\operatorname{Var}(X) = \alpha\theta^2 = ${al}(${th})^2 = ${mt(ans)}`) + `<p>${m(al * th)} is the mean ${tex(t`\alpha\theta`)}, and ${m(Math.sqrt(al) * th)} is the standard deviation.</p>` };
      }
      const y = pick(r, [1, 1.5, 2, 2.5, 3, 4]), x = y * th;
      if (L === 2) {
        const ans = Math.exp(-y) * (1 + y);
        return { kind: 'prob', params: { level: L, alpha: 2, theta: th, x }, answer: ans, wrongs: [Math.exp(-y), Math.exp(-y / 2), y * Math.exp(-y), 1 - ans, Math.exp(-y) * (1 + y + y * y / 2)],
          q: `A claim is settled in two independent stages, each taking an exponential time with mean ${th} hours. Calculate the probability that the claim takes more than ${m(x)} hours to settle.`,
          steps: `<p>The total is gamma with ${tex(t`\alpha = 2`)} and ${tex(t`\theta = ${th}`)}. It exceeds ${m(x)} exactly when fewer than 2 "stage completions" happen by then, a Poisson count with mean ${tex(t`${mt(x)}/${th} = ${d(y)}`)}:</p>${texd(t`P(X > ${mt(x)}) = e^{-${d(y)}}\left(1 + ${d(y)}\right) ${eq(ans)}`)}<p>Treating the total as one exponential with mean ${m(2 * th)} gives ${d(Math.exp(-y / 2))}.</p>` };
      }
      const ans = 1 - Math.exp(-y) * (1 + y + y * y / 2);
      return { kind: 'prob', params: { level: L, alpha: 3, theta: th, x }, answer: ans,
        wrongs: [1 - Math.exp(-y) * (1 + y), 1 - Math.exp(-y), 1 - ans, 1 - Math.exp(-y / 3), 1 - Math.exp(-y) * (1 + y + y * y)],
        q: `A policy pays out after the third covered event. Events occur with independent exponential gaps, each with mean ${th} days. Calculate the probability that the payout happens within ${m(x)} days.`,
        steps: `<p>The time to the third event is gamma with ${tex(t`\alpha = 3`)} and ${tex(t`\theta = ${th}`)}. It is at most ${m(x)} when at least 3 events happen by then, and the count is Poisson with mean ${tex(t`${mt(x)}/${th} = ${d(y)}`)}:</p>${texd(t`P(X \le ${mt(x)}) = 1 - e^{-${d(y)}}\left(1 + ${d(y)} + \frac{${d(y)}^2}{2}\right) ${eq(ans)}`)}<p>Dropping the ${tex(t`${d(y)}^2/2`)} term gives ${d(1 - Math.exp(-y) * (1 + y))}, which is the probability for the second event.</p>` };
    }),
  },
  {
    id: 'uv-exp-coverage', topic: 'coverage', name: 'Deductibles and limits on exponential losses',
    gen: retry((r, L) => {
      const th = pick(r, [500, 1000, 2000, 2500, 4000, 5000]), dd = th * pick(r, [0.1, 0.2, 0.25, 0.4, 0.5]);
      const Sd = Math.exp(-dd / th), perLoss = th * Sd;
      const q0 = `Losses are exponential with mean ${m(th)}. A policy has an ordinary deductible of ${m(dd)}`;
      if (L === 1) return { kind: 'num', params: { level: L, theta: th, d: dd }, answer: perLoss, wrongs: [th - dd, th, th * (1 - Sd), (th - dd) * Sd, th * Math.exp(-dd / th / 2)],
        q: `${q0}. Calculate the expected payment per loss.`,
        steps: `<p>Integrate the survival function above the deductible:</p>${texd(t`E[(X - ${mt(dd)})_+] = \int_{${mt(dd)}}^{\infty} e^{-x/${th}}\,dx = ${mt(th)}\,e^{-${d(dd / th)}} ${eqm(perLoss)}`)}<p>${m(th - dd)} subtracts the deductible from the mean, but losses below ${m(dd)} pay 0, not a negative amount. ${m(th)} is the expected payment per payment.</p>` };
      const u = dd + th * pick(r, [1, 1.5, 2, 3]), Su = Math.exp(-u / th), layer = th * (Sd - Su);
      if (L === 2) {
        const ans = layer / Sd;
        return { kind: 'num', params: { level: L, theta: th, d: dd, u }, answer: ans, wrongs: [layer, th, u - dd, th * (1 - Su), th * (Sd - Math.exp(-(u - dd) / th))],
          q: `${q0} and a maximum covered loss of ${m(u)}. Calculate the expected payment per payment.`,
          steps: `<p>Per loss, the payment is ${tex(t`(X \wedge ${mt(u)}) - (X \wedge ${mt(dd)})`)}:</p>${texd(t`E[X\wedge ${mt(u)}] - E[X\wedge ${mt(dd)}] = ${mt(th)}\left(e^{-${d(dd / th)}} - e^{-${d(u / th)}}\right) ${eqm(layer)}`)}<p>Divide by the probability of a payment, ${tex(t`S(${mt(dd)}) = e^{-${d(dd / th)}} ${eq(Sd)}`)}:</p>${texd(t`\frac{${mt(layer)}}{${d(Sd)}} ${eqm(ans)}`)}<p>By memorylessness this is also ${tex(t`${mt(th)}\left(1 - e^{-${d((u - dd) / th)}}\right)`)}: an exponential excess with mean ${m(th)}, capped at ${m(u - dd)}.</p>` };
      }
      const c = pick(r, [0.7, 0.75, 0.8, 0.9]), ans = c * layer;
      return { kind: 'num', params: { level: L, theta: th, d: dd, u, c }, answer: ans,
        wrongs: [layer, c * perLoss, c * layer / Sd, c * th * (Sd - Math.exp(-(u + dd) / th)), c * th * (1 - Su)],
        q: `${q0}, a maximum covered loss of ${m(u)}, and ${pc(Math.round(c * 100))} coinsurance. Calculate the expected payment per loss.`,
        steps: `<p>The insurer pays ${tex(t`${d(c)}\left[(X\wedge ${mt(u)}) - (X\wedge ${mt(dd)})\right]`)}. With ${tex(t`E[X\wedge a] = ${mt(th)}(1 - e^{-a/${th}})`)}:</p>${texd(t`E[Y] = ${d(c)}\cdot ${mt(th)}\left(e^{-${d(dd / th)}} - e^{-${d(u / th)}}\right) = ${d(c)}(${mt(layer)}) ${eqm(ans)}`)}<p>Reading ${m(u)} as a cap on the payment instead of on the loss gives ${m(c * th * (Sd - Math.exp(-(u + dd) / th)))}; ignoring the limit gives ${m(c * perLoss)}.</p>` };
    }),
  },
  {
    id: 'uv-discrete-coverage', topic: 'coverage', name: 'Deductibles on a discrete loss',
    gen: retry((r, L) => {
      let v, P;
      do {
        v = [0, ri(r, 1, 4) * 500, ri(r, 5, 10) * 500, ri(r, 12, 30) * 500];
        const p0 = ri(r, 30, 60), p1 = ri(r, 15, 35), p2 = ri(r, 5, 20); P = [p0, p1, p2, 100 - p0 - p1 - p2].map(x => x / 100);
      } while (P[3] < 0.03);
      const dd = pick(r, [v[1] - 250 > 0 ? v[1] - 250 : 250, v[1] + 250, v[1] + 500].filter(x => x > 0 && x < v[2]));
      const EX = sumA(v.map((x, i) => x * P[i])), lim = sumA(v.map((x, i) => Math.min(x, dd) * P[i])), perLoss = EX - lim;
      const Sd = sumA(v.map((x, i) => x > dd ? P[i] : 0)), perPay = perLoss / Sd;
      const pays = v.map((x, i) => [x, P[i]]).filter(([x]) => x > dd);
      const q0 = `A loss is 0, ${m(v[1])}, ${m(v[2])} or ${m(v[3])} with probabilities ${P.map(x => d(x)).join(', ')}, respectively. A policy has an ordinary deductible of ${m(dd)}.`;
      const plLine = texd(t`E[(X - ${mt(dd)})_+] = ${pays.map(([x, p]) => t`${d(p)}(${mt(x - dd)})`).join(' + ')} ${eqm(perLoss)}`);
      const params = { level: L, values: v, p: P, d: dd };
      if (L === 1) return { kind: 'num', params, answer: perLoss, wrongs: [EX - dd, EX, perPay, lim, sumA(pays.map(([x, p]) => x * p))],
        q: `${q0} Calculate the expected payment per loss.`,
        steps: `<p>Only losses above ${m(dd)} pay, and each pays the excess over ${m(dd)}:</p>${plLine}<p>${m(EX - dd)} is ${tex(t`E[X] - ${mt(dd)}`)}, which wrongly charges the deductible on losses that are already smaller than it.</p>` };
      if (L === 2) return { kind: 'num', params, answer: perPay, wrongs: [perLoss, perPay + dd, EX - dd, perLoss / (1 - P[0]), sumA(pays.map(([x]) => x - dd)) / pays.length],
        q: `${q0} Calculate the expected payment per payment.`,
        steps: `<p>Per loss:</p>${plLine}<p>A payment happens when the loss exceeds ${m(dd)}, with probability ${tex(t`${pays.map(([, p]) => d(p)).join(' + ')} ${eq(Sd)}`)}. Per payment:</p>${texd(t`\frac{${mt(perLoss)}}{${d(Sd)}} ${eqm(perPay)}`)}<p>${m(perPay + dd)} is ${tex(t`E[X\mid X > ${mt(dd)}]`)}, which forgets to subtract the deductible.</p>` };
      const ans = lim / EX;
      return { kind: 'prob', params, answer: ans, wrongs: [1 - ans, dd / EX, 1 - Sd, lim / perLoss, perLoss / EX / Sd],
        q: `${q0} Calculate the loss elimination ratio.`,
        steps: `<p>The deductible removes ${tex(t`X\wedge ${mt(dd)}`)} from each loss:</p>${texd(t`E[X\wedge ${mt(dd)}] = ${v.map((x, i) => t`${d(P[i])}(${mt(Math.min(x, dd))})`).join(' + ')} ${eqm(lim)}`)}${texd(t`E[X] = ${v.map((x, i) => t`${d(P[i])}(${mt(x)})`).join(' + ')} ${eqm(EX)}`)}${texd(t`LER = \frac{${mt(lim)}}{${mt(EX)}} ${eq(ans)}`)}<p>${d(1 - Sd)} is the share of <i>losses</i> that pay nothing, not the share of loss <i>dollars</i> eliminated.</p>` };
    }),
  },
];
