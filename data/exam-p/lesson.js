// Exam P · General Probability lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers verified in Python (see report).
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
const t = String.raw;

export const LESSON = {
  id: 'general-probability',
  title: 'General Probability',
  steps: [
    {
      id: 'sample-spaces', title: 'Sample spaces and events', short: 'Sample spaces', topic: 'sets', minutes: 6,
      body: t`
<p>Every probability question starts with an <b>experiment</b>: something whose result is uncertain. Rolling a die, watching a car insurance policy for a year, or pulling a claim file from a drawer are all experiments.</p>
<p>The <b>sample space</b> <span class="tex">S</span> is the set of every possible outcome. An <b>event</b> is any collection of outcomes we care about, written with capital letters like <span class="tex">A</span> or <span class="tex">B</span>. For one policy over one year, the number of claims has sample space <span class="tex">S=\{0,1,2,\dots\}</span>, and the event "at least one claim" is <span class="tex">A=\{1,2,3,\dots\}</span>.</p>
<p>Probabilities follow three rules (the axioms):</p>
<ul>
  <li><span class="tex">0 \le P(A) \le 1</span> for every event.</li>
  <li><span class="tex">P(S)=1</span>: something in the sample space always happens.</li>
  <li>If <span class="tex">A</span> and <span class="tex">B</span> are mutually exclusive (they cannot both happen), then <span class="tex">P(A \cup B)=P(A)+P(B)</span>.</li>
</ul>
<p>Two consequences you will use constantly. When all outcomes are equally likely, probability is counting:</p>
<div class="texd">P(A)=\frac{\text{number of outcomes in }A}{\text{number of outcomes in }S}</div>
<p>And the complement rule: the probability that <span class="tex">A</span> does <i>not</i> happen is</p>
<div class="texd">P(A^{c}) = 1 - P(A).</div>
<p>The complement is often the shortest path. "At least one claim" is hard to add up directly but easy as <span class="tex">1-P(\text{no claims})</span>.</p>`,
      example: {
        title: 'Worked example: claim counts',
        html: t`<p>An auto policy has 0, 1, 2 or 3+ claims in a year with probabilities 0.72, 0.19, 0.06 and 0.03.</p>
<p>The probability of at least one claim is <span class="tex">1 - P(0) = 1 - 0.72 = 0.28</span>. Check: <span class="tex">0.19+0.06+0.03 = 0.28</span>. Same answer, one subtraction instead of three additions.</p>`,
      },
      checks: [
        { q: t`Two fair dice are rolled. What is the probability that the sum is 7?`,
          opts: [t`<span class="tex">1/12</span>`, t`<span class="tex">1/6</span>`, t`<span class="tex">7/36</span>`, t`<span class="tex">1/3</span>`], correct: 1,
          explain: t`There are <span class="tex">6 \times 6 = 36</span> equally likely outcomes. Six give a sum of 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). So the probability is <span class="tex">6/36 = 1/6</span>.` },
        { q: t`A policy has 0, 1, 2 or 3+ claims with probabilities 0.70, 0.20, 0.07 and 0.03. What is the probability of at most one claim?`,
          opts: ['0.20', '0.30', '0.70', '0.90'], correct: 3,
          explain: t`"At most one" means 0 or 1 claims: <span class="tex">0.70 + 0.20 = 0.90</span>. Equivalently <span class="tex">1 - (0.07 + 0.03) = 0.90</span>.` },
      ],
    },
    {
      id: 'sets', title: 'Set operations and inclusion–exclusion', short: 'Sets & inclusion–exclusion', topic: 'sets', minutes: 9, widget: 'venn',
      body: t`
<p>Events are sets, so we combine them with set operations:</p>
<ul>
  <li><b>Union</b> <span class="tex">A \cup B</span>: A or B (or both) happens.</li>
  <li><b>Intersection</b> <span class="tex">A \cap B</span>: A and B both happen.</li>
  <li><b>Complement</b> <span class="tex">A^{c}</span>: A does not happen.</li>
</ul>
<p>De Morgan's laws swap unions and intersections when you take complements. "Not (A or B)" is the same as "not A and not B":</p>
<div class="texd">(A \cup B)^{c} = A^{c} \cap B^{c}, \qquad (A \cap B)^{c} = A^{c} \cup B^{c}</div>
<p>To find the probability of a union, add the two events and subtract the overlap, because the overlap was counted twice. This is inclusion-exclusion:</p>
<div class="texd">P(A \cup B) = P(A) + P(B) - P(A \cap B)</div>
<p>With three events, add the singles, subtract the pairs, then add back the triple overlap (it was added three times and subtracted three times):</p>
<div class="texd">P(A\cup B\cup C)=P(A)+P(B)+P(C)-P(A\cap B)-P(A\cap C)-P(B\cap C)+P(A\cap B\cap C)</div>
<p>Two more pieces fall out of the picture: the part of A outside B is <span class="tex">P(A \cap B^{c}) = P(A) - P(A\cap B)</span>, and "exactly one of A, B" is <span class="tex">P(A)+P(B)-2P(A\cap B)</span>. Drag the sliders below to see every region at once.</p>`,
      example: {
        title: 'Worked example: bundled policies',
        html: t`<p>Of an insurer's customers, 60% have auto coverage, 35% have homeowners coverage and 20% have both.</p>
<p>At least one: <span class="tex">0.60 + 0.35 - 0.20 = 0.75</span>. Neither: <span class="tex">1 - 0.75 = 0.25</span>. Exactly one: <span class="tex">0.60 + 0.35 - 2(0.20) = 0.55</span> (auto only is 0.40, home only is 0.15).</p>`,
      },
      checks: [
        { q: t`<span class="tex">P(A)=0.45</span>, <span class="tex">P(B)=0.35</span> and <span class="tex">P(A\cup B)=0.60</span>. Find <span class="tex">P(A \cap B)</span>.`,
          opts: ['0.15', '0.20', '0.25', '0.80'], correct: 1,
          explain: t`Rearrange inclusion-exclusion: <span class="tex">P(A\cap B) = P(A)+P(B)-P(A\cup B) = 0.45+0.35-0.60 = 0.20</span>.` },
        { q: t`Same events. What is the probability that neither A nor B happens?`,
          opts: ['0.20', '0.40', '0.60', '0.80'], correct: 1,
          explain: t`By De Morgan, <span class="tex">P(A^{c}\cap B^{c}) = 1 - P(A\cup B) = 1 - 0.60 = 0.40</span>.` },
      ],
    },
    {
      id: 'counting', title: 'Counting: permutations and combinations', short: 'Counting', topic: 'counting', minutes: 9,
      body: t`
<p>When outcomes are equally likely, probability becomes "favorable outcomes over total outcomes", so we need fast ways to count.</p>
<p><b>Multiplication principle.</b> If one choice can be made in <span class="tex">m</span> ways and a second in <span class="tex">n</span> ways, together they can be made in <span class="tex">m \times n</span> ways. Arranging <span class="tex">n</span> distinct items in a row: <span class="tex">n! = n(n-1)\cdots 2 \cdot 1</span> ways.</p>
<p><b>Permutations</b> count ordered selections. The number of ways to choose and arrange <span class="tex">k</span> of <span class="tex">n</span> distinct items is</p>
<div class="texd">P(n,k) = \frac{n!}{(n-k)!}</div>
<p><b>Combinations</b> count unordered selections. Each group of <span class="tex">k</span> can be ordered <span class="tex">k!</span> ways, so</p>
<div class="texd">\binom{n}{k} = \frac{n!}{k!\,(n-k)!}</div>
<p>Ask one question every time: <b>does order matter?</b> Assigning claims to specific adjusters: yes (permutation). Picking a sample of files to audit: no (combination).</p>
<p>A common Exam P pattern is choosing from two groups without replacement. If a box has <span class="tex">K</span> "special" items out of <span class="tex">N</span> and you pick <span class="tex">n</span>, then</p>
<div class="texd">P(\text{exactly } k \text{ special}) = \frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}</div>`,
      example: {
        title: 'Worked example: auditing claim files',
        html: t`<p>An auditor picks 3 of 10 claim files at random. Four of the 10 are flagged for review. What is the probability that exactly one flagged file is picked?</p>
<p>Total samples: <span class="tex">\binom{10}{3} = 120</span>. Favorable: choose 1 of the 4 flagged and 2 of the 6 others, <span class="tex">\binom{4}{1}\binom{6}{2} = 4 \times 15 = 60</span>. Probability <span class="tex">60/120 = 0.5</span>.</p>`,
      },
      checks: [
        { q: t`How many ways can an underwriter choose 2 of 8 applications to fast-track (order does not matter)?`,
          opts: ['16', '28', '56', '64'], correct: 1,
          explain: t`Order does not matter, so it is a combination: <span class="tex">\binom{8}{2} = \frac{8 \cdot 7}{2} = 28</span>. (56 counts ordered pairs.)` },
        { q: t`In the audit example (3 of 10 files, 4 flagged), what is the probability that none of the picked files is flagged?`,
          opts: [t`<span class="tex">1/6</span>`, t`<span class="tex">1/5</span>`, '0.216', '0.5'], correct: 0,
          explain: t`All 3 must come from the 6 unflagged files: <span class="tex">\binom{6}{3}/\binom{10}{3} = 20/120 = 1/6</span>. (0.216 is <span class="tex">0.6^3</span>, which would be sampling <i>with</i> replacement.)` },
      ],
    },
    {
      id: 'conditional', title: 'Conditional probability', short: 'Conditional', topic: 'conditional', minutes: 8,
      body: t`
<p>Conditional probability answers: <i>given that B happened, how likely is A?</i> Knowing B shrinks the sample space to just B, so we measure how much of B is also A:</p>
<div class="texd">P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \qquad P(B) > 0</div>
<p>Rearranged, this is the multiplication rule, used for events that happen in sequence:</p>
<div class="texd">P(A \cap B) = P(B)\,P(A \mid B) = P(A)\,P(B \mid A)</div>
<p>It chains: <span class="tex">P(A\cap B\cap C) = P(A)\,P(B\mid A)\,P(C \mid A\cap B)</span>.</p>
<p>The most common trap on the exam is mixing up the direction. <span class="tex">P(A\mid B)</span> and <span class="tex">P(B\mid A)</span> share a numerator but have different denominators, and they can be very different numbers.</p>
<p>Conditional probabilities behave like ordinary probabilities on the smaller space, so the complement rule still works: <span class="tex">P(A^{c}\mid B) = 1 - P(A\mid B)</span>.</p>`,
      example: {
        title: 'Worked example: a two-way table',
        html: t`<p>A health insurer tracks 1,000 members for a year.</p>
<div class="tblwrap"><table><thead><tr><th></th><th>Claim</th><th>No claim</th><th>Total</th></tr></thead>
<tbody><tr><td>Smoker</td><td class="num">60</td><td class="num">140</td><td class="num">200</td></tr>
<tr><td>Non-smoker</td><td class="num">80</td><td class="num">720</td><td class="num">800</td></tr>
<tr class="total"><td>Total</td><td class="num">140</td><td class="num">860</td><td class="num">1,000</td></tr></tbody></table></div>
<p><span class="tex">P(\text{claim} \mid \text{smoker}) = 60/200 = 0.30</span>: look only at the smoker row.</p>
<p><span class="tex">P(\text{smoker} \mid \text{claim}) = 60/140 \approx 0.4286</span>: look only at the claim column. Same 60 on top, different denominators.</p>`,
      },
      checks: [
        { q: t`<span class="tex">P(A)=0.5</span>, <span class="tex">P(B)=0.4</span>, <span class="tex">P(A\cap B)=0.1</span>. Find <span class="tex">P(A \mid B)</span>.`,
          opts: ['0.10', '0.20', '0.25', '0.40'], correct: 2,
          explain: t`<span class="tex">P(A\mid B) = 0.1/0.4 = 0.25</span>.` },
        { q: t`Same events. Find <span class="tex">P(B \mid A)</span>.`,
          opts: ['0.10', '0.20', '0.25', '0.50'], correct: 1,
          explain: t`Now divide by <span class="tex">P(A)</span>: <span class="tex">P(B\mid A) = 0.1/0.5 = 0.20</span>. Different from <span class="tex">P(A\mid B)</span>.` },
      ],
    },
    {
      id: 'independence', title: 'Independence', short: 'Independence', topic: 'independence', minutes: 8,
      body: t`
<p>Two events are <b>independent</b> when knowing one happened does not change the probability of the other: <span class="tex">P(A\mid B) = P(A)</span>. Plugging into the definition of conditional probability gives the test you will use on the exam:</p>
<div class="texd">A, B \text{ independent} \iff P(A \cap B) = P(A)\,P(B)</div>
<p>If A and B are independent, so are their complements: <span class="tex">A</span> and <span class="tex">B^{c}</span>, <span class="tex">A^{c}</span> and <span class="tex">B^{c}</span>.</p>
<p><b>Independent is not the same as mutually exclusive.</b> Mutually exclusive events cannot happen together, <span class="tex">P(A\cap B)=0</span>. That is strong dependence: if one happens, the other certainly did not. (The only exception is when one event has probability 0.)</p>
<p>Independence makes "at least one" problems quick. For independent events with probabilities <span class="tex">p_1,\dots,p_n</span>:</p>
<div class="texd">P(\text{at least one}) = 1 - (1-p_1)(1-p_2)\cdots(1-p_n)</div>
<p>For several events, independence means the product rule holds for <i>every</i> sub-collection, not just pairs.</p>`,
      example: {
        title: 'Worked example: three warehouses',
        html: t`<p>An insurer covers three warehouses in different cities. Each has a 5% chance of a fire claim this year, independently.</p>
<p><span class="tex">P(\text{at least one claim}) = 1 - 0.95^3 = 1 - 0.857375 = 0.142625</span>.</p>
<p>Adding <span class="tex">0.05 \times 3 = 0.15</span> overcounts the years with two or more fires. Inclusion-exclusion would fix it, but the complement is faster.</p>`,
      },
      checks: [
        { q: t`<span class="tex">P(A)=0.3</span>, <span class="tex">P(B)=0.5</span> and <span class="tex">P(A\cup B)=0.65</span>. Are A and B independent?`,
          opts: [t`Yes: <span class="tex">P(A\cap B)=0.15=P(A)P(B)</span>`, 'No: they overlap, so they are dependent', 'No: they are mutually exclusive', 'Cannot tell without more information'], correct: 0,
          explain: t`<span class="tex">P(A\cap B) = 0.3 + 0.5 - 0.65 = 0.15</span>, and <span class="tex">P(A)P(B) = 0.15</span>. The product rule holds, so they are independent. Overlapping is normal for independent events.` },
        { q: t`Four policies each have a 10% chance of a claim, independently. What is the probability that at least one has a claim?`,
          opts: ['0.0001', '0.3439', '0.4000', '0.6561'], correct: 1,
          explain: t`<span class="tex">1 - 0.9^4 = 1 - 0.6561 = 0.3439</span>. (0.40 double counts; 0.6561 is the probability of no claims.)` },
      ],
    },
    {
      id: 'total-probability', title: 'The law of total probability', short: 'Total probability', topic: 'bayes', minutes: 7,
      body: t`
<p>A <b>partition</b> splits the sample space into pieces <span class="tex">B_1, B_2, \dots, B_n</span> that do not overlap and together cover everything, for example the risk classes of a portfolio. Any event <span class="tex">A</span> can then be cut into those pieces and added back up:</p>
<div class="texd">P(A) = \sum_{i=1}^{n} P(A \mid B_i)\,P(B_i)</div>
<p>In words: the overall rate is a <b>weighted average</b> of the rates within each group, weighted by the size of each group. It is not the simple average of the group rates unless the groups are the same size.</p>
<p>A probability tree makes this visual: the first set of branches is the partition, the second set is <span class="tex">A</span> or not <span class="tex">A</span>. Multiply along each path, then add the paths that end in <span class="tex">A</span>.</p>`,
      example: {
        title: 'Worked example: risk classes',
        html: t`<p>A portfolio is 50% low risk, 30% medium risk and 20% high risk. The chance of a claim this year is 2%, 5% and 12% respectively.</p>
<div class="texd">P(\text{claim}) = 0.50(0.02) + 0.30(0.05) + 0.20(0.12) = 0.010 + 0.015 + 0.024 = 0.049</div>
<p>The simple average of the three rates, 6.33%, would overstate claims because the riskiest class is the smallest.</p>`,
      },
      checks: [
        { q: t`60% of drivers are careful, with a 4% chance of an accident this year. The other 40% are risky, with a 10% chance. What is the probability that a randomly chosen driver has an accident?`,
          opts: ['0.056', '0.064', '0.070', '0.140'], correct: 1,
          explain: t`<span class="tex">0.60(0.04) + 0.40(0.10) = 0.024 + 0.040 = 0.064</span>. (0.070 is the unweighted average.)` },
      ],
    },
    {
      id: 'bayes', title: "Bayes' theorem", short: "Bayes' theorem", topic: 'bayes', minutes: 10, widget: 'bayes',
      body: t`
<p>Bayes' theorem turns a conditional probability around. We often know <span class="tex">P(\text{evidence} \mid \text{cause})</span>, such as how often a fraud screen flags fraudulent claims, but we want <span class="tex">P(\text{cause} \mid \text{evidence})</span>: given a flag, how likely is fraud?</p>
<div class="texd">P(B_j \mid A) = \frac{P(A \mid B_j)\,P(B_j)}{\sum_i P(A \mid B_i)\,P(B_i)}</div>
<p>The numerator is one path through the tree. The denominator is the law of total probability: every path that ends in <span class="tex">A</span>. For two causes it reads</p>
<div class="texd">P(B \mid A) = \frac{P(A\mid B)P(B)}{P(A\mid B)P(B) + P(A\mid B^{c})P(B^{c})}</div>
<p><span class="tex">P(B)</span> is the prior (what we believed before the evidence), and <span class="tex">P(B\mid A)</span> is the posterior (what we believe after). When the base rate is small, even an accurate test produces mostly false positives, because the large group without the condition throws off many false alarms. Try it: set the prior to 1% and watch the posterior.</p>
<p>A reliable way to get Bayes questions right is <b>natural frequencies</b>: imagine 10,000 people, split them down the tree into whole numbers, and read the answer as a ratio of counts.</p>`,
      example: {
        title: 'Worked example: which class filed the claim?',
        html: t`<p>Using the portfolio from the previous step (50% low at 2%, 30% medium at 5%, 20% high at 12%), a policyholder files a claim. How likely is it that they are high risk?</p>
<div class="texd">P(\text{high} \mid \text{claim}) = \frac{0.20(0.12)}{0.049} = \frac{0.024}{0.049} \approx 0.4898</div>
<p>High-risk drivers are only 20% of the portfolio but almost half of the claimants. The claim is evidence, and it moves the prior of 0.20 to a posterior of about 0.49.</p>`,
      },
      checks: [
        { q: t`From the last step: 60% careful drivers (4% accident rate), 40% risky (10%). A driver has an accident. What is the probability the driver is risky?`,
          opts: ['0.100', '0.400', '0.625', '0.714'], correct: 2,
          explain: t`<span class="tex">P(\text{risky}\mid \text{acc}) = \frac{0.40(0.10)}{0.064} = \frac{0.040}{0.064} = 0.625</span>.` },
        { q: t`2% of claims are fraudulent. A screen flags 90% of fraudulent claims and 5% of legitimate ones. Given a flag, what is the probability the claim is fraudulent?`,
          opts: ['0.018', '0.067', '0.269', '0.900'], correct: 2,
          explain: t`<span class="tex">P(\text{flag}) = 0.02(0.90) + 0.98(0.05) = 0.018 + 0.049 = 0.067</span>. Then <span class="tex">P(\text{fraud}\mid\text{flag}) = 0.018/0.067 \approx 0.269</span>. Most flags are false alarms because fraud is rare.` },
      ],
    },
    {
      id: 'insurance', title: 'The insurance lens', short: 'Insurance lens', topic: 'independence', minutes: 6,
      body: t`
<p>Everything in this lesson is daily work for actuaries. Here is where each idea shows up:</p>
<ul>
  <li><b>Pricing with total probability.</b> A portfolio's expected claim rate is the weighted average of the rates in each rating class. Change the mix of business and the overall rate moves, even if no class gets riskier.</li>
  <li><b>Underwriting with Bayes.</b> Each piece of evidence, such as a prior claim, a telematics score or a medical exam result, updates the probability that an applicant belongs to a riskier class. Experience rating is Bayes' theorem applied year after year.</li>
  <li><b>Diversification with independence.</b> When many policies are independent, the total number of claims becomes predictable, which is why insurance works at all.</li>
  <li><b>Correlation as the big risk.</b> A hurricane, a pandemic or a market crash hits many policies at once. Then <span class="tex">P(A\cap B)</span> is far above <span class="tex">P(A)P(B)</span>, the independence formulas understate the chance of many claims together, and reinsurance and capital exist to cover exactly that.</li>
  <li><b>Counting for audits and sampling.</b> Claim audits, reserve reviews and fraud investigations sample files without replacement, which is combinations at work.</li>
</ul>
<p><b>Exam P habits that pay off:</b> name each event in words before writing symbols; draw a Venn diagram, table or tree; reach for the complement when you see "at least one"; and always ask whether a probability is joint, marginal or conditional, and conditional on what.</p>`,
      example: {
        title: 'Worked example: correlation changes the answer',
        html: t`<p>Two homes on the same street each have a 2% chance of a wind claim. If independent, both claim with probability <span class="tex">0.02^2 = 0.0004</span>. Suppose instead that a storm (5% chance) causes a claim at each home with probability 0.3, and without a storm each home claims with probability <span class="tex">\approx 0.005263</span> (chosen so each home's overall chance is still 2%). Then</p>
<div class="texd">P(\text{both}) \approx 0.05(0.3^2) + 0.95(0.005263^2) \approx 0.0045 + 0.0000263 \approx 0.00453</div>
<p>That is more than 11 times the independent answer, with the same 2% chance for each home.</p>`,
      },
      checks: [
        { q: t`An insurer covers 500 homes in one coastal town, each with a 1% chance of a claim. Why is <span class="tex">1 - 0.99^{500}</span> a poor estimate of the chance that many homes claim in the same year?`,
          opts: ['A single storm makes the claims dependent, so the product rule fails', 'The probability 1% is too small to use', 'Inclusion-exclusion only works for two events', 'With 500 homes you must use permutations'], correct: 0,
          explain: 'The formula assumes independence. A hurricane affects many homes at once, so claims are positively correlated and large losses are far more likely than the independent model suggests.' },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
export const stepIndex = id => STEPS.findIndex(s => s.id === id);
