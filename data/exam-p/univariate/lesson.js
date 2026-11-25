// Exam P · Univariate Random Variables lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Topics: rv (PMFs, PDFs & CDFs) · moments (expectation, variance & MGFs) · discrete · continuous · coverage.
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers were recomputed in Python.
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
const t = String.raw;

export const LESSON = {
  id: 'univariate',
  title: 'Univariate Random Variables',
  steps: [
    {
      id: 'uv-random-variables', title: 'Random variables, PMFs and PDFs', short: 'PMFs & PDFs', topic: 'rv', minutes: 8,
      body: t`
<p>A <b>random variable</b> turns the outcome of an experiment into a number. The number of claims a policy files this year, the size of the next auto claim, and the time until a roof needs replacing are all random variables. We write them with capital letters, such as <span class="tex">X</span> or <span class="tex">N</span>, and their observed values with lower case.</p>
<p>A <b>discrete</b> random variable takes separate values you can list: 0, 1, 2, … claims. Its <b>probability mass function</b> (PMF) gives the probability of each value:</p>
<div class="texd">p(x) = P(X = x), \qquad p(x) \ge 0, \qquad \sum_x p(x) = 1</div>
<p>A <b>continuous</b> random variable takes any value in an interval, such as a claim amount. Single points have probability zero, so instead we use a <b>probability density function</b> (PDF) <span class="tex">f(x)</span>. Probabilities are areas under the curve:</p>
<div class="texd">P(a < X < b) = \int_a^b f(x)\,dx, \qquad f(x) \ge 0, \qquad \int_{-\infty}^{\infty} f(x)\,dx = 1</div>
<p>Two habits from this step pay off all exam long:</p>
<ul>
  <li>If a PMF or PDF has an unknown constant <span class="tex">c</span>, find it first by making the total equal 1.</li>
  <li>For continuous variables, <span class="tex">P(X=a) = 0</span>, so <span class="tex">&lt;</span> and <span class="tex">\le</span> give the same probability. For discrete variables they do not: <span class="tex">P(N \le 2)</span> includes the value 2 and <span class="tex">P(N &lt; 2)</span> does not.</li>
</ul>
<p>A density value is not a probability. <span class="tex">f(x)</span> can be bigger than 1; only areas must stay between 0 and 1.</p>`,
      example: {
        title: 'Worked example: a claim count and a claim size',
        html: t`<p><b>Discrete.</b> The number of claims <span class="tex">N</span> on a policy has <span class="tex">p(0)=0.50</span>, <span class="tex">p(1)=0.30</span>, <span class="tex">p(2)=0.15</span>, <span class="tex">p(3)=0.05</span>. Then <span class="tex">P(N \ge 2) = 0.15 + 0.05 = 0.20</span>.</p>
<p><b>Continuous.</b> A claim size <span class="tex">X</span> (in thousands) has density <span class="tex">f(x) = c(10 - x)</span> for <span class="tex">0 < x < 10</span>. The area of that triangle is <span class="tex">c \cdot \tfrac12 \cdot 10 \cdot 10 = 50c</span>, so <span class="tex">c = 0.02</span>. Then</p>
<div class="texd">P(X > 6) = \int_6^{10} 0.02(10-x)\,dx = 0.02 \cdot \frac{4^2}{2} = 0.16</div>`,
      },
      checks: [
        { q: t`A random variable has PMF <span class="tex">p(x) = kx</span> for <span class="tex">x = 1, 2, 3, 4</span>. Find <span class="tex">k</span>.`,
          opts: [t`<span class="tex">1/4</span>`, t`<span class="tex">1/10</span>`, t`<span class="tex">1/24</span>`, t`<span class="tex">1/100</span>`], correct: 1,
          explain: t`The probabilities must add to 1: <span class="tex">k(1+2+3+4) = 10k = 1</span>, so <span class="tex">k = 1/10</span>.` },
        { q: t`A loss (in thousands) has density <span class="tex">f(x) = 3x^2</span> for <span class="tex">0 < x < 1</span>. Find <span class="tex">P(X > 0.5)</span>.`,
          opts: ['0.125', '0.500', '0.750', '0.875'], correct: 3,
          explain: t`<span class="tex">\int_{0.5}^{1} 3x^2\,dx = 1 - 0.5^3 = 0.875</span>. (0.125 is <span class="tex">P(X < 0.5)</span>.)` },
        { q: t`<span class="tex">X</span> is a continuous claim amount. What is <span class="tex">P(X = 2{,}000)</span>?`,
          opts: [t`<span class="tex">f(2000)</span>`, '0', 'It depends on the density', '1'], correct: 1,
          explain: t`A single point has no width, so the area above it is 0 for any continuous random variable. <span class="tex">f(2000)</span> is a density height, not a probability.` },
      ],
    },
    {
      id: 'uv-cdf', title: 'CDFs, survival functions and mixed distributions', short: 'CDFs', topic: 'rv', minutes: 8,
      body: t`
<p>The <b>cumulative distribution function</b> (CDF) works for every random variable, discrete or continuous:</p>
<div class="texd">F(x) = P(X \le x)</div>
<p>It starts at 0 on the far left, never decreases, and climbs to 1 on the far right. Interval probabilities come from subtraction:</p>
<div class="texd">P(a < X \le b) = F(b) - F(a)</div>
<p>For a continuous variable the CDF is a smooth curve and the density is its slope: <span class="tex">f(x) = F'(x)</span>, and <span class="tex">F(x) = \int_{-\infty}^{x} f(t)\,dt</span>. For a discrete variable the CDF is a staircase. Each jump sits at a possible value, and the height of the jump is that value's probability: <span class="tex">P(X = a) = F(a) - F(a^-)</span>.</p>
<p>Insurance work often uses the <b>survival function</b>, the chance a loss is bigger than <span class="tex">x</span>:</p>
<div class="texd">S(x) = P(X > x) = 1 - F(x)</div>
<p><b>Mixed distributions.</b> Some quantities are partly discrete and partly continuous. A policy's annual payment is exactly 0 for most policyholders (a jump in the CDF at 0) and spread over a range for the rest. A payment capped at a limit has another jump at the cap. Treat each piece separately: add point probabilities for the jumps and integrate the density for the smooth part.</p>`,
      example: {
        title: 'Worked example: a payment with a point mass at zero',
        html: t`<p>60% of policies have no claim in a year. For the other 40%, the payment is uniform between 0 and 1,000. The payment <span class="tex">Y</span> has CDF</p>
<div class="texd">F(y) = 0.6 + 0.4\cdot\frac{y}{1000}, \qquad 0 \le y \le 1000</div>
<p>So <span class="tex">P(Y \le 250) = 0.6 + 0.4(0.25) = 0.70</span>. The CDF jumps from 0 to 0.6 at <span class="tex">y=0</span>: that jump is the 60% chance of paying nothing.</p>`,
      },
      checks: [
        { q: t`A loss has CDF <span class="tex">F(x) = 1 - e^{-x/5}</span> for <span class="tex">x > 0</span>. Find <span class="tex">P(X > 10)</span>.`,
          opts: ['0.1353', '0.3679', '0.5000', '0.8647'], correct: 0,
          explain: t`<span class="tex">P(X > 10) = 1 - F(10) = e^{-2} \approx 0.1353</span>. (0.8647 is <span class="tex">F(10)</span> itself.)` },
        { q: t`A claim count has <span class="tex">F(0)=0.4</span>, <span class="tex">F(1)=0.7</span>, <span class="tex">F(2)=0.9</span>, <span class="tex">F(3)=1</span>. Find <span class="tex">P(N = 2)</span>.`,
          opts: ['0.1', '0.2', '0.7', '0.9'], correct: 1,
          explain: t`The jump at 2 is the probability of 2: <span class="tex">F(2) - F(1) = 0.9 - 0.7 = 0.2</span>.` },
        { q: t`In the example (60% pay nothing, the rest uniform on 0 to 1,000), find <span class="tex">P(Y > 500)</span>.`,
          opts: ['0.20', '0.40', '0.50', '0.80'], correct: 0,
          explain: t`<span class="tex">P(Y > 500) = 1 - F(500) = 1 - (0.6 + 0.4 \cdot 0.5) = 0.20</span>. (0.50 forgets the 60% of policies with no claim.)` },
      ],
    },
    {
      id: 'uv-expectation', title: 'Expected value and LOTUS', short: 'Expectation', topic: 'moments', minutes: 9,
      body: t`
<p>The <b>expected value</b> (mean) is the probability-weighted average, the long-run average over many policies:</p>
<div class="texd">E[X] = \sum_x x\,p(x) \qquad\text{or}\qquad E[X] = \int_{-\infty}^{\infty} x\,f(x)\,dx</div>
<p>To find the mean of a function of <span class="tex">X</span>, you do not need the distribution of the function. Weight the function's values by the original probabilities. This is the <b>law of the unconscious statistician</b> (LOTUS):</p>
<div class="texd">E[g(X)] = \sum_x g(x)\,p(x) \qquad\text{or}\qquad E[g(X)] = \int g(x)\,f(x)\,dx</div>
<p>Expectation is linear: <span class="tex">E[aX + b] = aE[X] + b</span>. It is not multiplicative in general: <span class="tex">E[X^2] \ne (E[X])^2</span> and <span class="tex">E[1/X] \ne 1/E[X]</span>.</p>
<p><b>Survival-function shortcut.</b> For a loss that is never negative, integrating the survival function gives the mean, and it is often quicker than integrating <span class="tex">x f(x)</span>:</p>
<div class="texd">E[X] = \int_0^{\infty} S(x)\,dx \qquad\text{and for counts}\qquad E[N] = \sum_{k=0}^{\infty} P(N > k)</div>
<p>This shortcut is the engine behind the deductible and limit formulas at the end of this lesson.</p>`,
      example: {
        title: 'Worked example: mean claims and mean claim size',
        html: t`<p>For the claim count with <span class="tex">p(0)=0.50</span>, <span class="tex">p(1)=0.30</span>, <span class="tex">p(2)=0.15</span>, <span class="tex">p(3)=0.05</span>:</p>
<div class="texd">E[N] = 0(0.50) + 1(0.30) + 2(0.15) + 3(0.05) = 0.75</div>
<div class="texd">E[N^2] = 0 + 1(0.30) + 4(0.15) + 9(0.05) = 1.35</div>
<p>For the claim size with density <span class="tex">f(x) = 0.02(10-x)</span> on <span class="tex">(0, 10)</span>:</p>
<div class="texd">E[X] = \int_0^{10} 0.02\,x(10-x)\,dx = 0.02\left(500 - \tfrac{1000}{3}\right) = \tfrac{10}{3} \approx 3.333</div>`,
      },
      checks: [
        { q: t`A building's annual fire loss is 0 with probability 0.7, 100 with probability 0.2 and 500 with probability 0.1. Find the expected loss.`,
          opts: ['70', '100', '200', '600'], correct: 0,
          explain: t`<span class="tex">E[X] = 0(0.7) + 100(0.2) + 500(0.1) = 20 + 50 = 70</span>. (200 is the plain average of the three values.)` },
        { q: t`<span class="tex">X</span> has density <span class="tex">f(x) = 2x</span> on <span class="tex">(0,1)</span>. Find <span class="tex">E[X^2]</span>.`,
          opts: [t`<span class="tex">1/4</span>`, t`<span class="tex">4/9</span>`, t`<span class="tex">1/2</span>`, t`<span class="tex">2/3</span>`], correct: 2,
          explain: t`By LOTUS, <span class="tex">E[X^2] = \int_0^1 x^2 \cdot 2x\,dx = 2/4 = 1/2</span>. (<span class="tex">4/9</span> is <span class="tex">(E[X])^2 = (2/3)^2</span>, which is not the same thing.)` },
        { q: t`A loss has <span class="tex">S(x) = (1+x)^{-3}</span> for <span class="tex">x > 0</span>. Find <span class="tex">E[X]</span>.`,
          opts: ['0.25', '0.5', '1', '3'], correct: 1,
          explain: t`<span class="tex">E[X] = \int_0^\infty (1+x)^{-3}\,dx = \left[-\tfrac12 (1+x)^{-2}\right]_0^\infty = \tfrac12</span>.` },
      ],
    },
    {
      id: 'uv-variance', title: 'Variance, standard deviation and coefficient of variation', short: 'Variance', topic: 'moments', minutes: 7,
      body: t`
<p>The mean tells you the center. The <b>variance</b> measures spread: the expected squared distance from the mean. Writing <span class="tex">\mu = E[X]</span>,</p>
<div class="texd">\operatorname{Var}(X) = E[(X-\mu)^2] = E[X^2] - (E[X])^2</div>
<p>The second form is the one you will use almost every time: find <span class="tex">E[X]</span> and <span class="tex">E[X^2]</span>, then subtract.</p>
<p>The <b>standard deviation</b> <span class="tex">\sigma = \sqrt{\operatorname{Var}(X)}</span> is back in the original units (dollars, claims). The <b>coefficient of variation</b> compares spread to size, which is how actuaries compare the riskiness of lines with very different average claims:</p>
<div class="texd">CV = \frac{\sigma}{\mu}</div>
<p>Shifting a loss does not change its spread, and scaling multiplies the variance by the square of the scale:</p>
<div class="texd">\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X), \qquad \operatorname{SD}(aX+b) = |a|\,\operatorname{SD}(X)</div>
<p>So 10% inflation raises the variance by a factor of <span class="tex">1.1^2 = 1.21</span>, while a flat 50 added to every claim leaves it unchanged. The CV is unchanged by scaling, which makes it a handy currency-free measure.</p>`,
      example: {
        title: 'Worked example: spread of the claim count',
        html: t`<p>From the last step, <span class="tex">E[N] = 0.75</span> and <span class="tex">E[N^2] = 1.35</span>.</p>
<div class="texd">\operatorname{Var}(N) = 1.35 - 0.75^2 = 1.35 - 0.5625 = 0.7875</div>
<p>The standard deviation is <span class="tex">\sqrt{0.7875} \approx 0.8874</span> claims and the coefficient of variation is <span class="tex">0.8874/0.75 \approx 1.183</span>.</p>`,
      },
      checks: [
        { q: t`<span class="tex">E[X] = 4</span> and <span class="tex">E[X^2] = 25</span>. Find the standard deviation of <span class="tex">X</span>.`,
          opts: ['3', '5', '9', '21'], correct: 0,
          explain: t`<span class="tex">\operatorname{Var}(X) = 25 - 4^2 = 9</span>, so the standard deviation is 3. (21 subtracts the mean instead of its square.)` },
        { q: t`<span class="tex">\operatorname{Var}(X) = 9</span>. Find <span class="tex">\operatorname{Var}(2X + 5)</span>.`,
          opts: ['18', '23', '36', '41'], correct: 2,
          explain: t`<span class="tex">\operatorname{Var}(2X+5) = 2^2 \cdot 9 = 36</span>. The constant 5 shifts the loss without changing its spread.` },
        { q: t`A line of business has mean claim 2,000 and standard deviation 500. What is its coefficient of variation?`,
          opts: ['0.0625', '0.25', '4', '125'], correct: 1,
          explain: t`<span class="tex">CV = 500/2000 = 0.25</span>. (4 is the ratio upside down.)` },
      ],
    },
    {
      id: 'uv-percentiles', title: 'Percentiles, median and mode', short: 'Percentiles & mode', topic: 'rv', minutes: 7,
      body: t`
<p>The <b>100p-th percentile</b> <span class="tex">\pi_p</span> is the value with probability <span class="tex">p</span> at or below it. For a continuous variable, solve</p>
<div class="texd">F(\pi_p) = p</div>
<p>The <b>median</b> is the 50th percentile, <span class="tex">F(m) = 0.5</span>. Insurers use high percentiles all the time: a reserve set at the 95th percentile of losses is enough in 19 years out of 20. The same idea is called <b>value at risk</b> in risk management.</p>
<p>For a discrete variable the CDF jumps, so there may be no value with <span class="tex">F(x) = p</span> exactly. Take the smallest value whose CDF reaches <span class="tex">p</span>: the smallest <span class="tex">x</span> with <span class="tex">F(x) \ge p</span>.</p>
<p>The <b>mode</b> is the most likely value: the largest <span class="tex">p(x)</span>, or the peak of <span class="tex">f(x)</span>. For a smooth density, set <span class="tex">f'(x) = 0</span> and check the endpoints too.</p>
<p>Mean, median and mode agree for symmetric bell-shaped distributions. Loss distributions are usually <b>skewed right</b> (many small claims and a few huge ones), and then typically mode &lt; median &lt; mean.</p>`,
      example: {
        title: 'Worked example: percentiles of an exponential loss',
        html: t`<p>A claim size is exponential with mean 1,000, so <span class="tex">F(x) = 1 - e^{-x/1000}</span>.</p>
<p>Median: <span class="tex">1 - e^{-m/1000} = 0.5 \Rightarrow m = 1000\ln 2 \approx 693.15</span>.</p>
<p>90th percentile: <span class="tex">1 - e^{-x/1000} = 0.9 \Rightarrow x = 1000\ln 10 \approx 2{,}302.59</span>.</p>
<p>The mode is 0, where the density is highest. Mode 0 &lt; median 693 &lt; mean 1,000: the right skew in action.</p>`,
      },
      checks: [
        { q: t`<span class="tex">F(x) = x^2/16</span> for <span class="tex">0 \le x \le 4</span>. Find the median.`,
          opts: ['2', '2.6667', '2.8284', '4'], correct: 2,
          explain: t`<span class="tex">m^2/16 = 0.5 \Rightarrow m = \sqrt{8} \approx 2.8284</span>. (2.6667 is the mean, and 2 is the midpoint of the range.)` },
        { q: t`A loss ratio has density <span class="tex">f(x) = 12x^2(1-x)</span> on <span class="tex">(0,1)</span>. Find the mode.`,
          opts: [t`<span class="tex">1/2</span>`, t`<span class="tex">3/5</span>`, t`<span class="tex">2/3</span>`, t`<span class="tex">3/4</span>`], correct: 2,
          explain: t`<span class="tex">f'(x) = 24x - 36x^2 = 12x(2 - 3x) = 0 \Rightarrow x = 2/3</span>, and the density is 0 at both endpoints. (3/5 is the mean.)` },
        { q: t`A claim count has <span class="tex">p(0)=0.30</span>, <span class="tex">p(1)=0.25</span>, <span class="tex">p(2)=0.20</span>, <span class="tex">p(3)=0.15</span>, <span class="tex">p(4)=0.10</span>. Find the 80th percentile.`,
          opts: ['2', '2.5', '3', '4'], correct: 2,
          explain: t`The CDF is 0.30, 0.55, 0.75, 0.90, 1. The first value where it reaches 0.80 is 3.` },
      ],
    },
    {
      id: 'uv-mgf', title: 'Moment generating functions', short: 'MGFs', topic: 'moments', minutes: 8,
      body: t`
<p>The <b>moment generating function</b> (MGF) packs every moment of a distribution into one function:</p>
<div class="texd">M_X(t) = E\left[e^{tX}\right]</div>
<p>Differentiate and set <span class="tex">t = 0</span> to read off moments:</p>
<div class="texd">M_X(0) = 1, \qquad M_X'(0) = E[X], \qquad M_X''(0) = E[X^2], \qquad M_X^{(k)}(0) = E[X^k]</div>
<p>Three facts make MGFs useful on the exam:</p>
<ul>
  <li><b>Uniqueness.</b> If two random variables have the same MGF, they have the same distribution. Recognize the form and you know the distribution, its mean and its variance.</li>
  <li><b>Linear changes.</b> <span class="tex">M_{aX+b}(t) = e^{bt}\,M_X(at)</span>.</li>
  <li><b>Sums.</b> For independent variables, the MGF of a sum is the product of MGFs. (This is the main tool in the multivariate section.)</li>
</ul>
<p>A discrete MGF is a list of values in disguise: <span class="tex">M(t) = 0.2 + 0.5e^{t} + 0.3e^{2t}</span> says <span class="tex">X</span> is 0, 1 or 2 with probabilities 0.2, 0.5 and 0.3. The forms to recognize are on the formula sheet: binomial <span class="tex">(1-p+pe^t)^n</span>, Poisson <span class="tex">e^{\lambda(e^t-1)}</span>, exponential <span class="tex">(1-\theta t)^{-1}</span>, gamma <span class="tex">(1-\theta t)^{-\alpha}</span> and normal <span class="tex">e^{\mu t + \sigma^2t^2/2}</span>.</p>`,
      example: {
        title: 'Worked example: recognizing a gamma',
        html: t`<p>A claim size has <span class="tex">M(t) = (1 - 200t)^{-3}</span>. Differentiate:</p>
<div class="texd">M'(t) = 600(1-200t)^{-4}, \qquad M''(t) = 480{,}000(1-200t)^{-5}</div>
<p>So <span class="tex">E[X] = 600</span>, <span class="tex">E[X^2] = 480{,}000</span> and <span class="tex">\operatorname{Var}(X) = 480{,}000 - 600^2 = 120{,}000</span>.</p>
<p>Faster: this is a gamma MGF with <span class="tex">\alpha = 3</span>, <span class="tex">\theta = 200</span>, so the mean is <span class="tex">\alpha\theta = 600</span> and the variance <span class="tex">\alpha\theta^2 = 120{,}000</span>.</p>`,
      },
      checks: [
        { q: t`<span class="tex">M_X(t) = 0.2 + 0.5e^{t} + 0.3e^{2t}</span>. Find <span class="tex">E[X]</span>.`,
          opts: ['0.8', '1.0', '1.1', '1.7'], correct: 2,
          explain: t`<span class="tex">M'(0) = 0.5 + 2(0.3) = 1.1</span>. (1.7 is <span class="tex">E[X^2] = 0.5 + 4(0.3)</span>.)` },
        { q: t`<span class="tex">M_X(t) = e^{3t + 8t^2}</span>. Find <span class="tex">\operatorname{Var}(X)</span>.`,
          opts: ['4', '8', '16', '64'], correct: 2,
          explain: t`This is a normal MGF <span class="tex">e^{\mu t + \sigma^2 t^2/2}</span> with <span class="tex">\mu = 3</span> and <span class="tex">\sigma^2/2 = 8</span>, so <span class="tex">\sigma^2 = 16</span>.` },
        { q: t`<span class="tex">M_X(t) = (1-2t)^{-1}</span> and <span class="tex">Y = 3X + 1</span>. Which is <span class="tex">M_Y(t)</span>?`,
          opts: [t`<span class="tex">3(1-2t)^{-1} + 1</span>`, t`<span class="tex">e^{t}(1-6t)^{-1}</span>`, t`<span class="tex">e^{3t}(1-2t)^{-1}</span>`, t`<span class="tex">e^{t}(1-2t)^{-3}</span>`], correct: 1,
          explain: t`<span class="tex">M_{aX+b}(t) = e^{bt}M_X(at) = e^{t}(1 - 2 \cdot 3t)^{-1} = e^{t}(1-6t)^{-1}</span>.` },
      ],
    },
    {
      id: 'uv-transformations', title: 'Functions of a random variable', short: 'Transformations', topic: 'rv', minutes: 8,
      body: t`
<p>Insurers constantly reshape losses: inflate them, convert currencies, apply deductibles. If <span class="tex">Y = g(X)</span>, how is <span class="tex">Y</span> distributed?</p>
<p><b>Discrete:</b> add up the probabilities of every <span class="tex">x</span> that maps to the same <span class="tex">y</span>: <span class="tex">P(Y = y) = \sum_{x:\,g(x)=y} p(x)</span>.</p>
<p><b>Continuous, CDF method</b> (always works): write <span class="tex">F_Y(y) = P(g(X) \le y)</span>, turn the inequality into one about <span class="tex">X</span>, use <span class="tex">F_X</span>, then differentiate if you need the density. Watch the direction when <span class="tex">g</span> is decreasing.</p>
<p><b>Continuous, change of variable</b> (when <span class="tex">g</span> is strictly increasing or decreasing): with inverse <span class="tex">x = g^{-1}(y)</span>,</p>
<div class="texd">f_Y(y) = f_X\!\left(g^{-1}(y)\right)\left|\frac{d}{dy}g^{-1}(y)\right|</div>
<p>The absolute-value factor stretches or squeezes the density so the total area stays 1.</p>
<p>Two shortcuts worth memorizing. Scaling an exponential with mean <span class="tex">\theta</span> by <span class="tex">c</span> gives an exponential with mean <span class="tex">c\theta</span>, and scaling a gamma scales <span class="tex">\theta</span> the same way. And to find a probability for <span class="tex">Y</span>, you rarely need its density: <span class="tex">P(1.1X > 1100) = P(X > 1000)</span>.</p>`,
      example: {
        title: 'Worked example: squaring a uniform',
        html: t`<p><span class="tex">X</span> is uniform on <span class="tex">(0, 10)</span> and <span class="tex">Y = X^2</span>. For <span class="tex">0 < y < 100</span>,</p>
<div class="texd">F_Y(y) = P(X^2 \le y) = P(X \le \sqrt{y}) = \frac{\sqrt{y}}{10}, \qquad f_Y(y) = \frac{1}{20\sqrt{y}}</div>
<p>So <span class="tex">P(Y > 25) = 1 - \sqrt{25}/10 = 0.5</span>. Squaring piles probability up near 0: <span class="tex">Y</span> is not uniform.</p>`,
      },
      checks: [
        { q: t`<span class="tex">X</span> is uniform on <span class="tex">(0,1)</span> and <span class="tex">Y = -\ln X</span>. What is the distribution of <span class="tex">Y</span>?`,
          opts: ['Uniform on (0, 1)', 'Exponential with mean 1', 'Exponential with mean 1/2', 'Normal with mean 0'], correct: 1,
          explain: t`<span class="tex">F_Y(y) = P(-\ln X \le y) = P(X \ge e^{-y}) = 1 - e^{-y}</span>, the exponential CDF with mean 1. The inequality flips because <span class="tex">-\ln</span> is decreasing.` },
        { q: t`Losses are exponential with mean 500. Next year every loss is 10% higher. What is the probability that next year's loss exceeds 1,100?`,
          opts: ['0.1108', '0.1225', '0.1353', '0.8647'], correct: 2,
          explain: t`<span class="tex">P(1.1X > 1100) = P(X > 1000) = e^{-1000/500} = e^{-2} \approx 0.1353</span>. Equivalently, <span class="tex">1.1X</span> is exponential with mean 550 and <span class="tex">e^{-1100/550} = e^{-2}</span>. (0.1108 is <span class="tex">e^{-2.2}</span>, inflating the threshold instead of the mean.)` },
        { q: t`<span class="tex">X</span> is <span class="tex">-1, 0, 1, 2</span> with probabilities 0.1, 0.2, 0.3, 0.4. Find <span class="tex">P(X^2 = 1)</span>.`,
          opts: ['0.1', '0.3', '0.4', '0.6'], correct: 2,
          explain: t`Both <span class="tex">x=-1</span> and <span class="tex">x=1</span> give <span class="tex">x^2 = 1</span>: <span class="tex">0.1 + 0.3 = 0.4</span>.` },
      ],
    },
    {
      id: 'uv-discrete', title: 'Discrete distributions', short: 'Discrete distributions', topic: 'discrete', minutes: 12,
      body: t`
<p>A handful of named distributions cover most Exam P counting questions. Learn the story behind each one, because the story tells you which to use.</p>
<div class="tblwrap"><table><thead><tr><th>Distribution</th><th>Story</th><th>PMF</th><th>Mean</th><th>Variance</th></tr></thead>
<tbody>
<tr><td>Bernoulli</td><td>One trial: claim or not</td><td><span class="tex">p^x(1-p)^{1-x},\ x=0,1</span></td><td><span class="tex">p</span></td><td><span class="tex">p(1-p)</span></td></tr>
<tr><td>Binomial</td><td>Successes in <span class="tex">n</span> independent trials</td><td><span class="tex">\binom{n}{x}p^x(1-p)^{n-x}</span></td><td><span class="tex">np</span></td><td><span class="tex">np(1-p)</span></td></tr>
<tr><td>Geometric</td><td>Trials until the first success</td><td><span class="tex">(1-p)^{x-1}p,\ x=1,2,\dots</span></td><td><span class="tex">1/p</span></td><td><span class="tex">(1-p)/p^2</span></td></tr>
<tr><td>Negative binomial</td><td>Trials until the <span class="tex">r</span>-th success</td><td><span class="tex">\binom{x-1}{r-1}p^r(1-p)^{x-r}</span></td><td><span class="tex">r/p</span></td><td><span class="tex">r(1-p)/p^2</span></td></tr>
<tr><td>Hypergeometric</td><td>Special items in a sample without replacement</td><td><span class="tex">\binom{K}{x}\binom{N-K}{n-x}\big/\binom{N}{n}</span></td><td><span class="tex">nK/N</span></td><td><span class="tex">n\frac{K}{N}\frac{N-K}{N}\frac{N-n}{N-1}</span></td></tr>
<tr><td>Poisson</td><td>Count of rare events in a period</td><td><span class="tex">e^{-\lambda}\lambda^x/x!</span></td><td><span class="tex">\lambda</span></td><td><span class="tex">\lambda</span></td></tr>
<tr><td>Discrete uniform</td><td>Equally likely values <span class="tex">a,\dots,b</span></td><td><span class="tex">1/(b-a+1)</span></td><td><span class="tex">(a+b)/2</span></td><td><span class="tex">\frac{(b-a+1)^2-1}{12}</span></td></tr>
</tbody></table></div>
<p><b>Watch the geometric convention.</b> Some questions count trials (1, 2, 3, …) and some count failures before the first success (0, 1, 2, …). If <span class="tex">Y</span> counts failures, then <span class="tex">Y = X - 1</span>: <span class="tex">P(Y=y) = (1-p)^y p</span> and <span class="tex">E[Y] = (1-p)/p</span>, with the same variance. The same shift applies to the negative binomial. Read the question twice.</p>
<p>The geometric is <b>memoryless</b>: after <span class="tex">k</span> failures, the number of further trials needed has the same geometric distribution, so <span class="tex">P(X > k + j \mid X > k) = (1-p)^j</span>.</p>
<p>The <b>Poisson</b> is the workhorse for claim counts. Its mean equals its variance, rates scale with time (2 claims a month means 6 a quarter), and independent Poisson counts add to a Poisson. It also approximates a binomial with large <span class="tex">n</span> and small <span class="tex">p</span>, using <span class="tex">\lambda = np</span>.</p>`,
      example: {
        title: 'Worked example: Poisson claim counts',
        html: t`<p>A small business policy averages 2 claims a year, Poisson. The chance of at least 2 claims is easiest through the complement:</p>
<div class="texd">P(N \ge 2) = 1 - P(0) - P(1) = 1 - e^{-2}(1 + 2) = 1 - 3e^{-2} \approx 0.5940</div>
<p>Over two years the count is Poisson with mean 4, so the chance of a claim-free two years is <span class="tex">e^{-4} \approx 0.0183</span>, which is <span class="tex">(e^{-2})^2</span> as independence of the two years requires.</p>`,
      },
      checks: [
        { q: t`An agent sells 10 independent policies, each with a 10% chance of a claim this year. Find the probability of exactly one claim.`,
          opts: ['0.1000', '0.3487', '0.3874', '0.6513'], correct: 2,
          explain: t`Binomial: <span class="tex">\binom{10}{1}(0.1)(0.9)^9 \approx 0.3874</span>. (0.3487 is <span class="tex">0.9^{10}</span>, no claims, and 0.6513 is at least one.)` },
        { q: t`Claims arrive Poisson with mean 3 per month. Find the probability of at most one claim in a month.`,
          opts: ['0.0498', '0.1494', '0.1991', '0.8009'], correct: 2,
          explain: t`<span class="tex">P(0) + P(1) = e^{-3}(1 + 3) = 4e^{-3} \approx 0.1991</span>.` },
        { q: t`An inspector visits properties until finding one with a code violation. Each property independently has a violation with probability 0.2. Find the probability that the first violation is found at the third property.`,
          opts: ['0.1024', '0.1280', '0.1600', '0.4880'], correct: 1,
          explain: t`Two clean properties, then a violation: <span class="tex">0.8^2(0.2) = 0.128</span>. (0.4880 is the chance of a violation within the first three, <span class="tex">1-0.8^3</span>.)` },
      ],
    },
    {
      id: 'uv-continuous', title: 'Continuous distributions', short: 'Continuous distributions', topic: 'continuous', minutes: 12, widget: 'dist',
      body: t`
<p>Four continuous families do most of the work on Exam P.</p>
<div class="tblwrap"><table><thead><tr><th>Distribution</th><th>Density</th><th>Mean</th><th>Variance</th></tr></thead>
<tbody>
<tr><td>Uniform <span class="tex">(a,b)</span></td><td><span class="tex">\frac{1}{b-a},\ a &lt; x &lt; b</span></td><td><span class="tex">\frac{a+b}{2}</span></td><td><span class="tex">\frac{(b-a)^2}{12}</span></td></tr>
<tr><td>Exponential, mean <span class="tex">\theta</span></td><td><span class="tex">\frac{1}{\theta}e^{-x/\theta},\ x>0</span></td><td><span class="tex">\theta</span></td><td><span class="tex">\theta^2</span></td></tr>
<tr><td>Gamma <span class="tex">(\alpha, \theta)</span></td><td><span class="tex">\frac{x^{\alpha-1}e^{-x/\theta}}{\Gamma(\alpha)\theta^{\alpha}},\ x>0</span></td><td><span class="tex">\alpha\theta</span></td><td><span class="tex">\alpha\theta^2</span></td></tr>
<tr><td>Normal <span class="tex">(\mu, \sigma^2)</span></td><td><span class="tex">\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^2/(2\sigma^2)}</span></td><td><span class="tex">\mu</span></td><td><span class="tex">\sigma^2</span></td></tr>
</tbody></table></div>
<p><b>Uniform.</b> Probabilities are proportional to length. Conditioning on an interval gives another uniform: given <span class="tex">X > c</span>, <span class="tex">X</span> is uniform on <span class="tex">(c, b)</span>.</p>
<p><b>Exponential.</b> Waiting times and simple claim sizes. <span class="tex">S(x) = e^{-x/\theta}</span>. Some questions give the rate <span class="tex">\lambda = 1/\theta</span> instead of the mean, so check which one you have. It is <b>memoryless</b>, the continuous twin of the geometric:</p>
<div class="texd">P(X > s + t \mid X > s) = P(X > t) = e^{-t/\theta}</div>
<p>A machine that has run 5 years without failing is, in this model, as good as new.</p>
<p><b>Gamma.</b> The time until the <span class="tex">\alpha</span>-th event in a Poisson process, or the sum of <span class="tex">\alpha</span> independent exponentials with mean <span class="tex">\theta</span>. For whole-number <span class="tex">\alpha</span>, <span class="tex">\Gamma(\alpha) = (\alpha-1)!</span> and the survival function is a Poisson sum: <span class="tex">P(X > x) = e^{-x/\theta}\sum_{k=0}^{\alpha-1}\frac{(x/\theta)^k}{k!}</span>.</p>
<p><b>Normal.</b> Standardize, then use the table: <span class="tex">Z = (X - \mu)/\sigma</span> and <span class="tex">P(X \le x) = \Phi\left(\frac{x-\mu}{\sigma}\right)</span>. Divide by the standard deviation, not the variance. Symmetry gives <span class="tex">\Phi(-z) = 1 - \Phi(z)</span>.</p>
<p><b>Continuity correction.</b> When a normal curve approximates a whole-number count (binomial or Poisson with a large mean), stretch each integer to a unit-wide bar: <span class="tex">P(N \ge 90) \approx P(X > 89.5)</span> and <span class="tex">P(N \le 90) \approx P(X < 90.5)</span>.</p>
<p>Use the explorer below to pick a distribution, drag its parameters and shade <span class="tex">P(a &lt; X &lt; b)</span>. Notice how the exponential's shape never changes, only its scale, and how the gamma becomes more bell-shaped as <span class="tex">\alpha</span> grows.</p>`,
      example: {
        title: 'Worked example: normal approximation with a continuity correction',
        html: t`<p>An insurer writes 400 independent policies, each with a 20% chance of a claim. The number of claims <span class="tex">N</span> is binomial with mean <span class="tex">400(0.2) = 80</span> and variance <span class="tex">400(0.2)(0.8) = 64</span>, so standard deviation 8.</p>
<div class="texd">P(N \ge 90) \approx P\left(Z > \frac{89.5 - 80}{8}\right) = P(Z > 1.1875) \approx 0.1175</div>
<p>Without the correction you would use <span class="tex">z = 1.25</span> and get about 0.1056, a noticeably different answer.</p>`,
      },
      checks: [
        { q: t`A repair takes an exponential time with mean 4 hours. It has already taken 2 hours. Find the probability it takes more than 6 hours in total.`,
          opts: ['0.2231', '0.3679', '0.6065', '0.6321'], correct: 1,
          explain: t`Memoryless: the remaining time is still exponential with mean 4, so <span class="tex">P(X > 6 \mid X > 2) = e^{-4/4} = e^{-1} \approx 0.3679</span>. (0.2231 is <span class="tex">e^{-6/4}</span>, which ignores the 2 hours already passed.)` },
        { q: t`Annual losses are normal with mean 1,000 and standard deviation 200. Find <span class="tex">P(X < 1{,}300)</span>.`,
          opts: ['0.0668', '0.8664', '0.9332', '0.9772'], correct: 2,
          explain: t`<span class="tex">z = (1300 - 1000)/200 = 1.5</span> and <span class="tex">\Phi(1.5) \approx 0.9332</span>. (0.8664 is <span class="tex">P(700 < X < 1300)</span>.)` },
        { q: t`A claim size is gamma with <span class="tex">\alpha = 3</span> and <span class="tex">\theta = 500</span>. Find its standard deviation.`,
          opts: ['288.68', '866.03', '1,500', '750,000'], correct: 1,
          explain: t`<span class="tex">\operatorname{Var}(X) = \alpha\theta^2 = 3(500^2) = 750{,}000</span>, so the standard deviation is <span class="tex">\sqrt{750{,}000} \approx 866.03</span>. (1,500 is the mean.)` },
      ],
    },
    {
      id: 'uv-coverage', title: 'Deductibles, limits and coinsurance', short: 'Insurance coverage', topic: 'coverage', minutes: 12, widget: 'coverage',
      body: t`
<p>Policies rarely pay the full loss <span class="tex">X</span>. Three features change what the insurer pays.</p>
<ul>
  <li><b>Ordinary deductible</b> <span class="tex">d</span>: the policyholder pays the first <span class="tex">d</span> of each loss. The insurer pays <span class="tex">(X - d)_+ = \max(X - d, 0)</span>.</li>
  <li><b>Policy limit</b> <span class="tex">u</span>: the most that counts. The limited loss is <span class="tex">X \wedge u = \min(X, u)</span>. With a deductible, be careful whether <span class="tex">u</span> caps the <i>loss</i> (a maximum covered loss) or the <i>payment</i>.</li>
  <li><b>Coinsurance</b> <span class="tex">\alpha</span>: the insurer pays a share <span class="tex">\alpha</span> (say 80%) of what is left after the deductible and limit.</li>
</ul>
<p>With all three, and <span class="tex">u</span> the maximum covered loss, the payment is</p>
<div class="texd">Y = \alpha\left[(X \wedge u) - (X \wedge d)\right], \qquad E[Y] = \alpha\left(E[X\wedge u] - E[X \wedge d]\right)</div>
<p>The survival-function shortcut makes these expectations quick:</p>
<div class="texd">E[X \wedge u] = \int_0^u S(x)\,dx, \qquad E[(X-d)_+] = E[X] - E[X\wedge d] = \int_d^\infty S(x)\,dx</div>
<p><b>Per loss vs per payment.</b> The expected payment <i>per loss</i> averages over every loss, including the small ones that pay nothing. The expected payment <i>per payment</i> averages only over losses that actually produce a payment:</p>
<div class="texd">E[\text{per payment}] = E[X - d \mid X > d] = \frac{E[(X-d)_+]}{S(d)}</div>
<p>The <b>loss elimination ratio</b> is the share of expected losses the deductible removes: <span class="tex">LER = E[X\wedge d]/E[X]</span>.</p>
<p>For exponential losses with mean <span class="tex">\theta</span>: <span class="tex">E[X\wedge d] = \theta(1 - e^{-d/\theta})</span>, <span class="tex">E[(X-d)_+] = \theta e^{-d/\theta}</span>, and by memorylessness the expected payment per payment is still <span class="tex">\theta</span>.</p>
<p>Use the coverage visual below to drag the deductible, limit and coinsurance and watch how much of the loss distribution the insurer pays.</p>`,
      example: {
        title: 'Worked example: an exponential loss with all three features',
        html: t`<p>Losses are exponential with mean 1,000. A policy has a deductible of 500, a maximum covered loss of 3,000 and 80% coinsurance.</p>
<p>Deductible only, per loss: <span class="tex">1000e^{-0.5} \approx 606.53</span>. Per payment: 1,000 (memoryless). The deductible eliminates <span class="tex">E[X\wedge 500]/E[X] = 1 - e^{-0.5} \approx 39.3\%</span> of expected losses.</p>
<p>Adding the limit and coinsurance:</p>
<div class="texd">E[Y] = 0.8\left(E[X\wedge 3000] - E[X\wedge 500]\right) = 0.8 \cdot 1000\left(e^{-0.5} - e^{-3}\right) \approx 0.8(556.74) \approx 445.39</div>`,
      },
      checks: [
        { q: t`A loss is 0, 500, 2,000 or 5,000 with probabilities 0.5, 0.2, 0.2, 0.1. The deductible is 1,000. Find the expected payment per payment.`,
          opts: ['600', '2,000', '2,500', '3,000'], correct: 1,
          explain: t`Per loss: <span class="tex">0.2(1000) + 0.1(4000) = 600</span>. Only losses above 1,000 pay, with probability 0.3, so per payment <span class="tex">600/0.3 = 2{,}000</span>. (2,500 averages 1,000 and 4,000 without weighting by probability.)` },
        { q: t`Losses are uniform on <span class="tex">(0, 2000)</span> and the deductible is 500. Find the expected payment per loss.`,
          opts: ['437.5', '500', '562.5', '750'], correct: 2,
          explain: t`<span class="tex">E[(X-500)_+] = \int_{500}^{2000} \frac{x - 500}{2000}\,dx = \frac{1500^2}{2 \cdot 2000} = 562.5</span>. (750 is per payment: the payment given <span class="tex">X > 500</span> is uniform on <span class="tex">(0,1500)</span>.)` },
        { q: t`Losses are exponential with mean 2,000 and the deductible is 500. Find the expected payment per payment.`,
          opts: ['1,500', '1,557.60', '2,000', '2,500'], correct: 2,
          explain: t`Memoryless: given <span class="tex">X > 500</span>, the excess <span class="tex">X - 500</span> is exponential with mean 2,000. (1,557.60 is the per-loss value <span class="tex">2000e^{-0.25}</span>, and 1,500 just subtracts the deductible from the mean.)` },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
export const stepIndex = id => STEPS.findIndex(s => s.id === id);
