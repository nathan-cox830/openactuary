// Exam P · Multivariate Random Variables formula sheet, grouped by topic id.
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'joint', title: 'Joint and marginal distributions', blurb: 'Two or more random variables described together.',
    items: [
      { name: 'Joint PMF', tex: t`p(x,y) = P(X=x,\,Y=y), \qquad \sum_x\sum_y p(x,y) = 1`, when: 'Discrete pairs, usually given as a table. Add the cells where the event happens.' },
      { name: 'Probability of a region', tex: t`P\big((X,Y)\in R\big) = \iint_R f(x,y)\,dA`, when: 'Continuous pairs. Sketch the support and the event, then set the limits from the picture.' },
      { name: 'Joint CDF', tex: t`F(x,y) = P(X\le x,\ Y\le y)`, when: 'Both variables at or below given values (the lower-left quadrant).' },
      { name: 'Marginals', tex: t`p_X(x) = \sum_y p(x,y) \qquad f_X(x) = \int f(x,y)\,dy`, when: 'The distribution of one variable alone: row or column totals, or integrate the other variable out over its range for that x.' },
      { name: 'Expectation of a function', tex: t`E[g(X,Y)] = \iint g(x,y)\,f(x,y)\,dA`, when: 'E[XY], E[X+Y], E[max(X,Y)] and the like, straight from the joint distribution.' },
      { name: 'Independence', tex: t`f(x,y) = f_X(x)\,f_Y(y) \text{ for all } x,y`, when: 'Check every cell of a table, or for a density: it factors AND the support is a rectangle.' },
      { name: 'Multinomial', tex: t`P(N_1=n_1,\dots,N_k=n_k) = \frac{n!}{n_1!\cdots n_k!}\,p_1^{n_1}\cdots p_k^{n_k}`, when: 'n independent trials, each falling into one of k categories (claim types, severity classes).' },
      { name: 'Multinomial moments', tex: t`E[N_i] = np_i,\quad \mathrm{Var}(N_i) = np_i(1-p_i),\quad \mathrm{Cov}(N_i,N_j) = -np_ip_j`, when: 'Counts that share a fixed total are negatively correlated.' },
    ],
  },
  {
    id: 'condexp', title: 'Conditional distributions and expectation', blurb: 'What one variable tells you about the other.',
    items: [
      { name: 'Conditional distribution', tex: t`f_{Y\mid X}(y\mid x) = \frac{f(x,y)}{f_X(x)}`, when: '"Given X = x". Take that row or slice of the joint and rescale it to total 1.' },
      { name: 'Conditional variance', tex: t`\mathrm{Var}(Y\mid X=x) = E[Y^2\mid X=x] - \big(E[Y\mid X=x]\big)^2`, when: 'Spread of Y once X is known.' },
      { name: 'Law of total expectation', tex: t`E[Y] = E\big[E[Y\mid X]\big]`, when: 'Y is easy to describe once you know a risk class, parameter or earlier outcome.' },
      { name: 'Law of total variance', tex: t`\mathrm{Var}(Y) = E\big[\mathrm{Var}(Y\mid X)\big] + \mathrm{Var}\big(E[Y\mid X]\big)`, when: 'Mixtures: Poisson with a random mean, losses with a random severity parameter. Within plus between.' },
    ],
  },
  {
    id: 'covariance', title: 'Covariance and correlation', blurb: 'How two variables move together.',
    items: [
      { name: 'Covariance', tex: t`\mathrm{Cov}(X,Y) = E[XY] - E[X]\,E[Y]`, when: 'The computing formula. Independent implies 0, but 0 does not imply independent.' },
      { name: 'Covariance rules', tex: t`\mathrm{Cov}(aX+b,\,cY+d) = ac\,\mathrm{Cov}(X,Y), \quad \mathrm{Cov}(X,X) = \mathrm{Var}(X)`, when: 'Rescaling or shifting variables. Constants drop out, multipliers come out.' },
      { name: 'Bilinearity', tex: t`\mathrm{Cov}(X,\,Y+Z) = \mathrm{Cov}(X,Y) + \mathrm{Cov}(X,Z)`, when: 'Covariance of a variable with a sum or total.' },
      { name: 'Correlation coefficient', tex: t`\rho = \frac{\mathrm{Cov}(X,Y)}{\sigma_X\,\sigma_Y}, \qquad -1\le\rho\le 1`, when: 'Unit-free strength of linear association. Recover Cov = ρσσ when ρ is given.' },
      { name: 'Variance of a linear combination', tex: t`\mathrm{Var}(aX+bY) = a^2\mathrm{Var}(X) + b^2\mathrm{Var}(Y) + 2ab\,\mathrm{Cov}(X,Y)`, when: 'Combined books, differences, portfolios. For X − Y the covariance term is subtracted.' },
    ],
  },
  {
    id: 'sums', title: 'Sums and linear combinations', blurb: 'Aggregate losses and the distribution of a total.',
    items: [
      { name: 'Mean of a sum', tex: t`E\Big[\sum a_iX_i\Big] = \sum a_i E[X_i]`, when: 'Always true, independent or not.' },
      { name: 'Variance of a sum', tex: t`\mathrm{Var}\Big(\sum X_i\Big) = \sum \mathrm{Var}(X_i) + 2\sum_{i\lt j}\mathrm{Cov}(X_i,X_j)`, when: 'Several dependent losses. Drop the covariances when independent.' },
      { name: 'iid total and average', tex: t`E[S]=n\mu,\ \ \mathrm{Var}(S)=n\sigma^2, \qquad E[\bar X]=\mu,\ \ \mathrm{Var}(\bar X)=\sigma^2/n`, when: 'n independent copies. Not the same as nX, whose variance is n²σ².' },
      { name: 'MGF of an independent sum', tex: t`M_{X+Y}(t) = M_X(t)\,M_Y(t)`, when: 'Finding the distribution of a sum: multiply the MGFs and recognize the result.' },
      { name: 'Poisson sums', tex: t`\text{Poisson}(\lambda_1) + \text{Poisson}(\lambda_2) = \text{Poisson}(\lambda_1+\lambda_2)`, when: 'Independent claim counts from several sources or periods.' },
      { name: 'Normal sums', tex: t`aX+bY \sim N\big(a\mu_X+b\mu_Y,\ a^2\sigma_X^2+b^2\sigma_Y^2\big)`, when: 'Independent normals: any linear combination is normal. Add variances, not SDs.' },
      { name: 'Gamma sums', tex: t`\text{Gamma}(\alpha_1,\theta)+\text{Gamma}(\alpha_2,\theta) = \text{Gamma}(\alpha_1+\alpha_2,\theta)`, when: 'Same scale θ. A sum of n iid exponentials with mean θ is Gamma(n, θ).' },
      { name: 'Gamma tail via Poisson', tex: t`P\big(\text{Gamma}(n,\theta) > s\big) = \sum_{k=0}^{n-1} \frac{e^{-s/\theta}(s/\theta)^k}{k!}`, when: 'Whole-number shape: the n-th arrival comes after s exactly when fewer than n arrive by s.' },
    ],
  },
  {
    id: 'orderclt', title: 'Order statistics and the CLT', blurb: 'First and last events, and totals of many claims.',
    items: [
      { name: 'Minimum of independent variables', tex: t`P(\min > t) = \prod_i P(X_i > t)`, when: 'First claim, first failure, earliest of several events.' },
      { name: 'Maximum of independent variables', tex: t`P(\max \le t) = \prod_i F_i(t)`, when: 'Last event, all settled, largest loss.' },
      { name: 'Densities of iid min and max', tex: t`f_{\max}(t) = nF(t)^{n-1}f(t) \qquad f_{\min}(t) = n\big(1-F(t)\big)^{n-1}f(t)`, when: 'You need the mean or another moment of the min or max.' },
      { name: 'Minimum of exponentials', tex: t`\min(X_1,\dots,X_n) \sim \text{Exponential}(\lambda_1+\dots+\lambda_n)`, when: 'Independent exponentials: rates add (means do not).' },
      { name: 'Which exponential is first', tex: t`P(X_1 < X_2) = \frac{\lambda_1}{\lambda_1+\lambda_2}`, when: 'Two independent exponential waiting times.' },
      { name: 'Uniform order statistics', tex: t`E[\max] = \frac{n}{n+1}, \qquad E[\min] = \frac{1}{n+1}`, when: 'n iid Uniform(0,1). Scale by the interval length for Uniform(0, b).' },
      { name: 'Central limit theorem', tex: t`S \approx N(n\mu,\ n\sigma^2), \qquad P(S>s) \approx 1-\Phi\!\left(\frac{s-n\mu}{\sigma\sqrt n}\right)`, when: 'Total or average of many iid claims. SD of the total is σ√n; of the average, σ/√n.' },
      { name: 'Continuity correction', tex: t`P(S\le k) \approx \Phi\!\left(\frac{k+0.5-n\mu}{\sigma\sqrt n}\right)`, when: 'Integer-valued totals such as claim counts. Use k − 0.5 for P(S ≥ k).' },
    ],
  },
];
