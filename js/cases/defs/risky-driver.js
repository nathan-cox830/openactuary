// Who's a Risky Driver? An Exam P-level case: total probability, Bayes' theorem, independence vs.
// conditional independence, and the base-rate trap, applied to an accident surcharge decision.
import { fmt, pct, spct, num, money } from '../../util.js';
import { barChart, columnChart } from '../../ui/charts.js';
import { CLASSES, BASE, A, analyze, priceWith, simulate } from '../lib/driver.js';

const setBtn = (obj, label = 'Use these values') => `<button class="btn sm ghost" style="margin-top:8px" data-setstate='${JSON.stringify(obj).replace(/'/g, '&#39;')}'>${label}</button>`;
const p4 = x => x.toFixed(4);
const SIM = simulate(10000, 2026);
const LOW_HIGH = analyze({ prior: [0.65, 0.30, 0.05], p: BASE.p, cost: BASE.cost });

export default {
  id: 'risky-driver',
  title: 'Who\'s a Risky Driver?',
  sub: 'Accident surcharges with Bayes\' theorem',
  line: 'pc',
  level: 'exam-p',
  levelLabel: 'Exam P level',
  minutes: 45,
  icon: 'car',
  audience: 'product committee',
  tagline: 'One accident: bad luck or a bad driver? Price the difference.',
  concepts: ['Law of total probability', 'Bayes\' theorem', 'Base rates', 'Independence', 'Conditional independence', 'Experience rating'],
  exam: 'Total probability, Bayes\' theorem and independence are core General Probability topics on SOA Exam P.',
  inspiration: [
    ['SOA Exam P syllabus (General Probability)', 'https://www.soa.org/education/exam-req/edu-exam-p-detail/'],
    ['BeAnActuary: what actuaries do', 'https://www.beanactuary.org/']],
  source: 'All figures are illustrative and were built for teaching. The risk classes, accident rates and claim cost are realistic in size but do not come from a specific insurer. The two-year driver history in Exhibit 3 is simulated from the class model.',

  brief: () => `
  <div class="prose">
    <p><b>Your role:</b> a junior pricing analyst at <b>Heartland Auto</b>, a regional personal auto insurer. You passed Exam P last spring, and your manager wants to see you put it to work.</p>
    <p><b>The situation:</b> Heartland's drivers fall into three hidden risk classes, Low, Medium and High, that underwriting can't observe directly. Today every renewing driver pays the same base rate. The product committee is debating an <b>accident surcharge</b>: drivers with an at-fault accident this year would pay more next year.</p>
    <p>Two camps have formed. One says <i>"one accident is just bad luck; a surcharge punishes good drivers."</i> The other says <i>"an accident tells us who the risky drivers are; we should double their rate."</i></p>
    <div class="callout"><b>The question:</b> What does one accident really tell us about a driver? What surcharge, if any, should Heartland file?</div>
    <p><b>Deliverables:</b> the probability analysis, a recommended surcharge, and a short summary for the product committee (Recommend tab).</p>
  </div>`,
  briefStats: () => [
    { l: 'Drivers in the High class', v: 10, suf: '%' },
    { l: 'High-class accident rate vs Low', v: 5, suf: '×' },
    { l: 'Average at-fault claim', v: 9000, pre: '$' },
  ],

  primers: [
    { t: 'The law of total probability', tier: 'F', h: `<p>When the population splits into groups that don't overlap and together cover everyone (a <b>partition</b>), the overall chance of an event is a weighted average of the chance in each group:</p>
      <div class="formula">P(A) = P(A | B₁)·P(B₁) + P(A | B₂)·P(B₂) + … + P(A | Bₖ)·P(Bₖ)</div>
      <p>Each term P(A | Bᵢ)·P(Bᵢ) is the probability of the joint event "in group i <i>and</i> A happens". On a probability tree it's one branch: multiply along the path, then add the branches that end in A.</p>
      <div class="example"><b>Mini example.</b> 70% of policies are home and 30% are condo. Claim rates are 4% and 2%. P(claim) = 0.70 × 0.04 + 0.30 × 0.02 = 0.028 + 0.006 = 0.034.</div>` },
    { t: 'Bayes\' theorem: reading the tree backwards', tier: 'F', h: `<p>The tree gives us P(accident | class). Pricing needs the reverse: given that a driver had an accident, which class are they probably in?</p>
      <div class="formula">P(Bᵢ | A) = P(A | Bᵢ)·P(Bᵢ) ÷ P(A)</div>
      <p>In words: take the one branch you care about and divide by the total of all branches ending in A. The answer is the <b>posterior</b>: your updated belief after seeing the evidence. The starting share P(Bᵢ) is the <b>prior</b>.</p>
      <div class="example">In the home/condo example, P(condo | claim) = 0.006 ÷ 0.034 = 17.6%. Condos are 30% of policies but only 17.6% of claims.</div>` },
    { t: 'The base-rate trap', tier: 'F', h: `<p>A group can be much riskier per member and still produce a minority of the events, because it is small. Ignoring how common each group is (the <b>base rate</b>) is one of the most common reasoning errors, in medicine, fraud detection and insurance alike.</p>
      <p>Natural frequencies make it concrete. Picture 10,000 drivers: 6,000 Low, 3,000 Medium, 1,000 High. With accident rates of 5%, 10% and 25%, you get 300 + 300 + 250 = 850 accidents. High-risk drivers are 5 times as accident-prone as Low, yet only 250 of the 850 drivers with an accident (29%) are High risk.</p>` },
    { t: 'Independence vs. conditional independence', tier: 'F', h: `<p>Events A and B are <b>independent</b> when P(A ∩ B) = P(A)·P(B), or equivalently P(B | A) = P(B): knowing A happened tells you nothing about B.</p>
      <p>In this case, accidents are independent from year to year <i>within a class</i>. That's <b>conditional independence</b>. But for a driver drawn at random from the whole book, an accident this year <i>does</i> raise the chance of one next year, because it shifts your belief toward the riskier classes. Conditional independence does not imply independence. This is exactly why claims history predicts future claims.</p>
      <div class="formula">P(A₂ | A₁) = Σᵢ P(A₂ | Bᵢ)·P(Bᵢ | A₁)</div>` },
    { t: 'From probabilities to premiums', tier: 'F', h: `<p>The <b>pure premium</b> is expected loss per driver: P(accident) × average claim cost. If the chance of an accident next year differs between drivers with and without an accident this year, a fair price differs too:</p>
      <div class="formula">Indicated surcharge = P(A₂ | A₁) ÷ P(A₂ | no A₁) − 1</div>
      <p>If drivers with an accident pay too little, everyone else subsidizes them. If they pay too much, the reverse. Either way, competitors who price more accurately will pick off the overpaying group.</p>` },
    { t: 'Experience rating and credibility', tier: 'S', h: `<p>Using a policyholder's own claims history to adjust their price is called <b>experience rating</b>. One year of history is weak evidence: most drivers with an accident are still Low or Medium risk. Two accidents are much stronger evidence. <b>Credibility theory</b> (an Exam STAM / MAS topic) formalizes how much weight a policyholder's own experience deserves, and the Bayesian calculation in this case is its foundation.</p>
      <p>Real surcharge plans also weigh fairness and regulation: many states limit surcharges, require that the accident be at fault, or allow "accident forgiveness" for a first minor accident.</p>` },
  ],

  exhibits: () => {
    let h = `<section class="exhibit"><h3><span class="ex-n">1</span>Heartland's risk classes <span class="pill">illustrative</span></h3><div class="tblwrap"><table><thead><tr><th>Risk class</th><th>Share of drivers</th><th>P(at-fault accident in a year)</th><th>Average claim cost</th></tr></thead><tbody>
      ${CLASSES.map((c, i) => `<tr><td>${c}</td><td class="num">${pct(BASE.prior[i], 0)}</td><td class="num">${pct(BASE.p[i], 0)}</td><td class="num">${money(BASE.cost)}</td></tr>`).join('')}
      </tbody></table></div><p class="cap">Classes are hidden: underwriting can't see which class a driver is in. Each driver has at most one at-fault accident a year, and given the class, years are independent. Claim cost is the same for every class.</p></section>`;
    h += `<section class="exhibit"><h3><span class="ex-n">2</span>Annual accident probability by class</h3><div class="card">${barChart(CLASSES.map((c, i) => ({ l: c + ' risk', v: BASE.p[i], c: ['var(--chart-4)', 'var(--chart-2)', 'var(--chart-3)'][i] })), { fmt: v => pct(v, 0), aria: 'Accident probability by class', labelW: 140 })}</div></section>`;
    const C = SIM.counts;
    h += `<section class="exhibit"><h3><span class="ex-n">3</span>Two-year history of 10,000 renewing drivers <span class="pill">simulated</span></h3><div class="tblwrap"><table><thead><tr><th></th><th>Accident in year 2</th><th>No accident in year 2</th><th>Total</th></tr></thead><tbody>
      <tr><td>Accident in year 1</td><td class="num">${fmt(C.both)}</td><td class="num">${fmt(C.onlyA1)}</td><td class="num">${fmt(C.both + C.onlyA1)}</td></tr>
      <tr><td>No accident in year 1</td><td class="num">${fmt(C.onlyA2)}</td><td class="num">${fmt(C.neither)}</td><td class="num">${fmt(C.onlyA2 + C.neither)}</td></tr>
      <tr class="total"><td>Total</td><td class="num">${fmt(C.both + C.onlyA2)}</td><td class="num">${fmt(C.onlyA1 + C.neither)}</td><td class="num">${fmt(SIM.n)}</td></tr></tbody></table></div>
      <p class="cap">Simulated from Exhibit 1's model, so it carries random noise. Use it to sanity-check your theory: drivers with a year-1 accident had a year-2 accident ${pct(C.both / (C.both + C.onlyA1))} of the time, against ${pct(C.onlyA2 / (C.onlyA2 + C.neither))} for drivers without one.</p></section>`;
    return h;
  },

  tasks: [
    { id: 'd1', tier: 'F', type: 'num', title: 'How often does anyone crash?', prompt: () => `Using Exhibit 1, what is the probability that a randomly chosen Heartland driver has an at-fault accident this year? (4 decimals)`,
      answer: () => A.pA, tol: 0.00051, explain: () => `Law of total probability: 0.60 × 0.05 + 0.30 × 0.10 + 0.10 × 0.25 = 0.030 + 0.030 + 0.025 = ${p4(A.pA)}.` },
    { id: 'd2', tier: 'F', type: 'bench', title: 'Build the probability tree', bench: 'ptree',
      prompt: () => `Fill in the joint probability at the end of each "Accident" branch: P(class ∩ accident). The tree updates as you type.`,
      check: st => {
        const v = ['jL', 'jM', 'jH'].map(k => num(st[k]));
        if (!v.every(isFinite)) return { ok: false, msg: 'Enter all three accident branches.' };
        const bad = v.map((x, i) => Math.abs(x - A.joint[i]) > 0.0005 ? CLASSES[i] : null).filter(Boolean);
        if (bad.length) return { ok: false, msg: `Check the ${bad.join(' and ')} branch${bad.length > 1 ? 'es' : ''}: multiply along the path from the root.` };
        return { ok: true, msg: `Complete. The three branches add to ${p4(A.pA)}, matching the previous task. Low and Medium branches are equal: more Low drivers exactly offsets their lower accident rate.` };
      } },
    { id: 'd3', tier: 'F', type: 'num', title: 'Bayes: who just crashed?', prompt: () => `A driver had an at-fault accident this year. What is the probability they are in the High class? (as a %, 1 decimal)`,
      answer: () => A.post[2] * 100, tol: 0.15, explain: () => `P(High | Accident) = 0.025 ÷ ${p4(A.pA)} = ${pct(A.post[2])}. Low and Medium are ${pct(A.post[0])} each.` },
    { id: 'd4', tier: 'F', type: 'mcq', title: 'Spot the base-rate trap', prompt: () => `A committee member says: "High-risk drivers crash five times as often as low-risk drivers, so most drivers with an accident must be high risk." What's wrong with that?`,
      options: ['Nothing. A 5× higher accident rate means High drivers make up about 5/6 of drivers with an accident.', 'It ignores the base rate: High drivers are only 10% of the book, so even at 5× the rate they make up under a third of drivers with an accident.', 'It confuses accidents with claims. The two can\'t be compared.', 'High drivers are actually the majority, but only in year 2.'],
      correct: 1, explain: `Of 10,000 drivers, 1,000 are High and 250 of them crash. But 300 Low and 300 Medium drivers crash too. So 250 of 850, about ${pct(A.post[2], 0)}, are High. The rate ratio alone says nothing about the mix of drivers who crash.` },
    { id: 'd5', tier: 'F', type: 'num', title: 'Does an accident predict another?', prompt: () => `Given a driver had an accident in year 1, what is the probability they have one in year 2? (4 decimals) Hint: within each class, years are independent.`,
      answer: () => A.a2GivenA1, tol: 0.0006, explain: () => `P(A₁ ∩ A₂) = 0.60 × 0.05² + 0.30 × 0.10² + 0.10 × 0.25² = ${p4(A.both)}. Divide by P(A₁) = ${p4(A.pA)}: ${p4(A.a2GivenA1)}. Equivalently, weight each class's 0.05 / 0.10 / 0.25 by the posterior mix from Bayes.` },
    { id: 'd6', tier: 'F', type: 'mcq', title: 'Independent or not?', prompt: () => `Within each class, year-1 and year-2 accidents are independent. For a randomly chosen Heartland driver, are they independent?`,
      options: ['Yes. Independence within every class means independence overall.', `No. P(A₂ | A₁) ≈ ${pct(A.a2GivenA1, 1)} is higher than P(A₂) = ${pct(A.pA, 1)}. An accident shifts the odds toward the riskier classes, so it carries information about next year.`, 'No, because accidents in consecutive years can never be independent.', 'It can\'t be determined without claim costs.'],
      correct: 1, explain: 'This is conditional independence without independence. Mixing classes with different accident rates creates dependence for a randomly chosen driver. It\'s the probabilistic reason claims history is useful in pricing.' },
    { id: 'd7', tier: 'F', type: 'num', title: 'Price the difference', prompt: () => `P(accident next year | no accident this year) is ${p4(A.a2GivenClean)}. Using your answer to "Does an accident predict another?", what surcharge is indicated for drivers with an accident? (as a %, 1 decimal)`,
      answer: () => A.surcharge * 100, tol: 0.25, explain: () => `${p4(A.a2GivenA1)} ÷ ${p4(A.a2GivenClean)} − 1 = ${pct(A.surcharge)}. In pure premium terms: ${money(A.ppAcc)} vs ${money(A.ppClean)} at a ${money(BASE.cost)} average claim.` },
    { id: 'd8', tier: 'S', type: 'num', title: 'Two strikes', prompt: () => `A driver had accidents in both year 1 and year 2. What is the probability they are in the High class now? (as a %, 1 decimal)`,
      answer: () => A.two[2] * 100, tol: 0.15, explain: () => `P(High ∩ A₁ ∩ A₂) = 0.10 × 0.25² = 0.00625. Divide by P(A₁ ∩ A₂) = ${p4(A.both)}: ${pct(A.two[2])}. One accident moved High from 10% to ${pct(A.post[2], 0)}; two move it to ${pct(A.two[2], 0)}.` },
    { id: 'd9', tier: 'S', type: 'bench', title: 'Stress-test the book mix', bench: 'pmix',
      prompt: () => `Move the sliders to see how the class mix and accident rates drive the indicated surcharge. Try lowering the High share to 5% (Low becomes 65%), then try making all three accident rates equal.`,
      check: st => {
        const moved = Object.entries({ mixM: 30, mixH: 10, pL: 5, pM: 10, pH: 25 }).some(([k, v]) => st[k] != null && num(st[k]) !== v);
        if (!moved) return { ok: false, msg: 'Move at least one slider away from the case values first.' };
        return { ok: true, msg: 'Complete. Notice that the surcharge depends on how different the classes are, not just on the average accident rate.' };
      } },
    { id: 'd10', tier: 'S', type: 'mcq', title: 'What drives the surcharge?', prompt: () => `If Heartland's book shifts to 65% Low, 30% Medium and 5% High (same accident rates), what happens to the indicated surcharge, and why?`,
      options: ['It rises, because fewer high-risk drivers means each accident is more surprising.', `It falls (to about ${spct(LOW_HIGH.surcharge, 0)}), because the book is less mixed: an accident shifts the odds toward a High class that is now rarer, so it carries less information about next year.`, 'It stays the same, because the accident rates by class didn\'t change.', 'It falls to zero, because the High class is now too small to matter.'],
      correct: 1, explain: `With 5% High, P(A₂ | A₁) = ${p4(LOW_HIGH.a2GivenA1)} and P(A₂ | no A₁) = ${p4(LOW_HIGH.a2GivenClean)}, so the indicated surcharge is ${pct(LOW_HIGH.surcharge)}. If every class had the same accident rate, an accident would carry no information and the indicated surcharge would be 0%.` },
    { id: 'd11', tier: 'F', type: 'pick', title: 'Lock your recommended surcharge', prompt: () => `Enter the accident surcharge (%) you recommend Heartland file, then lock it. Enter 0 if you recommend no surcharge. Locking unlocks the Debrief, which simulates what your choice does to the book.`, key: 'pick' },
  ],
  pickShow: st => (num(st.pick) >= 0 ? '+' : '') + st.pick + '% accident surcharge',
  pickHint: '%, e.g. 40',
  pickOk: st => isFinite(num(st.pick)) && num(st.pick) >= 0 && num(st.pick) <= 300,

  stages: [['Total probability', ['d1', 'd2']], ['Bayes', ['d3', 'd4']], ['Next year', ['d5', 'd6']], ['Price it', ['d7']], ['Go further', ['d8', 'd9', 'd10'], true], ['Decide', ['d11']]],

  hints: {
    d1: ['Split the drivers by class. What fraction of each class crashes?', 'Multiply each class share by its accident probability, then add the three products.'],
    d2: ['A joint probability is the product of the probabilities along the path: first the class, then the accident.', 'Low: 0.60 × 0.05. Do the same for Medium and High.',
      () => `Joint probabilities: Low ${p4(A.joint[0])}, Medium ${p4(A.joint[1])}, High ${p4(A.joint[2])}.<br>${setBtn({ jL: p4(A.joint[0]), jM: p4(A.joint[1]), jH: p4(A.joint[2]) })}`],
    d3: ['Bayes: the branch you care about divided by the total of all accident branches.', () => `High branch = 0.10 × 0.25 = 0.025. Total of accident branches = ${p4(A.pA)}.`],
    d4: ['Think in counts: out of 10,000 drivers, how many High-risk drivers crash? How many Low and Medium?'],
    d5: ['Find P(accidents in both years) first. Within a class, P(A₁ ∩ A₂) = p², because years are independent given the class.', () => `P(A₁ ∩ A₂) = 0.60 × 0.0025 + 0.30 × 0.01 + 0.10 × 0.0625 = ${p4(A.both)}. Now divide by P(A₁).`],
    d6: ['Compare P(A₂ | A₁) from the previous task with P(A₂), which equals P(A₁) by symmetry.'],
    d7: ['Surcharge = (risk of a driver with an accident) ÷ (risk of a driver without one) − 1.', () => `${p4(A.a2GivenA1)} ÷ ${p4(A.a2GivenClean)} − 1.`],
    d8: ['Same Bayes pattern, but the evidence is now "accidents in both years". The likelihood for each class is p².', () => `High: 0.10 × 0.25² = 0.00625. Total over classes: ${p4(A.both)}.`],
    d9: ['The bench needs you to change at least one slider. Watch the "after an accident" bars move as you go.'],
    d10: ['Use the bench: set the High share to 5% and read the indicated surcharge.'],
  },

  model: () => `<h3>Model solution</h3><div class="prose">
    <p><b>Total probability.</b> P(A) = 0.030 + 0.030 + 0.025 = ${p4(A.pA)}. <b>Bayes.</b> After an accident the class mix moves from 60/30/10 to ${A.post.map(x => pct(x, 0)).join(' / ')}. High-risk drivers are still a minority of drivers with an accident. That's the base-rate effect.</p>
    <p><b>Next year.</b> Years are independent within a class but not overall: P(A₂ | A₁) = ${p4(A.a2GivenA1)} against P(A₂ | no A₁) = ${p4(A.a2GivenClean)}. The indicated surcharge is <b>${spct(A.surcharge)}</b>, so ${money(A.ppAcc)} against ${money(A.ppClean)} of expected loss.</p>
    <p><b>Recommendation.</b> Both camps are half right. One accident <i>is</i> informative (the "bad luck" camp is wrong that it means nothing), but it is nowhere near proof of a bad driver (doubling the rate, +100%, overcharges by almost half). A strong answer files a surcharge close to the indication, roughly +40% to +56%. It considers a smaller first-accident surcharge with a larger one for repeat accidents (two accidents raise P(High) to ${pct(A.two[2], 0)}), and notes regulatory limits and accident-forgiveness competition.</p></div>`,

  debrief(st) {
    const s = num(st.pick) / 100;
    const mine = priceWith(s), fair = priceWith(A.surcharge), dbl = priceWith(1), none = priceWith(0);
    const gap = s - A.surcharge;
    const verdict = Math.abs(gap) < 0.08 ? 'Your surcharge is close to the indication, so neither group meaningfully subsidizes the other.'
      : gap < 0 ? `Your surcharge is below the indication, so for every 10,000 drivers, the claim-free group pays about ${money(Math.abs(mine.subsidy) * 1e4)} a year more than its expected losses. That money subsidizes drivers with accidents.`
        : `Your surcharge is above the indication, so drivers with an accident pay more than their expected losses. A competitor could win them with a smaller surcharge.`;
    const rows = [['None (0%)', none, 0], ['Your choice (' + spct(s, 0) + ')', mine, s], ['Indicated (' + spct(A.surcharge, 0) + ')', fair, A.surcharge], ['Double (+100%)', dbl, 1]];
    return `<div class="stack-lg">
      <div class="kpis">
        <div class="kpi hero"><div class="l">Indicated surcharge</div><div class="v" data-count="${(A.surcharge * 100).toFixed(1)}" data-dec="1" data-prefix="+" data-suffix="%">${spct(A.surcharge)}</div></div>
        <div class="kpi"><div class="l">Your surcharge</div><div class="v">${spct(s, 0)}</div></div>
        <div class="kpi"><div class="l">Loss ratio, drivers with an accident</div><div class="v" style="color:${Math.abs(mine.lrAcc - 1) < 0.05 ? 'var(--good)' : 'var(--bad)'}">${pct(mine.lrAcc, 0)}</div></div>
        <div class="kpi"><div class="l">Loss ratio, claim-free drivers</div><div class="v" style="color:${Math.abs(mine.lrClean - 1) < 0.05 ? 'var(--good)' : 'var(--bad)'}">${pct(mine.lrClean, 0)}</div></div>
      </div>
      <div class="callout"><b>If you had priced this way…</b> Premiums are set so total premium equals total expected loss. A loss ratio of 100% means a group pays exactly its expected losses; above 100% it's being subsidized, below 100% it's overpaying. ${verdict}</div>
      <div class="card"><h3 style="margin-bottom:8px">Year-2 loss ratio by group under different surcharges</h3>${barChart(rows.flatMap(([l, r]) => [
        { l: l + ': accident', v: r.lrAcc, c: 'var(--chart-3)', strong: l.startsWith('Your') },
        { l: l + ': claim-free', v: r.lrClean, c: 'var(--chart-1)', strong: l.startsWith('Your') }]), { fmt: v => pct(v, 0), aria: 'Loss ratio by group and surcharge', labelW: 250 })}</div>
      <div class="tblwrap"><table><thead><tr><th>Surcharge</th><th>Claim-free premium</th><th>Premium after an accident</th><th>Expected loss, claim-free</th><th>Expected loss, after an accident</th></tr></thead><tbody>
        ${rows.map(([l, r]) => `<tr><td>${l}</td><td class="num">${money(r.premClean)}</td><td class="num">${money(r.premAcc)}</td><td class="num">${money(A.ppClean)}</td><td class="num">${money(A.ppAcc)}</td></tr>`).join('')}</tbody></table></div>
      <div class="grid-2">
        <div class="card"><h3 style="margin-bottom:6px">Who are the drivers with an accident?</h3><p class="small muted" style="margin:0 0 6px">Simulated 10,000 drivers: year-1 accidents by true class</p>${columnChart(SIM.byClass.map((b, i) => ({ l: CLASSES[i], v: b.a1, c: ['var(--chart-4)', 'var(--chart-2)', 'var(--chart-3)'][i] })), { yfmt: v => fmt(v), aria: 'Year-1 accidents by class', h: 200 })}<p class="cap">${SIM.byClass.map((b, i) => `${CLASSES[i]}: ${fmt(b.a1)}`).join(' · ')}. Most drivers with an accident are not High risk.</p></div>
        <div class="card"><h3 style="margin-bottom:6px">The judgment calls</h3><div class="prose small"><ul><li><b>Fairness:</b> about ${pct(A.post[0] + A.post[1], 0)} of surcharged drivers are Low or Medium risk. A surcharge prices the group, not the individual.</li><li><b>Credibility:</b> one accident is weak evidence; two are much stronger (P(High) ${pct(A.two[2], 0)}). Tiered surcharges reflect that.</li><li><b>Competition and regulation:</b> accident forgiveness is a selling point, and many states cap or restrict surcharges.</li></ul></div></div>
      </div>
      <div class="card">${this.model()}</div></div>`;
  },

  modelSummary: `**Recommendation:** File a +50% surcharge for one at-fault accident in the prior year, close to the actuarial indication of +56%, and ask the team to study a higher second tier for drivers with two accidents in three years.

**What one accident tells us:** Using Heartland's class mix (60% Low, 30% Medium, 10% High) and annual accident rates (5%, 10%, 25%), 8.5% of drivers have an accident in a year. Among them, 29% are High risk, up from 10% of all drivers. Most drivers with an accident are still Low or Medium risk, so doubling their rate would overcharge most of them.

**Why a surcharge is still justified:** Accidents are independent year to year within a class, but not across the book. A driver with an accident this year has a 12.6% chance of another next year, against 8.1% for a claim-free driver. Their expected loss is $1,138 against $730, so the indicated surcharge is +56%. With no surcharge, claim-free drivers subsidize the rest, and competitors could win the claim-free drivers away.

**Why +50% rather than +56%:** it leaves room for accident forgiveness on minor claims and regulatory review while keeping the subsidy small.

**Risks:** The class model is a simplification. If accident rates within a class change over time, or classes differ in claim size, the indication moves. A two-accident tier would rest on fewer drivers and needs credibility weighting.`,

  judgeBank: [
    ['Why not double the rate after an accident, like the committee member suggested?', 'Explains the base-rate effect with numbers: most drivers with an accident are still Low or Medium risk (about 71%). The indicated surcharge is about +56%; doubling overcharges the group by roughly a third.'],
    ['If accidents are independent from year to year, how can last year predict next year?', 'Independence holds within a class (conditional independence). Across a mixed book, an accident is evidence about the hidden class, so it raises next year\'s probability. Gives P(A₂ | A₁) vs P(A₂).'],
    ['Isn\'t it unfair to surcharge a careful driver who had one unlucky accident?', 'Acknowledges it: a surcharge prices the group, not the individual. Weighs fairness against cross-subsidy and adverse selection, and offers tools like accident forgiveness or tiered surcharges.'],
    ['What happens if Heartland files no surcharge but competitors do?', 'Claim-free drivers overpay at Heartland and leave for competitors, while drivers with accidents stay. The book becomes riskier and rates must rise: adverse selection.'],
    ['How would your answer change if the book had fewer high-risk drivers?', 'The indicated surcharge falls, because the classes are less mixed and an accident carries less information. Quotes the 5% High scenario (about +42%).'],
    ['What evidence would you want before filing?', 'Actual claim-history data: the year-2 accident rate for drivers with and without a year-1 accident, with enough volume to be credible. It should also check whether claim size differs by class and whether accident rates drift over time.'],
    ['How would you explain Bayes\' theorem to the product committee in one sentence?', 'Uses natural frequencies: "Of 850 drivers who crash, 250 are high risk, so an accident makes high risk about three times as likely as before, but still not likely."'],
    ['Would a second-accident tier make sense?', 'Yes. Two accidents raise P(High) to about 58%, so the evidence is much stronger. It needs credibility weighting because few drivers have two accidents.'],
  ],

  context(st) {
    return `CASE: Heartland Auto (fictional, illustrative). Three hidden risk classes: Low 60%, Medium 30%, High 10% of drivers; annual at-fault accident probability 5%, 10%, 25%; average claim $9,000; at most one accident a year, independent across years given the class. Committee is debating an accident surcharge. Correct analysis: P(A)=0.085; P(High|A)=29.4%; P(A2|A1)=0.1265; P(A2|no A1)=0.0811; indicated surcharge +55.9%.
STUDENT WORK: P(A) answer ${st.ans?.d1 || '?'}; tree branches ${st.jL || '?'}, ${st.jM || '?'}, ${st.jH || '?'}; P(High|A) ${st.ans?.d3 || '?'}%; P(A2|A1) ${st.ans?.d5 || '?'}; indicated surcharge ${st.ans?.d7 || '?'}%; recommended surcharge ${st.pick ? st.pick + '%' : 'not yet selected'}.`;
  },

  workbook: {
    inputs: ['D5:F7'],
    cols: { A: 250, B: 120, C: 100, D: 200, E: 220, F: 180 },
    formats: { 'E5:E8': 'pct1', 'B10:B12': 'pct2', 'B13:B15': 'money0' },
    checks: [
      { cell: 'D5', label: 'Low: P(class and accident)', answer: 0.03, tol: 5e-6 }, { cell: 'D6', label: 'Medium', answer: 0.03, tol: 5e-6 }, { cell: 'D7', label: 'High', answer: 0.025, tol: 5e-6 },
      { cell: 'E5', label: 'Low: posterior', answer: 0.03 / 0.085, tol: 5e-5 }, { cell: 'E6', label: 'Medium', answer: 0.03 / 0.085, tol: 5e-5 }, { cell: 'E7', label: 'High', answer: 0.025 / 0.085, tol: 5e-5 },
      { cell: 'F5', label: 'Low: P(two accidents)', answer: 0.0015, tol: 5e-7 }, { cell: 'F6', label: 'Medium', answer: 0.003, tol: 5e-7 }, { cell: 'F7', label: 'High', answer: 0.00625, tol: 5e-7 },
      { cell: 'B12', label: 'Indicated surcharge', answer: (0.01075 / 0.085) / ((0.085 - 0.01075) / 0.915) - 1, tol: 5e-4 },
    ],
  },
  csv() {
    return [
      ['OpenActuary | Who\'s a Risky Driver? (Heartland Auto) | illustrative data'],
      ['HOW TO USE: cells marked YOUR FORMULA are blank. Fill them in and compare with the app.'],
      [],
      ['Class', 'Share of drivers', 'P(accident)', 'Joint P(class & accident) (YOUR FORMULA = B*C)', 'Posterior P(class | accident) (YOUR FORMULA = D / D8)', 'P(two accidents) (YOUR FORMULA = B*C^2)'],
      ['Low', 0.6, 0.05, '', '', ''],
      ['Medium', 0.3, 0.10, '', '', ''],
      ['High', 0.1, 0.25, '', '', ''],
      ['Total', '=SUM(B5:B7)', '', '=SUM(D5:D7)', '=SUM(E5:E7)', '=SUM(F5:F7)'],
      [],
      ['P(A2 | A1) = F8 / D8', '=IFERROR(F8/D8,"")'],
      ['P(A2 | no A1) = (D8 - F8) / (1 - D8)', '=IFERROR((D8-F8)/(1-D8),"")'],
      ['Indicated surcharge', '=IFERROR(B10/B11-1,"")'],
      ['Average claim cost', 9000],
      ['Pure premium after an accident', '=IFERROR(B10*B13,"")'],
      ['Pure premium, claim-free', '=IFERROR(B11*B13,"")'],
    ];
  },
};
