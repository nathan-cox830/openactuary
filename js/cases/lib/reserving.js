// Loss development math (ported from P&C Case Lab). Triangles are 10 x 10 with nulls below the diagonal.
import { num, sum } from '../../util.js';

export const N = 10;
export const AGES = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];

/** Age-to-age factors for every row. */
export function rowFactors(tri) {
  return tri.map(r => AGES.slice(0, 9).map((_, j) => (r[j] != null && r[j + 1] != null) ? r[j + 1] / r[j] : null));
}

/** Volume-weighted (vw) and simple (sa) averages, optionally over the latest `last` rows per column. */
export function avgFactors(tri, last) {
  const out = { vw: [], sa: [] };
  for (let j = 0; j < 9; j++) {
    let rows = []; for (let i = 0; i < N; i++) if (tri[i][j] != null && tri[i][j + 1] != null) rows.push(i);
    if (last) rows = rows.slice(-last);
    const a = rows.reduce((s, i) => s + tri[i][j + 1], 0), b = rows.reduce((s, i) => s + tri[i][j], 0);
    out.vw.push(b ? a / b : null);
    out.sa.push(rows.length ? rows.reduce((s, i) => s + tri[i][j + 1] / tri[i][j], 0) / rows.length : null);
  }
  return out;
}

/** Chain ladder projection with selected factors `sel` (9) and a `tail`. */
export function devCalc(tri, ep, sel, tail) {
  const cdfAge = new Array(N); cdfAge[N - 1] = tail;
  for (let j = N - 2; j >= 0; j--) cdfAge[j] = sel[j] * cdfAge[j + 1];
  const latest = tri.map((r, i) => r[N - 1 - i]);
  const cdf = latest.map((_, i) => cdfAge[N - 1 - i]);
  const ult = latest.map((l, i) => l * cdf[i]);
  const used = ep.map((e, i) => e / cdf[i]);
  const ccElr = sum(latest) / sum(used);
  return { cdfAge, latest, cdf, ult, ccElr, sumLatest: sum(latest) };
}

/** Bornhuetter-Ferguson IBNR for an expected loss ratio. */
export const bfIbnr = (c, ep, elr) => sum(c.latest.map((l, i) => ep[i] * elr * (1 - 1 / c.cdf[i])));

/** Read the student's factor selection from case state. */
export function readSel(st) {
  const s = (st.sel || []).map(num); const t = num(st.tail);
  return { s, t, ok: s.length === 9 && s.every(isFinite) && isFinite(t) };
}
