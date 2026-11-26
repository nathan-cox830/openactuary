// Benches for "Promises to Keep" (retirement / Exam FM level).
//   pnSens: assumption sensitivity (discount rate, salary scale, mortality) on the full valuation.
//   pnSim:  20-year funded-ratio simulation for a chosen contribution (used in the Debrief).
import { esc, pct, spct, num, money, fmt } from '../../util.js';
import { lineChart, barChart } from '../../ui/charts.js';
import { PLAN, BASE, valuation, simulate, SIM } from '../lib/pension.js';

const m2 = x => (x < 0 ? '−$' : '$') + fmt(Math.abs(x) / 1e6, 2) + 'M';
const slider = (st, k, label, min, max, step, def) => {
  const x = num(st[k]); const v = isFinite(x) ? x : def;
  return `<label class="slider"><span class="sl-top"><span>${esc(label)}</span><output data-out="${k}">${v}%</output></span><input type="range" min="${min}" max="${max}" step="${step}" data-field="${k}" value="${v}" aria-label="${esc(label)}"></label>`;
};

/* ---------------- pnSens ---------------- */
const SENS_DEF = { pnRate: 7, pnSal: 3.5, pnMort: 100 };
const sensVal = (st, k) => { const x = num(st[k]); return isFinite(x) ? x : SENS_DEF[k]; };
const sensOpts = st => ({ i: sensVal(st, 'pnRate') / 100, s: sensVal(st, 'pnSal') / 100, mort: sensVal(st, 'pnMort') / 100 });

export const pnSens = {
  inputs(st) {
    return `<div class="slider-grid">
      <div class="panel"><b class="small">Economic assumptions</b>${slider(st, 'pnRate', 'Discount rate (expected return)', 3, 9, 0.25, 7)}${slider(st, 'pnSal', 'Salary scale (annual raises)', 2, 5.5, 0.25, 3.5)}</div>
      <div class="panel"><b class="small">Longevity</b>${slider(st, 'pnMort', 'Mortality rates, as % of the base table', 60, 120, 5, 100)}<p class="tiny muted" style="margin:6px 0 0">Below 100% means people live longer than the base table assumes (mortality improvement). 80% is roughly what a decade or two of improvement does.</p></div></div>
      <div class="row" style="margin-top:8px"><button class="btn sm quiet" data-act="reset">Reset to the board's assumptions</button></div>`;
  },
  outputs(st) {
    const o = sensOpts(st), v = valuation(o), b = BASE;
    const d = (x, y) => `<div class="tiny muted">${spct(x / y - 1)} vs base</div>`;
    const rates = [3, 4, 5, 6, 7, 8, 9];
    const curve = rates.map(r => valuation({ ...o, i: r / 100 }).AL / 1e6), baseCurve = rates.map(r => valuation({ i: r / 100 }).AL / 1e6);
    return `<div class="kpis">
        <div class="kpi hero"><div class="l">Actuarial liability</div><div class="v">${m2(v.AL)}</div>${d(v.AL, b.AL)}</div>
        <div class="kpi"><div class="l">Normal cost</div><div class="v">${m2(v.nc)}</div>${d(v.nc, b.nc)}</div>
        <div class="kpi"><div class="l">Funded ratio</div><div class="v">${pct(v.fr)}</div><div class="tiny muted">base ${pct(b.fr)}</div></div>
        <div class="kpi"><div class="l">Contribution (NC + amortization)</div><div class="v">${m2(v.contrib)}</div>${d(v.contrib, b.contrib)}</div></div>
      <div class="panel" style="margin-top:12px"><div class="small muted">Actuarial liability ($M) at discount rates from 3% to 9%</div>
        ${lineChart([{ v: baseCurve, c: 'var(--chart-muted)', label: 'Base salary & mortality', dash: true, w: 1.6 }, { v: curve, c: 'var(--chart-1)', label: 'Your assumptions', w: 2.6 }], { x: rates.map(r => r + '%'), yfmt: x => '$' + Math.round(x) + 'M', aria: 'Actuarial liability by discount rate', h: 240 })}
        <div class="legend"><span><i style="background:var(--chart-1)"></i>Your salary scale and mortality</span><span><i style="background:var(--chart-muted)"></i>Board's base assumptions (dashed)</span></div></div>
      <p class="small muted" style="margin:10px 0 0">Liability ${m2(v.AL)} against assets of ${m2(PLAN.assets)}: unfunded liability ${m2(v.ual)}, paid off over ${PLAN.amort} years at ${m2(v.pay)} a year.</p>`;
  },
  action(name, arg, st) { if (name !== 'reset') return false; Object.assign(st, Object.fromEntries(Object.entries(SENS_DEF).map(([k, x]) => [k, String(x)]))); return true; },
};

