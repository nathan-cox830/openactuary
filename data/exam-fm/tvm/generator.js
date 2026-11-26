// Exam FM · Interest and the Time Value of Money problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind, steps (HTML), params }.
// The site's buildChoices (data/exam-p/generator.js) turns these into five shuffled choices.
// Every answer here is kind 'num': money amounts rounded to cents, rates given as percents to 2 decimals,
// times in years to 2 decimals. Answers and mistakes are rounded the same way, so choices display cleanly.
// Every template retries its random draw until at least four wrong answers display differently from the
// answer and from each other, so the common-mistake choices are always shown.
// Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
const t = String.raw;

/* ---------- small helpers ---------- */
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
/** Decimal for display: rounded to dp places, trailing zeros trimmed, never exponent notation. */
const d = (x, dp = 4) => { let s = Number(x).toFixed(dp); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
/** Money with thousands separators and exactly 2 decimals: m() for HTML prose, mt() for TeX. */
const m = x => { const [a, b] = Number(x).toFixed(2).split('.'); return a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + b; };
const mt = x => m(x).replace(/,/g, '{,}');
/** Whole amounts (inputs) with separators. */
const w = x => Math.round(x).toLocaleString('en-US');
const wt = x => w(x).replace(/,/g, '{,}');
const tex = s => `<span class="tex">${s}</span>`;
const texd = s => `<div class="texd">${s}</div>`;
/** A rate (decimal) shown as a percent: pc for prose, pt for TeX. */
const pc = (x, dp = 2) => d(x * 100, dp) + '%';
const pt = (x, dp = 2) => d(x * 100, dp) + t`\%`;
/** Round to cents / to a 2-dp percent. */
const r2 = x => Math.round(x * 100) / 100;
const P2 = x => r2(x * 100);
const conv = { 2: 'semiannually', 4: 'quarterly', 12: 'monthly' };

/* Mirror of buildChoices' display rules, so a draw can be rejected when fewer than 4 mistakes would show. */
const fmtNum = v => Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(+v.toPrecision(Math.abs(v) >= 1 ? 6 : 4));
function distinctWrongs(g) {
  const a = g.answer;
  const ok = v => isFinite(v) && (a >= 0 ? v >= 0 : v < 0) && Math.abs(v) > 1e-9;
  const seen = new Set([fmtNum(a)]);
  g.wrongs.forEach(v => { if (ok(v)) seen.add(fmtNum(v)); });
  return seen.size - 1;
}
/** Run a draw up to 60 times until it has a finite answer and 4 distinct displayable mistakes. */
const retry = once => (r, L) => { let g; for (let i = 0; i < 60; i++) { g = once(r, L); if (isFinite(g.answer) && distinctWrongs(g) >= 4) return g; } return g; };
/** Final packaging: everything is 'num', rounded by the given rounder. */
const out = (rnd, params, ans, wrongs, q, steps) => ({ kind: 'num', params, answer: rnd(ans), wrongs: wrongs.map(rnd), q, steps });

/* ---------- templates ---------- */
export const TEMPLATES = [
  {
    id: 'fm-tv-simple-compound', topic: 'interest', name: 'Simple and compound accumulation',
    gen: retry((r, L) => {
      const P = pick(r, [1000, 2000, 2500, 4000, 5000, 8000, 10000]), i = pick(r, [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06, 0.07, 0.08]);
      const params = { level: L, P, i };
      if (L === 1) {
        const n = ri(r, 2, 10), ans = P * (1 + i * n);
        Object.assign(params, { n });
        return out(r2, params, ans, [P * (1 + i) ** n, P * i * n, P * (1 + i * (n - 1)), P * (1 + i * (n + 1)), P / (1 - i * n)],
          `A policyholder deposits ${w(P)} with an insurer that credits ${pc(i)} <b>simple</b> interest per year. Calculate the balance after ${n} years.`,
          `<p>Simple interest pays ${pc(i)} of the original deposit each year:</p>${texd(t`${wt(P)}(1 + ${d(i)} \times ${n}) = ${mt(ans)}`)}<p>Compounding instead gives ${m(P * (1 + i) ** n)}, and ${m(P * i * n)} is the interest alone without the deposit.</p>`);
      }
      if (L === 2) {
        const n = ri(r, 2, 9) + pick(r, [0.25, 0.5, 0.75]), ans = P * (1 + i) ** n, k = Math.floor(n), f = n - k;
        Object.assign(params, { n });
        return out(r2, params, ans, [P * (1 + i * n), P * (1 + i) ** k, P * (1 + i) ** (k + 1), P * (1 + i) ** k * (1 + i * f), P * ((1 + i) ** n - 1)],
          `A fund earns compound interest at an annual effective rate of ${pc(i)}. Calculate the value after ${d(n)} years of ${w(P)} invested now.`,
          `<p>Under compound interest the exponent can be fractional:</p>${texd(t`${wt(P)}(${d(1 + i)})^{${d(n)}} = ${mt(ans)}`)}<p>Simple interest gives ${m(P * (1 + i * n))}. Using whole years only (${m(P * (1 + i) ** k)}) drops the partial year, and ${m(P * (1 + i) ** k * (1 + i * f))} uses simple interest for the fraction, which is not the Exam FM default.</p>`);
      }
      const n = ri(r, 3, 10), ans = P * (1 + i) ** (n - 1) * i;
      Object.assign(params, { n });
      return out(r2, params, ans, [P * i, P * (1 + i) ** n * i, P * ((1 + i) ** n - 1), P * ((1 + i) ** n - 1) / n, P * (1 + i) ** (n - 2) * i],
        `${w(P)} is invested at an annual effective rate of ${pc(i)}. Calculate the amount of interest earned during year ${n} (from time ${n - 1} to time ${n}).`,
        `<p>Interest in year ${n} is the year's rate times the balance at the <i>start</i> of the year:</p>${texd(t`I_{${n}} = A(${n}) - A(${n - 1}) = ${wt(P)}(1+${d(i)})^{${n - 1}}(${d(i)}) = ${mt(ans)}`)}<p>${m(P * i)} is the simple-interest amount, ${m(P * (1 + i) ** n * i)} uses the end-of-year balance, and ${m(P * ((1 + i) ** n - 1))} is the interest over all ${n} years.</p>`);
    }),
  },
  {
    id: 'fm-tv-pv-discount', topic: 'interest', name: 'Effective discount and present value',
    gen: retry((r, L) => {
      if (L === 1) {
        const i = pick(r, [0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.12]), ans = i / (1 + i);
        return out(P2, { level: L, i }, ans, [i, i / (1 - i), i * (1 - i), Math.log(1 + i), 1 / (1 + i)],
          `The annual effective rate of interest is ${pc(i)}. Calculate the annual effective rate of discount, as a percent to 2 decimals.`,
          `${texd(t`d = \frac{i}{1+i} = \frac{${d(i)}}{${d(1 + i)}} \approx ${pt(ans)}`)}<p>${pc(i / (1 - i))} uses ${tex(t`i/(1-i)`)}, the conversion run backwards. ${pc(Math.log(1 + i))} is the force of interest, and ${pc(1 / (1 + i))} is ${tex('v')} itself.</p>`);
      }
      if (L === 2) {
        const dd = pick(r, [0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1]), ans = dd / (1 - dd);
        return out(P2, { level: L, d: dd }, ans, [dd, dd / (1 + dd), dd * (1 + dd), -Math.log(1 - dd), 1 / (1 - dd) - 1 + dd],
          `The annual effective rate of discount is ${pc(dd)}. Calculate the annual effective rate of interest, as a percent to 2 decimals.`,
          `${texd(t`i = \frac{d}{1-d} = \frac{${d(dd)}}{${d(1 - dd)}} \approx ${pt(ans)}`)}<p>${pc(dd / (1 + dd))} treats ${pc(dd)} as an interest rate and converts it to discount, the wrong direction. ${pc(-Math.log(1 - dd))} is the force of interest.</p>`);
      }
      const K = pick(r, [5000, 10000, 20000, 25000, 50000]), dd = pick(r, [0.03, 0.04, 0.05, 0.06, 0.07, 0.08]), n = ri(r, 2, 10), ans = K * (1 - dd) ** n;
      return out(r2, { level: L, K, d: dd, n }, ans, [K / (1 + dd) ** n, K * (1 - n * dd), K * (1 - dd) ** (n - 1), K * Math.exp(-dd * n), K / (1 + n * dd)],
        `A structured settlement pays ${w(K)} in ${n} years. Using an annual effective rate of <b>discount</b> of ${pc(dd)}, calculate its present value.`,
        `<p>Each year of discounting multiplies by ${tex(t`v = 1 - d = ${d(1 - dd)}`)}:</p>${texd(t`${wt(K)}(${d(1 - dd)})^{${n}} = ${mt(ans)}`)}<p>Treating ${pc(dd)} as an interest rate gives ${m(K / (1 + dd) ** n)}; ${m(K * (1 - n * dd))} applies simple discount.</p>`);
    }),
  },
  {
    id: 'fm-tv-nominal-conv', topic: 'interest', name: 'Nominal rate conversions',
    gen: retry((r, L) => {
      if (L === 1) {
        const mm = pick(r, [2, 4, 12]), j = pick(r, { 2: [0.05, 0.06, 0.08, 0.1], 4: [0.04, 0.06, 0.08, 0.1, 0.12], 12: [0.06, 0.09, 0.12] }[mm]), ans = (1 + j / mm) ** mm - 1;
        return out(P2, { level: L, m: mm, j }, ans, [j, j / mm, Math.exp(j) - 1, (1 - j / mm) ** -mm - 1, mm * ((1 + j) ** (1 / mm) - 1)],
          `A savings product credits interest at a nominal rate of ${pc(j)} convertible ${conv[mm]}. Calculate the annual effective rate of interest, as a percent to 2 decimals.`,
          `<p>Each ${tex(`1/${mm}`)} of a year earns ${tex(t`${pt(j)}/${mm} = ${pt(j / mm, 4)}`)}; compound it ${mm} times:</p>${texd(t`i = \left(1 + \frac{${d(j)}}{${mm}}\right)^{${mm}} - 1 \approx ${pt(ans)}`)}<p>${pc(j / mm, 4)} is only the per-period rate. ${pc((1 - j / mm) ** -mm - 1)} treats ${pc(j)} as a nominal <i>discount</i> rate, and ${pc(Math.exp(j) - 1)} treats it as a force of interest.</p>`);
      }
      if (L === 2) {
        const mm = pick(r, [2, 4, 12]), i = pick(r, [0.04, 0.05, 0.06, 0.08, 0.1, 0.12]), ans = mm * ((1 + i) ** (1 / mm) - 1);
        return out(P2, { level: L, m: mm, i }, ans, [i, (1 + i / mm) ** mm - 1, mm * (1 - (1 + i) ** (-1 / mm)), Math.log(1 + i), i / (1 + i)],
          `The annual effective rate of interest is ${pc(i)}. Calculate the equivalent nominal rate of interest convertible ${conv[mm]}, as a percent to 2 decimals.`,
          `${texd(t`\left(1 + \frac{i^{(${mm})}}{${mm}}\right)^{${mm}} = ${d(1 + i)} \;\Rightarrow\; i^{(${mm})} = ${mm}\left(${d(1 + i)}^{1/${mm}} - 1\right) \approx ${pt(ans)}`)}<p>${pc((1 + i / mm) ** mm - 1)} runs the conversion the wrong way (treating ${pc(i)} as the nominal rate). ${pc(mm * (1 - (1 + i) ** (-1 / mm)))} is the nominal <i>discount</i> rate ${tex(t`d^{(${mm})}`)}, and ${pc(Math.log(1 + i))} is ${tex(t`\delta`)}.</p>`);
      }
      let mm, p;
      do { mm = pick(r, [2, 4, 12]); p = pick(r, [2, 4, 12]); } while (mm === p);
      const j = pick(r, [0.06, 0.08, 0.09, 0.1, 0.12]), g = 1 + j / mm, ans = p * (1 - g ** (-mm / p));
      return out(P2, { level: L, m: mm, p, j }, ans, [j, mm * (1 - 1 / g), p * (g ** (mm / p) - 1), 1 - g ** -mm, p * (1 - (1 - j / mm) ** (mm / p))],
        `A loan is quoted at a nominal rate of interest of ${pc(j)} convertible ${conv[mm]}. Calculate the equivalent nominal rate of <b>discount</b> convertible ${conv[p]}, as a percent to 2 decimals.`,
        `<p>Write one year of growth both ways:</p>${texd(t`\left(1 - \frac{d^{(${p})}}{${p}}\right)^{-${p}} = \left(1 + \frac{${d(j)}}{${mm}}\right)^{${mm}}`)}${texd(t`d^{(${p})} = ${p}\left[1 - \left(1 + \frac{${d(j)}}{${mm}}\right)^{-${mm}/${p}}\right] \approx ${pt(ans)}`)}<p>${pc(p * (g ** (mm / p) - 1))} is the nominal <i>interest</i> rate ${tex(t`i^{(${p})}`)}, ${pc(mm * (1 - 1 / g))} is ${tex(t`d^{(${mm})}`)} (right type, wrong frequency), and ${pc(1 - g ** -mm)} is the annual effective discount rate.</p>`);
    }),
  },
  {
    id: 'fm-tv-effective-rate', topic: 'interest', name: 'Effective rates from an accumulation function',
    gen: retry((r, L) => {
      if (L === 1) {
        const c = pick(r, [0.04, 0.05, 0.06, 0.08, 0.1]), n = ri(r, 3, 10), ans = c / (1 + c * (n - 1));
        return out(P2, { level: L, c, n }, ans, [c, c / (1 + c * n), (1 + c * n) ** (1 / n) - 1, c / (1 + c * (n + 1)), c * n / (1 + c * n)],
          `A fund grows with accumulation function ${tex(t`a(t) = 1 + ${d(c)}t`)}. Calculate the effective rate of interest in year ${n}, as a percent to 2 decimals.`,
          `${texd(t`i_{${n}} = \frac{a(${n}) - a(${n - 1})}{a(${n - 1})} = \frac{${d(c)}}{${d(1 + c * (n - 1))}} \approx ${pt(ans)}`)}<p>Under simple interest the effective rate falls each year. Dividing by ${tex(t`a(${n})`)} gives ${pc(c / (1 + c * n))}, the effective <i>discount</i> rate, and ${pc(c)} is the rate only in year 1.</p>`);
      }
      if (L === 2) {
        const P = pick(r, [1000, 2000, 5000]), k = P * pick(r, [0.01, 0.02, 0.03, 0.04]), n = ri(r, 2, 5);
        const A = x => P + k * x * x, D = A(n) - A(n - 1), ans = D / A(n - 1);
        return out(P2, { level: L, P, k, n }, ans, [D / A(n), D / P, (A(n) / P) ** (1 / n) - 1, (A(n) - P) / P, k * n * n / A(n - 1)],
          `A fund's balance at time ${tex('t')} (years) is ${tex(t`A(t) = ${wt(P)} + ${d(k)}t^2`)}. Calculate the effective rate of interest during year ${n}, as a percent to 2 decimals.`,
          `<p>${tex(t`A(${n - 1}) = ${mt(A(n - 1))}`)} and ${tex(t`A(${n}) = ${mt(A(n))}`)}, so year ${n} earns ${m(D)}.</p>${texd(t`i_{${n}} = \frac{${mt(D)}}{${mt(A(n - 1))}} \approx ${pt(ans)}`)}<p>Divide by the balance at the start of the year. Using the ending balance gives ${pc(D / A(n))}; using the original ${w(P)} gives ${pc(D / P)}.</p>`);
      }
      const b = pick(r, [0.01, 0.02, 0.03]), c = pick(r, [0.002, 0.004, 0.005]), n = ri(r, 2, 6);
      const a = x => 1 + b * x + c * x * x, D = a(n) - a(n - 1), ans = D / a(n);
      return out(P2, { level: L, b, c, n }, ans, [D / a(n - 1), D, (a(n) - 1) / n, a(n) - 1, 1 - a(n - 1) / a(n + 1)],
        `A fund's accumulation function is ${tex(t`a(t) = 1 + ${d(b)}t + ${d(c)}t^2`)}. Calculate the effective rate of <b>discount</b> during year ${n}, as a percent to 2 decimals.`,
        `<p>${tex(t`a(${n - 1}) = ${d(a(n - 1), 6)}`)} and ${tex(t`a(${n}) = ${d(a(n), 6)}`)}. Discount measures the year's growth against the <i>ending</i> value:</p>${texd(t`d_{${n}} = \frac{a(${n}) - a(${n - 1})}{a(${n})} = \frac{${d(D, 6)}}{${d(a(n), 6)}} \approx ${pt(ans)}`)}<p>Dividing by ${tex(t`a(${n - 1})`)} gives the effective <i>interest</i> rate, ${pc(D / a(n - 1))}.</p>`);
    }),
  },
  {
    id: 'fm-tv-force-const', topic: 'force', name: 'Constant force of interest',
    gen: retry((r, L) => {
      if (L === 1) {
        const i = pick(r, [0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.12]), ans = Math.log(1 + i);
        return out(P2, { level: L, i }, ans, [i, Math.exp(i) - 1, i / (1 + i), 1 - Math.exp(-i), -Math.log(1 - i)],
          `The annual effective rate of interest is ${pc(i)}. Calculate the force of interest, as a percent to 2 decimals.`,
          `${texd(t`\delta = \ln(1 + i) = \ln ${d(1 + i)} \approx ${pt(ans)}`)}<p>${pc(Math.exp(i) - 1)} is ${tex(t`e^{${d(i)}} - 1`)}, the conversion run the other way. The force always sits between ${tex('d')} (${pc(i / (1 + i))}) and ${tex('i')}.</p>`);
      }
      if (L === 2) {
        const P = pick(r, [1000, 2500, 5000, 10000]), dl = pick(r, [0.03, 0.04, 0.05, 0.06, 0.08]), n = ri(r, 3, 15), ans = P * Math.exp(dl * n);
        return out(r2, { level: L, P, delta: dl, n }, ans, [P * (1 + dl) ** n, P * (1 + dl * n), P * Math.exp(dl * (n - 1)), P * (1 - dl) ** -n, P * Math.exp(-dl * n)],
          `An insurer invests ${w(P)} in a fund credited with a constant force of interest of ${pc(dl)}. Calculate the fund value after ${n} years.`,
          `${texd(t`${wt(P)}\,e^{${d(dl)} \times ${n}} = ${wt(P)}\,e^{${d(dl * n)}} = ${mt(ans)}`)}<p>Treating ${pc(dl)} as an annual effective rate gives ${m(P * (1 + dl) ** n)}, slightly less, because continuous compounding grows a little faster.</p>`);
      }
      const mm = pick(r, [2, 4, 12]), j = pick(r, [0.04, 0.06, 0.08, 0.1, 0.12]), ans = mm * Math.log(1 + j / mm);
      return out(P2, { level: L, m: mm, j }, ans, [j, Math.log(1 + j), (1 + j / mm) ** mm - 1, mm * (1 - 1 / (1 + j / mm)), mm * Math.log(1 + j)],
        `Fund X credits a nominal rate of ${pc(j)} convertible ${conv[mm]}. Fund Y credits a constant force of interest ${tex(t`\delta`)}. Equal deposits always have equal values. Calculate ${tex(t`\delta`)}, as a percent to 2 decimals.`,
        `<p>Match one year of growth: ${tex(t`e^{\delta} = \left(1 + \frac{${d(j)}}{${mm}}\right)^{${mm}}`)}, so</p>${texd(t`\delta = ${mm}\ln\left(1 + \frac{${d(j)}}{${mm}}\right) \approx ${pt(ans)}`)}<p>${pc(Math.log(1 + j))} takes the log of ${tex(t`1 + ${d(j)}`)}, treating the nominal rate as effective; ${pc((1 + j / mm) ** mm - 1)} is the annual effective rate, not the force.</p>`);
    }),
  },
  {
    id: 'fm-tv-force-vary', topic: 'force', name: 'Varying force of interest',
    gen: retry((r, L) => {
      if (L === 1) {
        const P = pick(r, [1000, 2000, 5000]);
        let c, n; do { c = pick(r, [0.005, 0.01, 0.02, 0.03]); n = ri(r, 2, 8); } while (c * n * n / 2 > 0.5);
        const I = c * n * n / 2, ans = P * Math.exp(I);
        return out(r2, { level: L, P, c, n }, ans, [P * Math.exp(c * n * n), P * (1 + I), P * Math.exp(c * n), P * Math.exp(-I), P * (1 + c * n) ** n],
          `The force of interest is ${tex(t`\delta_t = ${d(c)}t`)}. Calculate the value at time ${n} of ${w(P)} invested at time 0.`,
          `${texd(t`\int_0^{${n}} ${d(c)}t\,dt = ${d(c)}\cdot\frac{${n}^2}{2} = ${d(I)}`)}${texd(t`${wt(P)}\,e^{${d(I)}} = ${mt(ans)}`)}<p>Using the final force ${tex(t`\delta_{${n}} = ${d(c * n)}`)} for all ${n} years gives ${m(P * Math.exp(c * n * n))}: that is the missing ${tex(t`\tfrac12`)} from the integral.</p>`);
      }
      if (L === 2) {
        const K = pick(r, [1000, 5000, 10000]), k = pick(r, [1, 2, 3]), c = pick(r, [10, 20, 25, 40, 50]) * k, n = pick(r, [2, 4, 5, 8, 10]);
        const ratio = (c + n) / c, ans = K * ratio ** -k;
        return out(r2, { level: L, K, k, c, n }, ans, [K / ratio, K * ratio ** k, K * Math.exp(-k * n / (c + n)), K * Math.exp(-k * n / c), K * (1 - k * n / c)],
          `The force of interest is ${tex(t`\delta_t = \dfrac{${k}}{${c} + t}`)}. Calculate the present value at time 0 of ${w(K)} payable at time ${n}.`,
          `${texd(t`\int_0^{${n}} \frac{${k}}{${c}+t}\,dt = ${k}\ln\frac{${c + n}}{${c}} \;\Rightarrow\; a(${n}) = \left(\frac{${c + n}}{${c}}\right)^{${k}}`)}${texd(t`\text{PV} = ${wt(K)}\left(\frac{${c}}{${c + n}}\right)^{${k}} = ${mt(ans)}`)}<p>${m(K * ratio ** k)} accumulates instead of discounting. ${m(K * Math.exp(-k * n / (c + n)))} multiplies the final force by ${n} as if it were constant.</p>`);
      }
      const P = pick(r, [1000, 5000, 10000]), b = pick(r, [5, 10, 20]), a = b * pick(r, [8, 10, 15, 20]), n = ri(r, 3, 8);
      const L1 = Math.log((a + b * n) / a), I = n / b - (a / b / b) * L1, ans = P * Math.exp(I);
      return out(r2, { level: L, P, a, b, n }, ans, [P * Math.exp(n * n / (a + b * n)), P * Math.exp(n / b), P * Math.exp(-I), P * (1 + I), P * Math.exp(n / b - (a / b) * L1)],
        `The force of interest is ${tex(t`\delta_t = \dfrac{t}{${a} + ${b}t}`)}. Calculate the value at time ${n} of ${w(P)} invested at time 0.`,
        `<p>Split the fraction: ${tex(t`\dfrac{t}{${a}+${b}t} = \dfrac{1}{${b}} - \dfrac{${d(a / b)}}{${a}+${b}t}`)}. Then</p>${texd(t`\int_0^{${n}} \delta_t\,dt = \frac{${n}}{${b}} - \frac{${a}}{${b}^2}\ln\frac{${a + b * n}}{${a}} \approx ${d(I, 6)}`)}${texd(t`${wt(P)}\,e^{${d(I, 6)}} = ${mt(ans)}`)}<p>Using the final force ${tex(t`\delta_{${n}} = ${n}/${a + b * n}`)} for all ${n} years gives ${m(P * Math.exp(n * n / (a + b * n)))}; dropping the log term gives ${m(P * Math.exp(n / b))}.</p>`);
    }),
  },
  {
    id: 'fm-tv-solve', topic: 'equiv', name: 'Solving for time or rate',
    gen: retry((r, L) => {
      if (L === 1) {
        const M = pick(r, [1.5, 2, 2.5, 3, 4]), i = pick(r, [0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1]), ans = Math.log(M) / Math.log(1 + i);
        return out(r2, { level: L, M, i }, ans, [(M - 1) / i, Math.log(M) / i, Math.log(M) / -Math.log(1 - i), 0.72 / i * Math.log2(M), Math.log(M) / Math.log(1 + i) * (1 + i)],
          `At an annual effective rate of ${pc(i)}, how many years does it take an investment to grow to ${d(M)} times its original value? Give the answer to 2 decimals.`,
          `${texd(t`(1 + ${d(i)})^n = ${d(M)} \;\Rightarrow\; n = \frac{\ln ${d(M)}}{\ln ${d(1 + i)}} \approx ${d(ans, 2)}`)}<p>Simple interest would take ${d((M - 1) / i, 2)} years, and dividing by ${d(i)} instead of ${tex(t`\ln ${d(1 + i)}`)} gives ${d(Math.log(M) / i, 2)}. The rule of 72 estimates ${d(0.72 / i * Math.log2(M), 2)}, a quick check rather than an exact answer.</p>`);
      }
      if (L === 2) {
        const P = pick(r, [1000, 2000, 4000, 5000]), i0 = pick(r, [0.035, 0.045, 0.05, 0.055, 0.065, 0.07]), n = ri(r, 3, 12);
        const K = Math.round(P * (1 + i0) ** n), R = K / P, ans = R ** (1 / n) - 1;
        return out(P2, { level: L, P, K, n }, ans, [(R - 1) / n, Math.log(R) / n, R ** (1 / (n - 1)) - 1, 1 - R ** (-1 / n), R - 1],
          `${w(P)} grows to ${w(K)} in ${n} years under compound interest. Calculate the annual effective rate of interest, as a percent to 2 decimals.`,
          `${texd(t`(1+i)^{${n}} = \frac{${wt(K)}}{${wt(P)}} \;\Rightarrow\; i = \left(${d(R, 6)}\right)^{1/${n}} - 1 \approx ${pt(ans)}`)}<p>${pc((R - 1) / n)} spreads the growth evenly as simple interest, ${pc(Math.log(R) / n)} is the force of interest, and ${pc(1 - R ** (-1 / n))} is the effective discount rate.</p>`);
      }
      const A = pick(r, [1000, 2000, 3000]), B = pick(r, [1000, 1500, 2000, 2500]), mm = pick(r, [1, 2, 3, 5]), i0 = pick(r, [0.04, 0.05, 0.06, 0.07, 0.08]);
      const x0 = (1 + i0) ** mm, C = Math.round((A * x0 * x0 + B * x0) / 10) * 10;
      const x = (-B + Math.sqrt(B * B + 4 * A * C)) / (2 * A), ans = x ** (1 / mm) - 1;
      const S = A + B;
      return out(P2, { level: L, A, B, m: mm, C }, ans, [x - 1, (C / S) ** (1 / (2 * mm)) - 1, (C / S) ** (1 / mm) - 1, (C - S) / (A * 2 * mm + B * mm), (C / S) ** (1 / (1.5 * mm)) - 1],
        `A deposit of ${w(A)} is made now and ${w(B)} at time ${mm}. The balance at time ${2 * mm} is ${w(C)}. Calculate the annual effective rate of interest, as a percent to 2 decimals.`,
        `<p>Equation of value at time ${2 * mm}, with ${tex(t`x = (1+i)^{${mm}}`)}:</p>${texd(t`${wt(A)}x^2 + ${wt(B)}x = ${wt(C)}`)}${texd(t`x = \frac{-${wt(B)} + \sqrt{${wt(B)}^2 + 4(${wt(A)})(${wt(C)})}}{2(${wt(A)})} \approx ${d(x, 6)}`)}${mm === 1 ? '' : texd(t`i = ${d(x, 6)}^{1/${mm}} - 1`)}<p>So ${tex(t`i \approx ${pt(ans)}`)}.${mm === 1 ? '' : ` ${pc(x - 1)} stops at ${tex('x - 1')}, which is a ${mm}-year rate.`} Pretending all ${w(S)} was deposited at time 0 gives ${pc((C / S) ** (1 / (2 * mm)) - 1)}.</p>`);
    }),
  },
  {
    id: 'fm-tv-equiv-value', topic: 'equiv', name: 'Equations of value and equivalent payments',
    gen: retry((r, L) => {
      const i = pick(r, [0.04, 0.05, 0.06, 0.07, 0.08, 0.1]), g = 1 + i;
      if (L === 1) {
        const X1 = pick(r, [1000, 2000, 3000, 5000]), X2 = pick(r, [1000, 2000, 4000, 6000]), n = ri(r, 3, 8), T = ri(r, 1, n - 1);
        const ans = X1 * g ** T + X2 * g ** (T - n);
        return out(r2, { level: L, X1, X2, n, T, i }, ans, [X1 + X2, X1 * g ** T + X2, X1 + X2 * g ** (T - n), (X1 + X2) * g ** T, X1 * g ** T + X2 * g ** (n - T)],
          `A claimant is owed ${w(X1)} now and ${w(X2)} at time ${n}. The insurer replaces both with a single payment at time ${T}. At an annual effective rate of ${pc(i)}, calculate that payment.`,
          `<p>Use time ${T} as the focal date: accumulate the earlier payment, discount the later one.</p>${texd(t`${wt(X1)}(${d(g)})^{${T}} + ${wt(X2)}(${d(g)})^{-${n - T}} = ${mt(X1 * g ** T)} + ${mt(X2 * g ** (T - n))} = ${mt(ans)}`)}<p>Adding the payments without moving them gives ${m(X1 + X2)}; moving only one of them gives ${m(X1 * g ** T + X2)} or ${m(X1 + X2 * g ** (T - n))}.</p>`);
      }
      if (L === 2) {
        const X = [pick(r, [1000, 2000, 3000]), pick(r, [1000, 1500, 2500]), pick(r, [2000, 4000, 5000])];
        const tt = [ri(r, 0, 1), ri(r, 2, 4), ri(r, 5, 8)], T = ri(r, tt[1], tt[2]);
        const val = f => X.reduce((s, x, k) => s + x * g ** (f - tt[k]), 0), ans = val(T);
        const simple = X.reduce((s, x, k) => s + x * (T >= tt[k] ? 1 + i * (T - tt[k]) : 1 / (1 + i * (tt[k] - T))), 0);
        const lines = X.map((x, k) => t`${wt(x)}(${d(g)})^{${T - tt[k]}}`).join(' + ');
        return out(r2, { level: L, X, times: tt, T, i }, ans, [X[0] + X[1] + X[2], val(0), val(tt[2]), simple, X.reduce((s, x, k) => s + x * g ** (tt[k] - T), 0)],
          `Payments of ${w(X[0])}, ${w(X[1])} and ${w(X[2])} are due at times ${tt[0]}, ${tt[1]} and ${tt[2]}. At an annual effective rate of ${pc(i)}, calculate the single payment at time ${T} that is equivalent to all three.`,
          `<p>Move every payment to the focal date ${T} with ${tex(t`(1+i)^{${T} - t}`)}:</p>${texd(t`${lines} = ${mt(ans)}`)}<p>${m(val(0))} is the value at time 0, not time ${T}. Under compound interest you could also find that and multiply by ${tex(t`${d(g)}^{${T}}`)}: the focal date never changes the answer.</p>`);
      }
      const P1 = pick(r, [1000, 2000, 3000, 4000]), P2v = pick(r, [1000, 2000, 3000, 5000]), t1 = ri(r, 0, 2), t2 = ri(r, t1 + 3, t1 + 8);
      const pv = P1 * g ** -t1 + P2v * g ** -t2, S = P1 + P2v, ans = Math.log(S / pv) / Math.log(g), eqt = (P1 * t1 + P2v * t2) / S;
      return out(r2, { level: L, P1, P2: P2v, t1, t2, i }, ans, [eqt, (t1 + t2) / 2, t1 + t2 - ans, Math.log(S / pv) / i, Math.log(pv / S) / Math.log(g) + t2],
        `An insurer owes ${w(P1)} at time ${t1} and ${w(P2v)} at time ${t2}. Both are replaced by a single payment of ${w(S)} at time ${tex('t')}. At an annual effective rate of ${pc(i)}, calculate ${tex('t')} to 2 decimals.`,
        `<p>Equation of value at time 0:</p>${texd(t`${wt(S)}\,v^{t} = ${wt(P1)}v^{${t1}} + ${wt(P2v)}v^{${t2}} = ${mt(pv)}`)}${texd(t`t = \frac{\ln(${wt(S)}/${mt(pv)})}{\ln ${d(g)}} \approx ${d(ans, 2)}`)}<p>The method of equated time, ${tex(t`(${wt(P1)}\cdot ${t1} + ${wt(P2v)}\cdot ${t2})/${wt(S)} = ${d(eqt, 2)}`)}, is a quick approximation that always runs a little long. ${d((t1 + t2) / 2, 2)} ignores the sizes of the payments.</p>`);
    }),
  },
  {
    id: 'fm-tv-fisher', topic: 'realrates', name: 'Real and nominal rates',
    gen: retry((r, L) => {
      if (L === 1) {
        const i = pick(r, [0.05, 0.06, 0.07, 0.08, 0.09, 0.1]), pi = pick(r, [0.015, 0.02, 0.025, 0.03, 0.035, 0.04]), ans = (1 + i) / (1 + pi) - 1;
        return out(P2, { level: L, i, pi }, ans, [i - pi, (i - pi) / (1 + i), (1 + i) * (1 + pi) - 1, (i - pi) / (1 - pi), i + pi],
          `A portfolio earns a nominal ${pc(i)} per year while inflation is ${pc(pi)} per year. Calculate the real rate of return, as a percent to 2 decimals.`,
          `${texd(t`1 + r = \frac{1 + i}{1 + \pi} = \frac{${d(1 + i)}}{${d(1 + pi)}} \;\Rightarrow\; r \approx ${pt(ans)}`)}<p>${pc(i - pi)} is the approximation ${tex(t`i - \pi`)}, which slightly overstates the real rate. ${pc((1 + i) * (1 + pi) - 1)} multiplies when it should divide.</p>`);
      }
      if (L === 2) {
        const rr = pick(r, [0.01, 0.015, 0.02, 0.025, 0.03, 0.035]), pi = pick(r, [0.02, 0.025, 0.03, 0.04, 0.05]), ans = (1 + rr) * (1 + pi) - 1;
        return out(P2, { level: L, r: rr, pi }, ans, [rr + pi, rr + pi - rr * pi, (rr + pi) / (1 + pi), Math.abs((1 + pi) / (1 + rr) - 1), (1 + rr) / (1 - pi) - 1],
          `An investor wants a real return of ${pc(rr)} and expects inflation of ${pc(pi)}. Calculate the nominal annual effective rate needed, as a percent to 2 decimals.`,
          `${texd(t`1 + i = (1 + r)(1 + \pi) = (${d(1 + rr)})(${d(1 + pi)}) = ${d(1 + ans, 6)} \;\Rightarrow\; i \approx ${pt(ans)}`)}<p>Adding the rates gives ${pc(rr + pi)} and misses the cross term ${tex(t`r\pi = ${pt(rr * pi, 4)}`)}.</p>`);
      }
      const C = pick(r, [10000, 25000, 50000, 100000]), pi = pick(r, [0.02, 0.03, 0.04, 0.05]), i = pick(r, [0.05, 0.06, 0.07, 0.08]), n = ri(r, 3, 10);
      const ans = C * ((1 + pi) / (1 + i)) ** n;
      return out(r2, { level: L, C, pi, i, n }, ans, [C / (1 + i) ** n, C * (1 + pi) ** n, C / (1 + i - pi) ** n, C / ((1 + i) * (1 + pi)) ** n, C * ((1 + pi) / (1 + i)) ** (n - 1)],
        `A repair would cost ${w(C)} at today's prices. It will be done in ${n} years, and repair costs rise ${pc(pi)} per year. Using a nominal annual effective rate of ${pc(i)}, calculate the present value of the cost.`,
        `<p>Project the cost in future dollars and discount at the nominal rate (equivalently, discount today's cost at the exact real rate):</p>${texd(t`${wt(C)}\left(\frac{${d(1 + pi)}}{${d(1 + i)}}\right)^{${n}} = ${mt(ans)}`)}<p>Discounting today's cost at the nominal rate gives ${m(C / (1 + i) ** n)}: it forgets inflation. The approximate real rate ${pc(i - pi)} gives ${m(C / (1 + i - pi) ** n)}.</p>`);
    }),
  },
];
