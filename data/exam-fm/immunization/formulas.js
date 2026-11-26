// Exam FM · Duration, Immunization and Swaps formula sheet, grouped by topic id (duration, immunize, swap).
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'duration', title: 'Duration and convexity', blurb: 'How sensitive a present value is to the interest rate, to first and second order.',
    items: [
      { name: 'Macaulay duration', tex: t`D_{\text{mac}} = \frac{\sum_t t\,v^t C_t}{\sum_t v^t C_t}`, when: 'Present-value-weighted average time of payment. Equals n for an n-year zero-coupon bond.' },
      { name: 'Modified duration', tex: t`D_{\text{mod}} = -\frac{P'(i)}{P(i)} = \frac{D_{\text{mac}}}{1+i}`, when: 'Approximate percent price change per unit change in the effective rate i.' },
      { name: 'Duration in terms of δ', tex: t`-\frac{P'(\delta)}{P(\delta)} = D_{\text{mac}}`, when: 'Sensitivity to the force of interest is the Macaulay duration.' },
      { name: 'Level perpetuity-immediate', tex: t`D_{\text{mac}} = \frac{1+i}{i}, \qquad D_{\text{mod}} = \frac{1}{i}`, when: 'Quick closed forms; a level perpetuity-due has Macaulay duration 1/i.' },
      { name: 'Portfolio duration', tex: t`D = \sum_k \frac{P_k}{P}\,D_k`, when: 'Weight by market value; all holdings valued at the same rate. Works for Macaulay or modified.' },
      { name: 'First-order (modified) approximation', tex: t`P(i) \approx P(i_0)\left[1 - (i - i_0)D_{\text{mod}}\right]`, when: 'Tangent-line estimate of a new price. Understates the true price for ordinary bonds.' },
      { name: 'First-order Macaulay approximation', tex: t`P(i) \approx P(i_0)\left(\frac{1+i_0}{1+i}\right)^{D_{\text{mac}}}`, when: 'Treats the asset as one payment at time D; exact for a zero-coupon bond.' },
      { name: 'Modified convexity', tex: t`C_{\text{mod}} = \frac{P''(i)}{P(i)} = \frac{\sum_t t(t+1)C_t(1+i)^{-t-2}}{P(i)}`, when: 'Curvature of the price curve. Zero-coupon: n(n+1)/(1+i)².' },
      { name: 'Macaulay convexity', tex: t`C_{\text{mac}} = \frac{P''(\delta)}{P(\delta)} = \frac{\sum_t t^2 v^t C_t}{P}`, when: 'PV-weighted average of t². Zero-coupon: n².' },
      { name: 'Converting convexities', tex: t`C_{\text{mod}} = \frac{C_{\text{mac}} + D_{\text{mac}}}{(1+i)^2}`, when: 'Move between the two convexity measures.' },
      { name: 'Second-order approximation', tex: t`\frac{\Delta P}{P} \approx -(\Delta i)D_{\text{mod}} + \frac{(\Delta i)^2}{2}C_{\text{mod}}`, when: 'Adds curvature to the duration estimate; the convexity term is always positive.' },
    ],
  },
  {
    id: 'immunize', title: 'Immunization and cash-flow matching', blurb: 'Arranging assets so rate changes cannot create a loss.',
    items: [
      { name: 'Surplus', tex: t`S(i) = P_A(i) - P_L(i)`, when: 'The quantity immunization protects.' },
      { name: 'Redington conditions', tex: t`P_A = P_L, \qquad D_A = D_L, \qquad C_A > C_L`, when: 'Protection against small parallel shifts: the surplus is a local minimum at zero.' },
      { name: 'Duration-matching split', tex: t`w\,a + (1-w)\,b = D_L`, when: 'Share w of the money in a zero maturing at a, the rest at b. Solve for w.' },
      { name: 'Full immunization (single liability)', tex: t`A(1+i)^{a} = \frac{b}{a+b}L, \qquad B(1+i)^{-b} = \frac{a}{a+b}L`, when: 'Liability L at t; zeros A at t − a and B at t + b. Surplus ≥ 0 for any parallel shift.' },
      { name: 'Exact matching (backward)', tex: t`F_n(1 + r_n) = L_n`, when: 'Start at the last liability; subtract each bond\'s coupons from earlier liabilities and repeat.' },
    ],
  },
  {
    id: 'swap', title: 'Interest rate swaps', blurb: 'Pricing, settling and valuing fixed-for-floating swaps.',
    items: [
      { name: 'Zero-coupon prices and forwards', tex: t`P_k = (1+s_k)^{-k}, \qquad f_k = \frac{P_{k-1}}{P_k} - 1`, when: 'Building blocks for every swap calculation.' },
      { name: 'Swap rate', tex: t`R = \frac{1 - P_n}{\sum_{k=1}^n P_k} = \frac{\sum P_k f_k}{\sum P_k}`, when: 'Level notional, settlements at times 1 to n. Also the n-year par coupon rate.' },
      { name: 'Deferred swap rate', tex: t`R = \frac{P_m - P_n}{\sum_{k=m+1}^n P_k}`, when: 'Settlements only at times m + 1 to n.' },
      { name: 'Varying notional', tex: t`R = \frac{\sum N_k P_k f_k}{\sum N_k P_k} = \frac{\sum N_k (P_{k-1} - P_k)}{\sum N_k P_k}`, when: 'Amortizing or growing notional amounts.' },
      { name: 'Net settlement', tex: t`\text{payer pays } N(R - r_k)`, when: 'Negative means the payer receives. Notional is never exchanged.' },
      { name: 'Market value to the payer', tex: t`V = N\left[(1 - P'_n) - R\sum P'_k\right] = N(R' - R)\sum P'_k`, when: 'After rates change, using new prices for the remaining settlements. The receiver\'s value is −V.' },
    ],
  },
];