/* ---------------- pnSim (Debrief) ---------------- */
const SIM_DEF = { simMu: 7, simSd: 12 };
const simVal = (st, k) => { const x = num(st[k]); return isFinite(x) ? x : SIM_DEF[k]; };
const simContrib = st => { const c = num(st.simC); if (isFinite(c) && c >= 0) return c; const p = num(st.pick); return isFinite(p) && p >= 0 ? p : BASE.contrib; };

export const pnSim = {
  inputs(st) {
    return `<div class="slider-grid">
      <div class="panel"><b class="small">Contribution policy</b><label class="field" style="margin-top:10px">First-year contribution ($) <input class="f" type="text" inputmode="decimal" data-field="simC" value="${esc(st.simC ?? (st.pick ?? ''))}" placeholder="${Math.round(BASE.contrib)}" aria-label="First-year contribution in dollars"></label>
        <p class="tiny muted" style="margin:6px 0 0">Each year the city pays that year's normal cost plus a level extra amount equal to (this − ${money(BASE.nc)}).</p></div>
      <div class="panel"><b class="small">Investment returns</b>${slider(st, 'simMu', 'Average annual return', 3, 9, 0.25, 7)}${slider(st, 'simSd', 'Volatility (standard deviation)', 0, 20, 1, 12)}</div></div>
      <div class="row" style="margin-top:8px"><button class="btn sm quiet" data-act="simreset">Reset</button><button class="btn sm ghost" data-act="simmodel">Try the model contribution</button></div>`;
  },
  outputs(st) {
    const c = simContrib(st), mu = simVal(st, 'simMu') / 100, sd = simVal(st, 'simSd') / 100;
    const me = simulate(c, { mu, sd }), mod = simulate(BASE.contrib, { mu, sd });
    const yrs = Array.from({ length: SIM.years + 1 }, (_, t) => t % 5 === 0 ? String(2027 + t) : '');
    return `<div class="kpis">
        <div class="kpi hero"><div class="l">Median funded ratio in 2047</div><div class="v">${pct(me.fin.p50, 0)}</div><div class="tiny muted">model contribution: ${pct(mod.fin.p50, 0)}</div></div>
        <div class="kpi"><div class="l">Bad case (5th percentile)</div><div class="v">${pct(me.fin.p5, 0)}</div><div class="tiny muted">model: ${pct(mod.fin.p5, 0)}</div></div>
        <div class="kpi"><div class="l">Chance funded ratio is below 60%</div><div class="v">${pct(me.below60, 0)}</div><div class="tiny muted">model: ${pct(mod.below60, 0)}</div></div>
        <div class="kpi"><div class="l">Chance fully funded (100%+)</div><div class="v">${pct(me.above100, 0)}</div><div class="tiny muted">model: ${pct(mod.above100, 0)}</div></div></div>
      <div class="panel" style="margin-top:12px"><div class="small muted">Funded ratio over 20 years, ${fmt(SIM.n)} simulated return paths (same paths for both policies)</div>
        ${lineChart([
          { v: me.p90, c: 'var(--chart-1)', w: 1.2, dash: true, dot: false }, { v: me.p10, c: 'var(--chart-1)', w: 1.2, dash: true, dot: false },
          { v: mod.p50, c: 'var(--chart-4)', w: 2, label: 'Model median', dash: true },
          { v: me.p50, c: 'var(--chart-1)', w: 2.8, label: 'Your median' }],
          { x: yrs, yfmt: x => Math.round(x * 100) + '%', min: 0, aria: 'Funded ratio paths: median and 10th to 90th percentile', h: 260 })}
        <div class="legend"><span><i style="background:var(--chart-1)"></i>Your contribution: median (solid), 10th and 90th percentiles (dashed)</span><span><i style="background:var(--chart-4)"></i>Model contribution (${m2(BASE.contrib)}): median</span></div></div>
      <div class="panel" style="margin-top:12px"><div class="small muted">Funded ratio in 2047, your contribution (${m2(c)})</div>
        ${barChart([['95th percentile', me.fin.p95], ['75th', me.fin.p75], ['Median', me.fin.p50], ['25th', me.fin.p25], ['5th percentile', me.fin.p5]].map(([l, v], k) => ({ l, v, c: k === 2 ? 'var(--chart-1)' : 'var(--chart-muted)', strong: k === 2 })), { fmt: v => pct(v, 0), aria: 'Distribution of the funded ratio after 20 years', labelW: 150 })}</div>`;
  },
  action(name, arg, st) {
    if (name === 'simreset') { Object.assign(st, { simMu: '7', simSd: '12' }); delete st.simC; return true; }
    if (name === 'simmodel') { st.simC = String(Math.round(BASE.contrib)); return true; }
    return false;
  },
};
