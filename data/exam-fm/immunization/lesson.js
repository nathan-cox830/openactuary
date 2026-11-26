// Exam FM · Duration, Immunization and Swaps lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Topics: duration (duration & convexity) · immunize (immunization & cash-flow matching) · swap (interest rate swaps).
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers were recomputed in Python.
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
const t = String.raw;

export const LESSON = {
  id: 'fm-immunization',
  title: 'Duration, Immunization and Swaps',
  steps: [
    {
      id: 'fm-im-macaulay', title: 'Macaulay duration', short: 'Macaulay duration', topic: 'duration', minutes: 8,
      body: t`
<p>An insurer holds bonds to pay future claims and annuity benefits. When interest rates move, the value of both the bonds and the promises changes. <b>Duration</b> measures how sensitive a present value is to that move, and it starts with a simple idea: <i>when, on average, does the money arrive?</i></p>
<p>For cash flows <span class="tex">C_t</span> at times <span class="tex">t</span>, valued at effective rate <span class="tex">i</span> with <span class="tex">v = 1/(1+i)</span>, the <b>Macaulay duration</b> is the average time of payment, weighted by present value:</p>
<div class="texd">D_{\text{mac}} = \frac{\sum_t t\,v^t C_t}{\sum_t v^t C_t} = \sum_t t \cdot w_t, \qquad w_t = \frac{v^t C_t}{P}</div>
<p>Each weight <span class="tex">w_t</span> is the share of today's price <span class="tex">P</span> that comes from time <span class="tex">t</span>. The weights are positive and add to 1, so the duration always sits between the first and last payment times.</p>
<ul>
  <li>A <b>zero-coupon bond</b> maturing at <span class="tex">n</span> has one payment, so <span class="tex">D_{\text{mac}} = n</span> at every interest rate.</li>
  <li>A coupon bond pays something before maturity, so its duration is <i>less</i> than its term. Larger coupons pull the duration earlier.</li>
  <li>A higher valuation rate shrinks the weight on distant payments more than on near ones, so duration <i>falls</i> as <span class="tex">i</span> rises.</li>
</ul>
<p>Weight by present value, not by the raw cash amounts. Using undiscounted amounts puts too much weight on the far end and overstates the duration.</p>`,
      example: {
        title: 'Worked example: a three-year coupon bond',
        html: t`<p>A 3-year bond has face 1,000 and annual coupons of 60. Value it at <span class="tex">i = 5\%</span>.</p>
<div class="texd">P = 60v + 60v^2 + 1060v^3 = 57.143 + 54.422 + 915.668 = 1027.232</div>
<div class="texd">D_{\text{mac}} = \frac{1(57.143) + 2(54.422) + 3(915.668)}{1027.232} = \frac{2912.99}{1027.232} \approx 2.836</div>
<p>About 89% of the value comes at time 3, so the duration is just under 3. A zero-coupon bond maturing at 3 would have duration exactly 3.</p>`,
      },
      checks: [
        { q: t`An 8-year zero-coupon bond is valued at <span class="tex">i = 4\%</span>. What is its Macaulay duration?`,
          opts: ['7.69', '8', '8.32', 'It depends on the face amount'], correct: 1,
          explain: t`A single payment at time 8 gets all the weight, so <span class="tex">D_{\text{mac}} = 8</span> at any rate and any face amount. (7.69 is <span class="tex">8/1.04</span>, the <i>modified</i> duration.)` },
        { q: t`Payments of 500 are due at times 1 and 2. Find the Macaulay duration at <span class="tex">i = 10\%</span>.`,
          opts: ['1.4762', '1.5000', '1.5238', '1.6000'], correct: 0,
          explain: t`<div class="texd">D = \frac{1(500/1.1) + 2(500/1.21)}{500/1.1 + 500/1.21} = \frac{454.55 + 826.45}{454.55 + 413.22} \approx 1.4762</div>The equal-weight answer 1.5 ignores discounting; the later payment is worth less today, so the duration is below 1.5.` },
        { q: 'For a 10-year annual coupon bond, what happens to its Macaulay duration when the yield rises?',
          opts: ['It rises', 'It falls', 'It stays at 10', 'It stays the same, but below 10'], correct: 1,
          explain: 'A higher yield discounts the late payments (including the face amount) more heavily, moving weight toward earlier coupons. The weighted-average time falls.' },
      ],
    },
    {
      id: 'fm-im-modified', title: 'Modified duration and price sensitivity', short: 'Modified duration', topic: 'duration', minutes: 8,
      body: t`
<p>Price is a function of the rate: <span class="tex">P(i) = \sum_t C_t (1+i)^{-t}</span>. Its slope tells you how much value is lost when rates rise. Dividing by the price turns that into a percentage, the <b>modified duration</b>:</p>
<div class="texd">D_{\text{mod}} = -\frac{P'(i)}{P(i)} = \frac{\sum_t t\,C_t (1+i)^{-t-1}}{P(i)} = \frac{D_{\text{mac}}}{1+i}</div>
<p>Modified duration answers the question: <i>for a 1% rise in the rate, roughly what percent of value is lost?</i> A bond with <span class="tex">D_{\text{mod}} = 7</span> loses about 7% of its price when rates move up by one percentage point.</p>
<p><b>In terms of the force of interest.</b> Write the price as <span class="tex">P(\delta) = \sum_t C_t e^{-\delta t}</span>. Differentiating with respect to <span class="tex">\delta</span> brings down a factor of <span class="tex">t</span> with no extra discount:</p>
<div class="texd">-\frac{P'(\delta)}{P(\delta)} = \frac{\sum_t t\,C_t e^{-\delta t}}{P(\delta)} = D_{\text{mac}}</div>
<p>So the Macaulay duration is the sensitivity to <span class="tex">\delta</span>, and the modified duration is the sensitivity to <span class="tex">i</span>. Under continuous compounding the two are the same number.</p>
<p>A useful closed form: a level perpetuity-immediate has <span class="tex">D_{\text{mac}} = (1+i)/i</span> and <span class="tex">D_{\text{mod}} = 1/i</span>.</p>`,
      example: {
        title: 'Worked example: from Macaulay to modified',
        html: t`<p>A bond portfolio has Macaulay duration 6.2 at <span class="tex">i = 4\%</span>.</p>
<div class="texd">D_{\text{mod}} = \frac{6.2}{1.04} \approx 5.9615</div>
<p>If rates rise to 4.25% (a change of 0.0025), the value drops by roughly <span class="tex">0.0025 \times 5.9615 \approx 1.49\%</span>. The same portfolio has <span class="tex">-P'(\delta)/P = 6.2</span>: measured against the force of interest, its sensitivity is the Macaulay duration.</p>`,
      },
      checks: [
        { q: t`A bond has Macaulay duration 7.35 at <span class="tex">i = 5\%</span>. Find its modified duration.`,
          opts: ['6.98', '7.00', '7.35', '7.72'], correct: 1,
          explain: t`<span class="tex">D_{\text{mod}} = 7.35/1.05 = 7.00</span>. Multiplying instead of dividing gives 7.72.` },
        { q: t`A level perpetuity-immediate is valued at <span class="tex">i = 5\%</span>. Find its modified duration.`,
          opts: ['19', '20', '21', '25'], correct: 1,
          explain: t`<span class="tex">P = 1/i</span>, so <span class="tex">P'(i) = -1/i^2</span> and <span class="tex">-P'/P = 1/i = 20</span>. The Macaulay duration is <span class="tex">(1+i)/i = 21</span>.` },
        { q: t`Which quantity equals <span class="tex">-P'(\delta)/P(\delta)</span>, the sensitivity of price to the force of interest?`,
          opts: ['Modified duration', 'Macaulay duration', 'Modified convexity', t`Macaulay duration divided by <span class="tex">1+i</span>`], correct: 1,
          explain: t`Differentiating <span class="tex">e^{-\delta t}</span> gives <span class="tex">-t e^{-\delta t}</span>, so <span class="tex">-P'(\delta)/P</span> is the present-value-weighted average time: the Macaulay duration. The last option is the modified duration.` },
      ],
    },
    {
      id: 'fm-im-approx', title: 'Portfolio duration and first-order approximations', short: 'Price approximations', topic: 'duration', minutes: 9,
      body: t`
<p><b>Portfolios.</b> Present values add, and so do their slopes. When every holding is valued at the same rate, the portfolio's duration is the average of the holdings' durations weighted by market value:</p>
<div class="texd">D_{\text{portfolio}} = \sum_k \frac{P_k}{P}\,D_k, \qquad P = \sum_k P_k</div>
<p>This works for Macaulay and for modified duration. Weight by price (market value), not by face amount or number of bonds.</p>
<p><b>First-order (modified-duration) approximation.</b> A tangent line at the current rate <span class="tex">i_0</span>:</p>
<div class="texd">P(i) \approx P(i_0)\left[1 - (i - i_0)\,D_{\text{mod}}\right]</div>
<p><b>First-order Macaulay approximation.</b> Treat the whole asset as if it were a single payment at time <span class="tex">D_{\text{mac}}</span>:</p>
<div class="texd">P(i) \approx P(i_0)\left(\frac{1+i_0}{1+i}\right)^{D_{\text{mac}}}</div>
<p>Both agree for small rate changes. The Macaulay version follows the curve of the true price better, and it is exact for a zero-coupon bond. The straight-line version always understates the price for bonds with ordinary positive cash flows, because the true price curve bends upward (next step).</p>`,
      example: {
        title: 'Worked example: two estimates of the same move',
        html: t`<p>A bond priced at 1,000 at <span class="tex">i_0 = 5\%</span> has Macaulay duration 8, so <span class="tex">D_{\text{mod}} = 8/1.05 \approx 7.619</span>. Rates rise to 6%.</p>
<div class="texd">\text{Modified: } 1000\left[1 - 0.01(7.619)\right] \approx 923.81</div>
<div class="texd">\text{Macaulay: } 1000\left(\frac{1.05}{1.06}\right)^{8} \approx 926.97</div>
<p>If the bond is an 8-year zero, the Macaulay estimate 926.97 is exact and the straight line is 3.16 too low.</p>`,
      },
      checks: [
        { q: 'A fund holds 600 (market value) of a bond with duration 4 and 400 of a bond with duration 9, both valued at the same yield. Find the portfolio duration.',
          opts: ['5.0', '6.0', '6.5', '7.0'], correct: 1,
          explain: t`<span class="tex">0.6(4) + 0.4(9) = 6.0</span>. The simple average of 4 and 9 is 6.5, which ignores how much money is in each bond.` },
        { q: t`A portfolio worth 2,500 has modified duration 6. Use the first-order approximation to estimate its value if rates rise by 0.5 percentage points.`,
          opts: ['2,350', '2,425', '2,487.50', '2,575'], correct: 1,
          explain: t`<span class="tex">2500\left[1 - 0.005(6)\right] = 2500(0.97) = 2{,}425</span>. 2,575 moves value the wrong way: higher rates mean lower prices.` },
        { q: t`A bond priced at 1,000 at 4% has Macaulay duration 5. Use the first-order Macaulay approximation to estimate its price at 5%.`,
          opts: ['951.92', '953.28', '950.00', '1,047.62'], correct: 1,
          explain: t`<span class="tex">1000(1.04/1.05)^5 \approx 953.28</span>. The modified-duration line gives <span class="tex">1000(1 - 0.01 \cdot 5/1.04) \approx 951.92</span>, and 950 forgets to convert to modified duration.` },
      ],
    },
    {
      id: 'fm-im-convexity', title: 'Convexity and the second-order approximation', short: 'Convexity', topic: 'duration', minutes: 9,
      body: t`
<p>The price curve <span class="tex">P(i)</span> is not a straight line. It bends upward, so a tangent line sits below it. <b>Convexity</b> measures that bend, again as a fraction of price.</p>
<div class="texd">C_{\text{mod}} = \frac{P''(i)}{P(i)} = \frac{\sum_t t(t+1)\,C_t (1+i)^{-t-2}}{P(i)}</div>
<div class="texd">C_{\text{mac}} = \frac{P''(\delta)}{P(\delta)} = \frac{\sum_t t^2\,v^t C_t}{P}</div>
<p>The Macaulay convexity is the present-value-weighted average of <span class="tex">t^2</span>. The two are linked by <span class="tex">C_{\text{mod}} = (C_{\text{mac}} + D_{\text{mac}})/(1+i)^2</span>. For a zero-coupon bond maturing at <span class="tex">n</span>: <span class="tex">C_{\text{mac}} = n^2</span> and <span class="tex">C_{\text{mod}} = n(n+1)/(1+i)^2</span>.</p>
<p><b>Second-order approximation.</b> Add the curvature term of a Taylor series:</p>
<div class="texd">\frac{P(i) - P(i_0)}{P(i_0)} \approx -(i - i_0)\,D_{\text{mod}} + \frac{(i - i_0)^2}{2}\,C_{\text{mod}}</div>
<p>The convexity term is positive whichever way rates move. Between two holdings with the same duration, the one whose cash flows are more spread out (a "barbell" of short and long bonds) has more convexity than one concentrated near the duration (a "bullet"). That spread is the key to immunization.</p>`,
      example: {
        title: 'Worked example: a 10-year zero when rates rise 1%',
        html: t`<p>At 5%, a 10-year zero has <span class="tex">D_{\text{mod}} = 10/1.05 \approx 9.5238</span> and <span class="tex">C_{\text{mod}} = 110/1.05^2 \approx 99.773</span>. Rates move to 6%.</p>
<div class="texd">\text{First order: } -0.01(9.5238) = -9.524\%</div>
<div class="texd">\text{Second order: } -9.524\% + \tfrac{0.0001}{2}(99.773) = -9.524\% + 0.499\% = -9.025\%</div>
<p>The exact change is <span class="tex">(1.05/1.06)^{10} - 1 \approx -9.043\%</span>. Adding convexity removed almost all of the error.</p>`,
      },
      checks: [
        { q: 'Find the Macaulay convexity of a 6-year zero-coupon bond.',
          opts: ['6', '36', '42', t`<span class="tex">42/(1+i)^2</span>`], correct: 1,
          explain: t`All the weight is at <span class="tex">t = 6</span>, so the weighted average of <span class="tex">t^2</span> is 36. <span class="tex">42/(1+i)^2</span> is the <i>modified</i> convexity.` },
        { q: t`A portfolio worth 1,000 has <span class="tex">D_{\text{mod}} = 8</span> and <span class="tex">C_{\text{mod}} = 80</span>. Rates rise by 1 percentage point. Use the second-order approximation.`,
          opts: ['916', '920', '924', '928'], correct: 2,
          explain: t`<span class="tex">1000\left[1 - 0.01(8) + \tfrac{0.0001}{2}(80)\right] = 1000(0.924) = 924</span>. Forgetting the <span class="tex">\tfrac12</span> gives 928; dropping convexity gives 920.` },
        { q: 'Two portfolios have the same value and the same duration of 7. Portfolio A is a single 7-year zero. Portfolio B splits its money between 2-year and 15-year zeros. Which has the larger convexity?',
          opts: ['A', 'B', 'They are equal, since durations match', 'It depends on the direction of the rate change'], correct: 1,
          explain: t`Convexity grows with the spread of payment times around the duration (<span class="tex">C_{\text{mac}} = D^2 + \text{spread}</span>). A has zero spread; B's barbell has a lot.` },
      ],
    },
    {
      id: 'fm-im-redington', title: 'Redington immunization', short: 'Redington', topic: 'immunize', minutes: 10,
      body: t`
<p>An insurer owes liabilities with present value <span class="tex">P_L(i)</span> and holds assets worth <span class="tex">P_A(i)</span>. Its <b>surplus</b> is <span class="tex">S(i) = P_A(i) - P_L(i)</span>. <b>Immunization</b> means arranging the assets so that a change in interest rates cannot hurt the surplus.</p>
<p><b>Redington immunization</b> protects against small, parallel changes from the current rate <span class="tex">i_0</span>. It asks that the surplus be zero and sit at a local <i>minimum</i>:</p>
<ol>
  <li><b>Values match:</b> <span class="tex">P_A(i_0) = P_L(i_0)</span>.</li>
  <li><b>Durations match:</b> <span class="tex">P_A'(i_0) = P_L'(i_0)</span>, equivalently <span class="tex">D_A = D_L</span> (Macaulay or modified, both sides the same kind).</li>
  <li><b>Assets more convex:</b> <span class="tex">P_A''(i_0) > P_L''(i_0)</span>, equivalently <span class="tex">C_A > C_L</span>.</li>
</ol>
<p>Conditions 1 and 2 make the surplus curve flat at zero. Condition 3 makes it bend up, so small moves either way leave the surplus positive. If the asset convexity were smaller, the same flat point would be a local maximum, and any move would create a loss.</p>
<p>The usual recipe with two zero-coupon assets maturing at <span class="tex">a \lt b</span>: put the fraction <span class="tex">w</span> of the liability value in the short asset so that <span class="tex">w\,a + (1-w)\,b = D_L</span>. Spreading the asset maturities around the liabilities is what supplies the extra convexity.</p>
<p>Limits: Redington is local. It says nothing about large moves, non-parallel shifts (short and long rates moving differently), and it must be rebalanced as time passes and rates change, because asset and liability durations drift apart.</p>`,
      example: {
        title: 'Worked example: two liabilities, two zero-coupon assets',
        html: t`<p>Liabilities: 1,000 at time 2 and 1,000 at time 4. Assets: zero-coupon bonds maturing at 1 and 5. Rate 6%.</p>
<div class="texd">P_L = 1000(1.06^{-2} + 1.06^{-4}) = 889.996 + 792.094 = 1682.09</div>
<div class="texd">D_L = \frac{2(889.996) + 4(792.094)}{1682.09} \approx 2.9418</div>
<p>Solve <span class="tex">w(1) + (1-w)(5) = 2.9418</span>: <span class="tex">w = 0.51455</span>. Invest <span class="tex">0.51455 \times 1682.09 \approx 865.52</span> in the 1-year zero (face 917.45) and 816.57 in the 5-year zero (face 1,092.75).</p>
<p>Check convexity (Macaulay): assets <span class="tex">0.51455(1) + 0.48545(25) \approx 12.65</span>; liabilities <span class="tex">(4(889.996) + 16(792.094))/1682.09 \approx 9.65</span>. Assets are more convex, so the surplus is a local minimum at 6%: it is about 0.23 at 5% and 0.22 at 7%.</p>`,
      },
      checks: [
        { q: 'Which of these is <b>not</b> one of Redington\'s conditions?',
          opts: ['PV of assets equals PV of liabilities', 'Duration of assets equals duration of liabilities', 'Convexity of assets exceeds convexity of liabilities', 'Every asset matures after the last liability'], correct: 3,
          explain: 'Redington needs value, duration and convexity conditions at the current rate. Asset timing only matters through those three numbers; in fact assets maturing before and after the liabilities are what supply convexity.' },
        { q: 'Liabilities have duration 6. You will use zero-coupon bonds maturing at 3 and 10. What fraction of the money goes into the 10-year bond?',
          opts: ['0.3000', '0.4286', '0.5714', '0.6000'], correct: 1,
          explain: t`Solve <span class="tex">3(1-w) + 10w = 6</span>: <span class="tex">w = 3/7 \approx 0.4286</span>. 0.5714 is the share for the 3-year bond.` },
        { q: 'A portfolio matches the value and duration of the liabilities, but its convexity is <b>smaller</b> than theirs. What happens to the surplus after a small parallel rate change?',
          opts: ['It rises whether rates go up or down', 'It falls whether rates go up or down', 'It rises only if rates go up', 'It stays exactly zero'], correct: 1,
          explain: t`With <span class="tex">S(i_0) = S'(i_0) = 0</span> and <span class="tex">S''(i_0) \lt 0</span>, the surplus is a local maximum of 0, so any small move makes it negative.` },
      ],
    },
    {
      id: 'fm-im-full', title: 'Full immunization', short: 'Full immunization', topic: 'immunize', minutes: 9,
      widget: 'immunize',
      body: t`
<p>Redington protects against small shifts. <b>Full immunization</b> is stronger: the surplus is non-negative for <i>any</i> parallel change in a flat interest rate, large or small.</p>
<p>The classic case is a single liability <span class="tex">L</span> due at time <span class="tex">t</span>, covered by two zero-coupon assets that bracket it: <span class="tex">A</span> due at <span class="tex">t - a</span> and <span class="tex">B</span> due at <span class="tex">t + b</span>, with <span class="tex">a, b > 0</span>. The conditions are</p>
<div class="texd">\text{PV match: } A(1+i)^{-(t-a)} + B(1+i)^{-(t+b)} = L(1+i)^{-t}</div>
<div class="texd">\text{Duration match: } (t-a)A(1+i)^{-(t-a)} + (t+b)B(1+i)^{-(t+b)} = tL(1+i)^{-t}</div>
<p>Measured in time-<span class="tex">t</span> dollars these simplify to <span class="tex">A(1+i)^a + B(1+i)^{-b} = L</span> and <span class="tex">aA(1+i)^a = bB(1+i)^{-b}</span>, which solve to</p>
<div class="texd">A(1+i)^{a} = \frac{b}{a+b}\,L, \qquad B(1+i)^{-b} = \frac{a}{a+b}\,L</div>
<p>The asset closer to the liability gets the larger share. Why it works for every rate: the surplus valued at time <span class="tex">t</span> is <span class="tex">f(j) = A(1+j)^a + B(1+j)^{-b} - L</span>. This function is convex in <span class="tex">j</span>, and the two conditions make <span class="tex">f = 0</span> and <span class="tex">f' = 0</span> at <span class="tex">j = i</span>, so <span class="tex">f(j) \ge 0</span> everywhere.</p>
<p>Full immunization of several liabilities works the same way, one bracketing pair per liability. It still assumes a flat yield curve that shifts in parallel.</p>
<p>Use the immunization explorer below: move the two asset maturities and the rate shock and watch the PV, duration and convexity of each side, and the surplus curve as rates move. Notice the surplus touching zero at the current rate and staying above it on both sides.</p>`,
      example: {
        title: 'Worked example: a liability at time 5',
        html: t`<p>An insurer owes 10,000 at time 5 and will hold zero-coupon bonds maturing at 3 and 8, at <span class="tex">i = 6\%</span>. Here <span class="tex">a = 2</span> and <span class="tex">b = 3</span>.</p>
<div class="texd">A(1.06)^2 = \tfrac{3}{5}(10{,}000) = 6{,}000 \;\Rightarrow\; A = 6000/1.1236 \approx 5{,}339.98</div>
<div class="texd">B(1.06)^{-3} = \tfrac{2}{5}(10{,}000) = 4{,}000 \;\Rightarrow\; B = 4000(1.191016) \approx 4{,}764.06</div>
<p>If the rate jumps to 8% immediately, the PV of the surplus is about +7.09; at 4% it is about +9.01. It is never negative.</p>`,
      },
      checks: [
        { q: t`A liability of 5,000 is due at time 6. It is fully immunized at <span class="tex">i = 5\%</span> with zero-coupon bonds maturing at 4 and 9. Find the face amount of the 4-year bond.`,
          opts: ['2,000.00', '2,721.09', '3,000.00', '3,307.53'], correct: 1,
          explain: t`<span class="tex">a = 2</span>, <span class="tex">b = 3</span>: <span class="tex">A(1.05)^2 = \tfrac35(5000) = 3000</span>, so <span class="tex">A = 3000/1.1025 \approx 2{,}721.09</span>. (3,307.53 multiplies by <span class="tex">1.05^2</span> instead of dividing.)` },
        { q: 'Which pair of zero-coupon maturities can fully immunize a single liability due at time 7?',
          opts: ['3 and 5', '8 and 12', '5 and 10', '2 and 6'], correct: 2,
          explain: 'The assets must bracket the liability: one before time 7 and one after. Only 5 and 10 do.' },
        { q: 'What does full immunization guarantee that Redington immunization does not?',
          opts: ['A positive surplus for non-parallel yield-curve shifts', 'A non-negative surplus for any parallel shift of a flat rate, however large', 'No need to know the current interest rate', 'Equal convexity of assets and liabilities'], correct: 1,
          explain: 'Redington only protects locally. Full immunization holds for every size of parallel shift, but still not for twists in the yield curve.' },
      ],
    },
    {
      id: 'fm-im-matching', title: 'Exact cash-flow matching (dedication)', short: 'Cash-flow matching', topic: 'immunize', minutes: 8,
      body: t`
<p>The most direct protection is to buy assets whose cash flows equal the liability cash flows at every date. This is <b>exact cash-flow matching</b>, also called a <b>dedicated portfolio</b>. Since every payment is covered by an asset payment on the same day, nothing has to be reinvested or sold early, and interest rate changes cannot hurt.</p>
<p><b>Work backward from the last liability.</b> With coupon bonds, each bond pays coupons at earlier dates too:</p>
<ol>
  <li>Buy enough of the longest bond that its final coupon plus face covers the last liability: <span class="tex">F_n(1 + r_n) = L_n</span>.</li>
  <li>Subtract that bond's coupons from all earlier liabilities.</li>
  <li>Repeat with the next-longest bond on what remains, and so on back to time 1.</li>
</ol>
<p>The cost is the sum of the bonds' prices. Trade-offs: matching removes interest rate risk entirely, but the exact bonds may not exist, and the portfolio is usually more expensive than an immunized one. It also leaves default risk on the bonds.</p>`,
      example: {
        title: 'Worked example: two years of liabilities',
        html: t`<p>Liabilities: 1,000 at time 1 and 2,000 at time 2. Available: a 1-year zero yielding 4%, and a 2-year bond with 5% annual coupons yielding 5% (so it sells at par).</p>
<p>Time 2: <span class="tex">F_2(1.05) = 2000</span>, so <span class="tex">F_2 \approx 1{,}904.76</span>. It also pays a coupon of <span class="tex">0.05(1904.76) \approx 95.24</span> at time 1.</p>
<p>Time 1: the zero must cover <span class="tex">1000 - 95.24 = 904.76</span>.</p>
<div class="texd">\text{Cost} = \frac{904.76}{1.04} + 1904.76 \approx 869.96 + 1904.76 = 2{,}774.73</div>`,
      },
      checks: [
        { q: 'Liabilities are 500 at time 1 and 1,500 at time 2. You buy a 2-year bond with 6% annual coupons to cover time 2 exactly, and 1-year zero-coupon bonds for the rest. Find the face amount of 1-year zeros.',
          opts: ['410.00', '415.09', '500.00', '584.91'], correct: 1,
          explain: t`<span class="tex">F(1.06) = 1500</span> gives <span class="tex">F \approx 1{,}415.09</span>, with a time-1 coupon of 84.91. Zeros cover <span class="tex">500 - 84.91 = 415.09</span>. (410 takes the coupon on a face of 1,500 instead of 1,415.09; 500 forgets the coupon, and 584.91 adds it instead of subtracting.)` },
        { q: 'What is the main drawback of exact cash-flow matching compared with immunization?',
          opts: ['It leaves the insurer exposed to reinvestment risk', 'It is usually more expensive and the needed bonds may not exist', 'It only works for small rate changes', 'It requires assets more convex than the liabilities'], correct: 1,
          explain: 'Matching removes interest rate risk entirely (no reinvestment, no forced sales), but at a cost: it restricts which bonds can be held, and the required maturities may be hard to buy.' },
      ],
    },
    {
      id: 'fm-im-swap-rate', title: 'Interest rate swaps and the swap rate', short: 'Swap rate', topic: 'swap', minutes: 10,
      body: t`
<p>An <b>interest rate swap</b> is a contract between two <b>counterparties</b> to exchange interest payments on a <b>notional amount</b> that is never itself exchanged. The <b>payer</b> pays a fixed rate <span class="tex">R</span>, the <b>swap rate</b>; the <b>receiver</b> pays a floating rate, typically the one-year rate observed at the start of each period. Only the net difference changes hands.</p>
<p>The swap rate is set so the contract is worth zero at the start: the present value of fixed payments equals the present value of the expected floating payments (the forward rates). With zero-coupon bond prices <span class="tex">P_k = (1+s_k)^{-k}</span> from spot rates <span class="tex">s_k</span>, and one-year forward rates <span class="tex">f_k = P_{k-1}/P_k - 1</span>:</p>
<div class="texd">R\sum_{k=1}^{n} P_k = \sum_{k=1}^{n} P_k f_k = \sum_{k=1}^{n}(P_{k-1} - P_k) = 1 - P_n</div>
<div class="texd">R = \frac{1 - P_n}{\sum_{k=1}^{n} P_k}</div>
<p>So the swap rate is a weighted average of the forward rates, and it is also the coupon rate of an <span class="tex">n</span>-year par bond.</p>
<p><b>Deferred swaps.</b> If payments start at year <span class="tex">m+1</span> instead of year 1, the same argument gives <span class="tex">R = (P_m - P_n)/\sum_{k=m+1}^{n} P_k</span>.</p>
<p><b>Varying notional.</b> If the notional is <span class="tex">N_k</span> in year <span class="tex">k</span> (for example, amortizing with a loan), weight each year by <span class="tex">N_k P_k</span>:</p>
<div class="texd">R = \frac{\sum_k N_k P_k f_k}{\sum_k N_k P_k}</div>`,
      example: {
        title: 'Worked example: a three-year swap',
        html: t`<p>Spot rates are 3%, 3.5% and 4% for 1, 2 and 3 years.</p>
<div class="texd">P_1 = 1.03^{-1} = 0.970874, \quad P_2 = 1.035^{-2} = 0.933511, \quad P_3 = 1.04^{-3} = 0.888996</div>
<div class="texd">R = \frac{1 - 0.888996}{0.970874 + 0.933511 + 0.888996} = \frac{0.111004}{2.793381} \approx 3.974\%</div>
<p>The forward rates are 3.00%, 4.00% and 5.01%; the swap rate 3.974% is their average weighted by <span class="tex">P_k</span>. It is not the 3-year spot rate (4%) or the plain average of spot rates (3.5%).</p>`,
      },
      checks: [
        { q: 'Zero-coupon bond prices for 1, 2 and 3 years are 0.97, 0.93 and 0.89. Find the 3-year swap rate.',
          opts: ['3.667%', '3.943%', '4.000%', '4.396%'], correct: 1,
          explain: t`<span class="tex">R = (1 - 0.89)/(0.97 + 0.93 + 0.89) = 0.11/2.79 \approx 3.943\%</span>. 3.667% divides by 3 instead of the sum of prices.` },
        { q: 'With the same prices (0.97, 0.93, 0.89), find the swap rate for a swap that is deferred one year and makes payments at times 2 and 3.',
          opts: ['3.943%', '4.211%', '4.396%', '4.494%'], correct: 2,
          explain: t`<span class="tex">R = (P_1 - P_3)/(P_2 + P_3) = 0.08/1.82 \approx 4.396\%</span>. The deferred swap skips year 1's low forward rate, so its rate is higher.` },
        { q: t`Spot rates are 2% (1 year) and 3% (2 years). Find the 2-year swap rate.`,
          opts: ['2.500%', '2.985%', '3.000%', '4.010%'], correct: 1,
          explain: t`<span class="tex">P_1 = 1/1.02</span>, <span class="tex">P_2 = 1/1.03^2</span>, and <span class="tex">R = (1 - P_2)/(P_1 + P_2) \approx 0.057404/1.922988 \approx 2.985\%</span>. 4.01% is the year-2 forward rate.` },
      ],
    },
    {
      id: 'fm-im-swap-value', title: 'Swap settlements, market value and why insurers swap', short: 'Swap value & uses', topic: 'swap', minutes: 9,
      body: t`
<p><b>Net settlements.</b> In year <span class="tex">k</span> the payer owes <span class="tex">N R</span> and is owed <span class="tex">N r_k</span>, where <span class="tex">r_k</span> is the floating rate for that year. Only the difference is paid:</p>
<div class="texd">\text{net payment by the payer} = N\,(R - r_k)</div>
<p>A negative value means the payer receives money. The payer gains when rates rise above <span class="tex">R</span>.</p>
<p><b>Market value after rates change.</b> At inception the swap is worth zero. Later, rates move and the remaining payments have a new fair swap rate <span class="tex">R'</span> for the remaining term. Just after a settlement, with new zero-coupon prices <span class="tex">P'_k</span> for the remaining periods, the value to the payer is</p>
<div class="texd">V_{\text{payer}} = N\left[(1 - P'_n) - R\sum_k P'_k\right] = N\,(R' - R)\sum_k P'_k</div>
<p>The receiver's value is the negative of this. When rates rise, the payer's fixed rate looks cheap, so the payer's position gains value.</p>
<p><b>Why insurers use swaps.</b></p>
<ul>
  <li><b>Duration management.</b> A receive-fixed swap behaves like owning a fixed-rate bond funded at a floating rate. It lengthens asset duration without buying long bonds, helping match long annuity or life liabilities.</li>
  <li><b>Converting cash flows.</b> Turn floating-rate assets or borrowing into fixed (or the reverse) to match the liability side.</li>
  <li><b>Locking in rates.</b> A deferred swap fixes a rate for money that will be invested later.</li>
</ul>
<p>Swaps are cheap to enter, but they bring <b>counterparty risk</b>: the other side may default when the swap is worth something to you. Collateral and clearing houses reduce that risk.</p>`,
      example: {
        title: 'Worked example: a 3-year swap one year later',
        html: t`<p>A 3-year swap has notional 1,000,000 and swap rate 4%. In year 1 the floating rate is 3.2%, so the payer pays <span class="tex">1{,}000{,}000(0.04 - 0.032) = 8{,}000</span>.</p>
<p>Right after that settlement, the 1- and 2-year spot rates are 5% and 5.5%: <span class="tex">P'_1 \approx 0.952381</span>, <span class="tex">P'_2 \approx 0.898452</span>.</p>
<div class="texd">V_{\text{payer}} = 1{,}000{,}000\left[(1 - 0.898452) - 0.04(1.850833)\right] \approx 27{,}514.25</div>
<p>The new 2-year swap rate is about 5.487%. The payer locked in 4% while the market now charges 5.487%, so the payer's side is worth about 27,514.</p>`,
      },
      checks: [
        { q: 'A swap has notional 500,000 and swap rate 3.6%. This year the floating rate is 4.1%. What happens at settlement?',
          opts: ['The payer pays 2,500', 'The payer receives 2,500', 'The payer pays 18,000 and receives 20,500', 'No payment, since the notional is not exchanged'], correct: 1,
          explain: t`Net payment by the payer <span class="tex">= 500{,}000(0.036 - 0.041) = -2{,}500</span>, so the payer <i>receives</i> 2,500. Only the net amount is exchanged.` },
        { q: 'A swap with notional 1,000,000 and swap rate 3% has two years left. New zero-coupon prices are 0.96 and 0.92. Find the value to the fixed-rate payer.',
          opts: ['−23,600', '12,553', '23,600', '25,106'], correct: 2,
          explain: t`<span class="tex">1{,}000{,}000\left[(1 - 0.92) - 0.03(1.88)\right] = 1{,}000{,}000(0.08 - 0.0564) = 23{,}600</span>. Rates rose (new swap rate 4.255%), so the payer gains. 25,106 multiplies the rate difference by 2 instead of by the sum of prices.` },
        { q: 'An insurer\'s liabilities have a longer duration than its bonds. Which swap position moves it toward a duration match?',
          opts: ['Pay fixed, receive floating', 'Receive fixed, pay floating', 'Either, since swaps have zero value at inception', 'Neither: swaps do not affect duration'], correct: 1,
          explain: 'Receiving fixed is like holding a fixed-rate bond and owing a short floating-rate note. Its value rises when rates fall, adding duration to the asset side.' },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
export const stepIndex = id => STEPS.findIndex(s => s.id === id);
