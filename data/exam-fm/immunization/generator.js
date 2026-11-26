// Exam FM · Duration, Immunization and Swaps problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind ('num'), steps (HTML), params }.
// The site's makeProblem/buildChoices (data/exam-p/generator.js) turn these into five shuffled choices.
// Durations, convexities and money amounts are 'num'; rates are given as percent numbers (3.95 means 3.95%).
// Every template retries its random draw until at least four wrong answers display differently from the
// answer and from each other, so the common-mistake choices are always shown.
// Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
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
const sumA = a => a.reduce((s, x) => s + x, 0);
/** A rate as a percent string: pc(0.035) = '3.5%' (prose); pt() is the TeX version. */
const pc = (x, dp = 3) => d(x * 100, dp) + '%';
const pt = (x, dp = 3) => d(x * 100, dp) + '\\%';

/* ---------- cash-flow helpers (cf = [[time, amount], ...]) ---------- */
const pv = (cf, i) => sumA(cf.map(([s, c]) => c * (1 + i) ** -s));
const dmac = (cf, i) => sumA(cf.map(([s, c]) => s * c * (1 + i) ** -s)) / pv(cf, i);
const cmac = (cf, i) => sumA(cf.map(([s, c]) => s * s * c * (1 + i) ** -s)) / pv(cf, i);
const cmod = (cf, i) => sumA(cf.map(([s, c]) => s * (s + 1) * c * (1 + i) ** (-s - 2))) / pv(cf, i);
const bondCf = (F, cr, n) => Array.from({ length: n }, (_, k) => [k + 1, F * cr + (k + 1 === n ? F : 0)]);
/** Zero-coupon prices P_1..P_n from spot rates. */
const zeros = s => s.map((x, k) => (1 + x) ** -(k + 1));

/* Mirror of buildChoices' display rules, so a draw can be rejected when fewer than 4 mistakes would show. */
const fmtNum = v => Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(+v.toPrecision(Math.abs(v) >= 1 ? 6 : 4));
function distinctWrongs(g) {
  const a = g.answer, ok = v => isFinite(v) && (a >= 0 ? v >= 0 : v < 0) && Math.abs(v) > 1e-9;
  const seen = new Set([fmtNum(a)]);
  g.wrongs.forEach(v => { if (ok(v)) seen.add(fmtNum(v)); });
  return seen.size - 1;
}
/** Run a draw up to 60 times until it has a finite answer and 4 distinct displayable mistakes. */
const retry = once => (r, L) => { let g; for (let i = 0; i < 60; i++) { g = once(r, L); if (isFinite(g.answer) && distinctWrongs(g) >= 4) return g; } return g; };

