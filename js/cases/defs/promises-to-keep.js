// Promises to Keep: fund a small final-pay defined benefit pension plan. Projected unit credit valuation,
// funded status, level-dollar amortization (Exam FM annuities), sensitivity and a 20-year funding simulation.
import { fmt, pct, num, money } from '../../util.js';
import { lineChart, barChart } from '../../ui/charts.js';
import { PLAN, ACTIVES, RETIREES, FOCUS, PAYROLL, N_ACT, N_RET, Q, AGE0, AGEMAX, lifeTable, annuityDue, valuation, duration, BASE, simulate, deterministicPath } from '../lib/pension.js';
import { pnSim } from '../benches/pension.js';

const setBtn = (obj, label = 'Use these values') => `<button class="btn sm ghost" style="margin-top:8px" data-setstate='${JSON.stringify(obj).replace(/'/g, '&#39;')}'>${label}</button>`;
const m2 = x => (x < 0 ? '−$' : '$') + fmt(Math.abs(x) / 1e6, 2) + 'M';
const f4 = x => x.toFixed(4);
const T7 = lifeTable(PLAN.i);
const RATES = [0.05, 0.06, 0.07, 0.08];
const TABLES = RATES.map(r => lifeTable(r));
const M = BASE.act[FOCUS];                       // cohort A4: the worked example
const D = duration();
const MKT = valuation({ i: PLAN.marketRate });
const SAL1 = valuation({ s: PLAN.s + 0.01 });
const LONG = valuation({ mort: 0.8 });
const ADUE20 = annuityDue(PLAN.i, PLAN.amort);
const sumBen = RETIREES.reduce((t, r) => t + r.n * r.ben, 0);

