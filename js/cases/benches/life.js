// Benches for The Mortality Table (life contingencies, Exam FM / LTAM level).
import { esc, fmt, pct, spct, num, money } from '../../util.js';
import { lineChart, barChart } from '../../ui/charts.js';
import { POLICY, EXP, BASE, price, pvProfit, survival } from '../lib/life.js';

/** Gross premium builder: the learner proposes G and sees whether PV premiums cover PV benefits + expenses. */
export const ltGross = {
  inputs(st) {
    return `<div class="row"><label class="field">Your gross annual premium ($) <input class="f" type="text" inputmode="decimal" data-field="ltG" value="${esc(st.ltG ?? '')}" aria-label="Gross annual premium in dollars"></label></div>
      <div class="row" style="margin-top:8px">${isFinite(num(st.ans?.m5)) ? `<button class="btn sm quiet" data-act="net">Try your net premium ($${esc(st.ans.m5)})</button>` : ''}<button class="btn sm quiet" data-act="clear">Clear</button></div>`;
  },
  outputs(st) {
    const G = num(st.ltG);
    if (!isFinite(G) || G <= 0) return `<p class="small muted" style="margin:10px 0 0">Enter a premium to see the present value at issue of every cash flow: premiums in, death benefits and expenses out.</p>`;
    const r = pvProfit(G, BASE), ok = Math.abs(r.profit) < 0.5 * BASE.a;
    const tag = ok ? '<span class="pill ok">Balanced</span>' : r.profit < 0 ? '<span class="pill bad">Loses money</span>' : '<span class="pill st">Profit margin</span>';
    return `<div class="kpis" style="margin-top:12px">
        <div class="kpi"><div class="l">PV of gross premiums</div><div class="v">${money(r.prem)}</div></div>
        <div class="kpi"><div class="l">PV of benefits + expenses</div><div class="v">${money(r.outgo)}</div></div>
        <div class="kpi hero"><div class="l">PV profit at issue, per policy</div><div class="v">${money(r.profit, 2)}</div></div></div>
      <p class="small" style="margin:10px 0 4px">${tag} ${ok ? 'PV premiums equal PV outgo to within a few cents: this is the equivalence-principle gross premium.' : r.profit < 0 ? 'PV premiums fall short of PV outgo. Raise the premium.' : `PV premiums exceed PV outgo. That is a profit margin of ${pct(r.profit / r.prem)} of PV premium.`}</p>
      <div class="panel" style="margin-top:8px"><div class="small muted">Present value at issue, per policy</div>${barChart([
        { l: 'PV gross premiums', v: r.prem, c: 'var(--chart-1)', strong: true },
        { l: 'PV death benefits', v: r.ben, c: 'var(--chart-3)' },
        { l: 'PV premium-related expenses', v: r.pexp, c: 'var(--chart-2)' },
        { l: 'PV maintenance expenses', v: r.maint, c: 'var(--chart-2)' },
        { l: 'Issue expense', v: r.issue, c: 'var(--chart-2)' },
        { l: 'PV profit', v: r.profit, c: r.profit < 0 ? 'var(--bad)' : 'var(--good)', strong: true }], { fmt: v => money(v), aria: 'Present value of premiums, benefits, expenses and profit', labelW: 230 })}
      <p class="tiny muted" style="margin:4px 0 0">A negative PV profit is drawn at its size; the label shows the sign.</p></div>`;
  },
  action(name, arg, st) {
    if (name === 'net') { const p = num(st.ans?.m5); if (!isFinite(p)) return false; st.ltG = String(p); return true; }
    if (name === 'clear') { st.ltG = ''; return true; }
    return false;
  },
};

const SDEF = { ltI: 5, ltM: 100, ltW: 0 };
const sval = (st, k) => { const x = num(st[k]); return isFinite(x) ? x : SDEF[k]; };

