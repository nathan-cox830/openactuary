// Benches for Trend Watch (group medical renewal).
import { esc, fmt, pct, spct, num, money } from '../../util.js';
import { lineChart, barChart } from '../../ui/charts.js';
import { CATS, CAT_NAMES, CAT_COLORS, TKEY, BOOK, FIT, PMPM, PMPM_TOT, TREND_MONTHS, ASSUME, MODEL_T, bookPmpm, renewal, buildUp } from '../lib/health.js';

const inp = (k, st, label) => `<input class="f" type="text" inputmode="decimal" data-field="${k}" value="${esc(st[k] ?? '')}" aria-label="${esc(label)}" style="max-width:110px">`;
const allTrends = st => CATS.every(k => isFinite(num(st[TKEY[k]])));

/** Select an annual trend by category, with the book-of-business fits and a projection chart. */
export const hlTrend = {
  inputs(st) {
    return `<div class="tblwrap"><table><thead><tr><th>Category</th><th>Utilization trend (fit)</th><th>Unit cost trend (fit)</th><th>Your selected annual trend (%)</th></tr></thead><tbody>
      ${CATS.map(k => `<tr><td>${CAT_NAMES[k]}</td><td class="num">${pct(FIT[k].u, 2)}</td><td class="num">${pct(FIT[k].c, 2)}</td><td>${inp(TKEY[k], st, CAT_NAMES[k] + ' selected annual trend, percent')}</td></tr>`).join('')}
      </tbody></table></div>
      <p class="cap">Fits are exponential least-squares fits (Excel LOGEST) to Exhibit 3, 2021–2025. A category's cost trend comes from both pieces: more services and pricier services.</p>`;
  },
  outputs(st) {
    const yrs = BOOK.years.concat([2026, 2027]);
    const series = [];
    CATS.forEach(k => {
      const b = bookPmpm(k), t = num(st[TKEY[k]]) / 100;
      series.push({ v: b.concat([null, null]), c: CAT_COLORS[k], w: 2.4, dot: false });
      if (isFinite(t)) series.push({ v: [null, null, null, null, b[4], b[4] * (1 + t), b[4] * (1 + t) ** 2], c: CAT_COLORS[k], w: 2, dash: true });
    });
    let h = `<div class="panel"><div class="small muted" style="margin-bottom:4px">Book-of-business allowed PMPM by category, 2021–2025, with your trends projected to 2027 (dashed)</div>
      ${lineChart(series, { x: yrs.map(String), yfmt: v => '$' + fmt(v), aria: 'Book of business PMPM by category with projections at the selected trends' })}
      <div class="legend">${CATS.map(k => `<span><i style="background:${CAT_COLORS[k]}"></i>${CAT_NAMES[k]}</span>`).join('')}<span>Dashed: projected at your trend</span></div></div>`;
    if (!allTrends(st)) return h + `<p class="small muted" style="margin:10px 0 0">Enter all four trends to see the composite trend for this group.</p>`;
    const c = renewal(st);
    h += `<div class="kpis" style="margin-top:12px">
      <div class="kpi"><div class="l">Composite annual trend (weighted by this group's claim mix)</div><div class="v">${pct(c.compAnnual, 2)}</div></div>
      <div class="kpi hero"><div class="l">Composite trend factor over ${TREND_MONTHS} months</div><div class="v">${c.comp.toFixed(4)}</div></div></div>
      <div class="tblwrap" style="margin-top:12px"><table><thead><tr><th>Category</th><th>Experience PMPM</th><th>Trend factor (${TREND_MONTHS} mo)</th><th>Trended PMPM</th></tr></thead><tbody>
      ${CATS.map(k => `<tr><td>${CAT_NAMES[k]}</td><td class="num">${money(PMPM[k], 2)}</td><td class="num">${c.tf[k].toFixed(4)}</td><td class="num">${money(c.trended[k], 2)}</td></tr>`).join('')}
      <tr class="total"><td>Total (before pooling)</td><td class="num">${money(PMPM_TOT, 2)}</td><td class="num">${c.comp.toFixed(4)}</td><td class="num">${money(PMPM_TOT * c.comp, 2)}</td></tr></tbody></table></div>
      <p class="cap">The trend factors here use the ${TREND_MONTHS}-month trend period you will derive in the next task.</p>`;
    return h;
  },
};

const DEF = { shift: '0', pool: 175000, nFull: 60000 };
const sval = (st, k) => { const v = num((st.hs || {})[k]); return isFinite(v) ? v : DEF[k]; };
const baseTrends = st => allTrends(st) ? st : MODEL_T;
const seg = (act, cur, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="${act}" data-arg="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;

/** Stress-test the renewal: trend shift, pooling point and credibility standard. */
export const hlStress = {
  inputs(st) {
    const sh = sval(st, 'shift');
    return `<div class="slider-grid">
      <div class="panel"><b class="small">Trend: add to every category</b>
        <label class="slider"><span class="sl-top"><span>Trend shift (percentage points)</span><output>${sh}%</output></span><input type="range" min="-3" max="3" step="0.5" data-field="hs.shift" value="${sh}" aria-label="Trend shift in percentage points"></label>
        <p class="tiny muted" style="margin:6px 0 0">Starts from ${allTrends(st) ? 'your selected trends' : 'the model trends (select yours in the trend task)'}.</p></div>
      <div class="panel"><b class="small">Pooling point (charge PMPM, 2027)</b><div style="margin-top:8px">${seg('pool', sval(st, 'pool'), ASSUME.poolOptions.map(([p, c]) => [p, p ? '$' + p / 1000 + 'k ($' + c.toFixed(2) + ')' : 'None']))}</div>
        <b class="small" style="display:block;margin-top:12px">Full credibility at (member months)</b><div style="margin-top:8px">${seg('nfull', sval(st, 'nFull'), [[24000, '24,000'], [60000, '60,000'], [120000, '120,000']])}</div></div></div>
      <div class="row" style="margin-top:8px"><button class="btn sm quiet" data-act="reset">Reset to the case values</button></div>`;
  },
  outputs(st) {
    const o = { shift: sval(st, 'shift'), pool: sval(st, 'pool'), nFull: sval(st, 'nFull') };
    const base = renewal(baseTrends(st)), c = renewal(baseTrends(st), o);
    return `<div class="kpis">
      <div class="kpi"><div class="l">Projected experience PMPM</div><div class="v">${money(c.proj, 2)}</div></div>
      <div class="kpi"><div class="l">Credibility Z</div><div class="v">${c.z.toFixed(3)}</div></div>
      <div class="kpi"><div class="l">ACA-style MLR</div><div class="v">${pct(c.mlr)}</div></div>
      <div class="kpi hero"><div class="l">Indicated rate change</div><div class="v">${spct(c.change)}</div></div></div>
      <p class="small muted" style="margin:8px 0 0">Case assumptions give ${spct(base.change)}. This scenario moves the indication by ${spct(c.change - base.change)} (percentage points).</p>
      <div class="panel" style="margin-top:12px"><div class="small muted" style="margin-bottom:4px">Rate build-up, $ PMPM</div>${barChart(buildUp(c), { fmt: v => money(v, 0), aria: 'Renewal rate build-up in dollars per member per month', labelW: 250 })}</div>`;
  },
  action(name, arg, st) {
    st.hs = st.hs || {};
    if (name === 'pool') { st.hs.pool = String(+arg); return true; }
    if (name === 'nfull') { st.hs.nFull = String(+arg); return true; }
    if (name === 'reset') { st.hs = { shift: '0', pool: '175000', nFull: '60000' }; return true; }
    return false;
  },
};
