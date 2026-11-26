// Exam FM · Bonds and Cash-Flow Analysis problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind ('num'), steps (HTML), params }.
// The site's makeProblem/buildChoices (data/exam-p/generator.js) turn these into five shuffled choices.
// Money answers are rounded to cents; rates are given as percentages rounded to 2 dp (kind 'num').
// Every template retries its random draw until at least four wrong answers display differently from the
// answer and from each other, so the common-mistake choices are always shown.
// Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
const t = String.raw;

/* ---------- small helpers ---------- */
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
/** Decimal for display: rounded to dp places, trailing zeros trimmed, never exponent notation. */
const d = (x, dp = 4) => { let s = Number(x).toFixed(dp); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
/** Money with thousands separators and exactly 2 dp: m() for HTML prose, mt() for TeX (commas wrapped in braces). */
const m = (x, dp = 2) => { const s = Number(x).toFixed(dp); const [a, b] = s.split('.'); return a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : ''); };
const mt = (x, dp = 2) => m(x, dp).replace(/,/g, '{,}');
/** "= total" when the rounded parts add to the rounded total, "\approx total" otherwise. */
const sumEq = (parts, tot) => (Math.abs(parts.map(x => Math.round(x * 100) / 100).reduce((a, b) => a + b, 0) - Math.round(tot * 100) / 100) < 0.005 ? '= ' : '\\approx ') + mt(tot);
const tex = s => `<span class="tex">${s}</span>`;
const texd = s => `<div class="texd">${s}</div>`;
const r2 = x => Math.round(x * 100) / 100;          // cents, or a percentage to 2 dp
const pc = x => r2(100 * x);                         // rate -> percentage number, 2 dp
const ps = x => d(100 * x, 2) + '%';                 // rate -> percentage text for prose
const pt = x => d(100 * x, 2) + t`\%`;               // rate -> percentage text for TeX
const ann = (n, i) => (1 - (1 + i) ** -n) / i;
const an = (n, i) => t`a_{\overline{${n}}|${d(i, 5)}}`;
/** Bond price: coupon cpn per period for n periods, redemption C, yield j per period. */
const bond = (cpn, C, n, j) => cpn * ann(n, j) + C * (1 + j) ** -n;
/** Root of f on [lo, hi] by bisection (f changes sign on the interval). */
const solve = (f, lo, hi) => { let a = lo, b = hi, fa = f(a); for (let k = 0; k < 200; k++) { const c = (a + b) / 2, fc = f(c); if (fa * fc <= 0) b = c; else { a = c; fa = fc; } } return (a + b) / 2; };

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
/** Run a draw up to 60 times until it has a finite answer and 4 distinct displayable mistakes. Rounds everything to 2 dp. */
const retry = once => (r, L) => {
  let g;
  for (let i = 0; i < 60; i++) {
    g = once(r, L); g.answer = r2(g.answer); g.wrongs = g.wrongs.map(r2);
    if (isFinite(g.answer) && g.answer > 0 && distinctWrongs(g) >= 4) return g;
  }
  return g;
};

const FACES = [1000, 1000, 1000, 5000, 10000];
/** Rate in steps of 0.5% between lo% and hi%. */
const rate = (r, lo, hi) => ri(r, 2 * lo, 2 * hi) / 200;

