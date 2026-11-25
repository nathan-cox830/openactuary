// Exam P · Multivariate Random Variables problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind ('prob' | 'int' | 'num'), steps (HTML), params }.
// The site's makeProblem/buildChoices (data/exam-p/generator.js) turn this into five shuffled choices.
// Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
// Topic keys: joint, condexp, covariance, sums, orderclt.
import { Phi } from '../../../js/util.js';

const t = String.raw;

/* ---------- small helpers ---------- */
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
/** Decimal for display: rounded to dp places, trailing zeros trimmed, never exponent notation. */
const d = (x, dp = 4) => { let s = Number(x).toFixed(dp); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
/** "= x" when exact at dp places, "\approx x" otherwise. */
const eq = (x, dp = 4) => (Math.abs(x - Number(x.toFixed(dp))) < 1e-12 ? '= ' : '\\approx ') + d(x, dp);
const n = x => Math.round(x).toLocaleString('en-US');
const nt = x => n(x).replace(/,/g, '{,}');
const sumA = a => a.reduce((s, x) => s + x, 0);
const tex = s => `<span class="tex">${s}</span>`;
const texd = s => `<div class="texd">${s}</div>`;
const fact = k => { let v = 1; for (let i = 2; i <= k; i++) v *= i; return v; };
const pois = (lam, k) => Math.exp(-lam) * lam ** k / fact(k);
const poisCdf = (lam, k) => { let s = 0; for (let i = 0; i <= k; i++) s += pois(lam, i); return s; };
/** Signed number for TeX: "+ 3" / "- 3" after a term. */
const sg = x => (x < 0 ? '- ' + d(-x) : '+ ' + d(x));
const par = x => (x < 0 ? '(' + d(x) + ')' : d(x));

/* ---------- shared joint table: X in {0,1}, Y in {0,1,2}, cells in hundredths ---------- */
const PAIRS = [
  { xs: 'auto claims', ys: 'homeowners claims', who: 'household' },
  { xs: 'at-fault accidents', ys: 'traffic violations', who: 'driver' },
  { xs: 'dental claims', ys: 'vision claims', who: 'employee' },
  { xs: 'water-damage claims', ys: 'theft claims', who: 'renter' },
];
function jointTable(r, needCov = false) {
  let c, cov;
  do {
    c = [ri(r, 3, 30), ri(r, 3, 25), ri(r, 3, 15), ri(r, 3, 20), ri(r, 3, 20)];
    c.push(100 - sumA(c));
    const p = c.map(v => v / 100);
    const ex = p[3] + p[4] + p[5], ey = p[1] + p[4] + 2 * (p[2] + p[5]), exy = p[4] + 2 * p[5];
    cov = exy - ex * ey;
  } while (c[5] < 3 || c[5] > 35 || (needCov && Math.abs(cov) < 0.006));
  const p = [[c[0] / 100, c[1] / 100, c[2] / 100], [c[3] / 100, c[4] / 100, c[5] / 100]];
  const sc = pick(r, PAIRS);
  const rowX = p.map(row => sumA(row));
  const colY = [0, 1, 2].map(y => p[0][y] + p[1][y]);
  const EX = rowX[1], EY = colY[1] + 2 * colY[2], EY2 = colY[1] + 4 * colY[2], EXY = p[1][1] + 2 * p[1][2];
  const VX = EX - EX * EX, VY = EY2 - EY * EY, COV = EXY - EX * EY;
  const html = `<div class="tblwrap"><table><thead><tr><th></th><th class="num">Y = 0</th><th class="num">Y = 1</th><th class="num">Y = 2</th></tr></thead><tbody>
<tr><td>X = 0</td><td class="num">${p[0][0].toFixed(2)}</td><td class="num">${p[0][1].toFixed(2)}</td><td class="num">${p[0][2].toFixed(2)}</td></tr>
<tr><td>X = 1</td><td class="num">${p[1][0].toFixed(2)}</td><td class="num">${p[1][1].toFixed(2)}</td><td class="num">${p[1][2].toFixed(2)}</td></tr></tbody></table></div>`;
  const intro = `<p>For a randomly chosen ${sc.who}, ${tex('X')} is the number of ${sc.xs} and ${tex('Y')} the number of ${sc.ys} in a year. Their joint probability function is:</p>${html}`;
  return { p, sc, rowX, colY, EX, EY, EY2, EXY, VX, VY, COV, intro };
}

/* ---------- templates ---------- */
export const TEMPLATES = [
  {
    id: 'mv-joint-table', topic: 'joint', name: 'Joint probability table',
    gen(r, L) {
      const J = jointTable(r); const { p, colY, EX, EY, EXY, intro } = J;
      const params = { level: L, p };
      if (L === 1) {
        const ans = p[0][1] + p[0][2] + p[1][2];
        const le = ans + p[0][0] + p[1][1];
        return { kind: 'prob', params, answer: ans, wrongs: [le, p[1][0], 1 - ans, colY[1] + colY[2], p[0][1] + p[0][2], p[1][2]],
          q: intro + `<p>Calculate ${tex('P(X < Y)')}.</p>`,
          steps: `<p>Add the cells where ${tex('x < y')}: ${tex('(0,1)')}, ${tex('(0,2)')} and ${tex('(1,2)')}.</p>${texd(t`P(X\lt Y) = ${d(p[0][1])} + ${d(p[0][2])} + ${d(p[1][2])} ${eq(ans)}`)}<p>Including the ties ${tex('(0,0)')} and ${tex('(1,1)')} gives ${tex('P(X \\le Y)')} ${tex(eq(le))}.</p>` };
      }
      if (L === 2) {
        const ans = EX + EY;
        return { kind: 'num', params, answer: ans, wrongs: [EY, EX, EXY, EX + EY - EXY, EX * EY, EX + colY[1] + colY[2]],
          q: intro + `<p>Calculate the expected total number of claims, ${tex('E[X+Y]')}.</p>`,
          steps: `<p>Expectation is linear, so find each marginal mean from the row and column totals.</p>${texd(t`E[X] = P(X=1) = ${d(p[1][0])} + ${d(p[1][1])} + ${d(p[1][2])} ${eq(EX)}`)}${texd(t`E[Y] = 1(${d(colY[1])}) + 2(${d(colY[2])}) ${eq(EY)}`)}${texd(t`E[X+Y] = ${d(EX)} + ${d(EY)} ${eq(ans)}`)}<p>This holds whether or not ${tex('X')} and ${tex('Y')} are independent.</p>` };
      }
      const ans = EY + p[1][0];
      const g = [[0, 1, 2], [1, 1, 2]];
      return { kind: 'num', params, answer: ans, wrongs: [Math.max(EX, EY), EX + EY, EY, EX + EY - EXY, EX + EY - EX * EY, 2 * EY - p[1][0]],
        q: intro + `<p>Calculate ${tex('E[\\max(X,Y)]')}.</p>`,
        steps: `<p>Weight ${tex('\\max(x,y)')} by each cell's probability. The values of ${tex('\\max(x,y)')} are ${tex('0,1,2')} in the first row and ${tex('1,1,2')} in the second.</p>${texd(t`E[\max(X,Y)] = ${g.flatMap((row, x) => row.map((v, y) => [v, p[x][y]])).filter(([v]) => v > 0).map(([v, q]) => `${v}(${d(q)})`).join(' + ')} ${eq(ans)}`)}<p>${tex('\\max(E[X],E[Y])')} ${tex(eq(Math.max(EX, EY)))} is not the same thing: the expectation of a maximum is at least the maximum of the expectations.</p>` };
    },
  },
  {
    id: 'mv-cond-table', topic: 'condexp', name: 'Conditional distribution from a table',
    gen(r, L) {
      const J = jointTable(r); const { p, rowX, colY, EY, intro } = J;
      const x = ri(r, 0, 1);
      const row = p[x], rx = rowX[x];
      const cy = row.map(v => v / rx);
      const m = cy[1] + 2 * cy[2], m2 = cy[1] + 4 * cy[2], v = m2 - m * m;
      const params = { level: L, p, x };
      const condLine = texd(t`P(Y=y\mid X=${x}) = \frac{p(${x},y)}{${d(rx)}}: \quad ${cy.map((q, y) => t`${y}\mapsto ${d(q)}`).join(',\\ ')}`);
      const rowLine = `<p>Condition on ${tex(`X=${x}`)}: take that row, whose total is ${tex(t`P(X=${x}) = ${row.map(q => d(q)).join(' + ')} = ${d(rx)}`)}, and divide each cell by it.</p>`;
      if (L === 1) {
        const y = ri(r, 0, 2); const ans = cy[y];
        return { kind: 'prob', params: { ...params, y }, answer: ans, wrongs: [row[y], row[y] / colY[y], colY[y], rx, 1 - ans],
          q: intro + `<p>Calculate ${tex(`P(Y=${y}\\mid X=${x})`)}.</p>`,
          steps: `${rowLine}${texd(t`P(Y=${y}\mid X=${x}) = \frac{${d(row[y])}}{${d(rx)}} ${eq(ans)}`)}<p>Dividing by the column total ${d(colY[y])} instead gives the reverse conditional ${tex(`P(X=${x}\\mid Y=${y})`)}.</p>` };
      }
      if (L === 2) {
        const other = rowX[1 - x] ? (p[1 - x][1] + 2 * p[1 - x][2]) / rowX[1 - x] : 0;
        return { kind: 'num', params, answer: m, wrongs: [row[1] + 2 * row[2], EY, other, cy[1] + cy[2], m2, 1.5 * m],
          q: intro + `<p>Calculate ${tex(`E[Y\\mid X=${x}]`)}.</p>`,
          steps: `${rowLine}${condLine}${texd(t`E[Y\mid X=${x}] = 0(${d(cy[0])}) + 1(${d(cy[1])}) + 2(${d(cy[2])}) ${eq(m)}`)}<p>Skipping the division gives ${d(row[1] + 2 * row[2])}; the unconditional mean is ${tex('E[Y]')} ${tex(eq(EY))}.</p>` };
      }
      const VY = J.VY;
      return { kind: 'num', params, answer: v, wrongs: [m2, VY, m, (row[1] + 4 * row[2]) - (row[1] + 2 * row[2]) ** 2, m2 - m, Math.sqrt(v)],
        q: intro + `<p>Calculate ${tex(`\\mathrm{Var}(Y\\mid X=${x})`)}.</p>`,
        steps: `${rowLine}${condLine}${texd(t`E[Y\mid X=${x}] ${eq(m)}, \qquad E[Y^2\mid X=${x}] = 1(${d(cy[1])}) + 4(${d(cy[2])}) ${eq(m2)}`)}${texd(t`\mathrm{Var}(Y\mid X=${x}) = ${d(m2)} - ${d(m)}^2 ${eq(v)}`)}<p>The unconditional variance ${tex('\\mathrm{Var}(Y)')} ${tex(eq(VY))} uses the column totals instead of one row.</p>` };
    },
  },
  {
    id: 'mv-total-var', topic: 'condexp', name: 'Total expectation and variance',
    gen(r, L) {
      if (L === 3) {
        const a = ri(r, 1, 5), b = a + ri(r, 2, 8);
        const m = (a + b) / 2, vt = (b - a) ** 2 / 12, et2 = vt + m * m, ans = et2 + vt;
        return { kind: 'num', params: { level: L, a, b }, answer: ans, wrongs: [et2, m * m, vt, m * m + vt / 2, m * m + (b - a) ** 2 / 6, 2 * m * m],
          q: `Claim sizes for a policy are exponential with mean ${tex('\\Theta')} (in thousands). ${tex('\\Theta')} varies by policyholder and is uniformly distributed on ${tex(`(${a},\\ ${b})`)}. Calculate the variance of the claim size for a randomly chosen policyholder, in thousands squared.`,
          steps: `<p>Given ${tex('\\Theta')}, an exponential has mean ${tex('\\Theta')} and variance ${tex('\\Theta^2')}. For the uniform, ${tex(t`E[\Theta] = ${d(m)}`)} and ${tex(t`\mathrm{Var}(\Theta) = (${b}-${a})^2/12 ${eq(vt)}`)}, so ${tex(t`E[\Theta^2] = ${d(vt)} + ${d(m)}^2 ${eq(et2)}`)}.</p>${texd(t`\mathrm{Var}(X) = E\big[\mathrm{Var}(X\mid\Theta)\big] + \mathrm{Var}\big(E[X\mid\Theta]\big) = E[\Theta^2] + \mathrm{Var}(\Theta) = ${d(et2)} + ${d(vt)} ${eq(ans)}`)}<p>Stopping at the within part ${tex('E[\\Theta^2]')} gives ${d(et2)}; treating the mean as fixed at ${d(m)} gives ${d(m * m)}.</p>` };
      }
      const w = pick(r, [0.6, 0.7, 0.75, 0.8, 0.9]);
      const l1 = pick(r, [0.5, 1, 1.5, 2]), l2 = l1 + pick(r, [1, 1.5, 2, 2.5, 3]);
      const EL = w * l1 + (1 - w) * l2, EL2 = w * l1 * l1 + (1 - w) * l2 * l2, VL = EL2 - EL * EL;
      const params = { level: L, w, l1, l2 };
      const q0 = `${n(w * 100)}% of an insurer's drivers are low risk, with an annual claim count that is Poisson with mean ${d(l1)}. The rest are high risk, with a Poisson mean of ${d(l2)}.`;
      if (L === 1) {
        return { kind: 'num', params, answer: EL, wrongs: [(l1 + l2) / 2, w * l2 + (1 - w) * l1, w * l1, l2 - l1, EL2],
          q: q0 + ' Calculate the expected annual number of claims for a randomly chosen driver.',
          steps: `<p>Law of total expectation: average the class means, weighted by the class shares.</p>${texd(t`E[N] = E\big[E[N\mid\text{class}]\big] = ${d(w)}(${d(l1)}) + ${d(1 - w)}(${d(l2)}) ${eq(EL)}`)}<p>The simple average ${d((l1 + l2) / 2)} ignores that the classes have different sizes.</p>` };
      }
      const ans = EL + VL;
      return { kind: 'num', params, answer: ans, wrongs: [EL, VL, EL2, EL + (l2 - l1) ** 2 / 4, EL + (l2 - l1) ** 2, EL2 + EL],
        q: q0 + ' Calculate the variance of the annual number of claims for a randomly chosen driver.',
        steps: `<p>Within each class a Poisson's variance equals its mean, so ${tex(t`E[\mathrm{Var}(N\mid\Lambda)] = E[\Lambda] ${eq(EL)}`)}.</p><p>Between classes: ${tex(t`\mathrm{Var}(\Lambda) = ${d(w)}(${d(l1)})^2 + ${d(1 - w)}(${d(l2)})^2 - ${d(EL)}^2 ${eq(VL)}`)}.</p>${texd(t`\mathrm{Var}(N) = E[\mathrm{Var}(N\mid\Lambda)] + \mathrm{Var}(E[N\mid\Lambda]) = ${d(EL)} + ${d(VL)} ${eq(ans)}`)}<p>Using only the within part gives ${d(EL)}, as if every driver had the same mean.</p>` };
    },
  },
  {
    id: 'mv-cov-table', topic: 'covariance', name: 'Covariance from a table',
    gen(r, L) {
      const J = jointTable(r, true); const { p, rowX, colY, EX, EY, EY2, EXY, VX, VY, COV, intro } = J;
      const params = { level: L, p };
      const means = texd(t`E[X] = ${d(rowX[1])}, \qquad E[Y] = 1(${d(colY[1])}) + 2(${d(colY[2])}) ${eq(EY)}`);
      const exy = texd(t`E[XY] = 1\cdot1(${d(p[1][1])}) + 1\cdot2(${d(p[1][2])}) ${eq(EXY)}`);
      if (L === 1) {
        return { kind: 'num', params, answer: EXY, wrongs: [EX * EY, p[1][1] + p[1][2], p[1][1] + 4 * p[1][2], EX + EY, COV, p[1][2]],
          q: intro + `<p>Calculate ${tex('E[XY]')}.</p>`,
          steps: `<p>Weight ${tex('xy')} by each cell. Every cell with ${tex('x=0')} or ${tex('y=0')} contributes 0.</p>${exy}<p>${tex('E[X]E[Y]')} ${tex(eq(EX * EY))} would only match if ${tex('X')} and ${tex('Y')} were uncorrelated.</p>` };
      }
      if (L === 2) {
        return { kind: 'num', params, answer: COV, wrongs: [EXY, EX * EY, COV / Math.sqrt(VX * VY), EXY - EX * (colY[1] + colY[2]), 2 * COV, EXY + EX * EY],
          q: intro + `<p>Calculate ${tex('\\mathrm{Cov}(X,Y)')}.</p>`,
          steps: `${means}${exy}${texd(t`\mathrm{Cov}(X,Y) = E[XY] - E[X]E[Y] = ${d(EXY)} - ${d(EX)}(${d(EY)}) ${eq(COV)}`)}<p>${COV > 0 ? 'Positive: the two kinds of claims tend to occur together.' : 'Negative: more of one kind tends to come with fewer of the other.'}</p>` };
      }
      const rho = COV / Math.sqrt(VX * VY);
      return { kind: 'num', params, answer: rho, wrongs: [COV, COV / (VX * VY), COV / Math.sqrt(EX * EY2), COV / (Math.sqrt(VX) + Math.sqrt(VY)), 2 * rho],
        q: intro + `<p>Calculate the correlation coefficient of ${tex('X')} and ${tex('Y')}.</p>`,
        steps: `${means}${exy}${texd(t`\mathrm{Cov}(X,Y) = ${d(EXY)} - ${d(EX)}(${d(EY)}) ${eq(COV, 6)}`)}<p>Variances: ${tex(t`\mathrm{Var}(X) = ${d(EX)} - ${d(EX)}^2 ${eq(VX, 6)}`)} and ${tex(t`\mathrm{Var}(Y) = ${d(EY2)} - ${d(EY)}^2 ${eq(VY, 6)}`)}.</p>${texd(t`\rho = \frac{${d(COV, 6)}}{\sqrt{${d(VX, 6)}\times ${d(VY, 6)}}} ${eq(rho)}`)}` };
    },
  },
  {
    id: 'mv-var-lin', topic: 'covariance', name: 'Variance of a linear combination',
    gen(r, L) {
      if (L === 1) {
        const VX = ri(r, 4, 40), VY = ri(r, 4, 40);
        let C; do { C = ri(r, -8, 12); } while (C === 0 || C * C >= VX * VY);
        const ans = VX + VY + 2 * C;
        return { kind: 'num', params: { level: L, VX, VY, C }, answer: ans, wrongs: [VX + VY, VX + VY + C, VX + VY - 2 * C, VX + VY + 4 * C, (Math.sqrt(VX) + Math.sqrt(VY)) ** 2],
          q: `Annual losses on two lines of business, ${tex('X')} and ${tex('Y')}, have ${tex(`\\mathrm{Var}(X)=${VX}`)}, ${tex(`\\mathrm{Var}(Y)=${VY}`)} and ${tex(`\\mathrm{Cov}(X,Y)=${C}`)}. Calculate the variance of the combined loss ${tex('X+Y')}.`,
          steps: `${texd(t`\mathrm{Var}(X+Y) = \mathrm{Var}(X) + \mathrm{Var}(Y) + 2\,\mathrm{Cov}(X,Y) = ${VX} + ${VY} + 2${par(C)} = ${d(ans)}`)}<p>Leaving out the covariance gives ${VX + VY}, which is only right for uncorrelated losses.</p>` };
      }
      const sX = ri(r, 2, 10), sY = ri(r, 2, 10);
      let rho; do { rho = ri(r, -7, 8) / 10; } while (rho === 0);
      const C = rho * sX * sY, VX = sX * sX, VY = sY * sY;
      if (L === 2) {
        const a = pick(r, [2, 3]), b = pick(r, [1, 2]);
        const ans = a * a * VX + b * b * VY - 2 * a * b * C;
        return { kind: 'num', params: { level: L, sX, sY, rho, a, b }, answer: ans, wrongs: [a * a * VX + b * b * VY + 2 * a * b * C, a * a * VX + b * b * VY, a * VX + b * VY - 2 * a * b * C, a * a * VX - b * b * VY - 2 * a * b * C, a * a * VX + b * b * VY - 2 * a * b * rho],
          q: `${tex('X')} and ${tex('Y')} have standard deviations ${sX} and ${sY} and correlation coefficient ${d(rho)}. Calculate ${tex(`\\mathrm{Var}(${a}X - ${b === 1 ? '' : b}Y)`)}.`,
          steps: `<p>First the covariance: ${tex(t`\mathrm{Cov}(X,Y) = \rho\,\sigma_X\sigma_Y = ${d(rho)}(${sX})(${sY}) = ${d(C)}`)}.</p>${texd(t`\mathrm{Var}(${a}X - ${b === 1 ? '' : b}Y) = ${a}^2(${VX}) + ${b}^2(${VY}) + 2(${a})(-${b})${par(C)} = ${d(a * a * VX)} + ${d(b * b * VY)} ${sg(-2 * a * b * C)} = ${d(ans)}`)}<p>The coefficient on ${tex('Y')} is negative, so the covariance term flips sign; the variance terms do not, because the coefficients are squared.</p>` };
      }
      const W = VX + VY + 2 * C, ans = VX + VY - 2 * C;
      return { kind: 'num', params: { level: L, VX, VY, W }, answer: ans, wrongs: [W, VX + VY, VX + VY - C, Math.abs(VX - VY) + 2 * Math.abs(C), 2 * (VX + VY) + W],
        q: `For two claim amounts, ${tex(`\\mathrm{Var}(X)=${VX}`)}, ${tex(`\\mathrm{Var}(Y)=${VY}`)} and ${tex(`\\mathrm{Var}(X+Y)=${d(W)}`)}. Calculate ${tex('\\mathrm{Var}(X-Y)')}.`,
        steps: `<p>Back out the covariance from the variance of the sum:</p>${texd(t`2\,\mathrm{Cov}(X,Y) = ${d(W)} - ${VX} - ${VY} = ${d(2 * C)}`)}${texd(t`\mathrm{Var}(X-Y) = ${VX} + ${VY} - 2\,\mathrm{Cov}(X,Y) = ${VX + VY} ${sg(-2 * C)} = ${d(ans)}`)}<p>Shortcut: ${tex('\\mathrm{Var}(X+Y) + \\mathrm{Var}(X-Y) = 2\\mathrm{Var}(X) + 2\\mathrm{Var}(Y)')}.</p>` };
    },
  },
  {
    id: 'mv-sum-dist', topic: 'sums', name: 'Distribution of a sum',
    gen(r, L) {
      if (L === 1) {
        const l1 = pick(r, [0.5, 1, 1.5, 2, 2.5, 3]), l2 = pick(r, [0.5, 1, 1.5, 2, 2.5, 3, 4]);
        const lam = l1 + l2, k = ri(r, 1, 5), ans = pois(lam, k);
        return { kind: 'prob', params: { level: L, l1, l2, k }, answer: ans, wrongs: [pois(l1, k) + pois(l2, k), pois(lam, k - 1), pois(lam / 2, k), pois(l1, k) * pois(l2, k), poisCdf(lam, k), Math.exp(-lam) * lam ** k],
          q: `Claims arrive from two independent sources. The weekly counts are Poisson with means ${d(l1)} and ${d(l2)}. Calculate the probability of exactly ${k} claim${k > 1 ? 's' : ''} in total next week.`,
          steps: `<p>The MGFs multiply: ${tex(t`e^{${d(l1)}(e^t-1)}\,e^{${d(l2)}(e^t-1)} = e^{${d(lam)}(e^t-1)}`)}, so the total is Poisson with mean ${d(lam)}.</p>${texd(t`P(N=${k}) = \frac{e^{-${d(lam)}}\,${d(lam)}^{${k}}}{${k}!} ${eq(ans)}`)}<p>Adding ${tex(`P(X=${k})+P(Y=${k})`)} misses every way of splitting the ${k} claims between the two sources.</p>` };
      }
      if (L === 2) {
        const [u, v, w] = pick(r, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [4, 3, 5], [12, 5, 13]]);
        const s = pick(r, [20, 40, 100]);
        const s1 = u * s, s2 = v * s, sd = w * s;
        const m1 = 100 * ri(r, 20, 60), m2 = 100 * ri(r, 10, 50);
        const diff = r() < 0.5;
        const mu = diff ? m1 - m2 : m1 + m2;
        const z = ri(r, 4, 50) * 0.05, c = Math.round(mu + z * sd), ans = 1 - Phi(z);
        const sdBad = s1 + s2, sdBad2 = Math.sqrt(Math.abs(s2 * s2 - s1 * s1));
        const wr = [1 - Phi((c - mu) / sdBad), Phi(z), 2 * (1 - Phi(z)), Phi(z) - 0.5, 1 - Phi((c - mu) / sdBad2), 1 - Phi((c - (diff ? m1 + m2 : m1 - m2)) / sd)];
        const ev = diff ? `portfolio A's loss exceeds portfolio B's loss by more than ${n(c)}` : `the combined loss exceeds ${n(c)}`;
        return { kind: 'prob', params: { level: L, m1, m2, s1, s2, c, diff }, answer: ans, wrongs: wr,
          q: `Annual losses for portfolio A are normal with mean ${n(m1)} and standard deviation ${n(s1)}. Losses for portfolio B are normal with mean ${n(m2)} and standard deviation ${n(s2)}, independent of A. Calculate the probability that ${ev}.`,
          steps: `<p>A ${diff ? 'difference' : 'sum'} of independent normals is normal. Means ${diff ? 'subtract' : 'add'}, and variances add either way:</p>${texd(t`E = ${nt(m1)} ${diff ? '-' : '+'} ${nt(m2)} = ${nt(mu)}, \qquad \mathrm{SD} = \sqrt{${nt(s1)}^2 + ${nt(s2)}^2} = ${nt(sd)}`)}${texd(t`P\big(A ${diff ? '-' : '+'} B > ${nt(c)}\big) = 1 - \Phi\left(\frac{${nt(c)} - ${nt(mu)}}{${nt(sd)}}\right) = 1 - \Phi(${d(z, 2)}) ${eq(ans)}`)}<p>Adding the standard deviations (${n(sdBad)}) instead of the variances overstates the spread.</p>` };
      }
      const th = pick(r, [1, 2, 3, 5, 10]);
      const a1 = ri(r, 1, 3), a2 = ri(r, 1, 4), N = a1 + a2;
      const m = ri(r, 1, Math.max(2, N)), s = m * th;
      const ans = poisCdf(m, N - 1);
      return { kind: 'prob', params: { level: L, th, a1, a2, s }, answer: ans, wrongs: [poisCdf(m, N - 2), poisCdf(m, N), 1 - ans, Math.exp(-s / (N * th)), poisCdf(m, a1 - 1), Math.exp(-m)],
        q: `Losses ${tex('X')} and ${tex('Y')} are independent, with moment generating functions ${tex(`M_X(t) = (1-${th}t)^{-${a1}}`)} and ${tex(`M_Y(t) = (1-${th}t)^{-${a2}}`)}. Calculate ${tex(`P(X+Y > ${s})`)}.`,
        steps: `<p>${tex(t`M_{X+Y}(t) = (1-${th}t)^{-${N}}`)}, the MGF of a gamma with ${tex(`\\alpha=${N}`)} and ${tex(`\\theta=${th}`)}: the sum of ${N} independent exponential waits with mean ${th}.</p><p>The sum exceeds ${s} exactly when fewer than ${N} exponential arrivals happen by time ${s}. That count is Poisson with mean ${tex(`${s}/${th} = ${m}`)}:</p>${texd(t`P(X+Y>${s}) = \sum_{k=0}^{${N - 1}} \frac{e^{-${m}}\,${m}^k}{k!} ${eq(ans)}`)}<p>Stopping one term early gives ${d(poisCdf(m, N - 2))}.</p>` };
    },
  },
  {
    id: 'mv-min-max', topic: 'orderclt', name: 'First and last claim (min and max)',
    gen(r, L) {
      if (L === 1) {
        const k = ri(r, 2, 4); const means = Array.from({ length: k }, () => pick(r, [2, 4, 5, 10, 20]));
        const tt = pick(r, [1, 2, 3]);
        const rate = sumA(means.map(m => 1 / m)), ans = Math.exp(-rate * tt);
        const all = means.reduce((v, m) => v * (1 - Math.exp(-tt / m)), 1);
        return { kind: 'prob', params: { level: L, means, tt }, answer: ans, wrongs: [1 - ans, Math.exp(-tt / sumA(means)), Math.exp(-tt * k / sumA(means)), all, 1 - all, Math.exp(-tt / Math.min(...means))],
          q: `${k === 2 ? 'Two' : k === 3 ? 'Three' : 'Four'} independent policies have exponentially distributed times until their next claim, with means ${means.join(', ')} years. Calculate the probability that none of them has a claim in the next ${tt} year${tt > 1 ? 's' : ''}.`,
          steps: `<p>"None has a claim" means the minimum exceeds ${tt}. For exponentials the rates add:</p>${texd(t`\lambda = ${means.map(m => t`\tfrac{1}{${m}}`).join(' + ')} = ${d(rate)}`)}${texd(t`P(\min > ${tt}) = e^{-${d(rate)}(${tt})} ${eq(ans)}`)}<p>Adding the means (${sumA(means)} years) instead of the rates gives ${d(Math.exp(-tt / sumA(means)))}.</p>` };
      }
      if (L === 2) {
        const k = ri(r, 2, 5), b = pick(r, [10, 20, 30]), tt = ri(r, 2, b - 2), u = tt / b;
        const all = r() < 0.5;
        const pAll = u ** k, pOne = 1 - (1 - u) ** k, ans = all ? pAll : pOne;
        return { kind: 'prob', params: { level: L, k, b, tt, all }, answer: ans, wrongs: [all ? pOne : pAll, u, all ? 1 - pAll : (1 - u) ** k, all ? u ** (k - 1) : k * u * (1 - u) ** (k - 1), all ? pAll * k : 1 - pAll],
          q: `${k} claims are reported independently, each at a time uniformly distributed over the next ${b} days. Calculate the probability that ${all ? 'all of them are' : 'at least one of them is'} reported within ${tt} days.`,
          steps: all
            ? `<p>"All within ${tt}" means the maximum is at most ${tt}, so every report time must be:</p>${texd(t`P(\max\le ${tt}) = \left(\frac{${tt}}{${b}}\right)^{${k}} ${eq(ans)}`)}<p>"At least one" would be the minimum: ${tex(t`1-(1-${d(u)})^{${k}}`)} ${tex(eq(pOne))}.</p>`
            : `<p>"At least one within ${tt}" means the minimum is at most ${tt}. Use the complement, none within ${tt}:</p>${texd(t`P(\min\le ${tt}) = 1 - \left(1-\frac{${tt}}{${b}}\right)^{${k}} ${eq(ans)}`)}<p>"All within ${tt}" would be the maximum: ${tex(t`${d(u)}^{${k}}`)} ${tex(eq(pAll))}.</p>` };
      }
      const a = pick(r, [10, 12, 20]), th = pick(r, [2, 4, 5, 8, 10]), tt = ri(r, 2, a - 2);
      const FU = tt / a, FE = 1 - Math.exp(-tt / th);
      const both = r() < 0.5;
      const pMax = FU * FE, pMin = 1 - (1 - FU) * (1 - FE), ans = both ? pMax : pMin;
      return { kind: 'prob', params: { level: L, a, th, tt, both }, answer: ans, wrongs: [both ? pMin : pMax, FU * Math.exp(-tt / th), FU, FE, (FU + FE) / 2, 1 - ans],
        q: `A claim has a medical portion and a property portion, settled independently. The medical settlement time is uniform on ${tex(`(0, ${a})`)} months and the property settlement time is exponential with mean ${th} months. Calculate the probability that ${both ? 'the claim is fully closed (both portions settled)' : 'at least one portion is settled'} within ${tt} months.`,
        steps: `<p>${tex(t`P(M\le ${tt}) = ${tt}/${a} ${eq(FU)}`)} and ${tex(t`P(R\le ${tt}) = 1-e^{-${tt}/${th}} ${eq(FE)}`)}.</p>${both
          ? `<p>Fully closed means the later time, the maximum, is at most ${tt}:</p>${texd(t`P(\max\le ${tt}) = ${d(FU)}(${d(FE)}) ${eq(ans)}`)}`
          : `<p>At least one settled means the earlier time, the minimum, is at most ${tt}. Use the complement (neither settled):</p>${texd(t`P(\min\le ${tt}) = 1 - (1-${d(FU)})(1-${d(FE)}) ${eq(ans)}`)}`}<p>The ${both ? 'minimum' : 'maximum'} would give ${d(both ? pMin : pMax)}.</p>` };
    },
  },
  {
    id: 'mv-clt', topic: 'orderclt', name: 'Central limit theorem',
    gen(r, L) {
      if (L === 3) {
        const [nn, v] = pick(r, [[100, 0.25], [400, 0.25], [400, 0.0625], [100, 1]]), sd = Math.round(Math.sqrt(nn * v));
        const mu = pick(r, [0.1, 0.15, 0.2, 0.25, 0.3]), M = Math.round(nn * mu);
        const k = M + ri(r, -Math.floor(1.5 * sd), Math.floor(2 * sd));
        const z = (k + 0.5 - M) / sd, ans = Phi(z);
        return { kind: 'prob', params: { level: L, nn, mu, v, k }, answer: ans, wrongs: [Phi((k - M) / sd), Phi((k - 0.5 - M) / sd), 1 - ans, Phi((k + 0.5 - M) / (sd * sd)), Phi((k + 0.5 - M) / Math.sqrt(v))],
          q: `Each of ${nn} independent policies has an annual number of claims with mean ${d(mu)} and variance ${d(v)}. Using the normal approximation with a continuity correction, calculate the probability that the total number of claims is at most ${k}.`,
          steps: `<p>The total has mean ${tex(t`${nn}(${d(mu)}) = ${M}`)} and SD ${tex(t`\sqrt{${nn}(${d(v)})} = ${sd}`)}. The count is a whole number, so "at most ${k}" becomes "below ${k}.5":</p>${texd(t`P(N\le ${k}) \approx \Phi\left(\frac{${k}.5 - ${M}}{${sd}}\right) = \Phi(${d(z, 2)}) ${eq(ans)}`)}<p>Without the correction, ${tex(t`\Phi(${d((k - M) / sd, 2)})`)} ${tex(eq(Phi((k - M) / sd)))}.</p>` };
      }
      const nn = pick(r, [25, 36, 49, 64, 100, 144]), rt = Math.sqrt(nn);
      const mu = 100 * ri(r, 5, 30), sig = L === 1 ? 100 * ri(r, 2, 15) : 10 * rt * ri(r, 2, 30);
      const z = ri(r, 6, 50) * 0.05;
      if (L === 1) {
        const ES = nn * mu, SD = sig * rt, s = Math.round(ES + z * SD), ans = 1 - Phi(z);
        return { kind: 'prob', params: { level: L, nn, mu, sig, s }, answer: ans, wrongs: [1 - Phi((s - ES) / (nn * sig)), 1 - Phi((s - ES) / sig), Phi(z), 2 * (1 - Phi(z)), Phi(z) - 0.5, 1 - Phi((s - ES) / (sig * sig * nn))],
          q: `An insurer has ${nn} independent claims outstanding. Each has mean ${n(mu)} and standard deviation ${n(sig)}. Using the normal approximation, calculate the probability that the total payment exceeds ${n(s)}.`,
          steps: `<p>The total has mean ${tex(t`${nn}(${nt(mu)}) = ${nt(ES)}`)} and standard deviation ${tex(t`${nt(sig)}\sqrt{${nn}} = ${nt(SD)}`)}.</p>${texd(t`P(S>${nt(s)}) \approx 1-\Phi\left(\frac{${nt(s)}-${nt(ES)}}{${nt(SD)}}\right) = 1-\Phi(${d(z, 2)}) ${eq(ans)}`)}<p>Using ${tex(t`${nn}\times${nt(sig)}`)} as the standard deviation would give ${d(1 - Phi((s - ES) / (nn * sig)))}: variances add, so the SD grows only like ${tex('\\sqrt n')}.</p>` };
      }
      const SDm = sig / rt, xbar = mu + z * SDm, ans = 1 - Phi(z);
      return { kind: 'prob', params: { level: L, nn, mu, sig, xbar }, answer: ans, wrongs: [1 - Phi((xbar - mu) / sig), 1 - Phi((xbar - mu) / (sig / nn)), Phi(z), 2 * (1 - Phi(z)), Phi(z) - 0.5, 1 - Phi((xbar - mu) / (sig * sig / nn))],
        q: `Claim amounts are independent with mean ${n(mu)} and standard deviation ${n(sig)}. Using the normal approximation, calculate the probability that the average of the next ${nn} claims exceeds ${d(xbar, 2)}.`,
        steps: `<p>The average has mean ${n(mu)} and standard deviation ${tex(t`${nt(sig)}/\sqrt{${nn}} ${eq(SDm, 4)}`)}.</p>${texd(t`P(\bar X > ${d(xbar, 2)}) \approx 1-\Phi\left(\frac{${d(xbar, 2)} - ${nt(mu)}}{${d(SDm, 4)}}\right) = 1-\Phi(${d(z, 2)}) ${eq(ans)}`)}<p>Using ${n(sig)} as the average's standard deviation gives ${d(1 - Phi((xbar - mu) / sig))}, far too large.</p>` };
    },
  },
];
