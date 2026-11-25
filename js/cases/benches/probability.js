// Benches for Who's a Risky Driver? (Exam P level).
import { esc, pct, spct, num } from '../../util.js';
import { barChart } from '../../ui/charts.js';
import { CLASSES, BASE, analyze } from '../lib/driver.js';

const KEYS = ['jL', 'jM', 'jH'];
const COLORS = ['var(--chart-4)', 'var(--chart-2)', 'var(--chart-3)'];

/** Probability tree drawn from the case model; accident leaves show the learner's entries. */
function treeSvg(st) {
  const W = 640, H = 330, rx = 34, cx = 230, lx = 470, cy = [62, 165, 268];
  let g = `<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--line-strong)"/></marker></defs>`;
  g += `<circle cx="${rx}" cy="165" r="16" fill="var(--surface-2)" stroke="var(--line-strong)"/><text x="${rx}" y="169" text-anchor="middle" style="fill:var(--ink);font-weight:700">All</text>`;
  CLASSES.forEach((c, i) => {
    const y = cy[i];
    g += `<path d="M${rx + 16},165 C${rx + 90},165 ${cx - 90},${y} ${cx - 44},${y}" fill="none" stroke="var(--line-strong)" stroke-width="1.6"/>`;
    g += `<text x="${(rx + cx) / 2 - 6}" y="${(165 + y) / 2 - 6}" text-anchor="middle" style="fill:var(--ink-2);font-family:var(--font-mono);font-weight:600">${BASE.prior[i].toFixed(2)}</text>`;
    g += `<rect x="${cx - 44}" y="${y - 16}" width="88" height="32" rx="9" fill="var(--surface)" stroke="${COLORS[i]}" stroke-width="2"/><text x="${cx}" y="${y + 5}" text-anchor="middle" style="fill:var(--ink);font-weight:700;font-size:12.5px">${c}</text>`;
    [[-30, 'Accident', BASE.p[i], true], [30, 'No accident', 1 - BASE.p[i], false]].forEach(([dy, lab, pr, isAcc]) => {
      const ly = y + dy;
      g += `<path d="M${cx + 44},${y} C${cx + 110},${y} ${lx - 120},${ly} ${lx - 64},${ly}" fill="none" stroke="${isAcc ? COLORS[i] : 'var(--line-strong)'}" stroke-width="${isAcc ? 2 : 1.4}" ${isAcc ? '' : 'stroke-dasharray="4 4"'}/>`;
      g += `<text x="${cx + 92}" y="${(y + ly) / 2 + (dy < 0 ? -4 : 12)}" text-anchor="middle" style="fill:var(--muted);font-family:var(--font-mono);font-size:11px">${pr.toFixed(2)}</text>`;
      const v = isAcc ? num(st[KEYS[i]]) : null;
      const shown = isAcc ? (isFinite(v) ? v.toFixed(4) : '?') : (BASE.prior[i] * (1 - BASE.p[i])).toFixed(4);
      g += `<text x="${lx - 58}" y="${ly + 4}" style="fill:var(--ink-2);font-size:12px">${lab}</text>`;
      g += `<rect x="${lx + 30}" y="${ly - 13}" width="92" height="26" rx="7" fill="${isAcc ? 'var(--accent-soft)' : 'var(--surface-2)'}" stroke="${isAcc ? 'var(--accent-strong)' : 'var(--line)'}"/>`;
      g += `<text x="${lx + 76}" y="${ly + 5}" text-anchor="middle" style="fill:var(--ink);font-family:var(--font-mono);font-weight:${isAcc ? 700 : 500};font-size:12.5px">${shown}</text>`;
    });
  });
  g += `<text x="${lx + 76}" y="16" text-anchor="middle" style="fill:var(--muted);font-size:11px;letter-spacing:.06em">JOINT PROBABILITY</text>`;
  return `<svg class="chart tree" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Probability tree: risk class, then accident or no accident">${g}</svg>`;
}

