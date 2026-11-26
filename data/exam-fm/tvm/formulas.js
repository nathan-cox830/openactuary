// Exam FM · Interest and the Time Value of Money formula sheet, grouped by topic id (interest, force, equiv, realrates).
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'interest', title: 'Interest and discount rates', blurb: 'Accumulation, present value, and converting between every way of quoting a rate.',
    items: [
      { name: 'Amount function', tex: t`A(t) = A(0)\,a(t), \qquad a(0) = 1`, when: 'Any deposit: scale the accumulation function by the amount invested.' },
      { name: 'Simple interest', tex: t`a(t) = 1 + it`, when: 'Only when the problem says simple interest. Grows in a straight line.' },
      { name: 'Compound interest', tex: t`a(t) = (1+i)^t`, when: 'The default on Exam FM, including fractional periods.' },
      { name: 'Effective rate in period n', tex: t`i_n = \frac{a(n) - a(n-1)}{a(n-1)}`, when: 'Growth during one period measured against the starting balance.' },
      { name: 'Effective discount in period n', tex: t`d_n = \frac{a(n) - a(n-1)}{a(n)}`, when: 'The same growth measured against the ending balance.' },
      { name: 'Discount factor', tex: t`v = \frac{1}{1+i}, \qquad \text{PV} = K v^n`, when: 'Present value of a payment K due in n years.' },
      { name: 'Interest–discount identities', tex: t`d = \frac{i}{1+i} = iv = 1 - v, \qquad i = \frac{d}{1-d}, \qquad i - d = id`, when: 'Converting between effective interest and effective discount.' },
      { name: 'Nominal interest', tex: t`\left(1 + \frac{i^{(m)}}{m}\right)^m = 1 + i`, when: 'A rate quoted "convertible m times a year". The per-period rate is i^(m)/m.' },
      { name: 'Nominal discount', tex: t`\left(1 - \frac{d^{(p)}}{p}\right)^p = 1 - d = v`, when: 'A discount rate quoted "convertible p times a year".' },
      { name: 'Universal conversion', tex: t`\left(1 + \frac{i^{(m)}}{m}\right)^m = 1 + i = (1-d)^{-1} = \left(1 - \frac{d^{(p)}}{p}\right)^{-p} = e^{\delta}`, when: 'Any rate to any other: set one year of growth equal both ways.' },
    ],
  },
  {
    id: 'force', title: 'Force of interest', blurb: 'Continuous growth rates, constant or changing over time.',
    items: [
      { name: 'Definition', tex: t`\delta_t = \frac{a'(t)}{a(t)} = \frac{d}{dt}\ln a(t)`, when: 'Finding the force from a given accumulation function.' },
      { name: 'Constant force', tex: t`a(t) = e^{\delta t}, \qquad \delta = \ln(1+i), \qquad v = e^{-\delta}`, when: 'Continuous compounding at a fixed rate.' },
      { name: 'Ordering of rates', tex: t`d \lt d^{(m)} \lt \delta \lt i^{(m)} \lt i \quad (m > 1,\ i > 0)`, when: 'Sanity-checking a conversion, or eliminating answer choices.' },
      { name: 'Varying force', tex: t`\frac{a(t_2)}{a(t_1)} = \exp\!\left(\int_{t_1}^{t_2} \delta_s\,ds\right)`, when: 'Any force that changes with time. Discount with the reciprocal.' },
      { name: 'Reciprocal force', tex: t`\delta_t = \frac{k}{c+t} \;\Rightarrow\; \frac{a(t_2)}{a(t_1)} = \left(\frac{c+t_2}{c+t_1}\right)^k`, when: 'The log integral cancels the exponential. k = 1 is simple interest at 1/c.' },
      { name: 'Rational force', tex: t`\int_0^n \frac{t}{a+bt}\,dt = \frac{n}{b} - \frac{a}{b^2}\ln\frac{a+bn}{a}`, when: 'Forces like t/(a + bt): split into 1/b minus (a/b)/(a + bt) first.' },
      { name: 'Simple interest force', tex: t`\delta_t = \frac{i}{1+it}`, when: 'Under simple interest the force falls over time.' },
    ],
  },
  {
    id: 'equiv', title: 'Equations of value', blurb: 'Comparing cash flows at different times, and solving for an unknown time or rate.',
    items: [
      { name: 'Moving a payment', tex: t`\text{value at } T = X(1+i)^{T-t}`, when: 'Accumulates a payment made before T and discounts one made after.' },
      { name: 'Equation of value', tex: t`\sum_k X_k (1+i)^{T - t_k} = \sum_j Y_j (1+i)^{T - t_j}`, when: 'Inflows equal outflows at one focal date. Under compound interest any focal date works.' },
      { name: 'Unknown time', tex: t`n = \frac{\ln(K/P)}{\ln(1+i)}`, when: 'How long until P grows to K.' },
      { name: 'Unknown rate (one deposit)', tex: t`i = \left(\frac{K}{P}\right)^{1/n} - 1`, when: 'One deposit and one balance. With several payments, try a quadratic substitution or the calculator.' },
      { name: 'Rule of 72', tex: t`n_{\text{double}} \approx \frac{72}{100\,i}`, when: 'Mental estimate of doubling time, for checking answers.' },
      { name: 'Method of equated time', tex: t`\bar t = \frac{\sum X_k t_k}{\sum X_k}`, when: 'Quick approximation for the time of a single equivalent payment. It slightly overstates the exact time.' },
    ],
  },
  {
    id: 'realrates', title: 'Inflation and interest rate determinants', blurb: 'Real versus nominal returns, and what goes into a quoted rate.',
    items: [
      { name: 'Fisher equation', tex: t`1 + i = (1 + r)(1 + \pi)`, when: 'Linking the nominal rate i, real rate r and inflation π.' },
      { name: 'Exact real rate', tex: t`r = \frac{i - \pi}{1 + \pi} \approx i - \pi`, when: 'Use the exact form for calculations; the approximation is for intuition.' },
      { name: 'Valuing an inflating cost', tex: t`\text{PV} = C\left(\frac{1+\pi}{1+i}\right)^n = \frac{C}{(1+r)^n}`, when: "A cost C in today's prices paid in n years. Nominal cash flows with nominal rates, or real with real." },
      { name: 'Building-block rate', tex: t`\text{rate} \approx r^* + IP + DRP + LP + MRP`, when: 'Explaining why yields differ: real risk-free, inflation, default, liquidity and maturity premiums.' },
      { name: 'Nominal risk-free rate', tex: t`r_{RF} \approx r^* + IP`, when: 'Roughly a short-term Treasury bill yield.' },
    ],
  },
];
