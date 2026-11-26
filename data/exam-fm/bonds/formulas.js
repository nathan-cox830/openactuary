// Exam FM · Bonds and Cash-Flow Analysis formula sheet, grouped by topic id (bond, bookvalue, cashflow, termstruct).
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'bond', title: 'Bond pricing and yields', blurb: 'Prices, yields, trades between coupon dates and callable bonds.',
    items: [
      { name: 'Coupon and modified coupon rate', tex: t`\text{coupon} = Fr, \qquad g = \frac{Fr}{C}`, when: 'Coupons always come from the face value F, even when the redemption value C differs.' },
      { name: 'Basic price formula', tex: t`P = Fr\,a_{\overline{n}|j} + C\,v_j^{\,n}`, when: 'Any bond on a coupon date. Use the yield per coupon period and n coupon periods.' },
      { name: 'Premium/discount formula', tex: t`P = C + (Fr - Cj)\,a_{\overline{n}|j} = C\left[1 + (g - j)a_{\overline{n}|j}\right]`, when: 'Fast pricing, and the size of the premium (g > j) or discount (g < j).' },
      { name: 'Makeham formula (optional)', tex: t`P = K + \frac{g}{j}(C - K), \qquad K = Cv^n`, when: 'An alternative form of the same price; handy when K is already known.' },
      { name: 'Yield to maturity', tex: t`P = Fr\,a_{\overline{n}|j} + C\,v_j^{\,n} \;\text{ solved for } j`, when: 'Price given, yield wanted. Solve numerically (calculator I/Y or IRR).' },
      { name: 'Flat (dirty) price', tex: t`B_t\,(1 + j)^k, \qquad 0 \lt k \lt 1`, when: 'What a buyer pays a fraction k of the way through a coupon period.' },
      { name: 'Market (clean) price', tex: t`\text{Flat price} - k\cdot Fr`, when: 'The quoted price: flat price less the accrued coupon.' },
      { name: 'Callable bond price', tex: t`P = \min_{\text{redemption dates}}\left(Fr\,a_{\overline{m}|j} + C_m v^m\right)`, when: 'Guarantees yield j for any call date. Equal call prices: premium → earliest date, discount → latest.' },
    ],
  },
  {
    id: 'bookvalue', title: 'Premium, discount and book value', blurb: 'The bond amortization schedule.',
    items: [
      { name: 'Book value', tex: t`B_t = Fr\,a_{\overline{n-t}|j} + C\,v^{\,n-t}`, when: 'Value just after the t-th coupon at the original yield: the price of the remaining payments.' },
      { name: 'Interest earned', tex: t`I_t = j\,B_{t-1}`, when: 'Interest portion of the t-th coupon.' },
      { name: 'Principal adjustment', tex: t`PR_t = Fr - I_t = (Fr - Cj)\,v^{\,n-t+1}`, when: 'Write-down of premium (positive) or write-up of discount (negative) in period t.' },
      { name: 'Book value recursion', tex: t`B_t = B_{t-1} - PR_t = B_{t-1}(1+j) - Fr`, when: 'Building the schedule row by row.' },
      { name: 'Total interest over the life', tex: t`\sum I_t = nFr + C - P`, when: 'Everything received minus the price paid.' },
    ],
  },
  {
    id: 'cashflow', title: 'NPV, IRR and fund returns', blurb: 'Evaluating general cash flows and measuring fund performance.',
    items: [
      { name: 'Net present value', tex: t`NPV(i) = \sum_t C_t\,v^t`, when: 'Accept a project when NPV at the required rate is positive.' },
      { name: 'Internal rate of return', tex: t`\sum_t C_t\,v^t = 0`, when: 'The break-even rate. Unique for conventional cash flows; more sign changes can give several IRRs.' },
      { name: 'Dollar-weighted return (simple interest)', tex: t`i \approx \frac{I}{A + \sum_t C_t(1 - t)}, \qquad I = B - A - \sum_t C_t`, when: 'One-year fund return when only start, end and the cash flows are known.' },
      { name: 'Time-weighted return', tex: t`1 + i = \prod_k \frac{B_k}{B_{k-1} + C_{k-1}}`, when: 'Manager performance: needs the fund value just before each cash flow.' },
    ],
  },
  {
    id: 'termstruct', title: 'Spot rates, forward rates and yield curves', blurb: 'Pricing when each maturity has its own rate.',
    items: [
      { name: 'Price with spot rates', tex: t`P = \sum_{t=1}^n \frac{CF_t}{(1 + s_t)^t}`, when: 'Discount each payment at the spot rate for its own date.' },
      { name: 'One-year forward rate', tex: t`1 + f_t = \frac{(1 + s_{t+1})^{t+1}}{(1 + s_t)^t}`, when: 'Rate locked in today for a loan from t to t + 1.' },
      { name: 'Spot from forwards', tex: t`(1 + s_n)^n = (1 + f_0)(1 + f_1)\cdots(1 + f_{n-1})`, when: 'Rolling over forward rates matches the spot rate.' },
      { name: 'Multi-year forward rate', tex: t`(1 + f_{a,b})^{b-a} = \frac{(1 + s_b)^b}{(1 + s_a)^a}`, when: 'Annual rate for a loan from time a to time b.' },
      { name: 'Par yield', tex: t`c_n = \frac{1 - v_n}{v_1 + \cdots + v_n}, \qquad v_t = (1 + s_t)^{-t}`, when: 'Coupon rate at which an n-year annual-coupon bond sells at par.' },
    ],
  },
];
