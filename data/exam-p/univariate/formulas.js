// Exam P · Univariate Random Variables formula sheet, grouped by topic id (rv, moments, discrete, continuous, coverage).
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'rv', title: 'PMFs, PDFs and CDFs', blurb: 'Describing a random variable, finding probabilities, percentiles and transformations.',
    items: [
      { name: 'PMF rules', tex: t`p(x) = P(X = x) \ge 0, \qquad \sum_x p(x) = 1`, when: 'Discrete counts. Use the total of 1 to find an unknown constant.' },
      { name: 'PDF rules', tex: t`P(a < X < b) = \int_a^b f(x)\,dx, \qquad \int_{-\infty}^{\infty} f(x)\,dx = 1`, when: 'Continuous amounts. Probabilities are areas; single points have probability 0.' },
      { name: 'CDF', tex: t`F(x) = P(X \le x), \qquad P(a < X \le b) = F(b) - F(a)`, when: 'Any interval probability. For discrete variables, watch < versus ≤.' },
      { name: 'Density from CDF', tex: t`f(x) = F'(x)`, when: 'You are given a CDF and need the density (or the reverse, by integrating).' },
      { name: 'Survival function', tex: t`S(x) = P(X > x) = 1 - F(x)`, when: '"Exceeds" questions, and the building block for deductibles and limits.' },
      { name: 'Percentile', tex: t`F(\pi_p) = p`, when: 'Medians (p = 0.5), reserves at a confidence level. For discrete variables take the smallest x with F(x) ≥ p.' },
      { name: 'Mode', tex: t`f'(x) = 0 \text{ (or the largest } p(x))`, when: 'The most likely value. Check the endpoints too.' },
      { name: 'Change of variable', tex: t`f_Y(y) = f_X\!\left(g^{-1}(y)\right)\left|\frac{d}{dy}g^{-1}(y)\right|`, when: 'Y = g(X) with g strictly increasing or decreasing. Otherwise use the CDF method.' },
      { name: 'CDF method', tex: t`F_Y(y) = P(g(X) \le y)`, when: 'Any transformation. Rewrite the event in terms of X, then use F_X.' },
    ],
  },
  {
    id: 'moments', title: 'Expectation, variance and MGFs', blurb: 'Centers, spreads and the function that generates them.',
    items: [
      { name: 'Expected value', tex: t`E[X] = \sum_x x\,p(x) \quad\text{or}\quad \int x\,f(x)\,dx`, when: 'The long-run average loss or count.' },
      { name: 'LOTUS', tex: t`E[g(X)] = \sum_x g(x)\,p(x) \quad\text{or}\quad \int g(x)\,f(x)\,dx`, when: 'Mean of a function (payments, present values, X²) without finding its distribution.' },
      { name: 'Survival-function shortcut', tex: t`E[X] = \int_0^{\infty} S(x)\,dx, \qquad E[N] = \sum_{k \ge 0} P(N > k)`, when: 'Non-negative losses or counts. Often faster than integrating x f(x).' },
      { name: 'Linearity', tex: t`E[aX + b] = aE[X] + b`, when: 'Inflation, currency conversion, expense loads.' },
      { name: 'Variance', tex: t`\operatorname{Var}(X) = E[X^2] - (E[X])^2`, when: 'Almost every variance question: find both moments, then subtract.' },
      { name: 'Linear change', tex: t`\operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)`, when: 'Scaling multiplies the variance by a²; shifting does nothing.' },
      { name: 'Coefficient of variation', tex: t`CV = \frac{\sigma}{\mu}`, when: 'Comparing riskiness of losses on different scales.' },
      { name: 'MGF', tex: t`M_X(t) = E\left[e^{tX}\right], \qquad M_X^{(k)}(0) = E[X^k]`, when: 'Moments by differentiation; identifying a distribution by its MGF.' },
      { name: 'MGF of a linear change', tex: t`M_{aX+b}(t) = e^{bt}M_X(at)`, when: 'Inflating or shifting a variable with a known MGF.' },
    ],
  },
  {
    id: 'discrete', title: 'Discrete distributions', blurb: 'Counting claims, trials and samples.',
    items: [
      { name: 'Binomial', tex: t`\binom{n}{x}p^x(1-p)^{n-x}, \quad E = np, \quad \operatorname{Var} = np(1-p)`, when: 'Number of claims among n independent policies with the same p.' },
      { name: 'Geometric (trials)', tex: t`(1-p)^{x-1}p, \ x = 1,2,\dots \quad E = \frac{1}{p}, \quad \operatorname{Var} = \frac{1-p}{p^2}`, when: 'Trials until the first success. Counting failures instead: (1−p)^x p, mean (1−p)/p.' },
      { name: 'Geometric memoryless', tex: t`P(X > k + j \mid X > k) = (1-p)^j`, when: 'Past failures do not change the future.' },
      { name: 'Negative binomial (trials)', tex: t`\binom{x-1}{r-1}p^r(1-p)^{x-r}, \quad E = \frac{r}{p}, \quad \operatorname{Var} = \frac{r(1-p)}{p^2}`, when: 'Trial number of the r-th success. The last trial must be a success.' },
      { name: 'Hypergeometric', tex: t`\frac{\binom{K}{x}\binom{N-K}{n-x}}{\binom{N}{n}}, \quad E = \frac{nK}{N}`, when: 'Sampling without replacement: audits, fraud reviews.' },
      { name: 'Poisson', tex: t`e^{-\lambda}\frac{\lambda^x}{x!}, \quad E = \operatorname{Var} = \lambda`, when: 'Claim counts over a period. The mean scales with the length of the period.' },
      { name: 'Discrete uniform', tex: t`\frac{1}{b-a+1}, \quad E = \frac{a+b}{2}, \quad \operatorname{Var} = \frac{(b-a+1)^2 - 1}{12}`, when: 'Equally likely whole numbers from a to b.' },
      { name: 'Common MGFs', tex: t`\text{Bin: } (1-p+pe^t)^n \qquad \text{Pois: } e^{\lambda(e^t - 1)}`, when: 'Recognizing a binomial or Poisson from its MGF.' },
    ],
  },
  {
    id: 'continuous', title: 'Continuous distributions', blurb: 'Uniform, exponential, gamma and normal.',
    items: [
      { name: 'Uniform (a, b)', tex: t`f(x) = \frac{1}{b-a}, \quad E = \frac{a+b}{2}, \quad \operatorname{Var} = \frac{(b-a)^2}{12}`, when: 'Every value in an interval equally likely. Probabilities are proportional to length.' },
      { name: 'Exponential (mean θ)', tex: t`f(x) = \tfrac{1}{\theta}e^{-x/\theta}, \quad S(x) = e^{-x/\theta}, \quad E = \theta, \quad \operatorname{Var} = \theta^2`, when: 'Waiting times and simple claim sizes. Rate λ = 1/θ.' },
      { name: 'Exponential memoryless', tex: t`P(X > s + t \mid X > s) = e^{-t/\theta}`, when: '"Has already lasted s" questions. The past does not matter.' },
      { name: 'Exponential percentile', tex: t`\pi_p = -\theta\ln(1-p), \qquad \text{median} = \theta\ln 2`, when: 'Percentiles and medians of exponential losses.' },
      { name: 'Gamma (α, θ)', tex: t`f(x) = \frac{x^{\alpha-1}e^{-x/\theta}}{\Gamma(\alpha)\theta^\alpha}, \quad E = \alpha\theta, \quad \operatorname{Var} = \alpha\theta^2, \quad M(t) = (1-\theta t)^{-\alpha}`, when: 'Sum of α exponentials; time to the α-th event. Exponential MGF is the α = 1 case.' },
      { name: 'Gamma survival (whole α)', tex: t`P(X > x) = e^{-x/\theta}\sum_{k=0}^{\alpha-1}\frac{(x/\theta)^k}{k!}`, when: 'Fewer than α Poisson events by time x.' },
      { name: 'Standardizing a normal', tex: t`P(X \le x) = \Phi\!\left(\frac{x - \mu}{\sigma}\right), \qquad \Phi(-z) = 1 - \Phi(z)`, when: 'Any normal probability. Divide by σ, not σ².' },
      { name: 'Normal MGF', tex: t`M(t) = e^{\mu t + \sigma^2 t^2/2}`, when: 'Recognizing a normal from its MGF.' },
      { name: 'Continuity correction', tex: t`P(N \ge k) \approx P\left(Z > \frac{k - 0.5 - \mu}{\sigma}\right)`, when: 'Approximating a whole-number count by a normal. Use k + 0.5 for P(N ≤ k).' },
    ],
  },
  {
    id: 'coverage', title: 'Deductibles, limits and coinsurance', blurb: 'What the insurer actually pays.',
    items: [
      { name: 'Limited loss', tex: t`E[X \wedge u] = \int_0^u S(x)\,dx`, when: 'Expected loss capped at u (policy limit or maximum covered loss).' },
      { name: 'Payment per loss (deductible)', tex: t`E[(X-d)_+] = E[X] - E[X\wedge d] = \int_d^{\infty} S(x)\,dx`, when: 'Average payment counting the losses that pay nothing.' },
      { name: 'Payment per payment', tex: t`E[X - d \mid X > d] = \frac{E[(X-d)_+]}{S(d)}`, when: 'Average over only the losses that produce a payment.' },
      { name: 'Deductible, limit and coinsurance', tex: t`E[Y] = \alpha\left(E[X\wedge u] - E[X\wedge d]\right)`, when: 'u is the maximum covered loss and α the coinsurance share.' },
      { name: 'Loss elimination ratio', tex: t`LER = \frac{E[X\wedge d]}{E[X]}`, when: 'Share of expected loss dollars removed by a deductible.' },
      { name: 'Exponential shortcuts', tex: t`E[X\wedge d] = \theta(1 - e^{-d/\theta}), \qquad E[(X-d)_+] = \theta e^{-d/\theta}`, when: 'Exponential losses. Per payment with only a deductible is just θ.' },
    ],
  },
];
