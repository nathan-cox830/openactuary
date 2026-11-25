// Exam P · Multivariate Random Variables lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers verified in Python.
// Topic keys: joint, condexp, covariance, sums, orderclt. Step ids are prefixed mv- to stay unique across lessons.
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
const t = String.raw;

export const LESSON = {
  id: 'multivariate',
  title: 'Multivariate Random Variables',
  steps: [
    {
      id: 'mv-joint', title: 'Joint distributions: tables and regions', short: 'Joint distributions', topic: 'joint', minutes: 10,
      body: t`
<p>So far each question has been about one random quantity. Real insurance questions usually involve two or more at once: the auto loss and the bodily injury loss from the same accident, the number of claims and their total size, or the times until two policyholders file. A <b>joint distribution</b> describes how the quantities behave <i>together</i>.</p>
<p><b>Discrete case.</b> The joint probability mass function gives the probability of each pair of values:</p>
<div class="texd">p(x,y) = P(X=x,\ Y=y), \qquad \sum_x \sum_y p(x,y) = 1</div>
<p>It is easiest to write as a table, with one row for each value of <span class="tex">X</span> and one column for each value of <span class="tex">Y</span>. To find the probability of any event, add up the cells where the event happens.</p>
<p><b>Continuous case.</b> A joint density <span class="tex">f(x,y) \ge 0</span> integrates to 1 over the plane, and the probability of a region <span class="tex">R</span> is the volume above it:</p>
<div class="texd">P\big((X,Y)\in R\big) = \iint_R f(x,y)\,dA</div>
<p>The <b>joint CDF</b> is <span class="tex">F(x,y) = P(X\le x,\ Y\le y)</span>, the probability of the lower-left quadrant below and to the left of the point <span class="tex">(x,y)</span>.</p>
<p><b>Setting up the double integral</b> is where most exam points are won or lost. Use this routine every time:</p>
<ol>
  <li>Sketch the support (where <span class="tex">f>0</span>) and shade the event, such as <span class="tex">x&lt;y</span> or <span class="tex">x+y&lt;1</span>.</li>
  <li>Choose the outer variable and read off its constant limits from the shaded picture.</li>
  <li>For a fixed value of the outer variable, draw a line across the shaded region; where it enters and leaves are the inner limits, which may depend on the outer variable.</li>
</ol>
<p>For example, if the support is the unit square and the event is <span class="tex">X&lt;Y</span>, then <span class="tex">P(X&lt;Y)=\int_0^1\int_x^1 f(x,y)\,dy\,dx</span>: for each <span class="tex">x</span>, <span class="tex">y</span> runs from the diagonal up to 1.</p>`,
      example: {
        title: 'Worked example: a triangular support',
        html: t`<p>Let <span class="tex">X</span> be the deductible portion and <span class="tex">Y</span> the total loss on a claim (in thousands), with joint density <span class="tex">f(x,y) = 6x</span> for <span class="tex">0&lt;x&lt;y&lt;1</span>. The deductible portion can never exceed the loss, so the support is the triangle above the diagonal.</p>
<p>Check it is a density: <span class="tex">\int_0^1\int_0^y 6x\,dx\,dy = \int_0^1 3y^2\,dy = 1</span>.</p>
<p>Find <span class="tex">P(X+Y&lt;1)</span>. Inside the triangle, <span class="tex">x+y&lt;1</span> means <span class="tex">x&lt;y&lt;1-x</span>, which needs <span class="tex">x&lt;1/2</span>:</p>
<div class="texd">P(X+Y<1) = \int_0^{1/2}\int_x^{1-x} 6x\,dy\,dx = \int_0^{1/2} 6x(1-2x)\,dx = 6\left(\tfrac{1}{8}-\tfrac{1}{12}\right) = \tfrac{1}{4}</div>`,
      },
      checks: [
        { q: t`The number of auto claims <span class="tex">X</span> and home claims <span class="tex">Y</span> for a household have joint PMF <span class="tex">p(0,0)=0.30</span>, <span class="tex">p(0,1)=0.15</span>, <span class="tex">p(0,2)=0.05</span>, <span class="tex">p(1,0)=0.20</span>, <span class="tex">p(1,1)=0.20</span>, <span class="tex">p(1,2)=0.10</span>. Find <span class="tex">P(X \ge Y)</span>.`,
          opts: ['0.20', '0.50', '0.70', '0.80'], correct: 2,
          explain: t`Add the cells where <span class="tex">x \ge y</span>: <span class="tex">p(0,0)+p(1,0)+p(1,1) = 0.30+0.20+0.20 = 0.70</span>. Leaving out the ties gives <span class="tex">P(X>Y) = 0.20</span>.` },
        { q: t`<span class="tex">f(x,y) = k(x+2y)</span> for <span class="tex">0&lt;x&lt;1</span>, <span class="tex">0&lt;y&lt;1</span>. Find <span class="tex">k</span>.`,
          opts: [t`<span class="tex">1/3</span>`, t`<span class="tex">2/3</span>`, t`<span class="tex">1</span>`, t`<span class="tex">3/2</span>`], correct: 1,
          explain: t`<span class="tex">\int_0^1\int_0^1 (x+2y)\,dy\,dx = \tfrac12 + 1 = \tfrac32</span>, so <span class="tex">k = 2/3</span> makes the total volume 1.` },
        { q: t`<span class="tex">X</span> and <span class="tex">Y</span> have a joint density on the unit square <span class="tex">0&lt;x&lt;1,\ 0&lt;y&lt;1</span>. Which integral gives <span class="tex">P(Y > 2X)</span>?`,
          opts: [t`<span class="tex">\int_0^1\int_{2x}^1 f\,dy\,dx</span>`, t`<span class="tex">\int_0^{1/2}\int_{2x}^1 f\,dy\,dx</span>`, t`<span class="tex">\int_0^{1/2}\int_0^{2x} f\,dy\,dx</span>`, t`<span class="tex">\int_0^1\int_0^{y/2} f\,dy\,dx</span>`], correct: 1,
          explain: t`The line <span class="tex">y=2x</span> leaves the square at <span class="tex">x=1/2</span>. For each <span class="tex">x</span> in <span class="tex">(0,1/2)</span>, <span class="tex">y</span> runs from <span class="tex">2x</span> up to 1. The first option lets <span class="tex">x</span> go past <span class="tex">1/2</span>, where the inner range is empty. (The last option has its limits in the wrong order: <span class="tex">\int_0^1\int_0^{y/2} f\,dx\,dy</span> would be correct.)` },
      ],
    },
    {
      id: 'mv-marginal', title: 'Marginal distributions and expectations', short: 'Marginals', topic: 'joint', minutes: 9, widget: 'joint',
      body: t`
<p>A <b>marginal distribution</b> is the distribution of one variable on its own, ignoring the other. You get it by "adding out" the variable you don't want.</p>
<div class="texd">p_X(x) = \sum_y p(x,y) \qquad\qquad f_X(x) = \int_{-\infty}^{\infty} f(x,y)\,dy</div>
<p>In a table, the marginal of <span class="tex">X</span> is the row totals and the marginal of <span class="tex">Y</span> is the column totals, written in the margins (hence the name).</p>
<p><b>Watch the limits.</b> When the support is not a rectangle, the range of the variable you integrate out depends on the one you keep. For <span class="tex">0&lt;x&lt;y&lt;1</span>, the marginal of <span class="tex">X</span> integrates <span class="tex">y</span> from <span class="tex">x</span> to 1, while the marginal of <span class="tex">Y</span> integrates <span class="tex">x</span> from 0 to <span class="tex">y</span>.</p>
<p><b>Expectations of functions.</b> For any function <span class="tex">g</span>, weight <span class="tex">g</span> by the joint distribution; there is no need to find the distribution of <span class="tex">g(X,Y)</span> first:</p>
<div class="texd">E[g(X,Y)] = \sum_x\sum_y g(x,y)\,p(x,y) \qquad E[g(X,Y)] = \iint g(x,y)\,f(x,y)\,dA</div>
<p>Two results hold always, with or without independence: <span class="tex">E[X+Y] = E[X]+E[Y]</span>, and more generally <span class="tex">E[aX+bY+c] = aE[X]+bE[Y]+c</span>. Products are different: <span class="tex">E[XY]</span> equals <span class="tex">E[X]E[Y]</span> only in special cases.</p>
<p>Use the table below to edit the joint probabilities and watch the marginals, conditional distributions, means, variances and covariance update.</p>`,
      example: {
        title: 'Worked example: marginals on a triangle',
        html: t`<p>Return to <span class="tex">f(x,y) = 6x</span> on <span class="tex">0&lt;x&lt;y&lt;1</span>.</p>
<div class="texd">f_X(x) = \int_x^1 6x\,dy = 6x(1-x),\ \ 0\lt x<1 \qquad f_Y(y) = \int_0^y 6x\,dx = 3y^2,\ \ 0\lt y<1</div>
<p>Then <span class="tex">E[X] = \int_0^1 6x^2(1-x)\,dx = 6\left(\tfrac13-\tfrac14\right) = \tfrac12</span> and <span class="tex">E[Y] = \int_0^1 3y^3\,dy = \tfrac34</span>. The average deductible portion is 0.5 and the average loss 0.75 (thousand).</p>`,
      },
      checks: [
        { q: t`Using the household table from the previous step (<span class="tex">p(0,0)=0.30</span>, <span class="tex">p(0,1)=0.15</span>, <span class="tex">p(0,2)=0.05</span>, <span class="tex">p(1,0)=0.20</span>, <span class="tex">p(1,1)=0.20</span>, <span class="tex">p(1,2)=0.10</span>), find <span class="tex">E[Y]</span>.`,
          opts: ['0.35', '0.65', '0.80', '1.00'], correct: 1,
          explain: t`Column totals: <span class="tex">P(Y=0)=0.50</span>, <span class="tex">P(Y=1)=0.35</span>, <span class="tex">P(Y=2)=0.15</span>. So <span class="tex">E[Y] = 0(0.50)+1(0.35)+2(0.15) = 0.65</span>.` },
        { q: t`For <span class="tex">f(x,y)=6x</span> on <span class="tex">0&lt;x&lt;y&lt;1</span>, what is the marginal density of <span class="tex">Y</span>?`,
          opts: [t`<span class="tex">3y^2</span>`, t`<span class="tex">6y(1-y)</span>`, t`<span class="tex">3y</span>`, t`<span class="tex">6y</span>`], correct: 0,
          explain: t`Integrate out <span class="tex">x</span> over its range for fixed <span class="tex">y</span>, which is <span class="tex">0&lt;x&lt;y</span>: <span class="tex">\int_0^y 6x\,dx = 3y^2</span>. Using <span class="tex">x</span> from 0 to 1 instead ignores the triangle.` },
        { q: t`Same household table. Find <span class="tex">E[XY]</span>.`,
          opts: ['0.20', '0.325', '0.40', '0.50'], correct: 2,
          explain: t`Only cells with <span class="tex">x=1</span> and <span class="tex">y \ge 1</span> contribute: <span class="tex">1\cdot1(0.20) + 1\cdot2(0.10) = 0.40</span>. 0.325 is <span class="tex">E[X]E[Y] = 0.5(0.65)</span>, which is not the same thing here.` },
      ],
    },
    {
      id: 'mv-conditional', title: 'Conditional distributions and expectation', short: 'Conditional expectation', topic: 'condexp', minutes: 11,
      body: t`
<p>Knowing the value of one variable changes the distribution of the other. The <b>conditional distribution</b> divides the joint by the marginal of what you know:</p>
<div class="texd">p_{Y\mid X}(y\mid x) = \frac{p(x,y)}{p_X(x)} \qquad f_{Y\mid X}(y\mid x) = \frac{f(x,y)}{f_X(x)}</div>
<p>In a table: pick the row for the known <span class="tex">x</span> and rescale it so it adds to 1. For a density, take the slice of <span class="tex">f</span> at that <span class="tex">x</span> and divide by its area.</p>
<p>The <b>conditional expectation</b> <span class="tex">E[Y\mid X=x]</span> is the mean of that conditional distribution, and <span class="tex">\mathrm{Var}(Y\mid X=x) = E[Y^2\mid X=x] - (E[Y\mid X=x])^2</span>.</p>
<p>Before <span class="tex">X</span> is observed, <span class="tex">E[Y\mid X]</span> is itself a random variable, a function of <span class="tex">X</span>. Two laws tie the pieces together:</p>
<div class="texd">E[Y] = E\big[E[Y\mid X]\big] \qquad\qquad \mathrm{Var}(Y) = E\big[\mathrm{Var}(Y\mid X)\big] + \mathrm{Var}\big(E[Y\mid X]\big)</div>
<p>The <b>law of total variance</b> splits uncertainty into two parts: the average variability <i>within</i> each group, plus the variability <i>between</i> the group means. Insurers see this constantly: a policyholder's claim count varies year to year (within), and policyholders also differ in their underlying risk (between).</p>`,
      example: {
        title: 'Worked example: a two-class portfolio',
        html: t`<p>70% of drivers are low risk with claim count <span class="tex">N\sim\text{Poisson}(1)</span>; 30% are high risk with <span class="tex">N\sim\text{Poisson}(3)</span>. Let <span class="tex">\Lambda</span> be a driver's mean.</p>
<p>Total expectation: <span class="tex">E[N] = 0.7(1)+0.3(3) = 1.6</span>.</p>
<p>Within: for a Poisson the variance equals the mean, so <span class="tex">E[\mathrm{Var}(N\mid\Lambda)] = E[\Lambda] = 1.6</span>.</p>
<p>Between: <span class="tex">\mathrm{Var}(\Lambda) = 0.7(1)^2+0.3(3)^2 - 1.6^2 = 3.4-2.56 = 0.84</span>.</p>
<div class="texd">\mathrm{Var}(N) = 1.6 + 0.84 = 2.44</div>
<p>The mix of risks pushes the variance above the mean of 1.6, which is why real claim counts are often "overdispersed" compared with a single Poisson.</p>`,
      },
      checks: [
        { q: t`Using the household table (<span class="tex">p(0,2)=0.05</span>, <span class="tex">p(1,2)=0.10</span>, other cells as before), find <span class="tex">P(X=1\mid Y=2)</span>.`,
          opts: ['0.10', t`<span class="tex">1/3</span>`, '0.50', t`<span class="tex">2/3</span>`], correct: 3,
          explain: t`<span class="tex">P(Y=2) = 0.05+0.10 = 0.15</span>, so <span class="tex">P(X=1\mid Y=2) = 0.10/0.15 = 2/3</span>. The joint probability 0.10 forgets to divide by <span class="tex">P(Y=2)</span>.` },
        { q: t`A storm's severity factor <span class="tex">Y</span> is uniform on <span class="tex">(0,10)</span>. Given <span class="tex">Y=y</span>, the loss <span class="tex">X</span> is uniform on <span class="tex">(0,y)</span>. Find <span class="tex">\mathrm{Var}(X)</span>.`,
          opts: ['2.083', '2.778', '4.861', '8.333'], correct: 2,
          explain: t`<span class="tex">E[X\mid Y]=Y/2</span> and <span class="tex">\mathrm{Var}(X\mid Y) = Y^2/12</span>. With <span class="tex">E[Y^2] = 100/3</span> and <span class="tex">\mathrm{Var}(Y)=100/12</span>: <span class="tex">E[Y^2/12] = 2.778</span> and <span class="tex">\mathrm{Var}(Y/2) = 2.083</span>. Total: <span class="tex">175/36 \approx 4.861</span>. Each piece alone is only half the story.` },
        { q: t`For <span class="tex">f(x,y)=6x</span> on <span class="tex">0&lt;x&lt;y&lt;1</span>, find <span class="tex">E[X\mid Y=0.6]</span>.`,
          opts: ['0.30', '0.40', '0.50', '0.60'], correct: 1,
          explain: t`<span class="tex">f(x\mid y) = 6x/(3y^2) = 2x/y^2</span> on <span class="tex">0&lt;x&lt;y</span>, so <span class="tex">E[X\mid Y=y] = \int_0^y 2x^2/y^2\,dx = 2y/3</span>. At <span class="tex">y=0.6</span> that is 0.40. Assuming <span class="tex">X</span> is uniform on <span class="tex">(0,0.6)</span> gives 0.30.` },
      ],
    },
    {
      id: 'mv-independence', title: 'Independent random variables', short: 'Independence', topic: 'joint', minutes: 8,
      body: t`
<p><span class="tex">X</span> and <span class="tex">Y</span> are <b>independent</b> when the joint distribution is the product of the marginals everywhere:</p>
<div class="texd">p(x,y) = p_X(x)\,p_Y(y) \quad\text{or}\quad f(x,y) = f_X(x)\,f_Y(y) \quad \text{for all } x,y</div>
<p>Equivalently, every conditional distribution of <span class="tex">Y</span> given <span class="tex">X=x</span> is the same as the marginal of <span class="tex">Y</span>.</p>
<p><b>Quick test for densities.</b> X and Y are independent exactly when (1) the density factors as <span class="tex">g(x)h(y)</span> and (2) the support is a rectangle (possibly infinite). A density like <span class="tex">8xy</span> on <span class="tex">0&lt;x&lt;y&lt;1</span> factors, but the triangle couples the variables: knowing <span class="tex">y</span> limits how big <span class="tex">x</span> can be. Not independent.</p>
<p><b>For a table</b>, a single cell where <span class="tex">p(x,y)\ne p_X(x)p_Y(y)</span> is enough to prove dependence.</p>
<p>What independence buys you:</p>
<ul>
  <li><span class="tex">E[g(X)h(Y)] = E[g(X)]\,E[h(Y)]</span>, in particular <span class="tex">E[XY]=E[X]E[Y]</span>.</li>
  <li><span class="tex">\mathrm{Cov}(X,Y)=0</span>, so <span class="tex">\mathrm{Var}(X+Y) = \mathrm{Var}(X)+\mathrm{Var}(Y)</span>.</li>
  <li>The MGF of a sum is the product of MGFs (next steps).</li>
</ul>
<p>The converse fails: zero covariance does <i>not</i> imply independence. If <span class="tex">X</span> is equally likely to be <span class="tex">-1,0,1</span> and <span class="tex">Y=X^2</span>, the covariance is 0, but <span class="tex">Y</span> is completely determined by <span class="tex">X</span>.</p>`,
      example: {
        title: 'Worked example: which claim comes first?',
        html: t`<p>The times (in years) until the next claim on two independent policies have joint density <span class="tex">f(x,y) = 6e^{-2x-3y}</span> for <span class="tex">x,y>0</span>. It factors as <span class="tex">2e^{-2x}\cdot 3e^{-3y}</span> on a rectangular support, so <span class="tex">X\sim</span> exponential with rate 2 and <span class="tex">Y\sim</span> exponential with rate 3, independent.</p>
<div class="texd">P(X\lt Y) = \int_0^\infty 2e^{-2x}\,P(Y>x)\,dx = \int_0^\infty 2e^{-2x}e^{-3x}\,dx = \frac{2}{5}</div>
<p>In general, for independent exponentials <span class="tex">P(X&lt;Y) = \lambda_X/(\lambda_X+\lambda_Y)</span>: the higher rate tends to win.</p>`,
      },
      checks: [
        { q: 'Which joint density has independent X and Y?',
          opts: [t`<span class="tex">6x</span> on <span class="tex">0&lt;x&lt;y&lt;1</span>`, t`<span class="tex">4xy</span> on <span class="tex">0&lt;x&lt;1,\ 0&lt;y&lt;1</span>`, t`<span class="tex">x+y</span> on <span class="tex">0&lt;x&lt;1,\ 0&lt;y&lt;1</span>`, t`<span class="tex">8xy</span> on <span class="tex">0&lt;x&lt;y&lt;1</span>`], correct: 1,
          explain: t`<span class="tex">4xy = (2x)(2y)</span> factors and the support is a square. <span class="tex">x+y</span> does not factor, and the two triangular supports tie <span class="tex">x</span> to <span class="tex">y</span> even when the formula factors.` },
        { q: t`Times until the next claim on two independent policies are exponential with means 2 and 3 years. What is the probability that the policy with mean 2 claims first?`,
          opts: ['0.40', '0.50', '0.60', t`<span class="tex">2/3</span>`], correct: 2,
          explain: t`Rates are <span class="tex">1/2</span> and <span class="tex">1/3</span>, so <span class="tex">P = \frac{1/2}{1/2+1/3} = 0.6</span>. Using the means instead of the rates, <span class="tex">2/(2+3)=0.4</span>, gets it backwards.` },
        { q: 'Which statement is always true?',
          opts: ['If Cov(X, Y) = 0, then X and Y are independent', 'If X and Y are independent, then Var(X − Y) = Var(X) + Var(Y)', 'If E[XY] = E[X]E[Y], then f(x, y) = f_X(x) f_Y(y)', 'If the joint density factors as g(x)h(y), then X and Y are independent'], correct: 1,
          explain: t`Independence gives zero covariance, so <span class="tex">\mathrm{Var}(X-Y) = \mathrm{Var}(X)+(-1)^2\mathrm{Var}(Y)</span>. Zero covariance (equivalently <span class="tex">E[XY]=E[X]E[Y]</span>) does not imply independence, and a factoring density also needs a rectangular support.` },
      ],
    },
    {
      id: 'mv-covariance', title: 'Covariance and correlation', short: 'Covariance', topic: 'covariance', minutes: 10,
      body: t`
<p><b>Covariance</b> measures whether two variables tend to move together:</p>
<div class="texd">\mathrm{Cov}(X,Y) = E\big[(X-\mu_X)(Y-\mu_Y)\big] = E[XY]-E[X]\,E[Y]</div>
<p>Positive means large values of one tend to come with large values of the other (auto and bodily injury losses in the same crash); negative means they pull in opposite directions. The second formula is the one to compute with.</p>
<p>Covariance is linear in each slot, and constants drop out:</p>
<div class="texd">\mathrm{Cov}(aX+b,\ cY+d) = ac\,\mathrm{Cov}(X,Y) \qquad \mathrm{Cov}(X,\,Y+Z) = \mathrm{Cov}(X,Y)+\mathrm{Cov}(X,Z) \qquad \mathrm{Cov}(X,X) = \mathrm{Var}(X)</div>
<p>The variance of a linear combination needs the covariance term:</p>
<div class="texd">\mathrm{Var}(aX+bY) = a^2\,\mathrm{Var}(X) + b^2\,\mathrm{Var}(Y) + 2ab\,\mathrm{Cov}(X,Y)</div>
<p>Note the sign: for <span class="tex">X-Y</span>, <span class="tex">a=1,\ b=-1</span>, so the variances still add but the covariance term is subtracted.</p>
<p>Covariance depends on units (dollars versus thousands of dollars). The <b>correlation coefficient</b> removes them:</p>
<div class="texd">\rho_{XY} = \frac{\mathrm{Cov}(X,Y)}{\sigma_X\,\sigma_Y}, \qquad -1 \le \rho \le 1</div>
<p><span class="tex">\rho=\pm1</span> exactly when <span class="tex">Y</span> is a linear function of <span class="tex">X</span>. Correlation measures <i>linear</i> association only.</p>`,
      example: {
        title: 'Worked example: two lines of business',
        html: t`<p>Annual auto losses <span class="tex">X</span> have variance 4 and homeowners losses <span class="tex">Y</span> have variance 9 (in millions squared), with <span class="tex">\mathrm{Cov}(X,Y) = 2</span>.</p>
<p>Correlation: <span class="tex">\rho = 2/(2\cdot 3) = 1/3</span>.</p>
<p>Combined book: <span class="tex">\mathrm{Var}(X+Y) = 4+9+2(2) = 17</span>. The difference: <span class="tex">\mathrm{Var}(X-Y) = 4+9-2(2) = 9</span>.</p>
<p>If the lines were independent the combined variance would be 13. Positive correlation adds risk; that is the whole reason insurers worry about catastrophes hitting several lines at once.</p>`,
      },
      checks: [
        { q: t`Using the household table (<span class="tex">E[X]=0.5</span>, <span class="tex">E[Y]=0.65</span>, <span class="tex">E[XY]=0.40</span>), find <span class="tex">\mathrm{Cov}(X,Y)</span>.`,
          opts: ['0', '0.075', '0.325', '0.40'], correct: 1,
          explain: t`<span class="tex">\mathrm{Cov} = E[XY]-E[X]E[Y] = 0.40 - 0.325 = 0.075</span>. Households with an auto claim are a little more likely to have home claims.` },
        { q: t`<span class="tex">\mathrm{Var}(X)=16</span>, <span class="tex">\mathrm{Var}(Y)=25</span> and <span class="tex">\rho=0.3</span>. Find <span class="tex">\mathrm{Var}(2X-Y)</span>.`,
          opts: ['41', '65', '89', '113'], correct: 1,
          explain: t`<span class="tex">\mathrm{Cov} = 0.3(4)(5) = 6</span>. Then <span class="tex">\mathrm{Var}(2X-Y) = 4(16)+25+2(2)(-1)(6) = 64+25-24 = 65</span>. 113 uses a plus sign on the covariance term; 89 ignores it.` },
        { q: t`<span class="tex">\mathrm{Cov}(X,Y)=1.5</span>. Find <span class="tex">\mathrm{Cov}(3X+2,\ 5-Y)</span>.`,
          opts: ['−4.5', '−1.5', '4.5', '7.5'], correct: 0,
          explain: t`Constants drop out and multipliers come out: <span class="tex">\mathrm{Cov}(3X+2,\,-Y+5) = 3(-1)(1.5) = -4.5</span>.` },
      ],
    },
    {
      id: 'mv-sums', title: 'Sums and linear combinations', short: 'Sums', topic: 'sums', minutes: 11,
      body: t`
<p>Aggregate losses are sums, so sums are everywhere in actuarial work. For any random variables,</p>
<div class="texd">E\Big[\sum_i a_iX_i\Big] = \sum_i a_i E[X_i] \qquad \mathrm{Var}\Big(\sum_i a_iX_i\Big) = \sum_i a_i^2\,\mathrm{Var}(X_i) + 2\sum_{i\lt j} a_ia_j\,\mathrm{Cov}(X_i,X_j)</div>
<p>For <span class="tex">n</span> independent, identically distributed (iid) losses with mean <span class="tex">\mu</span> and variance <span class="tex">\sigma^2</span>, the total <span class="tex">S</span> and average <span class="tex">\bar X = S/n</span> satisfy</p>
<div class="texd">E[S]=n\mu,\quad \mathrm{Var}(S)=n\sigma^2 \qquad\qquad E[\bar X]=\mu,\quad \mathrm{Var}(\bar X)=\frac{\sigma^2}{n}</div>
<p>Do not confuse <span class="tex">X_1+X_2+X_3</span> (variance <span class="tex">3\sigma^2</span>) with <span class="tex">3X</span> (variance <span class="tex">9\sigma^2</span>). Three separate policies diversify; one policy tripled does not.</p>
<p><b>The distribution of a sum: use MGFs.</b> For independent variables, <span class="tex">M_{X+Y}(t) = M_X(t)\,M_Y(t)</span>. Multiply the MGFs and recognize the result:</p>
<ul>
  <li>Poisson(<span class="tex">\lambda_1</span>) + Poisson(<span class="tex">\lambda_2</span>) = Poisson(<span class="tex">\lambda_1+\lambda_2</span>).</li>
  <li>Normal(<span class="tex">\mu_1,\sigma_1^2</span>) + Normal(<span class="tex">\mu_2,\sigma_2^2</span>) = Normal(<span class="tex">\mu_1+\mu_2,\ \sigma_1^2+\sigma_2^2</span>). Any linear combination of independent normals is normal.</li>
  <li>Gamma(<span class="tex">\alpha_1,\theta</span>) + Gamma(<span class="tex">\alpha_2,\theta</span>) = Gamma(<span class="tex">\alpha_1+\alpha_2,\theta</span>) when the scales match. A sum of <span class="tex">n</span> iid exponentials with mean <span class="tex">\theta</span> is Gamma(<span class="tex">n,\theta</span>).</li>
  <li>Binomial(<span class="tex">n_1,p</span>) + Binomial(<span class="tex">n_2,p</span>) = Binomial(<span class="tex">n_1+n_2,p</span>) when <span class="tex">p</span> matches.</li>
</ul>
<p>A useful trick for a Gamma with whole-number shape <span class="tex">n</span>: <span class="tex">P(S>s) = P(\text{Poisson}(s/\theta) \le n-1)</span>, since the sum exceeds <span class="tex">s</span> exactly when fewer than <span class="tex">n</span> exponential arrivals happen by time <span class="tex">s</span>.</p>`,
      example: {
        title: 'Worked example: two territories',
        html: t`<p>Claims arrive from two independent territories at Poisson rates 2 and 3 per month. The MGFs are <span class="tex">e^{2(e^t-1)}</span> and <span class="tex">e^{3(e^t-1)}</span>; their product is <span class="tex">e^{5(e^t-1)}</span>, the Poisson(5) MGF. So</p>
<div class="texd">P(\text{4 claims in total}) = \frac{e^{-5}\,5^4}{4!} \approx 0.1755</div>
<p>Separately, if auto losses are Normal(500, <span class="tex">100^2</span>) and home losses Normal(800, <span class="tex">150^2</span>), independent, then the total is Normal(1300, 32,500), standard deviation about 180.3, and <span class="tex">P(T>1500) = 1-\Phi(1.109) \approx 0.134</span>. Add variances, not standard deviations.</p>`,
      },
      checks: [
        { q: t`Two independent territories produce Poisson(2) and Poisson(3) claims per month. What is the probability of exactly 2 claims in total next month?`,
          opts: ['0.0404', '0.0842', '0.1684', '0.2565'], correct: 1,
          explain: t`The total is Poisson(5): <span class="tex">e^{-5}5^2/2! \approx 0.0842</span>. 0.0404 is only the "one from each" case, and 0.1684 forgets the <span class="tex">2!</span>.` },
        { q: t`<span class="tex">X_1, X_2, X_3</span> are iid exponential with mean 2. Find <span class="tex">\mathrm{Var}(X_1+X_2+X_3)</span>.`,
          opts: ['4', '6', '12', '36'], correct: 2,
          explain: t`Each variance is <span class="tex">2^2=4</span>, and independence lets them add: 12. (The sum is Gamma(3, 2), variance <span class="tex">3\cdot 2^2</span>.) 36 is <span class="tex">\mathrm{Var}(3X_1)</span>.` },
        { q: t`Claim sizes are iid with standard deviation 400. What is the standard deviation of the average of 25 claims?`,
          opts: ['16', '80', '400', '2,000'], correct: 1,
          explain: t`<span class="tex">\mathrm{SD}(\bar X) = \sigma/\sqrt n = 400/5 = 80</span>. 16 divides by <span class="tex">n</span> instead of <span class="tex">\sqrt n</span>; 2,000 is the SD of the total.` },
      ],
    },
    {
      id: 'mv-multinomial', title: 'The multinomial distribution', short: 'Multinomial', topic: 'joint', minutes: 6,
      body: t`
<p>The binomial counts successes when each trial has two outcomes. The <b>multinomial distribution</b> handles <span class="tex">k</span> outcomes. Run <span class="tex">n</span> independent trials, each landing in category <span class="tex">i</span> with probability <span class="tex">p_i</span> (with <span class="tex">p_1+\dots+p_k=1</span>), and let <span class="tex">N_i</span> count category <span class="tex">i</span>. Then</p>
<div class="texd">P(N_1=n_1,\dots,N_k=n_k) = \frac{n!}{n_1!\,n_2!\cdots n_k!}\,p_1^{n_1}p_2^{n_2}\cdots p_k^{n_k}, \qquad n_1+\dots+n_k = n</div>
<p>The coefficient counts the orders in which the outcomes can occur; the powers give the probability of each order.</p>
<p>Each count on its own is binomial, <span class="tex">N_i\sim\text{Binomial}(n,p_i)</span>, so <span class="tex">E[N_i]=np_i</span> and <span class="tex">\mathrm{Var}(N_i)=np_i(1-p_i)</span>. The counts are dependent, because they must add to <span class="tex">n</span>: more in one category leaves fewer for the others. That makes the covariance negative:</p>
<div class="texd">\mathrm{Cov}(N_i,N_j) = -n\,p_i\,p_j \quad (i\ne j)</div>`,
      example: {
        title: 'Worked example: claim severity classes',
        html: t`<p>Each claim is minor (60%), moderate (30%) or severe (10%), independently. Of the next 10 claims, the probability of exactly 6 minor, 3 moderate and 1 severe is</p>
<div class="texd">\frac{10!}{6!\,3!\,1!}(0.6)^6(0.3)^3(0.1)^1 = 840(0.046656)(0.027)(0.1) \approx 0.1058</div>
<p>The expected number of severe claims is <span class="tex">10(0.1)=1</span>, and <span class="tex">\mathrm{Cov}(N_\text{minor},N_\text{moderate}) = -10(0.6)(0.3) = -1.8</span>.</p>`,
      },
      checks: [
        { q: t`Each of 5 independent claims is property (50%), liability (30%) or medical (20%). What is the probability of exactly 2 property, 2 liability and 1 medical?`,
          opts: ['0.0045', '0.0225', '0.135', '0.300'], correct: 2,
          explain: t`<span class="tex">\frac{5!}{2!\,2!\,1!} = 30</span> orders, each with probability <span class="tex">0.5^2(0.3)^2(0.2) = 0.0045</span>. Total: <span class="tex">30(0.0045) = 0.135</span>. 0.0045 forgets the coefficient.` },
        { q: t`Same setup with 10 claims. Find <span class="tex">\mathrm{Cov}(N_\text{property}, N_\text{liability})</span>.`,
          opts: ['−1.5', '−0.15', '0', '1.5'], correct: 0,
          explain: t`<span class="tex">-np_1p_2 = -10(0.5)(0.3) = -1.5</span>. The counts compete for the same 10 claims, so the covariance is negative, not 0.` },
      ],
    },
    {
      id: 'mv-order', title: 'Minimum and maximum: order statistics', short: 'Min & max', topic: 'orderclt', minutes: 9,
      body: t`
<p>Many insurance questions ask about the first or last of several events: the first claim among several policies, the last of several components to fail, the largest loss in a year. These are <b>order statistics</b>. For independent <span class="tex">X_1,\dots,X_n</span>, use one trick for each:</p>
<p><b>Minimum.</b> The smallest exceeds <span class="tex">t</span> only if <i>every</i> one does:</p>
<div class="texd">P(\min > t) = P(X_1>t)\,P(X_2>t)\cdots P(X_n>t)</div>
<p><b>Maximum.</b> The largest is at most <span class="tex">t</span> only if every one is:</p>
<div class="texd">P(\max \le t) = F_1(t)\,F_2(t)\cdots F_n(t)</div>
<p>Differentiate to get a density if you need a mean. For iid variables with CDF <span class="tex">F</span> and density <span class="tex">f</span>, the max has density <span class="tex">nF(t)^{n-1}f(t)</span> and the min has density <span class="tex">n(1-F(t))^{n-1}f(t)</span>.</p>
<p><b>Exponential shortcut.</b> The minimum of independent exponentials with rates <span class="tex">\lambda_1,\dots,\lambda_n</span> is exponential with rate <span class="tex">\lambda_1+\dots+\lambda_n</span>, since <span class="tex">\prod e^{-\lambda_i t} = e^{-(\sum\lambda_i)t}</span>. Rates add, means do not.</p>
<p><b>Uniform shortcut.</b> For <span class="tex">n</span> iid Uniform(0,1) variables, <span class="tex">E[\max] = \frac{n}{n+1}</span> and <span class="tex">E[\min]=\frac{1}{n+1}</span>: the <span class="tex">n</span> points split the interval into <span class="tex">n+1</span> pieces of equal average length.</p>`,
      example: {
        title: 'Worked example: the first claim among three policies',
        html: t`<p>Three independent policies have exponential times to first claim with means 2, 4 and 4 years. The rates are <span class="tex">0.5, 0.25, 0.25</span>, so the time <span class="tex">T</span> to the first claim on any of them is exponential with rate 1 (mean 1 year).</p>
<div class="texd">P(T \le 0.5) = 1-e^{-1(0.5)} \approx 0.3935</div>
<p>Averaging the means (3.33 years) or adding them (10 years) both give wrong answers; add the rates.</p>`,
      },
      checks: [
        { q: t`Two independent claims will each be reported at a time uniform on <span class="tex">(0,10)</span> days. What is the probability that both are reported within 6 days?`,
          opts: ['0.16', '0.36', '0.60', '0.84'], correct: 1,
          explain: t`"Both within 6" means the maximum is at most 6: <span class="tex">(0.6)(0.6) = 0.36</span>. 0.84 is the probability that at least one is reported, <span class="tex">1-0.4^2</span>.` },
        { q: 'Five independent machines have exponential lifetimes, each with mean 10 years. What is the expected time until the first failure?',
          opts: ['2', '10', '22.8', '50'], correct: 0,
          explain: t`The minimum is exponential with rate <span class="tex">5(0.1) = 0.5</span>, so its mean is 2 years. 22.8 is the expected time until the <i>last</i> failure, <span class="tex">10(1+\tfrac12+\tfrac13+\tfrac14+\tfrac15)</span>.` },
        { q: t`<span class="tex">X_1,X_2,X_3</span> are iid Uniform(0,1). Find <span class="tex">E[\max(X_1,X_2,X_3)]</span>.`,
          opts: [t`<span class="tex">1/4</span>`, t`<span class="tex">1/2</span>`, t`<span class="tex">2/3</span>`, t`<span class="tex">3/4</span>`], correct: 3,
          explain: t`The max has CDF <span class="tex">t^3</span> and density <span class="tex">3t^2</span>, so <span class="tex">E[\max] = \int_0^1 3t^3\,dt = 3/4</span>. The minimum has mean <span class="tex">1/4</span>.` },
      ],
    },
    {
      id: 'mv-clt', title: 'The central limit theorem', short: 'Central limit theorem', topic: 'orderclt', minutes: 10, widget: 'clt',
      body: t`
<p>Individual claim amounts are rarely normal: they are skewed, with many small claims and a few large ones. Yet the total of many independent claims looks remarkably normal. That is the <b>central limit theorem</b> (CLT).</p>
<p>If <span class="tex">X_1,\dots,X_n</span> are iid with mean <span class="tex">\mu</span> and variance <span class="tex">\sigma^2</span>, then for large <span class="tex">n</span></p>
<div class="texd">S = X_1+\dots+X_n \approx \text{Normal}(n\mu,\ n\sigma^2) \qquad \bar X \approx \text{Normal}\Big(\mu,\ \frac{\sigma^2}{n}\Big)</div>
<p>To use it, standardize and look up <span class="tex">\Phi</span>:</p>
<div class="texd">P(S > s) \approx 1-\Phi\left(\frac{s-n\mu}{\sigma\sqrt n}\right)</div>
<p>The most common mistake is the standard deviation. The total's SD is <span class="tex">\sigma\sqrt n</span> (not <span class="tex">n\sigma</span>), and the average's SD is <span class="tex">\sigma/\sqrt n</span> (not <span class="tex">\sigma</span>).</p>
<p><b>Continuity correction.</b> When <span class="tex">S</span> only takes whole-number values (a claim count), the normal curve spreads each integer over an interval of width 1. Approximate <span class="tex">P(S\le 30)</span> by <span class="tex">P(\text{Normal}\le 30.5)</span> and <span class="tex">P(S\ge 30)</span> by <span class="tex">P(\text{Normal}\ge 29.5)</span>.</p>
<p>The CLT is why insurance works: the total of many independent policies is predictable relative to its size, since the mean grows like <span class="tex">n</span> but the SD only like <span class="tex">\sqrt n</span>. Use the simulator below to add up <span class="tex">n</span> skewed claims many times and watch the histogram of totals settle onto the normal curve as <span class="tex">n</span> grows.</p>`,
      example: {
        title: 'Worked example: will the fund be enough?',
        html: t`<p>Each of 100 independent policies has annual loss with mean 400 and standard deviation 1,000. The insurer holds a fund of 55,000. The total has mean <span class="tex">100(400) = 40{,}000</span> and SD <span class="tex">1{,}000\sqrt{100} = 10{,}000</span>.</p>
<div class="texd">P(S > 55{,}000) \approx 1-\Phi\left(\frac{55{,}000-40{,}000}{10{,}000}\right) = 1-\Phi(1.5) \approx 0.0668</div>
<p>Using SD <span class="tex">100(1{,}000)</span> would give <span class="tex">1-\Phi(0.15) \approx 0.44</span>, wildly overstating the risk of the pooled book.</p>`,
      },
      checks: [
        { q: 'Claim amounts are iid with mean 2,000 and standard deviation 800. Using the normal approximation, what is the probability that the average of 64 claims exceeds 2,200?',
          opts: ['0.0228', '0.0668', '0.4013', '0.9772'], correct: 0,
          explain: t`<span class="tex">\mathrm{SD}(\bar X) = 800/\sqrt{64} = 100</span>, so <span class="tex">z = 200/100 = 2</span> and <span class="tex">1-\Phi(2) \approx 0.0228</span>. 0.4013 uses SD 800 for the average (<span class="tex">z=0.25</span>).` },
        { q: 'An insurer has 400 independent policies, each with mean loss 500 and standard deviation 2,000. Using the normal approximation, what premium per policy makes the probability that total losses exceed total premium equal to 5%?',
          opts: ['500.00', '664.50', '696.00', '3,790.00'], correct: 1,
          explain: t`Total: mean 200,000, SD <span class="tex">2{,}000\sqrt{400} = 40{,}000</span>. The 95th percentile is <span class="tex">200{,}000 + 1.645(40{,}000) = 265{,}800</span>, or 664.50 per policy. 696.00 uses the two-sided 1.96; 3,790 forgets to pool.` },
        { q: t`A claim count <span class="tex">N</span> has mean 25 and variance 25. With a continuity correction, <span class="tex">P(N\le 30)</span> is approximated by:`,
          opts: [t`<span class="tex">\Phi(1.0)</span>`, t`<span class="tex">\Phi(1.1)</span>`, t`<span class="tex">\Phi(0.9)</span>`, t`<span class="tex">\Phi(0.2)</span>`], correct: 1,
          explain: t`<span class="tex">N\le 30</span> becomes Normal <span class="tex">\le 30.5</span>, so <span class="tex">z = (30.5-25)/5 = 1.1</span>. Using 29.5 would cut off the probability at 30 itself; dividing by the variance 25 instead of the SD 5 gives 0.2.` },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
export const stepIndex = id => STEPS.findIndex(s => s.id === id);
