// Exam FM · Interest and the Time Value of Money lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Topics: interest (interest & discount rates) · force (force of interest) · equiv (equations of value) ·
//         realrates (inflation & interest rate determinants).
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers were recomputed in Python.
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
const t = String.raw;

export const LESSON = {
  id: 'fm-tvm',
  title: 'Interest and the Time Value of Money',
  steps: [
    {
      id: 'fm-tv-accumulation', title: 'Accumulation functions: simple and compound interest', short: 'Simple vs compound', topic: 'interest', minutes: 8,
      body: t`
<p>A dollar today is worth more than a dollar next year, because today's dollar can be invested and earn interest. Everything in Exam FM rests on describing that growth carefully.</p>
<p>The <b>accumulation function</b> <span class="tex">a(t)</span> is the value at time <span class="tex">t</span> of 1 invested at time 0, so <span class="tex">a(0) = 1</span>. If you invest an amount <span class="tex">K</span>, the <b>amount function</b> is <span class="tex">A(t) = K\,a(t)</span>. The interest earned between two times is the change in <span class="tex">A</span>.</p>
<p>Two accumulation functions come up constantly:</p>
<div class="texd">\text{simple: } a(t) = 1 + it \qquad\qquad \text{compound: } a(t) = (1+i)^t</div>
<ul>
  <li>Under <b>simple interest</b>, interest is paid only on the original deposit, so the balance grows in a straight line.</li>
  <li>Under <b>compound interest</b>, interest earns interest. The balance grows geometrically, and over long horizons the gap becomes large.</li>
</ul>
<p>For whole periods past the first, compound beats simple. Inside the first period (<span class="tex">0 \lt t \lt 1</span>) simple interest actually gives slightly more, and at <span class="tex">t = 1</span> they agree. Unless a problem says otherwise, Exam FM assumes compound interest, including for fractions of a year.</p>`,
      example: {
        title: 'Worked example: a policyholder deposit',
        html: t`<p>A policyholder leaves 5,000 on deposit with an insurer for 4 years at 6%.</p>
<div class="texd">\text{simple: } 5000(1 + 0.06 \cdot 4) = 6{,}200.00 \qquad \text{compound: } 5000(1.06)^4 \approx 6{,}312.38</div>
<p>The extra 112.38 is interest earned on earlier interest. At half a year the order flips: <span class="tex">1 + 0.06(0.5) = 1.0300</span> but <span class="tex">1.06^{0.5} \approx 1.0296</span>.</p>`,
      },
      checks: [
        { q: t`2,000 is deposited at 5% <b>simple</b> interest. What is the balance after 3 years?`,
          opts: ['2,100.00', '2,150.00', '2,300.00', '2,315.25'], correct: 2,
          explain: t`<span class="tex">2000(1 + 0.05 \cdot 3) = 2300</span>. 2,315.25 is the compound answer <span class="tex">2000(1.05)^3</span>.` },
        { q: t`At the same rate <span class="tex">i > 0</span>, when does simple interest produce a larger balance than compound interest?`,
          opts: ['Never', t`For <span class="tex">0 \lt t \lt 1</span>`, t`For <span class="tex">t > 1</span>`, 'Always'], correct: 1,
          explain: t`Inside the first period, <span class="tex">1 + it > (1+i)^t</span>. They agree at <span class="tex">t = 0</span> and <span class="tex">t = 1</span>, and compound wins after that.` },
        { q: t`Under compound interest, 1,000 grows to 1,210 in 2 years. Find the annual effective rate.`,
          opts: ['9.50%', '10.00%', '10.50%', '21.00%'], correct: 1,
          explain: t`<span class="tex">(1+i)^2 = 1.21</span>, so <span class="tex">i = 0.10</span>. 10.50% treats the growth as simple interest (210 spread over 2 years), and 21% is the total growth.` },
      ],
    },
    {
      id: 'fm-tv-effective', title: 'Effective rates of interest', short: 'Effective rates', topic: 'interest', minutes: 7,
      body: t`
<p>The <b>effective rate of interest</b> for period <span class="tex">n</span> measures the interest earned during that period as a fraction of the balance at the <i>start</i> of the period:</p>
<div class="texd">i_n = \frac{A(n) - A(n-1)}{A(n-1)} = \frac{a(n) - a(n-1)}{a(n-1)}</div>
<p>It is the rate an investor actually experiences, with interest paid once at the end of the period. Usually the period is a year, and "annual effective rate" or just "<span class="tex">i</span>" means this quantity.</p>
<ul>
  <li><b>Compound interest</b> has the same effective rate every year: <span class="tex">i_n = i</span>.</li>
  <li><b>Simple interest</b> has a falling effective rate, <span class="tex">i_n = \dfrac{i}{1 + i(n-1)}</span>, because the same dollar amount of interest is measured against a growing balance.</li>
</ul>
<p>For any other amount function, such as a fund balance given by a formula, just compute the balances at the two ends of the period and divide the change by the starting balance.</p>`,
      example: {
        title: 'Worked example: simple interest slows down',
        html: t`<p>At 6% simple interest each year adds 0.06 per unit invested. In year 5 the balance starts at <span class="tex">1 + 0.06(4) = 1.24</span>, so</p>
<div class="texd">i_5 = \frac{0.06}{1.24} \approx 0.0484 = 4.84\%</div>
<p>A fund whose balance is <span class="tex">A(t) = 1000 + 40t^2</span> has <span class="tex">A(1) = 1040</span> and <span class="tex">A(2) = 1160</span>, so its effective rate in year 2 is <span class="tex">120/1040 \approx 11.54\%</span>.</p>`,
      },
      checks: [
        { q: t`<span class="tex">a(t) = 1 + 0.05t</span>. Find the effective rate of interest in year 4.`,
          opts: ['4.17%', '4.35%', '5.00%', '5.75%'], correct: 1,
          explain: t`<span class="tex">i_4 = \dfrac{a(4) - a(3)}{a(3)} = \dfrac{0.05}{1.15} \approx 4.35\%</span>. 4.17% divides by <span class="tex">a(4) = 1.20</span>, the end-of-year balance.` },
        { q: t`A fund has <span class="tex">A(t) = 1000 + 40t^2</span>. Which number is the effective rate in year 2?`,
          opts: ['8.00%', '10.34%', '11.54%', '12.00%'], correct: 2,
          explain: t`Interest in year 2 is <span class="tex">1160 - 1040 = 120</span>, divided by the starting balance 1,040. 10.34% divides by the ending balance, and 12% divides by the original 1,000.` },
      ],
    },
    {
      id: 'fm-tv-discount', title: 'Present value and effective rates of discount', short: 'Discount', topic: 'interest', minutes: 9,
      body: t`
<p>Running time backwards gives <b>present value</b>. The amount needed today to have 1 at time <span class="tex">t</span> is the <b>discount function</b> <span class="tex">1/a(t)</span>. Under compound interest it is <span class="tex">v^t</span>, where</p>
<div class="texd">v = \frac{1}{1+i}</div>
<p>is the <b>discount factor</b>. The present value of <span class="tex">K</span> due in <span class="tex">n</span> years is <span class="tex">K v^n</span>.</p>
<p>Interest is paid at the end of a period and measured against the starting balance. <b>Discount</b> is the same dollars measured against the <i>ending</i> balance, as if collected up front. The <b>effective rate of discount</b> is</p>
<div class="texd">d = \frac{a(1) - a(0)}{a(1)} = \frac{i}{1+i}</div>
<p>Think of a lender who lends 1,000 "at 6% discount": the 60 is taken out in advance, the borrower gets 940 and repays 1,000. The borrower really pays <span class="tex">60/940 \approx 6.38\%</span> interest. The identities to know cold:</p>
<div class="texd">d = iv, \qquad d = 1 - v, \qquad i = \frac{d}{1-d}, \qquad i - d = id</div>
<p>So <span class="tex">d \lt i</span> whenever <span class="tex">i > 0</span>, and under compound discount <span class="tex">v^n = (1-d)^n</span>.</p>`,
      example: {
        title: 'Worked example: funding a future claim payment',
        html: t`<p>An insurer will pay a structured settlement installment of 10,000 in 5 years. At <span class="tex">i = 4\%</span>, the amount to set aside today is</p>
<div class="texd">10000\,v^5 = \frac{10000}{1.04^5} \approx 8{,}219.27</div>
<p>The equivalent effective discount rate is <span class="tex">d = 0.04/1.04 \approx 3.846\%</span>, and <span class="tex">10000(1-d)^5</span> gives the same 8,219.27.</p>`,
      },
      checks: [
        { q: t`The annual effective rate of interest is 8%. Find the annual effective rate of discount.`,
          opts: ['7.41%', '8.00%', '8.70%', '92.59%'], correct: 0,
          explain: t`<span class="tex">d = i/(1+i) = 0.08/1.08 \approx 7.41\%</span>. 8.70% is <span class="tex">i/(1-i)</span>, the formula run the wrong way, and 92.59% is <span class="tex">v</span>.` },
        { q: t`The annual effective rate of discount is 5%. Find the annual effective rate of interest.`,
          opts: ['4.76%', '5.00%', '5.26%', '5.50%'], correct: 2,
          explain: t`<span class="tex">i = d/(1-d) = 0.05/0.95 \approx 5.26\%</span>. 4.76% treats 5% as an interest rate and converts it to discount.` },
        { q: t`Find the present value of 5,000 due in 3 years at an annual effective <b>discount</b> rate of 6%.`,
          opts: ['4,100.00', '4,152.92', '4,198.10', '4,700.00'], correct: 1,
          explain: t`<span class="tex">v = 1 - d = 0.94</span>, so the PV is <span class="tex">5000(0.94)^3 = 4152.92</span>. 4,198.10 uses 6% as an interest rate.` },
      ],
    },
    {
      id: 'fm-tv-nominal', title: 'Nominal rates of interest and discount', short: 'Nominal rates', topic: 'interest', minutes: 10,
      body: t`
<p>Banks and bond markets often quote a rate "convertible <span class="tex">m</span> times a year" (monthly <span class="tex">m=12</span>, quarterly 4, semiannually 2). That is a <b>nominal rate</b>, written <span class="tex">i^{(m)}</span>. The rate actually credited each <span class="tex">1/m</span> of a year is <span class="tex">i^{(m)}/m</span>, and the equivalent annual effective rate comes from compounding it <span class="tex">m</span> times:</p>
<div class="texd">\left(1 + \frac{i^{(m)}}{m}\right)^m = 1 + i</div>
<p>Nominal <b>discount</b> rates work the same way with discount taken up front each <span class="tex">1/p</span> of a year:</p>
<div class="texd">\left(1 - \frac{d^{(p)}}{p}\right)^{p} = 1 - d = v</div>
<p>Every rate in this lesson is just a different label for the same growth. To convert anything to anything, write the one-year accumulation both ways and set them equal:</p>
<div class="texd">\left(1 + \frac{i^{(m)}}{m}\right)^m = 1 + i = \frac{1}{1-d} = \left(1 - \frac{d^{(p)}}{p}\right)^{-p}</div>
<p>A useful sanity check: more frequent conversion means a smaller nominal interest rate is needed for the same effective rate, and nominal discount rates rise toward the same middle value from below.</p>`,
      example: {
        title: 'Worked example: comparing quotes',
        html: t`<p>A premium-financing loan is quoted at 12% convertible monthly. Its annual effective rate is</p>
<div class="texd">1.01^{12} - 1 \approx 12.68\%</div>
<p>The equivalent nominal discount rate convertible quarterly: each quarter's discount factor is <span class="tex">1.01^{-3}</span>, so</p>
<div class="texd">d^{(4)} = 4\left(1 - 1.01^{-3}\right) \approx 11.76\%</div>`,
      },
      checks: [
        { q: t`<span class="tex">i^{(4)} = 8\%</span>. Find the annual effective rate of interest.`,
          opts: ['2.00%', '8.00%', '8.24%', '8.30%'], correct: 2,
          explain: t`<span class="tex">(1.02)^4 - 1 \approx 8.24\%</span>. 8.30% would be 8% convertible monthly; 2% is just the quarterly rate.` },
        { q: t`The annual effective rate is 10%. Find the nominal rate of interest convertible semiannually.`,
          opts: ['5.00%', '9.76%', '10.00%', '10.25%'], correct: 1,
          explain: t`<span class="tex">i^{(2)} = 2\left(\sqrt{1.1} - 1\right) \approx 9.76\%</span>. 10.25% runs the conversion backwards, treating 10% as <span class="tex">i^{(2)}</span>.` },
        { q: t`<span class="tex">d^{(2)} = 6\%</span>. Find the annual effective rate of interest.`,
          opts: ['5.91%', '6.00%', '6.09%', '6.28%'], correct: 3,
          explain: t`<span class="tex">1 + i = (1 - 0.03)^{-2} = 1/0.9409</span>, so <span class="tex">i \approx 6.28\%</span>. 5.91% is the effective <i>discount</i> rate <span class="tex">1 - 0.97^2</span>, and 6.09% treats 6% as a nominal interest rate.` },
      ],
    },
    {
      id: 'fm-tv-force', title: 'Force of interest', short: 'Force of interest', topic: 'force', minutes: 8,
      body: t`
<p>Let the conversion frequency <span class="tex">m</span> grow without limit and nominal rates settle on a single number, the <b>force of interest</b> <span class="tex">\delta</span>: the instantaneous, continuously compounded growth rate. In general,</p>
<div class="texd">\delta_t = \frac{a'(t)}{a(t)} = \frac{d}{dt}\ln a(t)</div>
<p>When the force is constant, growth is exponential and</p>
<div class="texd">a(t) = e^{\delta t}, \qquad \delta = \ln(1+i), \qquad 1 + i = e^{\delta}, \qquad v = e^{-\delta}</div>
<p>For any positive rate, the measures line up in a fixed order (with <span class="tex">m > 1</span>):</p>
<div class="texd">d \lt d^{(m)} \lt \delta \lt i^{(m)} \lt i</div>
<p>Constant-force questions are usually quick: convert to <span class="tex">\delta</span> or to <span class="tex">i</span>, whichever the question uses, then accumulate or discount. Note that under simple interest the force is not constant: <span class="tex">\delta_t = i/(1 + it)</span> falls over time, matching the falling effective rate from earlier.</p>`,
      example: {
        title: 'Worked example: continuous compounding',
        html: t`<p>With <span class="tex">\delta = 5\%</span>, the annual effective rate is <span class="tex">e^{0.05} - 1 \approx 5.127\%</span>, and 1,000 grows over 10 years to</p>
<div class="texd">1000\,e^{0.05 \cdot 10} = 1000\,e^{0.5} \approx 1{,}648.72</div>`,
      },
      checks: [
        { q: t`<span class="tex">i = 6\%</span>. Find the force of interest.`,
          opts: ['5.66%', '5.83%', '6.00%', '6.18%'], correct: 1,
          explain: t`<span class="tex">\delta = \ln 1.06 \approx 5.83\%</span>. 6.18% is <span class="tex">e^{0.06} - 1</span>, the reverse conversion, and 5.66% is <span class="tex">d</span>.` },
        { q: t`With constant force <span class="tex">\delta = 4\%</span>, how much must be invested today to have 2,000 in 5 years?`,
          opts: ['1,600.00', '1,637.46', '1,643.85', '1,666.67'], correct: 1,
          explain: t`<span class="tex">2000\,e^{-0.04 \cdot 5} = 2000\,e^{-0.2} \approx 1637.46</span>. 1,643.85 treats 4% as an effective rate.` },
        { q: t`For a positive interest rate, which ordering is correct?`,
          opts: [t`<span class="tex">\delta \lt d \lt i</span>`, t`<span class="tex">d \lt \delta \lt i</span>`, t`<span class="tex">d \lt i \lt \delta</span>`, t`<span class="tex">i \lt \delta \lt d</span>`], correct: 1,
          explain: t`Discount rates sit below the force of interest and interest rates sit above it: <span class="tex">d \lt d^{(m)} \lt \delta \lt i^{(m)} \lt i</span>.` },
      ],
    },
    {
      id: 'fm-tv-varying-force', title: 'Varying force of interest', short: 'Varying force', topic: 'force', minutes: 10,
      body: t`
<p>When the force of interest changes over time, integrate it. Accumulating from time <span class="tex">t_1</span> to <span class="tex">t_2</span>:</p>
<div class="texd">\frac{a(t_2)}{a(t_1)} = \exp\!\left(\int_{t_1}^{t_2} \delta_s\,ds\right)</div>
<p>Discounting from <span class="tex">t_2</span> back to <span class="tex">t_1</span> uses the reciprocal, <span class="tex">\exp\left(-\int_{t_1}^{t_2}\delta_s\,ds\right)</span>. Only the forces <i>during</i> the interval matter.</p>
<p>Common patterns:</p>
<ul>
  <li><b>Polynomial</b>, such as <span class="tex">\delta_t = ct</span>: integrate directly to get <span class="tex">ct^2/2</span>.</li>
  <li><b>Reciprocal</b>, <span class="tex">\delta_t = \dfrac{k}{c+t}</span>: the integral is a log, and the exponential undoes it, giving <span class="tex">\left(\dfrac{c+t_2}{c+t_1}\right)^k</span>. With <span class="tex">k = 1</span> this is simple interest at rate <span class="tex">1/c</span>.</li>
  <li><b>Rational</b>, <span class="tex">\delta_t = \dfrac{t}{a+bt}</span>: rewrite as <span class="tex">\dfrac1b - \dfrac{a/b}{a+bt}</span>, so <span class="tex">\displaystyle\int_0^n \delta_t\,dt = \frac{n}{b} - \frac{a}{b^2}\ln\frac{a+bn}{a}</span>.</li>
</ul>
<p>A classic mistake is to multiply the force at the end by the length of the interval. That only works when the force is constant.</p>`,
      example: {
        title: 'Worked example: two varying forces',
        html: t`<p><b>Linear.</b> With <span class="tex">\delta_t = 0.01t</span>, 1,000 invested at time 2 is worth, at time 6,</p>
<div class="texd">1000\exp\!\left(\int_2^6 0.01t\,dt\right) = 1000\,e^{0.005(36-4)} = 1000\,e^{0.16} \approx 1{,}173.51</div>
<p><b>Rational.</b> With <span class="tex">\delta_t = \dfrac{t}{100 + 10t}</span> (so <span class="tex">a = 100, b = 10</span>), over 5 years</p>
<div class="texd">\int_0^5 \delta_t\,dt = \frac{5}{10} - \frac{100}{100}\ln\frac{150}{100} = 0.5 - \ln 1.5 \approx 0.09453</div>
<p>so 1,000 grows to <span class="tex">1000\,e^{0.09453} \approx 1{,}099.15</span>.</p>`,
      },
      checks: [
        { q: t`<span class="tex">\delta_t = 0.04t</span>. Find the value at time 3 of 500 invested at time 0.`,
          opts: ['563.75', '590.00', '598.61', '716.66'], correct: 2,
          explain: t`<span class="tex">\int_0^3 0.04t\,dt = 0.02(9) = 0.18</span>, so the value is <span class="tex">500e^{0.18} \approx 598.61</span>. 716.66 uses <span class="tex">\delta_3 \times 3 = 0.36</span>, and 590.00 uses <span class="tex">1 + 0.18</span> instead of <span class="tex">e^{0.18}</span>.` },
        { q: t`<span class="tex">\delta_t = \dfrac{2}{20+t}</span>. Find the present value at time 0 of 1,000 due at time 5.`,
          opts: ['606.53', '640.00', '800.00', '1,562.50'], correct: 1,
          explain: t`<span class="tex">a(5) = (25/20)^2 = 1.5625</span>, so the PV is <span class="tex">1000/1.5625 = 640</span>. 800 forgets the exponent 2, and 1,562.50 accumulates instead of discounting.` },
        { q: t`<span class="tex">\delta_t = \dfrac{1}{20+t}</span>. Which accumulation function does this produce?`,
          opts: [t`<span class="tex">1 + 0.05t</span>`, t`<span class="tex">1.05^t</span>`, t`<span class="tex">e^{0.05t}</span>`, t`<span class="tex">(1 - 0.05t)^{-1}</span>`], correct: 0,
          explain: t`<span class="tex">\exp\left(\int_0^t \frac{ds}{20+s}\right) = \frac{20+t}{20} = 1 + 0.05t</span>: simple interest at 5%.` },
      ],
    },
    {
      id: 'fm-tv-equations', title: 'Equations of value and solving for time or rate', short: 'Equations of value', topic: 'equiv', minutes: 11, widget: 'timeline',
      body: t`
<p>Money at different times can only be compared after moving it to a common date, the <b>focal date</b> (or comparison date). An <b>equation of value</b> says that, at the focal date, what goes in equals what comes out:</p>
<div class="texd">\sum (\text{deposits}) \times (\text{accumulate or discount to focal date}) = \sum (\text{withdrawals}) \times (\text{same})</div>
<p>Each payment is multiplied by <span class="tex">(1+i)^{T - t}</span> to reach focal date <span class="tex">T</span>: accumulated if it comes earlier, discounted if later. Under compound interest the choice of focal date never changes the answer, so choose one that makes the algebra short (often the date of the unknown payment).</p>
<p><b>Solving for time.</b> For a single deposit, take logs:</p>
<div class="texd">P(1+i)^n = K \;\Rightarrow\; n = \frac{\ln(K/P)}{\ln(1+i)}</div>
<p>The <b>rule of 72</b> is a mental shortcut for doubling: <span class="tex">n \approx 72 / (100i)</span>. At 8% money doubles in about 9 years (exactly 9.006). It is intuition, not an exam answer, but it is great for spotting a wrong choice.</p>
<p><b>Solving for the rate.</b> One deposit gives <span class="tex">i = (K/P)^{1/n} - 1</span>. With several payments there is usually no formula. Sometimes a substitution like <span class="tex">x = (1+i)^2</span> turns it into a quadratic; otherwise use the calculator's cash-flow worksheet or trial and error.</p>
<p>Use the timeline below to place payments at different times, set a rate, and watch how the present and future values change as you move the focal date.</p>`,
      example: {
        title: 'Worked example: replacing two payments with one',
        html: t`<p>A claimant is owed 1,000 now and 2,000 in 4 years. The insurer offers one payment <span class="tex">X</span> at time 2 instead. At 5%, with focal date 2:</p>
<div class="texd">X = 1000(1.05)^2 + 2000(1.05)^{-2} = 1102.50 + 1814.06 \approx 2{,}916.56</div>
<p>Using focal date 0 gives <span class="tex">X(1.05)^{-2} = 1000 + 2000(1.05)^{-4}</span>, the same equation multiplied through by <span class="tex">1.05^{-2}</span>, so the same <span class="tex">X</span>.</p>`,
      },
      checks: [
        { q: t`At an annual effective rate of 8%, about how long does it take money to double?`,
          opts: ['6.0 years', '8.0 years', '9.0 years', '12.5 years'], correct: 2,
          explain: t`Exactly, <span class="tex">\ln 2/\ln 1.08 \approx 9.006</span> years; the rule of 72 gives <span class="tex">72/8 = 9</span>. 12.5 years would be simple interest (<span class="tex">1/0.08</span>).` },
        { q: t`Payments of 500 now and 500 at time 2 are replaced by one payment at time 1. At <span class="tex">i = 10\%</span>, find that payment.`,
          opts: ['954.55', '1,000.00', '1,004.55', '1,050.00'], correct: 2,
          explain: t`<span class="tex">500(1.1) + 500/1.1 = 550 + 454.55 = 1004.55</span>. The other choices move only one payment, or neither.` },
        { q: t`4,000 grows to 5,000 in 4 years under compound interest. Find the annual effective rate.`,
          opts: ['5.00%', '5.74%', '6.25%', '25.00%'], correct: 1,
          explain: t`<span class="tex">i = 1.25^{1/4} - 1 \approx 5.74\%</span>. 6.25% spreads 25% evenly (simple interest).` },
      ],
    },
    {
      id: 'fm-tv-real-rates', title: 'Real and nominal rates: inflation', short: 'Real vs nominal', topic: 'realrates', minutes: 7,
      body: t`
<p>A quoted interest rate measures growth in dollars. Inflation erodes what each dollar buys. The <b>real interest rate</b> <span class="tex">r</span> measures growth in purchasing power. With quoted (nominal) rate <span class="tex">i</span> and inflation rate <span class="tex">\pi</span>, one dollar grows to <span class="tex">1+i</span> dollars, which buy <span class="tex">(1+i)/(1+\pi)</span> of today's goods:</p>
<div class="texd">1 + i = (1 + r)(1 + \pi) \qquad\Longrightarrow\qquad r = \frac{i - \pi}{1 + \pi}</div>
<p>This is the <b>Fisher equation</b>. The quick approximation <span class="tex">r \approx i - \pi</span> is fine for intuition but slightly overstates <span class="tex">r</span>; exam questions want the exact form.</p>
<p>Two consistent ways to value a cost that grows with inflation:</p>
<ul>
  <li>project the cost in future (nominal) dollars and discount at the nominal rate <span class="tex">i</span>, or</li>
  <li>keep the cost in today's (real) dollars and discount at the real rate <span class="tex">r</span>.</li>
</ul>
<p>Both give the same answer. Mixing them, such as discounting today's-dollar costs at <span class="tex">i</span>, is a common error. If inflation runs above the nominal rate, the real rate is negative: savers lose purchasing power even while their balance grows.</p>`,
      example: {
        title: 'Worked example: an insurer\'s investment return',
        html: t`<p>An insurer's portfolio earns 7% while inflation is 3%. The real return is</p>
<div class="texd">r = \frac{1.07}{1.03} - 1 \approx 3.88\%</div>
<p>The shortcut <span class="tex">7\% - 3\% = 4\%</span> is close but not exact. A claim that costs 10,000 in today's dollars and will be paid in 5 years with costs rising 3% a year has PV <span class="tex">10000(1.03)^5/(1.07)^5 \approx 8{,}265.46</span>: the same as discounting 10,000 for 5 years at the exact real rate <span class="tex">1.07/1.03 - 1</span>.</p>`,
      },
      checks: [
        { q: t`The nominal rate is 6% and inflation is 2%. Find the real rate.`,
          opts: ['3.00%', '3.92%', '4.00%', '8.12%'], correct: 1,
          explain: t`<span class="tex">r = 1.06/1.02 - 1 \approx 3.92\%</span>. 4.00% is the approximation <span class="tex">i - \pi</span>, and 8.12% multiplies when it should divide.` },
        { q: t`An investor wants a 3% real return and expects 4% inflation. What nominal rate is needed?`,
          opts: ['1.00%', '6.88%', '7.00%', '7.12%'], correct: 3,
          explain: t`<span class="tex">1 + i = 1.03 \times 1.04 = 1.0712</span>, so 7.12%. 7.00% adds the rates and misses the cross term <span class="tex">r\pi = 0.12\%</span>.` },
        { q: t`If expected inflation is higher than the nominal interest rate, the real rate is`,
          opts: ['negative', 'zero', 'positive but small', 'equal to the inflation rate'], correct: 0,
          explain: t`<span class="tex">r = (i - \pi)/(1+\pi) \lt 0</span> when <span class="tex">\pi > i</span>: balances grow in dollars but buy less.` },
      ],
    },
    {
      id: 'fm-tv-determinants', title: 'What determines interest rates', short: 'Rate determinants', topic: 'realrates', minutes: 7,
      body: t`
<p>Interest is the price of borrowing money, set by the supply of savings and the demand for loans. Why do different borrowers pay different rates at the same moment? A useful way to think about any quoted rate is as a stack of components:</p>
<div class="texd">\text{rate} \approx \underbrace{r^*}_{\text{real risk-free}} + \underbrace{IP}_{\text{inflation}} + \underbrace{DRP}_{\text{default}} + \underbrace{LP}_{\text{liquidity}} + \underbrace{MRP}_{\text{maturity}}</div>
<ul>
  <li><b>Real risk-free rate</b>: the reward for postponing consumption with no risk at all, driven by how much people want to save and how productive investment is.</li>
  <li><b>Inflation premium</b>: lenders expect to be repaid in cheaper dollars, so they ask for expected inflation on top. Real risk-free plus inflation premium is the nominal risk-free rate, roughly a short-term Treasury bill yield.</li>
  <li><b>Default risk premium</b>: compensation for the chance the borrower does not pay. It grows as credit quality falls.</li>
  <li><b>Liquidity premium</b>: extra yield for assets that are hard to sell quickly at a fair price.</li>
  <li><b>Maturity risk premium</b>: longer bonds lose more value when rates rise, so lenders usually want more for tying money up longer.</li>
</ul>
<p><b>The Federal Reserve.</b> The Fed sets a target range for the <b>federal funds rate</b>, the overnight rate banks charge each other, and steers it with tools such as the interest it pays on bank reserves and open market purchases and sales of securities. That directly moves short-term rates. Longer rates move more indirectly, through what markets expect about future Fed policy and inflation. When the Fed raises rates to fight inflation, borrowing costs rise across the economy and bond prices fall.</p>`,
      example: {
        title: 'Worked example: building a corporate bond yield',
        html: t`<p>Suppose the real risk-free rate is 1.5%, expected inflation is 2.5%, and a 10-year corporate bond carries a default premium of 1.2%, a liquidity premium of 0.3% and a maturity premium of 0.5%. Its yield is roughly</p>
<div class="texd">1.5 + 2.5 + 1.2 + 0.3 + 0.5 = 6.0\%</div>
<p>A 10-year Treasury, with no default or liquidity premium but the same maturity premium, would yield about <span class="tex">1.5 + 2.5 + 0.5 = 4.5\%</span>. The 1.5% gap is the bond's credit spread.</p>`,
      },
      checks: [
        { q: t`Which component compensates a lender for the chance the borrower fails to repay?`,
          opts: ['Inflation premium', 'Default risk premium', 'Liquidity premium', 'Maturity risk premium'], correct: 1,
          explain: t`The default risk premium. Liquidity is about selling the asset easily, and maturity is about the length of the commitment.` },
        { q: t`Which rate does the Federal Reserve most directly target?`,
          opts: ['The 30-year mortgage rate', 'The federal funds rate', 'Corporate bond yields', 'The inflation rate on consumer goods'], correct: 1,
          explain: t`The Fed sets a target range for the overnight federal funds rate. Mortgage and bond yields respond indirectly, and inflation is a goal rather than a rate it sets.` },
        { q: t`A short-term Treasury bill's yield is the usual stand-in for which quantity?`,
          opts: ['The nominal risk-free rate', 'The default risk premium', 'The maturity risk premium', 'The real interest rate on stocks'], correct: 0,
          explain: t`T-bills have essentially no default risk, are very liquid and are short, so their yield is about <span class="tex">r^* + IP</span>, the nominal risk-free rate.` },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
export const stepIndex = id => STEPS.findIndex(s => s.id === id);
