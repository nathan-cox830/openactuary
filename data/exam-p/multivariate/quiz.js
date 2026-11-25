// Exam P · Multivariate Random Variables practice quiz: 15 original multiple-choice questions (A–E).
// Each: { id, topic (joint|condexp|covariance|sums|orderclt), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python before publishing.
const t = String.raw;

const HOUSE = t`<div class="tblwrap"><table><thead><tr><th></th><th class="num">X = 0</th><th class="num">X = 1</th><th class="num">X = 2</th></tr></thead><tbody>
<tr><td>Y = 0</td><td class="num">0.40</td><td class="num">0.15</td><td class="num">0.05</td></tr>
<tr><td>Y = 1</td><td class="num">0.20</td><td class="num">0.12</td><td class="num">0.08</td></tr></tbody></table></div>`;

export const QUESTIONS = [
  /* ---------- joint ---------- */
  {
    id: 'mv-joint-1', topic: 'joint', diff: 1,
    q: t`For a randomly chosen household, <span class="tex">X</span> is the number of auto claims and <span class="tex">Y</span> the number of homeowners claims in a year. Their joint probability function is shown below.${HOUSE}What is the probability that the household files at least two claims in total?`,
    choices: ['0.08', '0.13', '0.25', '0.40', '0.60'], answer: 2,
    sol: t`<p>"At least two in total" means <span class="tex">X+Y\ge 2</span>. The cells are <span class="tex">(2,0)</span>, <span class="tex">(1,1)</span> and <span class="tex">(2,1)</span>:</p>
<div class="texd">P(X+Y\ge 2) = 0.05 + 0.12 + 0.08 = 0.25</div>
<p>0.13 misses the <span class="tex">(1,1)</span> cell, 0.08 is <span class="tex">P(X+Y\ge 3)</span>, and 0.60 is the probability of at least one claim.</p>`,
  },
  {
    id: 'mv-joint-2', topic: 'joint', diff: 2,
    q: t`The losses <span class="tex">X</span> and <span class="tex">Y</span> (in thousands) on two related policies have joint density <span class="tex">f(x,y) = (x+y)/8</span> for <span class="tex">0&lt;x&lt;2</span> and <span class="tex">0&lt;y&lt;2</span>. What is the probability that the combined loss is less than 2?`,
    choices: [t`<span class="tex">1/6</span>`, t`<span class="tex">1/4</span>`, t`<span class="tex">1/3</span>`, t`<span class="tex">1/2</span>`, t`<span class="tex">2/3</span>`], answer: 2,
    sol: t`<p>The event <span class="tex">x+y&lt;2</span> is the triangle below the anti-diagonal. For each <span class="tex">x\in(0,2)</span>, <span class="tex">y</span> runs from 0 to <span class="tex">2-x</span>:</p>
<div class="texd">\int_0^{2-x}\frac{x+y}{8}\,dy = \frac{x(2-x) + (2-x)^2/2}{8} = \frac{4-x^2}{16}</div>
<div class="texd">P(X+Y<2) = \int_0^2 \frac{4-x^2}{16}\,dx = \frac{8 - 8/3}{16} = \frac13</div>
<p>1/2 is the triangle's share of the square's <i>area</i>, which would only be right for a uniform density. Here the density is smaller near the origin.</p>`,
  },
  {
    id: 'mv-joint-3', topic: 'joint', diff: 3,
    q: t`<span class="tex">X</span> is the time until the first claim and <span class="tex">Y</span> the time until the second claim on a policy, in years. Their joint density is <span class="tex">f(x,y) = 2e^{-x-y}</span> for <span class="tex">0&lt;x&lt;y</span>. Calculate <span class="tex">E[Y]</span>.`,
    choices: ['0.50', '0.75', '1.00', '1.50', '2.00'], answer: 3,
    sol: t`<p>Marginal of <span class="tex">Y</span>: integrate out <span class="tex">x</span> over <span class="tex">0&lt;x&lt;y</span>:</p>
<div class="texd">f_Y(y) = \int_0^y 2e^{-x-y}\,dx = 2e^{-y}(1-e^{-y}) = 2e^{-y} - 2e^{-2y}, \quad y>0</div>
<div class="texd">E[Y] = \int_0^\infty y\,(2e^{-y}-2e^{-2y})\,dy = 2(1) - 2\left(\tfrac14\right) = 1.5</div>
<p>Check: <span class="tex">f_X(x) = \int_x^\infty 2e^{-x-y}\,dy = 2e^{-2x}</span>, so <span class="tex">E[X] = 0.5</span> (choice A). Given <span class="tex">X=x</span>, the extra wait <span class="tex">Y-x</span> is exponential with mean 1, so <span class="tex">E[Y] = 0.5+1 = 1.5</span>.</p>`,
  },

  /* ---------- condexp ---------- */
  {
    id: 'mv-condexp-1', topic: 'condexp', diff: 1,
    q: t`For auto accidents, <span class="tex">X</span> is the number of vehicles involved and <span class="tex">Y</span> the number of injury claims. The joint probabilities are <span class="tex">P(X=1,Y=0)=0.30</span>, <span class="tex">P(X=1,Y=1)=0.15</span>, <span class="tex">P(X=1,Y=2)=0.05</span>, <span class="tex">P(X=2,Y=0)=0.20</span>, <span class="tex">P(X=2,Y=1)=0.15</span> and <span class="tex">P(X=2,Y=2)=0.15</span>. Calculate the expected number of injury claims for an accident involving two vehicles.`,
    choices: ['0.45', '0.50', '0.70', '0.90', '1.00'], answer: 3,
    sol: t`<p><span class="tex">P(X=2) = 0.20+0.15+0.15 = 0.50</span>, so the conditional distribution of <span class="tex">Y</span> given <span class="tex">X=2</span> is <span class="tex">0.4, 0.3, 0.3</span> on 0, 1, 2.</p>
<div class="texd">E[Y\mid X=2] = 0(0.4)+1(0.3)+2(0.3) = 0.9</div>
<p>0.45 forgets to divide by <span class="tex">P(X=2)</span>; 0.70 is the unconditional <span class="tex">E[Y]</span>; 0.50 is <span class="tex">E[Y\mid X=1]</span>.</p>`,
  },
  {
    id: 'mv-condexp-2', topic: 'condexp', diff: 2,
    q: t`A driver's annual number of claims is Poisson with mean <span class="tex">\Lambda</span>, where <span class="tex">\Lambda</span> varies across drivers and is uniformly distributed on <span class="tex">(1,3)</span>. Calculate the variance of the number of claims for a randomly selected driver.`,
    choices: ['0.33', '2.00', '2.33', '2.67', '4.33'], answer: 2,
    sol: t`<p>Law of total variance with <span class="tex">E[N\mid\Lambda] = \mathrm{Var}(N\mid\Lambda) = \Lambda</span>:</p>
<div class="texd">\mathrm{Var}(N) = E[\Lambda] + \mathrm{Var}(\Lambda) = 2 + \frac{(3-1)^2}{12} = 2 + \frac13 \approx 2.33</div>
<p>2.00 keeps only the within-driver part and 0.33 only the between-driver part. 2.67 uses <span class="tex">(b-a)^2/6</span> for the uniform variance, and 4.33 is <span class="tex">E[\Lambda^2]</span>.</p>`,
  },
  {
    id: 'mv-condexp-3', topic: 'condexp', diff: 3,
    q: t`<span class="tex">Y</span> is the total loss on a claim and <span class="tex">X</span> the part retained by the policyholder (both in tens of thousands). The joint density is <span class="tex">f(x,y) = 2(x+y)</span> for <span class="tex">0&lt;x&lt;y&lt;1</span>. Given a total loss of <span class="tex">Y=0.6</span>, calculate the expected retained amount.`,
    choices: ['0.300', '0.333', '0.400', '0.417', '0.450'], answer: 1,
    sol: t`<p>Marginal of <span class="tex">Y</span>: <span class="tex">f_Y(y) = \int_0^y 2(x+y)\,dx = y^2 + 2y^2 = 3y^2</span>. So for <span class="tex">0&lt;x&lt;y</span>,</p>
<div class="texd">f(x\mid y) = \frac{2(x+y)}{3y^2}, \qquad E[X\mid Y=y] = \int_0^y \frac{2x(x+y)}{3y^2}\,dx = \frac{2}{3y^2}\left(\frac{y^3}{3}+\frac{y^3}{2}\right) = \frac{5y}{9}</div>
<p>At <span class="tex">y=0.6</span>: <span class="tex">5(0.6)/9 = 1/3 \approx 0.333</span>.</p>
<p>0.300 assumes <span class="tex">X</span> is uniform on <span class="tex">(0, 0.6)</span>. 0.417 is <span class="tex">P(X&lt;0.3\mid Y=0.6)</span>, a probability rather than a mean.</p>`,
  },

  /* ---------- covariance ---------- */
  {
    id: 'mv-cov-1', topic: 'covariance', diff: 1,
    q: t`The annual losses on two lines of business have standard deviations 4 and 5 (in millions), and correlation coefficient 0.4. Calculate the variance of the combined annual loss.`,
    choices: ['41', '49', '57', '73', '81'], answer: 2,
    sol: t`<p><span class="tex">\mathrm{Cov}(X,Y) = \rho\,\sigma_X\sigma_Y = 0.4(4)(5) = 8</span>.</p>
<div class="texd">\mathrm{Var}(X+Y) = 16 + 25 + 2(8) = 57</div>
<p>41 ignores the covariance, 49 adds it only once, and 81 is <span class="tex">(4+5)^2</span>, which would need perfect correlation.</p>`,
  },
  {
    id: 'mv-cov-2', topic: 'covariance', diff: 2,
    q: t`For a randomly chosen household, <span class="tex">X</span> is the number of auto claims and <span class="tex">Y</span> the number of homeowners claims in a year. Their joint probability function is shown below.${HOUSE}Calculate <span class="tex">\mathrm{Cov}(X,Y)</span>.`,
    choices: ['−0.068', '0.068', '0.195', '0.212', '0.280'], answer: 1,
    sol: t`<p>Marginals: <span class="tex">P(X=1)=0.27</span>, <span class="tex">P(X=2)=0.13</span>, <span class="tex">P(Y=1)=0.40</span>.</p>
<div class="texd">E[X] = 0.27 + 2(0.13) = 0.53 \qquad E[Y] = 0.40</div>
<div class="texd">E[XY] = 1\cdot1(0.12) + 2\cdot1(0.08) = 0.28</div>
<div class="texd">\mathrm{Cov}(X,Y) = 0.28 - 0.53(0.40) = 0.28 - 0.212 = 0.068</div>
<p>0.280 is <span class="tex">E[XY]</span> and 0.212 is <span class="tex">E[X]E[Y]</span>; the covariance is their difference. 0.195 is the correlation coefficient, <span class="tex">0.068/\sqrt{0.5091(0.24)}</span>.</p>`,
  },
  {
    id: 'mv-cov-3', topic: 'covariance', diff: 3,
    q: t`The proportions <span class="tex">X</span> and <span class="tex">Y</span> of two reinsurance layers that are exhausted in a year have joint density <span class="tex">f(x,y) = 8xy</span> for <span class="tex">0&lt;x&lt;y&lt;1</span>. Calculate <span class="tex">\mathrm{Cov}(X,Y)</span>.`,
    choices: ['0', '0.0178', '0.0711', '0.4267', '0.4444'], answer: 1,
    sol: t`<p>The density factors, but the support is a triangle, so <span class="tex">X</span> and <span class="tex">Y</span> are <i>not</i> independent and the covariance need not be 0.</p>
<div class="texd">E[X] = \int_0^1\int_0^y 8x^2y\,dx\,dy = \int_0^1 \tfrac83 y^4\,dy = \tfrac{8}{15} \qquad E[Y] = \int_0^1\int_0^y 8xy^2\,dx\,dy = \int_0^1 4y^4\,dy = \tfrac45</div>
<div class="texd">E[XY] = \int_0^1\int_0^y 8x^2y^2\,dx\,dy = \int_0^1 \tfrac83 y^5\,dy = \tfrac49</div>
<div class="texd">\mathrm{Cov}(X,Y) = \tfrac49 - \tfrac{8}{15}\cdot\tfrac45 = \tfrac{100-96}{225} = \tfrac{4}{225} \approx 0.0178</div>
<p>0 assumes independence because the formula factors; 0.4444 and 0.4267 are <span class="tex">E[XY]</span> and <span class="tex">E[X]E[Y]</span>.</p>`,
  },

  /* ---------- sums ---------- */
  {
    id: 'mv-sums-1', topic: 'sums', diff: 1,
    q: t`Claims from two independent sources arrive according to Poisson distributions with means 1.5 and 2.5 per week. What is the probability of exactly 3 claims in total next week?`,
    choices: ['0.1465', '0.1804', '0.1954', '0.3393', '0.4335'], answer: 2,
    sol: t`<p>The MGFs multiply to <span class="tex">e^{1.5(e^t-1)}e^{2.5(e^t-1)} = e^{4(e^t-1)}</span>, so the total is Poisson(4):</p>
<div class="texd">P(N=3) = \frac{e^{-4}4^3}{3!} \approx 0.1954</div>
<p>0.3393 adds <span class="tex">P(X=3)+P(Y=3)</span>, which ignores mixed splits such as one claim from the first source and two from the second. 0.4335 is <span class="tex">P(N\le 3)</span>, 0.1465 is <span class="tex">P(N=2)</span>, and 0.1804 uses the average mean 2.</p>`,
  },
  {
    id: 'mv-sums-2', topic: 'sums', diff: 2,
    q: t`Annual losses for portfolio A are normal with mean 5,000 and standard deviation 300; for portfolio B they are normal with mean 4,000 and standard deviation 400. The portfolios are independent. Calculate the probability that portfolio A's loss exceeds portfolio B's loss by more than 1,500.`,
    choices: ['0.0294', '0.1587', '0.2375', '0.8413', '0.9772'], answer: 1,
    sol: t`<p><span class="tex">D = A - B</span> is normal (a linear combination of independent normals) with</p>
<div class="texd">E[D] = 5{,}000-4{,}000 = 1{,}000 \qquad \mathrm{Var}(D) = 300^2 + 400^2 = 250{,}000, \quad \mathrm{SD} = 500</div>
<div class="texd">P(D>1{,}500) = 1-\Phi\left(\frac{1{,}500-1{,}000}{500}\right) = 1-\Phi(1) \approx 0.1587</div>
<p>Variances add even for a difference. Subtracting them (SD 264.6) gives 0.0294; adding the SDs (700) gives 0.2375. 0.9772 is <span class="tex">P(A&gt;B)</span>.</p>`,
  },
  {
    id: 'mv-sums-3', topic: 'sums', diff: 3,
    q: t`Losses <span class="tex">X</span> and <span class="tex">Y</span> are independent, with moment generating functions <span class="tex">M_X(t) = (1-2t)^{-3}</span> and <span class="tex">M_Y(t) = (1-2t)^{-2}</span> for <span class="tex">t&lt;1/2</span>. Calculate <span class="tex">P(X+Y>4)</span>.`,
    choices: ['0.0527', '0.6703', '0.8571', '0.9473', '0.9834'], answer: 3,
    sol: t`<p><span class="tex">M_{X+Y}(t) = (1-2t)^{-5}</span>, the MGF of a Gamma with <span class="tex">\alpha=5</span> and <span class="tex">\theta=2</span>: the sum of five independent exponential waits with mean 2.</p>
<p>The sum exceeds 4 exactly when fewer than 5 exponential arrivals happen by time 4, and that count is Poisson with mean <span class="tex">4/2=2</span>:</p>
<div class="texd">P(X+Y>4) = P(\text{Poisson}(2)\le 4) = e^{-2}\left(1+2+\tfrac{4}{2}+\tfrac{8}{6}+\tfrac{16}{24}\right) = 7e^{-2} \approx 0.9473</div>
<p>Stopping the sum at 3 gives 0.8571; 0.0527 is the complement; 0.6703 treats the sum as exponential with mean 10.</p>`,
  },

  /* ---------- orderclt ---------- */
  {
    id: 'mv-order-1', topic: 'orderclt', diff: 1,
    q: t`Three independent policies have exponentially distributed times until their first claim, with means 5, 10 and 10 years. Calculate the probability that none of the three policies has a claim in the next 2 years.`,
    choices: ['0.4493', '0.5507', '0.6703', '0.7866', '0.9231'], answer: 0,
    sol: t`<p>The time to the first claim among the three is exponential with rate <span class="tex">0.2+0.1+0.1 = 0.4</span>:</p>
<div class="texd">P(\min > 2) = e^{-0.2(2)}e^{-0.1(2)}e^{-0.1(2)} = e^{-0.8} \approx 0.4493</div>
<p>0.5507 is the probability of at least one claim. 0.9231 adds the means (25 years) and 0.7866 averages them; with exponentials, add the rates.</p>`,
  },
  {
    id: 'mv-order-2', topic: 'orderclt', diff: 3,
    q: t`A claim is closed when both its medical and property portions are settled. The settlement times are independent: the medical portion is uniform on <span class="tex">(0,10)</span> months and the property portion is exponential with mean 5 months. Calculate the probability that the claim is closed within 5 months.`,
    choices: ['0.1839', '0.3161', '0.5000', '0.6321', '0.8161'], answer: 1,
    sol: t`<p>The claim closes at the <i>later</i> of the two times, so we need the maximum to be at most 5:</p>
<div class="texd">P(\max\le 5) = P(M\le 5)\,P(R\le 5) = \frac{5}{10}\left(1-e^{-5/5}\right) = 0.5(0.6321) \approx 0.3161</div>
<p>0.8161 is the probability that at least one portion is settled (the minimum), and 0.1839 uses <span class="tex">e^{-1}</span> where <span class="tex">1-e^{-1}</span> belongs.</p>`,
  },
  {
    id: 'mv-clt-1', topic: 'orderclt', diff: 2,
    q: t`An insurer has 36 independent claims outstanding. Each has mean 1,000 and standard deviation 600. Using the normal approximation, calculate the probability that the total payment exceeds 40,500.`,
    choices: ['0.1056', '0.2113', '0.3944', '0.4176', '0.8944'], answer: 0,
    sol: t`<p>The total has mean <span class="tex">36(1{,}000) = 36{,}000</span> and SD <span class="tex">600\sqrt{36} = 3{,}600</span>.</p>
<div class="texd">P(S>40{,}500) \approx 1-\Phi\left(\frac{4{,}500}{3{,}600}\right) = 1-\Phi(1.25) \approx 0.1056</div>
<p>Using SD <span class="tex">36(600) = 21{,}600</span> gives 0.4176. 0.2113 doubles the tail as if the question were two-sided, and 0.8944 is <span class="tex">\Phi(1.25)</span>.</p>`,
  },
];

export const TOPICS = {
  joint: 'Joint & marginal distributions',
  condexp: 'Conditional distributions & expectation',
  covariance: 'Covariance & correlation',
  sums: 'Sums & linear combinations',
  orderclt: 'Order statistics & the CLT',
};
