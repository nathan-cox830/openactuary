// Exam FM · Annuities and Loans problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind ('num'), steps (HTML), params }.
// The site's makeProblem/buildChoices (data/exam-p/generator.js) turn these into five shuffled choices.
// Wrong answers come from real mistakes: immediate vs due, off-by-one terms and deferrals, nominal vs effective
// rates, forgetting interest, and mixing up interest and principal.
// Every template retries its random draw until at least four wrong answers display differently from the
// answer and from each other. Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
const t = String.raw;

/* ---------- small helpers ---------- */
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
/** Decimal for display: rounded to dp places, trailing zeros trimmed, never exponent notation. */
const d = (x, dp = 4) => { let s = Number(x).toFixed(dp); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
/** Money with thousands separators and 2 dp: m() for HTML prose, mt() for TeX (commas wrapped in braces). */
const m = (x, dp = 2) => { const s = Number(x).toFixed(dp); const [a, b] = s.split('.'); return a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); };
const mt = (x, dp = 2) => m(x, dp).replace(/,/g, '{,}');
const tex = s => `<span class="tex">${s}</span>`;
const texd = s => `<div class="texd">${s}</div>`;
/** Rate as a percent string, e.g. 0.055 -> "5.5%" (prose) or "5.5\%" (TeX). */
const pc = x => d(x * 100, 4) + '%';
const pct = x => d(x * 100, 4) + '\\%';
const f6 = x => d(x, 6);

/* ---------- annuity factors ---------- */
const vn = (i, n) => (1 + i) ** -n;
const an = (n, i) => (1 - vn(i, n)) / i;
const sn = (n, i) => ((1 + i) ** n - 1) / i;
const adn = (n, i) => an(n, i) * (1 + i);
const sdn = (n, i) => sn(n, i) * (1 + i);
const Ia = (n, i) => (adn(n, i) - n * vn(i, n)) / i;
const Da = (n, i) => (n - an(n, i)) / i;
const geo = (n, i, g) => Math.abs(i - g) < 1e-12 ? n / (1 + i) : (1 - ((1 + g) / (1 + i)) ** n) / (i - g);
/** TeX symbols: annuity-immediate, due, accumulated (optionally with the rate shown). */
const A = (n, r) => t`a_{\overline{${n}}|${r ? pct(r) : ''}}`;
const AD = (n, r) => t`\ddot{a}_{\overline{${n}}|${r ? pct(r) : ''}}`;
const S = (n, r) => t`s_{\overline{${n}}|${r ? pct(r) : ''}}`;
const SD = (n, r) => t`\ddot{s}_{\overline{${n}}|${r ? pct(r) : ''}}`;