/* ---------- templates ---------- */
export const TEMPLATES = [
  {
    id: 'fm-im-t-dur', dp: 3, topic: 'duration', name: 'Macaulay and modified duration',
    gen: retry((r, L) => {
      if (L === 1) {
        const t1 = ri(r, 1, 4), t2 = t1 + ri(r, 2, 6), c1 = 500 * ri(r, 2, 10), c2 = 500 * ri(r, 2, 10), i = ri(r, 3, 8) / 100;
        const cf = [[t1, c1], [t2, c2]], a = c1 * (1 + i) ** -t1, b = c2 * (1 + i) ** -t2, D = (t1 * a + t2 * b) / (a + b);
        const und = (t1 * c1 + t2 * c2) / (c1 + c2);
        return { kind: 'num', params: { level: L, cf, i }, answer: D, wrongs: [und, (t1 + t2) / 2, D / (1 + i), D * (1 + i), t2],
          q: `A liability requires payments of ${m(c1)} at time ${t1} and ${m(c2)} at time ${t2}. Calculate the Macaulay duration of these payments at an annual effective rate of ${pc(i, 2)}.`,
          steps: `<p>Present values: ${tex(t`${mt(c1)}(${d(1 + i)})^{-${t1}} ${eqm(a)}`)} and ${tex(t`${mt(c2)}(${d(1 + i)})^{-${t2}} ${eqm(b)}`)}.</p>${texd(t`D_{\text{mac}} = \frac{${t1}(${mt(a)}) + ${t2}(${mt(b)})}{${mt(a + b)}} ${eq(D)}`)}<p>Weighting by the undiscounted amounts gives ${d(und)}, and dividing by ${d(1 + i)} gives the modified duration ${d(D / (1 + i))}.</p>` };
      }
      const n = ri(r, 3, 6), cr = ri(r, 3, 9) / 100, y = ri(r, 3, 9) / 100, F = 1000;
      const cf = bondCf(F, cr, n), P = pv(cf, y), D = dmac(cf, y), Dc = dmac(cf, cr), Dm = D / (1 + y);
      const und = sumA(cf.map(([s, c]) => s * c)) / sumA(cf.map(([, c]) => c));
      const params = { level: L, n, coupon: cr, yield: y, cf };
      const q0 = `A ${n}-year bond with face 1,000 pays annual coupons at ${pc(cr, 1)}. It is priced at an annual effective yield of ${pc(y, 1)}.`;
      const pvs = cf.map(([s, c]) => c * (1 + y) ** -s);
      const work = `<p>Cash flows: ${cf.map(([s, c]) => m(c)).join(', ')} at times 1 to ${n}. Price ${tex(t`P = \sum C_t(1+i)^{-t} ${eqm(P)}`)}.</p>${texd(t`D_{\text{mac}} = \frac{\sum t\,C_t v^t}{P} = \frac{${mt(sumA(pvs.map((x, k) => (k + 1) * x)))}}{${mt(P)}} ${eq(D)}`)}`;
      if (L === 2) return { kind: 'num', params, answer: D, wrongs: [n, Dm, Dc, und, D * (1 + y)],
        q: `${q0} Calculate its Macaulay duration.`,
        steps: `${work}<p>The duration is below the term ${n} because coupons arrive earlier. Weighting by undiscounted cash flows gives ${d(und)}; valuing at the coupon rate instead of the yield gives ${d(Dc)}.</p>` };
      return { kind: 'num', params, answer: Dm, wrongs: [D, D * (1 + y), D / (1 + y) ** 2, und / (1 + y), Dc / (1 + cr)],
        q: `${q0} Calculate its modified duration.`,
        steps: `${work}${texd(t`D_{\text{mod}} = \frac{D_{\text{mac}}}{1+i} = \frac{${d(D)}}{${d(1 + y)}} ${eq(Dm)}`)}<p>Stopping at the Macaulay duration gives ${d(D)}; multiplying by ${d(1 + y)} instead of dividing gives ${d(D * (1 + y))}.</p>` };
    }),
  },
  {
    id: 'fm-im-t-approx', dp: 2, topic: 'duration', name: 'Duration and convexity price approximations',
    gen: retry((r, L) => {
      const P0 = 500 * ri(r, 2, 40), i0 = ri(r, 3, 8) / 100, up = r() < 0.6, dI = (up ? 1 : -1) * pick(r, [0.0025, 0.005, 0.0075, 0.01, 0.015]), i1 = i0 + dI;
      const params = { level: L, P0, i0, i1 };
      const move = `${up ? 'rises' : 'falls'} from ${pc(i0, 2)} to ${pc(i1, 2)}`;
      if (L === 1) {
        const Dm = ri(r, 20, 120) / 10; params.Dmod = Dm;
        const ans = P0 * (1 - dI * Dm);
        return { kind: 'num', params, answer: ans, wrongs: [P0 * (1 + dI * Dm), P0 * ((1 + i0) / (1 + i1)) ** Dm, P0 * (1 - dI * Dm / (1 + i0)), P0 * (1 - dI * Dm * (1 + i0)), P0 * Math.abs(dI) * Dm],
          q: `A bond portfolio is worth ${m(P0)} and has modified duration ${d(Dm)}. Using the first-order (modified duration) approximation, estimate its value if the annual effective yield ${move}.`,
          steps: `${texd(t`P(i_1) \approx P(i_0)\left[1 - (i_1 - i_0)D_{\text{mod}}\right] = ${mt(P0)}\left[1 - (${d(dI)})(${d(Dm)})\right] ${eqm(ans)}`)}<p>Prices move opposite to yields. Using the wrong sign gives ${m(P0 * (1 + dI * Dm))}, and ${m(P0 * Math.abs(dI) * Dm)} is only the size of the change.</p>` };
      }
      if (L === 2) {
        const D = ri(r, 20, 150) / 10; params.Dmac = D;
        const ans = P0 * ((1 + i0) / (1 + i1)) ** D;
        return { kind: 'num', params, answer: ans, wrongs: [P0 * (1 - dI * D / (1 + i0)), P0 * (1 - dI * D), P0 * ((1 + i1) / (1 + i0)) ** D, P0 * ((1 + i0) / (1 + i1)) ** (D / (1 + i0))],
          q: `A bond portfolio is worth ${m(P0)} and has Macaulay duration ${d(D)}. Using the first-order Macaulay approximation, estimate its value if the annual effective yield ${move}.`,
          steps: `<p>Treat the portfolio as one payment at time ${d(D)}:</p>${texd(t`P(i_1) \approx P(i_0)\left(\frac{1+i_0}{1+i_1}\right)^{D_{\text{mac}}} = ${mt(P0)}\left(\frac{${d(1 + i0)}}{${d(1 + i1)}}\right)^{${d(D)}} ${eqm(ans)}`)}<p>The modified-duration line gives ${m(P0 * (1 - dI * D / (1 + i0)))}; plugging the Macaulay duration into that line without dividing by ${d(1 + i0)} gives ${m(P0 * (1 - dI * D))}.</p>` };
      }
      const Dm = ri(r, 30, 150) / 10, C = Math.round(Dm * Dm * (1 + r()) + ri(r, 5, 40)); Object.assign(params, { Dmod: Dm, Cmod: C });
      const lin = -dI * Dm, quad = dI * dI / 2 * C, ans = P0 * (1 + lin + quad);
      return { kind: 'num', params, answer: ans, wrongs: [P0 * (1 + lin), P0 * (1 + lin + 2 * quad), P0 * (1 + lin - quad), P0 * (1 - lin + quad), P0 * (lin + quad)],
        q: `A bond portfolio is worth ${m(P0)}, with modified duration ${d(Dm)} and modified convexity ${C}. Using the second-order approximation, estimate its value if the annual effective yield ${move}.`,
        steps: `${texd(t`\frac{\Delta P}{P} \approx -(\Delta i)D_{\text{mod}} + \frac{(\Delta i)^2}{2}C_{\text{mod}} = -(${d(dI)})(${d(Dm)}) + \frac{(${d(dI)})^2}{2}(${C}) ${eq(lin + quad, 6)}`)}${texd(t`P \approx ${mt(P0)}(${d(1 + lin + quad, 6)}) ${eqm(ans)}`)}<p>The convexity term is positive whichever way rates move. Leaving it out gives ${m(P0 * (1 + lin))}; forgetting the ${tex(t`\tfrac12`)} gives ${m(P0 * (1 + lin + 2 * quad))}.</p>` };
    }),
  },
  {
    id: 'fm-im-t-convexity', dp: 2, topic: 'duration', name: 'Convexity',
    gen: retry((r, L) => {
      const i = ri(r, 3, 8) / 100, I = d(1 + i);
      if (L === 1) {
        const n = ri(r, 3, 20), ans = n * (n + 1) / (1 + i) ** 2;
        return { kind: 'num', params: { level: L, n, i }, answer: ans, wrongs: [n * n, n * (n + 1), n * n / (1 + i) ** 2, n / (1 + i), (n + 1) * (n + 2) / (1 + i) ** 2],
          q: `Calculate the modified convexity, ${tex(t`P''(i)/P(i)`)}, of ${[8, 11, 18].includes(n) ? 'an' : 'a'} ${n}-year zero-coupon bond at an annual effective rate of ${pc(i, 1)}.`,
          steps: `<p>${tex(t`P(i) = F(1+i)^{-${n}}`)}, so ${tex(t`P''(i) = ${n}(${n + 1})F(1+i)^{-${n + 2}}`)}.</p>${texd(t`C_{\text{mod}} = \frac{P''(i)}{P(i)} = \frac{${n}(${n + 1})}{${I}^2} ${eq(ans)}`)}<p>${n * n} is the Macaulay convexity ${tex('n^2')}, and ${d(n / (1 + i))} is the modified duration.</p>` };
      }
      const t1 = ri(r, 1, 4), t2 = t1 + ri(r, 3, 8), c1 = 1000 * ri(r, 1, 9), c2 = 1000 * ri(r, 1, 9), cf = [[t1, c1], [t2, c2]];
      const a = c1 * (1 + i) ** -t1, b = c2 * (1 + i) ** -t2, w1 = a / (a + b), w2 = b / (a + b);
      const D = dmac(cf, i), Cm = cmac(cf, i), Cd = cmod(cf, i), und = (t1 * t1 * c1 + t2 * t2 * c2) / (c1 + c2);
      const params = { level: L, cf, i };
      const q0 = `An asset pays ${m(c1)} at time ${t1} and ${m(c2)} at time ${t2}. The annual effective rate is ${pc(i, 1)}.`;
      const wLine = `<p>Present-value weights: ${tex(t`w_{${t1}} = ${mt(a)}/${mt(a + b)} ${eq(w1)}`)} and ${tex(t`w_{${t2}} ${eq(w2)}`)}.</p>`;
      const macLine = texd(t`C_{\text{mac}} = \sum t^2 w_t = ${t1 * t1}(${d(w1)}) + ${t2 * t2}(${d(w2)}) ${eq(Cm)}`);
      if (L === 2) return { kind: 'num', params, answer: Cm, wrongs: [D * D, Cd, und, D, Cm / (1 + i) ** 2],
        q: `${q0} Calculate the Macaulay convexity, the present-value-weighted average of ${tex('t^2')}.`,
        steps: `${wLine}${macLine}<p>Squaring the duration (${d(D)}) gives only ${d(D * D)}; the difference ${d(Cm - D * D)} is the spread of the payment times. Weighting by undiscounted amounts gives ${d(und)}.</p>` };
      return { kind: 'num', params, answer: Cd, wrongs: [Cm, Cm / (1 + i) ** 2, (t1 * (t1 + 1) * w1 + t2 * (t2 + 1) * w2), D / (1 + i), (Cm + D) * (1 + i) ** 2],
        q: `${q0} Calculate the modified convexity, ${tex(t`P''(i)/P(i)`)}.`,
        steps: `${wLine}${macLine}${texd(t`D_{\text{mac}} = ${t1}(${d(w1)}) + ${t2}(${d(w2)}) ${eq(D)}`)}${texd(t`C_{\text{mod}} = \frac{C_{\text{mac}} + D_{\text{mac}}}{(1+i)^2} = \frac{${d(Cm)} + ${d(D)}}{${I}^2} ${eq(Cd)}`)}<p>Equivalently ${tex(t`\sum t(t+1)w_t/(1+i)^2`)}. Stopping at ${d(Cm)} gives the Macaulay convexity, and forgetting the ${tex(t`(1+i)^2`)} gives ${d(Cd * (1 + i) ** 2)}.</p>` };
    }),
  },
  {
    id: 'fm-im-t-portfolio', dp: 3, topic: 'duration', name: 'Portfolio duration',
    gen: retry((r, L) => {
      const i = ri(r, 3, 8) / 100;
      if (L === 2) {
        const D1 = ri(r, 10, 40) / 10, D2 = ri(r, 70, 150) / 10, Ds = ri(r, Math.round(D1 * 10) + 10, Math.round(D2 * 10) - 10) / 10, F = 10000 * ri(r, 5, 100);
        const ans = F * (Ds - D1) / (D2 - D1);
        return { kind: 'num', params: { level: L, D1, D2, target: Ds, fund: F }, answer: ans, wrongs: [F * (D2 - Ds) / (D2 - D1), F * Ds / D2, F / 2, F * Ds / (D1 + D2), F * D1 / Ds],
          q: `An insurer will invest ${m(F)} in two bond funds with Macaulay durations ${d(D1)} and ${d(D2)}, valued at the same yield. Its liabilities have Macaulay duration ${d(Ds)}. How much should go into the fund with duration ${d(D2)} so the durations match?`,
          steps: `<p>Let ${tex('w')} be the share in the longer fund: ${tex(t`(1-w)(${d(D1)}) + w(${d(D2)}) = ${d(Ds)}`)}.</p>${texd(t`w = \frac{${d(Ds)} - ${d(D1)}}{${d(D2)} - ${d(D1)}} ${eq((Ds - D1) / (D2 - D1))}, \qquad ${mt(F)}w ${eqm(ans)}`)}<p>${m(F * (D2 - Ds) / (D2 - D1))} is the amount for the shorter fund.</p>` };
      }
      const k = 3, V = Array.from({ length: k }, () => 1000 * ri(r, 1, 20)), D = Array.from({ length: k }, () => ri(r, 10, 150) / 10);
      const tot = sumA(V), Dp = sumA(V.map((v, j) => v * D[j])) / tot, avg = sumA(D) / k, rev = sumA(V.map((v, j) => V[k - 1 - j] * D[j])) / tot;
      const params = { level: L, values: V, durations: D, i };
      const q0 = `A portfolio holds three bonds with market values ${V.map(x => m(x)).join(', ')} and Macaulay durations ${D.map(x => d(x)).join(', ')}, all valued at an annual effective yield of ${pc(i, 1)}.`;
      const line = texd(t`D_{\text{mac}} = \frac{${V.map((v, j) => `${mt(v)}(${d(D[j])})`).join(' + ')}}{${mt(tot)}} ${eq(Dp)}`);
      if (L === 1) return { kind: 'num', params, answer: Dp, wrongs: [avg, rev, Dp / (1 + i), D[V.indexOf(Math.max(...V))], Dp * (1 + i)],
        q: `${q0} Calculate the Macaulay duration of the portfolio.`,
        steps: `<p>Weight each duration by its share of market value:</p>${line}<p>The unweighted average ${d(avg)} ignores how much is in each bond.</p>` };
      const ans = Dp / (1 + i);
      return { kind: 'num', params, answer: ans, wrongs: [Dp, avg / (1 + i), Dp * (1 + i), rev / (1 + i), avg],
        q: `${q0} Calculate the modified duration of the portfolio.`,
        steps: `${line}${texd(t`D_{\text{mod}} = \frac{${d(Dp)}}{${d(1 + i)}} ${eq(ans)}`)}<p>Weighting the modified durations ${tex(t`D_k/(1+i)`)} by value gives the same answer. ${d(Dp)} is the Macaulay duration.</p>` };
    }),
  },
  {
    id: 'fm-im-t-full', dp: 2, topic: 'immunize', name: 'Full and Redington immunization',
    gen: retry((r, L) => {
      const i = ri(r, 3, 8) / 100, I = d(1 + i);
      if (L <= 2) {
        const Lb = 1000 * ri(r, 5, 50), tL = ri(r, 4, 10), a = ri(r, 1, tL - 1), b = ri(r, 1, 6), ta = tL - a, tb = tL + b;
        const A = Lb * b / (a + b) / (1 + i) ** a, B = Lb * a / (a + b) * (1 + i) ** b;
        const params = { level: L, liability: Lb, tL, ta, tb, i, A, B };
        const q0 = `A liability of ${m(Lb)} is due at time ${tL}. At an annual effective rate of ${pc(i, 1)}, it is fully immunized with two zero-coupon bonds maturing at times ${ta} and ${tb}.`;
        const sh = `<p>Here ${tex(t`a = ${a}`)} and ${tex(t`b = ${b}`)}. In time-${tL} dollars the conditions are ${tex(t`A(1+i)^{a} + B(1+i)^{-b} = L`)} and ${tex(t`aA(1+i)^{a} = bB(1+i)^{-b}`)}, so the bond closer to the liability carries the larger share.</p>`;
        if (L === 1) return { kind: 'num', params, answer: A, wrongs: [Lb * b / (a + b), Lb * b / (a + b) * (1 + i) ** a, Lb * a / (a + b) / (1 + i) ** a, A * (1 + i) ** -ta, Lb / 2 / (1 + i) ** a],
          q: `${q0} Calculate the face amount of the bond maturing at time ${ta}.`,
          steps: `${sh}${texd(t`A(${I})^{${a}} = \tfrac{${b}}{${a + b}}(${mt(Lb)}) ${eqm(Lb * b / (a + b))} \;\Rightarrow\; A ${eqm(A)}`)}<p>The bond pays before the liability, so its face is the time-${tL} amount discounted back ${a} year${a > 1 ? 's' : ''}. Forgetting that step leaves ${m(Lb * b / (a + b))}.</p>` };
        return { kind: 'num', params, answer: B, wrongs: [Lb * a / (a + b), Lb * a / (a + b) / (1 + i) ** b, Lb * b / (a + b) * (1 + i) ** b, B * (1 + i) ** -tb, Lb / 2 * (1 + i) ** b],
          q: `${q0} Calculate the face amount of the bond maturing at time ${tb}.`,
          steps: `${sh}${texd(t`B(${I})^{-${b}} = \tfrac{${a}}{${a + b}}(${mt(Lb)}) ${eqm(Lb * a / (a + b))} \;\Rightarrow\; B ${eqm(B)}`)}<p>The bond pays after the liability, so its face is the time-${tL} amount accumulated ${b} more year${b > 1 ? 's' : ''}. Leaving it at ${m(Lb * a / (a + b))} forgets that step.</p>` };
      }
      // L3: Redington with two liabilities and two zero-coupon assets
      const l1 = ri(r, 2, 4), l2 = l1 + ri(r, 2, 5), c1 = 1000 * ri(r, 1, 5), c2 = 1000 * ri(r, 1, 5), a1 = ri(r, 1, l1 - 1), a2 = l2 + ri(r, 1, 4);
      const Lcf = [[l1, c1], [l2, c2]], P = pv(Lcf, i), D = dmac(Lcf, i), w = (D - a1) / (a2 - a1), ans = w * P;
      const p1 = c1 * (1 + i) ** -l1, p2 = c2 * (1 + i) ** -l2, avgT = (l1 + l2) / 2;
      return { kind: 'num', params: { level: L, liabilities: Lcf, assetTimes: [a1, a2], i }, answer: ans,
        wrongs: [(1 - w) * P, ans * (1 + i) ** a2, P / 2, P * (avgT - a1) / (a2 - a1), P * w * (1 + i)],
        q: `Liabilities of ${m(c1)} at time ${l1} and ${m(c2)} at time ${l2} are to be Redington-immunized at an annual effective rate of ${pc(i, 1)} using only zero-coupon bonds maturing at times ${a1} and ${a2}. Calculate the amount (present value) invested in the bond maturing at time ${a2}.`,
        steps: `<p>Liabilities: ${tex(t`P_L = ${mt(p1)} + ${mt(p2)} ${eqm(P)}`)} and</p>${texd(t`D_L = \frac{${l1}(${mt(p1)}) + ${l2}(${mt(p2)})}{${mt(P)}} ${eq(D)}`)}<p>A share ${tex('w')} in the ${a2}-year bond matches durations when ${tex(t`${a1}(1-w) + ${a2}w = ${d(D)}`)}:</p>${texd(t`w = \frac{${d(D)} - ${a1}}{${a2 - a1}} ${eq(w)}, \qquad wP_L ${eqm(ans)}`)}<p>The assets sit on both sides of every liability, so their convexity is larger and the third condition holds. ${m((1 - w) * P)} is the amount for the ${a1}-year bond, and ${m(ans * (1 + i) ** a2)} is the ${a2}-year bond's face, not its price.</p>` };
    }),
  },
  {
    id: 'fm-im-t-match', dp: 2, topic: 'immunize', name: 'Exact cash-flow matching',
    gen: retry((r, L) => {
      const L1 = 500 * ri(r, 1, 8), L2 = 500 * ri(r, 2, 10), cr = ri(r, 3, 10) / 100, y1 = ri(r, 2, 7) / 100, y2 = ri(r, 2, 8) / 100;
      const F2 = L2 / (1 + cr), cpn = cr * F2, Z = L1 - cpn;
      const params = { level: L, L1, L2, coupon: cr, y1, y2, F2, Z };
      const q0 = `An insurer must pay ${m(L1)} at time 1 and ${m(L2)} at time 2. It will match these exactly with a 2-year bond paying annual coupons at ${pc(cr, 1)} and 1-year zero-coupon bonds.`;
      const s2 = `<p>Time 2: the bond's final coupon plus face covers the liability: ${tex(t`F_2(1 + ${d(cr)}) = ${mt(L2)}`)}, so ${tex(t`F_2 ${eqm(F2)}`)}. It also pays a coupon of ${tex(t`${d(cr)}F_2 ${eqm(cpn)}`)} at time 1.</p>`;
      const s1 = `<p>Time 1: the zeros cover the rest, ${tex(t`${mt(L1)} - ${mt(cpn)} ${eqm(Z)}`)}.</p>`;
      if (L === 1) return { kind: 'num', params, answer: F2, wrongs: [L2, L2 * (1 - cr), L2 / (1 + cr) ** 2, L2 / (1 + y2), L2 / (1 + cr) + cpn],
        q: `${q0} Calculate the face amount of the 2-year bond.`,
        steps: `${s2}<p>Buying face ${m(L2)} would overshoot, because the last coupon also arrives at time 2.</p>` };
      if (L === 2) return { kind: 'num', params, answer: Z, wrongs: [L1, L1 - cr * L2, L1 + cpn, Z / (1 + y1), L1 - cpn / (1 + cr)],
        q: `${q0} Calculate the face amount of 1-year zero-coupon bonds needed.`,
        steps: `${s2}${s1}<p>Ignoring the time-1 coupon gives ${m(L1)}; taking the coupon on a face of ${m(L2)} gives ${m(L1 - cr * L2)}.</p>` };
      const v1 = 1 / (1 + y1), v2 = 1 / (1 + y2), price = cr * v2 + (1 + cr) * v2 * v2, cost = Z * v1 + F2 * price;
      return { kind: 'num', params, answer: cost, wrongs: [Z + F2, L1 * v1 + L2 * v2 * v2, Z * v1 + F2, Z * v1 + F2 * v2 * v2, (Z + F2) * price],
        q: `${q0} The 1-year zero-coupon bonds yield ${pc(y1, 1)} and the 2-year bond is priced to yield ${pc(y2, 1)} (both annual effective). Calculate the total cost of the matching portfolio.`,
        steps: `${s2}${s1}<p>Price of the bond per 1 of face: ${tex(t`${d(cr)}(${d(1 + y2)})^{-1} + ${d(1 + cr)}(${d(1 + y2)})^{-2} ${eq(price, 6)}`)}.</p>${texd(t`\text{Cost} = \frac{${mt(Z)}}{${d(1 + y1)}} + ${mt(F2)}(${d(price, 6)}) ${eqm(cost)}`)}<p>Adding face amounts gives ${m(Z + F2)}. Discounting the liabilities directly (${m(L1 * v1 + L2 * v2 * v2)}) misprices the coupon that arrives at time 1, which the bond's yield values at ${pc(y2, 1)}, not ${pc(y1, 1)}.</p>` };
    }),
  },
  {
    id: 'fm-im-t-swaprate', dp: 3, topic: 'swap', name: 'Swap rates',
    gen: retry((r, L) => {
      const n = L === 3 ? ri(r, 3, 5) : ri(r, 3, 4);
      const s = []; let x = ri(r, 15, 45) / 1000; for (let k = 0; k < n; k++) { s.push(x); x = Math.round((x + ri(r, -2, 8) / 1000) * 1000) / 1000; if (x < 0.005) x = 0.005; }
      let P = zeros(s); if (L === 1) P = P.map(p => Math.round(p * 10000) / 10000);
      const Pp = [1, ...P], fw = P.map((p, k) => Pp[k] / p - 1), R = (1 - P[n - 1]) / sumA(P);
      const params = { level: L, spot: s, prices: P };
      const avgF = sumA(fw) / n, spotN = s[n - 1];
      const prL = P.map((p, k) => t`P_{${k + 1}} = ${d(p, 6)}`).join(', \\; ');
      if (L === 1) {
        const ans = 100 * R;
        return { kind: 'num', params, answer: ans, wrongs: [100 * (1 - P[n - 1]) / n, 100 * (P[n - 1] ** (-1 / n) - 1), 100 * (1 - P[n - 1]) / sumA(P.slice(0, -1)), 100 * fw[n - 1], 100 * (1 / P[n - 1] - 1)],
          q: `Zero-coupon bond prices per 1 of face are ${P.map(p => d(p)).join(', ')} for terms of 1 to ${n} years. Calculate the ${n}-year swap rate (level notional, annual settlements), as a percent.`,
          steps: `${texd(t`R = \frac{1 - P_{${n}}}{\sum_{k=1}^{${n}} P_k} = \frac{1 - ${d(P[n - 1])}}{${d(sumA(P))}} ${eq(R, 6)} = ${pt(R)}`)}<p>Dividing by ${n} instead of the sum of prices gives ${pc((1 - P[n - 1]) / n)}, and ${pc(P[n - 1] ** (-1 / n) - 1)} is the ${n}-year spot rate.</p>` };
      }
      if (L === 2) {
        const ans = 100 * R;
        return { kind: 'num', params, answer: ans, wrongs: [100 * sumA(s) / n, 100 * spotN, 100 * (1 - P[n - 1]) / n, 100 * avgF, 100 * fw[n - 1]],
          q: `Annual effective spot rates are ${s.map(z => pc(z, 1)).join(', ')} for terms of 1 to ${n} years. Calculate the ${n}-year swap rate (level notional, annual settlements), as a percent.`,
          steps: `<p>Zero-coupon prices ${tex(t`P_k = (1+s_k)^{-k}`)}:</p>${texd(prL)}${texd(t`R = \frac{1 - P_{${n}}}{\sum P_k} = \frac{${d(1 - P[n - 1], 6)}}{${d(sumA(P), 6)}} ${eq(R, 6)} = ${pt(R)}`)}<p>The swap rate is an average of the forward rates (${fw.map(f => pc(f, 2)).join(', ')}) weighted by ${tex('P_k')}. The plain average of the spot rates is ${pc(sumA(s) / n)}, and the ${n}-year spot rate is ${pc(spotN, 1)}.</p>` };
      }
      const mDef = ri(r, 1, n - 2), Rd = (Pp[mDef] - P[n - 1]) / sumA(P.slice(mDef)), ans = 100 * Rd;
      params.deferral = mDef;
      return { kind: 'num', params, answer: ans, wrongs: [100 * R, 100 * (Pp[mDef] - P[n - 1]) / sumA(P), 100 * (1 - P[n - 1]) / sumA(P.slice(mDef)), 100 * sumA(fw.slice(mDef)) / (n - mDef), 100 * spotN],
        q: `Annual effective spot rates are ${s.map(z => pc(z, 1)).join(', ')} for terms of 1 to ${n} years. A deferred swap makes annual settlements at times ${mDef + 1} through ${n} on a level notional. Calculate its swap rate, as a percent.`,
        steps: `${texd(prL)}<p>Only the forward rates for years ${mDef + 1} to ${n} matter, and ${tex(t`\sum_{k=${mDef + 1}}^{${n}} P_k f_k = P_{${mDef}} - P_{${n}}`)}:</p>${texd(t`R = \frac{P_{${mDef}} - P_{${n}}}{\sum_{k=${mDef + 1}}^{${n}} P_k} = \frac{${d(Pp[mDef], 6)} - ${d(P[n - 1], 6)}}{${d(sumA(P.slice(mDef)), 6)}} ${eq(Rd, 6)} = ${pt(Rd)}`)}<p>The ordinary ${n}-year swap rate is ${pc(R)}; dividing by all ${n} prices gives ${pc((Pp[mDef] - P[n - 1]) / sumA(P))}.</p>` };
    }),
  },
  {
    id: 'fm-im-t-swapvalue', dp: 2, topic: 'swap', name: 'Swap settlements, market value and varying notional',
    gen: retry((r, L) => {
      if (L === 1) {
        const N = 250000 * ri(r, 1, 40), R = ri(r, 20, 60) / 1000; let fl; do { fl = ri(r, 10, 70) / 1000; } while (Math.abs(fl - R) < 0.002);
        const payerPays = R > fl, ans = N * Math.abs(R - fl);
        return { kind: 'num', params: { level: L, N, R, floating: fl }, answer: ans, wrongs: [N * R, N * fl, N * (R + fl), ans / (1 + fl), ans * 2],
          q: `An interest rate swap has notional ${m(N)}. The fixed rate is ${pc(R, 1)}, and this year's floating rate is ${pc(fl, 1)}. Settlements are net. Calculate the amount paid this year by the ${payerPays ? 'fixed-rate payer' : 'floating-rate payer (the fixed-rate receiver)'}.`,
          steps: `<p>The fixed payer owes ${tex(t`${mt(N, 0)}(${d(R)})`)} and is owed ${tex(t`${mt(N, 0)}(${d(fl)})`)}; only the difference is paid:</p>${texd(t`${mt(N, 0)}\,|${d(R)} - ${d(fl)}| ${eqm(ans)}`)}<p>The ${payerPays ? 'fixed rate is higher, so the fixed payer' : 'floating rate is higher, so the floating payer'} pays. ${m(N * R)} and ${m(N * fl)} are the gross legs, which are never exchanged in full.</p>` };
      }
      if (L === 2) {
        const n = ri(r, 2, 3), N = 500000 * ri(r, 1, 10), R = ri(r, 20, 60) / 1000;
        const s = []; let x = R + (r() < 0.5 ? -1 : 1) * ri(r, 4, 20) / 1000; for (let k = 0; k < n; k++) { s.push(Math.max(0.005, x)); x = Math.round((x + ri(r, -1, 5) / 1000) * 1000) / 1000; }
        const P = zeros(s), S = sumA(P), Rn = (1 - P[n - 1]) / S, Vp = N * ((1 - P[n - 1]) - R * S), payerGains = Vp > 0, ans = Math.abs(Vp);
        return { kind: 'num', params: { level: L, N, R, spot: s, Rnew: Rn }, answer: ans, wrongs: [Math.abs(N * (Rn - R)) * n, Math.abs(N * (Rn - R)), Math.abs(N * (s[n - 1] - R)) * S, Math.abs(N * (Rn - R)) * n * P[n - 1], ans * (1 + s[0])],
          q: `An insurer entered an interest rate swap with notional ${m(N)} as the ${payerGains ? 'payer' : 'receiver'} of the fixed rate ${pc(R, 1)}. A settlement has just been made and ${n} annual settlements remain. Current annual effective spot rates are ${s.map(z => pc(z, 1)).join(', ')} for 1 to ${n} years. Calculate the market value of the swap to the insurer.`,
          steps: `<p>New prices: ${tex(P.map((p, k) => t`P'_{${k + 1}} = ${d(p, 6)}`).join(', \\; '))}, sum ${d(S, 6)}. The floating leg is worth ${tex(t`N(1 - P'_{${n}})`)} and the fixed leg ${tex(t`NR\sum P'_k`)}.</p>${texd(t`V_{\text{payer}} = ${mt(N, 0)}\left[(1 - ${d(P[n - 1], 6)}) - ${d(R)}(${d(S, 6)})\right] ${eqm(Vp)}`)}<p>The new ${n}-year swap rate is ${pc(Rn)}, so ${tex(t`V_{\text{payer}} = N(R' - R)\sum P'_k`)} gives the same value. Rates have ${Rn > R ? 'risen' : 'fallen'}, so the ${payerGains ? 'payer' : 'receiver'} (the insurer) gains ${m(ans)}. Multiplying the rate gap by ${n} instead of ${tex(t`\sum P'_k`)} gives ${m(Math.abs(N * (Rn - R)) * n)}.</p>` };
      }
      const n = 3, s = []; let x = ri(r, 15, 40) / 1000; for (let k = 0; k < n; k++) { s.push(x); x = Math.round((x + ri(r, 2, 10) / 1000) * 1000) / 1000; }
      const grow = r() < 0.5, base = ri(r, 1, 3), Nn = grow ? [base, 2 * base, 3 * base] : [3 * base, 2 * base, base];
      const P = zeros(s), Pp = [1, ...P], fw = P.map((p, k) => Pp[k] / p - 1);
      const num = sumA(Nn.map((N, k) => N * (Pp[k] - P[k]))), den = sumA(Nn.map((N, k) => N * P[k])), Rv = num / den, ans = 100 * Rv;
      const lev = (1 - P[n - 1]) / sumA(P);
      return { kind: 'num', params: { level: L, spot: s, notional: Nn }, answer: ans,
        wrongs: [100 * lev, 100 * sumA(Nn.map((N, k) => N * fw[k])) / sumA(Nn), 100 * sumA(Nn.map((N, k) => N * P[k] * s[k])) / den, 100 * s[n - 1], 100 * sumA(fw) / n],
        q: `Annual effective spot rates are ${s.map(z => pc(z, 1)).join(', ')} for 1, 2 and 3 years. A 3-year swap with annual settlements has notional ${Nn.map(v => m(v * 1e6) ).join(', ')} in years 1, 2 and 3. Calculate the swap rate, as a percent.`,
        steps: `${texd(P.map((p, k) => t`P_{${k + 1}} = ${d(p, 6)}`).join(', \\; '))}<p>Forward rates ${tex(t`f_k = P_{k-1}/P_k - 1`)}: ${fw.map(f => pc(f, 3)).join(', ')}. Weight each by ${tex(t`N_k P_k`)}, using ${tex(t`P_k f_k = P_{k-1} - P_k`)}:</p>${texd(t`R = \frac{\sum N_k (P_{k-1} - P_k)}{\sum N_k P_k} = \frac{${d(num, 6)}}{${d(den, 6)}} ${eq(Rv, 6)} = ${pt(Rv)}`)}<p>(Notional in millions.) The level-notional swap rate is ${pc(lev)}; the ${grow ? 'growing' : 'shrinking'} notional puts ${grow ? 'more' : 'less'} weight on the later forward rates.</p>` };
    }),
  },
];
