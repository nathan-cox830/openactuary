// Trend Watch: renewing a fully insured group medical plan. PMPM, trend (utilization x unit cost),
// trend period, large-claim pooling, credibility with a manual rate, premium and the ACA MLR floor.
// All data is illustrative.
import { fmt, pct, spct, num, money } from '../../util.js';
import { lineChart, barChart, columnChart } from '../../ui/charts.js';
import {
  CATS, CAT_NAMES, CAT_COLORS, TKEY, MONTHS, MM, CLAIMS, RATE_HIST, LARGE, YEAR_LABEL, BOOK, FIT, ASSUME, TREND_MONTHS,
  MM_TOT, MM_Y, CL_Y, PMPM, PMPM_TOT, PREM_Y, EXCESS, Z, MODEL_T, MODEL, LEV, SIMP, ACTUAL_2027,
  monthPmpm, excessAt, renewal, buildUp, capacity, levPaidTrend, simulate, simTruth, underProb, hindsightChange,
} from '../lib/health.js';

const setBtn = (obj, label = 'Use these values') => `<button class="btn sm ghost" style="margin-top:8px" data-setstate='${JSON.stringify(obj).replace(/'/g, '&#39;')}'>${label}</button>`;
const m2 = x => money(x, 2);
const FIELD = { ip: 'pIP', op: 'pOP', pr: 'pPR', rx: 'pRX' };
const POOLED = PMPM_TOT - EXCESS / MM_TOT;
const M = MODEL, HIND = hindsightChange(), TRUTH = simTruth();
const trendsIn = st => CATS.every(k => isFinite(num(st[TKEY[k]])));

/* ---------------- workbook layout (rows are built once; formulas reference these row numbers) ---------------- */
function buildWb() {
  const r = [], at = {}, row = () => r.length;            // row() = 1-based number of the last pushed row
  const C = ['C', 'D', 'E', 'F'];
  r.push(['OpenActuary | Trend Watch (Riverbend Tool & Die renewal, Northstar Health Plan) | illustrative data, $']);
  r.push(['Experience: incurred April 2024 to March 2026, paid through June 2026 and completed. Renewal effective 1/1/2027.']);
  r.push(['HOW TO USE: fill every cell marked YOUR INPUT. Everything else is a live formula: click a cell to see how it is calculated.']);
  r.push(['STEP 1: PMPM by category (row "PMPM, 24 months") = category claims / member months.']);
  r.push(['STEP 2: Trend fits use LOGEST on the book data. Category trend = (1 + utilization trend) x (1 + unit cost trend) - 1. Enter your selected annual trends as decimals, e.g. 0.07.']);
  r.push(['STEP 3: Trend months run from the experience midpoint to the rating-period midpoint.']);
  r.push(['STEP 4: Pooling removes each claimant-year\'s claims above the pooling point, then adds the pooling charge after trending.']);
  r.push(['STEP 5: Credibility-weight the projection with the manual rate, add expenses, and compare with the current premium.']);
  r.push([]);
  r.push(['Month', 'Member months', 'Inpatient', 'Outpatient', 'Professional', 'Pharmacy', 'Total']);
  at.m1 = row() + 1;
  MONTHS.forEach((m, i) => { const n = row() + 1; r.push([m, MM[i], CLAIMS.ip[i], CLAIMS.op[i], CLAIMS.pr[i], CLAIMS.rx[i], `=SUM(C${n}:F${n})`]); });
  at.m2 = row();
  r.push(['Total, 24 months', ...['B', ...C, 'G'].map(c => `=SUM(${c}${at.m1}:${c}${at.m2})`)]); at.tot = row();
  r.push(['PMPM, 24 months', '', ...[...C, 'G'].map(c => `=${c}${at.tot}/$B$${at.tot}`)]); at.pmpm = row();
  r.push([]);
  r.push(['Book-of-business trend data (allowed)', 'IP admits/1000', 'IP cost/admit', 'OP visits/1000', 'OP cost/visit', 'Prof services/1000', 'Prof cost/service', 'Rx scripts/1000', 'Rx cost/script']);
  at.b1 = row() + 1;
  BOOK.years.forEach((y, i) => r.push([y, ...CATS.flatMap(k => [BOOK[k].u[i], BOOK[k].c[i]])]));
  at.b2 = row();
  const BC = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  r.push(['Fitted annual trend (LOGEST)', ...BC.map(c => `=LOGEST(${c}${at.b1}:${c}${at.b2})-1`)]); at.fit = row();
  r.push([]);
  r.push(['', '', 'Inpatient', 'Outpatient', 'Professional', 'Pharmacy', 'Total']);
  r.push(['Measured trend (util x unit cost)', '', ...CATS.map((_, j) => `=(1+${BC[2 * j]}${at.fit})*(1+${BC[2 * j + 1]}${at.fit})-1`)]); at.meas = row();
  r.push(['SELECTED annual trend (YOUR INPUT)', '', '', '', '', '']); at.sel = row();
  r.push(['Trend months (YOUR INPUT)', '']); at.tm = row();
  r.push(['Trend factor', '', ...C.map(c => `=IF(OR(ISBLANK(${c}${at.sel}),ISBLANK($B$${at.tm})),"",(1+${c}${at.sel})^($B$${at.tm}/12))`)]); at.tf = row();
  r.push(['Trended PMPM (before pooling)', '', ...C.map(c => `=IF(${c}${at.tf}="","",${c}${at.pmpm}*${c}${at.tf})`), `=SUM(C${row() + 1}:F${row() + 1})`]); at.trd = row();
  r.push(['Composite trend factor', `=IF(COUNT(C${at.tf}:F${at.tf})<4,"",G${at.trd}/G${at.pmpm})`]); at.comp = row();
  r.push([]);
  r.push(['Large claimants (12-month totals)', 'Experience year', 'Total claims', 'Excess over pooling point']);
  at.l1 = row() + 1;
  at.pool = at.l1 + LARGE.length + 1;
  LARGE.forEach(c => { const n = row() + 1; r.push(['Claimant ' + c.id + ': ' + c.dx, YEAR_LABEL[c.yr], c.amt, `=MAX(0,C${n}-$B$${at.pool})`]); });
  at.l2 = row();
  r.push(['Total excess', '', `=SUM(C${at.l1}:C${at.l2})`, `=SUM(D${at.l1}:D${at.l2})`]); at.exc = row();
  r.push(['Pooling point', ASSUME.pool]);
  r.push(['Pooling charge, 2027 level ($ PMPM)', ASSUME.poolCharge]); at.pc = row();
  r.push([]);
  r.push(['Rate build-up', '$ PMPM']);
  r.push(['Experience PMPM, all claims', `=G${at.pmpm}`]); at.u = row();
  r.push(['Excess claims removed, PMPM', `=D${at.exc}/B${at.tot}`]); at.e = row();
  r.push(['Pooled experience PMPM', `=B${at.u}-B${at.e}`]); at.p = row();
  r.push(['Projected PMPM = pooled x composite factor + pooling charge', `=IF(B${at.comp}="","",B${at.p}*B${at.comp}+B${at.pc})`]); at.proj = row();
  r.push(['Member months in experience', `=B${at.tot}`]); at.n = row();
  r.push(['Full-credibility standard (member months)', ASSUME.nFull]); at.nf = row();
  r.push(['Credibility Z = MIN(1, SQRT(n / n_full))', `=MIN(1,SQRT(B${at.n}/B${at.nf}))`]); at.z = row();
  r.push(['Manual claims PMPM, 2027', ASSUME.manual]); at.man = row();
  r.push(['Credibility-blended claims PMPM', `=IF(B${at.proj}="","",B${at.z}*B${at.proj}+(1-B${at.z})*B${at.man})`]); at.bl = row();
  r.push(['Administrative expense ($ PMPM)', ASSUME.admin]); at.ad = row();
  r.push(['Premium tax (share of premium)', ASSUME.tax]); at.tx = row();
  r.push(['Risk and profit margin (share of premium)', ASSUME.margin]); at.mg = row();
  r.push(['Required premium PMPM', `=IF(B${at.bl}="","",(B${at.bl}+B${at.ad})/(1-B${at.tx}-B${at.mg}))`]); at.prem = row();
  r.push(['Current premium PMPM (2026 rates)', ASSUME.current]); at.cur = row();
  r.push(['INDICATED RATE CHANGE', `=IF(B${at.prem}="","",B${at.prem}/B${at.cur}-1)`]); at.chg = row();
  r.push(['Quality improvement expense ($ PMPM)', ASSUME.qi]); at.qi = row();
  r.push(['ACA-style MLR = (claims + QI) / (premium - premium tax)', `=IF(B${at.prem}="","",(B${at.bl}+B${at.qi})/(B${at.prem}*(1-B${at.tx})))`]); at.mlr = row();
  r.push(['Large-group minimum MLR', ASSUME.mlrFloor]); at.fl = row();
  r.push(['Meets the MLR floor?', `=IF(B${at.mlr}="","",IF(B${at.mlr}>=B${at.fl},"Yes","No"))`]);
  return { rows: r, at };
}
const WB = buildWb(), A = WB.at;

