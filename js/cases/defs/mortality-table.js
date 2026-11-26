// The Mortality Table: price a 20-year level term life policy from an illustrative Makeham life table.
// Survival probabilities, discounting, APVs of a term insurance and a temporary life annuity-due, net and
// gross premiums by the equivalence principle, sensitivity, and a seeded portfolio simulation in the debrief.
import { fmt, pct, spct, num, money } from '../../util.js';
import { lineChart, columnChart, barChart } from '../../ui/charts.js';
import { MAKEHAM, QX, POLICY, EXP, PROFIT, BASE, DEFERRED_10, AT_4, MODEL_G, price, pvProfit, survival, lx, simulate, profitStats } from '../lib/life.js';

const setBtn = (obj, label = 'Use these values') => `<button class="btn sm ghost" style="margin-top:8px" data-setstate='${JSON.stringify(obj).replace(/'/g, '&#39;')}'>${label}</button>`;
const A1 = 'A<sup>1</sup><sub>40:20⌉</sub>', ADD = 'ä<sub>40:20⌉</sub>';
const tp = (t, x) => `<sub>${t}</sub>p<sub>${x}</sub>`;
const m2 = x => money(x, 2);
const S = POLICY.S;
const Y1 = S * QX[40] / (1 + POLICY.i), Y20 = S * QX[59] / (1 + POLICY.i);   // expected death cost per in-force policy, years 1 and 20
const STRESS = price({ mult: 1.2 }), IMPROVE = price({ mult: 0.8 });
const P10 = BASE.rows[10].tp;                                                  // ₁₀p₄₀
let SIM = null;                                                                // built lazily: 400 blocks × 10,000 policies
const sim = () => SIM || (SIM = simulate({ blocks: 400, nPol: 10000, seed: 4020 }));

