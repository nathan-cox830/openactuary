// Exam FM · Annuities and Loans practice quiz: 15 original multiple-choice questions (A–E).
// Each: { id, topic (annuity|varying|loan|sinking), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python by discounting the full cash-flow schedule.
const t = String.raw;

export const QUESTIONS = [
  /* ---------- annuity: level annuities & perpetuities ---------- */
  {
    id: 'fm-an-q1', topic: 'annuity', diff: 1,
    q: t`A worker deposits 250 at the end of every quarter for 6 years into an account earning 8% per year compounded quarterly. Calculate the account balance immediately after the last deposit.`,
    choices: ['4,728.48', '6,000.00', '7,335.93', '7,605.47', '7,757.57'], answer: 3,
    sol: t`<p>The quarterly rate is <span class="tex">8\%/4 = 2\%</span> and there are <span class="tex">6 \times 4 = 24</span> deposits. Valued at the last deposit, this is an accumulated annuity-immediate:</p>
<div class="texd">250\,s_{\overline{24}|2\%} = 250 \cdot \frac{1.02^{24} - 1}{0.02} = 250 \times 30.421862 = 7{,}605.47</div>
<p>7,757.57 is <span class="tex">250\,\ddot{s}_{\overline{24}|}</span> (one extra quarter of interest), 4,728.48 is the present value, 7,335.93 treats the deposits as 1,000 per year at 8% annual, and 6,000 ignores interest.</p>`,
  },
  {
    id: 'fm-an-q2', topic: 'annuity', diff: 2,
    q: t`A perpetuity pays 1,000 at the end of every year, with the first payment at the end of year 4. At an annual effective rate of 5%, calculate its present value.`,
    choices: ['16,454.05', '17,276.75', '18,140.59', '20,000.00', '21,000.00'], answer: 1,
    sol: t`<p>The payments at times 4, 5, 6, … form a perpetuity-immediate that "starts" at time 3. Its value at time 3 is <span class="tex">1000/0.05 = 20{,}000</span>. Discount 3 years:</p>
<div class="texd">PV = 20{,}000\,v^{3} = 20{,}000 \times 0.863838 = 17{,}276.75</div>
<p>Discounting 4 years (the time of the first payment) gives 16,454.05; discounting only 2 gives 18,140.59. 20,000 and 21,000 ignore the deferral.</p>`,
  },
  {
    id: 'fm-an-q3', topic: 'annuity', diff: 2,
    q: t`A retiree receives 300 at the end of every month for 10 years. The annual effective interest rate is 6%. Calculate the present value of these payments.`,
    choices: ['26,496.31', '27,022.04', '27,217.30', '27,349.78', '36,000.00'], answer: 2,
    sol: t`<p>Convert the rate to the payment period: <span class="tex">j = 1.06^{1/12} - 1 = 0.486755\%</span> per month, over 120 months.</p>
<div class="texd">PV = 300\,a_{\overline{120}|j} = 300 \cdot \frac{1 - 1.06^{-10}}{0.00486755} = 27{,}217.30</div>
<p>Using 0.5% a month treats 6% as a nominal rate (27,022.04). Lumping the payments into 3,600 at each year end gives 26,496.31. 27,349.78 values the payments as an annuity-due.</p>`,
  },
  {
    id: 'fm-an-q4', topic: 'annuity', diff: 3,
    q: t`A loan of 15,000 at an annual effective rate of 6% is repaid by payments of 2,000 at the end of each year for as long as necessary, followed by a smaller final payment made one year after the last 2,000 payment. Calculate the amount of the final payment.`,
    choices: ['501.13', '519.93', '531.19', '1,468.81', '2,501.13'], answer: 2,
    sol: t`<p>First the number of full payments:</p>
<div class="texd">n = \frac{-\ln(1 - 15000 \times 0.06/2000)}{\ln 1.06} = \frac{-\ln 0.55}{\ln 1.06} = 10.26</div>
<p>So 10 full payments. The balance right after the 10th (retrospective method):</p>
<div class="texd">B_{10} = 15000(1.06)^{10} - 2000\,s_{\overline{10}|} = 26{,}862.72 - 26{,}361.59 = 501.13</div>
<p>The drop payment one year later is <span class="tex">501.13 \times 1.06 = 531.19</span>.</p>
<p>501.13 forgets the final year's interest, 2,501.13 is the balloon alternative paid at time 10, and 519.93 multiplies the fractional 0.26 of a period by 2,000, which is not an equation of value.</p>`,
  },
  {
    id: 'fm-an-q5', topic: 'annuity', diff: 2,
    q: t`For a certain term <span class="tex">n</span> and rate <span class="tex">i</span>, the present value of an annuity-immediate of 1 per year is 7.360087 and the accumulated value of the same annuity is 13.180795. Calculate <span class="tex">i</span>.`,
    choices: ['5.0%', '5.5%', '6.0%', '6.5%', '7.0%'], answer: 2,
    sol: t`<p>Use the identity <span class="tex">\dfrac{1}{a_{\overline{n}|}} = \dfrac{1}{s_{\overline{n}|}} + i</span>:</p>
<div class="texd">i = \frac{1}{7.360087} - \frac{1}{13.180795} = 0.135868 - 0.075868 = 0.060</div>
<p>As a check, <span class="tex">s/a = (1+i)^n = 1.790848</span>, which gives <span class="tex">n = 10</span> at 6%.</p>`,
  },

  /* ---------- varying ---------- */
  {
    id: 'fm-an-q6', topic: 'varying', diff: 1,
    q: t`Payments of 50, 100, 150, …, 500 are made at the end of years 1 through 10. At an annual effective rate of 4%, calculate the present value.`,
    choices: ['1,694.07', '2,099.61', '2,183.60', '2,361.38', '2,750.00'], answer: 1,
    sol: t`<p>The payments are <span class="tex">50(Ia)_{\overline{10}|}</span>. With <span class="tex">\ddot{a}_{\overline{10}|} = 8.435332</span> and <span class="tex">10v^{10} = 6.755642</span>:</p>
<div class="texd">50\,(Ia)_{\overline{10}|} = 50 \cdot \frac{8.435332 - 6.755642}{0.04} = 50 \times 41.992248 = 2{,}099.61</div>
<p>Using <span class="tex">a_{\overline{10}|}</span> instead of <span class="tex">\ddot{a}_{\overline{10}|}</span> in the numerator gives 1,694.07; the annuity-due version is 2,183.60; 2,361.38 is <span class="tex">50(Da)_{\overline{10}|}</span>, the reversed order; 2,750 ignores interest.</p>`,
  },
  {
    id: 'fm-an-q7', topic: 'varying', diff: 2,
    q: t`An annuity pays 1,000 at the end of year 1, 900 at the end of year 2, and continues decreasing by 100 each year until a final payment of 100. At an annual effective rate of 5%, calculate its present value.`,
    choices: ['3,784.36', '3,937.38', '4,556.53', '4,784.36', '5,500.00'], answer: 2,
    sol: t`<p>This is <span class="tex">100(Da)_{\overline{10}|}</span>:</p>
<div class="texd">100 \cdot \frac{10 - a_{\overline{10}|}}{0.05} = 100 \cdot \frac{10 - 7.721735}{0.05} = 4{,}556.53</div>
<p>4,784.36 is the annuity-due version, 3,784.36 uses <span class="tex">\ddot{a}_{\overline{10}|}</span> in the formula, 3,937.38 reverses the order (increasing payments), and 5,500 ignores interest. Decreasing payments put the big amounts early, so they are worth more than the same amounts increasing.</p>`,
  },
  {
    id: 'fm-an-q8', topic: 'varying', diff: 3,
    q: t`A pension pays 2,000 at the end of the first year. Each subsequent annual payment is 3% larger than the one before, and 20 payments are made in total. At an annual effective rate of 6%, calculate the present value.`,
    choices: ['22,939.84', '29,123.07', '29,754.95', '29,996.76', '37,735.85'], answer: 1,
    sol: t`<div class="texd">PV = 2000 \cdot \frac{1 - (1.03/1.06)^{20}}{0.06 - 0.03} = 2000 \cdot \frac{1 - 0.563154}{0.03} = 29{,}123.07</div>
<p>With the net rate <span class="tex">j = 1.06/1.03 - 1 = 2.9126\%</span>, the same value is <span class="tex">\dfrac{2000}{1.03}\,a_{\overline{20}|j}</span>. Forgetting to divide by 1.03 gives 29,996.76. 29,754.95 discounts at <span class="tex">i - g = 3\%</span>, 22,939.84 ignores the growth, and 37,735.85 uses the <span class="tex">g = i</span> shortcut <span class="tex">n/(1+i)</span>, which applies only when growth equals interest.</p>`,
  },

  /* ---------- loan ---------- */
  {
    id: 'fm-an-q9', topic: 'loan', diff: 1,
    q: t`A loan of 50,000 is repaid with level payments at the end of each year for 15 years at an annual effective rate of 6%. Calculate the annual payment.`,
    choices: ['2,148.14', '3,333.33', '4,856.73', '5,148.14', '5,379.25'], answer: 3,
    sol: t`<div class="texd">R = \frac{50{,}000}{a_{\overline{15}|}} = \frac{50{,}000}{9.712249} = 5{,}148.14</div>
<p>4,856.73 divides by <span class="tex">\ddot{a}_{\overline{15}|}</span> (payments at the start of each year), 5,379.25 uses 14 payments, 3,333.33 ignores interest, and 2,148.14 is only the sinking fund deposit <span class="tex">50{,}000/s_{\overline{15}|}</span>, without the interest of 3,000.</p>`,
  },
  {
    id: 'fm-an-q10', topic: 'loan', diff: 2,
    q: t`For the loan in the previous question (50,000, 15 annual payments of 5,148.14, 6% annual effective), calculate the outstanding balance immediately after the 8th payment.`,
    choices: ['8,814.89', '23,333.33', '28,738.87', '31,968.88', '36,036.97'], answer: 2,
    sol: t`<p>Prospectively, 7 payments remain:</p>
<div class="texd">B_8 = 5{,}148.14\,a_{\overline{7}|} = 5{,}148.14 \times 5.582381 = 28{,}738.87</div>
<p>Retrospectively, <span class="tex">50{,}000(1.06)^8 - 5{,}148.14\,s_{\overline{8}|} = 79{,}692.40 - 50{,}953.53 = 28{,}738.87</span>, the same.</p>
<p>31,968.88 uses <span class="tex">a_{\overline{8}|}</span>, 36,036.97 is the 7 payments with no discounting, 8,814.89 subtracts 8 payments with no interest, and 23,333.33 assumes principal is repaid in a straight line.</p>`,
  },
  {
    id: 'fm-an-q11', topic: 'loan', diff: 2,
    q: t`A loan of 100,000 is repaid with 20 level annual payments at an annual effective rate of 5%. Calculate the amount of interest in the 6th payment.`,
    choices: ['3,859.81', '3,971.46', '4,164.45', '4,348.25', '5,000.00'], answer: 2,
    sol: t`<p>The payment is <span class="tex">R = 100{,}000/a_{\overline{20}|} = 8{,}024.26</span>. Payment 6 has <span class="tex">n - k + 1 = 15</span> payments remaining including itself, so</p>
<div class="texd">I_6 = R(1 - v^{15}) = 8{,}024.26(1 - 0.481017) = 4{,}164.45</div>
<p>Equivalently, <span class="tex">I_6 = 0.05\,B_5 = 0.05 \times 8{,}024.26\,a_{\overline{15}|} = 4{,}164.45</span>.</p>
<p>3,859.81 is the principal portion. 4,348.25 and 3,971.46 use <span class="tex">v^{16}</span> and <span class="tex">v^{14}</span>, and 5,000 is the first payment's interest.</p>`,
  },
  {
    id: 'fm-an-q12', topic: 'loan', diff: 3,
    q: t`A loan is repaid with 15 level annual payments at an annual effective rate of 6%. The principal portion of the 4th payment is 1,500. Calculate the interest portion of the 9th payment.`,
    choices: ['890.52', '1,010.96', '1,124.58', '1,518.29', '2,007.34'], answer: 1,
    sol: t`<p>Principal portions satisfy <span class="tex">P_k = R\,v^{\,n-k+1}</span>. For <span class="tex">k = 4</span>, <span class="tex">n - k + 1 = 12</span>:</p>
<div class="texd">R = 1500(1.06)^{12} = 3{,}018.29</div>
<p>Principal portions grow by 6% a year, so <span class="tex">P_9 = 1500(1.06)^5 = 2{,}007.34</span>. The interest portion is the rest of the payment:</p>
<div class="texd">I_9 = 3{,}018.29 - 2{,}007.34 = 1{,}010.96</div>
<p>2,007.34 is the principal portion, 1,518.29 is the interest in payment 4, and 1,124.58 and 890.52 are the interest in payments 8 and 10.</p>`,
  },

  /* ---------- sinking ---------- */
  {
    id: 'fm-an-q13', topic: 'sinking', diff: 1,
    q: t`A borrower takes a 10-year loan of 40,000. Interest at 7% is paid to the lender at the end of each year, and the principal is repaid at the end of 10 years from a sinking fund. Level deposits are made at the end of each year into the fund, which earns 5%. Calculate the borrower's total annual outlay.`,
    choices: ['3,180.18', '5,695.10', '5,828.75', '5,980.18', '6,800.00'], answer: 3,
    sol: t`<div class="texd">D = \frac{40{,}000}{s_{\overline{10}|5\%}} = \frac{40{,}000}{12.577893} = 3{,}180.18</div>
<div class="texd">\text{Outlay} = 0.07(40{,}000) + 3{,}180.18 = 2{,}800 + 3{,}180.18 = 5{,}980.18</div>
<p>3,180.18 is the deposit alone. 5,695.10 is the amortization payment at 7%, which is what the outlay would be if the fund also earned 7%. 5,828.75 uses <span class="tex">\ddot{s}</span> (deposits at the start of the year), and 6,800 ignores fund interest.</p>`,
  },
  {
    id: 'fm-an-q14', topic: 'sinking', diff: 2,
    q: t`For the sinking fund loan in the previous question (40,000 at 7%, fund earning 5%, annual deposits of 3,180.18), calculate the net amount of the loan immediately after the 6th deposit.`,
    choices: ['14,106.92', '18,368.67', '19,290.51', '20,918.90', '21,631.33'], answer: 1,
    sol: t`<p>The net amount of the loan is the loan minus the sinking fund balance:</p>
<div class="texd">40{,}000 - 3{,}180.18\,s_{\overline{6}|5\%} = 40{,}000 - 3{,}180.18 \times 6.801913 = 40{,}000 - 21{,}631.33 = 18{,}368.67</div>
<p>21,631.33 is the fund balance itself, 20,918.90 ignores fund interest, 14,106.92 counts 7 deposits, and 19,290.51 is the outstanding balance of an amortized loan at 7%, a different repayment method.</p>`,
  },
  {
    id: 'fm-an-q15', topic: 'sinking', diff: 3,
    q: t`A 25-year loan of 200,000 at an annual effective rate of 6% is repaid with level annual payments. Immediately after the 10th payment, the borrower refinances the outstanding balance with a new 15-year loan at 4.5%, with no fees. Calculate the reduction in the annual payment.`,
    choices: ['923.10', '1,496.56', '2,157.54', '4,471.69', '14,148.78'], answer: 1,
    sol: t`<p>Original payment: <span class="tex">R = 200{,}000/a_{\overline{25}|6\%} = 15{,}645.34</span>.</p>
<p>Balance after 10 payments, at the old rate with 15 payments left:</p>
<div class="texd">B_{10} = 15{,}645.34\,a_{\overline{15}|6\%} = 15{,}645.34 \times 9.712249 = 151{,}951.47</div>
<p>New payment at the new rate:</p>
<div class="texd">R' = \frac{151{,}951.47}{a_{\overline{15}|4.5\%}} = \frac{151{,}951.47}{10.739546} = 14{,}148.78</div>
<p>Reduction: <span class="tex">15{,}645.34 - 14{,}148.78 = 1{,}496.56</span>.</p>
<p>923.10 uses <span class="tex">a_{\overline{16}|}</span> for the balance, 2,157.54 refinances the full 200,000 over 25 years at 4.5% as if from the start, 4,471.69 assumes 120,000 of principal remains (straight-line), and 14,148.78 is the new payment, not the reduction.</p>`,
  },
];

export const TOPICS = {
  annuity: 'Level annuities & perpetuities',
  varying: 'Varying annuities',
  loan: 'Loans & amortization',
  sinking: 'Sinking funds & refinancing',
};
