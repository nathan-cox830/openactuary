// Benches (interactive calculators) for The Stale Triangle.
// A bench is { inputs(st) -> html, outputs(st) -> html, action?(name, arg, st) -> bool }.
// Inputs bind with data-field="key" (or "sel.3" for array items); the engine stores values and
// re-renders outputs on every keystroke.
import { esc, fmt, pct, num, sum } from '../../util.js';
import { barChart } from '../../ui/charts.js';
import { AGES, N, rowFactors, avgFactors } from '../lib/reserving.js';
import { R, R_CL_ALL, R_CARRIED, rCalc, rBf } from '../lib/datasets.js';

const m = x => '$' + fmt(x / 1000, 1) + 'M';

export const rsel = {
  inputs(st) {
    const rf = rowFactors(R.tri), all = avgFactors(R.tri), l3 = avgFactors(R.tri, 3), l5 = avgFactors(R.tri, 5);
    const hdr = AGES.slice(0, 9).map((a, j) => `<th>${a}–${AGES[j + 1]}</th>`).join('');
    let h = `<div class="tblwrap"><table><thead><tr><th>AY</th>${hdr}<th>Tail</th></tr></thead><tbody>`;
    rf.forEach((r, i) => { if (i === 9) return; h += `<tr><td>${R.ays[i]}</td>${r.map(v => v == null ? '<td class="na">·</td>' : `<td class="num ${v < 1 ? 'neg' : ''}">${v.toFixed(3)}</td>`).join('')}<td></td></tr>`; });
    const row = (l, a) => `<tr class="avg"><td>${l}</td>${a.map(v => `<td class="num">${v == null ? '—' : v.toFixed(3)}</td>`).join('')}<td></td></tr>`;
    h += row('Vol-wtd all', all.vw) + row('Simple all', all.sa) + row('Vol-wtd latest 5', l5.vw) + row('Vol-wtd latest 3', l3.vw) + row('Simple latest 3', l3.sa);
    h += `<tr class="sel"><td><b>Selected</b></td>${AGES.slice(0, 9).map((_, j) => `<td><input class="f" type="text" inputmode="decimal" data-field="sel.${j}" value="${esc(st.sel?.[j] ?? '')}" aria-label="Selected factor ${AGES[j]}-${AGES[j + 1]} months"></td>`).join('')}<td><input class="f" type="text" inputmode="decimal" data-field="tail" value="${esc(st.tail ?? '')}" aria-label="Tail factor"></td></tr>`;
    h += `</tbody></table></div><div class="row small" style="margin-top:10px"><span class="muted">Fill selections with:</span><button class="btn sm ghost" data-act="fill" data-arg="vw">Vol-wtd all</button><button class="btn sm ghost" data-act="fill" data-arg="l3">Vol-wtd latest 3</button><button class="btn sm quiet" data-act="fill" data-arg="clear">Clear</button></div>`;
    return h;
  },
  outputs(st) {
    const c = rCalc(st); if (!c) return `<p class="small muted">Enter all nine factors and a tail to see projected ultimates.</p>`;
    let h = `<div class="tblwrap"><table><thead><tr><th>AY</th><th>Age</th><th>Reported</th><th>CDF to ult</th><th>Ultimate</th><th>IBNR</th><th>Ult. loss ratio</th></tr></thead><tbody>`;
    c.latest.forEach((l, i) => { h += `<tr><td>${R.ays[i]}</td><td class="num">${AGES[N - 1 - i]}</td><td class="num">${fmt(l)}</td><td class="num">${c.cdf[i].toFixed(3)}</td><td class="num">${fmt(c.ult[i])}</td><td class="num">${fmt(c.ult[i] - l)}</td><td class="num">${pct(c.ult[i] / R.ep[i])}</td></tr>`; });
    const ib = sum(c.ult) - c.sumLatest;
    h += `<tr class="total"><td>Total</td><td></td><td class="num">${fmt(c.sumLatest)}</td><td></td><td class="num">${fmt(sum(c.ult))}</td><td class="num">${fmt(ib)}</td><td></td></tr></tbody></table></div>
    <div class="kpis" style="margin-top:12px"><div class="kpi hero"><div class="l">Your chain ladder IBNR</div><div class="v">${m(ib)}</div></div><div class="kpi"><div class="l">CFO's chain ladder</div><div class="v">${m(R_CL_ALL)}</div></div><div class="kpi"><div class="l">Currently carried</div><div class="v">${m(R_CARRIED)}</div></div></div>
    <div class="panel" style="margin-top:12px">${barChart([
      { l: 'CFO: chain ladder', v: R_CL_ALL, c: 'var(--chart-muted)' },
      { l: 'Your chain ladder', v: ib, c: 'var(--chart-1)', strong: true },
      { l: 'Carried by management', v: R_CARRIED, c: 'var(--chart-2)' }], { fmt: m, aria: 'IBNR comparison' })}</div>`;
    return h;
  },
  action(name, arg, st) {
    if (name !== 'fill') return false;
    const a = arg === 'vw' ? avgFactors(R.tri).vw : arg === 'l3' ? avgFactors(R.tri, 3).vw : null;
    st.sel = a ? a.map(x => x.toFixed(3)) : []; if (!a) st.tail = '';
    return true;
  },
};

export const rbf = {
  inputs(st) { return `<div class="row"><label class="field">A priori ELR (%) <input class="f" type="text" inputmode="decimal" data-field="elr" value="${esc(st.elr ?? '')}"></label></div>`; },
  outputs(st) {
    const c = rCalc(st); if (!c) return `<p class="small muted">Complete the factor selection task first.</p>`;
    const e = num(st.elr) / 100; const ok = isFinite(e);
    let h = `<div class="tblwrap"><table><thead><tr><th>AY</th><th>EP</th><th>Reported</th><th>% unreported (1−1/CDF)</th><th>CL ult LR</th><th>BF IBNR</th><th>Cape Cod IBNR</th></tr></thead><tbody>`;
    c.latest.forEach((l, i) => { const u = 1 - 1 / c.cdf[i]; h += `<tr><td>${R.ays[i]}</td><td class="num">${fmt(R.ep[i])}</td><td class="num">${fmt(l)}</td><td class="num">${pct(u)}</td><td class="num">${pct(c.ult[i] / R.ep[i])}</td><td class="num">${ok ? fmt(R.ep[i] * e * u) : '—'}</td><td class="num">${fmt(R.ep[i] * c.ccElr * u)}</td></tr>`; });
    h += `<tr class="total"><td>Total</td><td class="num">${fmt(sum(R.ep))}</td><td class="num">${fmt(c.sumLatest)}</td><td></td><td></td><td class="num">${ok ? fmt(rBf(c, e)) : '—'}</td><td class="num">${fmt(rBf(c, c.ccElr))}</td></tr></tbody></table></div>
    <div class="kpis" style="margin-top:12px"><div class="kpi"><div class="l">Chain ladder (yours)</div><div class="v">${m(sum(c.ult) - c.sumLatest)}</div></div><div class="kpi hero"><div class="l">BF @ ${ok ? pct(e) : '—'}</div><div class="v">${ok ? m(rBf(c, e)) : '—'}</div></div><div class="kpi"><div class="l">Cape Cod (ELR ${pct(c.ccElr)})</div><div class="v">${m(rBf(c, c.ccElr))}</div></div></div>`;
    return h;
  },
};
