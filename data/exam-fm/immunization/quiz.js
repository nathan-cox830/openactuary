// Exam FM · Duration, Immunization and Swaps practice quiz: 15 original multiple-choice questions (A–E).
// Each: { id, topic (duration|immunize|swap), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python (explicit cash-flow lists, numerical derivatives) before publishing.
const t = String.raw;

export const QUESTIONS = [
  /* ---------- duration: duration & convexity ---------- */
  {
    id: 'fm-im-q1', topic: 'duration', diff: 1,
    q: t`A reinsurer expects to pay 2,000 at time 2 and 3,000 at time 5. Calculate the Macaulay duration of these payments at an annual effective rate of 4%.`,
    choices: ['3.500', '3.572', '3.714', '3.800', '5.000'], answer: 2,
    sol: t`<p>Present values: <span class="tex">2000(1.04)^{-2} = 1849.11</span> and <span class="tex">3000(1.04)^{-5} = 2465.78</span>, total 4314.89.</p>
<div class="texd">D_{\text{mac}} = \frac{2(1849.11) + 5(2465.78)}{4314.89} = \frac{16027.13}{4314.89} \approx 3.714</div>
<p>Weighting by the undiscounted amounts gives 3.800; the plain average of the two times is 3.5; and 3.572 is the modified duration <span class="tex">3.714/1.04</span>.</p>`,
  },
  {
    id: 'fm-im-q2', topic: 'duration', diff: 2,
    q: t`A 3-year bond with face 1,000 pays annual coupons at 8%. Calculate its modified duration at a yield of 6%.`,
    choices: ['2.583', '2.631', '2.783', '2.789', '2.956'], answer: 1,
    sol: t`<p>Cash flows: 80, 80, 1080. Present values at 6%: 75.472, 71.200, 906.788; price 1053.460.</p>
<div class="texd">D_{\text{mac}} = \frac{1(75.472) + 2(71.200) + 3(906.788)}{1053.460} = \frac{2938.24}{1053.460} \approx 2.7891</div>
<div class="texd">D_{\text{mod}} = \frac{2.7891}{1.06} \approx 2.631</div>
<p>2.789 stops at the Macaulay duration, 2.956 multiplies by 1.06, and 2.783 values at the coupon rate instead of the yield.</p>`,
  },
  {
    id: 'fm-im-q3', topic: 'duration', diff: 2,
    q: t`A portfolio holds bond A (market value 4,000, Macaulay duration 3.2) and bond B (market value 6,000, Macaulay duration 8.5). Both are valued at an annual effective yield of 5%. Calculate the modified duration of the portfolio.`,
    choices: ['5.571', '5.850', '6.076', '6.380', '6.699'], answer: 2,
    sol: t`<p>Weight each duration by market value:</p>
<div class="texd">D_{\text{mac}} = 0.4(3.2) + 0.6(8.5) = 1.28 + 5.10 = 6.38</div>
<div class="texd">D_{\text{mod}} = \frac{6.38}{1.05} \approx 6.076</div>
<p>6.38 is the Macaulay duration. The unweighted average 5.85 (or 5.571 after dividing by 1.05) ignores how much money sits in each bond.</p>`,
  },
  {
    id: 'fm-im-q4', topic: 'duration', diff: 2,
    q: t`A bond portfolio is worth 9,500 at an annual effective yield of 5% and has Macaulay duration 6.5. Using the first-order Macaulay approximation, estimate its value if the yield rises to 5.75%.`,
    choices: ['9,036.88', '9,058.93', '9,070.51', '9,090.51', '9,949.83'], answer: 2,
    sol: t`<div class="texd">P(0.0575) \approx 9500\left(\frac{1.05}{1.0575}\right)^{6.5} \approx 9500(0.954790) \approx 9{,}070.51</div>
<p>The modified-duration line gives <span class="tex">9500\left[1 - 0.0075(6.5/1.05)\right] \approx 9{,}058.93</span>; using 6.5 as if it were the modified duration in that line gives 9,036.88; and 9,949.83 flips the ratio so the price rises.</p>`,
  },
  {
    id: 'fm-im-q5', topic: 'duration', diff: 3,
    q: t`An annuity-immediate pays 100 at the end of each year for 3 years. Calculate its modified convexity, <span class="tex">P''(i)/P(i)</span>, at <span class="tex">i = 5\%</span>.`,
    choices: ['1.967', '4.115', '4.537', '5.900', '6.504'], answer: 3,
    sol: t`<p><span class="tex">P(i) = \sum 100(1+i)^{-t}</span>, so <span class="tex">P''(i) = \sum t(t+1)\,100(1+i)^{-t-2}</span>.</p>
<div class="texd">P = 95.238 + 90.703 + 86.384 = 272.325</div>
<div class="texd">P'' = \frac{2(95.238) + 6(90.703) + 12(86.384)}{1.05^2} = \frac{1771.30}{1.1025} = 1606.62</div>
<div class="texd">C_{\text{mod}} = \frac{1606.62}{272.325} \approx 5.900</div>
<p>Check with <span class="tex">C_{\text{mod}} = (C_{\text{mac}} + D_{\text{mac}})/(1+i)^2 = (4.537 + 1.967)/1.1025 \approx 5.900</span>. 4.537 is the Macaulay convexity, and 6.504 forgets the extra <span class="tex">(1+i)^{-2}</span>.</p>`,
  },
  {
    id: 'fm-im-q6', topic: 'duration', diff: 2,
    q: t`A level perpetuity-immediate has Macaulay duration 21. Calculate its modified duration.`,
    choices: ['19.05', '20.00', '21.00', '22.05', '25.00'], answer: 1,
    sol: t`<p>For a level perpetuity-immediate, <span class="tex">D_{\text{mac}} = (1+i)/i</span>. Setting <span class="tex">(1+i)/i = 21</span> gives <span class="tex">i = 1/20 = 5\%</span>.</p>
<div class="texd">D_{\text{mod}} = \frac{21}{1.05} = 20 = \frac{1}{i}</div>
<p>19.05 divides by 1.05 twice, and 22.05 multiplies instead of dividing.</p>`,
  },

  /* ---------- immunize: immunization & cash-flow matching ---------- */
  {
    id: 'fm-im-q7', topic: 'immunize', diff: 1,
    q: t`An insurer's assets and liabilities have equal present values at the current rate. Which additional conditions complete Redington immunization?`,
    choices: [
      'Asset duration greater than liability duration, and equal convexities',
      'Equal durations, and asset convexity greater than liability convexity',
      'Equal durations, and asset convexity less than liability convexity',
      'Equal convexities, and asset duration less than liability duration',
      'Every asset matures on the same date as a liability',
    ], answer: 1,
    sol: t`<p>Redington asks that the surplus <span class="tex">S(i) = P_A(i) - P_L(i)</span> be a local minimum at zero: <span class="tex">S = 0</span>, <span class="tex">S' = 0</span> (equal durations) and <span class="tex">S'' > 0</span> (assets more convex). Lower asset convexity makes zero a local <i>maximum</i>. Matching every date is exact cash-flow matching, which is stronger than needed.</p>`,
  },
  {
    id: 'fm-im-q8', topic: 'immunize', diff: 2,
    q: t`A liability of 20,000 is due at time 6. At an annual effective rate of 5%, it is fully immunized with two zero-coupon bonds maturing at times 3 and 10. Calculate the face amount of the 10-year bond.`,
    choices: ['8,571.43', '9,872.43', '10,418.63', '11,428.57', '13,891.50'], answer: 2,
    sol: t`<p>Here <span class="tex">a = 3</span> and <span class="tex">b = 4</span>. Measured in time-6 dollars, the long bond carries the share <span class="tex">a/(a+b) = 3/7</span>:</p>
<div class="texd">B(1.05)^{-4} = \tfrac37(20{,}000) = 8{,}571.43 \;\Rightarrow\; B = 8571.43(1.05)^4 \approx 10{,}418.63</div>
<p>Check: the short bond has <span class="tex">A(1.05)^3 = \tfrac47(20{,}000)</span>, so <span class="tex">A \approx 9{,}872.43</span>. PVs: <span class="tex">9872.43(1.05)^{-3} + 10418.63(1.05)^{-10} = 8528.18 + 6396.13 = 14924.31 = 20000(1.05)^{-6}</span>.</p>
<p>8,571.43 forgets to move the amount from time 6 to time 10; 11,428.57 and 13,891.50 give the long bond the larger share, which belongs to the bond closer to the liability.</p>`,
  },
  {
    id: 'fm-im-q9', topic: 'immunize', diff: 3,
    q: t`Liabilities of 1,000 are due at times 2 and 6. An insurer will hold only zero-coupon bonds maturing at times 1 and 8, chosen so that present values and durations match at an annual effective rate of 5%. Calculate the amount (present value) invested in the 8-year bond.`,
    choices: ['662.59', '826.62', '944.71', '978.94', '990.66'], answer: 0,
    sol: t`<p>Liabilities: <span class="tex">1000(1.05)^{-2} = 907.03</span> and <span class="tex">1000(1.05)^{-6} = 746.22</span>, so <span class="tex">P_L = 1653.24</span> and</p>
<div class="texd">D_L = \frac{2(907.03) + 6(746.22)}{1653.24} \approx 3.8055</div>
<p>With fraction <span class="tex">w</span> in the 8-year bond: <span class="tex">1(1 - w) + 8w = 3.8055</span>, so <span class="tex">w = 2.8055/7 \approx 0.40078</span>.</p>
<div class="texd">0.40078 \times 1653.24 \approx 662.59</div>
<p>Convexity check (Macaulay): assets <span class="tex">0.59922(1) + 0.40078(64) \approx 26.25</span> versus liabilities <span class="tex">(4(907.03) + 36(746.22))/1653.24 \approx 18.44</span>, so Redington's third condition holds too.</p>
<p>990.66 is the amount for the 1-year bond, 978.94 is the 8-year bond's face rather than its price, 826.62 splits the money evenly, and 944.71 uses the average time 4 instead of the duration.</p>`,
  },
  {
    id: 'fm-im-q10', topic: 'immunize', diff: 2,
    q: t`Liabilities are 1,500 at time 1, 1,000 at time 2 and 2,000 at time 3. They will be matched exactly using a 3-year bond with 5% annual coupons, a 2-year bond with 4% annual coupons, and 1-year zero-coupon bonds. Calculate the face amount of 1-year zero-coupon bonds needed.`,
    choices: ['869.96', '1,369.96', '1,404.76', '1,465.20', '1,500.00'], answer: 1,
    sol: t`<p>Work backward.</p>
<p>Time 3: <span class="tex">F_3(1.05) = 2000 \Rightarrow F_3 = 1904.76</span>, with coupons of <span class="tex">95.24</span> at times 1 and 2.</p>
<p>Time 2: <span class="tex">F_2(1.04) = 1000 - 95.24 = 904.76 \Rightarrow F_2 = 869.96</span>, with a coupon of <span class="tex">34.80</span> at time 1.</p>
<p>Time 1: zeros cover <span class="tex">1500 - 95.24 - 34.80 = 1369.96</span>.</p>
<p>1,404.76 forgets the 2-year bond's coupon, 1,465.20 forgets the 3-year bond's coupon, and 869.96 is the face of the 2-year bond.</p>`,
  },
  {
    id: 'fm-im-q11', topic: 'immunize', diff: 3,
    q: t`A liability of 10,000 is due at time 5. At 6% it is fully immunized with zero-coupon bonds maturing at times 3 and 8. Immediately afterward, the annual effective rate rises to 8%. Calculate the present value at 8% of assets minus liabilities.`,
    choices: ['−118.99', '−7.09', '0.00', '7.09', '9.01'], answer: 3,
    sol: t`<p>Full immunization at 6% (<span class="tex">a = 2</span>, <span class="tex">b = 3</span>):</p>
<div class="texd">A(1.06)^2 = \tfrac35(10{,}000) \Rightarrow A = 5339.98, \qquad B(1.06)^{-3} = \tfrac25(10{,}000) \Rightarrow B = 4764.06</div>
<p>At 8%:</p>
<div class="texd">5339.98(1.08)^{-3} + 4764.06(1.08)^{-8} - 10000(1.08)^{-5} = 4239.05 + 2573.88 - 6805.83 \approx 7.09</div>
<p>Full immunization keeps the surplus non-negative, but not exactly zero. Giving the larger share to the 8-year bond leads to −118.99, and 9.01 is the surplus if rates fall to 4% instead.</p>`,
  },

  /* ---------- swap: interest rate swaps ---------- */
  {
    id: 'fm-im-q12', topic: 'swap', diff: 1,
    q: t`An insurer enters an interest rate swap with notional 2,500,000, paying a fixed rate of 4.2% and receiving a floating rate. This year the floating rate is 3.5%. Which describes this year's settlement?`,
    choices: ['The insurer pays 17,500', 'The insurer receives 17,500', 'The insurer pays 105,000', 'The insurer receives 87,500', 'The insurer pays 192,500'], answer: 0,
    sol: t`<p>Only the net amount changes hands:</p>
<div class="texd">2{,}500{,}000(0.042 - 0.035) = 17{,}500</div>
<p>The fixed rate is higher than the floating rate, so the fixed payer (the insurer) pays. 105,000 and 87,500 are the gross fixed and floating legs, and 192,500 adds them.</p>`,
  },
  {
    id: 'fm-im-q13', topic: 'swap', diff: 2,
    q: t`Annual effective spot rates are 2.5%, 3%, 3.5% and 4% for terms of 1, 2, 3 and 4 years. Calculate the swap rate for a 4-year swap with level notional and annual settlements.`,
    choices: ['3.250%', '3.630%', '3.951%', '4.000%', '5.515%'], answer: 2,
    sol: t`<p>Zero-coupon prices: <span class="tex">P_1 = 0.975610</span>, <span class="tex">P_2 = 0.942596</span>, <span class="tex">P_3 = 0.901943</span>, <span class="tex">P_4 = 0.854804</span>; sum 3.674953.</p>
<div class="texd">R = \frac{1 - P_4}{\sum P_k} = \frac{0.145196}{3.674953} \approx 3.951\%</div>
<p>3.25% averages the spot rates, 4% is the 4-year spot rate, 3.630% divides by 4 instead of the sum of prices, and 5.515% is the year-4 forward rate.</p>`,
  },
  {
    id: 'fm-im-q14', topic: 'swap', diff: 3,
    q: t`Annual effective spot rates are 3%, 4% and 4.5% for 1, 2 and 3 years. A 3-year swap has notional 1 million in year 1, 2 million in year 2 and 3 million in year 3. Calculate the swap rate.`,
    choices: ['4.063%', '4.463%', '4.500%', '4.892%', '4.924%'], answer: 3,
    sol: t`<p>Prices: <span class="tex">P_1 = 0.970874</span>, <span class="tex">P_2 = 0.924556</span>, <span class="tex">P_3 = 0.876297</span>. Each year's expected floating payment uses <span class="tex">P_k f_k = P_{k-1} - P_k</span>: 0.029126, 0.046318, 0.048259.</p>
<div class="texd">R = \frac{1(0.029126) + 2(0.046318) + 3(0.048259)}{1(0.970874) + 2(0.924556) + 3(0.876297)} = \frac{0.266540}{5.448876} \approx 4.892\%</div>
<p>The level-notional swap rate is 4.463%; the growing notional puts more weight on the later, higher forward rates. 4.924% weights the forward rates by notional but forgets the discount factors, and 4.063% weights spot rates instead of forward rates.</p>`,
  },
  {
    id: 'fm-im-q15', topic: 'swap', diff: 3,
    q: t`Two years ago an insurer entered a 4-year swap with notional 2,000,000 as the <b>receiver</b> of the fixed rate of 3.5%. The second settlement has just been made. The current annual effective spot rates are 2.5% for 1 year and 3% for 2 years. Calculate the market value of the swap to the insurer.`,
    choices: ['−19,466.21', '10,148.14', '19,182.06', '19,466.21', '20,296.27'], answer: 3,
    sol: t`<p>Remaining payments are at times 1 and 2 from now. <span class="tex">P'_1 = 1/1.025 = 0.975610</span>, <span class="tex">P'_2 = 1/1.03^2 = 0.942596</span>, sum 1.918206.</p>
<p>The receiver gets the fixed leg and pays the floating leg, whose value is <span class="tex">N(1 - P'_2)</span>:</p>
<div class="texd">V = 2{,}000{,}000\left[0.035(1.918206) - (1 - 0.942596)\right] = 2{,}000{,}000(0.067137 - 0.057404) \approx 19{,}466.21</div>
<p>Equivalently, the new 2-year swap rate is 2.9926%, and <span class="tex">2{,}000{,}000(0.035 - 0.029926)(1.918206) \approx 19{,}466.21</span>. −19,466.21 is the payer's value; 20,296.27 multiplies the rate gap by 2 instead of the sum of prices; 19,182.06 uses the 2-year spot rate 3% as the new swap rate.</p>`,
  },
];

export const TOPICS = {
  duration: 'Duration & convexity',
  immunize: 'Immunization & cash-flow matching',
  swap: 'Interest rate swaps',
};
