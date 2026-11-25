// Benches for Should We File?
import { esc, fmt, pct, spct, num } from '../../util.js';
import { barChart } from '../../ui/charts.js';
import { avgFactors } from '../lib/reserving.js';
import { P_AYS, EXP, pSel } from '../lib/pricing.js';
import { P, pCalcSt } from '../lib/datasets.js';

const inp = (k, st, label) => `<input class="f" type="text" inputmode="decimal" data-field="${k}" value="${esc(st[k] ?? '')}" aria-label="${esc(label)}">`;

export const pdev = {
  inputs(st) {
    const a = avgFactors(P.tri), l3 = avgFactors(P.tri, 3);
    const tailVW = a.vw.slice(2).reduce((x, y) => x * y, 1), tailL3 = l3.vw.slice(2).reduce((x, y) => x * y, 1);
    return `<div class="tblwrap"><table><thead><tr><th></th><th>12–24</th><th>24–36</th><th>36–ult</th></tr></thead><tbody>
      <tr class="avg"><td>Vol-wtd all years</td><td class="num">${a.vw[0].toFixed(3)}</td><td class="num">${a.vw[1].toFixed(3)}</td><td class="num">${tailVW.toFixed(3)}</td></tr>
      <tr class="avg"><td>Vol-wtd latest 3</td><td class="num">${l3.vw[0].toFixed(3)}</td><td class="num">${l3.vw[1].toFixed(3)}</td><td class="num">${tailL3.toFixed(3)}</td></tr>
      <tr class="sel"><td><b>Selected</b></td><td>${inp('f12', st, '12 to 24 factor')}</td><td>${inp('f24', st, '24 to 36 factor')}</td><td>${inp('f36', st, '36 to ultimate factor')}</td></tr></tbody></table></div>
      <p class="cap">36–ult is the product of the 36–48 through 108–120 factors (no tail assumed beyond 120 months).</p>`;
  },
  outputs(st) {
    const { f12, f24, f36 } = pSel(st); if (![f12, f24, f36].every(isFinite)) return '';
    const c = pCalcSt(st);
    return `<div class="tblwrap"><table><thead><tr><th>AY</th><th>Reported</th><th>CDF</th><th>Ultimate</th><th>Ult. loss ratio (not on-level)</th></tr></thead><tbody>${P_AYS.map((y, k) => `<tr><td>${y}</td><td class="num">${fmt(c.lat[k])}</td><td class="num">${c.cdf[k].toFixed(3)}</td><td class="num">${fmt(c.ult[k])}</td><td class="num">${pct(c.ult[k] / c.ep[k])}</td></tr>`).join('')}</tbody></table></div>`;
  },
};

export const ptrend = {
  inputs(st) { return `<div class="row"><label class="field">Frequency trend (%/yr) ${inp('freqT', st, 'Frequency trend')}</label><label class="field">Severity trend (%/yr) ${inp('sevT', st, 'Severity trend')}</label></div>`; },
  outputs(st) {
    const a = num(st.freqT), s = num(st.sevT);
    return (isFinite(a) && isFinite(s)) ? `<div class="kpis"><div class="kpi hero"><div class="l">Pure premium trend</div><div class="v">${pct((1 + a / 100) * (1 + s / 100) - 1, 2)}<span class="small muted"> / yr</span></div></div></div>` : '';
  },
};

export const pind = {
  inputs(st) { return `<div class="row">${[['w95', 'AY 1995'], ['w96', 'AY 1996'], ['w97', 'AY 1997']].map(([k, l]) => `<label class="field">${l} weight (%) ${inp(k, st, l + ' weight')}</label>`).join('')}</div>`; },
  outputs(st) {
    const c = pCalcSt(st);
    const cell = (v, f) => isFinite(v) ? f(v) : '—';
    const plr = 1 - EXP.V - EXP.Q - EXP.F;
    return `<div class="tblwrap"><table><thead><tr><th>AY</th><th>Ultimate loss & DCC</th><th>Trend factor</th><th>× ULAE</th><th>Earned premium</th><th>OLF</th><th>On-level premium</th><th>Projected loss & LAE ratio</th></tr></thead><tbody>
    ${P_AYS.map((y, k) => `<tr><td>${y}</td><td class="num">${cell(c.ult[k], fmt)}</td><td class="num">${cell(Math.pow(1 + c.tr, c.tl[k]), v => v.toFixed(4))}</td><td class="num">${EXP.ULAE.toFixed(3)}</td><td class="num">${fmt(c.ep[k])}</td><td class="num">${cell(c.olf[k], v => v.toFixed(4))}</td><td class="num">${cell(c.ep[k] * c.olf[k], fmt)}</td><td class="num">${cell(c.lr[k], pct)}</td></tr>`).join('')}
    <tr class="total"><td>Weighted</td><td colspan="6"></td><td class="num">${cell(c.wlr, pct)}</td></tr></tbody></table></div>
    <div class="kpis" style="margin-top:12px"><div class="kpi"><div class="l">Projected loss & LAE ratio</div><div class="v">${cell(c.wlr, pct)}</div></div><div class="kpi"><div class="l">Fixed expense ratio</div><div class="v">${pct(EXP.F)}</div></div><div class="kpi"><div class="l">1 − V − Q</div><div class="v">${pct(1 - EXP.V - EXP.Q)}</div></div><div class="kpi hero"><div class="l">Indicated change</div><div class="v">${isFinite(c.ind) ? spct(c.ind) : '—'}</div></div></div>
    ${c.lr.every(isFinite) ? `<div class="panel" style="margin-top:12px"><div class="small muted" style="margin-bottom:4px">Projected loss & LAE ratio by year vs. the ${pct(plr, 0)} the current rate can afford after all expenses and profit</div>${barChart([
      ...P_AYS.map((y, k) => ({ l: 'AY ' + y, v: c.lr[k], c: c.lr[k] > plr ? 'var(--chart-3)' : 'var(--chart-1)' })),
      { l: 'Affordable at current rates', v: plr, c: 'var(--chart-muted)', strong: true }], { fmt: v => pct(v), aria: 'Projected loss ratios versus permissible' })}</div>` : ''}`;
  },
};