const RATES = [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08];

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
    id: 'fm-an-level-pv', topic: 'annuity', name: 'Present value of level payments',
    gen: retry((r, L) => {
      const i = pick(r, RATES), R = 100 * ri(r, 5, 60), n = ri(r, 5, 25);
      const params = { level: L, i, R, n };
      if (L === 1) {
        const ans = R * an(n, i);
        return { kind: 'num', params, answer: ans, wrongs: [R * adn(n, i), R * sn(n, i), n * R, R * an(n - 1, i), R * an(n + 1, i)],
          q: `A payment of ${m(R)} is made at the end of each year for ${n} years. At an annual effective rate of ${pc(i)}, calculate the present value of the payments.`,
          steps: `<p>Payments at the end of each period form an annuity-immediate:</p>${texd(t`${A(n)} = \frac{1 - ${d(1 + i)}^{-${n}}}{${d(i)}} = ${f6(an(n, i))}`)}${texd(t`PV = ${mt(R)} \times ${f6(an(n, i))} = ${mt(ans)}`)}<p>Treating the payments as made at the start of each year gives ${m(R * adn(n, i))}, and ${m(R * sn(n, i))} is the accumulated value at the last payment, not the present value.</p>` };
      }
      if (L === 2) {
        const ans = R * adn(n, i);
        return { kind: 'num', params, answer: ans, wrongs: [R * an(n, i), R * sdn(n, i), n * R, R * adn(n - 1, i), R * (1 + an(n, i))],
          q: `A tenant pays rent of ${m(R)} at the start of each year for ${n} years. At an annual effective rate of ${pc(i)}, calculate the present value of the rent at the time of the first payment.`,
          steps: `<p>Payments at the start of each period form an annuity-due: one payment now plus an annuity-immediate of the other ${n - 1}.</p>${texd(t`${AD(n)} = 1 + ${A(n - 1)} = 1 + ${f6(an(n - 1, i))} = ${f6(adn(n, i))}`)}${texd(t`PV = ${mt(R)} \times ${f6(adn(n, i))} = ${mt(ans)}`)}<p>Using ${tex(A(n))} values the rent as if paid at year end (${m(R * an(n, i))}). Writing ${tex(t`1 + ${A(n)}`)} counts ${n + 1} payments (${m(R * (1 + an(n, i)))}).</p>` };
      }
      const k = ri(r, 2, 8), first = k + 1;
      Object.assign(params, { k });
      const ans = R * vn(i, k) * an(n, i);
      return { kind: 'num', params, answer: ans, wrongs: [R * vn(i, k + 1) * an(n, i), R * vn(i, k - 1) * an(n, i), R * an(n, i), n * R * vn(i, k), R * an(k + n, i)],
        q: `At an annual effective rate of ${pc(i)}, ${m(R)} is paid at the end of each year for ${n} years, with the first payment at the end of year ${first}. Calculate the present value at time 0.`,
        steps: `<p>The payments at times ${first} to ${k + n} form an annuity-immediate that starts at time ${k}. Value it there, then discount ${k} years:</p>${texd(t`PV = ${mt(R)}\,v^{${k}}\,${A(n)} = ${mt(R)} \times ${f6(vn(i, k))} \times ${f6(an(n, i))} = ${mt(ans)}`)}<p>Check: ${tex(t`${A(k + n)} - ${A(k)} = ${f6(an(k + n, i) - an(k, i))}`)}, the same factor. Discounting ${first} years (the time of the first payment) gives ${m(R * vn(i, k + 1) * an(n, i))}.</p>` };
    }),
  },
  {
    id: 'fm-an-accum', topic: 'annuity', name: 'Accumulated value of deposits',
    gen: retry((r, L) => {
      const i = pick(r, RATES), R = 50 * ri(r, 2, 40), n = ri(r, 5, 30);
      const params = { level: L, i, R, n };
      if (L === 1) {
        const ans = R * sn(n, i);
        return { kind: 'num', params, answer: ans, wrongs: [R * sdn(n, i), R * an(n, i), n * R, R * sn(n - 1, i), R * sn(n + 1, i)],
          q: `A saver deposits ${m(R)} at the end of each year for ${n} years into an account earning ${pc(i)} annual effective. Calculate the balance immediately after the last deposit.`,
          steps: `${texd(t`${S(n)} = \frac{${d(1 + i)}^{${n}} - 1}{${d(i)}} = ${f6(sn(n, i))}`)}${texd(t`AV = ${mt(R)} \times ${f6(sn(n, i))} = ${mt(ans)}`)}<p>The last deposit earns no interest, so this is ${tex(S(n))}, not ${tex(SD(n))} (${m(R * sdn(n, i))}).</p>` };
      }
      if (L === 2) {
        const ans = R * sdn(n, i);
        return { kind: 'num', params, answer: ans, wrongs: [R * sn(n, i), R * sn(n + 1, i), n * R, R * adn(n, i), R * sdn(n - 1, i)],
          q: `A saver deposits ${m(R)} at the start of each year for ${n} years into an account earning ${pc(i)} annual effective. Calculate the balance at the end of year ${n}.`,
          steps: `<p>Each deposit earns interest for one more year than in an annuity-immediate, so use ${tex(SD(n))}:</p>${texd(t`${SD(n)} = ${d(1 + i)} \times ${S(n)} = ${d(1 + i)} \times ${f6(sn(n, i))} = ${f6(sdn(n, i))}`)}${texd(t`AV = ${mt(R)} \times ${f6(sdn(n, i))} = ${mt(ans)}`)}<p>Equivalently ${tex(t`${S(n + 1)} - 1`)}. Forgetting the "-1" gives ${m(R * sn(n + 1, i))}, which counts a deposit at the end of year ${n} that was never made.</p>` };
      }
      const mm = pick(r, [4, 12]), yrs = ri(r, 3, 15), Rm = mm === 12 ? 25 * ri(r, 2, 20) : 100 * ri(r, 2, 15);
      const j = (1 + i) ** (1 / mm) - 1, N = mm * yrs, ans = Rm * sn(N, j);
      const per = mm === 12 ? 'month' : 'quarter';
      Object.assign(params, { m: mm, years: yrs, R: Rm });
      return { kind: 'num', params, answer: ans, wrongs: [Rm * sn(N, i / mm), mm * Rm * sn(yrs, i), Rm * sdn(N, j), N * Rm, Rm * an(N, j)],
        q: `A deposit of ${m(Rm)} is made at the end of every ${per} for ${yrs} years into a fund earning an annual effective rate of ${pc(i)}. Calculate the fund balance immediately after the last deposit.`,
        steps: `<p>Convert the annual effective rate to a ${per}ly rate:</p>${texd(t`j = ${d(1 + i)}^{1/${mm}} - 1 = ${d(j * 100, 6)}\%`)}<p>There are ${tex(t`${mm} \times ${yrs} = ${N}`)} deposits:</p>${texd(t`AV = ${mt(Rm)}\,s_{\overline{${N}}|j} = ${mt(Rm)} \times ${f6(sn(N, j))} = ${mt(ans)}`)}<p>Dividing ${pc(i)} by ${mm} treats it as a nominal rate and gives ${m(Rm * sn(N, i / mm))}; lumping the deposits into ${m(mm * Rm)} at each year end gives ${m(mm * Rm * sn(yrs, i))}.</p>` };
    }),
  },
  {
    id: 'fm-an-perp', topic: 'annuity', name: 'Perpetuities',
    gen: retry((r, L) => {
      const i = pick(r, RATES), R = 50 * ri(r, 2, 60);
      const params = { level: L, i, R };
      if (L === 1) {
        const k = ri(r, 3, 10), ans = R * vn(i, k - 1) / i;
        Object.assign(params, { k });
        return { kind: 'num', params, answer: ans, wrongs: [R * vn(i, k) / i, R * vn(i, k - 2) / i, R / i, R * (1 + i) / i],
          q: `A perpetuity pays ${m(R)} at the end of every year, with the first payment at the end of year ${k}. At an annual effective rate of ${pc(i)}, calculate its present value.`,
          steps: `<p>Value the payments one year before the first payment, at time ${k - 1}, as a perpetuity-immediate: ${tex(t`${mt(R)}/${d(i)} = ${mt(R / i)}`)}. Then discount ${k - 1} years:</p>${texd(t`PV = ${mt(R / i)}\,v^{${k - 1}} = ${mt(R / i)} \times ${f6(vn(i, k - 1))} = ${mt(ans)}`)}<p>Discounting ${k} years, to the date of the first payment, gives ${m(R * vn(i, k) / i)}: one year too many.</p>` };
      }
      if (L === 2) {
        const mm = pick(r, [2, 4, 12]), inom = pick(r, [0.04, 0.05, 0.06, 0.08, 0.09]);
        const ie = (1 + inom / mm) ** mm - 1, ans = R / ie, dd = ie / (1 + ie);
        const freq = { 2: 'semiannually', 4: 'quarterly', 12: 'monthly' }[mm];
        Object.assign(params, { m: mm, inom, i: ie });
        return { kind: 'num', params, answer: ans, wrongs: [R / inom, R / dd, R / (inom / (1 + inom)), R * vn(ie, 1) / ie, R / (inom / mm)],
          q: `A perpetuity pays ${m(R)} at the end of every year. Interest is ${pc(inom)} per year compounded ${freq}. Calculate the present value.`,
          steps: `<p>The payments are annual, so first find the annual effective rate:</p>${texd(t`i = \left(1 + \frac{${d(inom)}}{${mm}}\right)^{${mm}} - 1 = ${d(ie * 100, 6)}\%`)}${texd(t`PV = \frac{${mt(R)}}{${d(ie, 6)}} = ${mt(ans)}`)}<p>Using the nominal rate directly gives ${m(R / inom)}, which overstates the value because the true annual rate is higher than ${pc(inom)}.</p>` };
      }
      const k = ri(r, 2, 5), ans = R / ((1 + i) ** k - 1), dk = 1 - vn(i, k);
      Object.assign(params, { k });
      return { kind: 'num', params, answer: ans, wrongs: [R / (k * i), R / i, R / dk, R / (k * i / (1 + i)), R / (k * i) / (1 + i) ** (k - 1)],
        q: `A perpetuity pays ${m(R)} every ${k} years forever, with the first payment ${k} years from now. At an annual effective rate of ${pc(i)}, calculate its present value.`,
        steps: `<p>Work in ${k}-year periods. The effective ${k}-year rate is</p>${texd(t`j = ${d(1 + i)}^{${k}} - 1 = ${d(((1 + i) ** k - 1) * 100, 6)}\%`)}${texd(t`PV = \frac{${mt(R)}}{j} = ${mt(ans)}`)}<p>Equivalently ${tex(t`\dfrac{${mt(R)}}{i\,${S(k)}}`)}. Using the simple ${k}-year rate ${tex(t`${k} \times ${d(i)}`)} ignores compounding (${m(R / (k * i))}), and ${m(R / dk)} is the version with the first payment today.</p>` };
    }),
  },
  {
    id: 'fm-an-arith', topic: 'varying', name: 'Arithmetic increasing and decreasing annuities',
    gen: retry((r, L) => {
      const i = pick(r, RATES), n = ri(r, 5, 20);
      const params = { level: L, i, n };
      const facts = texd(t`${A(n)} = ${f6(an(n, i))}, \quad ${AD(n)} = ${f6(adn(n, i))}, \quad v^{${n}} = ${f6(vn(i, n))}`);
      if (L === 1) {
        const Q = 10 * ri(r, 1, 30), ans = Q * Ia(n, i);
        Object.assign(params, { Q });
        return { kind: 'num', params, answer: ans, wrongs: [Q * (an(n, i) - n * vn(i, n)) / i, Q * Ia(n, i) * (1 + i), Q * Da(n, i), Q * n * (n + 1) / 2, Q * Ia(n - 1, i)],
          q: `Payments of ${m(Q)}, ${m(2 * Q)}, ${m(3 * Q)}, …, ${m(n * Q)} are made at the end of years 1 through ${n}. At an annual effective rate of ${pc(i)}, calculate the present value.`,
          steps: `<p>This is ${tex(t`${mt(Q)}\,(Ia)_{\overline{${n}}|}`)}.</p>${facts}${texd(t`(Ia)_{\overline{${n}}|} = \frac{${AD(n)} - ${n}v^{${n}}}{i} = \frac{${f6(adn(n, i))} - ${f6(n * vn(i, n))}}{${d(i)}} = ${f6(Ia(n, i))}`)}${texd(t`PV = ${mt(Q)} \times ${f6(Ia(n, i))} = ${mt(ans)}`)}<p>Using ${tex(A(n))} instead of ${tex(AD(n))} in the numerator gives ${m(Q * (an(n, i) - n * vn(i, n)) / i)}.</p>` };
      }
      if (L === 2) {
        const Q = 10 * ri(r, 1, 30), ans = Q * Da(n, i);
        Object.assign(params, { Q });
        return { kind: 'num', params, answer: ans, wrongs: [Q * (n - adn(n, i)) / i, Q * Da(n, i) * (1 + i), Q * Ia(n, i), Q * n * (n + 1) / 2, Q * Da(n - 1, i)],
          q: `Payments of ${m(n * Q)}, ${m((n - 1) * Q)}, …, ${m(Q)} (decreasing by ${m(Q)} each year) are made at the end of years 1 through ${n}. At an annual effective rate of ${pc(i)}, calculate the present value.`,
          steps: `<p>This is ${tex(t`${mt(Q)}\,(Da)_{\overline{${n}}|}`)}.</p>${texd(t`(Da)_{\overline{${n}}|} = \frac{${n} - ${A(n)}}{i} = \frac{${n} - ${f6(an(n, i))}}{${d(i)}} = ${f6(Da(n, i))}`)}${texd(t`PV = ${mt(Q)} \times ${f6(Da(n, i))} = ${mt(ans)}`)}<p>Reversing the order (increasing payments) gives ${m(Q * Ia(n, i))}; the big payments come first here, so the value is higher.</p>` };
      }
      const P = 100 * ri(r, 5, 30), Q = pick(r, [-1, 1]) * 10 * ri(r, 2, 10);
      if (P + (n - 1) * Q <= 0) return { kind: 'num', params, answer: NaN, wrongs: [] };
      const inc = (an(n, i) - n * vn(i, n)) / i, ans = P * an(n, i) + Q * inc;
      Object.assign(params, { P, Q });
      const dir = Q > 0 ? 'increase' : 'decrease';
      return { kind: 'num', params, answer: ans, wrongs: [P * an(n, i) + Q * Ia(n, i), P * an(n, i), n * P + Q * n * (n - 1) / 2, ans * (1 + i), (P + Q * (n - 1) / 2) * an(n, i)],
        q: `An annuity pays ${m(P)} at the end of year 1. Each later annual payment is ${m(Math.abs(Q))} ${Q > 0 ? 'more' : 'less'} than the one before, with ${n} payments in all (the last is ${m(P + (n - 1) * Q)}). At an annual effective rate of ${pc(i)}, calculate the present value.`,
        steps: `<p>Split into a level annuity of ${m(P)} and ${Q > 0 ? 'an increase' : 'a decrease'} of ${m(Math.abs(Q))} that starts with the second payment:</p>${texd(t`PV = P\,${A(n)} + Q\cdot\frac{${A(n)} - ${n}v^{${n}}}{i}`)}${facts}${texd(t`= ${mt(P)}(${f6(an(n, i))}) ${Q > 0 ? '+' : '-'} ${mt(Math.abs(Q))}\cdot\frac{${f6(an(n, i))} - ${f6(n * vn(i, n))}}{${d(i)}} = ${mt(P * an(n, i))} ${Q > 0 ? '+' : '-'} ${mt(Math.abs(Q * inc))} = ${mt(ans)}`)}<p>Using ${tex(t`(Ia)_{\overline{${n}}|}`)} for the ${dir} applies it to the first payment too (${m(P * an(n, i) + Q * Ia(n, i))}). Valuing the average payment as a level annuity (${m((P + Q * (n - 1) / 2) * an(n, i))}) ignores that the timing of the changes matters.</p>` };
    }),
  },
  {
    id: 'fm-an-geom', topic: 'varying', name: 'Geometric growth annuities',
    gen: retry((r, L) => {
      const i = pick(r, [0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08, 0.09]), g = pick(r, [0.01, 0.02, 0.025, 0.03, 0.04].filter(x => x < i - 0.015));
      const R = 100 * ri(r, 5, 50), n = ri(r, 8, 30);
      const params = { level: L, i, g, R, n };
      const ratio = (1 + g) / (1 + i), fac = geo(n, i, g);
      if (L === 1) {
        const ans = R * fac;
        return { kind: 'num', params, answer: ans, wrongs: [ans * (1 + g), R * an(n, i - g), R * an(n, i), R * n / (1 + i), ans * (1 + i)],
          q: `A payment of ${m(R)} is made at the end of year 1, and each later annual payment is ${pc(g)} larger than the one before, for ${n} payments in all. At an annual effective rate of ${pc(i)}, calculate the present value.`,
          steps: `${texd(t`PV = R\cdot\frac{1 - \left(\frac{1+g}{1+i}\right)^{${n}}}{i - g} = ${mt(R)}\cdot\frac{1 - (${d(1 + g)}/${d(1 + i)})^{${n}}}{${d(i - g)}} = ${mt(R)} \times ${f6(fac)} = ${mt(ans)}`)}<p>Discounting level payments at ${tex(t`i - g = ${pct(i - g)}`)} is a tempting shortcut but is not exact (${m(R * an(n, i - g))}). Ignoring growth gives ${m(R * an(n, i))}.</p>` };
      }
      if (L === 2) {
        const ans = R / (i - g);
        return { kind: 'num', params, answer: ans, wrongs: [R * (1 + g) / (i - g), R / i, R / (i + g), ans * (1 + i), R / (i - g) / (1 + i)],
          q: `A stock will pay a dividend of ${m(R)} one year from now. Dividends then grow ${pc(g)} per year forever. At an annual effective rate of ${pc(i)}, calculate the present value of the dividends.`,
          steps: `${texd(t`PV = \frac{R}{i - g} = \frac{${mt(R)}}{${d(i)} - ${d(g)}} = ${mt(ans)}`)}<p>The numerator is the first dividend, ${m(R)}. Growing it once more gives ${m(R * (1 + g) / (i - g))}, and ignoring growth gives ${m(R / i)}.</p>` };
      }
      const ans = R * fac * (1 + i);
      return { kind: 'num', params, answer: ans, wrongs: [R * fac, R * adn(n, i), R * adn(n, i - g), n * R, R * fac * (1 + i) * (1 + g)],
        q: `Rent of ${m(R)} is paid at the start of year 1, and the rent rises ${pc(g)} at the start of each later year, for ${n} payments in all. At an annual effective rate of ${pc(i)}, calculate the present value at the time of the first payment.`,
        steps: `<p>The payments are ${tex(t`${mt(R)}, ${mt(R)}(${d(1 + g)}), \dots`)} at times ${tex(t`0, 1, \dots, ${n - 1}`)}: an annuity-due, so take the annuity-immediate value and multiply by ${tex(t`1+i`)}:</p>${texd(t`PV = ${mt(R)}\cdot\frac{1 - (${d(1 + g)}/${d(1 + i)})^{${n}}}{${d(i - g)}}\cdot ${d(1 + i)} = ${mt(R)} \times ${f6(fac)} \times ${d(1 + i)} = ${mt(ans)}`)}<p>Without the factor ${d(1 + i)} you get ${m(R * fac)}, the value one year before the first payment.</p>` };
    }),
  },
  {
    id: 'fm-an-loan-pmt', topic: 'loan', name: 'Loan payments and total interest',
    gen: retry((r, L) => {
      const i = pick(r, RATES), Lo = 1000 * ri(r, 5, 200), n = ri(r, 5, 30);
      const params = { level: L, i, L: Lo, n };
      const R = Lo / an(n, i);
      if (L === 1) {
        return { kind: 'num', params, answer: R, wrongs: [Lo / adn(n, i), Lo / an(n - 1, i), Lo / n, Lo / sn(n, i), Lo / an(n + 1, i)],
          q: `A loan of ${m(Lo)} is repaid with level payments at the end of each year for ${n} years at an annual effective rate of ${pc(i)}. Calculate the annual payment.`,
          steps: `${texd(t`R = \frac{L}{${A(n)}} = \frac{${mt(Lo)}}{${f6(an(n, i))}} = ${mt(R)}`)}<p>Dividing by ${tex(AD(n))} assumes payments at the start of each year (${m(Lo / adn(n, i))}). Dividing by ${tex(S(n))} gives only the sinking fund deposit (${m(Lo / sn(n, i))}).</p>` };
      }
      if (L === 2) {
        const ans = n * R - Lo;
        return { kind: 'num', params, answer: ans, wrongs: [n * i * Lo, n * R, i * Lo * (n + 1) / 2, n * Lo / adn(n, i) - Lo, (n - 1) * R - Lo],
          q: `A loan of ${m(Lo)} is repaid with level payments at the end of each year for ${n} years at an annual effective rate of ${pc(i)}. Calculate the total interest paid over the life of the loan.`,
          steps: `${texd(t`R = \frac{${mt(Lo)}}{${A(n)}} = \frac{${mt(Lo)}}{${f6(an(n, i))}} = ${mt(R)}`)}<p>Every payment is interest or principal, and the principal parts add to the loan, so</p>${texd(t`\text{Total interest} = nR - L = ${n}(${mt(R)}) - ${mt(Lo)} = ${mt(ans)}`)}<p>${m(n * i * Lo)} charges interest on the full loan every year, but the balance shrinks as principal is repaid.</p>` };
      }
      const inom = pick(r, [0.03, 0.036, 0.042, 0.048, 0.054, 0.06, 0.066, 0.072]), yrs = pick(r, [10, 15, 20, 25, 30]);
      const big = 5000 * ri(r, 20, 100), N = 12 * yrs, jm = inom / 12, Rm = big / an(N, jm);
      Object.assign(params, { L: big, n: yrs, inom });
      return { kind: 'num', params, answer: Rm, wrongs: [big / an(N, (1 + inom) ** (1 / 12) - 1), big / an(yrs, inom) / 12, big / adn(N, jm), big / N, big / an(N - 12, jm)],
        q: `A mortgage of ${m(big)} is repaid with level monthly payments at the end of each month for ${yrs} years. The interest rate is ${pc(inom)} per year compounded monthly. Calculate the monthly payment.`,
        steps: `<p>A nominal rate compounded monthly gives the monthly rate directly: ${tex(t`j = ${d(inom)}/12 = ${d(jm * 100, 6)}\%`)}, over ${tex(t`12 \times ${yrs} = ${N}`)} months.</p>${texd(t`R = \frac{${mt(big)}}{a_{\overline{${N}}|j}} = \frac{${mt(big)}}{${f6(an(N, jm))}} = ${mt(Rm)}`)}<p>Treating ${pc(inom)} as an annual effective rate gives ${m(big / an(N, (1 + inom) ** (1 / 12) - 1))}. Dividing the annual payment by 12 gives ${m(big / an(yrs, inom) / 12)}, which ignores that monthly payments start repaying sooner.</p>` };
    }),
  },
  {
    id: 'fm-an-ob', topic: 'loan', name: 'Outstanding balance and payment split',
    gen: retry((r, L) => {
      const i = pick(r, RATES), Lo = 1000 * ri(r, 10, 200), n = ri(r, 8, 30);
      const R = Lo / an(n, i), B = k => R * an(n - k, i);
      const params = { level: L, i, L: Lo, n };
      const pLine = texd(t`R = \frac{${mt(Lo)}}{${A(n)}} = \frac{${mt(Lo)}}{${f6(an(n, i))}} = ${mt(R)}`);
      const q0 = `A loan of ${m(Lo)} is repaid with ${n} level annual payments at an annual effective rate of ${pc(i)}.`;
      if (L === 1) {
        const k = ri(r, 2, n - 3), ans = B(k);
        Object.assign(params, { k });
        return { kind: 'num', params, answer: ans, wrongs: [B(k - 1), B(k + 1), Lo - k * R, (n - k) * R, Lo * (n - k) / n],
          q: `${q0} Calculate the outstanding balance immediately after the ${k}th payment.`,
          steps: `${pLine}<p>Prospectively, ${n - k} payments remain:</p>${texd(t`B_{${k}} = R\,${A(n - k)} = ${mt(R)} \times ${f6(an(n - k, i))} = ${mt(ans)}`)}<p>Retrospective check: ${tex(t`${mt(Lo)}(${d(1 + i)})^{${k}} - ${mt(R)}\,${S(k)} = ${mt(Lo * (1 + i) ** k - R * sn(k, i))}`)}. Using ${tex(A(n - k + 1))} counts a payment already made (${m(B(k - 1))}).</p>` };
      }
      if (L === 2) {
        const k = ri(r, 2, n - 1), e = n - k + 1, ans = R * (1 - vn(i, e));
        Object.assign(params, { k });
        return { kind: 'num', params, answer: ans, wrongs: [R * vn(i, e), R * (1 - vn(i, e - 1)), R * (1 - vn(i, e + 1)), i * Lo, i * B(k)],
          q: `${q0} Calculate the amount of interest in the ${k}th payment.`,
          steps: `${pLine}<p>When payment ${k} is made, ${e} payments remain including itself, so</p>${texd(t`I_{${k}} = R\left(1 - v^{${e}}\right) = ${mt(R)}(1 - ${f6(vn(i, e))}) = ${mt(ans)}`)}<p>Equivalently ${tex(t`I_{${k}} = i\,B_{${k - 1}} = ${d(i)} \times ${mt(B(k - 1))}`)}. The principal portion is ${m(R * vn(i, e))}.</p>` };
      }
      const a = ri(r, 2, n - 4), b = ri(r, a + 2, n - 1), ans = B(a - 1) - B(b);
      Object.assign(params, { a, b });
      const tot = (b - a + 1) * R;
      return { kind: 'num', params, answer: ans, wrongs: [B(a) - B(b), tot, tot - ans, B(a - 1) - B(b - 1), B(a - 1) - B(b + 1)],
        q: `${q0} Calculate the total amount of principal repaid in payments ${a} through ${b} inclusive.`,
        steps: `${pLine}<p>Principal repaid over a stretch of payments equals the drop in the balance, from just before payment ${a} (that is, after payment ${a - 1}) to just after payment ${b}:</p>${texd(t`B_{${a - 1}} = R\,${A(n - a + 1)} = ${mt(B(a - 1))}, \qquad B_{${b}} = R\,${A(n - b)} = ${mt(B(b))}`)}${texd(t`\text{Principal} = ${mt(B(a - 1))} - ${mt(B(b))} = ${mt(ans)}`)}<p>Starting from ${tex(t`B_{${a}}`)} leaves out payment ${a} (${m(B(a) - B(b))}). The interest in those payments is ${m(tot - ans)}.</p>` };
    }),
  },
  {
    id: 'fm-an-sf', topic: 'sinking', name: 'Sinking funds and refinancing',
    gen: retry((r, L) => {
      const i = pick(r, [0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08]), Lo = 1000 * ri(r, 10, 200), n = ri(r, 5, 25);
      const j = pick(r, [0.03, 0.035, 0.04, 0.045, 0.05].filter(x => x < i));
      const params = { level: L, i, j, L: Lo, n };
      const D = Lo / sn(n, j);
      const q0 = `A borrower takes a ${n}-year loan of ${m(Lo)}. Interest at ${pc(i)} is paid to the lender at the end of each year, and the principal is repaid at the end of ${n} years from a sinking fund. Level deposits are made at the end of each year into the fund, which earns ${pc(j)}.`;
      if (L === 1) {
        return { kind: 'num', params, answer: D, wrongs: [Lo / sdn(n, j), Lo / an(n, j), Lo / n, Lo / sn(n, i), Lo / sn(n - 1, j)],
          q: `${q0} Calculate the annual sinking fund deposit.`,
          steps: `<p>The deposits must accumulate to ${m(Lo)} at the fund rate:</p>${texd(t`D = \frac{${mt(Lo)}}{${S(n, j)}} = \frac{${mt(Lo)}}{${f6(sn(n, j))}} = ${mt(D)}`)}<p>Using the loan rate ${pc(i)} gives ${m(Lo / sn(n, i))}, but the fund only earns ${pc(j)}. Dividing by ${tex(A(n))} gives a loan payment, not a deposit.</p>` };
      }
      if (L === 2) {
        const ans = i * Lo + D;
        return { kind: 'num', params, answer: ans, wrongs: [Lo / an(n, i), i * Lo + Lo / n, D, j * Lo + D, i * Lo + Lo / sdn(n, j)],
          q: `${q0} Calculate the borrower's total annual outlay.`,
          steps: `${texd(t`D = \frac{${mt(Lo)}}{${S(n, j)}} = ${mt(D)}`)}${texd(t`\text{Outlay} = iL + D = ${d(i)}(${mt(Lo)}) + ${mt(D)} = ${mt(i * Lo)} + ${mt(D)} = ${mt(ans)}`)}<p>An amortized loan at ${pc(i)} would cost ${m(Lo / an(n, i))} a year. The sinking fund costs more because the fund earns less than the loan charges.</p>` };
      }
      const nn = ri(r, 15, 30), k = ri(r, 4, nn - 6), i2 = i - pick(r, [0.01, 0.015, 0.02]), rem = nn - k;
      const R0 = Lo / an(nn, i), Bk = R0 * an(rem, i), R1 = Bk / an(rem, i2);
      Object.assign(params, { n: nn, k, i2 });
      return { kind: 'num', params, answer: R1, wrongs: [R0 * an(rem + 1, i) / an(rem, i2), R0, Lo / an(nn, i2), Bk / rem, R0 * an(rem - 1, i) / an(rem, i2)],
        q: `A ${nn}-year loan of ${m(Lo)} at an annual effective rate of ${pc(i)} is repaid with level annual payments. Immediately after the ${k}th payment, the borrower refinances the outstanding balance with a new ${rem}-year loan at ${pc(i2)}, with no fees. Calculate the new annual payment.`,
        steps: `${texd(t`R = \frac{${mt(Lo)}}{${A(nn, i)}} = ${mt(R0)}`)}<p>Balance after ${k} payments, at the <i>old</i> rate with ${rem} payments left:</p>${texd(t`B_{${k}} = ${mt(R0)}\,${A(rem, i)} = ${mt(R0)} \times ${f6(an(rem, i))} = ${mt(Bk)}`)}<p>New payment at the <i>new</i> rate:</p>${texd(t`R' = \frac{${mt(Bk)}}{${A(rem, i2)}} = \frac{${mt(Bk)}}{${f6(an(rem, i2))}} = ${mt(R1)}`)}<p>Refinancing the original ${m(Lo)} over ${nn} years at ${pc(i2)} gives ${m(Lo / an(nn, i2))}, which ignores the ${k} years already paid at ${pc(i)}.</p>` };
    }),
  },
];