/* ---------- templates ---------- */
export const TEMPLATES = [
  {
    id: 'fm-bd-gen-price', topic: 'bond', name: 'Bond price on a coupon date',
    gen: retry((r, L) => {
      const F = pick(r, FACES), yrs = ri(r, 4, 15);
      let cr, y; do { cr = rate(r, 3, 9); y = rate(r, 3, 9); } while (cr === y);
      if (L === 1) {
        const cpn = F * cr, P = bond(cpn, F, yrs, y), A = ann(yrs, y), diff = cpn - F * y;
        return { kind: 'num', params: { level: L, F, cr, y, n: yrs }, answer: P,
          wrongs: [F + diff * ann(yrs, cr), F - diff * A, F * (1 + y) ** -yrs, F + diff * yrs, bond(F * y, F, yrs, cr)],
          q: `A ${yrs}-year bond with face value ${m(F, 0)}, redeemable at par, pays annual coupons at a coupon rate of ${ps(cr)}. Calculate its price at an annual effective yield of ${ps(y)}.`,
          steps: `<p>Coupon ${tex(t`Fr = ${mt(cpn)}`)}, ${tex(t`C = ${mt(F, 0)}`)}, ${tex(t`j = ${pt(y)}`)}, ${tex(t`n = ${yrs}`)}.</p>${texd(t`P = ${mt(cpn)}\,${an(yrs, y)} + ${mt(F, 0)}\,v^{${yrs}} = ${mt(cpn * A)} + ${mt(F * (1 + y) ** -yrs)} ${sumEq([cpn * A, F * (1 + y) ** -yrs], P)}`)}<p>Premium/discount check: ${tex(t`P = C + (Fr - Cj)a_{\overline{n}|j} = ${mt(F, 0)} + (${mt(cpn)} - ${mt(F * y)})(${d(A, 5)}) = ${mt(P)}`)}. The bond sells at a ${cr > y ? 'premium' : 'discount'} because the coupon rate is ${cr > y ? 'above' : 'below'} the yield.</p><p>Using the annuity at the coupon rate gives ${m(F + diff * ann(yrs, cr))}; forgetting the coupons gives ${m(F * (1 + y) ** -yrs)}.</p>` };
      }
      const n = 2 * yrs, jj = y / 2, cpn = F * cr / 2;
      const C = L === 3 ? F * pick(r, [1.02, 1.05, 1.08, 1.1, 1.12, 1.15]) : F;
      const P = bond(cpn, C, n, jj), A = ann(n, jj);
      const wrongs = L === 2
        ? [bond(F * cr, F, yrs, y), bond(F * cr, F, n, jj), bond(cpn, F, n, (1 + y) ** 0.5 - 1), F * (1 + jj) ** -n, F + (F * jj - cpn) * A]
        : [bond(cpn, F, n, jj), bond(C * cr / 2, C, n, jj), bond(F * cr, C, yrs, y), C * (1 + jj) ** -n, F + (cpn - F * jj) * A];
      const redeem = L === 3 ? `redeemable at ${m(C, 0)}` : 'redeemable at par';
      return { kind: 'num', params: { level: L, F, C, cr, y, n: yrs }, answer: P, wrongs,
        q: `A ${yrs}-year bond with face value ${m(F, 0)}, ${redeem}, pays coupons at ${ps(cr)} per year, convertible semiannually. Calculate its price at a yield of ${ps(y)} per year, convertible semiannually.`,
        steps: `<p>Work in half-years: ${tex(t`n = ${n}`)}, coupon ${tex(t`Fr = ${mt(F, 0)}(${d(cr / 2, 5)}) = ${mt(cpn)}`)}, yield ${tex(t`j = ${pt(jj)}`)} per half-year${L === 3 ? t`, redemption value ${tex(t`C = ${mt(C, 0)}`)}. The coupon is based on the face value, not on ${tex('C')}` : ''}.</p>${texd(t`P = ${mt(cpn)}\,${an(n, jj)} + ${mt(C, 0)}\,v^{${n}} = ${mt(cpn * A)} + ${mt(C * (1 + jj) ** -n)} ${sumEq([cpn * A, C * (1 + jj) ** -n], P)}`)}${texd(t`\text{Check: } P = C + (Fr - Cj)a_{\overline{${n}}|} = ${mt(C, 0)} + (${mt(cpn)} - ${mt(C * jj)})(${d(A, 5)}) = ${mt(P)}`)}<p>${L === 3 ? `Redeeming at par gives ${m(bond(cpn, F, n, jj))}; basing coupons on ${m(C, 0)} gives ${m(bond(C * cr / 2, C, n, jj))}.` : `Treating the rates as annual with ${yrs} annual coupons gives ${m(bond(F * cr, F, yrs, y))}; paying the full annual coupon each half-year gives ${m(bond(F * cr, F, n, jj))}.`}</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-ytm', topic: 'bond', name: 'Yield to maturity from the price',
    gen: retry((r, L) => {
      const F = pick(r, FACES);
      let cr, y; do { cr = rate(r, 3, 9); y = ri(r, 12, 40) / 400; } while (Math.abs(cr - y) < 0.004);
      const semi = L === 3, yrs = L === 1 ? ri(r, 2, 4) : ri(r, 5, 15);
      const n = semi ? 2 * yrs : yrs, cpn = semi ? F * cr / 2 : F * cr, jj = semi ? y / 2 : y;
      const P = r2(bond(cpn, F, n, jj));
      const jx = solve(x => bond(cpn, F, n, x) - P, 0.0001, 0.5);
      const ans = semi ? 2 * jx : jx;
      const curr = cpn / P * (semi ? 2 : 1);
      const approx = (cpn + (F - P) / n) / ((P + F) / 2) * (semi ? 2 : 1);
      const wrongs = semi
        ? [pc(jx), pc((1 + jx) ** 2 - 1), pc(cr), pc(curr), pc(approx)]
        : [pc(cr), pc(curr), pc(cr + (F - P) / (P * n)), pc((F * (1 + cr * n) / P) ** (1 / n) - 1), pc(approx)];
      const freq = semi ? 'convertible semiannually' : 'annual';
      return { kind: 'num', params: { level: L, F, cr, P, n: yrs }, answer: pc(ans), wrongs,
        q: `A ${yrs}-year bond with face value ${m(F, 0)}, redeemable at par, pays ${semi ? 'semiannual' : 'annual'} coupons at ${ps(cr)} per year. It sells for ${m(P)}. Calculate its yield to maturity as ${semi ? 'a nominal annual rate convertible semiannually' : 'an annual effective rate'}, in percent.`,
        steps: `<p>The yield is the rate ${tex('j')} per ${semi ? 'half-year' : 'year'} solving</p>${texd(t`${mt(P)} = ${mt(cpn)}\,a_{\overline{${n}}|j} + ${mt(F, 0)}\,v_j^{${n}}`)}<p>The price is ${P < F ? 'below' : 'above'} par, so the yield is ${P < F ? 'above' : 'below'} the coupon rate. A calculator (N = ${n}, PV = −${m(P)}, PMT = ${m(cpn)}, FV = ${m(F, 0)}) or trial and error gives ${tex(t`j = ${d(100 * jx, 4)}\%`)}${semi ? ' per half-year' : ''}.</p>${semi ? texd(t`i^{(2)} = 2j = ${d(100 * ans, 2)}\%`) : ''}<p>${semi ? `${d(100 * jx, 2)}% is only the half-year rate, and ${d(100 * ((1 + jx) ** 2 - 1), 2)}% is the annual effective rate, not the nominal rate asked for.` : `The coupon rate ${ps(cr)} would be the yield only at par, and the current yield ${d(100 * curr, 2)}% (coupon ÷ price) ignores the ${P < F ? 'gain' : 'loss'} at redemption.`}</p>`,
      };
    }),
  },
  {
    id: 'fm-bd-gen-bookvalue', topic: 'bookvalue', name: 'Premium, discount and book value',
    gen: retry((r, L) => {
      const F = pick(r, FACES), n = ri(r, 5, 15);
      let cr, y; do { cr = rate(r, 3, 9); y = rate(r, 3, 9); } while (Math.abs(cr - y) < 0.01);
      const cpn = F * cr, P = bond(cpn, F, n, y), diff = cpn - F * y, prem = diff > 0;
      const params = { level: L, F, cr, y, n };
      const q0 = `A ${n}-year bond with face value ${m(F, 0)}, redeemable at par, pays annual coupons at ${ps(cr)}. It is bought at issue to yield ${ps(y)} annual effective.`;
      if (L === 1) {
        const ans = Math.abs(P - F);
        return { kind: 'num', params, answer: ans, wrongs: [Math.abs(diff) * n, Math.abs(diff) * ann(n, cr), P, Math.abs(diff) * (1 + y) ** -n, Math.abs(diff) * ann(n, y) * (1 + y)],
          q: `${q0} Calculate the amount of the ${prem ? 'premium' : 'discount'}.`,
          steps: `<p>Each year the coupon ${tex(t`Fr = ${mt(cpn)}`)} is ${prem ? 'above' : 'below'} ${tex(t`Cj = ${mt(F * y)}`)} by ${m(Math.abs(diff))}. The ${prem ? 'premium' : 'discount'} is the present value of that difference at the yield:</p>${texd(t`|P - C| = |Fr - Cj|\,${an(n, y)} = ${mt(Math.abs(diff))}(${d(ann(n, y), 5)}) = ${mt(ans)}`)}<p>Not discounting gives ${m(Math.abs(diff) * n)}; using the annuity at the coupon rate gives ${m(Math.abs(diff) * ann(n, cr))}.</p>` };
      }
      const k = ri(r, 2, n - 2);
      if (L === 2) {
        const ans = bond(cpn, F, n - k, y);
        return { kind: 'num', params: { ...params, k }, answer: ans, wrongs: [bond(cpn, F, k, y), P, P + (F - P) * k / n, F, bond(cpn, F, n - k + 1, y)],
          q: `${q0} Calculate its book value just after the ${k}${k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} coupon is paid.`,
          steps: `<p>The book value is the price of the remaining payments at the original yield. ${n - k} coupons remain:</p>${texd(t`B_{${k}} = ${mt(cpn)}\,${an(n - k, y)} + ${mt(F, 0)}\,v^{${n - k}} = ${mt(ans)}`)}<p>The price at issue was ${m(P)}; the book value ${prem ? 'falls' : 'rises'} toward ${m(F, 0)}. A straight-line ${prem ? 'write-down' : 'write-up'} would give ${m(P + (F - P) * k / n)}, and using ${k} remaining years gives ${m(bond(cpn, F, k, y))}.</p>` };
      }
      const bPrev = bond(cpn, F, n - k + 1, y), I = y * bPrev, PR = cpn - I;
      return { kind: 'num', params: { ...params, k }, answer: I, wrongs: [Math.abs(PR), y * P, cpn, y * bond(cpn, F, n - k, y), y * F + Math.abs(PR)],
        q: `${q0} Calculate the interest portion of the ${k}${k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} coupon in the bond amortization schedule.`,
        steps: `<p>Interest earned in year ${k} is the yield times the book value at the start of the year (just after coupon ${k - 1}), when ${n - k + 1} coupons remain:</p>${texd(t`B_{${k - 1}} = ${mt(cpn)}\,${an(n - k + 1, y)} + ${mt(F, 0)}\,v^{${n - k + 1}} = ${mt(bPrev)}`)}${texd(t`I_{${k}} = ${d(y, 4)}(${mt(bPrev)}) = ${mt(I)}`)}<p>The rest of the coupon, ${tex(t`${mt(cpn)} - ${mt(I)} = ${mt(PR)}`)}, is the ${prem ? 'write-down of premium' : 'write-up of discount (negative principal)'}; check: ${tex(t`(Fr - Cj)v^{${n - k + 1}} = ${mt(PR)}`)}. Applying the yield to the original price gives ${m(y * P)}.</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-callable', topic: 'bond', name: 'Callable bond price',
    gen: retry((r, L) => {
      const F = pick(r, FACES), n = ri(r, 10, 20), a = ri(r, 4, n - 4);
      let cr, y;
      do { cr = rate(r, 3, 9); y = rate(r, 3, 9); } while (L === 2 ? cr > y - 0.01 : cr < y + 0.01);
      const cpn = F * cr, to = (yr, C = F) => bond(cpn, C, yr, y);
      const params = { level: L, F, cr, y, n, a };
      if (L < 3) {
        const prem = L === 1, ans = prem ? to(a) : to(n), other = prem ? to(n) : to(a), mid = Math.round((a + n) / 2);
        return { kind: 'num', params, answer: ans, wrongs: [other, to(mid), F, prem ? to(a + 1) : to(n - 1), (to(a) + to(n)) / 2],
          q: `A ${n}-year bond with face value ${m(F, 0)} pays annual coupons at ${ps(cr)}. It is callable at par at the end of any year from year ${a} to year ${n}. Calculate the highest price an investor can pay and still be sure of an annual effective yield of at least ${ps(y)}.`,
          steps: `<p>The coupon rate is ${prem ? 'above' : 'below'} the yield, so this is a ${prem ? 'premium' : 'discount'} bond, and every redemption value is ${m(F, 0)}. The worst case for the investor is the ${prem ? 'earliest' : 'latest'} redemption date, year ${prem ? a : n}${prem ? ': the premium is recovered over the fewest years' : ': the discount (the investor\'s gain) arrives as late as possible'}.</p>${texd(t`P = ${mt(cpn)}\,${an(prem ? a : n, y)} + ${mt(F, 0)}\,v^{${prem ? a : n}} = ${mt(ans)}`)}<p>Pricing to year ${prem ? n : a} instead gives ${m(other)}, a higher price that would yield less than ${ps(y)} if the bond were redeemed in year ${prem ? a : n}.</p>` };
      }
      const b = ri(r, a + 2, n - 2), p1 = pick(r, [0.04, 0.05, 0.06, 0.08, 0.1]), p2 = p1 / 2;
      const C1 = F * (1 + p1), C2 = F * (1 + p2);
      const P1 = to(a, C1), P2 = to(b, C2), P3 = to(n), ans = Math.min(P1, P2, P3);
      return { kind: 'num', params: { ...params, b, C1, C2 }, answer: ans, wrongs: [P1, P2, P3, to(a), (P1 + P2 + P3) / 3, C1].filter(v => Math.abs(v - ans) > 0.005),
        q: `A ${n}-year bond with face value ${m(F, 0)} pays annual coupons at ${ps(cr)}. The issuer may call it at the end of year ${a} for ${m(C1, 0)} or at the end of year ${b} for ${m(C2, 0)}; otherwise it is redeemed at par at the end of year ${n}. Calculate the highest price an investor can pay and still be sure of an annual effective yield of at least ${ps(y)}.`,
        steps: `<p>The redemption values differ, so price to every possible date at ${ps(y)} and take the smallest:</p>${texd(t`\begin{aligned} \text{Year } ${a}: &\; ${mt(cpn)}\,a_{\overline{${a}}|} + ${mt(C1, 0)}\,v^{${a}} = ${mt(P1)} \\ \text{Year } ${b}: &\; ${mt(cpn)}\,a_{\overline{${b}}|} + ${mt(C2, 0)}\,v^{${b}} = ${mt(P2)} \\ \text{Year } ${n}: &\; ${mt(cpn)}\,a_{\overline{${n}}|} + ${mt(F, 0)}\,v^{${n}} = ${mt(P3)} \end{aligned}`)}<p>The minimum is ${m(ans)}. The shortcut "premium bond, earliest date" can fail when the call prices include a premium; pricing the year-${a} call at par instead of ${m(C1, 0)} gives ${m(to(a))}.</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-between', topic: 'bond', name: 'Price between coupon dates',
    gen: retry((r, L) => {
      const F = pick(r, FACES), yrs = ri(r, 3, 12), n = 2 * yrs;
      let cr, y; do { cr = rate(r, 3, 9); y = rate(r, 3, 9); } while (cr === y);
      const cpn = F * cr / 2, jj = y / 2, B = bond(cpn, F, n, jj), mo = ri(r, 1, 5), k = mo / 6;
      const flat = B * (1 + jj) ** k, acc = k * cpn, mkt = flat - acc;
      const params = { level: L, F, cr, y, n: yrs, months: mo };
      const q0 = `A bond with face value ${m(F, 0)} pays coupons at ${ps(cr)} per year, convertible semiannually. Just after a coupon is paid, ${n} coupons remain and the bond's book value at a yield of ${ps(y)} convertible semiannually is ${m(B)}.`;
      const flatLine = texd(t`\text{Flat price} = ${mt(B)}(1 + ${d(jj, 4)})^{${mo}/6} = ${mt(flat)}`);
      const accLine = texd(t`\text{Accrued coupon} = \tfrac{${mo}}{6}(${mt(cpn)}) = ${mt(acc)}`);
      if (L === 1) return { kind: 'num', params, answer: acc, wrongs: [cpn, (1 - k) * cpn, 2 * acc, F * y / 2 * k, B * ((1 + jj) ** k - 1)],
        q: `${q0} Calculate the accrued coupon ${mo} month${mo > 1 ? 's' : ''} after that coupon date.`,
        steps: `<p>${mo} of the 6 months in the coupon period have passed, so ${tex(t`k = ${mo}/6`)} and the coupon is ${tex(t`Fr = ${mt(cpn)}`)}.</p>${accLine}<p>${m(2 * acc)} uses the full annual coupon, and ${m((1 - k) * cpn)} is the part not yet earned.</p>` };
      if (L === 2) return { kind: 'num', params, answer: flat, wrongs: [mkt, B, B * (1 + jj) ** (1 - k), B + cpn, B * (1 + y) ** k, flat + acc],
        q: `${q0} Calculate the flat (dirty) price ${mo} month${mo > 1 ? 's' : ''} after that coupon date.`,
        steps: `<p>The flat price is the book value at the last coupon date accumulated at the yield for the fraction ${tex(t`k = ${mo}/6`)} of the period:</p>${flatLine}<p>Subtracting the accrued coupon would give the market price ${m(mkt)}; accumulating at the nominal annual rate gives ${m(B * (1 + y) ** k)}.</p>` };
      return { kind: 'num', params, answer: mkt, wrongs: [flat, B, flat + acc, flat - (1 - k) * cpn, B - acc, flat - cpn],
        q: `${q0} Calculate the market (clean) price ${mo} month${mo > 1 ? 's' : ''} after that coupon date.`,
        steps: `${flatLine}${accLine}${texd(t`\text{Market price} = ${mt(flat)} - ${mt(acc)} = ${mt(mkt)}`)}<p>The flat price ${m(flat)} is what the buyer pays; the quoted market price removes the coupon the seller has already earned. Subtracting the unearned part instead gives ${m(flat - (1 - k) * cpn)}.</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-npv', topic: 'cashflow', name: 'NPV and IRR of a project',
    gen: retry((r, L) => {
      if (L === 2) {
        const i = ri(r, 4, 15) / 100, I = pick(r, [1000, 2000, 5000, 10000]), A = I * ri(r, 3, 7) / 10;
        const B = r2((I * (1 + i) - A) * (1 + i));
        const irr = solve(x => -I + A / (1 + x) + B / (1 + x) ** 2, 0.0001, 1);
        return { kind: 'num', params: { level: L, I, A, B }, answer: pc(irr),
          wrongs: [pc((A + B - I) / I), pc(((A + B) / I) ** 0.5 - 1), pc((A + B - I) / (2 * I)), pc(B / (I - A) - 1), pc(((A + B) / I) ** (1 / 1.5) - 1)],
          q: `A project costs ${m(I, 0)} now and returns ${m(A, 0)} at the end of year 1 and ${m(B)} at the end of year 2. Calculate its internal rate of return, in percent.`,
          steps: `<p>Set the NPV to zero with ${tex('v = 1/(1+i)')}: a quadratic in ${tex('v')}.</p>${texd(t`${mt(B)}v^2 + ${mt(A, 0)}v - ${mt(I, 0)} = 0 \;\Longrightarrow\; v = \frac{-${mt(A, 0)} + \sqrt{${mt(A, 0)}^2 + 4(${mt(B)})(${mt(I, 0)})}}{2(${mt(B)})} = ${d(1 / (1 + irr), 5)}`)}<p>So ${tex(t`i = 1/v - 1 = ${d(100 * irr, 2)}\%`)}. Check: ${tex(t`${mt(A, 0)}/${d(1 + irr, 4)} + ${mt(B)}/${d(1 + irr, 4)}^2 = ${mt(I, 0)}`)}.</p><p>The total gain divided by the cost, ${d(100 * (A + B - I) / I, 2)}%, ignores timing.</p>` };
      }
      const i = rate(r, 3, 10), n = ri(r, 3, 10), R = pick(r, [1000, 2000, 2500, 4000, 5000]);
      if (L === 1) {
        const PVin = R * ann(n, i), I = Math.round(PVin * ri(r, 82, 96) / 100 / 100) * 100, ans = PVin - I;
        return { kind: 'num', params: { level: L, I, R, n, i }, answer: ans, wrongs: [n * R - I, PVin, PVin * (1 + i) - I, R * ann(n - 1, i) - I, R * ann(n, i + 0.01) - I, R * ann(n, i / 2) - I],
          q: `A project costs ${m(I, 0)} now and returns ${m(R, 0)} at the end of each of the next ${n} years. Calculate its net present value at an annual effective rate of ${ps(i)}.`,
          steps: `${texd(t`NPV = -${mt(I, 0)} + ${mt(R, 0)}\,${an(n, i)} = -${mt(I, 0)} + ${mt(R, 0)}(${d(ann(n, i), 5)}) = ${mt(ans)}`)}<p>A positive NPV means the project earns more than ${ps(i)}. Not discounting gives ${m(n * R - I)}; treating the returns as an annuity-due gives ${m(PVin * (1 + i) - I)}.</p>` };
      }
      const def = ri(r, 1, 3), I = pick(r, [5000, 10000, 20000]), PVin = R * ann(n, i) * (1 + i) ** -def;
      const I2 = Math.round(I * ri(r, 2, 6) / 10), raw = PVin - I - I2 / (1 + i);
      const scale = raw > 0 ? 1 : Math.ceil((I + I2) * 1.15 / PVin);
      const RR = R * scale, PV = RR * ann(n, i) * (1 + i) ** -def, ans = PV - I - I2 / (1 + i);
      return { kind: 'num', params: { level: L, I, I2, R: RR, n, i, def }, answer: ans,
        wrongs: [RR * ann(n, i) - I - I2 / (1 + i), PV - I - I2, RR * ann(n, i) * (1 + i) ** -(def + 1) - I - I2 / (1 + i), n * RR - I - I2, PV],
        q: `A project costs ${m(I, 0)} now and a further ${m(I2, 0)} at the end of year 1. It then returns ${m(RR, 0)} a year for ${n} years, the first return at the end of year ${def + 1}. Calculate its net present value at an annual effective rate of ${ps(i)}.`,
        steps: `<p>The returns form an annuity-immediate deferred ${def} year${def > 1 ? 's' : ''}:</p>${texd(t`PV_{\text{in}} = ${mt(RR, 0)}\,${an(n, i)}\,v^{${def}} = ${mt(RR * ann(n, i))}(${d((1 + i) ** -def, 5)}) = ${mt(PV)}`)}${texd(t`NPV = ${mt(PV)} - ${mt(I, 0)} - ${mt(I2, 0)}v = ${mt(PV)} - ${mt(I, 0)} - ${mt(I2 / (1 + i))} = ${mt(ans)}`)}<p>Ignoring the deferral gives ${m(RR * ann(n, i) - I - I2 / (1 + i))}; not discounting the second outlay gives ${m(PV - I - I2)}.</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-fundreturn', topic: 'cashflow', name: 'Dollar- and time-weighted returns',
    gen: retry((r, L) => {
      const A = pick(r, [50000, 100000, 200000, 250000]), MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const mo = ri(r, 2, 11), tt = (mo - 1) / 12, Dep = A * ri(r, 1, 4) / 10;
      if (L === 2) {
        const g1 = ri(r, -4, 10) / 100, g2 = ri(r, -4, 10) / 100;
        if (g1 === g2) return { answer: NaN, wrongs: [], kind: 'num' };
        const B1 = A * (1 + g1), B = r2((B1 + Dep) * (1 + g2)), tw = B1 / A * B / (B1 + Dep) - 1;
        const I = B - A - Dep, dw = I / (A + Dep * (1 - tt));
        if (tw <= 0) return { answer: NaN, wrongs: [], kind: 'num' };
        return { kind: 'num', params: { level: L, A, B1, Dep, B, mo }, answer: pc(tw), wrongs: [pc(dw), pc((B - A) / A), pc(g1 + (B / (B1 + Dep) - 1)), pc(I / A), pc(B / A * B1 / (B1 + Dep) - 1)],
          q: `A fund is worth ${m(A, 0)} on January 1. On ${MON[mo - 1]} 1 it is worth ${m(B1, 0)} just before a deposit of ${m(Dep, 0)}. On December 31 it is worth ${m(B)}. Calculate the time-weighted rate of return for the year, in percent.`,
          steps: `<p>Split the year at the deposit and chain the growth factors:</p>${texd(t`1 + i = \frac{${mt(B1, 0)}}{${mt(A, 0)}}\times\frac{${mt(B)}}{${mt(B1, 0)} + ${mt(Dep, 0)}} = ${d(B1 / A, 5)} \times ${d(B / (B1 + Dep), 5)} = ${d(1 + tw, 5)}`)}<p>So the time-weighted return is ${d(100 * tw, 2)}%. The dollar-weighted return is ${d(100 * dw, 2)}%, because it also reflects when the deposit came in; ${d(100 * (B - A) / A, 2)}% ignores the deposit entirely.</p>` };
      }
      const g = ri(r, 3, 12) / 100;
      let C = Dep, W = 0, mw = 0, tw2 = 0;
      if (L === 3) { mw = ri(r, mo + 1, 12); tw2 = (mw - 1) / 12; W = Math.round(A * ri(r, 1, 3) / 20); C = Dep; }
      const B = Math.round((A * (1 + g) + C * (1 + g * (1 - tt)) - W * (1 + g * (1 - tw2))) / 100) * 100;
      const I = B - A - C + W, den = A + C * (1 - tt) - W * (1 - tw2), ans = I / den;
      const params = { level: L, A, C, W, B, mo, mw };
      const flows = L === 3 ? `A deposit of ${m(C, 0)} is made on ${MON[mo - 1]} 1 and a withdrawal of ${m(W, 0)} on ${MON[mw - 1]} 1.` : `A deposit of ${m(C, 0)} is made on ${MON[mo - 1]} 1.`;
      return { kind: 'num', params, answer: pc(ans),
        wrongs: [pc(I / (A + C * tt - W * tw2)), pc(I / A), pc(I / (A + C - W)), pc((B - A) / den), pc(I / (A + C * (1 - tt) + W * (1 - tw2)))],
        q: `A fund holds ${m(A, 0)} on January 1. ${flows} The fund holds ${m(B, 0)} on December 31. Using simple interest for fractions of the year, calculate the dollar-weighted rate of return, in percent.`,
        steps: `<p>Interest earned is the growth not explained by net deposits:</p>${texd(t`I = ${mt(B, 0)} - ${mt(A, 0)} - ${mt(C, 0)}${L === 3 ? t` + ${mt(W, 0)}` : ''} = ${mt(I, 0)}`)}<p>Weight each flow by the fraction of the year remaining after it: the deposit on ${MON[mo - 1]} 1 by ${tex(t`${13 - mo}/12`)}${L === 3 ? `, the withdrawal on ${MON[mw - 1]} 1 by ${tex(t`${13 - mw}/12`)}` : ''}.</p>${texd(t`i \approx \frac{${mt(I, 0)}}{${mt(A, 0)} + \tfrac{${13 - mo}}{12}(${mt(C, 0)})${L === 3 ? t` - \tfrac{${13 - mw}}{12}(${mt(W, 0)})` : ''}} = \frac{${mt(I, 0)}}{${mt(den)}} = ${d(100 * ans, 2)}\%`)}<p>Weighting by the time already elapsed gives ${d(100 * I / (A + C * tt - W * tw2), 2)}%, and dividing by the starting balance alone gives ${d(100 * I / A, 2)}%.</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-spot', topic: 'termstruct', name: 'Spot rates: prices, forwards and par yields',
    gen: retry((r, L) => {
      const s1 = ri(r, 4, 16) / 400;
      const sp = [s1]; for (let k = 1; k < 3; k++) sp.push(sp[k - 1] + ri(r, -2, 5) / 400);
      if (sp.some(x => x <= 0.005)) return { answer: NaN, wrongs: [], kind: 'num' };
      const v = sp.map((s, k) => (1 + s) ** -(k + 1));
      const spotTxt = sp.map((s, k) => `${ps(s)} for ${k + 1} year${k ? 's' : ''}`).join(', ');
      const params = { level: L, spots: sp };
      if (L === 1) {
        const F = pick(r, FACES), cr = rate(r, 2, 8), cpn = F * cr, ans = cpn * (v[0] + v[1]) + (F + cpn) * v[2];
        const avg = (sp[0] + sp[1] + sp[2]) / 3;
        return { kind: 'num', params: { ...params, F, cr }, answer: ans,
          wrongs: [bond(cpn, F, 3, sp[2]), bond(cpn, F, 3, avg), cpn / (1 + sp[0]) + cpn / (1 + sp[1]) + (F + cpn) / (1 + sp[2]), cpn * (v[0] + v[1]) + F * v[2], bond(cpn, F, 3, sp[0])],
          q: `Annual effective spot rates are ${spotTxt}. Calculate the price of a 3-year bond with face value ${m(F, 0)}, redeemable at par, with annual coupons at ${ps(cr)}.`,
          steps: `<p>Discount each payment at the spot rate for its own date:</p>${texd(t`P = \frac{${mt(cpn)}}{${d(1 + sp[0], 4)}} + \frac{${mt(cpn)}}{${d(1 + sp[1], 4)}^2} + \frac{${mt(F + cpn)}}{${d(1 + sp[2], 4)}^3} = ${mt(cpn * v[0])} + ${mt(cpn * v[1])} + ${mt((F + cpn) * v[2])} ${sumEq([cpn * v[0], cpn * v[1], (F + cpn) * v[2]], ans)}`)}<p>Discounting everything at the 3-year spot rate gives ${m(bond(cpn, F, 3, sp[2]))}; leaving the last coupon out gives ${m(cpn * (v[0] + v[1]) + F * v[2])}.</p>` };
      }
      if (L === 2) {
        const f = (1 + sp[2]) ** 3 / (1 + sp[1]) ** 2 - 1;
        return { kind: 'num', params, answer: pc(f), wrongs: [pc(3 * sp[2] - 2 * sp[1]), pc(sp[2]), pc((1 + sp[2]) ** 3 / (1 + sp[0]) - 1), pc(((1 + sp[2]) ** 3 / (1 + sp[0])) ** 0.5 - 1), pc((1 + sp[2]) ** 3 - 1)],
          q: `Annual effective spot rates are ${spotTxt}. Calculate the 1-year forward rate from time 2 to time 3, in percent.`,
          steps: `<p>Investing for 3 years at the spot rate must match investing for 2 years and then rolling over at the forward rate:</p>${texd(t`(1 + s_3)^3 = (1 + s_2)^2(1 + f_2) \;\Longrightarrow\; f_2 = \frac{${d(1 + sp[2], 4)}^3}{${d(1 + sp[1], 4)}^2} - 1 = ${d(100 * f, 2)}\%`)}<p>The approximation ${tex(t`3s_3 - 2s_2`)} gives ${d(100 * (3 * sp[2] - 2 * sp[1]), 2)}%; dividing by ${tex(t`1 + s_1`)} gives a 2-year growth, not an annual forward rate.</p>` };
      }
      const sv = v[0] + v[1] + v[2], c = (1 - v[2]) / sv, avg = (sp[0] + sp[1] + sp[2]) / 3;
      return { kind: 'num', params, answer: pc(c), wrongs: [pc(sp[2]), pc(avg), pc((1 - v[2]) / (3 * v[2])), pc((1 - v[2]) / (v[0] + v[1])), pc(sp[0])],
        q: `Annual effective spot rates are ${spotTxt}. Calculate the 3-year par yield (the annual coupon rate at which a 3-year annual-coupon bond sells at par), in percent.`,
        steps: `<p>Spot discount factors: ${tex(t`v_1 = ${d(v[0], 5)}`)}, ${tex(t`v_2 = ${d(v[1], 5)}`)}, ${tex(t`v_3 = ${d(v[2], 5)}`)}. A par bond with coupon rate ${tex('c')} satisfies ${tex(t`1 = c(v_1 + v_2 + v_3) + v_3`)}:</p>${texd(t`c = \frac{1 - v_3}{v_1 + v_2 + v_3} = \frac{${d(1 - v[2], 5)}}{${d(sv, 5)}} = ${d(100 * c, 2)}\%`)}<p>The par yield is a blend of the spot rates weighted toward the 3-year rate, not the 3-year spot rate itself (${ps(sp[2])}); dividing by ${tex('3v_3')} gives ${d(100 * (1 - v[2]) / (3 * v[2]), 2)}%.</p>` };
    }),
  },
  {
    id: 'fm-bd-gen-forward', topic: 'termstruct', name: 'Spot rates from forward rates',
    gen: retry((r, L) => {
      const nn = L === 1 ? 2 : 3;
      const fw = []; for (let k = 0; k < nn; k++) fw.push(ri(r, 4, 32) / 400);
      if (new Set(fw).size < nn) return { answer: NaN, wrongs: [], kind: 'num' };
      const prod = fw.reduce((p, f) => p * (1 + f), 1), s = prod ** (1 / nn) - 1, mean = fw.reduce((a, b) => a + b, 0) / nn;
      const fTxt = fw.map(ps).join(', ').replace(/, ([^,]*)$/, ' and $1');
      const prodTex = fw.map(f => `(${d(1 + f, 4)})`).join('');
      if (L < 3) return { kind: 'num', params: { level: L, forwards: fw }, answer: pc(s), wrongs: [pc(mean), pc(prod - 1), pc(fw[nn - 1]), pc(prod ** (1 / (nn - 1)) - 1), pc(fw[0])],
        q: `The 1-year forward rates for years 1${nn === 3 ? ', 2 and 3' : ' and 2'} are ${fTxt} (annual effective; the first is the current 1-year spot rate). Calculate the ${nn}-year spot rate, in percent.`,
        steps: `<p>A ${nn}-year investment at the spot rate grows like rolling over the 1-year forward rates:</p>${texd(t`(1 + s_${nn})^${nn} = ${prodTex} = ${d(prod, 6)} \;\Longrightarrow\; s_${nn} = ${d(prod, 6)}^{1/${nn}} - 1 = ${d(100 * s, 2)}\%`)}<p>The spot rate is a geometric average of the forward growth factors; the arithmetic mean ${d(100 * mean, 2)}% is close but not exact, and ${d(100 * (prod - 1), 2)}% is the total ${nn}-year growth.</p>` };
      const F = pick(r, [1000, 5000, 10000]), price = F / prod;
      return { kind: 'num', params: { level: L, forwards: fw, F }, answer: price, wrongs: [F / (1 + mean) ** 3, F / (1 + fw[2]) ** 3, F / (1 + fw[0]) ** 3, F * (1 - fw[0] - fw[1] - fw[2]), F / (1 + fw[0] + fw[1] + fw[2]), F / ((1 + fw[0]) * (1 + fw[1]))],
        q: `The 1-year forward rates for years 1, 2 and 3 are ${fTxt} (annual effective; the first is the current 1-year spot rate). Calculate the price of a 3-year zero-coupon bond paying ${m(F, 0)} at maturity.`,
        steps: `<p>The 3-year discount factor is the product of the 1-year forward discount factors:</p>${texd(t`P = \frac{${mt(F, 0)}}{${prodTex}} = \frac{${mt(F, 0)}}{${d(prod, 6)}} = ${mt(price)}`)}<p>Equivalently, ${tex(t`s_3 = ${d(100 * s, 2)}\%`)} and ${tex(t`P = ${mt(F, 0)}/(1 + s_3)^3`)}. Discounting at the last forward rate for all 3 years gives ${m(F / (1 + fw[2]) ** 3)}; adding the rates instead of compounding gives ${m(F / (1 + fw[0] + fw[1] + fw[2]))}.</p>` };
    }),
  },
];
