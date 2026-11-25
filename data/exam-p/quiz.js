// Exam P · General Probability practice quiz: 20 original multiple-choice questions (A–E).
// Each: { id, topic (sets|counting|conditional|independence|bayes), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python before publishing.
const t = String.raw;

export const QUESTIONS = [
  /* ---------- sets ---------- */
  {
    id: 'p-sets-1', topic: 'sets', diff: 1,
    q: t`Of an insurer's policyholders, 62% have an auto policy, 48% have a homeowners policy, and 25% have both. What is the probability that a randomly chosen policyholder has exactly one of the two policies?`,
    choices: ['0.15', '0.35', '0.60', '0.75', '0.85'], answer: 2,
    sol: t`<p>Auto only: <span class="tex">0.62 - 0.25 = 0.37</span>. Home only: <span class="tex">0.48 - 0.25 = 0.23</span>.</p>
<p>Exactly one: <span class="tex">0.37 + 0.23 = 0.60</span>, or in one line <span class="tex">P(A)+P(H)-2P(A\cap H) = 0.62+0.48-0.50 = 0.60</span>.</p>
<p>0.85 is the probability of at least one, and 0.15 the probability of neither.</p>`,
  },
  {
    id: 'p-sets-2', topic: 'sets', diff: 2,
    q: t`An employer offers dental (D), vision (V) and life (L) coverage. Among employees, 55% elect D, 40% elect V and 30% elect L; 20% elect both D and V, 15% both D and L, 10% both V and L, and 5% elect all three. What is the probability that a randomly chosen employee elects none of the three?`,
    choices: ['0.05', '0.10', '0.15', '0.20', '0.25'], answer: 2,
    sol: t`<p>By inclusion-exclusion,</p>
<div class="texd">P(D\cup V\cup L) = 0.55+0.40+0.30-0.20-0.15-0.10+0.05 = 0.85</div>
<p>So <span class="tex">P(\text{none}) = 1 - 0.85 = 0.15</span>. Forgetting to add back the triple overlap gives 0.20.</p>`,
  },
  {
    id: 'p-sets-3', topic: 'sets', diff: 2,
    q: t`For events A and B, <span class="tex">P(A)=0.40</span>, <span class="tex">P(B)=0.50</span> and <span class="tex">P(A^{c}\cup B^{c}) = 0.86</span>. Calculate <span class="tex">P(A^{c}\cap B^{c})</span>.`,
    choices: ['0.10', '0.14', '0.24', '0.36', '0.76'], answer: 2,
    sol: t`<p>By De Morgan, <span class="tex">A^{c}\cup B^{c} = (A\cap B)^{c}</span>, so <span class="tex">P(A\cap B) = 1 - 0.86 = 0.14</span>.</p>
<p>Then <span class="tex">P(A\cup B) = 0.40 + 0.50 - 0.14 = 0.76</span>, and <span class="tex">P(A^{c}\cap B^{c}) = 1 - P(A\cup B) = 0.24</span>.</p>`,
  },
  {
    id: 'p-sets-4', topic: 'sets', diff: 1,
    q: t`A survey of 1,000 drivers finds that 300 had an at-fault accident in the last three years, 220 received a speeding ticket, and 120 had both. What is the probability that a randomly chosen driver received a ticket but had no at-fault accident?`,
    choices: ['0.10', '0.12', '0.22', '0.34', '0.40'], answer: 0,
    sol: t`<p>Ticket and no accident: <span class="tex">P(T) - P(T\cap A) = 0.22 - 0.12 = 0.10</span>.</p>
<p>0.40 is the probability of a ticket or an accident: <span class="tex">0.30 + 0.22 - 0.12</span>.</p>`,
  },

  /* ---------- counting ---------- */
  {
    id: 'p-count-1', topic: 'counting', diff: 1,
    q: t`A claims adjuster has 9 open files and must choose 4 of them to review today. The order of review does not matter. How many different selections are possible?`,
    choices: ['36', '84', '126', '252', '3,024'], answer: 2,
    sol: t`<p>Order does not matter, so count combinations: <span class="tex">\binom{9}{4} = \frac{9\cdot 8\cdot 7\cdot 6}{4!} = \frac{3024}{24} = 126</span>.</p>
<p>3,024 is <span class="tex">P(9,4)</span>, which counts ordered selections.</p>`,
  },
  {
    id: 'p-count-2', topic: 'counting', diff: 2,
    q: t`A pricing committee of 4 people is chosen at random from 6 actuaries and 5 underwriters. What is the probability that the committee has exactly 2 actuaries?`,
    choices: ['0.152', '0.303', '0.455', '0.500', '0.545'], answer: 2,
    sol: t`<p>Total committees: <span class="tex">\binom{11}{4} = 330</span>.</p>
<p>Exactly 2 actuaries and 2 underwriters: <span class="tex">\binom{6}{2}\binom{5}{2} = 15 \times 10 = 150</span>.</p>
<p>Probability <span class="tex">150/330 \approx 0.455</span>.</p>`,
  },
  {
    id: 'p-count-3', topic: 'counting', diff: 2,
    q: t`A batch of 12 claim files contains 3 with coding errors. An auditor selects 4 files at random without replacement. What is the probability that at least one selected file has an error?`,
    choices: ['0.255', '0.509', '0.684', '0.745', '0.873'], answer: 3,
    sol: t`<p>Use the complement: no errors means all 4 files come from the 9 clean ones.</p>
<div class="texd">P(\text{none}) = \frac{\binom{9}{4}}{\binom{12}{4}} = \frac{126}{495} \approx 0.2545</div>
<p><span class="tex">P(\text{at least one}) = 1 - 126/495 = 369/495 \approx 0.745</span>.</p>
<p>0.684 is <span class="tex">1-0.75^4</span>, the answer if files were replaced after each pick; 0.509 is the probability of exactly one error.</p>`,
  },
  {
    id: 'p-count-4', topic: 'counting', diff: 3,
    q: t`Seven insurance applications are processed in a random order. Three of them came from the same agent. What is the probability that the agent's three applications are processed consecutively?`,
    choices: ['0.029', '0.048', '0.143', '0.200', '0.429'], answer: 2,
    sol: t`<p>Total orders: <span class="tex">7! = 5040</span>.</p>
<p>Glue the three applications into one block. Arrange the block plus the 4 others: <span class="tex">5! = 120</span> ways, and order the three inside the block: <span class="tex">3! = 6</span> ways.</p>
<p>Probability <span class="tex">\frac{5!\,3!}{7!} = \frac{720}{5040} = \frac{1}{7} \approx 0.143</span>.</p>`,
  },

  /* ---------- conditional ---------- */
  {
    id: 'p-cond-1', topic: 'conditional', diff: 1,
    q: t`30% of an insurer's auto policyholders are under 25. 18% of all policyholders are under 25 <i>and</i> filed a claim last year. What is the probability that a policyholder under 25 filed a claim?`,
    choices: ['0.18', '0.30', '0.48', '0.54', '0.60'], answer: 4,
    sol: t`<p><span class="tex">P(\text{claim}\mid \text{under 25}) = \frac{P(\text{claim}\cap\text{under 25})}{P(\text{under 25})} = \frac{0.18}{0.30} = 0.60</span>.</p>
<p>0.18 is the joint probability, not the conditional one.</p>`,
  },
  {
    id: 'p-cond-2', topic: 'conditional', diff: 2,
    q: t`A health plan has 2,000 members: 400 smokers and 1,600 non-smokers. Last year 120 smokers and 160 non-smokers were hospitalized. A member is chosen at random from those who were hospitalized. What is the probability that the member is a smoker?`,
    choices: ['0.06', '0.14', '0.20', '0.30', '0.43'], answer: 4,
    sol: t`<p>Condition on hospitalization: there were <span class="tex">120 + 160 = 280</span> hospitalized members, of whom 120 smoke.</p>
<p><span class="tex">P(\text{smoker}\mid\text{hospitalized}) = 120/280 \approx 0.43</span>.</p>
<p>0.30 is the reverse, <span class="tex">P(\text{hospitalized}\mid\text{smoker}) = 120/400</span>.</p>`,
  },
  {
    id: 'p-cond-3', topic: 'conditional', diff: 2,
    q: t`<span class="tex">P(A) = 0.45</span>, <span class="tex">P(B) = 0.60</span> and <span class="tex">P(A\cup B) = 0.75</span>. Calculate <span class="tex">P(A \mid B^{c})</span>.`,
    choices: ['0.150', '0.250', '0.375', '0.500', '0.625'], answer: 2,
    sol: t`<p><span class="tex">P(A\cap B) = 0.45 + 0.60 - 0.75 = 0.30</span>, so <span class="tex">P(A\cap B^{c}) = 0.45 - 0.30 = 0.15</span>.</p>
<p><span class="tex">P(A\mid B^{c}) = \frac{0.15}{1 - 0.60} = \frac{0.15}{0.40} = 0.375</span>.</p>`,
  },
  {
    id: 'p-cond-4', topic: 'conditional', diff: 2,
    q: t`A liability claim goes to litigation with probability 0.20. A litigated claim settles before trial with probability 0.75. If it goes to trial, the insurer wins with probability 0.40. What is the probability that a claim goes to trial and the insurer loses?`,
    choices: ['0.020', '0.030', '0.050', '0.120', '0.150'], answer: 1,
    sol: t`<p>Multiply along the path: litigated, then not settled, then insurer loses.</p>
<div class="texd">0.20 \times (1 - 0.75) \times (1 - 0.40) = 0.20 \times 0.25 \times 0.60 = 0.030</div>
<p>0.020 uses the probability of winning instead of losing.</p>`,
  },

  /* ---------- independence ---------- */
  {
    id: 'p-ind-1', topic: 'independence', diff: 1,
    q: t`Events A and B are independent with <span class="tex">P(A) = 0.3</span> and <span class="tex">P(B) = 0.4</span>. Calculate <span class="tex">P(A\cup B)</span>.`,
    choices: ['0.12', '0.42', '0.58', '0.70', '0.88'], answer: 2,
    sol: t`<p>Independence gives <span class="tex">P(A\cap B) = 0.3 \times 0.4 = 0.12</span>.</p>
<p><span class="tex">P(A\cup B) = 0.3 + 0.4 - 0.12 = 0.58</span>. 0.70 forgets to subtract the overlap.</p>`,
  },
  {
    id: 'p-ind-2', topic: 'independence', diff: 1,
    q: t`An insurer covers 5 buildings in different regions. Each has a probability of 0.08 of a claim this year, independently of the others. What is the probability that at least one building has a claim?`,
    choices: ['0.080', '0.341', '0.400', '0.659', '0.920'], answer: 1,
    sol: t`<p><span class="tex">P(\text{no claims}) = 0.92^5 \approx 0.6591</span>.</p>
<p><span class="tex">P(\text{at least one}) = 1 - 0.92^5 \approx 0.341</span>. Adding <span class="tex">5 \times 0.08 = 0.40</span> double counts years with several claims.</p>`,
  },
  {
    id: 'p-ind-3', topic: 'independence', diff: 2,
    q: t`In a high-risk pool, a policyholder with both a car and a home has probability 0.6 of an auto claim this year and 0.3 of a home claim, independently. What is the probability that the policyholder has exactly one of the two types of claim?`,
    choices: ['0.18', '0.28', '0.54', '0.72', '0.90'], answer: 2,
    sol: t`<p>Exactly one: auto and no home, or home and no auto.</p>
<div class="texd">0.6(0.7) + 0.4(0.3) = 0.42 + 0.12 = 0.54</div>
<p>0.18 is both, 0.28 is neither and 0.72 is at least one.</p>`,
  },
  {
    id: 'p-ind-4', topic: 'independence', diff: 2,
    q: t`<span class="tex">P(A) = 0.2</span>, <span class="tex">P(B) = 0.5</span> and <span class="tex">P(A\cup B) = 0.6</span>. Which statement is true?`,
    choices: ['A and B are mutually exclusive', 'A and B are independent', 'A and B are both independent and mutually exclusive', t`<span class="tex">P(A\mid B) = 0.5</span>`, 'A and B are neither independent nor mutually exclusive'], answer: 1,
    sol: t`<p><span class="tex">P(A\cap B) = 0.2 + 0.5 - 0.6 = 0.1</span>, which is not 0, so they are not mutually exclusive.</p>
<p><span class="tex">P(A)P(B) = 0.2 \times 0.5 = 0.1 = P(A\cap B)</span>, so they are independent. Also <span class="tex">P(A\mid B) = 0.1/0.5 = 0.2</span>, not 0.5.</p>`,
  },

  /* ---------- bayes / total probability ---------- */
  {
    id: 'p-bayes-1', topic: 'bayes', diff: 1,
    q: t`A portfolio is 50% standard risks, 35% preferred risks and 15% substandard risks. The probability of a claim in a year is 0.10, 0.05 and 0.25 respectively. What is the probability that a randomly chosen policy has a claim?`,
    choices: ['0.0375', '0.0950', '0.1050', '0.1333', '0.4000'], answer: 2,
    sol: t`<p>Law of total probability:</p>
<div class="texd">0.50(0.10) + 0.35(0.05) + 0.15(0.25) = 0.0500 + 0.0175 + 0.0375 = 0.1050</div>
<p>0.1333 is the unweighted average of the three rates.</p>`,
  },
  {
    id: 'p-bayes-2', topic: 'bayes', diff: 2,
    q: t`20% of a life insurer's policyholders smoke. The probability of death within a year is 0.005 for smokers and 0.001 for non-smokers. A policyholder died this year. What is the probability that the policyholder was a smoker?`,
    choices: ['0.005', '0.200', '0.444', '0.556', '0.833'], answer: 3,
    sol: t`<p>Joint probabilities: smoker and died <span class="tex">0.20(0.005) = 0.0010</span>; non-smoker and died <span class="tex">0.80(0.001) = 0.0008</span>.</p>
<div class="texd">P(\text{smoker}\mid\text{died}) = \frac{0.0010}{0.0010 + 0.0008} = \frac{0.0010}{0.0018} \approx 0.556</div>
<p>0.833 ignores the prior: <span class="tex">0.005/(0.005+0.001)</span>.</p>`,
  },
  {
    id: 'p-bayes-3', topic: 'bayes', diff: 2,
    q: t`3% of submitted claims are fraudulent. A fraud screen flags 85% of fraudulent claims and 6% of legitimate claims. A claim is flagged. What is the probability that it is fraudulent?`,
    choices: ['0.026', '0.084', '0.305', '0.850', '0.970'], answer: 2,
    sol: t`<p><span class="tex">P(\text{flag}) = 0.03(0.85) + 0.97(0.06) = 0.0255 + 0.0582 = 0.0837</span>.</p>
<div class="texd">P(\text{fraud}\mid\text{flag}) = \frac{0.0255}{0.0837} \approx 0.305</div>
<p>Fewer than a third of flagged claims are fraudulent, because legitimate claims vastly outnumber fraudulent ones.</p>`,
  },
  {
    id: 'p-bayes-4', topic: 'bayes', diff: 3,
    q: t`An auto insurer classifies drivers as class 1 (40%), class 2 (45%) or class 3 (15%). The probability of at least one accident in a year is 0.02, 0.06 and 0.15 for the three classes. A driver had <i>no</i> accidents last year. What is the probability that the driver is in class 3?`,
    choices: ['0.1275', '0.1353', '0.1500', '0.3913', '0.8500'], answer: 1,
    sol: t`<p>Probability of no accident in each class: 0.98, 0.94, 0.85.</p>
<div class="texd">P(\text{none}) = 0.40(0.98) + 0.45(0.94) + 0.15(0.85) = 0.392 + 0.423 + 0.1275 = 0.9425</div>
<div class="texd">P(\text{class 3}\mid \text{none}) = \frac{0.1275}{0.9425} \approx 0.1353</div>
<p>A clean year lowers the probability of class 3 only slightly, from 0.15 to 0.135. 0.3913 is the probability of class 3 given an accident.</p>`,
  },
];

export const TOPICS = {
  sets: 'Sets & inclusion–exclusion',
  counting: 'Counting',
  conditional: 'Conditional probability',
  independence: 'Independence',
  bayes: "Total probability & Bayes",
};
