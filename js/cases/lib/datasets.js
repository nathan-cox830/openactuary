// Case datasets and derived constants shared by case definitions and benches.
import DATA from '../../../data/cases/schedule-p.js';
import { sum } from '../../util.js';
import { N, devCalc, readSel, bfIbnr } from './reserving.js';
import { pCalc } from './pricing.js';

export const R = DATA.R;          // workers comp, "Lakeshore Timber Mutual"
export const P = DATA.P;          // private passenger auto liability, "Prairie Mutual"
export const TREND = DATA.trend;  // illustrative frequency / severity series
export const CLSF = DATA.clsf;    // illustrative classification data

export const R_LAT = R.tri.map((r, i) => r[N - 1 - i]);
export const R_CARRIED = sum(R.carried);
export const R_ACT_IBNR = sum(R.actual10) - sum(R_LAT);
export const R_CL_ALL = sum(R.cl_ult) - sum(R_LAT);

/** Chain ladder from the student's selection in the reserving case, or null if incomplete. */
export function rCalc(st) { const { s, t, ok } = readSel(st); return ok ? devCalc(R.tri, R.ep, s, t) : null; }
export const rBf = (c, elr) => bfIbnr(c, R.ep, elr);
export const pCalcSt = st => pCalc(P, st);
