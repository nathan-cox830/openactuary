// Should We File? Personal auto rate indication on real Schedule P data. Ported from P&C Case Lab.
import { fmt, pct, spct, num, sum, colL } from '../../util.js';
import { lineChart, barChart } from '../../ui/charts.js';
import { AGES } from '../lib/reserving.js';
import { P_AYS, P_IDX, RATE_HIST, EXP, OLF, expFit, pCalc } from '../lib/pricing.js';
import { P, TREND, CLSF, pCalcSt } from '../lib/datasets.js';

const setBtn = (obj, label = 'Use these values') => `<button class="btn sm ghost" style="margin-top:8px" data-setstate='${JSON.stringify(obj).replace(/'/g, '&#39;')}'>${label}</button>`;

function clsfTable() {
  const C = CLSF;
  let h = `<div class="tblwrap"><table><thead><tr><th>Driver age \\ Territory</th>${C.terr.map(t => `<th>${t} exposures</th><th>${t} losses ($)</th>`).join('')}</tr></thead><tbody>`;
  C.ages.forEach((a, i) => { h += `<tr><td>${a}</td>${C.terr.map((_, j) => `<td class="num">${fmt(C.expo[i][j])}</td><td class="num">${fmt(C.loss[i][j])}</td>`).join('')}</tr>`; });
  return h + `</tbody></table></div><p class="cap">Exhibit 5 (illustrative): car-years and incurred losses by class.</p>`;
}

const MODEL_ST = { f12: '1.233', f24: '1.050', f36: '0.990', olf95: OLF[0], olf96: OLF[1], olf97: OLF[2], freqT: '-1.0', sevT: '3.5', tl95: '4.5', tl96: '3.5', tl97: '2.5', w95: '20', w96: '30', w97: '50' };

