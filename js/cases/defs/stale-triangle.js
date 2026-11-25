// The Stale Triangle: workers compensation reserving on real Schedule P data. Ported from P&C Case Lab.
import { fmt, pct, num, sum, colL } from '../../util.js';
import { lineChart, barChart } from '../../ui/charts.js';
import { AGES, N, avgFactors, devCalc } from '../lib/reserving.js';
import { R, R_LAT, R_CARRIED, R_ACT_IBNR, R_CL_ALL, rCalc, rBf } from '../lib/datasets.js';

const m1 = x => '$' + fmt(x / 1000, 1) + 'M';
const setBtn = (obj, label = 'Use these values') => `<button class="btn sm ghost" style="margin-top:8px" data-setstate='${JSON.stringify(obj).replace(/'/g, '&#39;')}'>${label}</button>`;

export default {
  id: 'stale-triangle',
  title: 'The Stale Triangle',
  sub: 'Workers compensation reserving',
  line: 'pc',
  level: 'advanced',
  levelLabel: 'CAS Exam 5 level',
  minutes: 90,
  icon: 'layers',
  audience: 'board',
  tagline: 'A fast-growing insurer\'s CFO wants to release reserves. Is the triangle telling the truth?',
  concepts: ['IBNR', 'Loss development', 'Chain ladder', 'Tail factors', 'Bornhuetter-Ferguson', 'Cape Cod'],
  exam: 'These methods are core to the CAS basic reserving syllabus (Exam 5).',
  inspiration: [
    ['CAS Workers Compensation Reserving case competition toolkit', 'https://www.casstudentcentral.org/?p=3048'],
    ['CAS Loss Reserving Data Pulled from NAIC Schedule P', 'https://www.casact.org/publications-research/research/research-resources/loss-reserving-data-pulled-naic-schedule-p']],
  source: `Real data: Schedule P, workers compensation, NAIC group ${R.grcode}, net reported incurred loss and defense & cost containment expense, accident years 1988–1997 valued 12/31/1997. Outcomes are the same company's later filings through 2006. The company name is fictional.`,

  brief: () => `
  <div class="prose">
    <p><b>Your role:</b> consulting actuary to <b>Lakeshore Timber Mutual</b>, a regional insurer that writes workers compensation for logging, sawmill and wood-products employers. It is February 1998 and the company is closing its 1997 books.</p>
    <p><b>The situation:</b> Lakeshore has grown fast. Net earned premium went from about $6.7 million in 1990 to $44.2 million in 1996 as the company expanded into new states and larger accounts. Management currently carries <b>${m1(R_CARRIED)}</b> of IBNR.</p>
    <p>The CFO has run a standard chain ladder on the reported-loss triangle and gets IBNR of only <b>${m1(R_CL_ALL)}</b>. She wants to release the difference, about ${m1(R_CARRIED - R_CL_ALL)}, which would turn a flat year into a strong one.</p>
    <div class="callout"><b>The question the board is asking you:</b> Is the chain ladder indication a sound basis for releasing reserves? What IBNR should Lakeshore carry at year-end 1997, and why?</div>
    <p><b>Deliverables:</b> a selected IBNR estimate with supporting work, and a one-page executive summary to the board (Recommend tab). Judges will probe your assumptions in the Q&amp;A drill.</p>
  </div>`,
  briefStats: () => [
    { l: 'Carried IBNR', v: R_CARRIED / 1000, pre: '$', suf: 'M', dec: 1 },
    { l: 'CFO\'s chain ladder', v: R_CL_ALL / 1000, pre: '$', suf: 'M', dec: 1 },
    { l: 'Premium growth 1990→1996', v: 44.2 / 6.7, suf: '×', dec: 1 },
  ],

  primers: [
    { t: 'Why reserves exist', tier: 'F', h: `<p>An insurer collects premium today but pays claims for years. A workers compensation claim can pay medical bills and lost wages for decades. At any year-end the company must estimate what it will still pay on accidents that have already happened.</p>
     <p><b>Reported incurred</b> = paid to date + case reserves (the claims adjusters' estimates on known claims). <b>Ultimate</b> is what the claims will finally cost. <b>IBNR</b> ("incurred but not reported") = ultimate − reported. It covers both claims nobody has reported yet and further growth on known claims.</p>
     <p>Reserves flow straight through the income statement: lowering IBNR by $1 raises pre-tax income by $1 this year. If the reserve proves too low, the shortfall hits a later year's earnings. That is why a release is a serious decision.</p>` },
    { t: 'Reading a development triangle', tier: 'F', h: `<p>Rows are <b>accident years</b> (when the injury happened). Columns are <b>age</b> in months since the start of the accident year. Each diagonal is one valuation date, so the bottom-left-to-top-right edge is what we know at 12/31/1997.</p>
     <p>An <b>age-to-age factor</b> (or link ratio) is the next value divided by the current one. It measures how much reported losses grew between two ages.</p>
     <div class="example"><b>Mini example.</b> An accident year reports 100 at 12 months, 130 at 24 and 143 at 36. Factors: 130/100 = 1.30 and 143/130 = 1.10.</div>` },
    { t: 'Chain ladder in three steps', tier: 'F', h: `<ol><li><b>Select</b> an age-to-age factor for each age, usually from averages of the historical factors.</li>
     <li><b>Chain</b> them into cumulative development factors (CDFs) by multiplying from the oldest age back. The CDF at 12 months = f(12–24) × f(24–36) × … × tail.</li>
     <li><b>Project</b>: ultimate = latest reported × CDF for that accident year's age. IBNR = ultimate − reported.</li></ol>
     <div class="example">If the CDF from 12 months to ultimate is 1.30 × 1.10 = 1.43 and a new accident year has reported 120, its ultimate is 120 × 1.43 = 171.6 and IBNR is 51.6.</div>
     <p><b>The key assumption:</b> future development will look like past development. That breaks when the book changes, for example through rapid growth, new types of risks, changes in how adjusters set case reserves, or new claims systems. Also note the leverage: on the youngest year, a small change in the factor moves the estimate a lot.</p>` },
    { t: 'Choosing factors and a tail', tier: 'F', h: `<p><b>Volume-weighted</b> averages (sum of later column ÷ sum of earlier column) give big years more say. <b>Simple</b> averages treat each year equally. <b>Latest-3 or latest-5</b> averages react to recent changes but are noisier.</p>
     <p>Things actuaries look for: trends down a column, outliers, and how many years support each factor. At old ages, a factor can rest on one or two small accident years.</p>
     <p>Factors below 1.000 mean reported losses fell, for example because case reserves were taken down or there was subrogation. They happen, but be skeptical about building them into the future for a line like workers compensation. A <b>tail factor</b> covers development after the last age in the triangle (here, 120 months). Workers compensation is known for long tails.</p>` },
    { t: 'Bornhuetter-Ferguson (BF)', tier: 'S', h: `<p>Chain ladder trusts the data completely. BF blends the data with an <b>expectation</b>:</p>
     <div class="formula">BF ultimate = reported + EP × ELR × (1 − 1/CDF)</div>
     <p>Here EP is earned premium and ELR is an <b>a priori expected loss ratio</b>, set from pricing assumptions, industry benchmarks, or mature years adjusted for rate and trend changes. The term (1 − 1/CDF) is the share of losses still expected to be reported. For a mature year it is near zero, so BF ≈ reported. For an immature year, BF leans on the expectation instead of multiplying a small, noisy number by a big CDF.</p>
     <div class="example">EP 1,000, ELR 70%, CDF 2.0 → unreported share 50% → BF IBNR = 1,000 × 0.70 × 0.50 = 350, regardless of what was reported.</div>` },
    { t: 'Cape Cod (Stanard–Bühlmann)', tier: 'S', h: `<p>Cape Cod gets the ELR from the data instead of assuming it:</p>
     <div class="formula">ELR = Σ reported ÷ Σ (EP ÷ CDF)</div>
     <p>EP ÷ CDF is the "used-up" premium, meaning the portion of premium whose losses should already be reported. The ELR then goes into the BF formula. The method assumes the true loss ratio is the same across years, so in practice premiums are adjusted for rate changes and losses for trend first. Ask yourself whether that assumption holds for a company whose book changed as much as Lakeshore's did.</p>` },
  ],

  exhibits: () => {
    const tri = R.tri;
    let h = `<section class="exhibit"><h3><span class="ex-n">1</span>Reported incurred loss &amp; DCC by accident year and age ($000)</h3><div class="tblwrap"><table><thead><tr><th>AY</th>${AGES.map(a => `<th>${a}</th>`).join('')}<th>Net EP</th></tr></thead><tbody>`;
    tri.forEach((r, i) => { h += `<tr><td>${R.ays[i]}</td>${r.map(v => v == null ? '<td class="na">·</td>' : `<td class="num">${fmt(v)}</td>`).join('')}<td class="num">${fmt(R.ep[i])}</td></tr>`; });
    h += `</tbody></table></div><p class="cap">Source: Schedule P via CAS Loss Reserving Database. "Reported" = paid + case reserves.</p></section>`;
    const lr = tri.map((r, i) => ({ c: i >= 5 ? 'var(--chart-1)' : 'var(--chart-muted)', v: r.map(v => v == null ? null : v / R.ep[i]), label: (i === 0 || i >= 6) ? String(R.ays[i]) : '', w: i >= 5 ? 2.4 : 1.4 }));
    h += `<section class="exhibit"><h3><span class="ex-n">2</span>Reported loss ratio by age</h3><div class="card">${lineChart(lr, { x: AGES, yfmt: v => Math.round(v * 100) + '%', min: 0.2, aria: 'Reported loss ratio by age for each accident year', h: 300 })}
    <div class="legend"><span><i style="background:var(--chart-1)"></i>1993–1997, the growth years</span><span><i style="background:var(--chart-muted)"></i>1988–1992</span></div></div></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">3</span>Carried IBNR at 12/31/1997 by accident year ($000)</h3><div class="tblwrap"><table><thead><tr><th>AY</th>${R.ays.map(a => `<th>${a}</th>`).join('')}<th>Total</th></tr></thead><tbody><tr><td>Carried IBNR</td>${R.carried.map(v => `<td class="num">${fmt(v)}</td>`).join('')}<td class="num">${fmt(R_CARRIED)}</td></tr></tbody></table></div><p class="cap">Management's booked bulk + IBNR reserve from the same Schedule P filing.</p></section>`;
    return h;
  },

  tasks: [
    { id: 'r1', tier: 'F', type: 'num', title: 'Compute one link ratio', prompt: () => `What is the 12–24 month age-to-age factor for accident year 1996? (3 decimals)`, answer: () => R.tri[8][1] / R.tri[8][0], tol: 0.0015,
      explain: () => `${fmt(R.tri[8][1])} ÷ ${fmt(R.tri[8][0])} = ${(R.tri[8][1] / R.tri[8][0]).toFixed(3)}.` },
    { id: 'r2', tier: 'F', type: 'num', title: 'Volume-weighted average', prompt: () => `What is the all-year volume-weighted average 12–24 factor? (3 decimals)`, answer: () => avgFactors(R.tri).vw[0], tol: 0.0015,
      explain: () => `Σ(24-month, AY88–96) ÷ Σ(12-month, AY88–96) = ${avgFactors(R.tri).vw[0].toFixed(3)}. The 1997 row is left out because it has no 24-month value yet.` },
    { id: 'r3', tier: 'F', type: 'mcq', title: 'Look before you average', prompt: () => `The 1988–1991 accident years earned less than $17M of premium each, while 1994–1997 earned $31–44M. Older ages (84 months and beyond) are supported only by those older years. What does that imply for factors at older ages?`,
      options: ['They are the most reliable factors in the triangle, because those years are fully mature.', 'They describe a smaller, different book, so the newer business may develop differently at those ages. Treat them with caution.', 'They should be replaced by the 12–24 factor, since every age develops the same way.', 'They prove that workers compensation has no development after 7 years.'],
      correct: 1, explain: 'Late-age factors here come from a handful of small, older accident years written before Lakeshore expanded. The growth years may involve new states, bigger accounts and different claim handling. Nothing in the triangle tells you yet how they will develop after year 7.' },
    { id: 'r4', tier: 'F', type: 'bench', title: 'Select development factors and a tail', bench: 'rsel',
      prompt: () => `Pick an age-to-age factor for each age and a tail factor (120 months to ultimate). Use the averages as guides, not answers. The table below projects ultimate losses and IBNR as you type.`,
      check: st => {
        const c = rCalc(st); if (!c) return { ok: false, msg: 'Enter all nine factors and a tail factor.' };
        const s = (st.sel || []).map(num), t = num(st.tail);
        const bad = s.slice(5).some(x => x < 1) || t < 1;
        return bad ? { ok: true, msg: 'Complete. Note that some of your late factors or your tail are below 1.000. Make sure you can defend assuming reported losses will fall at those ages for a workers compensation book.' }
          : { ok: true, msg: `Complete. Compare your IBNR with the CFO's ${m1(R_CL_ALL)} and the carried ${m1(R_CARRIED)}.` };
      } },
    { id: 'r5', tier: 'F', type: 'mcq', title: 'Where does IBNR sit?', prompt: () => `On a chain ladder, which accident years drive most of the IBNR, and why does that matter for this decision?`,
      options: ['The oldest years, because they have the most claims.', 'The most recent years (especially 1996–1997), because they have the largest CDFs. Those years belong to the newest and least-understood part of the book.', 'All years equally, because IBNR is proportional to premium.', 'None. IBNR is a company-level figure that cannot be split by year.'],
      correct: 1, explain: 'Most of the IBNR comes from the youngest years, where large CDFs multiply small reported amounts. Those are also the growth years, so the estimate rests on the least reliable part of the data.' },
    { id: 'r6', tier: 'S', type: 'num', title: 'Used-up premium', prompt: st => rCalc(st) ? `Using your selected CDFs, what is the "used-up" premium for accident year 1997 (EP ÷ CDF at 12 months)? Round to the nearest $000.` : `Complete the factor selection task first.`,
      answer: st => { const c = rCalc(st); return c ? R.ep[9] / c.cdf[9] : NaN; }, rtol: 0.004,
      explain: st => { const c = rCalc(st); return c ? `${fmt(R.ep[9])} ÷ ${c.cdf[9].toFixed(3)} = ${fmt(R.ep[9] / c.cdf[9])}. Cape Cod adds this up across years and divides total reported losses by it, giving an ELR of ${pct(c.ccElr)} with your factors.` : ''; } },
    { id: 'r7', tier: 'S', type: 'bench', title: 'Bornhuetter-Ferguson and Cape Cod', bench: 'rbf',
      prompt: () => `Set an a priori expected loss ratio for the BF method. The table shows the ultimate loss ratios that chain ladder implies by year, plus the Cape Cod ELR calculated from your factors.`,
      check: st => { const e = num(st.elr); if (!isFinite(e)) return { ok: false, msg: 'Enter an a priori ELR (as a %).' }; if (!rCalc(st)) return { ok: false, msg: 'Complete the factor selection task first.' }; return { ok: true, msg: (e < 60 ? 'Complete. Your ELR is below what the mature years ran at. Be ready to explain why the new business should be cheaper.' : 'Complete.') }; } },
    { id: 'r8', tier: 'S', type: 'mcq', title: 'What would you ask for?', prompt: () => `You can request one more piece of information before signing off. Which would most improve your estimate?`,
      options: ['The company\'s stock price history.', 'Claim counts and average case reserves by accident year, plus interviews with the claims department about changes in reserving practice and the new states and accounts.', 'A longer history of the 12–24 factor going back to 1980.', 'The CFO\'s earnings target for 1998.'],
      correct: 1, explain: 'Claim counts and average case reserves show whether development patterns changed as the book grew. Talking to claims staff tells you about process changes. Reserving actuaries call this "getting out of the triangle."' },
    { id: 'r9', tier: 'F', type: 'pick', title: 'Lock your IBNR selection', prompt: () => `Enter your selected IBNR for all accident years combined ($000), then lock it. Locking unlocks the Debrief, which shows what actually happened.`, key: 'pick' },
  ],
  pickShow: st => fmt(num(st.pick)) + ' ($000 of IBNR)',
  pickHint: '$000, e.g. 21500',

  stages: [['Read the data', ['r1', 'r2', 'r3']], ['Select factors', ['r4']], ['Interpret', ['r5']], ['Alternative methods', ['r6', 'r7', 'r8'], true], ['Decide', ['r9']]],

  hints: {
    r1: ['Find the 1996 row in Exhibit 1. You need two numbers from it.', () => `Factor = 24-month value ÷ 12-month value = ${fmt(R.tri[8][1])} ÷ ${fmt(R.tri[8][0])}.`],
    r2: ['Volume-weighted means you add up the columns first, then divide, rather than averaging the individual factors.', () => { const a = sum(R.tri.slice(0, 9).map(r => r[1])), b = sum(R.tri.slice(0, 9).map(r => r[0])); return `Sum of 24-month values for 1988–1996 = ${fmt(a)}. Sum of 12-month values for the same years = ${fmt(b)}. Divide the first by the second.`; }],
    r3: ['Which accident years supply the data at 84 months and beyond? What did the company look like when those were written?', 'Two options claim the late factors are reliable or universal. With only a few small, old years behind them, can either be true?'],
    r4: ['Start from the all-year volume-weighted row with the Fill button, then ask at each age whether those years are a fair guide to the 1993–1997 book.', `Fill with "Vol-wtd all", then change only ages 84–108 so none is below 1.000, and set a tail between 1.000 and 1.020. Compare your total IBNR with the CFO's ${m1(R_CL_ALL)} and the carried ${m1(R_CARRIED)}.`,
      () => `One reasonable selection: ${R.model.sel.map(x => x.toFixed(3)).join(', ')} with a tail of ${R.model.tail.toFixed(3)}, giving IBNR of about $18.9M. Other selections are fine if you can explain them.<br>${setBtn({ sel: R.model.sel.map(x => x.toFixed(3)), tail: R.model.tail.toFixed(3) }, 'Use this selection')}`],
    r5: ['Look at the IBNR column in the projection table from the previous task.', 'Which rows have the largest CDFs? Those multiply the reported amount the most.'],
    r6: ['Used-up premium is earned premium divided by the CDF.', st => { const c = rCalc(st); return c ? `${fmt(R.ep[9])} (AY1997 earned premium) ÷ ${c.cdf[9].toFixed(3)} (your 12-month CDF).` : 'Complete the factor selection task first.'; }],
    r7: ['The mature years are the best evidence of what this business costs. Look at their loss ratios.', 'Average the "CL ult LR" column for 1988–1992, then decide whether the newer business should be cheaper. Most defensible answers fall between about 65% and 85%.',
      () => `A reasonable a priori ELR is 72%: below the mature years, to allow for better-priced new accounts, but well above what chain ladder implies for 1995–1997.<br>${setBtn({ elr: '72' }, 'Use 72%')}`],
    r8: ['Which information would tell you whether the new business develops differently from the old?', 'Rule out anything that is not about the claims themselves.'],
  },

  model: () => {
    const sel = R.model.sel, tail = R.model.tail, c = devCalc(R.tri, R.ep, sel, tail), cl = sum(c.ult) - c.sumLatest;
    return `<h3>Model solution</h3>
    <div class="prose"><p><b>Factors.</b> Selected 12–24 at the all-year volume-weighted ${sel[0].toFixed(3)}. The latest-3 average (1.319) is lower, but one could argue either way. Then ${sel.slice(1).map(x => x.toFixed(3)).join(', ')}, with a tail of ${tail.toFixed(3)}. The historical factors below 1.000 at 96+ months rest on one to three small, old accident years. For a long-tailed workers compensation book those were replaced with small positive development.</p>
    <p><b>Indications.</b> Chain ladder with these selections: ${m1(cl)}. Cape Cod (ELR ${pct(c.ccElr)}): ${m1(rBf(c, c.ccElr))}. BF with an a priori ELR of 72% (below the 1988–1992 experience to allow for growth into better-priced accounts, but well above what chain ladder implies for 1995–1997): ${m1(rBf(c, 0.72))}.</p>
    <p><b>Recommendation.</b> Do not release to the chain ladder figure. The indicated range of about $19–22M sits below the carried ${m1(R_CARRIED)}, but every method leans on development patterns from a much smaller, older book. The 1993–1997 years are both the bulk of the IBNR and the least understood. A strong answer recommends holding carried reserves, or at most a modest release, until claims data by year and a claims-department review confirm the new business is really performing better. It also names the upside risk explicitly.</p></div>`;
  },

  debrief(st) {
    const cc = rCalc(st), e = num(st.elr) / 100, pick = num(st.pick);
    const items = [{ l: 'CFO: chain ladder, no tail', v: R_CL_ALL, c: 'var(--chart-muted)' }];
    if (cc) items.push({ l: 'Your chain ladder', v: sum(cc.ult) - cc.sumLatest, c: 'var(--chart-1)' });
    if (cc && isFinite(e)) items.push({ l: 'Your BF', v: rBf(cc, e), c: 'var(--chart-1)' });
    items.push({ l: 'Your selected IBNR', v: pick, c: 'var(--chart-3)', strong: true }, { l: 'Management carried', v: R_CARRIED, c: 'var(--chart-2)' }, { l: 'What actually emerged', v: R_ACT_IBNR, c: 'var(--chart-4)', strong: true });
    const err = isFinite(pick) ? pick / R_ACT_IBNR - 1 : NaN;
    return `<div class="stack-lg">
      <div class="kpis">
        <div class="kpi hero"><div class="l">Actual IBNR that emerged (by 2006)</div><div class="v" data-count="${(R_ACT_IBNR / 1000).toFixed(1)}" data-dec="1" data-prefix="$" data-suffix="M">${m1(R_ACT_IBNR)}</div></div>
        <div class="kpi"><div class="l">Your pick vs actual</div><div class="v" style="color:${Math.abs(err) < 0.15 ? 'var(--good)' : 'var(--bad)'}">${isFinite(err) ? (err >= 0 ? '+' : '') + pct(err) : '—'}</div></div>
        <div class="kpi"><div class="l">CFO's release would have been short by</div><div class="v" style="color:var(--bad)" data-count="${((R_ACT_IBNR - R_CL_ALL) / 1000).toFixed(1)}" data-dec="1" data-prefix="$" data-suffix="M">${m1(R_ACT_IBNR - R_CL_ALL)}</div></div>
      </div>
      <div class="card">${barChart(items, { fmt: m1, aria: 'IBNR estimates compared with what actually emerged' })}</div>
      <div class="callout"><b>What happened.</b> The growth years kept developing long after the old pattern said they should stop. AY1995, for example, went from ${fmt(R.tri[7][2])} at 36 months to ${fmt(R.actual10[7])} at 120 months (+${pct(R.actual10[7] / R.tri[7][2] - 1, 0)}), while the historical pattern implied only about 6% development after 36 months. Releasing to the chain ladder figure would have produced adverse development of roughly $${fmt((R_ACT_IBNR - R_CL_ALL) / 1000, 0)}M over the following years. Management's carried reserve, which presumably reflected knowledge outside the triangle, came within ${pct(Math.abs(R_CARRIED / R_ACT_IBNR - 1), 0)} of the outcome.</div>
      <div><h3 style="margin-bottom:10px">By accident year ($000)</h3><div class="tblwrap"><table><thead><tr><th>AY</th><th>Reported 12/97</th><th>Reported at 120 mo</th><th>Actual IBNR</th><th>CFO chain ladder IBNR</th>${cc ? '<th>Your CL IBNR</th>' : ''}<th>Carried</th></tr></thead><tbody>
      ${R.ays.map((y, i) => `<tr><td>${y}</td><td class="num">${fmt(R_LAT[i])}</td><td class="num">${fmt(R.actual10[i])}</td><td class="num">${fmt(R.actual10[i] - R_LAT[i])}</td><td class="num">${fmt(R.cl_ult[i] - R_LAT[i])}</td>${cc ? `<td class="num">${fmt(cc.ult[i] - cc.latest[i])}</td>` : ''}<td class="num">${fmt(R.carried[i])}</td></tr>`).join('')}</tbody></table></div>
      <p class="cap">"Actual" is the reported incurred value at 120 months from later Schedule P filings (1997 accident year valued at 2006). Workers comp can develop beyond that, so the true ultimate may be higher still.</p></div>
      <div class="card">${this.model()}</div></div>`;
  },

  modelSummary: `**Recommendation:** Do not release IBNR to the chain ladder figure of $14.7M. Hold carried IBNR of $26.1M until a claims review of accident years 1993–1997 is complete. Consider a modest release only after that review.

**Analysis:** The CFO's $14.7M comes from development factors driven by Lakeshore's small, pre-expansion book (1988–1992). Since 1990, premium has grown about sixfold through new states and larger accounts, and those newer accident years hold most of the IBNR. With judgmental factors (no factors below 1.000 at older ages and a 1.010 tail), chain ladder rises to $18.9M. Cape Cod gives $19.9M, and Bornhuetter-Ferguson with a 72% expected loss ratio gives $21.7M. Our indicated range is $19–22M.

**Why we still don't release to that range:** every method relies on development patterns from a different book. Chain ladder implies 1995–1997 will finish at 51–63% loss ratios, far better than the 74–89% the mature years produced, and we have no evidence the new business is that much better. The carried $26.1M sits above our range but within reasonable uncertainty for a book that changed this much.

**Risks:** If the new business develops like the old, carried reserves are $4–7M redundant. If it develops worse (new jurisdictions, larger accounts with longer claims), even $26M could be short. A release now would be hard to reverse.

**Next steps:** (1) claim counts and average case reserves by accident year; (2) a review with claims management of any changes in reserving practice; (3) re-review at mid-year 1998.`,

  judgeBank: [
    ['Why not simply use the latest-3 average for the 12–24 factor? It reflects the new book.', 'Acknowledges that recent years better reflect the current book, but are fewer and noisier. Notes the leverage: on AY1997 the 12–24 choice moves IBNR by millions. Shows the sensitivity of the answer to the choice and picks one with a reason.'],
    ['How did you choose your tail factor?', 'Workers comp develops for decades. Historical factors below 1.000 at old ages rest on one to three small accident years. Cites a reason for the tail (benchmark, judgment, curve fit) and states how much it moves IBNR.'],
    ['Where did your Bornhuetter-Ferguson expected loss ratio come from?', 'Mature-year loss ratios (74–89%), adjusted for any rate changes and for growth into different business. Admits it is judgment, and shows how IBNR changes for ±5 points.'],
    ['The CFO says carried IBNR is too conservative and is hurting earnings. How do you respond?', 'Reserves are estimates of real obligations, not an earnings lever. A release that proves wrong becomes adverse development later. Shows respect for the business pressure and offers a path (claims review, then revisit).'],
    ['What evidence would make you support a release?', 'Claim counts and closure rates showing the new book reports and settles faster; stable average case reserves; a claims-department review confirming no change in reserving practice; another year of development matching the old pattern.'],
    ['Which accident year worries you most, and why?', '1996 or 1997: the largest IBNR, the biggest development factors (leverage), and the newest, least-understood business.'],
    ['How would you explain the uncertainty to a board with no actuarial training?', 'Gives a range with a central estimate, names the one or two assumptions that drive it, and uses a plain scenario ("if the new business behaves like the old...").'],
    ['Is Cape Cod appropriate for this company?', 'Cape Cod assumes the same loss ratio for every year once rate and trend changes are adjusted for. Lakeshore\'s growth and pricing changes strain that assumption. It is useful as a cross-check, with that caveat stated.'],
    ['Why might development patterns change after rapid growth?', 'New claims staff or offices, different case reserving adequacy, a different mix of states, industries and account sizes, and larger accounts with more complex claims. Any of these makes old factors a poor guide.'],
    ['If you could have one more dataset, what would it be?', 'Claim counts (reported and closed) and a paid triangle by accident year, to separate claim volume from claim size and check case reserve adequacy.'],
  ],

  context(st) {
    const c = rCalc(st); const e = num(st.elr) / 100;
    return `CASE: Lakeshore Timber Mutual (fictional name, real Schedule P workers comp data, AY1988-1997 valued 12/31/1997, $000). Rapid growth: net EP ~6.7M (1990) to 44.2M (1996). Carried IBNR ${fmt(R_CARRIED)}. CFO's all-year volume-weighted chain ladder with no tail gives IBNR ${fmt(R_CL_ALL)} and she wants to release the difference. Mature AYs 1988-92 ran 74-89% ultimate loss ratios; chain ladder implies 51-63% for 1995-97.
STUDENT WORK: selected LDFs ${c ? (st.sel || []).join(', ') + ' tail ' + st.tail : 'not complete'}; student chain ladder IBNR ${c ? fmt(sum(c.ult) - c.sumLatest) : 'n/a'}; Cape Cod ELR ${c ? pct(c.ccElr) : 'n/a'}, CC IBNR ${c ? fmt(rBf(c, c.ccElr)) : 'n/a'}; BF a priori ELR ${isFinite(e) ? pct(e) : 'n/a'}, BF IBNR ${c && isFinite(e) ? fmt(rBf(c, e)) : 'n/a'}; selected IBNR ${st.pick || 'not yet selected'}.`;
  },

  workbook: {
    inputs: ['B38:K38', 'B54'],
    cols: { A: 210 },
    formats: { 'B11:L20': 'int', 'B24:J37': 'dec3', 'B38:K38': 'dec3', 'C42:C52': 'int', 'D42:D51': 'dec3', 'E42:G52': 'int', 'H42:H51': 'pct1', 'I42:K52': 'int', 'B54:B55': 'pct1', 'B56:B57': 'int' },
    links: [...Array.from({ length: 9 }, (_, j) => ({ cell: 'BCDEFGHIJ'[j] + '38', path: 'sel.' + j })), { cell: 'K38', path: 'tail' }, { cell: 'B54', path: 'elr', scale: 0.01 }],
  },
  csv() {
    const r = [], T = R.tri, n = 10, L = colL;
    r.push(['OpenActuary | The Stale Triangle (Lakeshore Timber Mutual) | amounts in $000']);
    r.push(['Data: CAS Loss Reserving Database (Schedule P, workers comp, NAIC group ' + R.grcode + '). Reported = paid + case reserves, net, valued 12/31/1997.']);
    r.push(['HOW TO USE: rows marked YOUR INPUT are blank for you to fill. Every other number below the triangle is a live formula: click a cell to see how it is calculated.']);
    r.push(['STEP 1: Age-to-age factors are in rows 24-32. Each is the later value divided by the earlier one, e.g. =C11/B11.']);
    r.push(['STEP 2: Averages are in rows 34-37. Volume-weighted = SUM of later column / SUM of earlier column over the same accident years.']);
    r.push(['STEP 3: Type selected factors in row 38 (B:J) and a tail factor in K38. The projection (rows 42-52) updates: CDF = PRODUCT of selected factors from that age onward x tail.']);
    r.push(['STEP 4 (stretch): Type an a priori ELR (e.g. 0.72) in B54. Columns I-K give Bornhuetter-Ferguson and Cape Cod IBNR. BF IBNR = EP x ELR x (1 - 1/CDF).']);
    r.push(['CHECK: Compare your total IBNR (F52) with the CFO chain ladder (B57) and carried IBNR (B56).']);
    r.push(['Reported incurred loss & DCC ($000)']);
    r.push(['AY'].concat(AGES).concat(['Net EP']));
    T.forEach((row, i) => r.push([R.ays[i]].concat(row.map(v => v == null ? '' : v)).concat([R.ep[i]])));
    r.push([]); r.push(['Age-to-age factors']);
    r.push(['AY'].concat(AGES.slice(0, 9).map((a, j) => a + '-' + AGES[j + 1])));
    for (let i = 0; i < 9; i++) { const row = [R.ays[i]]; for (let j = 0; j < 9; j++) row.push(i + j + 1 < n ? `=${L(j + 2)}${11 + i}/${L(j + 1)}${11 + i}` : ''); r.push(row); }
    r.push([]);
    const avgRow = (label, fn) => { const row = [label]; for (let j = 0; j < 9; j++) row.push(fn(j)); r.push(row); };
    avgRow('Vol-wtd all years', j => { const last = 11 + 8 - j; return `=SUM(${L(j + 2)}11:${L(j + 2)}${last})/SUM(${L(j + 1)}11:${L(j + 1)}${last})`; });
    avgRow('Simple average all years', j => `=AVERAGE(${L(j + 1)}24:${L(j + 1)}${24 + 8 - j})`);
    avgRow('Vol-wtd latest 3', j => { const last = 11 + 8 - j, first = Math.max(11, last - 2); return `=SUM(${L(j + 2)}${first}:${L(j + 2)}${last})/SUM(${L(j + 1)}${first}:${L(j + 1)}${last})`; });
    avgRow('Vol-wtd latest 5', j => { const last = 11 + 8 - j, first = Math.max(11, last - 4); return `=SUM(${L(j + 2)}${first}:${L(j + 2)}${last})/SUM(${L(j + 1)}${first}:${L(j + 1)}${last})`; });
    r.push(['SELECTED (YOUR INPUT: B-J factors, K tail)']);
    r.push([]); r.push(['Chain ladder projection']);
    r.push(['AY', 'Age', 'Reported', 'CDF to ult', 'Ultimate', 'IBNR', 'Net EP', 'Ult loss ratio', 'BF IBNR', 'Used-up EP (EP/CDF)', 'Cape Cod IBNR']);
    for (let i = 0; i < n; i++) {
      const rr = 42 + i, a = 9 - i; const cdf = a === 9 ? `=$K$38` : `=PRODUCT(${L(a + 1)}38:J38)*$K$38`;
      r.push([R.ays[i], AGES[a], `=${L(a + 1)}${11 + i}`, cdf, `=C${rr}*D${rr}`, `=E${rr}-C${rr}`, `=L${11 + i}`, `=E${rr}/G${rr}`, `=G${rr}*$B$54*(1-1/D${rr})`, `=G${rr}/D${rr}`, `=G${rr}*$B$55*(1-1/D${rr})`]);
    }
    r.push(['Total', '', '=SUM(C42:C51)', '', '=SUM(E42:E51)', '=SUM(F42:F51)', '=SUM(G42:G51)', '', '=SUM(I42:I51)', '=SUM(J42:J51)', '=SUM(K42:K51)']);
    r.push([]);
    r.push(['A priori ELR (YOUR INPUT, e.g. 0.72)', '']);
    r.push(['Cape Cod ELR (formula)', '=C52/J52']);
    r.push(['Carried IBNR (management)', sum(R.carried)]);
    r.push(['CFO chain ladder IBNR (all-yr vol-wtd, no tail)', Math.round(R_CL_ALL)]);
    return r;
  },
};