export default {
  id: 'promises-to-keep',
  title: 'Promises to Keep',
  sub: 'Funding a defined benefit pension plan',
  line: 'retirement',
  level: 'advanced',
  levelLabel: 'Exam FM / retirement level',
  minutes: 90,
  icon: 'briefcase',
  audience: 'pension board',
  tagline: 'The city has been paying the normal cost and little else. What does it really owe next year?',
  concepts: ['Defined benefit plans', 'Salary scale', 'Life annuities', 'Projected unit credit', 'Funded ratio', 'Amortization', 'Duration', 'Longevity risk'],
  exam: 'Annuities, amortization and duration are core SOA Exam FM topics. Life annuities and pension valuation (cost methods, funding) are covered on the long-term actuarial mathematics exam and in the SOA retirement track.',
  inspiration: [
    ['SOA Exam FM syllabus (Financial Mathematics)', 'https://www.soa.org/education/exam-req/edu-exam-fm-detail/'],
    ['Public Plans Data: assumptions and funded status of US public pension plans', 'https://publicplansdata.org/'],
    ['Actuarial Standard of Practice No. 4: measuring pension obligations', 'https://www.actuarialstandardsboard.org/asops/measuring-pension-obligations-determining-pension-plan-costs-contributions/']],
  source: 'All figures are illustrative and were built for teaching. The city, its members and its assets are fictional. Mortality follows a simple Makeham law chosen to give realistic life expectancies, not a published table. Real valuations also model withdrawal, disability, early retirement and many more members.',

  brief: () => `
  <div class="prose">
    <p><b>Your role:</b> a consulting actuary engaged by the <b>City of Millbrook</b> to prepare the January 1, 2027 valuation of the Millbrook Municipal Employees' Retirement System.</p>
    <p><b>The plan:</b> every member retires at 65 with a pension of <b>1.5% × years of service × final average salary</b>, paid at the start of each year for life. The city pays the full cost; members don't contribute. There are ${fmt(N_ACT)} active employees and ${fmt(N_RET)} retirees, and the plan holds <b>${m2(PLAN.assets)}</b> of assets.</p>
    <p>For years the city has contributed roughly what it costs to fund one more year of benefits, about <b>${m2(PLAN.lastContrib)}</b> in 2026, and nothing toward the gap left by past shortfalls. A council member wants to keep it that way: "Our assets will earn 7%. Why pay more?" The board's chair has asked you for a proper number.</p>
    <div class="callout"><b>The question:</b> How large are the promises Millbrook has made, how far behind is the plan, and what should the city contribute in 2027?</div>
    <p><b>Deliverables:</b> the valuation (liability, normal cost, funded ratio), a recommended 2027 employer contribution, a sensitivity analysis, and a one-page summary for the pension board (Recommend tab).</p>
  </div>`,
  briefStats: () => [
    { l: 'Plan assets', v: PLAN.assets / 1e6, pre: '$', suf: 'M', dec: 1 },
    { l: 'Active members and retirees', v: N_ACT + N_RET },
    { l: 'City contribution in 2026', v: PLAN.lastContrib / 1e6, pre: '$', suf: 'M', dec: 1 },
  ],

  primers: [
    { t: 'What a defined benefit plan promises', tier: 'F', h: `<p>A <b>defined benefit (DB)</b> plan promises a pension set by formula, not by an account balance. Millbrook's formula is</p>
      <div class="formula">Annual pension = 1.5% × years of service × final average salary</div>
      <p>The employer carries the investment and longevity risk: if assets earn less or retirees live longer than assumed, the city must put in more. The actuary's job is to put today's value on promises that will be paid over the next 70 years, and to set a contribution schedule that builds enough assets to pay them.</p>
      <div class="example"><b>Mini example.</b> A member retires with 30 years of service and a final average salary of $80,000. Pension = 0.015 × 30 × 80,000 = $36,000 a year for life.</div>` },
    { t: 'Projecting the benefit: the salary scale', tier: 'F', h: `<p>The benefit depends on pay at retirement, which hasn't happened yet. A <b>salary scale</b> assumption projects today's pay forward. With raises of s a year and m years to retirement:</p>
      <div class="formula">Projected final salary = current salary × (1 + s)<sup>m</sup></div>
      <p>Real plans average the last three to five years of pay. In this case we simplify and use the projected salary rate at 65. Service is also projected: a member with y years today will have y + m at 65.</p>
      <div class="example">Pay $60,000, raises 3%, 10 years to go: 60,000 × 1.03<sup>10</sup> = $80,635.</div>` },
    { t: 'Life annuities and ä₆₅', tier: 'F', h: `<p>A pension of $1 a year, paid at the start of each year while the retiree is alive, is a <b>life annuity-due</b>. Its present value at 65 is</p>
      <div class="formula">ä₆₅ = Σₖ vᵏ · ₖp₆₅ ,  k = 0, 1, 2, …   where v = 1/(1 + i) and ₖp₆₅ = l₆₅₊ₖ / l₆₅</div>
      <p>It is a certain annuity-due (Exam FM) with each payment weighted by the probability of being alive to receive it. A handy way to compute it backwards from the oldest age:</p>
      <div class="formula">äₓ = 1 + v · pₓ · äₓ₊₁</div>
      <p>Exhibit 4 gives ä at several ages and discount rates. A higher discount rate or shorter lives make ä smaller.</p>` },
    { t: 'Present value of future benefits', tier: 'F', h: `<p>For an active member aged x, the projected pension B starts at 65, so its value today discounts ä₆₅ for both interest and survival:</p>
      <div class="formula">PVFB = B × ä₆₅ × v<sup>65−x</sup> × (l₆₅ / lₓ)</div>
      <p>Here l₆₅ / lₓ is the probability of surviving from x to 65. (In this case death is the only way to leave before 65; real plans also allow for people quitting or retiring early.) For a retiree already receiving B, PVFB = B × äₓ.</p>` },
    { t: 'Cost method: projected unit credit', tier: 'F', h: `<p>PVFB counts benefits for service not yet worked. A <b>cost method</b> splits it into a past piece and a yearly piece. This case uses <b>projected unit credit (PUC)</b>: each year of service "earns" an equal slice of the projected benefit.</p>
      <div class="formula">Actuarial liability (AL) = PVFB × past service / total service at 65<br>Normal cost (NC) = PVFB / total service at 65</div>
      <p>The AL is the value of benefits already earned (with salary projected), and the NC is the cost of the year about to be worked. PUC is the method US private plans use for accounting. Public plans more often use <b>entry age normal</b> (required for GASB 67/68 accounting), which spreads cost as a level percent of pay over the whole career, so it gives a larger AL and a more stable NC for a given member.</p>` },
    { t: 'Funded status and amortization', tier: 'F', h: `<p>Compare the liability with what's been set aside:</p>
      <div class="formula">Funded ratio = assets ÷ AL      Unfunded liability (UAL) = AL − assets</div>
      <p>Contributing only the normal cost pays for each new year of benefits, but the existing gap keeps growing with interest and is never closed. A funding policy adds an <b>amortization payment</b>: a level payment that pays off the UAL like a mortgage. Paid at the start of each year for n years at rate i:</p>
      <div class="formula">Payment = UAL ÷ ä<sub>n⌉</sub>,   ä<sub>n⌉</sub> = (1 − vⁿ) / d,  d = i / (1 + i)</div>
      <p>In Excel that's =PMT(i, n, −UAL, 0, 1). The <b>recommended contribution</b> = normal cost + amortization payment.</p>` },
    { t: 'Sensitivity and duration', tier: 'S', h: `<p>A pension liability is a long stream of payments, so it behaves like a long bond. Its <b>effective duration</b> measures the percentage change in value for a 1% change in the discount rate:</p>
      <div class="formula">Duration ≈ [AL(i − 1%) − AL(i + 1%)] ÷ (2 × AL(i) × 0.01)</div>
      <p>A duration of 14 means a 1-point drop in the discount rate raises the liability by roughly 14%. The salary scale only affects active members, and mortality improvement (people living longer) raises every annuity factor. That is <b>longevity risk</b>.</p>` },
    { t: 'The discount-rate debate', tier: 'S', h: `<p>US public plans usually discount at the <b>expected return on plan assets</b>, typically around 7%. The reasoning: the assets are expected to earn that, so it is the rate at which today's assets grow into benefit payments.</p>
      <p>Many financial economists object. Accrued public pensions are close to guaranteed, so they argue the liability should be valued like a low-risk bond, at a yield such as high-quality bonds or Treasuries (often 4–5%). Using the expected return books the hoped-for equity premium in advance and transfers the risk to future taxpayers if returns fall short. Private plans in the US already discount at high-quality corporate bond yields for accounting.</p>
      <p>Both views are used in practice: the funding valuation sets contributions, while a market-rate measure shows the cost of the promises if risk were removed. The two can differ by tens of percent.</p>` },
  ],

  exhibits: () => {
    let h = `<section class="exhibit"><h3><span class="ex-n">1</span>Plan provisions and the board's assumptions</h3><div class="tblwrap"><table><tbody>
      <tr><td>Valuation date</td><td>January 1, 2027</td></tr>
      <tr><td>Benefit formula</td><td>1.5% × years of service at retirement × final average salary</td></tr>
      <tr><td>Final average salary (simplified)</td><td>Salary projected to age 65: current salary × (1 + salary scale)<sup>65 − age</sup></td></tr>
      <tr><td>Retirement</td><td>Everyone retires at exactly 65. Pension paid annually in advance (at the start of each year) for life, no inflation increases.</td></tr>
      <tr><td>Discount rate</td><td class="num">${pct(PLAN.i, 2)} a year (the board's expected return on assets)</td></tr>
      <tr><td>Salary scale</td><td class="num">${pct(PLAN.s, 1)} a year</td></tr>
      <tr><td>Decrements before 65</td><td>Mortality only (Exhibit 4). No withdrawal, disability or early retirement.</td></tr>
      <tr><td>Cost method</td><td>Projected unit credit</td></tr>
      <tr><td>Funding policy</td><td>Normal cost + level-dollar amortization of the unfunded liability over ${PLAN.amort} years, contributions at the start of the year</td></tr>
      </tbody></table></div><p class="cap">Ages and service are exact whole years at the valuation date.</p></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">2</span>Active members by cohort <span class="pill">illustrative</span></h3><div class="tblwrap"><table><thead><tr><th>Cohort</th><th>Members</th><th>Age</th><th>Years of service</th><th>Current salary (each)</th></tr></thead><tbody>
      ${ACTIVES.map(a => `<tr><td>${a.id}</td><td class="num">${a.n}</td><td class="num">${a.age}</td><td class="num">${a.svc}</td><td class="num">${money(a.sal)}</td></tr>`).join('')}
      <tr class="total"><td>Total</td><td class="num">${fmt(N_ACT)}</td><td></td><td></td><td class="num">${money(PAYROLL)} payroll</td></tr></tbody></table></div>
      <p class="cap">Each cohort stands for a group of similar employees. Value one representative member, then multiply by the count.</p></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">3</span>Retirees <span class="pill">illustrative</span></h3><div class="tblwrap"><table><thead><tr><th>Cohort</th><th>Retirees</th><th>Age</th><th>Annual pension (each)</th></tr></thead><tbody>
      ${RETIREES.map(r => `<tr><td>${r.id}</td><td class="num">${r.n}</td><td class="num">${r.age}</td><td class="num">${money(r.ben)}</td></tr>`).join('')}
      <tr class="total"><td>Total</td><td class="num">${N_RET}</td><td></td><td class="num">${money(sumBen)} a year</td></tr></tbody></table></div>
      <p class="cap">Next payment due January 1, 2027. A retiree's liability is the pension × äₓ at their current age.</p></section>`;
    const ages = [...ACTIVES.map(a => a.age), 65];
    h += `<section class="exhibit"><h3><span class="ex-n">4</span>Mortality and annuity factors <span class="pill">illustrative</span></h3>
      <div class="grid-2"><div class="tblwrap"><table><thead><tr><th>Age x</th><th>lₓ</th><th>l₆₅ / lₓ</th></tr></thead><tbody>
      ${ages.map(x => `<tr><td>${x}</td><td class="num">${fmt(T7.l(x), 0)}</td><td class="num">${f4(T7.l(65) / T7.l(x))}</td></tr>`).join('')}</tbody></table></div>
      <div class="tblwrap"><table><thead><tr><th>äₓ at</th>${RATES.map(r => `<th>${pct(r, 0)}</th>`).join('')}</tr></thead><tbody>
      ${[65, ...RETIREES.map(r => r.age)].map(x => `<tr><td>Age ${x}</td>${TABLES.map(T => `<td class="num">${f4(T.a(x))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
      <div class="card" style="margin-top:12px"><div class="small muted">Probability a 65-year-old is still alive, by age (base table)</div>${lineChart([{ v: Array.from({ length: 41 }, (_, k) => T7.l(65 + k) / T7.l(65)), c: 'var(--chart-1)', area: true }], { x: Array.from({ length: 41 }, (_, k) => (k % 5 === 0 ? String(65 + k) : '')), yfmt: v => Math.round(v * 100) + '%', min: 0, max: 1, aria: 'Survival curve from age 65', h: 220 })}</div>
      <p class="cap">Annual mortality rates follow a Makeham law (µₓ = 0.0002 + 0.000004 × 1.12ˣ), rounded to six decimals; nobody lives past 110. Life expectancy at 65 is about ${fmt(sumLife(), 1)} years. The full table (ages ${AGE0}–${AGEMAX}) is in the case workbook.</p></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">5</span>Plan assets</h3><div class="tblwrap"><table><thead><tr><th>Year</th><th>City contribution</th><th>Benefits paid</th><th>Investment return</th></tr></thead><tbody>
      ${[[2022, 3.0, 3.9, -0.112], [2023, 3.1, 4.0, 0.094], [2024, 3.2, 4.2, 0.081], [2025, 3.3, 4.3, 0.087], [2026, 3.4, 4.45, 0.052]].map(([y, c, b, r]) => `<tr><td>${y}</td><td class="num">$${c.toFixed(2)}M</td><td class="num">$${b.toFixed(2)}M</td><td class="num">${(r * 100).toFixed(1)}%</td></tr>`).join('')}
      <tr class="total"><td>Market value of assets, 1/1/2027</td><td class="num" colspan="3">${money(PLAN.assets)}</td></tr></tbody></table></div>
      <p class="cap">Returns averaged about 4% a year over these five years, below the 7% assumption. Contributions roughly covered the cost of each new year of service, but not the shortfall.</p></section>`;
    return h;
  },

  tasks: [
    { id: 'pn1', tier: 'F', type: 'num', title: 'Project the final salary', prompt: () => `Cohort A4 members are ${M.age}, have ${M.svc} years of service and earn ${money(M.sal)}. Using the ${pct(PLAN.s, 1)} salary scale, what is their projected final salary at 65? (nearest dollar)`,
      answer: () => M.fas, rtol: 0.001, explain: () => `${money(M.sal)} × 1.035<sup>${M.yrs}</sup> = ${money(M.fas)}. ${M.yrs} years of 3.5% raises more than double their pay.` },
    { id: 'pn2', tier: 'F', type: 'num', title: 'The projected pension', prompt: () => `What annual pension will a cohort A4 member receive from 65? (nearest dollar)`,
      answer: () => M.ben, rtol: 0.001, explain: () => `Service at 65 = ${M.svc} + ${M.yrs} = ${M.tot} years. Pension = 0.015 × ${M.tot} × ${money(M.fas)} = ${money(M.ben)} a year.` },
    { id: 'pn3', tier: 'F', type: 'num', title: 'What is that pension worth today?', prompt: () => `Find the present value of future benefits (PVFB) for one cohort A4 member at January 1, 2027: value the pension at 65 with ä₆₅, then discount for ${M.yrs} years of interest at 7% and for the chance of surviving to 65. (nearest dollar)`,
      answer: () => M.pvfb, rtol: 0.002, explain: () => `${money(M.ben)} × ${f4(M.a65)} × 1.07<sup>−${M.yrs}</sup> × ${f4(M.surv)} = ${money(M.ben)} × ${f4(M.a65)} × ${f4(M.disc)} × ${f4(M.surv)} = ${money(M.pvfb)}.` },
    { id: 'pn4', tier: 'F', type: 'multi', title: 'Split it: earned so far vs. this year', prompt: () => `Under projected unit credit, what are the actuarial liability (AL) and the normal cost (NC) for one cohort A4 member? (nearest dollar)`,
      fields: [['pnAL', 'Actuarial liability ($)', 0], ['pnNC', 'Normal cost ($)', 1]], answer: i => [M.al, M.nc][i], rtol: 0.003,
      explain: () => `AL = ${money(M.pvfb)} × ${M.svc}/${M.tot} = ${money(M.al)}. NC = ${money(M.pvfb)} / ${M.tot} = ${money(M.nc)}. Next year's AL should be about this year's AL + NC, plus interest.` },
    { id: 'pn5', tier: 'F', type: 'num', title: 'Value the whole plan', prompt: () => `Repeat for every cohort, multiply by the member counts and add the retirees (pension × äₓ at 7%). What is the plan's total actuarial liability? (nearest dollar; the case workbook does the repetition for you once you fill in its yellow cells)`,
      answer: () => BASE.AL, rtol: 0.003, explain: () => `Active members ${money(BASE.alAct)} + retirees ${money(BASE.alRet)} = ${money(BASE.AL)}. Retirees are only ${pct(N_RET / (N_ACT + N_RET), 0)} of members but ${pct(BASE.alRet / BASE.AL, 0)} of the liability.` },
    { id: 'pn6', tier: 'F', type: 'multi', title: 'How far behind is the plan?', prompt: () => `With assets of ${money(PLAN.assets)}, what are the funded ratio and the unfunded actuarial liability?`,
      fields: [['pnFR', 'Funded ratio (%)', 0], ['pnUAL', 'Unfunded liability ($)', 1]], answer: i => [BASE.fr * 100, BASE.ual][i], rtol: 0.005,
      explain: () => `Funded ratio = ${money(PLAN.assets)} ÷ ${money(BASE.AL)} = ${pct(BASE.fr)}. UAL = ${money(BASE.AL)} − ${money(PLAN.assets)} = ${money(BASE.ual)}.` },
    { id: 'pn7', tier: 'F', type: 'num', title: 'Amortize the shortfall', prompt: () => `The funding policy pays off the unfunded liability with level payments at the start of each year for ${PLAN.amort} years at 7%. What is the annual amortization payment? (nearest dollar)`,
      answer: () => BASE.pay, rtol: 0.003, explain: () => `ä<sub>20⌉</sub> at 7% = (1 − 1.07<sup>−20</sup>) ÷ (0.07/1.07) = ${f4(ADUE20)}. Payment = ${money(BASE.ual)} ÷ ${f4(ADUE20)} = ${money(BASE.pay)}. Add the normal cost of ${money(BASE.nc)} and the policy contribution is ${money(BASE.contrib)}.` },
    { id: 'pn8', tier: 'S', type: 'bench', title: 'Stress-test the assumptions', bench: 'pnSens',
      prompt: () => `Move the sliders to see how the liability and the contribution respond. Try the discount rate at 6% and 8%, a salary scale of 4.5%, and mortality at 80% of the base table.`,
      check: st => {
        const moved = ['pnRate', 'pnSal', 'pnMort'].some(k => st[k] != null && num(st[k]) !== { pnRate: 7, pnSal: 3.5, pnMort: 100 }[k]);
        if (!moved) return { ok: false, msg: 'Move at least one slider away from the board\'s assumptions first.' };
        return { ok: true, msg: `Complete. The discount rate dominates: 1 point lower raises the liability ${pct(D.lo / D.mid - 1)}. A salary scale 1 point higher adds ${pct(SAL1.AL / BASE.AL - 1)}; 20% lighter mortality adds ${pct(LONG.AL / BASE.AL - 1)}.` };
      } },
    { id: 'pn9', tier: 'S', type: 'num', title: 'Duration of the promise', prompt: () => `Using the bench (or the workbook with B9 changed), read the actuarial liability at 6% and at 8% with the other assumptions at base. What is the liability's effective duration? (years, 1 decimal)`,
      answer: () => D.dur, tol: 0.15, explain: () => `(${m2(D.lo)} − ${m2(D.hi)}) ÷ (2 × ${m2(D.mid)} × 0.01) = ${fmt(D.dur, 1)}. The liability moves like a ${Math.round(D.dur)}-year bond, while most of the plan's assets (stocks and shorter bonds) don't, so falling rates widen the gap.` },
    { id: 'pn10', tier: 'S', type: 'mcq', title: 'Which discount rate?', prompt: () => `An economist on the council says the plan is really only ${pct(PLAN.assets / MKT.AL, 0)} funded, valuing the liability at a ${pct(PLAN.marketRate, 1)} bond yield instead of 7%. Which response is most defensible?`,
      options: ['She is wrong: the discount rate must equal the expected return on assets, so 7% is the only correct rate.',
        'Both numbers answer different questions. 7% is the board\'s funding assumption, used to set contributions; the bond-rate figure shows what the promises would cost with the investment risk removed. The gap is a measure of the risk taxpayers bear.',
        'The bond-rate figure is irrelevant because public pensions can be cut whenever the city chooses.',
        'Discount rates only affect timing, so both give the same contribution in the long run.'],
      correct: 1, explain: `At ${pct(PLAN.marketRate, 1)} the liability is ${m2(MKT.AL)} (funded ratio ${pct(PLAN.assets / MKT.AL, 0)}) against ${m2(BASE.AL)} at 7%. Using the expected return assumes the extra return will be earned; if it is not, future taxpayers pay. Stating both measures is good practice.` },
    { id: 'pn11', tier: 'F', type: 'pick', title: 'Lock your 2027 contribution', prompt: () => `Enter the employer contribution ($) you recommend the city pay for 2027, then lock it. Locking unlocks the Debrief, which simulates 20 years of investment returns under your contribution.`, key: 'pick' },
  ],
  pickShow: st => money(num(st.pick)) + ' city contribution for 2027',
  pickHint: '$, e.g. 5000000',
  pickOk: st => { const v = num(st.pick); return isFinite(v) && v >= 0 && v <= 30e6; },

  stages: [['Project the benefit', ['pn1', 'pn2']], ['Value it', ['pn3', 'pn4']], ['The whole plan', ['pn5', 'pn6']], ['Fund the gap', ['pn7']], ['Stress-test', ['pn8', 'pn9', 'pn10'], true], ['Decide', ['pn11']]],

  hints: {
    pn1: ['How many years until a 42-year-old reaches 65? Each of those years adds a 3.5% raise.', () => `${money(M.sal)} × 1.035<sup>${M.yrs}</sup>. Compound growth, as in Exam FM.`],
    pn2: ['Count service at retirement, not today: past service plus the years still to work.', () => `0.015 × (${M.svc} + ${M.yrs}) × ${money(M.fas)}.`],
    pn3: ['Three factors after the pension: ä₆₅ turns the annual pension into a lump-sum value at 65; vᵐ discounts it back to today; l₆₅/lₓ allows for the chance of dying first. Read ä₆₅ and l₆₅/l₄₂ from Exhibit 4.',
      () => `${money(M.ben)} × ${f4(M.a65)} (ä₆₅ at 7%) × 1.07<sup>−${M.yrs}</sup> (= ${f4(M.disc)}) × ${f4(M.surv)} (l₆₅/l₄₂).`],
    pn4: ['Projected unit credit gives each year of service (past and future) an equal share of PVFB. How many of the total years are already worked?', () => `Total service at 65 is ${M.tot}. AL = PVFB × ${M.svc}/${M.tot}; NC = PVFB × 1/${M.tot}.`,
      () => `AL ${money(M.al)}, NC ${money(M.nc)}.<br>${setBtn({ pnAL: String(Math.round(M.al)), pnNC: String(Math.round(M.nc)) })}`],
    pn5: ['Open the workbook. Fill the yellow cells in columns G, I and M for cohort A1 (row 20), then drag the fill handle down to row 27. The totals and the retiree block are already built.',
      () => `Retirees: ${RETIREES.map(r => `${r.n} × ${money(r.ben)} × ${f4(T7.a(r.age))}`).join(' + ')} = ${money(BASE.alRet)}. Actives: Σ count × AL per member = ${money(BASE.alAct)}.`,
      () => `AL by cohort ($): ${BASE.act.map(a => `${a.id} ${fmt(a.n * a.al)}`).join(', ')}; retirees ${fmt(BASE.alRet)}. Total ${money(BASE.AL)}.`],
    pn6: ['Funded ratio is assets divided by the actuarial liability, not by PVFB.', () => `${money(PLAN.assets)} ÷ ${money(BASE.AL)}; then subtract to get the unfunded part.`,
      () => `${pct(BASE.fr, 2)} and ${money(BASE.ual)}.<br>${setBtn({ pnFR: (BASE.fr * 100).toFixed(2), pnUAL: String(Math.round(BASE.ual)) })}`],
    pn7: ['This is a loan repayment: the UAL is the loan, 7% the interest rate, 20 annual payments at the start of each year (annuity-due).', () => `Payment = ${money(BASE.ual)} ÷ ä<sub>20⌉</sub>, with ä<sub>20⌉</sub> = (1 − 1.07<sup>−20</sup>) / (0.07/1.07) = ${f4(ADUE20)}. In Excel: =PMT(0.07, 20, −UAL, 0, 1).`],
    pn8: ['The bench needs you to move at least one slider. Watch the liability curve: it bends, so a cut in the rate hurts more than an equal rise helps.',
      `Try the four scenarios in the prompt one at a time, using "Reset" between them.`,
      () => `For example, set the discount rate to 6%.<br>${setBtn({ pnRate: '6', pnSal: '3.5', pnMort: '100' }, 'Set 6%')}`],
    pn9: ['Effective duration = (AL at 6% − AL at 8%) ÷ (2 × AL at 7% × 0.01).', () => `AL at 6% = ${money(D.lo)}; at 8% = ${money(D.hi)}; at 7% = ${money(D.mid)}.`],
    pn10: ['Think about who bears the risk if the 7% is not earned, and what each number is used for.', 'Two options claim one rate is the only right answer or that the choice doesn\'t matter. Neither holds up.'],
  },

  model: () => `<h3>Model solution</h3><div class="prose">
    <p><b>One member.</b> Cohort A4: projected salary ${money(M.fas)}, pension ${money(M.ben)} a year, PVFB ${money(M.pvfb)}. Under projected unit credit, AL = ${M.svc}/${M.tot} of PVFB = ${money(M.al)} and NC = 1/${M.tot} = ${money(M.nc)}.</p>
    <p><b>Whole plan.</b> AL ${money(BASE.AL)} (actives ${money(BASE.alAct)}, retirees ${money(BASE.alRet)}); total PVFB ${money(BASE.pvfb)}; normal cost ${money(BASE.nc)} (${pct(BASE.nc / PAYROLL)} of payroll). Assets ${money(PLAN.assets)}: funded ratio <b>${pct(BASE.fr)}</b>, UAL ${money(BASE.ual)}.</p>
    <p><b>Contribution.</b> 20-year level amortization at 7%, start of year: ${money(BASE.ual)} ÷ ${f4(ADUE20)} = ${money(BASE.pay)}. Recommended 2027 contribution = ${money(BASE.nc)} + ${money(BASE.pay)} = <b>${money(BASE.contrib)}</b> (${pct(BASE.pctPay)} of payroll), up from ${m2(PLAN.lastContrib)}.</p>
    <p><b>Sensitivity.</b> Effective duration ${fmt(D.dur, 1)}: at 6% the liability is ${m2(D.lo)}, at 8% ${m2(D.hi)}. Salary scale +1 point: ${m2(SAL1.AL)}. Mortality 20% lighter: ${m2(LONG.AL)}. At a ${pct(PLAN.marketRate, 1)} bond yield the liability would be ${m2(MKT.AL)} (funded ${pct(PLAN.assets / MKT.AL, 0)}).</p>
    <p><b>Recommendation.</b> Pay the full policy contribution of about ${m2(BASE.contrib)}. Paying only the normal cost (roughly last year's amount) leaves the ${m2(BASE.ual)} gap to grow with interest. A strong answer also flags that the 7% assumption sits at the optimistic end given recent returns, shows what a 6.5% or 6% assumption would cost, and suggests phasing in any increase if the budget can't absorb it at once.</p></div>`,

  debrief(st) {
    const pick = num(st.pick), me = simulate(pick), mod = simulate(BASE.contrib), nco = simulate(BASE.nc);
    const gap = pick / BASE.contrib - 1;
    const verdict = pick < BASE.nc * 0.98 ? `Your contribution doesn't cover the normal cost, so the plan falls further behind every year even if every assumption comes true. The unfunded liability grows instead of shrinking.`
      : Math.abs(gap) <= 0.05 ? 'Your contribution is within 5% of the funding policy amount: it pays for the year\'s new benefits and retires the shortfall over 20 years if the assumptions hold.'
        : gap < 0 ? `Your contribution covers the normal cost but pays down the shortfall more slowly than the 20-year policy. If every assumption holds, the plan would reach about ${pct(deterministicPath(pick)[20], 0)} funded by 2047 rather than 100%.`
          : `Your contribution is above the policy amount, so the plan would be fully funded sooner. That buys protection against bad returns, at the cost of today's city budget.`;
    const yrs = Array.from({ length: 21 }, (_, t) => t % 5 === 0 ? String(2027 + t) : '');
    return `<div class="stack-lg">
      <div class="kpis">
        <div class="kpi hero"><div class="l">Model 2027 contribution</div><div class="v" data-count="${(BASE.contrib / 1e6).toFixed(2)}" data-dec="2" data-prefix="$" data-suffix="M">${m2(BASE.contrib)}</div></div>
        <div class="kpi"><div class="l">Your contribution</div><div class="v">${m2(pick)}</div></div>
        <div class="kpi"><div class="l">Difference</div><div class="v" style="color:${Math.abs(gap) <= 0.05 ? 'var(--good)' : 'var(--bad)'}">${(gap >= 0 ? '+' : '') + pct(gap)}</div></div>
        <div class="kpi"><div class="l">Funded ratio today</div><div class="v">${pct(BASE.fr)}</div></div>
      </div>
      <div class="callout"><b>Your contribution.</b> ${verdict}</div>
      <div class="card"><h3 style="margin-bottom:6px">If every assumption comes true</h3><p class="small muted" style="margin:0 0 6px">Funded ratio with returns of exactly 7% every year</p>
        ${lineChart([{ v: deterministicPath(BASE.nc), c: 'var(--chart-3)', label: 'Normal cost only', w: 2 }, { v: deterministicPath(BASE.contrib), c: 'var(--chart-4)', label: 'Model', w: 2.2 }, { v: deterministicPath(pick), c: 'var(--chart-1)', label: 'Yours', w: 2.8 }], { x: yrs, yfmt: v => Math.round(v * 100) + '%', aria: 'Deterministic funded ratio paths', h: 240 })}
        <div class="legend"><span><i style="background:var(--chart-1)"></i>Your contribution</span><span><i style="background:var(--chart-4)"></i>Model (${m2(BASE.contrib)})</span><span><i style="background:var(--chart-3)"></i>Normal cost only (${m2(BASE.nc)})</span></div>
        <p class="cap">Paying only the normal cost lets the unfunded liability grow at 7% a year while the liability grows with payroll at 3.5%, so even with perfect returns the funded ratio slides from ${pct(BASE.fr, 0)} to ${pct(deterministicPath(BASE.nc)[20], 0)} by 2047.</p></div>
      <div><h3 style="margin-bottom:6px">What could happen: 20 years of uncertain returns</h3>
        <p class="small muted" style="margin:0 0 10px">Returns are drawn each year from a normal distribution (mean 7%, standard deviation 12%, seeded so everyone sees the same ${fmt(2000)} paths). Change the contribution or the return assumptions to explore.</p>
        <div class="bench" data-bench="pnSim">${pnSim.inputs(st)}<div class="bench-out live" data-bench-out="pnSim">${pnSim.outputs(st)}</div></div></div>
      <div class="tblwrap"><table><thead><tr><th>Policy (base returns)</th><th>2027 contribution</th><th>Median funded ratio 2047</th><th>5th percentile</th><th>P(below 60%)</th><th>P(100%+)</th></tr></thead><tbody>
        ${[['Normal cost only', nco], ['Your contribution', me], ['Model: NC + 20-yr amortization', mod]].map(([l, r]) => `<tr><td>${l}</td><td class="num">${money(r.contrib)}</td><td class="num">${pct(r.fin.p50, 0)}</td><td class="num">${pct(r.fin.p5, 0)}</td><td class="num">${pct(r.below60, 0)}</td><td class="num">${pct(r.above100, 0)}</td></tr>`).join('')}</tbody></table></div>
      <div class="callout"><b>Why the model's median ends below 100%.</b> Returns averaging 7% a year compound to less than 7% a year, because volatility drags down growth (a −10% year followed by +24% averages +7% but compounds to only about +5.6% a year). With 12% volatility the median path compounds at roughly 6.3%, so even a "correct" 7% assumption leaves the typical plan short. That is one reason many boards have been lowering their assumed returns.</div>
      <div class="grid-2">
        <div class="card"><h3 style="margin-bottom:6px">The discount-rate debate in numbers</h3>${barChart([{ l: `AL at ${pct(PLAN.marketRate, 1)} (bond yield)`, v: MKT.AL, c: 'var(--chart-3)' }, { l: 'AL at 6%', v: D.lo, c: 'var(--chart-2)' }, { l: 'AL at 7% (board)', v: BASE.AL, c: 'var(--chart-1)', strong: true }, { l: 'AL at 8%', v: D.hi, c: 'var(--chart-4)' }, { l: 'Plan assets', v: PLAN.assets, c: 'var(--chart-muted)' }], { fmt: m2, aria: 'Actuarial liability at different discount rates', labelW: 200 })}
          <p class="cap">At the bond yield the funded ratio is ${pct(PLAN.assets / MKT.AL, 0)} and the policy contribution would be ${m2(MKT.contrib)}. Neither rate is "the truth": the gap is the price of the investment risk the city is taking.</p></div>
        <div class="card"><h3 style="margin-bottom:6px">Exam connections</h3><div class="prose small"><ul>
          <li><b>FM:</b> compound growth (salary scale), annuity-due ä<sub>n⌉</sub> and level amortization, effective duration (${fmt(D.dur, 1)} here).</li>
          <li><b>Long-term actuarial math:</b> life annuities ä₆₅, survival probabilities from lₓ, present value of future benefits, cost methods.</li>
          <li><b>Retirement track:</b> funding policy, actuarially determined contributions, and the public-plan discount-rate debate.</li></ul></div></div>
      </div>
      <div class="card">${this.model()}</div></div>`;
  },

  modelSummary: `**Recommendation:** The City of Millbrook should contribute ${m2(BASE.contrib)} for 2027 (${pct(BASE.pctPay)} of payroll): the ${m2(BASE.nc)} normal cost plus a ${m2(BASE.pay)} payment toward the unfunded liability. Last year's ${m2(PLAN.lastContrib)} roughly covered the normal cost only.

**Where the plan stands:** At the board's 7% discount rate and 3.5% salary scale, the promises already earned are worth ${m2(BASE.AL)} (projected unit credit). ${m2(BASE.alRet)} of that is owed to the ${N_RET} current retirees. Against ${m2(PLAN.assets)} of assets, the plan is ${pct(BASE.fr)} funded, with an unfunded liability of ${m2(BASE.ual)}.

**Why more than the normal cost:** The normal cost pays for benefits earned in 2027 only. The ${m2(BASE.ual)} gap grows at 7% a year if nobody pays it down. A level payment of ${m2(BASE.pay)} a year for 20 years retires it if the assumptions hold.

**Risks:** The liability behaves like a ${Math.round(D.dur)}-year bond: one point lower on the discount rate adds about ${m2(D.lo - BASE.AL)}. Recent returns averaged about 4%, below the 7% assumption. People living 20% longer than the table assumes adds ${m2(LONG.AL - BASE.AL)}. Valued at a ${pct(PLAN.marketRate, 1)} bond yield, the liability is ${m2(MKT.AL)}, so the 7% assumption carries real risk for future taxpayers. In a 20-year simulation the median funded ratio under this policy ends near ${pct(simulate(BASE.contrib).fin.p50, 0)}, not 100%, because volatility drags down compound returns.

**Next steps:** Review the 7% assumption (an experience study and capital-market review), consider phasing in the increase over two or three years if the budget requires, and report a bond-rate liability alongside the funding valuation.`,

  judgeBank: [
    ['The council member says the assets will earn 7%, so why pay more than the normal cost?', 'Explains that the normal cost only funds the year\'s new benefits. Even if 7% is earned, the existing unfunded liability grows at 7% and is never paid off. Quotes the UAL and the amortization payment.'],
    ['Why projected unit credit rather than entry age normal?', 'PUC values benefits already earned, using projected pay, and is easy to explain. Notes that entry age normal (required for GASB accounting) spreads cost as a level percent of pay, gives a higher liability for the same member, and is more common for public plan funding. Says the choice changes the timing of contributions, not the total benefits.'],
    ['How confident are you in the 7% discount rate?', 'Notes that recent returns averaged about 4%, that volatility drag means the median compound return is below the mean, and shows the sensitivity: about 14% more liability per point. Suggests an experience study and possibly a lower assumption.'],
    ['What is the biggest risk to the city\'s budget from this plan?', 'Investment risk and discount-rate changes dominate (duration ~14). Longevity is slower but one-directional. Mentions contribution volatility and the simulation\'s downside percentiles.'],
    ['Why amortize over 20 years and not 30?', 'A longer period lowers today\'s payment but pays more interest overall and risks negative amortization when payroll grows. 20 years is a common compromise; shows the trade-off with the PMT formula.'],
    ['An economist says the plan is far less funded than you say. Is she wrong?', 'No: at a bond yield the liability is much larger. The two measures answer different questions: funding the plan at expected returns vs. the cost with risk removed. Good practice is to disclose both.'],
    ['Retirees are a quarter of the members. Why are they so much of the liability?', 'Their benefits are being paid now, with no discounting for years to retirement and no future service to spread cost over. Every dollar of their liability is already earned.'],
    ['What would you want to check before finalizing the valuation?', 'Member data quality (ages, service, pay), actual turnover and retirement ages, the plan\'s own mortality experience, and whether final average pay should use a 3- or 5-year average. Each moves the liability.'],
  ],

  context(st) {
    return `CASE: City of Millbrook municipal pension plan (fictional, illustrative), valuation 1/1/2027. Benefit 1.5% x service x final salary (projected to 65), retirement at 65, annual life annuity-due. ${N_ACT} actives in 8 cohorts, ${N_RET} retirees. Assumptions: discount 7%, salary scale 3.5%, Makeham mortality, projected unit credit. Assets $68.0M. City paid $3.4M in 2026. Correct analysis: AL ${money(BASE.AL)}, normal cost ${money(BASE.nc)}, funded ratio ${pct(BASE.fr)}, UAL ${money(BASE.ual)}, 20-yr level amortization (start of year) ${money(BASE.pay)}, contribution ${money(BASE.contrib)}; effective duration ${fmt(D.dur, 1)}; AL at 4.5% ${money(MKT.AL)}.
STUDENT WORK: cohort A4 final salary ${st.ans?.pn1 || '?'}, pension ${st.ans?.pn2 || '?'}, PVFB ${st.ans?.pn3 || '?'}, AL ${st.pnAL || '?'}, NC ${st.pnNC || '?'}; total AL ${st.ans?.pn5 || '?'}; funded ratio ${st.pnFR || '?'}%, UAL ${st.pnUAL || '?'}; amortization payment ${st.ans?.pn7 || '?'}; duration ${st.ans?.pn9 || '?'}; recommended contribution ${st.pick ? money(num(st.pick)) : 'not yet selected'}.`;
  },

  workbook: {
    inputs: ['G20:G27', 'I20:I27', 'M20:M27', 'B44'],
    cols: { A: 300, B: 90, C: 70, D: 80, E: 100, F: 80, G: 120, H: 90, I: 110, J: 90, K: 90, L: 80, M: 120, N: 110, O: 100, P: 120, Q: 120, R: 110 },
    formats: { B9: 'pct2', B10: 'pct2', B11: 'pct1', B14: 'money0', B16: 'dec6', 'E20:E27': 'money0', 'G20:G27': 'money0', 'I20:I27': 'money0', 'J20:L27': 'dec4', 'M20:R28': 'money0', 'D32:D34': 'money0', 'E32:E34': 'dec4', 'F32:G35': 'money0', 'B38:B41': 'money0', B42: 'pct2', 'B43:B46': 'money0', B47: 'pct1', 'B51:B141': 'dec6', 'C51:C141': 'int', 'D51:D141': 'dec4' },
    links: [{ cell: 'B9', path: 'pnRate', scale: 0.01 }, { cell: 'B10', path: 'pnSal', scale: 0.01 }, { cell: 'B13', path: 'pnMort', scale: 0.01 }],
    checks: [
      { cell: 'G23', label: 'A4 projected final salary', answer: BASE.act[3].fas, rtol: 1e-6 },
      { cell: 'I23', label: 'A4 projected pension', answer: BASE.act[3].ben, rtol: 1e-6 },
      { cell: 'M23', label: 'A4 PVFB per member', answer: BASE.act[3].pvfb, rtol: 1e-6 },
      { cell: 'B38', label: 'Total actuarial liability', answer: BASE.AL, rtol: 1e-6 },
      { cell: 'B40', label: 'Normal cost', answer: BASE.nc, rtol: 1e-6 },
      { cell: 'B42', label: 'Funded ratio', answer: BASE.fr, tol: 5e-5 },
      { cell: 'B44', label: 'Amortization payment', answer: BASE.pay, rtol: 1e-6 },
      { cell: 'B45', label: '2027 contribution', answer: BASE.contrib, rtol: 1e-6 },
    ],
  },
  csv() {
    const LT0 = 51, LT1 = LT0 + (AGEMAX - AGE0), LT = `$A$${LT0}:$D$${LT1}`;
    const r = [
      ['OpenActuary | Promises to Keep (City of Millbrook pension plan) | illustrative data, valuation date 1/1/2027'],
      ['HOW TO USE: yellow cells are blank for your formulas. Fill row 20 (cohort A1), then drag the fill handle down to row 27. Everything else is a live formula: click a cell to see it.'],
      ['STEP 1: G = projected final salary = current salary x (1 + salary scale)^(years to 65), e.g. =E20*(1+$B$10)^F20'],
      ['STEP 2: I = projected annual pension = accrual rate x service at 65 x final salary, e.g. =$B$11*H20*G20'],
      ['STEP 3: M = PVFB per member = pension x a65 x v^(years to 65) x survival to 65, e.g. =I20*L20*K20*J20. AL (N) and NC (O) follow by projected unit credit.'],
      ['STEP 4: B44 = amortization payment, level at the start of each year: =PMT(B9,B15,-B43,0,1). B45 is then the recommended contribution.'],
      ['CHECKS use the board\'s assumptions. Change B9 (discount rate), B10 (salary scale) or B13 (mortality multiplier, 0.8 = 20% lighter) to test sensitivity.'],
      ['ASSUMPTIONS'],
      ['Discount rate i', PLAN.i],
      ['Salary scale s', PLAN.s],
      ['Accrual rate', PLAN.accrual],
      ['Retirement age', PLAN.retAge],
      ['Mortality multiplier (1 = base table)', PLAN.mort],
      ['Market value of assets', PLAN.assets],
      ['Amortization period (years)', PLAN.amort],
      ['v = 1/(1+i)', '=1/(1+B9)'],
      [],
      ['ACTIVE MEMBERS: per-member values (C to O), cohort totals (P to R)'],
      ['Cohort', 'Members', 'Age', 'Service', 'Salary', 'Years to 65', 'Final salary (YOUR FORMULA)', 'Service at 65', 'Annual pension (YOUR FORMULA)', 'Survival to 65', 'v^(years to 65)', 'a65', 'PVFB per member (YOUR FORMULA)', 'AL per member', 'NC per member', 'PVFB x members', 'AL x members', 'NC x members'],
    ];
    ACTIVES.forEach((a, k) => {
      const n = 20 + k;
      r.push([a.id, a.n, a.age, a.svc, a.sal, `=$B$12-C${n}`, '', `=D${n}+F${n}`, '', `=VLOOKUP($B$12,${LT},3,FALSE)/VLOOKUP(C${n},${LT},3,FALSE)`, `=$B$16^F${n}`, `=VLOOKUP($B$12,${LT},4,FALSE)`, '', `=M${n}*D${n}/H${n}`, `=M${n}/H${n}`, `=B${n}*M${n}`, `=B${n}*N${n}`, `=B${n}*O${n}`]);
    });
    r.push(['Total actives', '=SUM(B20:B27)', '', '', '', '', '', '', '', '', '', '', '', '', '', '=SUM(P20:P27)', '=SUM(Q20:Q27)', '=SUM(R20:R27)']);
    r.push([]);
    r.push(['RETIREES']);
    r.push(['Cohort', 'Retirees', 'Age', 'Annual pension', 'a(x) at current age', 'AL per retiree', 'AL x retirees']);
    RETIREES.forEach((m, k) => { const n = 32 + k; r.push([m.id, m.n, m.age, m.ben, `=VLOOKUP(C${n},${LT},4,FALSE)`, `=D${n}*E${n}`, `=B${n}*F${n}`]); });
    r.push(['Total retirees', '=SUM(B32:B34)', '', '=SUMPRODUCT(B32:B34,D32:D34)', '', '', '=SUM(G32:G34)']);
    r.push([]);
    r.push(['PLAN SUMMARY']);
    r.push(['Actuarial liability (actives + retirees)', '=Q28+G35']);
    r.push(['Present value of future benefits', '=P28+G35']);
    r.push(['Normal cost', '=R28']);
    r.push(['Market value of assets', '=B14']);
    r.push(['Funded ratio', '=IFERROR(B41/B38,"")']);
    r.push(['Unfunded actuarial liability', '=B38-B41']);
    r.push(['Amortization payment (YOUR FORMULA: =PMT(B9,B15,-B43,0,1))', '']);
    r.push(['Recommended contribution = normal cost + amortization', '=B40+B44']);
    r.push(['Annual payroll', '=SUMPRODUCT(B20:B27,E20:E27)']);
    r.push(['Contribution as % of payroll', '=IFERROR(B45/B46,"")']);
    r.push([]);
    r.push(['LIFE TABLE: q(x) from the illustrative Makeham law; l(x) and a(x) are formulas that use the mortality multiplier B13 and v in B16. a(x) = 1 + v x p(x) x a(x+1).']);
    r.push(['Age x', 'q(x)', 'l(x)', 'a(x) annuity-due']);
    for (let x = AGE0; x <= AGEMAX; x++) {
      const n = LT0 + x - AGE0;
      r.push([x, Q[x - AGE0], x === AGE0 ? 100000 : `=C${n - 1}*(1-MIN(1,$B$13*B${n - 1}))`, x === AGEMAX ? 1 : `=1+$B$16*(1-MIN(1,$B$13*B${n}))*D${n + 1}`]);
    }
    return r;
  },
};

function sumLife() { let e = 0; for (let x = 66; x <= AGEMAX; x++) e += T7.l(x) / T7.l(65); return e + 0.5; }
