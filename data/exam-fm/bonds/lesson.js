// Exam FM · Bonds and Cash-Flow Analysis lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Topics: bond (pricing, yields & calls) · bookvalue (premium, discount & book value) · cashflow (NPV, IRR & fund returns)
//         · termstruct (spot rates, forward rates & yield curves).
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers were recomputed in Python.
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
const t = String.raw;

export const LESSON = {
  id: 'fm-bonds',
  title: 'Bonds and Cash-Flow Analysis',
  steps: [
    {
      id: 'fm-bd-terms', title: 'Bond vocabulary and yield to maturity', short: 'Bond terms', topic: 'bond', minutes: 7,
      body: t`
<p>A <b>bond</b> is a loan you buy. The issuer (a company or government) borrows your money now and promises a fixed schedule of payments back. Insurers hold large bond portfolios because those predictable payments can be lined up against future claims.</p>
<p>Exam FM uses a standard set of symbols:</p>
<ul>
  <li><span class="tex">F</span>, the <b>face value</b> (par value): the amount printed on the bond. Coupons are always computed from it.</li>
  <li><span class="tex">r</span>, the <b>coupon rate</b> per coupon period. Each coupon is <span class="tex">Fr</span>.</li>
  <li><span class="tex">C</span>, the <b>redemption value</b> paid at maturity. Usually <span class="tex">C = F</span> ("redeemable at par"), but not always.</li>
  <li><span class="tex">g = Fr/C</span>, the <b>modified coupon rate</b>: the coupon as a fraction of the redemption value.</li>
  <li><span class="tex">n</span>, the number of coupon periods, and <span class="tex">j</span>, the <b>yield rate</b> per coupon period.</li>
  <li><span class="tex">P</span>, the price.</li>
</ul>
<p>Coupons are usually paid twice a year. A "6% bond with semiannual coupons" pays <span class="tex">r = 3\%</span> of face every half-year, and a quoted yield of "5% convertible semiannually" means <span class="tex">j = 2.5\%</span> per half-year. Always convert to the coupon period first.</p>
<p>The <b>yield to maturity</b> is the single rate <span class="tex">j</span> that makes the present value of all the promised payments equal the price, assuming the bond is held to maturity and every payment arrives. It is the bond's internal rate of return. Price and yield move in opposite directions: pay more for the same payments and you earn less on them.</p>`,
      example: {
        title: 'Worked example: reading a bond description',
        html: t`<p>A 10-year bond has face value 1,000, coupons at 6% per year payable semiannually, and is redeemable at 1,050.</p>
<p>Then <span class="tex">F = 1000</span>, <span class="tex">r = 0.03</span>, <span class="tex">Fr = 30</span> each half-year, <span class="tex">C = 1050</span>, <span class="tex">n = 20</span> half-years, and <span class="tex">g = 30/1050 = 2.857\%</span>. If it is bought to yield 7% convertible semiannually, <span class="tex">j = 3.5\%</span>.</p>
<p>Note that the coupon is 30, not <span class="tex">0.03 \times 1050 = 31.50</span>: coupons come from the face value.</p>`,
      },
      checks: [
        { q: t`A bond with face value 5,000 pays coupons at 8% per year, convertible semiannually. How large is each coupon?`,
          opts: ['100', '200', '400', '416'], correct: 1,
          explain: t`Per half-year the coupon rate is 4%, so each coupon is <span class="tex">5000(0.04) = 200</span>. 400 would be the total for a full year.` },
        { q: t`A bond has <span class="tex">F = 1000</span>, annual coupon rate 6% and redemption value <span class="tex">C = 1200</span>. Find the modified coupon rate <span class="tex">g</span>.`,
          opts: ['5.0%', '6.0%', '7.2%', '20.0%'], correct: 0,
          explain: t`<span class="tex">g = Fr/C = 60/1200 = 5\%</span>. The coupon is still 60, based on the face value.` },
        { q: t`A bond redeemable at par sells for less than its face value. What must be true?`,
          opts: ['The yield is below the coupon rate', 'The yield equals the coupon rate', 'The yield is above the coupon rate', 'The bond has defaulted'], correct: 2,
          explain: t`Paying less than par for the same payments means earning more than the coupon rate. That is a discount bond: <span class="tex">j \gt g</span>.` },
      ],
    },
    {
      id: 'fm-bd-price', title: 'Pricing a bond: basic and premium/discount formulas', short: 'Bond price', topic: 'bond', minutes: 9,
      widget: 'priceyield',
      body: t`
<p>The price at yield <span class="tex">j</span> is the present value of the coupons plus the present value of the redemption payment:</p>
<div class="texd">P = Fr\,a_{\overline{n}|j} + C\,v_j^{\,n}</div>
<p>Rearranging gives the <b>premium/discount formula</b>, often the faster route:</p>
<div class="texd">P = C + (Fr - Cj)\,a_{\overline{n}|j} = C\left[1 + (g - j)\,a_{\overline{n}|j}\right]</div>
<p>Read it as: you pay the redemption value, plus the present value of the extra coupon you get each period compared with a bond that earns exactly <span class="tex">j</span>.</p>
<ul>
  <li><span class="tex">g \gt j</span>: the bond sells at a <b>premium</b>, <span class="tex">P - C = (Fr - Cj)a_{\overline{n}|j} \gt 0</span>.</li>
  <li><span class="tex">g \lt j</span>: the bond sells at a <b>discount</b>, <span class="tex">C - P = (Cj - Fr)a_{\overline{n}|j} \gt 0</span>.</li>
  <li><span class="tex">g = j</span>: the bond sells at <span class="tex">C</span>.</li>
</ul>
<p>(Some texts also give Makeham's formula, <span class="tex">P = K + \tfrac{g}{j}(C - K)</span> with <span class="tex">K = Cv^n</span>. It gives the same price and is optional.)</p>
<p>The price falls as the yield rises, and the curve is <b>convex</b>: a drop in yield raises the price by more than an equal rise lowers it. Longer bonds have steeper price–yield curves.</p>
<p>Use the explorer below: move the coupon, term and yield sliders to see the price, whether the bond is at a premium or discount, and where it sits on the convex price–yield curve. The tangent line shows how duration approximates the curve for small yield changes.</p>`,
      example: {
        title: 'Worked example: a semiannual discount bond',
        html: t`<p>A 10-year 1,000 par bond pays 5% coupons semiannually and is bought to yield 6% convertible semiannually. Per half-year: <span class="tex">Fr = 25</span>, <span class="tex">j = 3\%</span>, <span class="tex">n = 20</span>.</p>
<div class="texd">P = 25\,a_{\overline{20}|0.03} + 1000\,v^{20} = 371.94 + 553.68 \approx 925.61</div>
<p>Premium/discount check: <span class="tex">P = 1000 + (25 - 30)a_{\overline{20}|0.03} = 1000 - 5(14.87747) = 925.61</span>. The discount of 74.39 is the present value of the 5-per-period coupon shortfall.</p>`,
      },
      checks: [
        { q: t`A 5-year 1,000 par bond pays annual coupons at 4% and is bought to yield 5% annual effective. Find its price.`,
          opts: ['955.48', '956.71', '983.53', '1,043.29'], correct: 1,
          explain: t`<span class="tex">P = 1000 + (40 - 50)a_{\overline{5}|0.05} = 1000 - 10(4.32948) = 956.71</span>. 955.48 uses the annuity at 4%, and 1,043.29 adds the discount instead of subtracting it.` },
        { q: t`A bond's coupon rate is 7% and it is bought to yield 6% (same period basis, redeemable at par). How is it priced?`,
          opts: ['At a premium', 'At par', 'At a discount', 'It depends on the term'], correct: 0,
          explain: t`<span class="tex">g = 7\% \gt j = 6\%</span>, so <span class="tex">P - C = (Fr - Cj)a_{\overline{n}|} \gt 0</span> for any term: a premium.` },
        { q: t`For a fixed bond, the yield falls by 1% and later rises by 1% from the original level. Compared with the original price, which is true?`,
          opts: ['The price gain equals the price loss', 'The price gain is larger than the price loss', 'The price loss is larger than the price gain', 'The price does not change'], correct: 1,
          explain: t`The price–yield curve is convex (bowed toward the origin), so equal yield moves produce a larger gain when yields fall than loss when they rise.` },
      ],
    },
    {
      id: 'fm-bd-between', title: 'Prices between coupon dates', short: 'Flat & market price', topic: 'bond', minutes: 6,
      body: t`
<p>Bonds trade on any day, not only on coupon dates. Suppose a fraction <span class="tex">k</span> (with <span class="tex">0 \lt k \lt 1</span>) of the current coupon period has passed, and <span class="tex">B_t</span> is the book value just after the last coupon.</p>
<p>The <b>flat price</b> (also called the dirty price) is what the buyer actually pays. It is the value of all future payments, which equals the last book value grown with interest:</p>
<div class="texd">\text{Flat price} = B_t\,(1 + j)^k</div>
<p>Part of that money compensates the seller for the coupon they have partly earned. The <b>accrued coupon</b> is usually computed in proportion to time:</p>
<div class="texd">\text{Accrued coupon} = k \cdot Fr</div>
<p>The <b>market price</b> (clean price) is what gets quoted:</p>
<div class="texd">\text{Market price} = \text{Flat price} - k\cdot Fr</div>
<p>Why quote the clean price? The flat price climbs steadily during each period and then drops by the coupon on the payment date. The market price removes that saw-tooth, so price changes reflect yield changes, not the calendar.</p>`,
      example: {
        title: 'Worked example: two months after a coupon',
        html: t`<p>Take the bond from the previous step (price 925.61 at a coupon date, coupon 25 per half-year, <span class="tex">j = 3\%</span>). Two months into a six-month period, <span class="tex">k = 1/3</span>.</p>
<div class="texd">\text{Flat} = 925.61(1.03)^{1/3} = 934.78, \qquad \text{Accrued} = \tfrac13(25) = 8.33</div>
<div class="texd">\text{Market} = 934.78 - 8.33 = 926.44</div>
<p>The buyer pays 934.78 and receives the full 25 coupon in four months.</p>`,
      },
      checks: [
        { q: t`A bond pays a coupon of 30 every six months. Four months after the last coupon, what is the accrued coupon?`,
          opts: ['10', '15', '20', '30'], correct: 2,
          explain: t`<span class="tex">k = 4/6</span>, so the accrued coupon is <span class="tex">\tfrac{4}{6}(30) = 20</span>.` },
        { q: t`A 1,000 par bond has coupon rate equal to its yield, 4% per half-year, so its book value at each coupon date is 1,000. Halfway through a period, find the market price.`,
          opts: ['980.20', '999.80', '1,000.00', '1,019.80'], correct: 1,
          explain: t`Flat price <span class="tex">1000(1.04)^{0.5} = 1019.80</span>; accrued coupon <span class="tex">0.5(40) = 20</span>; market price 999.80. Compound growth inside the period is a little less than the straight-line accrued coupon, so even a par bond quotes just under par mid-period.` },
      ],
    },
    {
      id: 'fm-bd-amort', title: 'Amortization of premium and discount', short: 'Book value', topic: 'bookvalue', minutes: 9,
      body: t`
<p>Each coupon is partly interest earned and partly a return (or addition) of principal. The investor's <b>book value</b> <span class="tex">B_t</span> tracks the bond's value at the original yield. At a coupon date it is the price of the remaining payments:</p>
<div class="texd">B_t = Fr\,a_{\overline{n-t}|j} + C\,v^{\,n-t}, \qquad B_0 = P, \quad B_n = C</div>
<p>The schedule works period by period, exactly like a loan:</p>
<div class="texd">I_t = j\,B_{t-1}, \qquad PR_t = Fr - I_t, \qquad B_t = B_{t-1} - PR_t</div>
<p>There is also a closed form for the principal adjustment:</p>
<div class="texd">PR_t = (Fr - Cj)\,v^{\,n-t+1}</div>
<ul>
  <li><b>Premium bond</b> (<span class="tex">Fr \gt Cj</span>): <span class="tex">PR_t \gt 0</span>. The book value is <b>written down</b> toward <span class="tex">C</span>; this is amortization of premium. The write-downs grow each period.</li>
  <li><b>Discount bond</b> (<span class="tex">Fr \lt Cj</span>): <span class="tex">PR_t \lt 0</span>. Interest earned exceeds the coupon, and the book value is <b>written up</b> toward <span class="tex">C</span>: accumulation of discount.</li>
</ul>
<p>Over the whole life, total interest earned is everything received minus what was paid: <span class="tex">nFr + C - P</span>.</p>`,
      example: {
        title: 'Worked example: a 3-year premium bond schedule',
        html: t`<p>A 1,000 par bond pays 60 a year for 3 years and is bought to yield 4%: <span class="tex">P = 60\,a_{\overline{3}|0.04} + 1000v^3 = 1{,}055.50</span>.</p>
<table><thead><tr><th>Year</th><th>Coupon</th><th>Interest <span class="tex">jB_{t-1}</span></th><th>Write-down</th><th>Book value</th></tr></thead>
<tbody><tr><td>0</td><td></td><td></td><td></td><td>1,055.50</td></tr>
<tr><td>1</td><td>60</td><td>42.22</td><td>17.78</td><td>1,037.72</td></tr>
<tr><td>2</td><td>60</td><td>41.51</td><td>18.49</td><td>1,019.23</td></tr>
<tr><td>3</td><td>60</td><td>40.77</td><td>19.23</td><td>1,000.00</td></tr></tbody></table>
<p>The write-downs add to the premium, 55.50, and grow by the factor 1.04 each year: <span class="tex">PR_t = 20v^{4-t}</span>.</p>`,
      },
      checks: [
        { q: t`In the example, total interest earned over the 3 years is`,
          opts: ['120.00', '124.50', '180.00', '235.50'], correct: 1,
          explain: t`<span class="tex">nFr + C - P = 180 + 1000 - 1055.50 = 124.50</span>, which matches <span class="tex">42.22 + 41.51 + 40.77</span>. The coupons total 180, but 55.50 of that is return of the premium.` },
        { q: t`For a bond bought at a discount, how does the book value move over time?`,
          opts: ['It falls toward the redemption value', 'It rises toward the redemption value', 'It stays at the price', 'It rises above the redemption value, then falls'], correct: 1,
          explain: t`Interest earned <span class="tex">jB_{t-1}</span> exceeds the coupon, so the difference is added to book value each period until it reaches <span class="tex">C</span>.` },
        { q: t`A 5-year 1,000 par bond with 8% annual coupons is bought to yield 6%. Find the write-down of premium in the first year.`,
          opts: ['14.95', '18.87', '20.00', '84.25'], correct: 0,
          explain: t`<span class="tex">PR_1 = (Fr - Cj)v^{n} = 20(1.06)^{-5} = 14.95</span>. The first write-down is the smallest; 18.87 discounts only one year, and 84.25 is the whole premium.` },
      ],
    },
    {
      id: 'fm-bd-callable', title: 'Callable bonds', short: 'Callable bonds', topic: 'bond', minutes: 7,
      body: t`
<p>A <b>callable bond</b> lets the issuer repay early, on set call dates. Issuers call when rates have fallen and they can refinance more cheaply, which is exactly when the investor would rather keep the bond. The investor does not choose the date, so they price for the <b>worst case</b>:</p>
<div class="texd">P = \min_{\text{possible redemption dates}} \; \text{price to that date at yield } j</div>
<p>Paying that minimum guarantees a yield of at least <span class="tex">j</span> whatever the issuer does. If the bond is redeemed on any other date, the investor's actual yield turns out higher.</p>
<p>When every call price equals the redemption value, there is a shortcut:</p>
<ul>
  <li><b>Premium bond</b> (<span class="tex">g \gt j</span>): assume the <b>earliest</b> call date. The premium is recovered over fewer periods, which hurts the investor most.</li>
  <li><b>Discount bond</b> (<span class="tex">g \lt j</span>): assume the <b>latest</b> date. The discount is the investor's gain, and delaying it hurts most.</li>
</ul>
<p>When call prices differ by date (a call premium that shrinks over time), the shortcut can fail. Then price to every date and take the smallest.</p>`,
      example: {
        title: 'Worked example: callable premium bond',
        html: t`<p>A 10-year 1,000 par bond pays 7% annual coupons and is callable at par at the end of any year from 6 to 10. An investor wants a yield of at least 5%.</p>
<p>Since <span class="tex">7\% \gt 5\%</span> and all redemption values are 1,000, price to the earliest call:</p>
<div class="texd">P = 70\,a_{\overline{6}|0.05} + 1000v^6 = 1{,}101.51</div>
<p>Priced to maturity it would be 1,154.43. Paying that and then being called at year 6 would leave the investor with a yield below 5%.</p>`,
      },
      checks: [
        { q: t`A discount bond is callable at par at the end of any year from 5 to 10 (its maturity). To guarantee the desired yield, price it to`,
          opts: ['year 5', 'year 7.5', 'year 10', 'the average of all dates'], correct: 2,
          explain: t`For a discount bond, the gain (redemption minus price) is worth least to the investor when it comes latest, so the price to year 10 is the minimum.` },
        { q: t`A 5-year 1,000 par bond with 6% annual coupons is callable at par at the end of years 3, 4 or 5. Find the price that guarantees an annual yield of at least 4%.`,
          opts: ['1,000.00', '1,055.50', '1,072.60', '1,089.04'], correct: 1,
          explain: t`Premium bond with equal redemption values: price to year 3, <span class="tex">60\,a_{\overline{3}|0.04} + 1000v^3 = 1{,}055.50</span>. 1,072.60 prices to year 4 and 1,089.04 to maturity.` },
      ],
    },
    {
      id: 'fm-bd-npv-irr', title: 'Net present value and internal rate of return', short: 'NPV & IRR', topic: 'cashflow', minutes: 8,
      body: t`
<p>Any investment is a list of cash flows <span class="tex">C_t</span> at times <span class="tex">t</span>, negative for money paid out and positive for money received. At an interest rate <span class="tex">i</span> its <b>net present value</b> is</p>
<div class="texd">NPV(i) = \sum_t C_t\,v^t, \qquad v = \frac{1}{1+i}</div>
<p>A positive NPV at your required rate (cost of capital) means the project earns more than that rate.</p>
<p>The <b>internal rate of return</b> is the rate that makes the NPV zero:</p>
<div class="texd">\sum_t C_t\,v^t = 0</div>
<p>A bond's yield to maturity is its IRR. In general the IRR has no formula; solve with a calculator's IRR or by trial. For two periods it is a quadratic in <span class="tex">v</span>.</p>
<p><b>Problems with IRR.</b> For a conventional project (money out first, then only money in), NPV falls as <span class="tex">i</span> rises and there is exactly one IRR. If the cash flows change sign more than once, for instance a cleanup cost at the end, there can be several IRRs or none. Descartes' rule of signs caps the number of positive roots at the number of sign changes. When the IRR is not unique, compare projects by NPV at the required rate instead.</p>`,
      example: {
        title: 'Worked example: a two-year project',
        html: t`<p>Pay 1,000 now; receive 500 in one year and 660 in two. The IRR solves</p>
<div class="texd">-1000 + 500v + 660v^2 = 0 \;\Longrightarrow\; v = \frac{-500 + \sqrt{500^2 + 4(660)(1000)}}{2(660)} = \frac{1200}{1320} = 0.90909</div>
<p>so the IRR is 10%. At a required rate of 8% the NPV is <span class="tex">-1000 + 500/1.08 + 660/1.08^2 = 28.81 \gt 0</span>, consistent with an IRR above 8%.</p>`,
      },
      checks: [
        { q: t`A conventional project has an IRR of 12%. The investor's required return is 9%. What is the sign of the NPV at 9%?`,
          opts: ['Positive', 'Zero', 'Negative', 'Cannot be determined'], correct: 0,
          explain: t`For a conventional project NPV decreases in <span class="tex">i</span> and is zero at 12%, so it is positive at any lower rate.` },
        { q: t`Cash flows are −50, +120, −40, +30 at times 0 to 3. At most how many positive IRRs can there be?`,
          opts: ['1', '2', '3', '4'], correct: 2,
          explain: t`The signs go −, +, −, +: three changes. Descartes' rule allows at most three positive roots of the polynomial in <span class="tex">v</span>.` },
      ],
    },
    {
      id: 'fm-bd-fund-returns', title: 'Dollar-weighted and time-weighted returns', short: 'Fund returns', topic: 'cashflow', minutes: 9,
      body: t`
<p>A fund with deposits and withdrawals during the year needs a way to report one rate of return. There are two standard answers.</p>
<p>The <b>dollar-weighted return</b> is the fund's IRR over the year. With start value <span class="tex">A</span>, end value <span class="tex">B</span>, and net deposits <span class="tex">C_t</span> at times <span class="tex">t</span> (fractions of the year), interest earned is <span class="tex">I = B - A - \sum C_t</span>. The simple-interest approximation is</p>
<div class="texd">i \approx \frac{I}{A + \sum_t C_t\,(1 - t)}</div>
<p>Each deposit counts for the part of the year it was invested.</p>
<p>The <b>time-weighted return</b> chains the growth between cash flows. If <span class="tex">B_k</span> is the value just before the <span class="tex">k</span>th cash flow and <span class="tex">C_{k-1}</span> the flow at the start of that subperiod:</p>
<div class="texd">1 + i = \prod_k \frac{B_k}{B_{k-1} + C_{k-1}}</div>
<p>It needs the fund value at every cash-flow date, and it ignores how much money was in the fund. That makes it the fair measure of a manager who does not control deposits. The dollar-weighted return reflects the investor's own timing: money added just before a good period raises it.</p>
<p><b>Allocating fund income.</b> Insurers credit investment income to product lines by either the <b>portfolio method</b> (every dollar earns the fund's overall rate) or the <b>investment year method</b> (new money earns rates that depend on the year it was invested, for a few years, before moving to the portfolio rate).</p>`,
      example: {
        title: 'Worked example: same fund, two returns',
        html: t`<p>A fund starts at 10,000. At mid-year it is worth 10,600, and 2,000 is deposited. At year end it is worth 13,000.</p>
<p><b>Dollar-weighted:</b> <span class="tex">I = 13{,}000 - 10{,}000 - 2{,}000 = 1{,}000</span>, so <span class="tex">i \approx 1000/(10{,}000 + 0.5 \cdot 2000) = 9.09\%</span>.</p>
<p><b>Time-weighted:</b> <span class="tex">\frac{10{,}600}{10{,}000}\cdot\frac{13{,}000}{12{,}600} = 1.06 \times 1.03175 = 1.09365</span>, so 9.37%.</p>
<p>The second half (3.2%) was weaker than the first (6%), and more money was invested in it, which pulls the dollar-weighted return down.</p>`,
      },
      checks: [
        { q: t`A fund starts the year at 50,000. 5,000 is withdrawn at time 0.4 and the fund ends at 48,000. Find the approximate dollar-weighted return.`,
          opts: ['6.00%', '6.25%', '6.38%', '6.67%'], correct: 2,
          explain: t`<span class="tex">I = 48{,}000 - 50{,}000 + 5{,}000 = 3{,}000</span>. The withdrawal missed 0.6 of the year: <span class="tex">3000/(50{,}000 - 0.6 \cdot 5000) = 3000/47{,}000 = 6.38\%</span>. 6.25% weights it by 0.4 instead.` },
        { q: t`Which return needs the fund's value on every date a deposit or withdrawal occurs?`,
          opts: ['Dollar-weighted', 'Time-weighted', 'Both', 'Neither'], correct: 1,
          explain: t`The time-weighted return chains subperiod growth factors, each of which needs the value just before a cash flow. The dollar-weighted approximation needs only the start, end and the flows.` },
      ],
    },
    {
      id: 'fm-bd-spot-forward', title: 'Spot rates, forward rates and yield curves', short: 'Spot & forward', topic: 'termstruct', minutes: 9,
      body: t`
<p>Until now one rate discounted every payment. In reality, money locked up for 1 year and for 10 years earns different rates. The <b>term structure of interest rates</b> describes how.</p>
<p>The <b>spot rate</b> <span class="tex">s_t</span> is the annual effective yield on a zero-coupon bond maturing at time <span class="tex">t</span>. A payment at time <span class="tex">t</span> is worth <span class="tex">(1 + s_t)^{-t}</span> per unit today.</p>
<p>The <b>forward rate</b> <span class="tex">f_t</span> is the rate agreed today for a 1-year loan from time <span class="tex">t</span> to <span class="tex">t+1</span>. With no arbitrage, investing at spot rates must match rolling over forward rates:</p>
<div class="texd">(1 + s_n)^n = (1 + f_0)(1 + f_1)\cdots(1 + f_{n-1}), \qquad f_0 = s_1</div>
<div class="texd">1 + f_t = \frac{(1 + s_{t+1})^{t+1}}{(1 + s_t)^t}</div>
<p>A multi-year forward rate from <span class="tex">a</span> to <span class="tex">b</span> works the same way: <span class="tex">(1 + f_{a,b})^{b-a} = (1+s_b)^b/(1+s_a)^a</span>.</p>
<p>The <b>yield curve</b> plots spot rates (or yields) against term:</p>
<ul>
  <li><b>Normal</b> (upward sloping): longer terms pay more. Forward rates lie above spot rates.</li>
  <li><b>Inverted</b> (downward sloping): forward rates lie below spot rates; often read as a sign that rates are expected to fall.</li>
  <li><b>Flat</b>: every spot and forward rate is the same.</li>
  <li><b>Humped</b>: rises then falls.</li>
</ul>`,
      example: {
        title: 'Worked example: forwards from spots',
        html: t`<p>Spot rates are <span class="tex">s_1 = 2\%</span>, <span class="tex">s_2 = 3\%</span>, <span class="tex">s_3 = 3.5\%</span>.</p>
<div class="texd">f_1 = \frac{1.03^2}{1.02} - 1 = 4.01\%, \qquad f_2 = \frac{1.035^3}{1.03^2} - 1 = 4.51\%</div>
<p>The 2-year forward rate from time 1 to 3 is <span class="tex">(1.035^3/1.02)^{1/2} - 1 = 4.26\%</span>. On this upward-sloping curve, each forward rate is above the spot rates.</p>`,
      },
      checks: [
        { q: t`<span class="tex">s_1 = 5\%</span> and <span class="tex">s_2 = 4.5\%</span>. Find the forward rate <span class="tex">f_1</span> from time 1 to time 2.`,
          opts: ['4.00%', '4.50%', '4.75%', '5.00%'], correct: 0,
          explain: t`<span class="tex">1.045^2/1.05 - 1 = 4.00\%</span>. The curve is inverted, so the forward rate is below both spot rates.` },
        { q: t`If the yield curve is flat at 4%, the forward rate from year 5 to year 6 is`,
          opts: ['below 4%', 'exactly 4%', 'above 4%', '20%'], correct: 1,
          explain: t`<span class="tex">1 + f_5 = 1.04^6/1.04^5 = 1.04</span>. On a flat curve every forward rate equals the common spot rate.` },
      ],
    },
    {
      id: 'fm-bd-spot-pricing', title: 'Pricing with spot rates and par yields', short: 'Par yields', topic: 'termstruct', minutes: 8,
      body: t`
<p>With a term structure, discount each cash flow at the spot rate for its own date:</p>
<div class="texd">P = \sum_{t=1}^{n} \frac{CF_t}{(1 + s_t)^t}</div>
<p>A coupon bond is a bundle of zero-coupon bonds, one for each payment, so this is the only price consistent with the zero-coupon market. Any other price creates an arbitrage: buy the cheap side, sell the rich side, and lock in a riskless profit.</p>
<p>The bond's yield to maturity is still the single rate that reproduces <span class="tex">P</span>. It is a weighted blend of the spot rates, dominated by the large final payment, so it sits close to (but not equal to) <span class="tex">s_n</span>.</p>
<p>The <b>par yield</b> <span class="tex">c_n</span> is the coupon rate that makes an <span class="tex">n</span>-year annual-coupon bond sell at par. Setting the price of a 1-unit bond to 1, with <span class="tex">v_t = (1+s_t)^{-t}</span>:</p>
<div class="texd">1 = c_n\,(v_1 + \cdots + v_n) + v_n \;\Longrightarrow\; c_n = \frac{1 - v_n}{v_1 + v_2 + \cdots + v_n}</div>
<p>On an upward-sloping curve the par yield lies below the <span class="tex">n</span>-year spot rate, because the coupons are discounted at the lower short rates.</p>`,
      example: {
        title: 'Worked example: price and par yield on one curve',
        html: t`<p>With <span class="tex">s_1 = 2\%</span>, <span class="tex">s_2 = 3\%</span>, <span class="tex">s_3 = 3.5\%</span>, a 3-year 1,000 par bond with 4% annual coupons costs</p>
<div class="texd">P = \frac{40}{1.02} + \frac{40}{1.03^2} + \frac{1040}{1.035^3} = 39.22 + 37.70 + 938.02 = 1{,}014.94</div>
<p>The discount factors are 0.98039, 0.94260 and 0.90194, so the 3-year par yield is</p>
<div class="texd">c_3 = \frac{1 - 0.90194}{0.98039 + 0.94260 + 0.90194} = \frac{0.09806}{2.82493} = 3.47\%</div>
<p>That is just below <span class="tex">s_3 = 3.5\%</span>, as expected on a rising curve. A 4% coupon is above the par yield, so the bond sells at a premium.</p>`,
      },
      checks: [
        { q: t`The 2-year spot rate is 4%. Find the price of a 2-year zero-coupon bond paying 1,000.`,
          opts: ['920.00', '924.56', '925.93', '961.54'], correct: 1,
          explain: t`<span class="tex">1000/1.04^2 = 924.56</span>. 925.93 uses simple interest <span class="tex">1000/1.08</span>, and 961.54 discounts for only one year.` },
        { q: t`With <span class="tex">s_1 = 3\%</span> and <span class="tex">s_2 = 4\%</span>, find the 2-year par yield.`,
          opts: ['3.50%', '3.98%', '4.00%', '4.02%'], correct: 1,
          explain: t`<span class="tex">v_1 = 0.97087</span>, <span class="tex">v_2 = 0.92456</span>; <span class="tex">c_2 = (1 - 0.92456)/(0.97087 + 0.92456) = 3.98\%</span>, slightly below the 2-year spot rate.` },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
export const stepIndex = id => STEPS.findIndex(s => s.id === id);