export default {
  id: 'should-we-file',
  title: 'Should We File?',
  sub: 'Personal auto rate indication',
  line: 'pc',
  level: 'advanced',
  levelLabel: 'CAS Exam 5 level',
  minutes: 90,
  icon: 'car',
  audience: 'pricing committee',
  tagline: 'Loss ratios are high and agents are nervous. What rate change should a farm-bureau auto insurer file?',
  concepts: ['Fundamental insurance equation', 'Loss development', 'On-leveling', 'Trend', 'Expense provisions', 'Classification relativities'],
  exam: 'The loss ratio method, parallelogram on-leveling and trending are core to the CAS basic ratemaking syllabus (Exam 5).',
  inspiration: [
    ['CAS Auto Safety Features case competition toolkit', 'https://www.casstudentcentral.org/?p=3048'],
    ['SOA 2019 Student Research Case Study Challenge (autonomous vehicle auto insurance)', 'https://people.math.umass.edu/~lian/SOA_casestudy.htm']],
  source: `Real data: Schedule P, private passenger auto liability, NAIC group ${P.grcode}, net reported incurred loss & DCC and net earned premium. Rate history, trend data, expense provisions and the classification data are illustrative. The company name is fictional.`,

  brief: () => `
  <div class="prose">
    <p><b>Your role:</b> pricing actuary at <b>Prairie Mutual</b>, a Midwest farm-bureau-style insurer writing private passenger auto liability through captive agents. It is early 1998.</p>
    <p><b>The situation:</b> Auto liability loss ratios have run in the 70s and 80s for years. Product management wants to know whether rates for annual policies written in calendar 1999 (effective dates January 1 to December 31, 1999) are adequate. Sales leadership is worried: the last increase took effect July 1, 1997, and agents report pressure from direct writers.</p>
    <div class="callout"><b>The question:</b> What overall rate change is indicated for 1999, and what change should Prairie Mutual actually file?</div>
    <p><b>Deliverables:</b> a rate indication with support, a recommended filed change, and a one-page summary for the pricing committee (Recommend tab).</p>
  </div>`,
  briefStats: () => [
    { l: 'Earned premium, AY1997', v: P.ep[9] / 1000, pre: '$', suf: 'M', dec: 1 },
    { l: 'Last rate change', v: 3, pre: '+', suf: '%', dec: 0 },
    { l: 'Policy period to price', v: 1999, dec: 0, raw: true },
  ],

  primers: [
    { t: 'The fundamental insurance equation', tier: 'F', h: `<p>Premium must cover losses, loss adjustment expenses (LAE), underwriting expenses and a profit margin. The <b>loss ratio method</b> compares the loss ratio we project at current rates with the loss ratio we can afford:</p>
     <div class="formula">Indicated change = (Projected loss & LAE ratio + F) ÷ (1 − V − Q) − 1</div>
     <p><b>V</b> = variable expenses as a % of premium (commissions, premium taxes). <b>F</b> = fixed expense ratio (overhead that doesn't scale with premium). <b>Q</b> = profit and contingency provision. The term 1 − V − Q is the share of each premium dollar left for losses and fixed costs.</p>
     <div class="example">Projected loss & LAE ratio 72%, F = 6%, V = 20%, Q = 5% → (0.72 + 0.06) ÷ 0.75 − 1 = +4.0%.</div>` },
    { t: 'Getting the experience period to "future, current rates"', tier: 'F', h: `<p>Historical losses and premium must be restated as they would look <b>in the future policy period, at current rates</b>:</p>
     <ul><li><b>Develop</b> losses to ultimate, because recent years aren't fully reported (see The Stale Triangle).</li>
     <li><b>On-level</b> premium to the current rate level, because past premium was collected at older, lower rates.</li>
     <li><b>Trend</b> losses to the future, because claims cost inflation and frequency changes continue.</li></ul>
     <p>Leaving out any step biases the indication. Missing on-leveling overstates the needed increase. Missing trend understates it.</p>` },
    { t: 'On-leveling with the parallelogram method', tier: 'F', h: `<p>Picture each calendar year of earned premium as a unit square: time across, policy "age" up. For annual policies, a rate change effective partway through the year cuts the square with a 45° line. Premium earned to the right of the line was written at the new rate.</p>
     <div class="formula">Share of AY earned at new rate, change at fraction s of year:  same year = (1 − s)² ÷ 2,  next year = 1 − s² ÷ 2</div>
     <div class="example"><b>Mini example.</b> One +10% change effective July 1, Year X (s = 0.5). In Year X the new-rate share is 0.5² ÷ 2 = 0.125, so the average level = 0.875 × 1.00 + 0.125 × 1.10 = 1.0125. The current level is 1.10, so the on-level factor (OLF) = 1.10 ÷ 1.0125 = 1.0864. In Year X+1 the new-rate share is 1 − 0.125 = 0.875.</div>
     <p>With two changes, stack the levels: 1.00 before the first change, then 1.00 × (1 + r₁), then × (1 + r₂). Compute the share of the year at each level.</p>` },
    { t: 'Trending losses', tier: 'F', h: `<p>Fit an exponential curve to recent frequency (claims per exposure) and severity (average cost per claim). Pure premium trend ≈ (1 + frequency trend) × (1 + severity trend) − 1.</p>
     <p><b>Trend period</b> runs from the average accident date of each experience year to the average accident date of the future policies. For an accident year, the average accident date is July 1. For annual policies written uniformly over a year, the average written date is mid-year. Accidents happen on average six months after the written date, so add another half year.</p>
     <div class="example">Policies written during 2005 → average written date 7/1/2005 → average accident date 1/1/2006. Accident year 2002 (average accident date 7/1/2002) trends 3.5 years.</div>` },
    { t: 'From indication to filing', tier: 'F', h: `<p>The indication is a number; the filing is a business decision. Pricing committees weigh:</p>
     <ul><li><b>Credibility and stability:</b> is the most recent year's improvement real or noise?</li><li><b>Competition and retention:</b> how many customers leave after a large increase?</li><li><b>Regulation:</b> state insurance departments review rate filings and expect actuarial support.</li><li><b>Phasing:</b> taking part of the increase now and the rest later.</li></ul>
     <p>A good recommendation states the indication honestly, then explains any departure from it.</p>` },
    { t: 'Classification rating: why one-way analysis misleads', tier: 'S', h: `<p>The overall indication sets the average rate. <b>Relativities</b> spread it across rating variables such as driver age and territory. A <b>one-way</b> relativity looks at one variable at a time: pure premium for youthful drivers ÷ pure premium for adults.</p>
     <p>The problem is <b>correlation</b>. If youthful drivers are concentrated in high-cost urban territories, the one-way youthful relativity picks up part of the territory effect. Rating on both variables then double-counts it. <b>Multivariate</b> methods such as minimum bias procedures and generalized linear models (GLMs) estimate all relativities at once and separate the effects.</p>` },
  ],

  exhibits: () => {
    let h = `<section class="exhibit"><h3><span class="ex-n">1</span>Reported incurred loss &amp; DCC by accident year and age ($000)</h3><div class="tblwrap"><table><thead><tr><th>AY</th>${AGES.map(a => `<th>${a}</th>`).join('')}<th>Net EP</th></tr></thead><tbody>`;
    P.tri.forEach((r, i) => { h += `<tr${i >= 7 ? ' class="sel"' : ''}><td>${P.ays[i]}</td>${r.map(v => v == null ? '<td class="na">·</td>' : `<td class="num">${fmt(v)}</td>`).join('')}<td class="num">${fmt(P.ep[i])}</td></tr>`; });
    h += `</tbody></table></div><p class="cap">Highlighted: the experience period, accident years 1995–1997. Source: Schedule P via CAS Loss Reserving Database.</p></section>`;
    h += `<div class="split"><section class="exhibit"><h3><span class="ex-n">2</span>Rate change history <span class="pill">illustrative</span></h3><div class="tblwrap"><table><thead><tr><th>Effective date</th><th>Overall change</th></tr></thead><tbody>${RATE_HIST.map(c => `<tr><td>${c.date}</td><td class="num">+${(c.r * 100).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div><p class="cap">All policies are annual, written evenly through each year. No other changes since 1993.</p></section>
    <section class="exhibit"><h3><span class="ex-n">3</span>Expense &amp; profit provisions <span class="pill">illustrative</span></h3><div class="tblwrap"><table><tbody>
      <tr><td>Variable expense ratio (V)</td><td class="num">${pct(EXP.V)}</td></tr><tr><td>Fixed expense ratio (F)</td><td class="num">${pct(EXP.F)}</td></tr>
      <tr><td>Profit &amp; contingency (Q)</td><td class="num">${pct(EXP.Q)}</td></tr><tr><td>Unallocated LAE factor (applied to loss &amp; DCC)</td><td class="num">${EXP.ULAE.toFixed(3)}</td></tr></tbody></table></div></section></div>`;
    const T = TREND;
    h += `<section class="exhibit"><h3><span class="ex-n">4</span>Loss trend data, rolling 12 months <span class="pill">illustrative</span></h3><div class="split">
      <div class="card"><b class="small">Frequency (claims per 100 car-years)</b>${lineChart([{ v: T.freq, c: 'var(--chart-1)', w: 2.4, area: true }], { x: T.q.map((q, i) => i % 4 === 0 ? q : ''), yfmt: v => v.toFixed(2), aria: 'Claim frequency trend' })}</div>
      <div class="card"><b class="small">Severity ($ per claim)</b>${lineChart([{ v: T.sev, c: 'var(--chart-2)', w: 2.4, area: true }], { x: T.q.map((q, i) => i % 4 === 0 ? q : ''), yfmt: v => '$' + fmt(v), aria: 'Claim severity trend' })}</div></div>
      <div class="tblwrap" style="margin-top:12px"><table><thead><tr><th>Exponential fit, annual rate</th><th>13-point</th><th>8-point</th><th>5-point</th></tr></thead><tbody>
      <tr><td>Frequency</td>${[13, 8, 5].map(k => `<td class="num">${pct(expFit(T.freq, k), 1)}</td>`).join('')}</tr>
      <tr><td>Severity</td>${[13, 8, 5].map(k => `<td class="num">${pct(expFit(T.sev, k), 1)}</td>`).join('')}</tr></tbody></table></div>
      <p class="cap">Quarters ending 1994Q4 through 1997Q4.</p></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">5</span>Classification data <span class="pill">illustrative</span> <span class="pill st">Stretch</span></h3>${clsfTable()}</section>`;
    return h;
  },

  tasks: [
    { id: 'p1', tier: 'F', type: 'bench', title: 'Develop the experience period to ultimate', bench: 'pdev',
      prompt: () => `Select three development factors: 12–24, 24–36, and 36 months to ultimate (all later development combined). The averages come from Exhibit 1.`,
      check: st => {
        const f12 = num(st.f12), f24 = num(st.f24), f36 = num(st.f36);
        if (![f12, f24, f36].every(isFinite)) return { ok: false, msg: 'Enter all three factors.' };
        if (f12 < 1.1 || f12 > 1.4) return { ok: false, msg: 'Your 12–24 factor is far from the historical range (about 1.19–1.33). Check Exhibit 1.' };
        return { ok: true, msg: 'Complete. These feed the ultimate losses in the indication.' };
      } },
    { id: 'p2', tier: 'F', type: 'multi', title: 'On-level factors', prompt: () => `Using Exhibit 2 and the parallelogram method, compute the on-level factor for each accident year (4 decimals).`,
      fields: [['olf95', 'AY 1995', 0], ['olf96', 'AY 1996', 1], ['olf97', 'AY 1997', 2]], answer: k => OLF[k], tol: 0.0015,
      explain: () => `OLFs: ${OLF.map(x => x.toFixed(4)).join(', ')}. For example, AY1995: 1.0815 ÷ (0.875 × 1.000 + 0.125 × 1.050) = 1.0815 ÷ 1.00625 = 1.0748.` },
    { id: 'p3', tier: 'F', type: 'bench', title: 'Select loss trend', bench: 'ptrend',
      prompt: () => `Select annual frequency and severity trends (in %) from Exhibit 4.`,
      check: st => { const a = num(st.freqT), b = num(st.sevT); if (!isFinite(a) || !isFinite(b)) return { ok: false, msg: 'Enter both trends.' }; if (b < 0 || b > 10) return { ok: false, msg: 'That severity trend is outside anything Exhibit 4 supports.' }; return { ok: true, msg: 'Complete. Your pure premium trend is ' + pct((1 + a / 100) * (1 + b / 100) - 1, 2) + ' per year.' }; } },
    { id: 'p4', tier: 'F', type: 'multi', title: 'Trend periods', prompt: () => `New rates apply to annual policies written January 1 to December 31, 1999. How many years should each accident year's losses be trended?`,
      fields: [['tl95', 'AY 1995', 0], ['tl96', 'AY 1996', 1], ['tl97', 'AY 1997', 2]], answer: k => [4.5, 3.5, 2.5][k], tol: 0.01,
      explain: () => 'From 7/1/1995 to 1/1/2000 is 4.5 years, then 3.5 and 2.5 for AY1996 and AY1997.' },
    { id: 'p5', tier: 'F', type: 'num', title: 'Permissible loss ratio', prompt: () => `Using Exhibit 3, what is the variable permissible loss ratio, 1 − V − Q? (as a %)`, answer: () => (1 - EXP.V - EXP.Q) * 100, tol: 0.05,
      explain: () => '1 − 0.20 − 0.05 = 75%. Fixed expenses are added to the numerator of the indication instead.' },
    { id: 'p6', tier: 'F', type: 'bench', title: 'Build the indication', bench: 'pind',
      prompt: () => `Choose weights for the three accident years (must total 100%). The calculator brings your earlier work together into the indicated rate change.`,
      check: st => { const c = pCalcSt(st); if (!isFinite(c.ind)) return { ok: false, msg: 'Finish the development, on-level, trend and trend-period tasks, then enter weights.' }; if (Math.abs(c.wsum - 1) > 0.001) return { ok: false, msg: 'Weights must total 100%.' }; return { ok: true, msg: 'Your indicated change is ' + spct(c.ind) + '.' }; } },
    { id: 'p7', tier: 'S', type: 'num', title: 'One-way relativity', prompt: () => `Exhibit 5 (below) has illustrative exposures and losses by driver age and territory. What is the one-way youthful relativity (youthful pure premium ÷ adult pure premium)? (3 decimals)`,
      answer: () => CLSF.oneway_age[0], tol: 0.006, extra: () => clsfTable(),
      explain: () => `One-way: ${CLSF.oneway_age[0].toFixed(3)}. A minimum bias / Poisson GLM fit to the same data gives ${CLSF.glm_age[0].toFixed(3)}.` },
    { id: 'p8', tier: 'S', type: 'mcq', title: 'Why do they differ?', prompt: () => `The multivariate youthful relativity is ${CLSF.glm_age[0].toFixed(2)}, well below the one-way ${CLSF.oneway_age[0].toFixed(2)}. Why?`,
      options: ['The GLM ignores youthful drivers in rural territories.', 'Youthful drivers are concentrated in the urban territory, which is high-cost for everyone. The one-way relativity absorbs part of the territory effect, so rating on both would double-count it.', 'One-way relativities are always too high by about 15%.', 'The data has too few youthful exposures to be credible.'],
      correct: 1, explain: 'In Exhibit 5, 64% of youthful exposure is urban versus 32% for adults. The multivariate fit separates the age effect from the territory effect.' },
    { id: 'p9', tier: 'F', type: 'pick', title: 'Lock your filed change', prompt: () => `Enter the overall rate change (%) you recommend Prairie Mutual file, then lock it to unlock the Debrief.`, key: 'pick' },
  ],
  pickShow: st => (num(st.pick) >= 0 ? '+' : '') + st.pick + '% filed change',
  pickHint: '%, e.g. 8',

  stages: [['Develop', ['p1']], ['On-level', ['p2']], ['Trend', ['p3', 'p4']], ['Indicate', ['p5', 'p6']], ['Classification', ['p7', 'p8'], true], ['Decide', ['p9']]],

  hints: {
    p1: ['Each factor measures growth in reported losses between two ages. The averages row is your starting point.', 'Use the volume-weighted values: about 1.233, 1.050 and 0.989. Small adjustments are fine if you can explain them.',
      () => `Model selections: 1.233, 1.050, 0.990.<br>${setBtn({ f12: '1.233', f24: '1.050', f36: '0.990' })}`],
    p2: ['OLF = current rate level ÷ average rate level earned in the accident year. Start by writing down the three rate levels: before 7/1/1995, after it, and after 7/1/1997.', 'Rate levels: 1.000, then 1.050, then 1.0815. For AY1995, 12.5% of earned premium is at 1.050. For AY1996, 87.5% is at 1.050 and the rest at 1.000. For AY1997, 87.5% is at 1.050 and 12.5% at 1.0815. OLF = 1.0815 ÷ average level.'],
    p3: ['Look at the fitted rates in Exhibit 4. Longer windows are more stable; shorter ones react faster.', 'The 13-point fits use the most data: frequency about −0.9%, severity about +3.6%. Enter values near those unless you can justify a shorter window.',
      () => `Model: frequency −1.0%, severity +3.5%.<br>${setBtn({ freqT: '-1.0', sevT: '3.5' })}`],
    p4: ['Trend runs from the average accident date of each accident year to the average accident date of the new policies.', 'AY1995\'s average accident date is 7/1/1995. Policies written during 1999 have an average written date of 7/1/1999 and an average accident date of 1/1/2000.'],
    p5: ['Variable expenses and profit come off the top of every premium dollar.', '1 − 0.20 − 0.05.'],
    p6: ['Weights decide how much each year counts. Recent years reflect today\'s book; older years are better developed.', 'Try 20, 30, 50 to lean on recent experience, then 33.3, 33.3, 33.4 for equal weights. Compare the two indications.',
      () => `Model weights: 20/30/50, giving +11.2% with the model inputs.<br>${setBtn({ w95: '20', w96: '30', w97: '50' })}`],
    p7: ['Ignore territory completely: add up across each row of Exhibit 5.', () => { const C = CLSF, py = sum(C.loss[0]) / sum(C.expo[0]), pa = sum(C.loss[1]) / sum(C.expo[1]); return `Youthful pure premium = ${fmt(sum(C.loss[0]))} ÷ ${fmt(sum(C.expo[0]))} = $${fmt(py, 2)}. Adult = ${fmt(sum(C.loss[1]))} ÷ ${fmt(sum(C.expo[1]))} = $${fmt(pa, 2)}. Divide youthful by adult.`; }],
    p8: ['Compare where youthful drivers live with where adults live in Exhibit 5.', 'Calculate the share of youthful exposure that is urban, and the same share for adults.'],
  },

  model: () => {
    const c = pCalc(P, MODEL_ST);
    return `<h3>Model solution</h3><div class="prose">
    <p><b>Development.</b> 12–24 = 1.233 and 24–36 = 1.050 (all-year volume-weighted). For 36-to-ultimate, 0.990: the factors after 36 months multiply to about 0.989, a small but consistent takedown of case reserves.</p>
    <p><b>On-level.</b> ${OLF.map(x => x.toFixed(4)).join(', ')}. <b>Trend.</b> Frequency −1.0% (13-point, stable) and severity +3.5% (13-point; the 8-point 4.3% looks driven by a few quarters), giving pure premium ${pct(c.tr, 2)} per year over 4.5 / 3.5 / 2.5 years.</p>
    <p><b>Projected loss & LAE ratios:</b> ${c.lr.map((x, k) => P_AYS[k] + ' ' + pct(x)).join(', ')}. Weighted 20/30/50: ${pct(c.wlr)}. <b>Indication:</b> (${pct(c.wlr)} + 6.0%) ÷ 75% − 1 = <b>${spct(c.ind)}</b>.</p>
    <p><b>Recommendation.</b> The indication is about +11%, but AY1997 is ten points better than 1995–1996. A strong answer neither ignores that nor treats it as proven. Reasonable filings range from about +7% to +11%. One example: file +8% now, flag that the indication supports more, and commit to re-reviewing once AY1997 reaches 24 months. Address retention and competition explicitly, and say what evidence would change the recommendation.</p></div>`;
  },

  debrief(st) {
    const cc = pCalcSt(st), pick = num(st.pick), modelInd = pCalc(P, MODEL_ST).ind;
    const act = P_IDX.map(i => P.actual10[i]);
    const eq = pCalc(P, Object.assign({}, MODEL_ST, { w95: '33.333', w96: '33.333', w97: '33.334' })).ind;
    return `<div class="stack-lg">
      <div class="kpis">
        <div class="kpi"><div class="l">Your indicated change</div><div class="v">${isFinite(cc.ind) ? spct(cc.ind) : '—'}</div></div>
        <div class="kpi hero"><div class="l">Your filed change</div><div class="v">${isFinite(pick) ? (pick >= 0 ? '+' : '') + pick + '%' : '—'}</div></div>
        <div class="kpi"><div class="l">Model indication</div><div class="v">${spct(modelInd)}</div></div>
      </div>
      <div class="card"><div class="small muted" style="margin-bottom:6px">Where your filing sits</div>${barChart([
        { l: 'Your filed change', v: pick / 100, c: 'var(--chart-3)', strong: true },
        { l: 'Your indication', v: cc.ind, c: 'var(--chart-1)' },
        { l: 'Model indication (20/30/50)', v: modelInd, c: 'var(--chart-2)' },
        { l: 'Equal weights', v: eq, c: 'var(--chart-muted)' }], { fmt: v => spct(v), aria: 'Rate changes compared' })}
        <p class="cap">Reasonable filings range from about +7% to +11%.</p></div>
      <div class="callout"><b>The judgment that matters.</b> AY1997 is about ten points better than 1995–1996. With 20/30/50 weights the indication is about ${spct(modelInd, 0)}; with equal weights it is about ${spct(eq, 0)}. Neither is wrong. What judges look for is that you <i>noticed</i> it, explained your choice, and connected the filing to retention, competition and regulatory support.</div>
      <div><h3 style="margin-bottom:10px">How did your development hold up?</h3><div class="tblwrap"><table><thead><tr><th>AY</th><th>Your ultimate</th><th>Reported at 120 months</th><th>Difference</th></tr></thead><tbody>${P_AYS.map((y, k) => `<tr><td>${y}</td><td class="num">${fmt(cc.ult[k])}</td><td class="num">${fmt(act[k])}</td><td class="num">${isFinite(cc.ult[k]) ? pct(cc.ult[k] / act[k] - 1) : '—'}</td></tr>`).join('')}</tbody></table></div>
      <p class="cap">From the same company's later Schedule P filings. Short-tailed auto liability develops quickly, so development error is small here. The judgment calls that move the answer are trend, weighting and the filing decision.</p></div>
      <div class="card">${this.model()}</div></div>`;
  },

  modelSummary: `**Recommendation:** File an overall increase of +8% effective January 1, 1999, while documenting that the actuarial indication is +11.2%. Re-review once accident year 1997 reaches 24 months.

**Indication:** We used accident years 1995–1997 developed to ultimate (factors 1.233, 1.050, 0.990), premium brought to current rate level (on-level factors 1.075, 1.036, 1.026), and losses trended at 2.5% a year (frequency −1.0%, severity +3.5%) to the 1999 policy period. Projected loss and LAE ratios are 81.7%, 85.5% and 70.8%; weighted 20/30/50, 77.4%. With a 6% fixed expense ratio and a 75% variable permissible loss ratio, the indicated change is +11.2%.

**Judgment:** 1997 is about ten points better than 1995–1996. It is the least developed year, so it may deteriorate, but it also best reflects the current book after the 1995 and 1997 increases. Equal weights would indicate about +14%; our weighting already credits part of the improvement.

**Why file less than indicated:** agents report pressure from direct writers, and a double-digit increase on top of the July 1997 change risks retention. Filing +8% closes most of the gap, keeps the filing well supported for regulators, and leaves room for a second step.

**Risks:** If 1997's improvement is noise, the shortfall persists and a further increase will be needed. Severity trend is the next most sensitive assumption: each 1% of annual trend moves the indication by about 3 points.`,

  judgeBank: [
    ['Why did you weight accident year 1997 the way you did?', 'Balances responsiveness (1997 best reflects the current book and recent rate changes) against stability (it is the least developed year). States what equal weights would give and why that choice is reasonable.'],
    ['Why that severity trend instead of the 8-point fit?', 'Compares the fits. Recognizes the 8-point figure may be driven by a few quarters. Explains the choice with reference to stability and any external evidence, and gives the sensitivity.'],
    ['How sensitive is your indication to the trend assumption?', 'Roughly 3 points of indication per 1% of annual trend over about 3.5 years of trend. Names trend as a key driver.'],
    ['What happens if you skip on-leveling the premium?', 'Historical premium was collected at lower rates. Without on-leveling, loss ratios look worse than they are at current rates, and the indication is overstated.'],
    ['The regulator asks why you filed less than the indication. What do you say?', 'The indication supports the filed amount and more. The company chose a smaller change for business reasons (retention, competition) and will monitor experience. Regulators mostly ask whether rates are excessive or inadequate.'],
    ['Sales says any increase will lose customers. How do you respond?', 'Acknowledges the retention risk, then quantifies the cost of under-pricing. Proposes phasing or targeted changes, and suggests retention analysis by segment.'],
    ['What is the risk of filing too little?', 'Continued underwriting losses, adverse selection if competitors price more accurately, and a larger correction later.'],
    ['Why is your 36-to-ultimate factor below 1.000?', 'Reported losses for this company historically fell slightly after 36 months as case reserves were taken down. That is a consistent pattern, not one outlier. States the effect of using 1.000 instead.'],
    ['Is this company\'s experience credible enough on its own?', 'About $35–53M of annual premium in auto liability is a large volume, likely close to fully credible statewide, but less so for individual classes or territories. Mentions a complement such as industry trend.'],
    ['(Stretch) Should the youthful driver relativity change, given the GLM result?', 'The one-way relativity double-counts territory because youthful drivers concentrate in urban areas. Moving toward the multivariate value avoids overcharging. Notes that changes may need to be capped or phased.'],
  ],

  context(st) {
    const c = pCalcSt(st);
    return `CASE: Prairie Mutual (fictional name, real Schedule P private passenger auto liability data, $000). Pricing annual policies written in 1999. Experience AY1995-97. Illustrative: rate changes +5% 7/1/1995, +3% 7/1/1997; V 20%, F 6%, Q 5%, ULAE 1.05; trend fits freq about -0.9%, sev about +3.6% (13-pt). Sales worried about retention vs direct writers. AY1997 loss ratio notably better than 1995-96.
STUDENT WORK: dev factors ${st.f12 || '?'}, ${st.f24 || '?'}, ${st.f36 || '?'}; OLFs ${st.olf95 || '?'}, ${st.olf96 || '?'}, ${st.olf97 || '?'}; trends freq ${st.freqT || '?'}% sev ${st.sevT || '?'}%; trend periods ${st.tl95 || '?'}, ${st.tl96 || '?'}, ${st.tl97 || '?'}; weights ${st.w95 || '?'}/${st.w96 || '?'}/${st.w97 || '?'}; projected LRs ${c.lr.map(x => pct(x)).join(', ')}; indicated change ${isFinite(c.ind) ? pct(c.ind) : 'n/a'}; recommended filed change ${st.pick ? st.pick + '%' : 'not yet selected'}.`;
  },

  workbook: {
    inputs: ['B26:D26', 'B38:B39', 'F43:F45', 'H43:H45', 'K43:K45'],
    cols: { A: 230 },
    formats: { 'B12:L21': 'int', 'B25:D26': 'dec3', 'B30:B31': 'pct1', 'B34': 'dec3', 'B35:B40': 'pct2', 'B43:B45': 'int', 'C43:C45': 'dec3', 'D43:E45': 'int', 'F43:F45': 'dec4', 'G43:G45': 'int', 'H43:H45': 'dec3', 'I43:I45': 'dec4', 'J43:J45': 'pct1', 'K43:K45': 'pct0', 'B47': 'pct1', 'B48': 'pct2', 'C50:G51': 'pct2', 'B53:B65': 'dec2', 'C53:C65': 'int' },
    links: [{ cell: 'B26', path: 'f12' }, { cell: 'C26', path: 'f24' }, { cell: 'D26', path: 'f36' },
      { cell: 'F43', path: 'olf95' }, { cell: 'F44', path: 'olf96' }, { cell: 'F45', path: 'olf97' },
      { cell: 'H43', path: 'tl95' }, { cell: 'H44', path: 'tl96' }, { cell: 'H45', path: 'tl97' },
      { cell: 'K43', path: 'w95', scale: 0.01 }, { cell: 'K44', path: 'w96', scale: 0.01 }, { cell: 'K45', path: 'w97', scale: 0.01 },
      { cell: 'B38', path: 'freqT', scale: 0.01 }, { cell: 'B39', path: 'sevT', scale: 0.01 }],
  },
  csv() {
    const r = [], L = colL;
    r.push(['OpenActuary | Should We File? (Prairie Mutual) | amounts in $000']);
    r.push(['Data: CAS Loss Reserving Database (Schedule P, private passenger auto, NAIC group ' + P.grcode + '). Rate history, trend data, expenses: illustrative.']);
    r.push(['HOW TO USE: fill every cell marked YOUR INPUT. All other cells below the triangle are live formulas.']);
    r.push(['STEP 1: Select development factors in B26:D26 (row 25 shows volume-weighted averages; D25 multiplies all factors from 36 months on).']);
    r.push(['STEP 2: On-level factors (F43:F45): OLF = current rate level / average rate level earned in that AY (parallelogram method, see Learn tab). Current level = 1.05 x 1.03 = 1.0815.']);
    r.push(['STEP 3: Trend (B38, B39) as decimals, e.g. 0.035. Fit results are in rows 50-51 using LOGEST; annual rate = LOGEST(quarterly series)^4 - 1.']);
    r.push(['STEP 4: Trend periods (H43:H45): years from 7/1 of the AY to 1/1/2000 (average accident date for policies written in 1999).']);
    r.push(['STEP 5: Weights (K43:K45) as decimals summing to 1. Indicated change is in B48: (weighted projected loss & LAE ratio + F) / (1 - V - Q) - 1.']);
    r.push([]); r.push([]);
    r.push(['AY'].concat(AGES).concat(['Net EP']));
    P.tri.forEach((row, i) => r.push([P.ays[i]].concat(row.map(v => v == null ? '' : v)).concat([P.ep[i]])));
    r.push([]); r.push(['Development factors']);
    r.push(['', '12-24', '24-36', '36-ult']);
    const vw = j => { const last = 12 + 8 - j; return `SUM(${L(j + 2)}12:${L(j + 2)}${last})/SUM(${L(j + 1)}12:${L(j + 1)}${last})`; };
    r.push(['Vol-wtd all years', '=' + vw(0), '=' + vw(1), '=' + [2, 3, 4, 5, 6, 7, 8].map(vw).join('*')]);
    r.push(['SELECTED (YOUR INPUT)', '', '', '']);
    r.push([]); r.push(['Rate history (illustrative)']);
    r.push(['Effective', 'Change']); r.push(['1995-07-01', 0.05]); r.push(['1997-07-01', 0.03]);
    r.push([]); r.push(['Assumptions']);
    r.push(['ULAE factor', EXP.ULAE]); r.push(['V (variable expense)', EXP.V]); r.push(['F (fixed expense)', EXP.F]); r.push(['Q (profit)', EXP.Q]);
    r.push(['Frequency trend (YOUR INPUT)', '']); r.push(['Severity trend (YOUR INPUT)', '']); r.push(['Pure premium trend', '=(1+B38)*(1+B39)-1']);
    r.push([]);
    r.push(['AY', 'Reported', 'CDF', 'Ultimate', 'Net EP', 'OLF (YOUR INPUT)', 'On-level EP', 'Trend yrs (YOUR INPUT)', 'Trend factor', 'Proj loss & LAE ratio', 'Weight (YOUR INPUT)']);
    const cdfF = ['=$D$26', '=$C$26*$D$26', '=$B$26*$C$26*$D$26'];
    [7, 8, 9].forEach((i, k) => { const rr = 43 + k, a = 9 - i; r.push([P.ays[i], `=${L(a + 1)}${12 + i}`, cdfF[k], `=B${rr}*C${rr}`, `=L${12 + i}`, '', `=E${rr}*F${rr}`, '', `=(1+$B$40)^H${rr}`, `=D${rr}*I${rr}*$B$34/G${rr}`, '']); });
    r.push([]);
    r.push(['Weighted projected loss & LAE ratio', '=SUMPRODUCT(J43:J45,K43:K45)/SUM(K43:K45)']);
    r.push(['INDICATED RATE CHANGE', '=(B47+B36)/(1-B35-B37)-1']);
    r.push([]);
    const T = TREND, q1 = 53, q2 = 53 + T.q.length - 1;
    r.push(['Frequency fit (annual)', '13-point', `=LOGEST(B${q1}:B${q2})^4-1`, '8-point', `=LOGEST(B${q2 - 7}:B${q2})^4-1`, '5-point', `=LOGEST(B${q2 - 4}:B${q2})^4-1`]);
    r.push(['Severity fit (annual)', '13-point', `=LOGEST(C${q1}:C${q2})^4-1`, '8-point', `=LOGEST(C${q2 - 7}:C${q2})^4-1`, '5-point', `=LOGEST(C${q2 - 4}:C${q2})^4-1`]);
    r.push(['Quarter ending', 'Frequency per 100 car-yrs', 'Severity $']);
    T.q.forEach((q, i) => r.push([q, T.freq[i], T.sev[i]]));
    return r;
  },
};