export const ptree = {
  inputs(st) {
    return `<div class="row">${CLASSES.map((c, i) => `<label class="field">P(${c} ∩ Accident) <input class="f" type="text" inputmode="decimal" data-field="${KEYS[i]}" value="${esc(st[KEYS[i]] ?? '')}" aria-label="Joint probability ${c} and accident"></label>`).join('')}</div>`;
  },
  outputs(st) {
    const v = KEYS.map(k => num(st[k]));
    let h = `<div class="panel tree-panel">${treeSvg(st)}</div>`;
    if (v.every(isFinite)) {
      const tot = v.reduce((a, b) => a + b, 0);
      h += `<div class="kpis" style="margin-top:12px"><div class="kpi"><div class="l">Sum of your accident branches = P(Accident)</div><div class="v">${tot.toFixed(4)}</div></div>
        ${tot > 0 ? CLASSES.map((c, i) => `<div class="kpi ${i === 2 ? 'hero' : ''}"><div class="l">Your P(${c} | Accident)</div><div class="v">${pct(v[i] / tot)}</div></div>`).join('') : ''}</div>`;
    } else h += `<p class="small muted" style="margin:10px 0 0">Fill in all three accident branches to see P(Accident) and the posterior mix.</p>`;
    return h;
  },
};

const DEF = { mixM: 30, mixH: 10, pL: 5, pM: 10, pH: 25 };
const val = (st, k) => { const x = num(st[k]); return isFinite(x) ? x : DEF[k]; };
function mixModel(st) {
  const M = val(st, 'mixM'), Hh = val(st, 'mixH'), L = 100 - M - Hh;
  return { ok: L >= 0, m: { prior: [L / 100, M / 100, Hh / 100], p: [val(st, 'pL') / 100, val(st, 'pM') / 100, val(st, 'pH') / 100], cost: BASE.cost } };
}

export const pmix = {
  inputs(st) {
    const sl = (k, label, min, max, step = 1) => `<label class="slider"><span class="sl-top"><span>${label}</span><output data-out="${k}">${val(st, k)}%</output></span><input type="range" min="${min}" max="${max}" step="${step}" data-field="${k}" value="${val(st, k)}" aria-label="${esc(label)}"></label>`;
    return `<div class="slider-grid">
      <div class="panel"><b class="small">Who is in the book?</b>${sl('mixM', 'Medium-risk share', 0, 70)}${sl('mixH', 'High-risk share', 0, 40)}<p class="tiny muted" style="margin:6px 0 0">Low-risk share is whatever is left.</p></div>
      <div class="panel"><b class="small">Annual accident probability by class</b>${sl('pL', 'Low', 1, 20)}${sl('pM', 'Medium', 1, 30)}${sl('pH', 'High', 1, 50)}</div></div>
      <div class="row" style="margin-top:8px"><button class="btn sm quiet" data-act="reset">Reset to the case values</button></div>`;
  },
  outputs(st) {
    const { ok, m } = mixModel(st);
    if (!ok) return `<div class="fb no"><div>The medium and high shares add to more than 100%. Lower one of them.</div></div>`;
    const a = analyze(m);
    return `<div class="kpis"><div class="kpi"><div class="l">Low-risk share</div><div class="v">${pct(m.prior[0], 0)}</div></div><div class="kpi"><div class="l">P(Accident)</div><div class="v">${pct(a.pA)}</div></div><div class="kpi"><div class="l">P(High | Accident)</div><div class="v">${pct(a.post[2])}</div></div><div class="kpi hero"><div class="l">Indicated accident surcharge</div><div class="v">${spct(a.surcharge, 0)}</div></div></div>
      <div class="panel" style="margin-top:12px"><div class="small muted">Share of drivers in each class: everyone vs. drivers who just had an accident</div>${barChart(
        CLASSES.flatMap((c, i) => [{ l: `${c}: all drivers`, v: m.prior[i], c: 'var(--chart-muted)' }, { l: `${c}: after an accident`, v: a.post[i], c: COLORS[i], strong: true }]),
        { fmt: v => pct(v, 1), aria: 'Prior versus posterior class mix' })}</div>`;
  },
  action(name, arg, st) { if (name !== 'reset') return false; Object.assign(st, Object.fromEntries(Object.entries(DEF).map(([k, v]) => [k, String(v)]))); return true; },
};