export default {
  id: 'mortality-table',
  title: 'The Mortality Table',
  sub: 'Pricing a 20-year level term life policy',
  line: 'life',
  level: 'advanced',
  levelLabel: 'Exam FM / LTAM level',
  minutes: 75,
  icon: 'heart',
  audience: 'product committee',
  tagline: 'A small mutual wants to sell term life. What should a 40-year-old pay for $250,000 of cover?',
  concepts: ['Life tables', 'Survival probabilities', 'Term insurance APV', 'Life annuity-due', 'Equivalence principle', 'Gross premiums', 'Sensitivity testing'],
  exam: 'Annuities-due and discounting are SOA Exam FM topics. Survival probabilities, actuarial present values, the equivalence principle and gross premiums are core to SOA Exam LTAM / ALTAM (life contingencies).',
  inspiration: [
    ['SOA Exam FM syllabus (Financial Mathematics)', 'https://www.soa.org/education/exam-req/edu-exam-fm-detail/'],
    ['SOA Exam ALTAM syllabus (Advanced Long-Term Actuarial Mathematics)', 'https://www.soa.org/education/exam-req/edu-exam-altam/'],
    ['BeAnActuary: what actuaries do', 'https://www.beanactuary.org/']],
  source: `All figures are illustrative and were built for teaching. The life table follows Makeham's law with μ(x) = ${MAKEHAM.A} + ${MAKEHAM.B}·${MAKEHAM.c}ˣ, rounded to six decimals. It is realistic in shape but is not a published table and should not be used to price real policies. Expenses and the insurer are fictional.`,

  brief: () => `
  <div class="prose">
    <p><b>Your role:</b> an actuarial analyst at <b>Bluestem Mutual Life</b>, a small, policyholder-owned insurer that so far has sold only whole life and annuities. You have Exam FM behind you and are studying for the life contingencies exam.</p>
    <p><b>The situation:</b> Bluestem's agents keep losing young families to competitors who sell <b>term life</b>: cover for a fixed period, with nothing paid if the insured outlives it. The product committee wants to launch a <b>20-year level term</b> policy and has asked you to price the flagship case: <b>$250,000 of cover for a 40-year-old</b>, with a level premium paid at the start of each year for up to 20 years.</p>
    <p>Bluestem's chief actuary has handed you an illustrative mortality table, a 5% interest assumption and the expense budget. One committee member asks, "<i>Why not just charge the expected claim cost each year?</i>" Another worries, "<i>What if our customers live shorter lives than the table says?</i>"</p>
    <div class="callout"><b>The question:</b> What level annual gross premium should Bluestem charge for this policy, and how sensitive is it to the assumptions?</div>
    <p><b>Deliverables:</b> survival probabilities, the actuarial present values of the benefit and the premiums, the net and gross premiums, a sensitivity test, and a one-page recommendation for the product committee (Recommend tab).</p>
  </div>`,
  briefStats: () => [
    { l: 'Death benefit', v: S, pre: '$' },
    { l: 'Level term', v: POLICY.n, suf: ' years' },
    { l: 'Issue age', v: POLICY.x },
    { l: 'Interest assumption', v: POLICY.i * 100, suf: '%' },
  ],

  primers: [
    { t: 'Reading a life table: qₓ, pₓ and lₓ', tier: 'F', h: `<p>A life table gives, for each age x, the probability <b>qₓ</b> that a life aged exactly x dies before reaching x + 1. Its complement <b>pₓ = 1 − qₓ</b> is the probability of surviving the year. The column <b>lₓ</b> is the expected number still alive at age x out of a starting group (the <b>radix</b>, here 100,000 at age 40), so qₓ = (lₓ − lₓ₊₁) ÷ lₓ.</p>
      <p>Survival over several years multiplies, because to survive t years you must survive each one in turn:</p>
      <div class="formula"><sub>t</sub>p<sub>x</sub> = pₓ · pₓ₊₁ · … · pₓ₊ₜ₋₁ = lₓ₊ₜ ÷ lₓ</div>
      <div class="example"><b>Mini example.</b> If q₆₀ = 0.010 and q₆₁ = 0.012, then <sub>2</sub>p<sub>60</sub> = 0.990 × 0.988 = 0.97812, so <sub>2</sub>q<sub>60</sub> = 1 − 0.97812 = 0.02188.</div>
      <p>Mortality rises with age. Makeham's law models the force of mortality as μ(x) = A + B·cˣ: a constant "accident" part A plus an ageing part that grows exponentially. This case's table comes from that formula.</p>` },
    { t: 'When does the death happen? Deferred probabilities', tier: 'F', h: `<p>To value a death benefit we need the probability of dying in <i>each</i> policy year. The life must survive t years and then die in the next one:</p>
      <div class="formula"><sub>t|</sub>q<sub>x</sub> = <sub>t</sub>p<sub>x</sub> · q<sub>x+t</sub></div>
      <p>Read "t|" as "deferred t years". For example, <sub>3|</sub>q<sub>40</sub> is the probability a 40-year-old dies between ages 43 and 44. The number of whole years lived, <b>K</b>, is the <b>curtate future lifetime</b>: P(K = t) = <sub>t|</sub>q<sub>x</sub>. A 20-year term policy pays a claim exactly when K ≤ 19.</p>
      <p>Check: adding <sub>t|</sub>q<sub>x</sub> for t = 0 to 19 gives <sub>20</sub>q<sub>x</sub>, the chance of dying at some point during the term.</p>` },
    { t: 'Discounting and the annuity-due (Exam FM)', tier: 'F', h: `<p>At an effective annual interest rate i, $1 due in k years is worth <b>vᵏ</b> today, where v = 1 ÷ (1 + i). At 5%, v = 0.952381.</p>
      <p>An <b>annuity-due</b> pays at the <i>start</i> of each period. Its certain present value over n years is</p>
      <div class="formula">ä<sub>n⌉</sub> = 1 + v + v² + … + vⁿ⁻¹ = (1 − vⁿ) ÷ d,  where d = i ÷ (1 + i)</div>
      <div class="example"><b>Mini example.</b> At 5%, ä<sub>3⌉</sub> = 1 + 0.952381 + 0.907029 = 2.859410.</div>
      <p>Premiums are paid in advance, so premium income is an annuity-due. The life-contingent version below only pays while the insured is alive.</p>` },
    { t: 'The APV of a term insurance: A¹ₓ:ₙ', tier: 'F', h: `<p>The <b>actuarial present value</b> (APV) of a payment is its expected present value: amount × probability it is paid × discount factor. This case uses the <b>whole-year (discrete) model</b>: the death benefit is paid at the <i>end</i> of the policy year of death.</p>
      <p>For $1 payable at the end of the year of death within n years:</p>
      <div class="formula">A<sup>1</sup><sub>x:n⌉</sub> = Σ<sub>k=0..n−1</sub> v<sup>k+1</sup> · <sub>k</sub>p<sub>x</sub> · q<sub>x+k</sub></div>
      <p>The superscript 1 over x means only death (not survival to the end) triggers the payment. For a benefit of S, the APV is S · A<sup>1</sup><sub>x:n⌉</sub>.</p>
      <div class="example"><b>Mini example.</b> A 2-year term on a life with q = 0.01 then 0.02 at 5%: A = 0.01 × v + 0.99 × 0.02 × v² = 0.009524 + 0.017959 = 0.027483.</div>` },
    { t: 'The life annuity-due and the net premium', tier: 'F', h: `<p>A premium of 1 at the start of each year, for up to n years while the insured is alive, has APV</p>
      <div class="formula">ä<sub>x:n⌉</sub> = Σ<sub>k=0..n−1</sub> v<sup>k</sup> · <sub>k</sub>p<sub>x</sub></div>
      <p>The first term is always 1 (the first premium is certain). It is a little less than the certain annuity ä<sub>n⌉</sub> because premiums stop at death.</p>
      <p>The <b>equivalence principle</b> sets premiums so that APV of premiums = APV of benefits. With no expenses this gives the <b>net premium</b>:</p>
      <div class="formula">P = S · A<sup>1</sup><sub>x:n⌉</sub> ÷ ä<sub>x:n⌉</sub></div>
      <p>The premium is <b>level</b> even though the expected death cost rises every year. Early premiums exceed early costs, and the excess is held as a <b>reserve</b> to pay for the later years, when costs exceed premiums.</p>` },
    { t: 'Gross premiums: adding expenses', tier: 'F', h: `<p>The insurer also pays commissions, underwriting and administration. The <b>gross premium</b> G solves the equivalence principle with expenses included:</p>
      <div class="formula">G · ä = S · A + PV(expenses)</div>
      <p>Expenses that are a percentage of premium sit on <i>both</i> sides. Bluestem's basis: ${pct(EXP.first, 0)} of the first premium and ${pct(EXP.renew, 0)} of each renewal premium, $${EXP.issue} at issue, and $${EXP.maint} at the start of every year the policy is in force. Writing ${pct(EXP.first, 0)} of the first premium as ${pct(EXP.renew, 0)} of every premium plus ${pct(EXP.first - EXP.renew, 0)} extra in year 1:</p>
      <div class="formula">G · ä = S·A + ${EXP.issue} + ${EXP.maint}·ä + ${EXP.renew}·G·ä + ${EXP.first - EXP.renew}·G  ⇒  G = (S·A + ${EXP.issue} + ${EXP.maint}·ä) ÷ (${1 - EXP.renew}·ä − ${EXP.first - EXP.renew})</div>
      <p>The large first-year cost is why term insurers lose money on policies that lapse early.</p>` },
    { t: 'Sensitivity, improvement, lapses and profit', tier: 'S', h: `<p>A premium is only as good as its assumptions. Actuaries test each one:</p>
      <ul><li><b>Interest:</b> a lower rate means future claims are discounted less, so the premium rises.</li>
      <li><b>Mortality level:</b> a book of healthier lives (or <b>mortality improvement</b> over time) lowers the premium. An epidemic, poor underwriting or <b>anti-selection</b> raises it.</li>
      <li><b>Lapses:</b> term policies have no cash value, so a lapse ends both premiums and cover. If lapsing lives have table mortality, assuming lapses actually <i>lowers</i> the premium, because fewer policies reach the expensive later years. That is called <b>lapse-supported</b> pricing, and it is risky: if fewer people lapse than assumed, or the healthiest lives lapse (<b>selective lapsation</b>) and leave a worse-than-table group, the premium is too low. Each lapse also wastes the first-year acquisition cost.</li></ul>
      <p>The equivalence premium makes the <i>expected</i> profit zero, so a large block loses money about half the time. Real pricing adds a <b>profit margin</b>, for example PV profit = ${pct(PROFIT, 0)} of PV premium: G · ä = S·A + PV(expenses) + ${PROFIT}·G·ä. Larger blocks make results more predictable (the law of large numbers), but each $250,000 claim is large relative to a premium, so a small insurer still sees real volatility and may buy <b>reinsurance</b>. And no number of policies protects against a wrong table.</p>` },
  ],

  exhibits: () => {
    const L = lx(POLICY.x, 25);
    let h = `<section class="exhibit"><h3><span class="ex-n">1</span>The policy and the pricing basis</h3><div class="tblwrap"><table><thead><tr><th>Item</th><th>Assumption</th></tr></thead><tbody>
      <tr><td>Product</td><td>20-year level term life, no cash value</td></tr>
      <tr><td>Insured</td><td>Age 40 at issue, standard underwriting</td></tr>
      <tr><td>Death benefit</td><td class="num">${money(S)}, paid at the end of the policy year of death</td></tr>
      <tr><td>Premiums</td><td>Level, annual, at the start of each year, for up to 20 years while alive</td></tr>
      <tr><td>Interest</td><td class="num">${pct(POLICY.i, 0)} effective per year</td></tr>
      <tr><td>Mortality</td><td>Exhibit 2 (illustrative)</td></tr>
      <tr><td>Lapses</td><td>None assumed in the base basis</td></tr></tbody></table></div></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">2</span>Illustrative mortality table <span class="pill">illustrative</span></h3><div class="tblwrap"><table><thead><tr><th>Age x</th><th>qₓ</th><th>pₓ</th><th>lₓ</th><th>Deaths dₓ</th></tr></thead><tbody>
      ${L.slice(0, 25).map((l, t) => { const x = POLICY.x + t; return `<tr><td>${x}</td><td class="num">${QX[x].toFixed(6)}</td><td class="num">${(1 - QX[x]).toFixed(6)}</td><td class="num">${fmt(l, 1)}</td><td class="num">${fmt(l * QX[x], 1)}</td></tr>`; }).join('')}
      </tbody></table></div><p class="cap">qₓ from Makeham's law μ(x) = ${MAKEHAM.A} + ${MAKEHAM.B}·${MAKEHAM.c}ˣ, so qₓ = 1 − exp(−A − B·cˣ(c − 1)/ln c), rounded to 6 decimals. The rounded values are the table: use them exactly. lₓ starts from a radix of 100,000 at age 40. Not a published table.</p></section>`;
    const S0 = survival(POLICY.x, 25);
    h += `<section class="exhibit"><h3><span class="ex-n">3</span>Survival curve and death rate from age 40</h3><div class="grid-2">
      <div class="card"><div class="small muted">Probability a 40-year-old is alive t years later, <sub>t</sub>p<sub>40</sub></div>${lineChart([{ v: S0, c: 'var(--chart-1)', w: 2.4, area: true }], { x: S0.map((_, t) => t % 5 === 0 ? String(40 + t) : ''), yfmt: v => pct(v, 0), aria: 'Survival probability from age 40 to 65', h: 220, max: 1 })}</div>
      <div class="card"><div class="small muted">One-year death probability qₓ (per 1,000)</div>${columnChart(Array.from({ length: 25 }, (_, t) => ({ l: t % 5 === 0 ? String(40 + t) : '', v: QX[40 + t] * 1000, c: t < 20 ? 'var(--chart-3)' : 'var(--chart-muted)' })), { yfmt: v => fmt(v, 1), aria: 'Death probability per 1,000 by age, 40 to 64', h: 220 })}<p class="cap">Darker columns are the 20 policy years (ages 40–59).</p></div></div></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">4</span>Expense budget</h3><div class="tblwrap"><table><thead><tr><th>Expense</th><th>Amount</th><th>When</th></tr></thead><tbody>
      <tr><td>Commission and premium tax, first year</td><td class="num">${pct(EXP.first, 0)} of premium</td><td>With the first premium</td></tr>
      <tr><td>Commission and premium tax, renewal</td><td class="num">${pct(EXP.renew, 0)} of premium</td><td>With premiums in years 2–20</td></tr>
      <tr><td>Underwriting and issue</td><td class="num">${money(EXP.issue)} per policy</td><td>At issue (time 0)</td></tr>
      <tr><td>Maintenance</td><td class="num">${money(EXP.maint)} per policy</td><td>Start of every year in force, including year 1</td></tr></tbody></table></div>
      <p class="cap">Bluestem's product committee also wants a profit margin. Its usual target is a PV profit of ${pct(PROFIT, 0)} of PV gross premium, but the committee will decide after seeing your numbers.</p></section>`;
    return h;
  },

  tasks: [
    { id: 'm1', tier: 'F', type: 'num', title: 'Survive the term', prompt: () => `Using Exhibit 2, what is the probability that a 40-year-old survives all 20 years of the term, ${tp(20, 40)}? (4 decimals)`,
      answer: () => BASE.npx, tol: 0.00006, explain: () => `${tp(20, 40)} = p₄₀ · p₄₁ · … · p₅₉ = ${BASE.npx.toFixed(6)}, or l₆₀ ÷ l₄₀ = ${fmt(100000 * BASE.npx, 1)} ÷ 100,000. So ${pct(1 - BASE.npx, 2)} of insured 40-year-olds die during the term and Bluestem pays a claim on them.` },
    { id: 'm2', tier: 'F', type: 'num', title: 'Death in year 11', prompt: () => `What is the probability that a 40-year-old dies in the 11th policy year (between ages 50 and 51), ${'<sub>10|</sub>q<sub>40</sub>'}? (5 decimals)`,
      answer: () => DEFERRED_10, tol: 0.000006, explain: () => `<sub>10|</sub>q<sub>40</sub> = ${tp(10, 40)} · q₅₀ = ${P10.toFixed(6)} × ${QX[50].toFixed(6)} = ${DEFERRED_10.toFixed(6)}.` },
    { id: 'm3', tier: 'F', type: 'num', title: 'Value the death benefit', prompt: () => `What is the actuarial present value at issue of the $250,000 death benefit, ${money(S)} × ${A1}? Use 5% interest and pay claims at the end of the year of death. (nearest dollar)`,
      answer: () => BASE.apvBen, rtol: 0.001, explain: () => `${A1} = Σ v<sup>k+1</sup> · <sub>k</sub>p<sub>40</sub> · q<sub>40+k</sub> over k = 0 to 19 = ${BASE.A.toFixed(6)}, so the APV is ${money(S)} × ${BASE.A.toFixed(6)} = ${money(BASE.apvBen, 2)}. The year-1 term alone is v × q₄₀ = ${(QX[40] / 1.05).toFixed(6)}.` },
    { id: 'm4', tier: 'F', type: 'num', title: 'Value the premium stream', prompt: () => `What is the APV of a premium of $1 a year paid at the start of each year for up to 20 years while the insured is alive, ${ADD}? (4 decimals)`,
      answer: () => BASE.a, tol: 0.001, explain: () => `${ADD} = Σ v<sup>k</sup> · <sub>k</sub>p<sub>40</sub> for k = 0 to 19 = ${BASE.a.toFixed(4)}. Compare the certain annuity-due ä<sub>20⌉</sub> = ${((1 - Math.pow(1.05, -20)) / (0.05 / 1.05)).toFixed(4)} at 5%: premiums stop at death, so the life annuity is slightly smaller.` },
    { id: 'm5', tier: 'F', type: 'num', title: 'Net level premium', prompt: () => `Use the equivalence principle with no expenses. What level annual net premium P makes the APV of premiums equal the APV of the death benefit? (dollars, to the cent)`,
      answer: () => BASE.P, rtol: 0.001, explain: () => `P = ${money(BASE.apvBen, 2)} ÷ ${BASE.a.toFixed(4)} = ${m2(BASE.P)} a year. That is ${m2(BASE.P / (S / 1000))} per $1,000 of cover.` },
    { id: 'm6', tier: 'F', type: 'mcq', title: 'Why not charge each year\'s cost?', prompt: () => `The expected death cost per policy still in force is ${m2(Y1)} in year 1 (${money(S)} × q₄₀ × v) and ${m2(Y20)} in year 20 (using q₅₉). The net premium is level at about ${money(BASE.P)}. Which statement is right?`,
      options: [
        'The level premium is wrong: it should be set to the year-20 cost so the insurer is never short.',
        'The level premium is more than the expected cost in early years and less in later years. The early excess, with interest, is held as a reserve that pays for the later years, so the premium stays affordable and level.',
        'The level premium is the simple average of the 20 yearly costs, so no reserve is needed.',
        'Charging the yearly cost would give the same total revenue, so the two approaches are identical for the insurer.'],
      correct: 1, explain: `Rising mortality makes later years expensive. A level premium front-loads the funding: early overpayment builds a policy reserve that is drawn down later. It is not a simple average, because it weights each year by survival and discounting. A yearly-cost premium (yearly renewable term) would start near ${money(Y1)} and climb steeply, and the healthiest lives would drop out as it rose.` },
    { id: 'm7', tier: 'F', type: 'bench', title: 'Load for expenses: the gross premium', bench: 'ltGross',
      prompt: () => `Find the gross annual premium G that satisfies the equivalence principle with Bluestem's expense budget (Exhibit 4) and no profit margin. Type a premium and the bench values every cash flow at issue. Aim for a PV profit of zero (within $1 of the right premium).`,
      check: st => {
        const G = num(st.ltG);
        if (!isFinite(G)) return { ok: false, msg: 'Enter a gross premium first.' };
        if (Math.abs(G - BASE.G) <= 1) return { ok: true, msg: `Complete. G = ${m2(BASE.G)}, which is ${pct(BASE.G / BASE.P - 1, 1)} above the net premium of ${m2(BASE.P)}. The ${pct(EXP.first, 0)} first-year expense alone costs ${m2(EXP.first * BASE.G)} up front.` };
        const r = pvProfit(G, BASE);
        return { ok: false, msg: r.profit < 0 ? `At ${m2(G)} Bluestem expects to lose ${m2(-r.profit)} per policy. Raise the premium.` : `At ${m2(G)} Bluestem expects a PV profit of ${m2(r.profit)} per policy. For this task, find the premium with zero expected profit.` };
      } },
    { id: 'm8', tier: 'S', type: 'num', title: 'What if rates fall to 4%?', prompt: () => `Bluestem's investment team warns that new money may only earn 4%. Recompute the net annual premium at 4% interest, same table, no expenses. (dollars, to the cent)`,
      answer: () => AT_4.P, rtol: 0.001, explain: () => `At 4%: ${A1} = ${AT_4.A.toFixed(6)} and ${ADD} = ${AT_4.a.toFixed(4)}, so P = ${money(S)} × ${AT_4.A.toFixed(6)} ÷ ${AT_4.a.toFixed(4)} = ${m2(AT_4.P)}, up ${pct(AT_4.P / BASE.P - 1)}. Both APVs rise, but the benefit APV rises faster because claims come later than premiums.` },
    { id: 'm9', tier: 'S', type: 'bench', title: 'Stress-test the basis', bench: 'ltSens',
      prompt: () => `Move the sliders to see how the interest rate, the mortality level and lapses move the premium. Try 120% of the table (a mortality shock or weaker underwriting), then 80% (improvement), then add a 5% lapse rate.`,
      check: st => {
        const moved = Object.entries({ ltI: 5, ltM: 100, ltW: 0 }).some(([k, v]) => st[k] != null && num(st[k]) !== v);
        if (!moved) return { ok: false, msg: 'Move at least one slider away from the case basis first.' };
        return { ok: true, msg: `Complete. At 120% mortality the gross premium is ${m2(STRESS.G)} (${spct(STRESS.G / BASE.G - 1)}); at 80% it is ${m2(IMPROVE.G)} (${spct(IMPROVE.G / BASE.G - 1)}). For a 20-year term at age 40, the mortality level moves the premium far more than a one-point change in interest.` };
      } },
    { id: 'm10', tier: 'S', type: 'mcq', title: 'Who lapses?', prompt: () => `Five years after launch, Bluestem notices that many policyholders in good health are dropping their policies to buy cheaper cover from a competitor that has re-underwritten them. What does this do to Bluestem's remaining block?`,
      options: [
        'Nothing. Lapses reduce premiums and claims in proportion, so profitability is unchanged.',
        'It helps. Fewer policies means fewer claims to pay.',
        'It hurts. The lives who stay are less healthy than the table assumes (selective lapsation), so future claims per policy exceed the pricing basis, and the up-front acquisition costs on the lapsed policies are never recovered.',
        'It only matters for whole life policies, because term policies have no cash value.'],
      correct: 2, explain: 'Healthy lives have the best alternatives, so they leave first. The remaining block runs at worse-than-table mortality, like moving the mortality slider above 100%, and the first-year expenses spent on lapsed policies are lost. Term pricing usually builds in lapse assumptions and anti-selection margins for exactly this reason.' },
    { id: 'm11', tier: 'F', type: 'pick', title: 'Lock your recommended gross premium', prompt: () => `Enter the gross annual premium (dollars) you recommend Bluestem charge a 40-year-old for ${money(S)} of 20-year level term cover, then lock it. Include any profit or risk margin you think the committee should add. Locking unlocks the Debrief, which simulates 10,000 policies at your price.`, key: 'pick' },
  ],
  pickShow: st => money(num(st.pick), 2) + ' a year for $250,000 of 20-year term',
  pickHint: '$ a year, e.g. 750',
  pickOk: st => isFinite(num(st.pick)) && num(st.pick) >= 100 && num(st.pick) <= 5000,

  stages: [['Survival', ['m1', 'm2']], ['Present values', ['m3', 'm4']], ['Net premium', ['m5', 'm6']], ['Gross premium', ['m7']], ['Sensitivity', ['m8', 'm9', 'm10'], true], ['Decide', ['m11']]],

  hints: {
    m1: ['Surviving 20 years means surviving each of the 20 one-year periods from age 40 to age 59. Which column of Exhibit 2 gives one-year survival?', () => `Multiply p₄₀ × p₄₁ × … × p₅₉ (20 factors). Or use the lₓ column: ${tp(20, 40)} = l₆₀ ÷ l₄₀. In the workbook, the survival column builds this one row at a time.`],
    m2: ['The life must first survive 10 years, then die in the next one.', () => `<sub>10|</sub>q<sub>40</sub> = ${tp(10, 40)} × q₅₀. From Exhibit 2, ${tp(10, 40)} = l₅₀ ÷ l₄₀ and q₅₀ = ${QX[50].toFixed(6)}.`],
    m3: ['For each policy year k + 1 (k = 0 to 19): probability of dying in that year × discount factor to the end of that year. Add the 20 terms, then multiply by the benefit.', () => `Term for year k + 1: <sub>k</sub>p<sub>40</sub> × q<sub>40+k</sub> × 1.05<sup>−(k+1)</sup>. Year 1: 1 × ${QX[40].toFixed(6)} × 0.952381 = ${(QX[40] / 1.05).toFixed(6)}. Year 2: ${(1 - QX[40]).toFixed(6)} × ${QX[41].toFixed(6)} × 0.907029. The workbook's column H does this row by row.`],
    m4: ['Premium k + 1 is paid at time k only if the insured is alive then. What is its probability and its discount factor?', () => `Term k: <sub>k</sub>p<sub>40</sub> × 1.05<sup>−k</sup>, for k = 0 to 19. The first term is 1 × 1 = 1. The second is ${(1 - QX[40]).toFixed(6)} × 0.952381.`],
    m5: ['Equivalence principle: P × (APV of $1 of premium a year) = APV of the benefit.', () => `P = (your answer to "Value the death benefit") ÷ (your answer to "Value the premium stream").`],
    m6: ['Compare the two costs given with the net premium. When does the premium exceed the cost, and when is it less?', 'Where does the money collected in early years go?'],
    m7: ['Start from the net premium: G must be higher, because expenses are added. Try your net premium, then raise it until the PV profit is close to zero.',
      () => `Equivalence: G × ä = S·A + ${EXP.issue} + ${EXP.maint}·ä + ${EXP.renew}·G·ä + ${EXP.first - EXP.renew}·G. Solve for G: G = (S·A + ${EXP.issue} + ${EXP.maint}·ä) ÷ (${1 - EXP.renew}·ä − ${EXP.first - EXP.renew}).`,
      () => `G = (${fmt(BASE.apvBen, 2)} + ${EXP.issue} + ${EXP.maint} × ${BASE.a.toFixed(4)}) ÷ (${1 - EXP.renew} × ${BASE.a.toFixed(4)} − ${EXP.first - EXP.renew}) = ${m2(BASE.G)}.<br>${setBtn({ ltG: BASE.G.toFixed(2) }, 'Use this premium')}`],
    m8: ['Rebuild both APVs with v = 1 ÷ 1.04. The table does not change. In the workbook, change the interest rate cell B9 to 0.04.', () => `At 4%, ${A1} = ${AT_4.A.toFixed(6)} and ${ADD} = ${AT_4.a.toFixed(4)}. Divide, then multiply by ${money(S)}.`],
    m9: ['Any slider move completes the task. Watch the dashed line on the premium chart.', () => `Try the stress scenario: 120% mortality at 4% interest.<br>${setBtn({ ltI: '4', ltM: '120', ltW: '0' }, 'Set 4% interest, 120% mortality')}`,
      () => `Then add lapses: 5% a year at the case interest and mortality. Surprised the premium falls? Lapsers here have table mortality, so lapses remove expensive later years. Pricing that relies on this is "lapse-supported" and fails if lapses are lower than assumed or selective.<br>${setBtn({ ltI: '5', ltM: '100', ltW: '5' }, 'Set a 5% lapse rate')}`],
    m10: ['Which policyholders can most easily get a cheaper policy elsewhere?', 'If the people who stay are less healthy than average, which slider in the stress test describes the result?'],
  },

  model: () => `<h3>Model solution</h3><div class="prose">
    <p><b>Survival.</b> ${tp(20, 40)} = ${BASE.npx.toFixed(4)}, so ${pct(1 - BASE.npx, 1)} of insured 40-year-olds are expected to die within the term. The chance of a death in year 11 is <sub>10|</sub>q<sub>40</sub> = ${DEFERRED_10.toFixed(5)}.</p>
    <p><b>Present values at 5%.</b> ${A1} = ${BASE.A.toFixed(6)}, so the death benefit is worth ${money(BASE.apvBen, 2)} at issue. ${ADD} = ${BASE.a.toFixed(4)}.</p>
    <p><b>Premiums.</b> Net premium ${m2(BASE.P)}. With Bluestem's expenses the equivalence-principle gross premium is ${m2(BASE.G)} (${spct(BASE.G / BASE.P - 1)}). Adding the committee's usual margin (PV profit = ${pct(PROFIT, 0)} of PV premium) gives ${m2(BASE.Gp)}, which we round up to <b>${money(MODEL_G)}</b>.</p>
    <p><b>Sensitivity.</b> At 4% interest the net premium rises to ${m2(AT_4.P)} (${spct(AT_4.P / BASE.P - 1)}). The gross premium is ${m2(STRESS.G)} at 120% of table mortality and ${m2(IMPROVE.G)} at 80%. Mortality is the assumption that matters most, and the table is illustrative, so the margin is doing real work.</p>
    <p><b>Recommendation.</b> Charge about ${money(MODEL_G)} a year (${money(MODEL_G / (S / 1000), 2)} per $1,000). It covers expected claims and expenses with a modest margin, cuts the chance that a 10,000-policy block loses money from about half to ${pct(profitStats(sim(), MODEL_G).pLoss, 0)} at table mortality, and stays far closer to market than pricing for a full 120% mortality shock would. Monitor actual-to-expected deaths and lapses from year 1, and re-price new business if experience runs above about 105% of the table.</p></div>`,

  debrief(st) {
    const G = num(st.pick), sm = sim(), n = sm.nPol;
    const cands = [['Net premium (no expenses)', BASE.P], ['Equivalence gross premium', BASE.G], ['Model recommendation', MODEL_G], ['Your premium', G]];
    const stats = cands.map(([l, g]) => [l, g, profitStats(sm, g), pvProfit(g, BASE).profit, pvProfit(g, STRESS).profit]);
    const mine = stats[3][2], mineExp = stats[3][3];
    const verdict = G < BASE.G - 1 ? `Your premium is below the equivalence gross premium, so Bluestem expects to lose ${money(-mineExp, 2)} on every policy it sells. Across 400 simulated blocks of 10,000 policies, ${pct(mine.pLoss, 0)} lost money. Selling more policies makes the loss more certain, not less.`
      : G < MODEL_G - 2.5 ? `Your premium covers expected claims and expenses but carries a thin margin, so a 10,000-policy block loses money in ${pct(mine.pLoss, 0)} of simulations, and any adverse mortality would turn it into a loss.`
        : G <= MODEL_G * 1.08 ? `Your premium carries a sensible margin: expected PV profit of ${money(mineExp, 2)} per policy, and only ${pct(mine.pLoss, 1)} of simulated blocks lost money at table mortality.`
          : `Your premium is very safe (expected PV profit ${money(mineExp, 2)} per policy), but it is ${pct(G / BASE.G - 1, 0)} above the cost-covering premium. Competitors pricing nearer cost would win most healthy applicants, and the lives who still buy may be the ones who can't get cover elsewhere.`;
    // Histogram of block PV profit at the learner's premium (in $ millions).
    const v = mine.values, lo = v[0], hi = v[v.length - 1], nb = 16, wdt = (hi - lo) / nb || 1;
    const bins = Array.from({ length: nb }, (_, k) => ({ a: lo + k * wdt, n: 0 }));
    v.forEach(x => { bins[Math.min(nb - 1, Math.floor((x - lo) / wdt))].n++; });
    const hist = columnChart(bins.map((b, k) => ({ l: k % 3 === 0 ? '$' + fmt((b.a + wdt / 2) / 1e6, 1) + 'M' : '', v: b.n, c: b.a + wdt / 2 < 0 ? 'var(--chart-3)' : 'var(--chart-1)' })), { yfmt: x => fmt(x), aria: 'Distribution of block PV profit at your premium over 400 simulated blocks', h: 220 });
    const exp = sm.expDeaths, act = sm.firstDeaths;
    return `<div class="stack-lg">
      <div class="kpis">
        <div class="kpi hero"><div class="l">Model recommended premium</div><div class="v" data-count="${MODEL_G}" data-prefix="$">${money(MODEL_G)}</div></div>
        <div class="kpi"><div class="l">Your premium</div><div class="v">${money(G, 2)}</div></div>
        <div class="kpi"><div class="l">Your expected PV profit per policy</div><div class="v" style="color:${mineExp >= 0 ? 'var(--good)' : 'var(--bad)'}">${money(mineExp, 2)}</div></div>
        <div class="kpi"><div class="l">Simulated blocks that lost money</div><div class="v" style="color:${mine.pLoss <= 0.05 ? 'var(--good)' : 'var(--bad)'}">${pct(mine.pLoss, 1)}</div></div>
      </div>
      <div class="callout"><b>If you had priced this way…</b> We simulated 400 independent blocks of ${fmt(n)} policies each, every policyholder's lifetime drawn from the table (seeded, so everyone sees the same lives). ${verdict}</div>
      <div class="tblwrap"><table><thead><tr><th>Premium</th><th>Annual premium</th><th>Expected PV profit per policy</th><th>Expected PV profit, 10,000 policies</th><th>Blocks with a loss</th><th>Worst 5% of blocks, PV profit</th><th>Expected PV profit per policy at 120% mortality</th></tr></thead><tbody>
        ${stats.map(([l, g, s, e, e120]) => `<tr${l === 'Your premium' ? ' class="total"' : ''}><td>${l}</td><td class="num">${money(g, 2)}</td><td class="num">${money(e, 2)}</td><td class="num">${money(e * n)}</td><td class="num">${pct(s.pLoss, 1)}</td><td class="num">${money(s.p5)}</td><td class="num">${money(e120, 2)}</td></tr>`).join('')}</tbody></table></div>
      <div class="grid-2">
        <div class="card"><h3 style="margin-bottom:6px">PV profit of a 10,000-policy block at your premium</h3><p class="small muted" style="margin:0 0 6px">400 simulated blocks. Columns centred below $0 (shown in the loss color) are losses.</p>${hist}<p class="cap">Mean ${money(mine.mean)}; 5th percentile ${money(mine.p5)}; range ${money(mine.min)} to ${money(mine.max)}.</p></div>
        <div class="card"><h3 style="margin-bottom:6px">Deaths by policy year, one simulated block</h3><p class="small muted" style="margin:0 0 6px">Simulated (solid) vs. expected from the table (dashed)</p>${lineChart([{ v: exp, c: 'var(--chart-muted)', w: 2, dash: true, label: 'Expected' }, { v: act, c: 'var(--chart-3)', w: 2.2, label: 'Simulated' }], { x: exp.map((_, k) => (k + 1) % 5 === 0 || k === 0 ? 'yr ' + (k + 1) : ''), yfmt: x => fmt(x), aria: 'Simulated versus expected deaths by policy year', h: 220, min: 0 })}<p class="cap">${fmt(act.reduce((s, x) => s + x, 0))} simulated deaths against ${fmt(exp.reduce((s, x) => s + x, 0), 1)} expected. Deaths climb with age, which is why the level premium has to pre-fund the later years.</p></div>
      </div>
      <div class="card"><h3 style="margin-bottom:8px">Expected PV profit per policy by premium</h3>${barChart(stats.flatMap(([l, g, s, e, e120]) => [
        { l: l + ': table', v: e, c: e >= 0 ? 'var(--chart-1)' : 'var(--chart-3)', strong: l === 'Your premium' },
        { l: l + ': 120% mortality', v: e120, c: e120 >= 0 ? 'var(--chart-4)' : 'var(--chart-3)', strong: l === 'Your premium' }]), { fmt: x => money(x, 0), aria: 'Expected PV profit per policy by premium, at table and 120% mortality', labelW: 290 })}<p class="cap">Bars show size; read the sign from the value label. Random fluctuation shrinks as the block grows, but a wrong table does not: at 120% mortality the model premium ${stats[2][4] < 0 ? `expects a PV loss of ${money(-stats[2][4], 2)}` : `still expects a PV profit of ${money(stats[2][4], 2)}`} per policy.</p></div>
      <div class="card">${this.model()}</div></div>`;
  },

  // A getter so the simulation behind the loss probability only runs when the summary is shown.
  get modelSummary() { return `**Recommendation:** Price the 20-year level term policy for a 40-year-old at **${money(MODEL_G)} a year for ${money(S)} of cover** (${money(MODEL_G / (S / 1000), 2)} per $1,000), and monitor mortality and lapse experience from launch.

**How we got there:** From the illustrative table, ${pct(BASE.npx, 1)} of 40-year-olds survive the 20-year term, so ${pct(1 - BASE.npx, 1)} are expected to claim. At 5% interest the death benefit is worth ${money(BASE.apvBen)} at issue, and a $1-a-year premium paid while alive is worth ${BASE.a.toFixed(2)}. The net premium is therefore ${m2(BASE.P)}. Adding Bluestem's expenses (${pct(EXP.first, 0)} of the first premium, ${pct(EXP.renew, 0)} of renewals, $${EXP.issue} at issue and $${EXP.maint} a year) gives a break-even gross premium of ${m2(BASE.G)}. A ${pct(PROFIT, 0)} profit margin on PV premium brings it to ${m2(BASE.Gp)}, rounded to ${money(MODEL_G)}.

**Why level, and why a margin:** A level premium is more than the expected claim cost early on (about ${money(Y1)} in year 1) and less later (about ${money(Y20)} in year 20); the early excess is reserved to fund later claims. At the break-even premium a large block loses money about half the time; with the margin, a 10,000-policy block loses money in about ${pct(profitStats(sim(), MODEL_G).pLoss, 0)} of simulations at table mortality. Each $250,000 claim is large for a small mutual, so we also suggest pricing a reinsurance quote for the amount above $100,000.

**Risks:** Mortality is the key assumption. At 120% of the table the break-even premium is ${m2(STRESS.G)}, above our price; at 80% it is ${m2(IMPROVE.G)}. A drop in interest to 4% raises the net premium by ${pct(AT_4.P / BASE.P - 1, 0)}. Selective lapses by healthy lives would push the remaining block toward worse-than-table mortality.

**Next steps:** replace the illustrative table with an industry table adjusted for Bluestem's underwriting, add a lapse assumption, and track actual-to-expected deaths each quarter.`; },

  judgeBank: [
    ['Why is the premium level when the risk of death rises every year?', 'Explains pre-funding: early premiums exceed expected cost (about $274 in year 1 vs a ~$600 net premium) and build a reserve that pays for later years (about $1,426 in year 20). A rising yearly premium would drive healthy lives away.'],
    ['Walk us from the net premium to your recommended premium.', 'Net premium from the equivalence principle (S·A ÷ ä), then expenses on both sides of the equation, giving the break-even gross premium, then a stated profit margin and rounding. Quotes each number.'],
    ['How confident are you in the mortality table?', 'It is illustrative (Makeham), not Bluestem\'s own experience or a published table. Shows the sensitivity (120% and 80% of table) and proposes an industry table with underwriting adjustments plus actual-to-expected monitoring.'],
    ['Interest rates just fell. How much does that matter?', 'Lower rates raise the premium because claims are discounted less. At 4% the net premium rises about 4%. Notes that for 20-year term, mortality matters more than interest, but both should be tested.'],
    ['If we sell 10,000 policies, can we still lose money?', 'Yes. At the break-even premium, roughly half of large blocks lose money. A margin makes random losses much less likely (about 7% of simulated 10,000-policy blocks at a 5% margin), and reinsurance can cut the volatility from large claims. But no volume protects against the table being wrong (parameter risk).'],
    ['What happens if healthy policyholders lapse?', 'Selective lapsation leaves worse lives, so mortality runs above the table and front-loaded acquisition costs are not recovered. Mentions lapse assumptions and anti-selection margins.'],
    ['Why pay the death benefit at the end of the year in your model?', 'It is the whole-year (discrete) model, a standard simplification. Real claims are paid soon after death, so the true APV is slightly higher (about half a year of interest). It could be adjusted with an (i/δ) or half-year factor.'],
    ['Would your premium be competitive?', 'Compares the margin against what competitors might charge and the risk of overpricing (losing healthy applicants, anti-selection). Admits the price depends on the underwriting class and that market comparison is needed before launch.'],
  ],

  context(st) {
    return `CASE: Bluestem Mutual Life (fictional), pricing a 20-year level term life policy, $250,000 death benefit paid at end of year of death, issue age 40, level annual premiums in advance, 5% interest, illustrative Makeham mortality (q40 = ${QX[40]}, q50 = ${QX[50]}, q59 = ${QX[59]}). Expenses: ${EXP.first * 100}% of first premium, ${EXP.renew * 100}% of renewals, $${EXP.issue} at issue, $${EXP.maint} per year maintenance. Correct analysis: 20p40 = ${BASE.npx.toFixed(4)}; 10|q40 = ${DEFERRED_10.toFixed(5)}; A1(40:20) = ${BASE.A.toFixed(6)}; APV benefit = $${BASE.apvBen.toFixed(2)}; a-due(40:20) = ${BASE.a.toFixed(4)}; net premium = $${BASE.P.toFixed(2)}; equivalence gross premium = $${BASE.G.toFixed(2)}; with 5% PV profit margin $${BASE.Gp.toFixed(2)} (model recommends $${MODEL_G}). Net premium at 4% = $${AT_4.P.toFixed(2)}; gross at 120% mortality = $${STRESS.G.toFixed(2)}, at 80% = $${IMPROVE.G.toFixed(2)}.
STUDENT WORK: 20p40 ${st.ans?.m1 || '?'}; 10|q40 ${st.ans?.m2 || '?'}; APV benefit ${st.ans?.m3 || '?'}; annuity ${st.ans?.m4 || '?'}; net premium ${st.ans?.m5 || '?'}; gross premium (bench) ${st.ltG || '?'}; net premium at 4% ${st.ans?.m8 || '?'}; recommended gross premium ${st.pick ? '$' + st.pick : 'not yet selected'}.`;
  },

  workbook: {
    inputs: ['E18:E37', 'H18:H37', 'I18:I37', 'B44:B45'],
    cols: { A: 290, B: 110, C: 100, D: 110, E: 200, F: 100, G: 100, H: 230, I: 200 },
    formats: { 'B9': 'pct1', 'B10': 'money0', 'B12:B13': 'pct0', 'B14:B15': 'money0', 'C18:D37': 'dec6', 'E18:E37': 'dec6', 'F18:G37': 'dec6', 'H18:H38': 'dec6', 'I18:I38': 'dec4', 'B40': 'dec6', 'B41': 'dec4', 'B42': 'dec4', 'B43:B49': 'money2' },
    checks: [
      { cell: 'E28', label: '10p40 (start of year 11)', answer: P10, tol: 5e-7 },
      { cell: 'E37', label: '19p40 (start of year 20)', answer: BASE.rows[19].tp, tol: 5e-7 },
      { cell: 'B42', label: '20p40', answer: BASE.npx, tol: 5e-7 },
      { cell: 'H38', label: 'A1 40:20 per $1', answer: BASE.A, tol: 5e-7 },
      { cell: 'I38', label: 'ä 40:20', answer: BASE.a, tol: 5e-5 },
      { cell: 'B44', label: 'Net annual premium', answer: BASE.P, tol: 0.01 },
      { cell: 'B45', label: 'Gross premium (zero PV profit)', answer: BASE.G, tol: 1 },
    ],
    links: [{ cell: 'B44', path: 'ans.m5' }, { cell: 'B45', path: 'ltG' }],
  },
  csv() {
    const r = [];
    r.push(['OpenActuary | The Mortality Table (Bluestem Mutual Life) | illustrative data']);
    r.push(['HOW TO USE: yellow cells marked YOUR FORMULA / YOUR INPUT are blank. Fill the first row of each column, then drag the fill handle down. Checks at the top compare with the case basis (5% interest, 100% of table).']);
    r.push(['STEP 1: Survival column E. E18 = 1 (everyone is alive at issue). E19 = E18*(1-D18), then fill down to E37. E is kp40, the probability of being alive at the start of policy year k+1.']);
    r.push(['STEP 2: Death benefit column H = E*D*G (alive at the start, dies in the year, discounted to the end of the year). Annuity column I = E*F (alive at the start, discounted to the start).']);
    r.push(['STEP 3: B44 = net premium = APV of benefit / annuity. Then try gross premiums in B45 until the PV profit in B48 is zero (or solve it with algebra).']);
    r.push(['STEP 4 (stretch): change the interest rate in B9 (e.g. 0.04) or the mortality multiplier in B11 (e.g. 1.2) and watch every value update. Put them back to 0.05 and 1 for the checks.']);
    r.push([]);
    r.push(['Assumptions']);
    r.push(['Interest rate i', POLICY.i]);
    r.push(['Death benefit S', S]);
    r.push(['Mortality multiplier (1 = table)', 1]);
    r.push(['First-year premium expense (share of G)', EXP.first]);
    r.push(['Renewal premium expense (share of G)', EXP.renew]);
    r.push(['Issue expense ($, at time 0)', EXP.issue]);
    r.push(['Maintenance expense ($ per year in force)', EXP.maint]);
    r.push([]);
    r.push(['Policy year k+1', 'Age x', 'q(x) table', 'q(x) used', 'kp40 at start of year (YOUR FORMULA)', 'v^k (start)', 'v^(k+1) (end)', 'Benefit APV term (YOUR FORMULA = E*D*G)', 'Annuity term (YOUR FORMULA = E*F)']);
    for (let k = 0; k < POLICY.n; k++) {
      const rr = 18 + k;
      r.push([k + 1, POLICY.x + k, QX[POLICY.x + k], `=MIN(1,C${rr}*$B$11)`, '', `=1/(1+$B$9)^(A${rr}-1)`, `=F${rr}/(1+$B$9)`, '', '']);
    }
    r.push(['Total (sums of the columns)', '', '', '', '', '', '', '=SUM(H18:H37)', '=SUM(I18:I37)']);
    r.push([]);
    r.push(['A1 40:20 (APV of $1 of death benefit)', '=H38']);
    r.push(['ä 40:20 (APV of $1 a year of premium)', '=I38']);
    r.push(['20p40 (survive the whole term)', '=E37*(1-D37)']);
    r.push(['APV of the death benefit', '=B10*B40']);
    r.push(['Net annual premium (YOUR FORMULA = B43/B41)', '']);
    r.push(['Gross annual premium (YOUR INPUT: try values)', '']);
    r.push(['PV of gross premiums', '=B45*B41']);
    r.push(['PV of benefits + expenses', '=B43+B14+B15*B41+B12*B45+B13*B45*(B41-1)']);
    r.push(['PV profit at issue (aim for 0)', '=B46-B47']);
    r.push(['Check: equivalence gross premium (formula)', '=(B43+B14+B15*B41)/((1-B13)*B41-(B12-B13))']);
    return r;
  },
};