/** Sensitivity bench: interest rate, mortality level (improvement or shock) and an optional lapse rate. */
export const ltSens = {
  inputs(st) {
    const sl = (k, label, min, max, step) => `<label class="slider"><span class="sl-top"><span>${label}</span><output data-out="${k}">${sval(st, k)}%</output></span><input type="range" min="${min}" max="${max}" step="${step}" data-field="${k}" value="${sval(st, k)}" aria-label="${esc(label)}"></label>`;
    return `<div class="slider-grid">
      <div class="panel"><b class="small">Economic assumption</b>${sl('ltI', 'Interest rate', 1, 9, 0.25)}<p class="tiny muted" style="margin:6px 0 0">Case basis: 5%.</p></div>
      <div class="panel"><b class="small">Decrements</b>${sl('ltM', 'Mortality, % of the table', 50, 200, 5)}${sl('ltW', 'Lapse rate per year', 0, 15, 1)}<p class="tiny muted" style="margin:6px 0 0">Below 100% = mortality improvement; above = a shock or worse lives. Lapses happen at year-end with no cash value.</p></div></div>
      <div class="row" style="margin-top:8px"><button class="btn sm quiet" data-act="reset">Reset to the case basis</button></div>`;
  },
  outputs(st) {
    const i = sval(st, 'ltI') / 100, m = sval(st, 'ltM') / 100, w = sval(st, 'ltW') / 100;
    const r = price({ i, mult: m, lapse: w });
    const base = BASE;
    const kpi = (l, v, b, hero) => `<div class="kpi ${hero ? 'hero' : ''}"><div class="l">${l}</div><div class="v">${money(v, 2)}</div><div class="small muted">${spct(v / b - 1)} vs. case basis</div></div>`;
    const rates = []; for (let k = 1; k <= 9; k += 0.5) rates.push(k);
    const curve = mult => rates.map(k => price({ i: k / 100, mult, lapse: w }).G);
    const S0 = survival(POLICY.x, POLICY.n, 1), S1 = survival(POLICY.x, POLICY.n, m);
    return `<div class="kpis">
        <div class="kpi"><div class="l">A<sup>1</sup><sub>40:20⌉</sub> (per $1)</div><div class="v">${r.A.toFixed(5)}</div></div>
        <div class="kpi"><div class="l">ä<sub>40:20⌉</sub></div><div class="v">${r.a.toFixed(4)}</div></div>
        ${kpi('Net annual premium', r.P, base.P)}${kpi('Gross annual premium', r.G, base.G, true)}</div>
      <div class="panel" style="margin-top:12px"><div class="small muted">Gross premium by interest rate (x-axis, %), at 80%, 100% and 120% of table mortality and at your mortality setting (${fmt(m * 100)}%), all with a ${pct(w, 0)} lapse rate</div>
      ${lineChart([
        { v: curve(0.8), c: 'var(--chart-4)', label: '80%', w: 1.6, dot: false },
        { v: curve(1), c: 'var(--chart-muted)', label: '100%', w: 1.6, dot: false },
        { v: curve(1.2), c: 'var(--chart-3)', label: '120%', w: 1.6, dot: false },
        { v: curve(m), c: 'var(--chart-1)', label: 'Yours', w: 2.6, dash: true }], { x: rates.map(k => Number.isInteger(k) ? k + '%' : ''), yfmt: v => '$' + fmt(v), aria: 'Gross premium by interest rate for several mortality levels', h: 240 })}
      <div class="legend"><span><i style="background:var(--chart-4)"></i>80% of table</span><span><i style="background:var(--chart-muted)"></i>100%</span><span><i style="background:var(--chart-3)"></i>120%</span><span><i style="background:var(--chart-1)"></i>Your mortality setting (dashed)</span></div></div>
      <div class="panel" style="margin-top:12px"><div class="small muted">Survival curve <sub>t</sub>p<sub>40</sub> over the 20-year term: table vs. your mortality setting</div>
      ${lineChart([{ v: S0, c: 'var(--chart-muted)', label: 'Table', w: 1.8 }, { v: S1, c: 'var(--chart-1)', label: 'Yours', w: 2.4, dash: true }], { x: S0.map((_, t) => t % 5 === 0 ? 't=' + t : ''), yfmt: v => pct(v, 0), aria: 'Survival probability by policy year, table versus adjusted mortality', h: 220 })}
      <p class="cap">${pct(S1[POLICY.n], 1)} of 40-year-olds survive the full 20 years at your setting (table: ${pct(S0[POLICY.n], 1)}).${w > 0 ? ` With lapses, only ${pct(r.npx, 1)} of policies are still in force at the end.` : ''}</p></div>`;
  },
  action(name, arg, st) { if (name !== 'reset') return false; Object.assign(st, Object.fromEntries(Object.entries(SDEF).map(([k, v]) => [k, String(v)]))); return true; },
};
