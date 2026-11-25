// Rate indication math for "Should We File?" (ported from P&C Case Lab).
import { num, sum } from '../../util.js';
import { N } from './reserving.js';

export const P_AYS = [1995, 1996, 1997], P_IDX = [7, 8, 9];
export const RATE_HIST = [{ date: 'July 1, 1995', s: 0.5, y: 1995, r: 0.05 }, { date: 'July 1, 1997', s: 0.5, y: 1997, r: 0.03 }];
export const EXP = { V: 0.20, F: 0.06, Q: 0.05, ULAE: 1.05 };

/** Exact parallelogram on-level factors for the experience years. */
export function olfExact() {
  const lv = [1]; RATE_HIST.forEach(c => lv.push(lv[lv.length - 1] * (1 + c.r)));
  const crl = lv[lv.length - 1];
  return P_AYS.map(y => {
    const port = RATE_HIST.map(c => { const o = y - c.y; return o < 0 ? 0 : o === 0 ? (1 - c.s) ** 2 / 2 : o === 1 ? 1 - c.s * c.s / 2 : 1; });
    const p = [1 - port[0]]; for (let k = 0; k < port.length; k++) p.push(port[k] - (k + 1 < port.length ? port[k + 1] : 0));
    return crl / p.reduce((s, pi, k) => s + pi * lv[k], 0);
  });
}
export const OLF = olfExact();

/** Annual exponential trend fitted to the last k quarterly points. */
export function expFit(series, k) {
  const y = series.slice(-k).map(Math.log), x = y.map((_, i) => i / 4); const mx = sum(x) / k, my = sum(y) / k;
  const b = sum(x.map((xi, i) => (xi - mx) * (y[i] - my))) / sum(x.map(xi => (xi - mx) ** 2)); return Math.exp(b) - 1;
}

export const pSel = st => ({ f12: num(st.f12), f24: num(st.f24), f36: num(st.f36) });

/** Full indication from the student's inputs. Any missing input makes the result NaN. */
export function pCalc(P, st) {
  const { f12, f24, f36 } = pSel(st);
  const lat = P_IDX.map(i => P.tri[i][N - 1 - i]);
  const cdf = [f36, f24 * f36, f12 * f24 * f36];
  const ult = lat.map((l, k) => l * cdf[k]);
  const ep = P_IDX.map(i => P.ep[i]);
  const olf = ['olf95', 'olf96', 'olf97'].map(k => num(st[k]));
  const tr = (1 + num(st.freqT) / 100) * (1 + num(st.sevT) / 100) - 1;
  const tl = ['tl95', 'tl96', 'tl97'].map(k => num(st[k]));
  const lr = ult.map((u, k) => u * Math.pow(1 + tr, tl[k]) * EXP.ULAE / (ep[k] * olf[k]));
  const w = ['w95', 'w96', 'w97'].map(k => num(st[k]) / 100);
  const wsum = sum(w); const wlr = sum(lr.map((x, k) => x * w[k])) / wsum;
  const ind = (wlr + EXP.F) / (1 - EXP.V - EXP.Q) - 1;
  return { lat, cdf, ult, ep, olf, tr, tl, lr, w, wsum, wlr, ind };
}
