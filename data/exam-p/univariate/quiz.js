// Exam P · Univariate Random Variables practice quiz: 20 original multiple-choice questions (A–E).
// Each: { id, topic (rv|moments|discrete|continuous|coverage), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python before publishing.
const t = String.raw;

export const QUESTIONS = [
  /* ---------- rv: PMFs, PDFs & CDFs ---------- */
  {
    id: 'uv-rv-1', topic: 'rv', diff: 1,
    q: t`The size of a liability claim, in thousands, has density <span class="tex">f(x) = \dfrac{c}{(1+x)^3}</span> for <span class="tex">x > 0</span>. Calculate the probability that a claim exceeds 1 (thousand).`,
    choices: ['0.1250', '0.2500', '0.5000', '0.7500', '0.8750'], answer: 1,
    sol: t`<p>First find <span class="tex">c</span>: <span class="tex">\int_0^\infty c(1+x)^{-3}\,dx = c/2 = 1</span>, so <span class="tex">c = 2</span>.</p>
<div class="texd">P(X > 1) = \int_1^\infty 2(1+x)^{-3}\,dx = \left[-(1+x)^{-2}\right]_1^\infty = \frac{1}{4} = 0.25</div>
<p>Skipping the constant (using <span class="tex">c = 1</span>) gives 0.125, and 0.75 is <span class="tex">P(X \le 1)</span>.</p>`,
  },
  {
    id: 'uv-rv-2', topic: 'rv', diff: 2,
    q: t`The number of claims <span class="tex">N</span> filed by a policyholder in a year has CDF
<div class="texd">F(n) = \begin{cases} 0 & n < 0 \\ 0.25 & 0 \le n < 1 \\ 0.45 & 1 \le n < 2 \\ 0.70 & 2 \le n < 3 \\ 0.85 & 3 \le n < 4 \\ 1 & n \ge 4 \end{cases}</div>
Calculate <span class="tex">P(1 \le N < 3)</span>.`,
    choices: ['0.20', '0.25', '0.40', '0.45', '0.60'], answer: 3,
    sol: t`<p>The event is <span class="tex">N = 1</span> or <span class="tex">N = 2</span>. Read the jumps: <span class="tex">P(N=1) = 0.45 - 0.25 = 0.20</span> and <span class="tex">P(N=2) = 0.70 - 0.45 = 0.25</span>, total 0.45.</p>
<p>In one step, <span class="tex">P(1 \le N < 3) = P(N \le 2) - P(N \le 0) = F(2) - F(0) = 0.70 - 0.25 = 0.45</span>.</p>
<p><span class="tex">F(3) - F(1) = 0.40</span> is <span class="tex">P(1 < N \le 3)</span>, 0.60 is <span class="tex">P(1 \le N \le 3)</span>, and 0.20 counts only <span class="tex">N = 1</span>. With a discrete variable, every <span class="tex">&lt;</span> versus <span class="tex">\le</span> matters.</p>`,
  },
  {
    id: 'uv-rv-3', topic: 'rv', diff: 2,
    q: t`A dental plan's annual payment <span class="tex">Y</span> to a member is 0 with probability 0.4. For <span class="tex">0 < y < 500</span>, <span class="tex">Y</span> has density 0.0008. The plan never pays more than 500, and the remaining probability sits at exactly 500. Calculate <span class="tex">E[Y]</span>.`,
    choices: ['100', '150', '200', '250', '300'], answer: 2,
    sol: t`<p>The continuous part has probability <span class="tex">0.0008 \times 500 = 0.4</span>, so <span class="tex">P(Y = 500) = 1 - 0.4 - 0.4 = 0.2</span>.</p>
<p>Add each piece's contribution:</p>
<div class="texd">E[Y] = 0(0.4) + \int_0^{500} y(0.0008)\,dy + 500(0.2) = 0 + 100 + 100 = 200</div>
<p>Forgetting the point mass at the cap gives 100. This mixed shape (mass at 0, a density, mass at the cap) is exactly what a limit does to a payment.</p>`,
  },
  {
    id: 'uv-rv-4', topic: 'rv', diff: 3,
    q: t`The time <span class="tex">T</span>, in years, until a roof must be replaced is exponential with mean 10. An insurer values the roof with the depreciation factor <span class="tex">V = e^{-0.1T}</span>. Determine the density of <span class="tex">V</span> for <span class="tex">0 < v < 1</span>.`,
    choices: [t`<span class="tex">f(v) = 10e^{-10v}</span>`, t`<span class="tex">f(v) = 2v</span>`, t`<span class="tex">f(v) = 10v^{9}</span>`, t`<span class="tex">f(v) = 1</span>`, t`<span class="tex">f(v) = \dfrac{1}{10v}</span>`], answer: 3,
    sol: t`<p><span class="tex">V</span> decreases as <span class="tex">T</span> increases, so the inequality flips. For <span class="tex">0 < v < 1</span>:</p>
<div class="texd">F_V(v) = P(e^{-0.1T} \le v) = P(T \ge -10\ln v) = e^{-(-10\ln v)/10} = e^{\ln v} = v</div>
<p>So <span class="tex">f_V(v) = 1</span>: <span class="tex">V</span> is uniform on <span class="tex">(0,1)</span>. This is the same fact that lets computers simulate exponential losses from uniform random numbers.</p>
<p>Plugging <span class="tex">v</span> into the exponential density without the change-of-variable factor leads to answers like <span class="tex">10e^{-10v}</span>.</p>`,
  },

  /* ---------- moments ---------- */
  {
    id: 'uv-mom-1', topic: 'moments', diff: 1,
    q: t`The number of claims <span class="tex">N</span> on a policy is 0, 1, 2 or 3 with probabilities 0.60, 0.25, 0.10 and 0.05. Calculate <span class="tex">\operatorname{Var}(N)</span>.`,
    choices: ['0.36', '0.60', '0.74', '0.86', '1.10'], answer: 2,
    sol: t`<div class="texd">E[N] = 0.25 + 2(0.10) + 3(0.05) = 0.60, \qquad E[N^2] = 0.25 + 4(0.10) + 9(0.05) = 1.10</div>
<div class="texd">\operatorname{Var}(N) = 1.10 - 0.60^2 = 0.74</div>
<p>1.10 is <span class="tex">E[N^2]</span> alone, and 0.86 is the standard deviation <span class="tex">\sqrt{0.74}</span>.</p>`,
  },
  {
    id: 'uv-mom-2', topic: 'moments', diff: 2,
    q: t`A loss <span class="tex">X</span> has density <span class="tex">f(x) = 3x^{-4}</span> for <span class="tex">x > 1</span>. Calculate the coefficient of variation of <span class="tex">X</span>.`,
    choices: ['0.5774', '0.7500', '0.8660', '1.5000', '1.7321'], answer: 0,
    sol: t`<div class="texd">E[X] = \int_1^\infty 3x^{-3}\,dx = \frac{3}{2}, \qquad E[X^2] = \int_1^\infty 3x^{-2}\,dx = 3</div>
<div class="texd">\operatorname{Var}(X) = 3 - \frac{9}{4} = 0.75, \qquad \sigma = \sqrt{0.75} \approx 0.8660</div>
<div class="texd">CV = \frac{0.8660}{1.5} \approx 0.5774</div>
<p>0.8660 is the standard deviation itself, and 1.7321 is the ratio upside down, <span class="tex">\mu/\sigma</span>.</p>`,
  },
  {
    id: 'uv-mom-3', topic: 'moments', diff: 2,
    q: t`The number of policies, out of a block, that renew has moment generating function <span class="tex">M(t) = (0.3 + 0.7e^{t})^{5}</span>. Calculate the variance of the number that renew.`,
    choices: ['0.21', '1.05', '2.45', '3.50', '13.30'], answer: 1,
    sol: t`<p>This is the binomial MGF <span class="tex">(1 - p + pe^t)^n</span> with <span class="tex">n = 5</span> and <span class="tex">p = 0.7</span>, so</p>
<div class="texd">\operatorname{Var} = np(1-p) = 5(0.7)(0.3) = 1.05</div>
<p>Differentiating also works: <span class="tex">M'(0) = 3.5</span>, <span class="tex">M''(0) = 13.3</span>, and <span class="tex">13.3 - 3.5^2 = 1.05</span>. 13.30 is <span class="tex">E[X^2]</span> and 3.50 is the mean.</p>`,
  },
  {
    id: 'uv-mom-4', topic: 'moments', diff: 3,
    q: t`A life policy pays 1,000 at the moment of death. The time until death <span class="tex">T</span>, in years, is exponential with mean 10. Using continuous discounting at force of interest 0.05, the present value of the payment is <span class="tex">1000e^{-0.05T}</span>. Calculate the expected present value.`,
    choices: ['333.33', '500.00', '606.53', '666.67', '750.00'], answer: 3,
    sol: t`<p>By LOTUS,</p>
<div class="texd">E\left[1000e^{-0.05T}\right] = 1000\int_0^\infty e^{-0.05t}\cdot 0.1e^{-0.1t}\,dt = 1000\cdot\frac{0.1}{0.15} \approx 666.67</div>
<p>Equivalently, this is <span class="tex">1000\,M_T(-0.05)</span> with <span class="tex">M_T(t) = (1-10t)^{-1}</span>: <span class="tex">1000/1.5</span>.</p>
<p>606.53 discounts for the expected lifetime, <span class="tex">1000e^{-0.05(10)}</span>. Because <span class="tex">e^{-0.05t}</span> is curved, <span class="tex">E[g(T)] \ne g(E[T])</span>.</p>`,
  },

  /* ---------- discrete ---------- */
  {
    id: 'uv-disc-1', topic: 'discrete', diff: 1,
    q: t`A commercial property policy generates claims according to a Poisson distribution with mean 1.5 per month. Calculate the probability of at least two claims in a given month.`,
    choices: ['0.2231', '0.2510', '0.3347', '0.4422', '0.5578'], answer: 3,
    sol: t`<p>Use the complement:</p>
<div class="texd">P(N \ge 2) = 1 - e^{-1.5}(1 + 1.5) = 1 - 2.5e^{-1.5} \approx 1 - 0.5578 = 0.4422</div>
<p>0.2510 is <span class="tex">P(N = 2)</span> only, and 0.5578 is <span class="tex">P(N \le 1)</span>, the complement you subtract.</p>`,
  },
  {
    id: 'uv-disc-2', topic: 'discrete', diff: 2,
    q: t`A telemarketer sells a travel policy on each call with probability 0.25, independently. Calculate the probability that the third sale is made on the eighth call.`,
    choices: ['0.0037', '0.0779', '0.1298', '0.2076', '0.3115'], answer: 1,
    sol: t`<p>Negative binomial: the eighth call is a sale, and exactly 2 of the first 7 calls are sales.</p>
<div class="texd">\binom{7}{2}(0.25)^3(0.75)^5 = 21(0.015625)(0.2373) \approx 0.0779</div>
<p>0.2076 is the binomial probability of 3 sales in 8 calls, which allows the third sale to happen before the eighth call. 0.3115 is the chance of 2 sales in the first 7 calls, without the final sale.</p>`,
  },
  {
    id: 'uv-disc-3', topic: 'discrete', diff: 2,
    q: t`A batch of 20 claims contains 5 that are fraudulent. An investigator selects 4 claims at random, without replacement. Calculate the probability that at least one selected claim is fraudulent.`,
    choices: ['0.2817', '0.4696', '0.6836', '0.7183', '0.7500'], answer: 3,
    sol: t`<p>Hypergeometric. None fraudulent means all 4 come from the 15 legitimate claims:</p>
<div class="texd">P(\text{none}) = \frac{\binom{15}{4}}{\binom{20}{4}} = \frac{1365}{4845} \approx 0.2817, \qquad P(\text{at least one}) \approx 0.7183</div>
<p>0.6836 is <span class="tex">1 - 0.75^4</span>, which treats the draws as independent (with replacement). 0.4696 is exactly one fraudulent claim.</p>`,
  },
  {
    id: 'uv-disc-4', topic: 'discrete', diff: 3,
    q: t`The number of claims <span class="tex">N</span> on a policy is Poisson, and <span class="tex">P(N = 2) = 3\,P(N = 4)</span>. Calculate <span class="tex">P(N \le 1 \mid N \le 2)</span>.`,
    choices: ['0.2707', '0.4000', '0.4060', '0.5413', '0.6000'], answer: 4,
    sol: t`<p>Find <span class="tex">\lambda</span>:</p>
<div class="texd">\frac{e^{-\lambda}\lambda^2}{2} = 3\cdot\frac{e^{-\lambda}\lambda^4}{24} \;\Rightarrow\; \lambda^2 = 4 \;\Rightarrow\; \lambda = 2</div>
<p>The common factor <span class="tex">e^{-2}</span> cancels in the conditional probability:</p>
<div class="texd">P(N\le 1 \mid N \le 2) = \frac{1 + 2}{1 + 2 + 2^2/2} = \frac{3}{5} = 0.6</div>
<p>0.4060 is the unconditional <span class="tex">P(N \le 1) = 3e^{-2}</span>, and 0.4000 is <span class="tex">P(N = 2 \mid N \le 2)</span>, the complement of what was asked.</p>`,
  },

  /* ---------- continuous ---------- */
  {
    id: 'uv-cont-1', topic: 'continuous', diff: 1,
    q: t`The time between claims reported to a small insurer is exponential with mean 2 days. No claim has been reported in the past 5 days. Calculate the probability that a claim is reported within the next 3 days.`,
    choices: ['0.2231', '0.6000', '0.7769', '0.9179', '0.9817'], answer: 2,
    sol: t`<p>The exponential is memoryless, so the 5 quiet days do not matter:</p>
<div class="texd">P(X \le 8 \mid X > 5) = P(X \le 3) = 1 - e^{-3/2} \approx 0.7769</div>
<p>0.2231 is the chance of no claim in the next 3 days, and 0.9817 is <span class="tex">1 - e^{-8/2}</span>, which forgets the condition.</p>`,
  },
  {
    id: 'uv-cont-2', topic: 'continuous', diff: 2,
    q: t`An insurer's total claims next year are normally distributed with mean 5,000,000 and standard deviation 400,000. Calculate the smallest reserve for which the probability that claims exceed the reserve is at most 5%.`,
    choices: ['5,400,000', '5,512,800', '5,658,000', '5,784,000', '6,000,000'], answer: 2,
    sol: t`<p>We need the 95th percentile. From the normal table, <span class="tex">\Phi(1.645) = 0.95</span>, so</p>
<div class="texd">\text{reserve} = 5{,}000{,}000 + 1.645(400{,}000) = 5{,}658{,}000</div>
<p>5,784,000 uses 1.96, the two-sided 95% value. 5,512,800 uses 1.282, the 90th percentile.</p>`,
  },
  {
    id: 'uv-cont-3', topic: 'continuous', diff: 2,
    q: t`A claim is settled in two independent stages, each taking an exponential time with mean 1 month. Calculate the probability that settlement takes more than 3 months in total.`,
    choices: ['0.0498', '0.1494', '0.1991', '0.2231', '0.8009'], answer: 2,
    sol: t`<p>The total is gamma with <span class="tex">\alpha = 2</span> and <span class="tex">\theta = 1</span>. Its survival function is a Poisson sum: fewer than 2 "events" by time 3.</p>
<div class="texd">P(X > 3) = e^{-3}(1 + 3) = 4e^{-3} \approx 0.1991</div>
<p>0.2231 treats the total as a single exponential with mean 2, <span class="tex">e^{-1.5}</span>, and 0.0498 is <span class="tex">e^{-3}</span>, the chance that the first stage alone takes more than 3 months.</p>`,
  },
  {
    id: 'uv-cont-4', topic: 'continuous', diff: 3,
    q: t`An insurer has 400 independent policies, each with probability 0.1 of a claim this year. Using the normal approximation with a continuity correction, calculate the probability of more than 45 claims.`,
    choices: ['0.14', '0.18', '0.20', '0.23', '0.82'], answer: 1,
    sol: t`<p>The count is binomial with mean <span class="tex">400(0.1) = 40</span> and variance <span class="tex">400(0.1)(0.9) = 36</span>, so standard deviation 6.</p>
<p>"More than 45" means 46 or more, which starts at 45.5 on the continuous scale:</p>
<div class="texd">P(N \ge 46) \approx P\left(Z > \frac{45.5 - 40}{6}\right) = P(Z > 0.917) \approx 0.18</div>
<p>No correction (<span class="tex">z = 0.833</span>) gives 0.20; correcting in the wrong direction (46.5) gives 0.14. The exact binomial answer is about 0.179.</p>`,
  },

  /* ---------- coverage ---------- */
  {
    id: 'uv-cov-1', topic: 'coverage', diff: 1,
    q: t`A loss is 0, 1,000, 3,000 or 8,000 with probabilities 0.50, 0.25, 0.15 and 0.10. A policy has an ordinary deductible of 500. Calculate the expected payment per loss.`,
    choices: ['1,000', '1,250', '1,500', '2,000', '2,500'], answer: 1,
    sol: t`<p>Subtract the deductible from each loss that exceeds it:</p>
<div class="texd">E[(X-500)_+] = 0.25(500) + 0.15(2500) + 0.10(7500) = 125 + 375 + 750 = 1{,}250</div>
<p>1,000 is <span class="tex">E[X] - 500 = 1500 - 500</span>, which wrongly charges a deductible on the 50% of losses that are 0. 2,500 is the expected payment per payment, <span class="tex">1250/0.5</span>.</p>`,
  },
  {
    id: 'uv-cov-2', topic: 'coverage', diff: 2,
    q: t`Losses are exponential with mean 5,000. A policy has an ordinary deductible of 1,000. Calculate the expected payment per loss.`,
    choices: ['906', '4,000', '4,094', '4,524', '5,000'], answer: 2,
    sol: t`<div class="texd">E[(X-1000)_+] = \int_{1000}^\infty e^{-x/5000}\,dx = 5000e^{-0.2} \approx 4{,}094</div>
<p>5,000 is the expected payment per <i>payment</i> (memoryless), and 906 is <span class="tex">E[X\wedge 1000]</span>, the part the deductible removes. 4,000 subtracts the deductible from the mean, which overcharges small losses.</p>`,
  },
  {
    id: 'uv-cov-3', topic: 'coverage', diff: 2,
    q: t`Losses are uniform on <span class="tex">(0, 10{,}000)</span>. A policy has an ordinary deductible of 1,000, a maximum covered loss of 6,000, and pays 80% of the covered amount above the deductible. Calculate the expected payment per loss.`,
    choices: ['2,600', '2,889', '3,240', '3,250', '4,000'], answer: 0,
    sol: t`<p>With <span class="tex">S(x) = 1 - x/10{,}000</span>, use <span class="tex">E[X\wedge u] = \int_0^u S(x)\,dx = u - u^2/20{,}000</span>:</p>
<div class="texd">E[X\wedge 6000] = 6000 - 1800 = 4200, \qquad E[X\wedge 1000] = 1000 - 50 = 950</div>
<div class="texd">E[Y] = 0.8(4200 - 950) = 0.8(3250) = 2{,}600</div>
<p>3,250 forgets the coinsurance, 3,240 ignores the limit, and 2,889 is per payment (dividing by <span class="tex">S(1000) = 0.9</span>).</p>`,
  },
  {
    id: 'uv-cov-4', topic: 'coverage', diff: 3,
    q: t`Losses have survival function <span class="tex">S(x) = \left(\dfrac{1000}{1000+x}\right)^{3}</span> for <span class="tex">x > 0</span>. Calculate the loss elimination ratio for an ordinary deductible of 250.`,
    choices: ['0.20', '0.36', '0.49', '0.51', '0.64'], answer: 1,
    sol: t`<div class="texd">E[X] = \int_0^\infty \frac{1000^3}{(1000+x)^3}\,dx = \frac{1000^3}{2(1000)^2} = 500</div>
<div class="texd">E[X\wedge 250] = \int_0^{250} \frac{1000^3}{(1000+x)^3}\,dx = 500\left[1 - \left(\frac{1000}{1250}\right)^2\right] = 500(0.36) = 180</div>
<div class="texd">LER = \frac{180}{500} = 0.36</div>
<p>0.64 is the share the deductible leaves to the insurer, and 0.49 is <span class="tex">1 - S(250) = 1 - 0.8^3</span>, the fraction of losses below the deductible, not the fraction of dollars eliminated.</p>`,
  },
];

export const TOPICS = {
  rv: 'PMFs, PDFs & CDFs',
  moments: 'Expectation, variance & MGFs',
  discrete: 'Discrete distributions',
  continuous: 'Continuous distributions',
  coverage: 'Deductibles, limits & coinsurance',
};