/* ---------------- exhibits ---------------- */
function monthlyExhibit() {
  let h = `<section class="exhibit"><h3><span class="ex-n">1</span>Monthly experience, incurred claims ($) <span class="pill">illustrative</span></h3>
    <div class="card"><b class="small">PMPM by category, by month</b>${lineChart(CATS.map(k => ({ v: CLAIMS[k].map((c, i) => c / MM[i]), c: CAT_COLORS[k], w: 2.2, dot: false })), { x: MONTHS.map((m, i) => i % 3 === 0 ? m : ''), yfmt: v => '$' + fmt(v), aria: 'Monthly PMPM by service category, April 2024 to March 2026' })}
    <div class="legend">${CATS.map(k => `<span><i style="background:${CAT_COLORS[k]}"></i>${CAT_NAMES[k]}</span>`).join('')}</div></div>
    <div class="tblwrap" style="margin-top:12px"><table><thead><tr><th>Month</th><th>Member months</th>${CATS.map(k => `<th>${CAT_NAMES[k]}</th>`).join('')}<th>Total</th><th>PMPM</th></tr></thead><tbody>`;
  MONTHS.forEach((m, i) => { const t = CATS.reduce((s, k) => s + CLAIMS[k][i], 0); h += `<tr${i === 11 ? ' style="border-bottom:2px solid var(--line-strong)"' : ''}><td>${m}</td><td class="num">${fmt(MM[i])}</td>${CATS.map(k => `<td class="num">${fmt(CLAIMS[k][i])}</td>`).join('')}<td class="num">${fmt(t)}</td><td class="num">${fmt(monthPmpm(i), 2)}</td></tr>`; });
  h += `</tbody></table></div><p class="cap">Plan-paid claims by incurred month, paid through June 30, 2026 and completed with Northstar's completion factors. Inpatient spikes in mid-2025 are claimant E (Exhibit 3).</p></section>`;
  return h;
}
function summaryExhibit() {
  const ys = [0, 1];
  const tot = y => CATS.reduce((s, k) => s + CL_Y[y][k], 0);
  return `<section class="exhibit"><h3><span class="ex-n">2</span>Experience summary by 12-month period</h3><div class="tblwrap"><table><thead><tr><th></th>${ys.map(y => `<th>${YEAR_LABEL[y + 1]}</th>`).join('')}</tr></thead><tbody>
    <tr><td>Member months</td>${ys.map(y => `<td class="num">${fmt(MM_Y[y])}</td>`).join('')}</tr>
    ${CATS.map(k => `<tr><td>${CAT_NAMES[k]} PMPM</td>${ys.map(y => `<td class="num">${m2(CL_Y[y][k] / MM_Y[y])}</td>`).join('')}</tr>`).join('')}
    <tr class="total"><td>Total PMPM</td>${ys.map(y => `<td class="num">${m2(tot(y) / MM_Y[y])}</td>`).join('')}</tr>
    <tr><td>Earned premium</td>${ys.map(y => `<td class="num">${money(PREM_Y[y])}</td>`).join('')}</tr>
    <tr><td>Loss ratio (claims ÷ premium)</td>${ys.map(y => `<td class="num">${pct(tot(y) / PREM_Y[y])}</td>`).join('')}</tr></tbody></table></div>
    <p class="cap">Premium rates PMPM (composite of the tier rates): 2024 $${RATE_HIST[2024]}, 2025 $${RATE_HIST[2025]}, 2026 $${RATE_HIST[2026]}. Each renewal is January 1.</p></section>`;
}
function largeExhibit() {
  return `<section class="exhibit"><h3><span class="ex-n">3</span>Large claimants: more than $100,000 in a 12-month period</h3><div class="tblwrap"><table><thead><tr><th>Claimant</th><th>Period</th><th>Main condition</th><th>Total claims</th></tr></thead><tbody>
    ${LARGE.map(c => `<tr><td>${c.id}</td><td>${YEAR_LABEL[c.yr]}</td><td>${c.dx}</td><td class="num">${money(c.amt)}</td></tr>`).join('')}</tbody></table></div>
    <p class="cap">Totals are all services for one member in one 12-month experience period. These claims are already inside Exhibit 1.</p></section>`;
}
function bookExhibit() {
  return `<section class="exhibit"><h3><span class="ex-n">4</span>Northstar book-of-business trend data (allowed costs, regional commercial block)</h3><div class="tblwrap"><table><thead><tr><th>Year</th>${CATS.map(k => `<th>${BOOK[k].ul.replace('Admits', 'IP admits').replace('Visits', 'OP visits').replace('Services', 'Prof services').replace('Scripts', 'Rx scripts')}</th><th>${CAT_NAMES[k]}: ${BOOK[k].cl.toLowerCase()}</th>`).join('')}</tr></thead><tbody>
    ${BOOK.years.map((y, i) => `<tr><td>${y}</td>${CATS.map(k => `<td class="num">${fmt(BOOK[k].u[i], k === 'ip' ? 1 : 0)}</td><td class="num">${money(BOOK[k].c[i], k === 'pr' ? 2 : 0)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="cap">About 180,000 members. Utilization is per 1,000 members per year. Book PMPM = utilization ÷ 12,000 × unit cost. The group's own 24 months are far too few to measure trend reliably, so insurers measure it on the block.</p></section>`;
}
function assumeExhibit() {
  return `<section class="exhibit"><h3><span class="ex-n">5</span>Rating assumptions</h3><div class="split">
    <div class="tblwrap"><table><tbody>
      <tr><td>Renewal (rating) period</td><td>Jan 1 – Dec 31, 2027</td></tr>
      <tr><td>Experience period</td><td>Apr 1, 2024 – Mar 31, 2026</td></tr>
      <tr><td>Current premium PMPM, 2026 rates on 2027 enrollment</td><td class="num">${m2(ASSUME.current)}</td></tr>
      <tr><td>Manual claims PMPM, 2027 (this group's age/sex mix, area, plan; all claims)</td><td class="num">${m2(ASSUME.manual)}</td></tr>
      <tr><td>Full credibility standard</td><td class="num">${fmt(ASSUME.nFull)} member months</td></tr>
      <tr><td>Administrative expense</td><td class="num">${m2(ASSUME.admin)} PMPM</td></tr>
      <tr><td>Premium tax</td><td class="num">${pct(ASSUME.tax)} of premium</td></tr>
      <tr><td>Risk and profit margin</td><td class="num">${pct(ASSUME.margin)} of premium</td></tr>
      <tr><td>Quality improvement expense (inside admin)</td><td class="num">${m2(ASSUME.qi)} PMPM</td></tr></tbody></table></div>
    <div class="tblwrap"><table><thead><tr><th>Pooling point (per claimant, per 12 months)</th><th>Pooling charge PMPM, 2027 level</th></tr></thead><tbody>
      ${ASSUME.poolOptions.filter(p => p[0]).map(([p, c]) => `<tr${p === ASSUME.pool ? ' class="sel"' : ''}><td>${money(p)}${p === ASSUME.pool ? ' (this group)' : ''}</td><td class="num">${m2(c)}</td></tr>`).join('')}</tbody></table>
      <p class="cap">The pooling charge is Northstar's expected cost above the pooling point per member per month, across all groups in the pool, at 2027 cost levels. Riverbend is fully insured with ${ASSUME.employees} enrolled employees (about 1,200 members with dependents).</p></div></div></section>`;
}

/* ---------------- debrief helpers ---------------- */
function histogram(sim, mark) {
  const lo = 600, step = 25, bins = [];
  for (let b = lo; b < 950; b += step) bins.push({ l: '$' + b, v: 0, from: b });
  sim.pm.forEach(v => { const k = Math.min(bins.length - 1, Math.max(0, Math.floor((v - lo) / step))); bins[k].v++; });
  return columnChart(bins.map((b, i) => ({ l: i % 2 === 0 ? b.l : '', v: b.v / sim.pm.length, c: b.from + step <= mark ? 'var(--chart-1)' : b.from >= mark ? 'var(--chart-3)' : 'var(--chart-2)' })), { yfmt: v => pct(v, 0), aria: 'Distribution of simulated 2027 claims PMPM charged to the group', h: 220 });
}

export default {
  id: 'trend-watch',
  title: 'Trend Watch',
  sub: 'Renewing a group medical plan',
  line: 'health',
  level: 'advanced',
  levelLabel: 'Health actuarial level',
  minutes: 90,
  icon: 'chart',
  audience: 'benefits committee and underwriting lead',
  tagline: 'A NICU stay blew up last year\'s claims. What should a 1,200-member employer pay for its health plan in 2027?',
  concepts: ['PMPM', 'Medical trend', 'Utilization × unit cost', 'Trend period', 'Large-claim pooling', 'Credibility', 'Medical loss ratio'],
  exam: 'Experience rating, trend, pooling and credibility for group medical are core to the SOA Group & Health (GH) track. Credibility rests on Exam P ideas (the variance of an average falls like 1/n), and the trend math is compound growth from Exam FM.',
  inspiration: [
    ['CMS: Medical Loss Ratio (MLR) rules', 'https://www.cms.gov/marketplace/private-health-insurance/medical-loss-ratio'],
    ['SOA Health Section', 'https://www.soa.org/sections/health/'],
    ['BeAnActuary: what actuaries do', 'https://www.beanactuary.org/']],
  source: 'All figures are illustrative and were built for teaching. Riverbend Tool & Die and Northstar Health Plan are fictional. Claim levels, trends, pooling charges and expenses are realistic in size for US commercial group medical but do not come from a specific insurer or employer. The 2027 outcome and the simulation in the Debrief are illustrative too.',

  brief: () => `
  <div class="prose">
    <p><b>Your role:</b> actuarial analyst on the group renewal team at <b>Northstar Health Plan</b>, a regional insurer. It is September 2026.</p>
    <p><b>The client:</b> <b>Riverbend Tool &amp; Die</b>, a manufacturer with ${ASSUME.employees} employees and about 1,200 covered members including dependents. Its medical and pharmacy plan is fully insured with Northstar and renews on January 1, 2027.</p>
    <p><b>The situation:</b> Riverbend's claims jumped from about $584 to $743 per member per month (PMPM) between the two most recent 12-month periods. Most of the jump is one premature baby's 94-day NICU stay, but pharmacy costs are also climbing fast. Last year's renewal was +11.5%. Riverbend's benefits committee has budgeted <b>+${ASSUME.budget}%</b> for 2027 and has asked how Northstar will treat "one unlucky claim".</p>
    <div class="callout"><b>The question:</b> What renewal rate change should Northstar offer Riverbend for 2027, and how do you explain it to the benefits committee and to Northstar's underwriting lead?</div>
    <p><b>Deliverables:</b> a renewal rate build-up (experience PMPM, trend, pooling, credibility, premium), a check against the ACA medical loss ratio floor, a recommended rate change, and a one-page summary (Recommend tab).</p>
  </div>`,
  briefStats: () => [
    { l: 'Experience PMPM, 24 months', v: PMPM_TOT, pre: '$', dec: 0 },
    { l: 'Covered members', v: 1200, pre: '~', dec: 0 },
    { l: 'Committee budget', v: ASSUME.budget, pre: '+', suf: '%', dec: 0 },
  ],

  primers: [
    { t: 'PMPM: the unit of health pricing', tier: 'F', h: `<p>Group sizes change every month as people join and leave, so health actuaries measure cost <b>per member per month (PMPM)</b>:</p>
      <div class="formula">PMPM = claims ÷ member months</div>
      <p>A <b>member month</b> is one person covered for one month. 1,200 members covered all year = 14,400 member months. Splitting PMPM by service category (inpatient hospital, outpatient facility, professional/physician, pharmacy) shows <i>where</i> costs are moving, because each category trends differently.</p>
      <div class="example"><b>Mini example.</b> $2.4M of pharmacy claims over 16,000 member months is $150.00 PMPM.</div>` },
    { t: 'Medical trend = utilization × unit cost', tier: 'F', h: `<p><b>Trend</b> is the annual growth in cost PMPM. It has two parts: people use more services (<b>utilization</b>, e.g. admits per 1,000), and each service costs more (<b>unit cost</b>, e.g. cost per admit, driven by provider contracts, new technology and drug prices).</p>
      <div class="formula">1 + trend = (1 + utilization trend) × (1 + unit cost trend)</div>
      <div class="example">Utilization +2.0% and unit cost +5.0% → 1.02 × 1.05 − 1 = +7.1%, not 7.0%.</div>
      <p>A 1,200-member group's own data is far too noisy to measure trend, so insurers fit trend on their whole <b>book of business</b>, usually with an exponential (log-linear) fit like Excel's LOGEST, and then use judgment: is a GLP-1 drug wave or a new hospital contract going to continue?</p>` },
    { t: 'The trend period: midpoint to midpoint', tier: 'F', h: `<p>Experience claims are spread over the experience period. Future claims are spread over the rating period. On average, the experience sits at its <b>midpoint</b> and the future sits at <i>its</i> midpoint, so trend runs between the two.</p>
      <div class="formula">Projected PMPM = experience PMPM × (1 + annual trend)^(trend months ÷ 12)</div>
      <div class="example"><b>Mini example.</b> Experience Jan 1, 2024 – Dec 31, 2024 (midpoint July 1, 2024). Rating period Apr 1, 2025 – Mar 31, 2026 (midpoint Oct 1, 2025). Trend months = 15. At 8% a year the factor is 1.08^(15/12) = 1.1009.</div>
      <p>The gap is long because renewals are quoted months ahead and claims need run-out time to be counted.</p>` },
    { t: 'Large-claim pooling', tier: 'F', h: `<p>One catastrophic claim can swamp a mid-size group's experience, yet it says little about next year: the same member rarely repeats at that cost. <b>Pooling</b> spreads that risk across all groups:</p>
      <ul><li>Remove each claimant's claims above the <b>pooling point</b> (per claimant, per 12-month period) from the group's experience.</li>
      <li>Add back a <b>pooling charge</b>: the expected PMPM cost above the pooling point across the whole pool.</li></ul>
      <div class="example">A $400,000 claimant with a $150,000 pooling point removes $250,000 from the group's experience. Every group in the pool then pays the expected pooled cost instead of its own actual one.</div>
      <p>A lower pooling point makes the renewal more stable but makes the pooling charge bigger.</p>` },
    { t: 'Credibility: blending experience with a manual rate', tier: 'F', h: `<p>How much should a group's own experience count? A <b>manual rate</b> is the insurer's expected PMPM for a group like this one (age/sex mix, area, plan design), built from the whole book. <b>Credibility</b> blends the two:</p>
      <div class="formula">Blended PMPM = Z × projected experience + (1 − Z) × manual,   Z = min(1, √(n ÷ n_full))</div>
      <p>The square root comes from Exam P: the standard deviation of an average of n independent members shrinks like 1/√n. Quadrupling the member months halves the noise, so it takes four times the data to double Z. Here n is member months and n_full is the volume where experience gets full weight.</p>
      <div class="example">15,000 member months against a 60,000 standard: Z = √0.25 = 0.50.</div>` },
    { t: 'From claims to premium, and the ACA MLR floor', tier: 'F', h: `<p>Premium must pay claims, administrative costs, premium tax and a risk margin:</p>
      <div class="formula">Premium PMPM = (claims PMPM + admin $ PMPM) ÷ (1 − premium tax % − margin %)</div>
      <div class="formula">Rate change = required premium ÷ current premium − 1</div>
      <p>The Affordable Care Act sets a minimum <b>medical loss ratio (MLR)</b>: <b>80%</b> in the individual and small group markets and <b>85%</b> in the large group market. Simplified, MLR = (claims + quality improvement expense) ÷ (premium − taxes and fees). Small group generally means employers with up to 50 employees (up to 100 in a few states). The MLR is measured for each insurer, state and market as a whole, over three years. If it falls short, the insurer pays rebates.</p>` },
    { t: 'Leveraging: why paid trend beats allowed trend', tier: 'S', h: `<p>Trend is usually measured on <b>allowed</b> costs: the full negotiated price, before member cost sharing. The plan pays allowed minus cost sharing. If the member's share is a <b>fixed dollar</b> amount (a $30 copay, a $1,500 deductible that never changes), all of the allowed-cost growth lands on the plan, so <b>paid trend is higher than allowed trend</b>.</p>
      <div class="formula">Paid trend = (allowed × (1 + allowed trend) − fixed cost sharing) ÷ (allowed − fixed cost sharing) − 1</div>
      <div class="example">Allowed $100, fixed copays $20, allowed trend 6% → (106 − 20) ÷ 80 − 1 = 7.5%.</div>
      <p>Coinsurance (a percentage) does not leverage. This is why employers raise deductibles over time just to keep plan value steady.</p>` },
  ],

  exhibits: () => monthlyExhibit() + summaryExhibit() + largeExhibit() + bookExhibit() + assumeExhibit(),

  tasks: [
    { id: 'hl1', tier: 'F', type: 'multi', title: 'Experience PMPM by category',
      prompt: () => `Using Exhibit 1, compute the 24-month PMPM for each service category, before any adjustment for large claims. Round to cents.`,
      fields: CATS.map((k, i) => [FIELD[k], CAT_NAMES[k], i]), answer: i => PMPM[CATS[i]], tol: 0.06,
      explain: () => `Member months total ${fmt(MM_TOT)}. PMPM: ${CATS.map(k => `${CAT_NAMES[k]} ${m2(PMPM[k])}`).join(', ')}. Total ${m2(PMPM_TOT)}.` },
    { id: 'hl2', tier: 'F', type: 'bench', title: 'Measure and select trend by category', bench: 'hlTrend',
      prompt: () => `Exhibit 4 has five years of book-of-business utilization and unit cost by category. The table below shows each piece's fitted annual trend. Combine the pieces, then enter the annual trend (%) you select for each category. The chart projects each category to 2027 at your trend.`,
      check: st => {
        const bad = [], costOnly = [];
        for (const k of CATS) {
          const v = num(st[TKEY[k]]) / 100;
          if (!isFinite(v)) return { ok: false, msg: 'Enter a trend for all four categories.' };
          if (Math.abs(v - FIT[k].c) < 0.0025 && Math.abs(FIT[k].t - FIT[k].c) > 0.005) costOnly.push(CAT_NAMES[k]);
          else if (Math.abs(v - FIT[k].t) > 0.025) bad.push(CAT_NAMES[k]);
        }
        if (costOnly.length) return { ok: false, msg: `${costOnly.join(' and ')}: that looks like the unit cost trend alone. Trend = (1 + utilization) × (1 + unit cost) − 1.` };
        if (bad.length) return { ok: false, msg: `${bad.join(' and ')}: more than 2.5 points away from the measured trend. That needs a strong reason. Combine utilization and unit cost first.` };
        const c = renewal(st);
        return { ok: true, msg: `Complete. Your composite trend, weighted by Riverbend's claim mix, is ${pct(c.compAnnual, 2)} a year.` };
      } },
    { id: 'hl3', tier: 'F', type: 'num', title: 'Trend months',
      prompt: () => `The experience period is April 1, 2024 to March 31, 2026. The renewal covers calendar 2027 (12 months starting January 1, 2027). How many months of trend apply from the experience period to the rating period?`,
      answer: () => TREND_MONTHS, tol: 0.01,
      explain: () => `Experience midpoint April 1, 2025. Rating-period midpoint July 1, 2027. That is 27 months, so each category's factor is (1 + trend)^(27/12) = (1 + trend)^2.25.` },
    { id: 'hl4', tier: 'F', type: 'num', title: 'Pool the large claims',
      prompt: () => `Riverbend's pooling point is ${money(ASSUME.pool)} per claimant per 12-month period. Using Exhibit 3, how many dollars of experience-period claims are removed by pooling? (whole dollars)`,
      answer: () => EXCESS, tol: 50,
      explain: () => `Above ${money(ASSUME.pool)}: ${LARGE.filter(c => c.amt > ASSUME.pool).map(c => `${c.id} ${money(c.amt - ASSUME.pool)}`).join(', ')}. Total ${money(EXCESS)}, or ${m2(EXCESS / MM_TOT)} PMPM. Pooled experience PMPM = ${m2(PMPM_TOT)} − ${m2(EXCESS / MM_TOT)} = ${m2(POOLED)}.` },
    { id: 'hl5', tier: 'F', type: 'num', title: 'Project the experience to 2027',
      prompt: () => `Project Riverbend's experience to the 2027 rating period: take the pooled experience PMPM, apply the composite trend factor from your selected trends (weighted by the group's category PMPMs over ${TREND_MONTHS} months), then add the ${m2(ASSUME.poolCharge)} pooling charge. What is the projected claims PMPM? (cents)`,
      answer: st => renewal(st).proj, rtol: 0.002,
      explain: st => { const c = renewal(st); return `Pooled ${m2(c.pooled)} × composite factor ${c.comp.toFixed(4)} + ${m2(c.pc)} = ${m2(c.proj)}. The pooling charge is already at 2027 cost levels, so it is added after trending, not trended again.`; } },
    { id: 'hl6', tier: 'F', type: 'num', title: 'How credible is Riverbend?',
      prompt: () => `Northstar uses Z = min(1, √(n ÷ ${fmt(ASSUME.nFull)})), with n = member months in the experience period. What is Riverbend's credibility Z? (3 decimals)`,
      answer: () => Z, tol: 0.0015,
      explain: () => `n = ${fmt(MM_TOT)}. √(${fmt(MM_TOT)} ÷ ${fmt(ASSUME.nFull)}) = √${(MM_TOT / ASSUME.nFull).toFixed(4)} = ${Z.toFixed(4)}. The experience gets about ${pct(Z, 0)} of the weight and the manual rate about ${pct(1 - Z, 0)}.` },
    { id: 'hl7', tier: 'F', type: 'num', title: 'Indicated renewal rate change',
      prompt: () => `Blend your projected PMPM with the ${m2(ASSUME.manual)} manual rate using Z. Then convert to premium: add ${m2(ASSUME.admin)} admin PMPM and divide by (1 − ${pct(ASSUME.tax, 0)} premium tax − ${pct(ASSUME.margin, 0)} margin). Compare with the current ${m2(ASSUME.current)} PMPM. What is the indicated rate change? (%, 1 decimal)`,
      answer: st => renewal(st).change * 100, tol: 0.15,
      explain: st => { const c = renewal(st); return `Blended = ${c.z.toFixed(4)} × ${m2(c.proj)} + ${(1 - c.z).toFixed(4)} × ${m2(ASSUME.manual)} = ${m2(c.blend)}. Premium = (${m2(c.blend)} + ${m2(ASSUME.admin)}) ÷ 0.95 = ${m2(c.prem)}. Change = ${m2(c.prem)} ÷ ${m2(ASSUME.current)} − 1 = ${spct(c.change)}. Loss ratio ${pct(c.lr)}; ACA-style MLR ${pct(c.mlr)}.`; } },
    { id: 'hl8', tier: 'S', type: 'num', title: 'Leveraged trend',
      prompt: () => `Riverbend's committee asks why plan costs rise faster than "medical inflation". Professional services run ${m2(LEV.allowed)} PMPM allowed, of which members pay ${m2(LEV.copay)} PMPM through fixed-dollar copays that will not change. Allowed trend is ${pct(LEV.trend, 1)}. What is the annual trend in what the plan pays? (%, 2 decimals)`,
      answer: () => levPaidTrend() * 100, tol: 0.03,
      explain: () => `Plan pays ${m2(LEV.allowed - LEV.copay)} now and ${m2(LEV.allowed * (1 + LEV.trend))} − ${m2(LEV.copay)} = ${m2(LEV.allowed * (1 + LEV.trend) - LEV.copay)} next year: ${pct(levPaidTrend(), 2)}. Fixed cost sharing leverages trend. Measure trend on the same basis (allowed or paid) as the claims you apply it to.` },
    { id: 'hl9', tier: 'S', type: 'mcq', title: 'Which MLR floor applies?',
      prompt: () => `The underwriting lead asks whether this renewal creates rebate risk under the ACA medical loss ratio rules. Riverbend has ${ASSUME.employees} employees and is fully insured. Which statement is right?`,
      options: [
        '80%, because Riverbend has fewer than 1,500 covered members.',
        `85%. With ${ASSUME.employees} employees Riverbend is in the large group market in every state. The MLR is measured on Northstar's whole large-group block in the state over three years, not group by group, so this renewal's own ratio matters only through its effect on the block.`,
        '85%, and if Riverbend\'s own loss ratio for 2027 comes in under 85%, Northstar must rebate the difference to Riverbend.',
        'No MLR floor applies, because employer plans are exempt from the ACA.'],
      correct: 1,
      explain: `Large group (more than 50 employees, or more than 100 in a few states) carries the 85% floor; individual and small group carry 80%. Rebates are calculated per insurer, state and market on a three-year basis. A single group's low loss ratio does not trigger its own rebate, but pricing the whole block below 85% would. At about ${pct(M.mlr, 0)}, this renewal sits comfortably above the floor. (Self-funded plans are outside the MLR rules.)` },
    { id: 'hl10', tier: 'S', type: 'bench', title: 'Stress-test the renewal', bench: 'hlStress',
      prompt: () => `Move the controls to see what drives the indication. Try a lower pooling point, no pooling at all, a stricter credibility standard, and trend one point higher. Which assumption moves the rate most?`,
      check: st => {
        const h = st.hs || {};
        const moved = (h.shift != null && num(h.shift) !== 0) || (h.pool != null && num(h.pool) !== ASSUME.pool) || (h.nFull != null && num(h.nFull) !== ASSUME.nFull);
        if (!moved) return { ok: false, msg: 'Change at least one control away from the case values first.' };
        return { ok: true, msg: 'Complete. Removing pooling moves the indication by about 3 points: the NICU claim would be charged to Riverbend almost in full. Each point of trend moves it by about 1.5 points.' };
      } },
    { id: 'hl11', tier: 'F', type: 'pick', title: 'Lock your recommended rate change', prompt: () => `Enter the 2027 renewal rate change (%) you recommend Northstar offer Riverbend, then lock it. The Debrief shows what happened in 2027 and how often a rate like yours would have been too low.`, key: 'pick' },
  ],
  pickShow: st => (num(st.pick) >= 0 ? '+' : '') + st.pick + '% renewal rate change',
  pickHint: '%, e.g. 10',
  pickOk: st => isFinite(num(st.pick)) && num(st.pick) > -50 && num(st.pick) < 100,

  stages: [['Experience', ['hl1']], ['Trend', ['hl2', 'hl3']], ['Pool & project', ['hl4', 'hl5']], ['Credibility & rate', ['hl6', 'hl7']], ['Go further', ['hl8', 'hl9', 'hl10'], true], ['Decide', ['hl11']]],

  hints: {
    hl1: ['Add each category\'s 24 monthly claims, then divide by the total member months over the same 24 months. Do not average the monthly PMPMs.',
      () => `Total member months = ${fmt(MM_TOT)}. Inpatient claims total ${money(CLAIMS.ip.reduce((s, x) => s + x, 0))}, so inpatient PMPM = ${money(CLAIMS.ip.reduce((s, x) => s + x, 0))} ÷ ${fmt(MM_TOT)}. Repeat for the other three.`],
    hl2: ['Each category has a utilization fit and a unit cost fit. They multiply: 1 + trend = (1 + utilization) × (1 + unit cost).',
      () => `Measured trends: ${CATS.map(k => `${CAT_NAMES[k]} ${pct(FIT[k].t, 2)}`).join(', ')}. Rounding to the nearest half point is common. You might lean up on pharmacy if you expect GLP-1 and specialty drug costs to keep accelerating.`,
      () => `Model selections: inpatient 7.0%, outpatient 7.5%, professional 4.5%, pharmacy 10.5%.<br>${setBtn(MODEL_T)}`],
    hl3: ['Find the midpoint of the experience period and the midpoint of the rating period, then count the months between them.',
      'Experience: April 1, 2024 to March 31, 2026, so the midpoint is April 1, 2025. Rating period: calendar 2027, midpoint July 1, 2027.'],
    hl4: ['Pooling is per claimant, per 12-month period. Only the part of each claimant\'s claims above the pooling point is removed.',
      () => `Claimants above ${money(ASSUME.pool)}: ${LARGE.filter(c => c.amt > ASSUME.pool).map(c => `${c.id} (${money(c.amt)})`).join(', ')}. Subtract ${money(ASSUME.pool)} from each and add up.`],
    hl5: ['Three steps: pooled PMPM = total PMPM − excess ÷ member months; composite factor = Σ (category PMPM × category trend factor) ÷ total PMPM; projected = pooled × composite + pooling charge.',
      st => { if (!trendsIn(st)) return 'Select your trends in the trend task first: the composite factor depends on them.'; const c = renewal(st); return `With your trends, the composite factor over ${TREND_MONTHS} months is ${c.comp.toFixed(4)} (the trend bench shows it too). Pooled PMPM is ${m2(c.pooled)}.`; }],
    hl6: ['n is total member months over the 24-month experience period (Exhibit 1 or 2).', () => `√(${fmt(MM_TOT)} ÷ ${fmt(ASSUME.nFull)}). It is below 1, so the min() does not bind.`],
    hl7: ['Work in order: blend, then add admin, then gross up for the percentage loads, then divide by the current premium.',
      st => { if (!trendsIn(st)) return 'Select your trends first.'; const c = renewal(st); return `Your projected PMPM is ${m2(c.proj)} and Z = ${c.z.toFixed(4)}, so the blended claims PMPM is ${m2(c.blend)}. Premium = (blended + ${m2(ASSUME.admin)}) ÷ (1 − 0.02 − 0.03).`; }],
    hl8: ['Compute what the plan pays now (allowed − copays) and next year (allowed × 1.045 − the same copays).', () => `Now: ${m2(LEV.allowed - LEV.copay)}. Next year: ${m2(LEV.allowed * (1 + LEV.trend))} − ${m2(LEV.copay)}. Divide and subtract 1.`],
    hl9: ['Two questions: which market is Riverbend in, and at what level is the MLR measured?', 'Small group is generally up to 50 employees (up to 100 in a few states). Rebates are calculated on an insurer\'s whole market in a state, averaged over three years.'],
    hl10: ['Start with the pooling buttons: compare $175k with "None". Then move the trend slider by +1.'],
  },

  model: () => `<h3>Model solution</h3><div class="prose">
    <p><b>Experience.</b> ${fmt(MM_TOT)} member months and ${m2(PMPM_TOT)} PMPM over 24 months: ${CATS.map(k => `${CAT_NAMES[k].toLowerCase()} ${m2(PMPM[k])}`).join(', ')}.</p>
    <p><b>Trend.</b> Book fits give ${CATS.map(k => `${CAT_NAMES[k].toLowerCase()} ${pct(FIT[k].t, 1)}`).join(', ')} (utilization × unit cost). Selected 7.0%, 7.5%, 4.5% and 10.5%. Trend runs 27 months, from April 1, 2025 to July 1, 2027. Composite factor ${M.comp.toFixed(4)} (${pct(M.compAnnual, 2)} a year).</p>
    <p><b>Pooling.</b> ${money(EXCESS)} of claims above ${money(ASSUME.pool)}, mostly the NICU claimant, is ${m2(EXCESS / MM_TOT)} PMPM. Pooled experience ${m2(M.pooled)} × ${M.comp.toFixed(4)} + ${m2(ASSUME.poolCharge)} pooling charge = <b>${m2(M.proj)}</b>.</p>
    <p><b>Credibility.</b> Z = √(${fmt(MM_TOT)} ÷ ${fmt(ASSUME.nFull)}) = ${Z.toFixed(3)}. Blended claims = ${Z.toFixed(3)} × ${m2(M.proj)} + ${(1 - Z).toFixed(3)} × ${m2(ASSUME.manual)} = <b>${m2(M.blend)}</b>.</p>
    <p><b>Premium.</b> (${m2(M.blend)} + ${m2(ASSUME.admin)}) ÷ 0.95 = ${m2(M.prem)} against ${m2(ASSUME.current)} today: <b>${spct(M.change)}</b>. Loss ratio ${pct(M.lr)}; ACA-style MLR ${pct(M.mlr)}, above the 85% large-group floor.</p>
    <p><b>Recommendation.</b> Quote about +11.5% on the current plan. Pooling already protects Riverbend from most of the NICU claim: without it the indication would be about ${spct(renewal(MODEL_T, { pool: 0 }).change, 0)}. The gap to the committee's +6% budget is driven by trend, mostly pharmacy, not by one unlucky claim. A strong answer offers a path to the budget through plan design (a higher deductible, pharmacy tiering or a GLP-1 coverage policy) rather than by cutting the rate below cost. Reasonable recommendations run from about +9% to +13%, if the reasoning is stated.</p></div>`,

  debrief(st) {
    const pick = num(st.pick) / 100, sim = simulate();
    const mine = trendsIn(st) ? renewal(st) : null;
    const actualGap = capacity(pick) - ACTUAL_2027.charged;
    const rows = [['No change (0%)', 0], [`Committee budget (+${ASSUME.budget}%)`, ASSUME.budget / 100], [`Your rate (${spct(pick)})`, pick], [`Model indication (${spct(M.change)})`, M.change], [`Hindsight (${spct(HIND)})`, HIND]];
    const verdict = actualGap >= 0
      ? `Your rate could pay ${m2(capacity(pick))} PMPM of claims, so it covered 2027's ${m2(ACTUAL_2027.charged)}, with about ${money(actualGap * ASSUME.members2027 * 12)} to spare over the year.`
      : `Your rate could pay ${m2(capacity(pick))} PMPM of claims, against ${m2(ACTUAL_2027.charged)} actual: a shortfall of about ${money(-actualGap * ASSUME.members2027 * 12)} over the year.`;
    return `<div class="stack-lg">
      <div class="kpis">
        <div class="kpi hero"><div class="l">Your rate change</div><div class="v">${spct(pick)}</div></div>
        <div class="kpi"><div class="l">Your indication</div><div class="v">${mine ? spct(mine.change) : '—'}</div></div>
        <div class="kpi"><div class="l">Model indication</div><div class="v">${spct(M.change)}</div></div>
        <div class="kpi"><div class="l">Needed in hindsight</div><div class="v">${spct(HIND)}</div></div>
      </div>
      <div class="callout"><b>What happened in 2027 (illustrative).</b> Pharmacy PMPM rose ${pct(ACTUAL_2027.rxGrowth, 1)} as more members started GLP-1 drugs, well above the 10.5% selected. One member had a ${money(ACTUAL_2027.bigClaim)} cancer claim; the pool absorbed the ${money(ACTUAL_2027.bigClaim - ASSUME.pool)} above ${money(ASSUME.pool)}. Claims charged to Riverbend (pooled claims plus the pooling charge) came to <b>${m2(ACTUAL_2027.charged)} PMPM</b>, against the model's ${m2(M.blend)}. ${verdict}</div>
      <div class="card"><h3 style="margin-bottom:6px">How often would a rate like yours be too low?</h3>
        <p class="small muted" style="margin:0 0 6px">${fmt(SIMP.scen)} simulated versions of 2027 for ${fmt(ASSUME.members2027)} members (seeded, so everyone sees the same results). Each member's claims are drawn from a heavy-tailed model, capped at the ${money(ASSUME.pool)} pooling point, with a random trend shock. The model's expected value is ${m2(TRUTH.charged)} PMPM charged to the group.</p>
        ${histogram(sim, capacity(pick))}
        <p class="cap">Simulated claims PMPM charged to Riverbend. Orange bins are above what your rate can pay (${m2(capacity(pick))}); the purple bin contains that line. Simulated mean ${m2(sim.mean)}; middle 90% from ${m2(sim.pm[Math.floor(0.05 * sim.pm.length)])} to ${m2(sim.pm[Math.floor(0.95 * sim.pm.length)])}.</p>
        ${barChart(rows.map(([l, r], i) => ({ l, v: underProb(sim, r), c: i === 2 ? 'var(--chart-3)' : 'var(--chart-1)', strong: i === 2 })), { fmt: v => pct(v, 0), aria: 'Chance the renewal rate is too low, by rate change', labelW: 250 })}
        <p class="cap">Share of simulated years in which claims exceed what each rate can pay after admin, tax and margin. Even a rate set exactly at expected cost is too low a large share of the time: for a group this size, one year of claims is noisy. That is why the margin and the pooling exist.</p></div>
      <div class="card"><h3 style="margin-bottom:6px">Model rate build-up, $ PMPM</h3>${barChart(buildUp(M), { fmt: v => money(v, 0), aria: 'Model renewal rate build-up', labelW: 250 })}</div>
      <div class="callout"><b>The judgment that matters.</b> The committee frames the problem as "one unlucky claim". Pooling already handles that claim: Riverbend pays the ${m2(ASSUME.poolCharge)} pooling charge, not the ${money(EXCESS)}. What remains is trend (pharmacy above 10% a year) applied over 27 months. The manual rate, built from the whole book, lands close to the projected experience, which supports the result. Judges look for a recommendation that separates the two and gives the committee real options to reach its budget.</div>
      <div class="card">${this.model()}</div></div>`;
  },

  modelSummary: `**Recommendation:** Offer Riverbend a +11.5% renewal on its current plan for 2027, and show the benefits committee two plan design options that bring the increase close to its +6% budget.

**How we got there:** Riverbend's 24-month experience is ${m2(PMPM_TOT)} PMPM over ${fmt(MM_TOT)} member months. We removed ${money(EXCESS)} of claims above the ${money(ASSUME.pool)} pooling point (mostly one NICU stay), leaving ${m2(POOLED)}. We trended by category for 27 months (inpatient 7.0%, outpatient 7.5%, professional 4.5%, pharmacy 10.5%, based on Northstar's book of business) and added the ${m2(ASSUME.poolCharge)} pooling charge, giving ${m2(M.proj)}. With ${pct(Z, 0)} credibility, blended with the ${m2(ASSUME.manual)} manual rate, expected 2027 claims are ${m2(M.blend)} PMPM. Adding ${m2(ASSUME.admin)} admin and 5% for premium tax and margin gives ${m2(M.prem)} against ${m2(ASSUME.current)} today.

**The "one unlucky claim":** pooling already treats it as bad luck. Without pooling the indication would be about ${spct(renewal(MODEL_T, { pool: 0 }).change, 0)}. The increase that remains is trend, led by pharmacy at over 10% a year.

**Compliance:** the projected loss ratio is ${pct(M.lr)} and the ACA-style MLR about ${pct(M.mlr, 0)}, above the 85% large-group floor, which is measured across Northstar's large-group block.

**Risks:** pharmacy trend is the biggest uncertainty; each point of trend moves the rate about 1.5 points. A group of 1,200 members also has real year-to-year noise: even a correctly priced rate is too low in many years. We will review GLP-1 utilization quarterly.`,

  judgeBank: [
    ['The committee says the increase is all because of one premature baby. Are they right?', `No. Pooling removes the claims above ${money(ASSUME.pool)} and replaces them with a ${m2(ASSUME.poolCharge)} PMPM pooling charge. Without pooling the indication would be about 3 points higher. The rest is trend over 27 months, especially pharmacy.`],
    ['Why not just use Riverbend\'s own trend?', 'Twenty-four months of a 1,200-member group is dominated by random claims. One NICU stay would read as 30%+ trend. Book-of-business trend split by utilization and unit cost is far more stable, and judgment handles known changes such as new drugs.'],
    ['Why 27 months of trend and not 12?', 'Trend runs from the average date of the experience (April 1, 2025) to the average date of the 2027 claims (July 1, 2027). Renewals are quoted months ahead with run-out, so the gap is over two years. Using 12 months would understate the rate change by about 6 points.'],
    ['Why is credibility only about 0.69?', 'With 28,787 member months against a 60,000 standard, √0.48 = 0.69. The square root reflects that noise falls like 1/√n. A bigger group would get more weight on its own experience.'],
    ['How sensitive is the rate to the pharmacy trend?', 'Pharmacy is about a fifth of claims. One more point of pharmacy trend moves the composite by about 0.2 points a year, or about 0.3 points of rate over 27 months. One point on every category moves the rate about 1.5 points.'],
    ['Does this renewal create an MLR rebate risk?', 'Riverbend is large group, so the floor is 85%. The MLR is measured on Northstar\'s whole large-group block in the state over three years. This renewal\'s MLR is about 91%, so it supports compliance rather than threatening it.'],
    ['The committee can only afford +6%. What do you offer?', 'Do not cut the rate below expected cost. Offer plan design changes (higher deductible or out-of-pocket maximum, pharmacy tiers, a GLP-1 prior authorization policy) priced to close the gap, possibly a multi-year rate guarantee, and show the trade-offs.'],
    ['What would make you change the recommendation?', 'Updated run-out showing the NICU claim was lower, a change in enrollment mix, evidence that GLP-1 use is leveling off, or a revised manual rate. Each feeds a specific step of the build-up.'],
  ],

  context(st) {
    const c = trendsIn(st) ? renewal(st) : null;
    return `CASE: Riverbend Tool & Die (fictional, illustrative), ${ASSUME.employees} employees, ~1,200 members, fully insured group medical with Northstar Health Plan (fictional), renewal 1/1/2027. Experience Apr 2024-Mar 2026: ${fmt(MM_TOT)} member months, ${m2(PMPM_TOT)} PMPM (IP ${m2(PMPM.ip)}, OP ${m2(PMPM.op)}, Prof ${m2(PMPM.pr)}, Rx ${m2(PMPM.rx)}). Year PMPMs $584 then $743; NICU claimant $1.68M. Pooling point $175k, pooling charge $38.50 PMPM (2027 level); excess ${money(EXCESS)}. Book trend fits (util x cost): IP ${pct(FIT.ip.t)}, OP ${pct(FIT.op.t)}, Prof ${pct(FIT.pr.t)}, Rx ${pct(FIT.rx.t)}. Trend months 27. Credibility Z = sqrt(n/60,000) = ${Z.toFixed(3)}. Manual $722 PMPM. Admin $52 PMPM, premium tax 2%, margin 3%. Current premium $745 PMPM. Committee budget +6%. Model indication ${spct(M.change)}.
STUDENT WORK: PMPMs ${['pIP', 'pOP', 'pPR', 'pRX'].map(k => st[k] || '?').join(', ')}; selected trends ${CATS.map(k => (st[TKEY[k]] || '?') + '%').join(', ')}; trend months ${st.ans?.hl3 || '?'}; pooled excess ${st.ans?.hl4 || '?'}; projected PMPM ${st.ans?.hl5 || '?'}; Z ${st.ans?.hl6 || '?'}; indicated change ${c ? spct(c.change) : (st.ans?.hl7 ? st.ans.hl7 + '%' : '?')}; recommended rate change ${st.pick ? st.pick + '%' : 'not yet selected'}.`;
  },

  workbook: {
    inputs: [`C${A.sel}:F${A.sel}`, `B${A.tm}`],
    cols: { A: 300, B: 120 },
    formats: {
      [`B${A.m1}:G${A.tot}`]: 'int', [`C${A.pmpm}:G${A.pmpm}`]: 'money2',
      [`B${A.fit}:I${A.fit}`]: 'pct2', [`C${A.meas}:F${A.sel}`]: 'pct2', [`C${A.tf}:F${A.tf}`]: 'dec4', [`C${A.trd}:G${A.trd}`]: 'money2', [`B${A.comp}`]: 'dec4',
      [`C${A.l1}:D${A.exc}`]: 'money0', [`B${A.pool}`]: 'money0', [`B${A.pc}`]: 'money2',
      [`B${A.u}:B${A.proj}`]: 'money2', [`B${A.n}:B${A.nf}`]: 'int', [`B${A.z}`]: 'dec4', [`B${A.man}:B${A.ad}`]: 'money2', [`B${A.tx}:B${A.mg}`]: 'pct1',
      [`B${A.prem}:B${A.cur}`]: 'money2', [`B${A.chg}`]: 'pct2', [`B${A.qi}`]: 'money2', [`B${A.mlr}:B${A.fl}`]: 'pct1',
    },
    checks: [
      ...CATS.map((k, j) => ({ cell: 'CDEF'[j] + A.pmpm, label: CAT_NAMES[k] + ' PMPM', answer: PMPM[k], tol: 0.005 })),
      { cell: 'B' + A.tm, label: 'Trend months', answer: TREND_MONTHS, tol: 0.001 },
      { cell: 'D' + A.exc, label: 'Total pooled excess', answer: EXCESS, tol: 0.5 },
      { cell: 'B' + A.z, label: 'Credibility Z', answer: Z, tol: 5e-5 },
    ],
    links: [...CATS.map((k, j) => ({ cell: 'CDEF'[j] + A.sel, path: TKEY[k], scale: 0.01 })), { cell: 'B' + A.tm, path: 'ans.hl3' }],
  },
  csv() { return WB.rows.map(r => r.slice()); },
};

/** Exposed for tests: workbook row numbers. */
export const WB_AT = A;
