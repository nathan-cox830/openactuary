// Exam FM · Bonds and Cash-Flow Analysis practice quiz: 15 original multiple-choice questions (A–E).
// Each: { id, topic (bond|bookvalue|cashflow|termstruct), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python (explicit cash-flow lists, numerical root finding) before publishing.
const t = String.raw;

export const QUESTIONS = [
  /* ---------- bond: pricing, yields and calls ---------- */
  {
    id: 'fm-bd-q1', topic: 'bond', diff: 1,
    q: t`A 10-year bond with face value 1,000 pays annual coupons at a coupon rate of 6% and is redeemable at par. Calculate its price at an annual effective yield of 5%.`,
    choices: ['613.91', '926.40', '1,000.00', '1,073.60', '1,077.22'], answer: 4,
    sol: t`<p>Coupons are <span class="tex">Fr = 1000(0.06) = 60</span> a year; the redemption value is <span class="tex">C = 1000</span>. Discount both at the yield <span class="tex">j = 5\%</span>:</p>
<div class="texd">P = 60\,a_{\overline{10}|0.05} + 1000\,v^{10} = 60(7.72173) + 1000(0.61391) = 463.30 + 613.91 \approx 1{,}077.22</div>
<p>Check with the premium/discount formula: <span class="tex">P = 1000 + (60 - 50)a_{\overline{10}|0.05} = 1000 + 77.22</span>. The coupon rate beats the yield, so the bond sells at a premium.</p>
<p>613.91 forgets the coupons, 926.40 swaps the coupon rate and the yield, and 1,073.60 uses the annuity at 6% instead of the yield.</p>`,
  },
  {
    id: 'fm-bd-q2', topic: 'bond', diff: 2,
    q: t`An 8-year bond with face value 1,000 is redeemable at 1,050. It pays coupons at 7% per year, convertible semiannually. Calculate its price at a yield of 6% per year, convertible semiannually.`,
    choices: ['1,062.81', '1,093.47', '1,093.96', '1,098.42', '1,115.95'], answer: 2,
    sol: t`<p>Work in half-years: 16 periods, coupon <span class="tex">Fr = 1000(0.035) = 35</span>, yield <span class="tex">j = 3\%</span> per half-year, <span class="tex">C = 1050</span>. Coupons are always based on the face value, not the redemption value.</p>
<div class="texd">P = 35\,a_{\overline{16}|0.03} + 1050\,v^{16} = 35(12.56110) + 1050(0.62317) = 439.64 + 654.33 \approx 1{,}093.96</div>
<p>1,062.81 redeems at par, 1,115.95 bases the coupons on 1,050, and 1,093.47 treats the rates as annual effective with 8 annual coupons.</p>`,
  },
  {
    id: 'fm-bd-q3', topic: 'bond', diff: 2,
    q: t`A 3-year bond with face value 1,000, redeemable at par, pays annual coupons of 50. It sells for 973.27. Calculate the annual effective yield to maturity.`,
    choices: ['4.5%', '5.0%', '5.5%', '6.0%', '6.5%'], answer: 3,
    sol: t`<p>The yield is the rate <span class="tex">j</span> that solves</p>
<div class="texd">973.27 = 50v + 50v^2 + 1050v^3, \qquad v = \frac{1}{1+j}</div>
<p>The price is below par, so the yield must exceed the 5% coupon rate. Try <span class="tex">j = 6\%</span>: <span class="tex">50(0.94340) + 50(0.89000) + 1050(0.83962) = 973.27</span>. It matches.</p>
<p>A calculator's IRR (or I/Y with N = 3, PV = −973.27, PMT = 50, FV = 1000) gives the same 6%. Choosing 5.0% confuses the coupon rate with the yield.</p>`,
  },
  {
    id: 'fm-bd-q4', topic: 'bond', diff: 3,
    q: t`A 10-year bond with face value 1,000 pays annual coupons at 8%. The issuer may call it at the end of year 5 for 1,100 or at the end of year 8 for 1,050; otherwise it is redeemed at par at the end of year 10. Calculate the highest price an investor can pay and still be sure of an annual effective yield of at least 6%.`,
    choices: ['1,084.25', '1,100.00', '1,147.20', '1,155.57', '1,158.97'], answer: 2,
    sol: t`<p>Price the bond to each possible redemption date at 6% and take the smallest price (the worst case for the investor):</p>
<div class="texd">\begin{aligned} \text{Call at 5: } & 80\,a_{\overline{5}|} + 1100\,v^5 = 336.99 + 821.98 = 1{,}158.97 \\ \text{Call at 8: } & 80\,a_{\overline{8}|} + 1050\,v^8 = 496.78 + 658.78 \approx 1{,}155.57 \\ \text{Maturity: } & 80\,a_{\overline{10}|} + 1000\,v^{10} = 588.81 + 558.39 = 1{,}147.20 \end{aligned}</div>
<p>The minimum is 1,147.20. Paying more would give a yield below 6% if the bond runs to maturity.</p>
<p>The rule "premium bond, assume the earliest call" holds only when every redemption value is the same. Here the call premiums make early calls more generous, so the earliest date (1,158.97) is not the worst. 1,084.25 prices the year-5 call at par, ignoring its premium.</p>`,
  },

  /* ---------- bookvalue: premium, discount and amortization ---------- */
  {
    id: 'fm-bd-q5', topic: 'bookvalue', diff: 1,
    q: t`A 5-year bond with face value 1,000, redeemable at par, pays annual coupons at 8%. It is bought to yield 6% annual effective. Calculate the premium.`,
    choices: ['14.95', '79.85', '84.25', '100.00', '1,084.25'], answer: 2,
    sol: t`<p>The premium is the present value, at the yield, of the extra coupon each year: <span class="tex">Fr - Cj = 80 - 60 = 20</span>.</p>
<div class="texd">P - C = (Fr - Cj)\,a_{\overline{5}|0.06} = 20(4.21236) = 84.25</div>
<p>1,084.25 is the price itself, 100 adds the five extras without discounting, 79.85 uses the annuity at the coupon rate, and 14.95 is only the first year's write-down.</p>`,
  },
  {
    id: 'fm-bd-q6', topic: 'bookvalue', diff: 2,
    q: t`A 10-year bond with face value 1,000, redeemable at par, pays annual coupons at 4%. It was bought at issue to yield 5% annual effective. Calculate its book value just after the 4th coupon is paid.`,
    choices: ['922.78', '949.24', '953.67', '964.54', '1,000.00'], answer: 1,
    sol: t`<p>The book value at any coupon date is the price of the remaining bond at the original yield. After 4 coupons, 6 remain:</p>
<div class="texd">BV_4 = 40\,a_{\overline{6}|0.05} + 1000\,v^{6} = 40(5.07569) + 1000(0.74622) = 949.24</div>
<p>The discount is accumulated toward par over time: the price at issue was 922.78. A straight-line write-up would give 953.67, and 964.54 uses 4 remaining years instead of 6.</p>`,
  },
  {
    id: 'fm-bd-q7', topic: 'bookvalue', diff: 3,
    q: t`A 10-year bond with face value 1,000, redeemable at par, pays coupons at 9% per year, convertible semiannually. It is bought to yield 7% per year, convertible semiannually. Calculate the interest portion of the 12th coupon in the amortization schedule.`,
    choices: ['37.66', '7.34', '45.00', '39.97', '75.33'], answer: 0,
    sol: t`<p>Per half-year: coupon 45, <span class="tex">j = 3.5\%</span>, 20 coupons. The interest earned in a period is <span class="tex">j</span> times the book value at the start of that period. Just after the 11th coupon, 9 coupons remain:</p>
<div class="texd">BV_{11} = 45\,a_{\overline{9}|0.035} + 1000\,v^9 = 1{,}076.08</div>
<div class="texd">I_{12} = 0.035(1{,}076.08) = 37.66</div>
<p>The rest of the coupon, <span class="tex">45 - 37.66 = 7.34</span>, writes down the premium; check: <span class="tex">(Fr - Cj)v^{n-t+1} = 10v^{9} = 7.34</span>. 39.97 applies <span class="tex">j</span> to the original price, and 75.33 uses the nominal annual 7% on a half-year.</p>`,
  },

  /* ---------- cashflow: NPV, IRR and fund returns ---------- */
  {
    id: 'fm-bd-q8', topic: 'cashflow', diff: 1,
    q: t`A project costs 10,000 now and returns 4,000 at the end of each of the next 3 years. Calculate its net present value at an annual effective rate of 8%.`,
    choices: ['−308.39', '0.00', '308.39', '2,000.00', '10,308.39'], answer: 2,
    sol: t`<div class="texd">NPV = -10{,}000 + 4{,}000\,a_{\overline{3}|0.08} = -10{,}000 + 4{,}000(2.57710) = 308.39</div>
<p>The NPV is positive, so at 8% the project is worth more than it costs (its IRR is above 8%). 2,000 ignores discounting, and 10,308.39 is just the present value of the returns.</p>`,
  },
  {
    id: 'fm-bd-q9', topic: 'cashflow', diff: 2,
    q: t`A fund holds 100,000 on January 1. A deposit of 20,000 is made on April 1 and a withdrawal of 10,000 on October 1. The fund holds 116,000 on December 31. Using simple interest for fractions of the year, calculate the dollar-weighted rate of return.`,
    choices: ['14.22%', '6.15%', '6.00%', '5.33%', '5.00%'], answer: 3,
    sol: t`<p>Interest earned is the growth not explained by net deposits:</p>
<div class="texd">I = 116{,}000 - 100{,}000 - (20{,}000 - 10{,}000) = 6{,}000</div>
<p>Weight each cash flow by the fraction of the year it was invested: the deposit for 0.75 of a year, the withdrawal missed 0.25 of a year.</p>
<div class="texd">i \approx \frac{6{,}000}{100{,}000 + 0.75(20{,}000) - 0.25(10{,}000)} = \frac{6{,}000}{112{,}500} = 5.33\%</div>
<p>6.15% swaps the weights (using time elapsed instead of time remaining), 5.00% counts the deposit for the full year, and 14.22% forgets to remove net deposits from the gain.</p>`,
  },
  {
    id: 'fm-bd-q10', topic: 'cashflow', diff: 2,
    q: t`A fund is worth 50,000 on January 1. On July 1 it is worth 54,000 just before a deposit of 10,000. On December 31 it is worth 60,000. Calculate the time-weighted rate of return for the year.`,
    choices: ['0.00%', '1.25%', '1.75%', '8.00%', '20.00%'], answer: 1,
    sol: t`<p>Split the year at the deposit and chain the growth factors:</p>
<div class="texd">\frac{54{,}000}{50{,}000}\times\frac{60{,}000}{54{,}000 + 10{,}000} = 1.08 \times 0.9375 = 1.0125</div>
<p>The time-weighted return is 1.25%. Adding the subperiod returns (8% − 6.25%) gives 1.75%, and 20% ignores the deposit.</p>
<p>The dollar-weighted return is 0% here (the fund ends with exactly what was put in), because the extra 10,000 arrived just before the bad half-year. The time-weighted return removes that timing effect.</p>`,
  },
  {
    id: 'fm-bd-q11', topic: 'cashflow', diff: 3,
    q: t`A project has cash flows of −100 now, +230 at the end of year 1 and −132 at the end of year 2 (a cleanup cost). For which annual effective rates <span class="tex">i \ge 0</span> is its NPV positive?`,
    choices: [t`<span class="tex">0 \le i \lt 10\%</span>`, t`<span class="tex">10\% \lt i \lt 20\%</span>`, t`<span class="tex">i \gt 20\%</span>`, t`<span class="tex">0 \le i \lt 10\%</span> or <span class="tex">i \gt 20\%</span>`, 'For every rate'], answer: 1,
    sol: t`<p>Set the NPV to zero with <span class="tex">v = 1/(1+i)</span>:</p>
<div class="texd">-100 + 230v - 132v^2 = 0 \;\Longrightarrow\; v = \frac{230 \pm \sqrt{230^2 - 4(132)(100)}}{264} = \frac{230 \pm 10}{264}</div>
<p>So <span class="tex">v = 0.90909</span> or <span class="tex">0.83333</span>, giving two IRRs: 10% and 20%. The cash flows change sign twice, so two IRRs are possible.</p>
<p>Test a rate in each region: NPV at 0% is −2, at 15% is +0.19, at 25% is −0.48. The NPV is positive only between the two IRRs. A single "IRR above the hurdle rate" rule does not work here; compare NPVs instead.</p>`,
  },

  /* ---------- termstruct: spot rates, forward rates and yield curves ---------- */
  {
    id: 'fm-bd-q12', topic: 'termstruct', diff: 1,
    q: t`The 1-year spot rate is 3% and the 2-year spot rate is 4%, both annual effective. Calculate the 1-year forward rate from time 1 to time 2.`,
    choices: ['1.00%', '3.50%', '4.00%', '5.00%', '5.01%'], answer: 4,
    sol: t`<p>Investing for 2 years at the spot rate must match investing for 1 year and rolling over at the forward rate:</p>
<div class="texd">(1.04)^2 = (1.03)(1 + f_{1}) \;\Longrightarrow\; f_1 = \frac{1.0816}{1.03} - 1 = 5.01\%</div>
<p>The shortcut <span class="tex">2(4\%) - 3\% = 5\%</span> is only an approximation; 4.00% is the 2-year spot rate itself.</p>`,
  },
  {
    id: 'fm-bd-q13', topic: 'termstruct', diff: 2,
    q: t`Annual effective spot rates are 3% for 1 year, 4% for 2 years and 5% for 3 years. Calculate the price of a 3-year bond with face value 1,000, redeemable at par, with annual coupons at 5%.`,
    choices: ['1,027.75', '958.61', '1,001.80', '1,000.00', '1,096.62'], answer: 2,
    sol: t`<p>Discount each cash flow at the spot rate for its own date:</p>
<div class="texd">P = \frac{50}{1.03} + \frac{50}{1.04^2} + \frac{1050}{1.05^3} = 48.54 + 46.23 + 907.03 = 1{,}001.80</div>
<p>1,000 discounts everything at the 3-year spot rate, 958.61 leaves the coupon out of the final payment, 1,027.75 uses the 2-year spot rate (the middle one) for every payment, and 1,096.62 forgets the powers.</p>`,
  },
  {
    id: 'fm-bd-q14', topic: 'termstruct', diff: 3,
    q: t`Annual effective spot rates are 3% for 1 year, 4% for 2 years and 5% for 3 years. Calculate the 3-year par yield: the annual coupon rate at which a 3-year annual-coupon bond sells at par.`,
    choices: ['3.00%', '4.00%', '4.93%', '5.00%', '5.25%'], answer: 2,
    sol: t`<p>Using spot-rate discount factors <span class="tex">v_1 = 1.03^{-1} = 0.97087</span>, <span class="tex">v_2 = 1.04^{-2} = 0.92456</span>, <span class="tex">v_3 = 1.05^{-3} = 0.86384</span>, a par bond with coupon rate <span class="tex">c</span> satisfies</p>
<div class="texd">1 = c(v_1 + v_2 + v_3) + v_3 \;\Longrightarrow\; c = \frac{1 - v_3}{v_1 + v_2 + v_3} = \frac{0.13616}{2.75927} = 4.93\%</div>
<p>The par yield sits just below the 3-year spot rate on an upward-sloping curve, because the early coupons are discounted at lower rates. 5.25% divides by <span class="tex">3v_3</span> instead of the sum of the discount factors.</p>`,
  },
  {
    id: 'fm-bd-q15', topic: 'termstruct', diff: 2,
    q: t`The 1-year forward rates for years 1, 2 and 3 are 3%, 5% and 7% (annual effective). Calculate the 3-year spot rate.`,
    choices: ['3.00%', '4.99%', '5.00%', '7.00%', '15.72%'], answer: 1,
    sol: t`<p>A 3-year investment at the spot rate grows like rolling over the three 1-year forward rates:</p>
<div class="texd">(1 + s_3)^3 = (1.03)(1.05)(1.07) = 1.157205 \;\Longrightarrow\; s_3 = 1.157205^{1/3} - 1 = 4.99\%</div>
<p>The spot rate is a geometric mean of the forward factors, slightly below the arithmetic mean 5.00%. 7.00% is the last forward rate alone, and 15.72% is the total 3-year growth, not an annual rate.</p>`,
  },
];

export const TOPICS = {
  bond: 'Bond pricing & yields',
  bookvalue: 'Premium, discount & book value',
  cashflow: 'NPV, IRR & fund returns',
  termstruct: 'Spot rates, forward rates & yield curves',
};
