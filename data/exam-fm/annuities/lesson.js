// Exam FM · Annuities and Loans lesson content.
// Each step: { id, title, short, topic, minutes, body (HTML, rendered in .prose), widget?, example: { title, html }, checks: [...] }
// Topics: annuity (level annuities & perpetuities) · varying · loan (loans & amortization) · sinking (sinking funds & refinancing).
// Check questions: { q, opts: [html], correct: index, explain: html }. All numbers were recomputed in Python from cash-flow schedules.
// Math uses <span class="tex">…</span> / <div class="texd">…</div>, rendered by js/ui/katex.js.
// Annuity symbols: a_{\overline{n}|} (immediate), \ddot{a}_{\overline{n}|} (due), s for accumulated values.
const t = String.raw;

export const LESSON = {
  id: 'fm-annuities',
  title: 'Annuities and Loans',
  steps: [
    {
      id: 'fm-an-immediate', title: 'Annuity-immediate: present and accumulated value', short: 'Annuity-immediate', topic: 'annuity', minutes: 9,
      body: t`
<p>An <b>annuity</b> is a series of payments made at regular intervals. Car loans, mortgages, pension payouts, bond coupons and monthly savings plans are all annuities. Instead of discounting each payment one at a time, we use a handful of closed-form factors.</p>
<p>An <b>annuity-immediate</b> pays 1 at the <i>end</i> of each period for <span class="tex">n</span> periods. With interest rate <span class="tex">i</span> per period and <span class="tex">v = 1/(1+i)</span>, its present value one period before the first payment is a geometric series:</p>
<div class="texd">a_{\overline{n}|} = v + v^2 + \cdots + v^n = \frac{1 - v^n}{i}</div>
<p>Its <b>accumulated value</b> right after the last payment is</p>
<div class="texd">s_{\overline{n}|} = (1+i)^{n-1} + \cdots + (1+i) + 1 = \frac{(1+i)^n - 1}{i} = a_{\overline{n}|}(1+i)^n</div>
<p>Two habits keep these straight:</p>
<ul>
  <li><b>Draw the timeline.</b> <span class="tex">a_{\overline{n}|}</span> values the payments at time 0 when they fall at times 1 to <span class="tex">n</span>. <span class="tex">s_{\overline{n}|}</span> values them at time <span class="tex">n</span>, the moment of the last payment.</li>
  <li><b>Match the rate to the period.</b> If payments are monthly, <span class="tex">i</span> must be a monthly rate and <span class="tex">n</span> a number of months.</li>
</ul>
<p>A handy identity links the two factors: <span class="tex">\dfrac{1}{a_{\overline{n}|}} = \dfrac{1}{s_{\overline{n}|}} + i</span>. It reappears with sinking funds at the end of this lesson.</p>`,
      example: {
        title: 'Worked example: ten annual payments',
        html: t`<p>A payment of 1,000 is made at the end of each year for 10 years, at 5% annual effective interest.</p>
<div class="texd">a_{\overline{10}|} = \frac{1 - 1.05^{-10}}{0.05} = 7.721735 \quad\Rightarrow\quad PV = 1000 \times 7.721735 = 7{,}721.73</div>
<div class="texd">s_{\overline{10}|} = \frac{1.05^{10} - 1}{0.05} = 12.577893 \quad\Rightarrow\quad AV = 12{,}577.89</div>
<p>Check: <span class="tex">7{,}721.73 \times 1.05^{10} = 12{,}577.89</span>. Both values describe the same payments, measured at different dates.</p>`,
      },
      checks: [
        { q: t`Payments of 500 are made at the end of each year for 8 years. At 6% annual effective interest, find the present value.`,
          opts: ['3,104.90', '3,291.19', '4,000.00', '4,948.73'], correct: 0,
          explain: t`<span class="tex">500\,a_{\overline{8}|} = 500 \times 6.209794 = 3{,}104.90</span>. 3,291.19 treats the payments as due at the start of each year, 4,000 ignores interest, and 4,948.73 is the accumulated value <span class="tex">500\,s_{\overline{8}|}</span>.` },
        { q: t`A loan of 10,000 is repaid with 5 level payments at the end of each year at 4% annual effective. Find the payment.`,
          opts: ['2,000.00', '2,159.88', '2,246.27', '2,400.00'], correct: 2,
          explain: t`<span class="tex">10{,}000 / a_{\overline{5}|} = 10{,}000 / 4.451822 = 2{,}246.27</span>. 2,159.88 divides by <span class="tex">\ddot{a}_{\overline{5}|}</span> (payments at the start of each year), and 2,000 ignores interest.` },
        { q: t`Which expression equals <span class="tex">s_{\overline{n}|}</span>?`,
          opts: [t`<span class="tex">a_{\overline{n}|}\,v^n</span>`, t`<span class="tex">a_{\overline{n}|}(1+i)^n</span>`, t`<span class="tex">a_{\overline{n}|}(1+i)</span>`, t`<span class="tex">n(1+i)^n</span>`], correct: 1,
          explain: t`Both factors value the same <span class="tex">n</span> payments; moving the time-0 value forward <span class="tex">n</span> periods to time <span class="tex">n</span> multiplies by <span class="tex">(1+i)^n</span>.` },
      ],
    },
    {
      id: 'fm-an-due', title: 'Annuity-due', short: 'Annuity-due', topic: 'annuity', minutes: 7,
      body: t`
<p>An <b>annuity-due</b> pays at the <i>start</i> of each period: rent, insurance premiums and most savings plans work this way. Every payment arrives one period earlier than in an annuity-immediate, so every value is one period of interest larger:</p>
<div class="texd">\ddot{a}_{\overline{n}|} = 1 + v + \cdots + v^{n-1} = \frac{1 - v^n}{d} = (1+i)\,a_{\overline{n}|}</div>
<div class="texd">\ddot{s}_{\overline{n}|} = (1+i)^n + \cdots + (1+i) = \frac{(1+i)^n - 1}{d} = (1+i)\,s_{\overline{n}|}</div>
<p>Here <span class="tex">d = i/(1+i) = iv</span> is the effective rate of discount. The dots are the only difference in notation, but they change every answer by a factor of <span class="tex">1+i</span>, and exam distractors are built from exactly that slip.</p>
<p>Two shift identities help when tables or calculators are set up for one type only:</p>
<div class="texd">\ddot{a}_{\overline{n}|} = 1 + a_{\overline{n-1}|}, \qquad \ddot{s}_{\overline{n}|} = s_{\overline{n+1}|} - 1</div>
<p>Remember what each symbol measures. <span class="tex">\ddot{a}_{\overline{n}|}</span> is the value at the time of the <i>first</i> payment. <span class="tex">\ddot{s}_{\overline{n}|}</span> is the value one period <i>after</i> the last payment. The same cash flows can always be valued either way; the question's valuation date decides which symbol is convenient.</p>`,
      example: {
        title: 'Worked example: rent paid in advance',
        html: t`<p>A tenant pays 1,200 at the start of each year for 5 years. At 4% annual effective, the present value at the first payment is</p>
<div class="texd">1200\,\ddot{a}_{\overline{5}|} = 1200\left(1 + a_{\overline{4}|}\right) = 1200(1 + 3.629895) = 5{,}555.87</div>
<p>Valuing the same payments as an annuity-immediate gives <span class="tex">1200\,a_{\overline{5}|} = 5{,}342.19</span>, and indeed <span class="tex">5{,}342.19 \times 1.04 = 5{,}555.87</span>.</p>`,
      },
      checks: [
        { q: t`A saver deposits 300 at the start of each year for 12 years at 5% annual effective. Find the account balance at the end of year 12.`,
          opts: ['3,600.00', '4,775.14', '5,013.89', '5,264.59'], correct: 2,
          explain: t`<span class="tex">300\,\ddot{s}_{\overline{12}|} = 300 \times 1.05 \times 15.917127 = 5{,}013.89</span>. 4,775.14 is <span class="tex">300\,s_{\overline{12}|}</span>, which values the balance just after a 12th deposit made at the end of year 12; the deposits here were made a year earlier, so they earn one more year of interest.` },
        { q: t`The same payments are valued once as an annuity-due and once as an annuity-immediate, both at time 0. The ratio (due ÷ immediate) is`,
          opts: [t`<span class="tex">v</span>`, t`<span class="tex">1+i</span>`, t`<span class="tex">d</span>`, t`<span class="tex">(1+i)^n</span>`], correct: 1,
          explain: t`Each payment in the annuity-due arrives one period sooner, so each present value is larger by a factor of <span class="tex">1+i</span>: <span class="tex">\ddot{a}_{\overline{n}|} = (1+i)a_{\overline{n}|}</span>.` },
        { q: t`Which identity is correct?`,
          opts: [t`<span class="tex">\ddot{a}_{\overline{n}|} = 1 + a_{\overline{n-1}|}</span>`, t`<span class="tex">\ddot{a}_{\overline{n}|} = 1 + a_{\overline{n}|}</span>`, t`<span class="tex">\ddot{s}_{\overline{n}|} = s_{\overline{n}|} + 1</span>`, t`<span class="tex">\ddot{s}_{\overline{n}|} = s_{\overline{n-1}|} - 1</span>`], correct: 0,
          explain: t`An annuity-due of <span class="tex">n</span> payments is a payment of 1 now plus an annuity-immediate of the remaining <span class="tex">n-1</span> payments.` },
      ],
    },
    {
      id: 'fm-an-deferred', title: 'Deferred annuities and perpetuities', short: 'Deferred & perpetuities', topic: 'annuity', minutes: 8,
      body: t`
<p>A <b>deferred annuity</b> starts paying some time in the future. Value it in two moves: use an annuity factor to bring the payments to one convenient date, then discount that single amount back to today.</p>
<p>If the first of <span class="tex">n</span> payments is at time <span class="tex">k+1</span>, the payments look like an annuity-immediate that starts at time <span class="tex">k</span>:</p>
<div class="texd">{}_{k|}a_{\overline{n}|} = v^{k}\,a_{\overline{n}|} = a_{\overline{k+n}|} - a_{\overline{k}|}</div>
<p>The most common error is an off-by-one in the deferral. If the first payment is at time 5, the annuity-immediate "starts" at time 4, so the discount factor is <span class="tex">v^4</span>, not <span class="tex">v^5</span>. Equivalently, it is an annuity-due starting at time 5, discounted with <span class="tex">v^5</span>. Pick one view and draw the timeline.</p>
<p>A <b>perpetuity</b> pays forever. Letting <span class="tex">n \to \infty</span> makes <span class="tex">v^n \to 0</span>:</p>
<div class="texd">a_{\overline{\infty}|} = \frac{1}{i}, \qquad \ddot{a}_{\overline{\infty}|} = \frac{1}{d} = \frac{1+i}{i}</div>
<p>The intuition: a capital of <span class="tex">1/i</span> earns exactly 1 of interest each period, which can be paid out forever without touching the capital. Perpetuities price preferred stock, endowed scholarships and the "tail" of many longer problems.</p>`,
      example: {
        title: 'Worked example: payments starting in year 5',
        html: t`<p>At 6% annual effective, 2,000 is paid at the end of each year for 10 years, with the first payment at time 5 (payments at times 5 through 14).</p>
<div class="texd">PV = 2000\,v^{4}\,a_{\overline{10}|} = 2000 \times 0.792094 \times 7.360087 = 11{,}659.76</div>
<p>Using <span class="tex">v^5</span> by mistake gives 10,999.77, one year too much discounting.</p>
<p>A perpetuity of 500 per year at 4% is worth <span class="tex">500/0.04 = 12{,}500</span> if the first payment is in one year and <span class="tex">500/d = 500 \times 26 = 13{,}000</span> if the first payment is today.</p>`,
      },
      checks: [
        { q: t`At 5% annual effective, 1,000 is paid at the end of years 6, 7, 8, 9 and 10. Find the present value at time 0.`,
          opts: ['3,230.72', '3,392.26', '3,561.87', '4,329.48'], correct: 1,
          explain: t`The payments are an annuity-immediate starting at time 5: <span class="tex">1000\,v^5 a_{\overline{5}|} = 1000 \times 0.783526 \times 4.329477 = 3{,}392.26</span>. 3,230.72 discounts one year too many, 3,561.87 one year too few, and 4,329.48 forgets the deferral.` },
        { q: t`A scholarship pays 80 at the end of every year forever. At 5% annual effective, what fund is needed today?`,
          opts: ['1,523.81', '1,600.00', '1,680.00', '4,000.00'], correct: 1,
          explain: t`<span class="tex">80/0.05 = 1{,}600</span>. 1,680 (<span class="tex">80/d</span>) would be needed if the first payment were made today.` },
        { q: t`A perpetuity pays 100 per year with the first payment at the end of year 10. At 4% annual effective, find its present value.`,
          opts: ['1,688.91', '1,756.47', '1,826.73', '2,500.00'], correct: 1,
          explain: t`Value the perpetuity at time 9 (one year before its first payment): <span class="tex">100/0.04 = 2{,}500</span>. Then discount 9 years: <span class="tex">2500\,v^{9} = 1{,}756.47</span>. Discounting 10 years gives 1,688.91.` },
      ],
    },
    {
      id: 'fm-an-frequency', title: 'Payment frequency and continuous annuities', short: 'Other frequencies', topic: 'annuity', minutes: 8,
      body: t`
<p>Annuity factors assume one interest conversion per payment. When the payment period and the interest period differ, the most reliable fix is to <b>convert the rate to the payment period</b>, then use the ordinary formulas.</p>
<ul>
  <li><b>Payments more often than interest is quoted.</b> Monthly payments at annual effective rate <span class="tex">i</span>: use the monthly rate <span class="tex">j = (1+i)^{1/12} - 1</span> and <span class="tex">n = 12 \times</span> years. If the rate is quoted as a nominal <span class="tex">i^{(12)}</span>, then <span class="tex">j = i^{(12)}/12</span> directly.</li>
  <li><b>Payments less often than interest is quoted.</b> A payment every 2 years at annual rate <span class="tex">i</span>: use <span class="tex">j = (1+i)^2 - 1</span>. Equivalently, the present value of 1 at the end of every <span class="tex">k</span> years for <span class="tex">n</span> years is <span class="tex">a_{\overline{n}|}/s_{\overline{k}|}</span>.</li>
</ul>
<p>There is also standard notation for <span class="tex">m</span> payments of <span class="tex">1/m</span> per year (total 1 per year), using the nominal rate <span class="tex">i^{(m)}</span>:</p>
<div class="texd">a^{(m)}_{\overline{n}|} = \frac{1 - v^n}{i^{(m)}} = \frac{i}{i^{(m)}}\,a_{\overline{n}|}</div>
<p>As <span class="tex">m \to \infty</span> payments flow continuously. A <b>continuous annuity</b> paying at rate 1 per year for <span class="tex">n</span> years, with force of interest <span class="tex">\delta</span>, is worth</p>
<div class="texd">\bar{a}_{\overline{n}|} = \int_0^n v^t\,dt = \frac{1 - v^n}{\delta}, \qquad \bar{s}_{\overline{n}|} = \frac{(1+i)^n - 1}{\delta}</div>
<p>Continuous annuities model income that arrives smoothly, like rent from many tenants or a business's daily cash flow. They are worth slightly more than an annual annuity-immediate and slightly less than an annual annuity-due.</p>`,
      example: {
        title: 'Worked example: monthly and every-two-years payments',
        html: t`<p><b>Monthly.</b> 200 is paid at the end of each month for 3 years at 6% annual effective. The monthly rate is <span class="tex">j = 1.06^{1/12} - 1 = 0.486755\%</span>, so</p>
<div class="texd">PV = 200\,a_{\overline{36}|j} = 6{,}589.79</div>
<p>Using 0.5% (treating 6% as nominal) gives 6,574.20, and 2,400 per year as an annual annuity gives 6,415.23. Neither matches the stated terms.</p>
<p><b>Every two years.</b> 1,000 is paid at the end of every second year for 10 years (5 payments) at 5% annual effective. The two-year rate is <span class="tex">1.05^2 - 1 = 10.25\%</span>:</p>
<div class="texd">PV = 1000\,a_{\overline{5}|10.25\%} = 1000\,\frac{a_{\overline{10}|5\%}}{s_{\overline{2}|5\%}} = 3{,}766.70</div>`,
      },
      checks: [
        { q: t`500 is paid at the end of each quarter for 5 years. Interest is 8% annual effective. Find the present value.`,
          opts: ['7,985.42', '8,175.72', '8,221.14', '10,000.00'], correct: 2,
          explain: t`The quarterly rate is <span class="tex">j = 1.08^{1/4} - 1 = 1.942655\%</span>, and <span class="tex">500\,a_{\overline{20}|j} = 8{,}221.14</span>. 8,175.72 uses 2% per quarter (8% treated as nominal), and 7,985.42 lumps the payments into 2,000 at each year end.` },
        { q: t`Money flows continuously at 1,000 per year for 20 years, and the force of interest is 4%. Find its present value.`,
          opts: ['13,493.28', '13,590.33', '13,766.78', '20,000.00'], correct: 2,
          explain: t`<span class="tex">1000\,\bar{a}_{\overline{20}|} = 1000\,\dfrac{1 - e^{-0.8}}{0.04} = 13{,}766.78</span>. 13,493.28 is an annual annuity-immediate at the same force of interest, and 13,590.33 an annual annuity-immediate at 4% effective. Continuous payments arrive earlier on average, so they are worth more.` },
      ],
    },
    {
      id: 'fm-an-solve', title: 'Solving for the term or the rate', short: 'Solving for n or i', topic: 'annuity', minutes: 8,
      body: t`
<p>Sometimes the payment and present value are known and the unknown is the term or the rate.</p>
<p><b>Solving for n.</b> From <span class="tex">L = R\,a_{\overline{n}|}</span>:</p>
<div class="texd">1 - v^n = \frac{Li}{R} \quad\Rightarrow\quad n = \frac{-\ln\left(1 - Li/R\right)}{\ln(1+i)}</div>
<p>The answer is rarely a whole number. In practice the lender takes <span class="tex">\lfloor n \rfloor</span> full payments plus one smaller payment. Two conventions exist and the question will tell you which:</p>
<ul>
  <li><b>Drop payment:</b> a smaller payment one period after the last full payment.</li>
  <li><b>Balloon payment:</b> a larger final payment made together with the last full payment.</li>
</ul>
<p>Either way, find the remaining amount with an equation of value. The balance just after the last full payment, at time <span class="tex">k = \lfloor n \rfloor</span>, is <span class="tex">L(1+i)^k - R\,s_{\overline{k}|}</span>. A balloon adds that balance to the payment at time <span class="tex">k</span>; a drop payment is that balance accumulated one more period. Note that <span class="tex">Li &lt; R</span> is needed: if the payment does not cover the interest, the loan is never repaid.</p>
<p><b>Solving for i.</b> There is no closed form for <span class="tex">i</span> in <span class="tex">a_{\overline{n}|} = c</span>. On the exam, use your calculator's TVM keys (N, I/Y, PV, PMT, FV). By hand, bracket the answer between two rates and interpolate. One special case solves exactly: if both <span class="tex">a_{\overline{n}|}</span> and <span class="tex">s_{\overline{n}|}</span> are known, <span class="tex">i = 1/a_{\overline{n}|} - 1/s_{\overline{n}|}</span>.</p>`,
      example: {
        title: 'Worked example: a drop payment',
        html: t`<p>A loan of 20,000 at 6% annual effective is repaid with 2,500 at the end of each year for as long as needed, plus a smaller final payment one year after the last full payment.</p>
<div class="texd">n = \frac{-\ln(1 - 20000 \times 0.06/2500)}{\ln 1.06} = \frac{-\ln 0.52}{\ln 1.06} = 11.22</div>
<p>So there are 11 full payments. The balance just after the 11th payment is</p>
<div class="texd">20000(1.06)^{11} - 2500\,s_{\overline{11}|} = 37{,}965.97 - 37{,}429.11 = 536.86</div>
<p>The drop payment at time 12 is <span class="tex">536.86 \times 1.06 = 569.08</span>. A balloon payment instead would be <span class="tex">2500 + 536.86 = 3{,}036.86</span> at time 11.</p>`,
      },
      checks: [
        { q: t`A loan of 8,000 at 5% annual effective is repaid with 1,000 at the end of each year, plus a smaller final payment. How many full payments of 1,000 are made?`,
          opts: ['8', '9', '10', '11'], correct: 2,
          explain: t`<span class="tex">n = -\ln(1 - 0.4)/\ln 1.05 = 10.47</span>, so 10 full payments, then a smaller one. 8 ignores interest.` },
        { q: t`Payments of 1 at the end of each year for 10 years have present value 7.5. Which annual effective rate is closest?`,
          opts: ['5.0%', '5.6%', '6.0%', '6.6%'], correct: 1,
          explain: t`At 5%, <span class="tex">a_{\overline{10}|} = 7.7217</span>; at 6%, 7.3601. The target 7.5 lies between, about 61% of the way to 6%, so roughly 5.6% (the exact root is 5.604%).` },
        { q: t`For some term <span class="tex">n</span>, <span class="tex">a_{\overline{n}|} = 7.360087</span> and <span class="tex">s_{\overline{n}|} = 13.180795</span>. Find <span class="tex">i</span>.`,
          opts: ['5%', '6%', '7%', '8%'], correct: 1,
          explain: t`<span class="tex">i = 1/7.360087 - 1/13.180795 = 0.135868 - 0.075868 = 0.06</span>.` },
      ],
    },
    {
      id: 'fm-an-arithmetic', title: 'Arithmetic increasing and decreasing annuities', short: 'Arithmetic varying', topic: 'varying', minutes: 9,
      body: t`
<p>Payments that change by a fixed amount each period form an <b>arithmetic</b> varying annuity. Two building blocks cover almost every case.</p>
<p>The <b>increasing annuity</b> pays 1, 2, 3, …, <span class="tex">n</span> at times 1, 2, …, <span class="tex">n</span>:</p>
<div class="texd">(Ia)_{\overline{n}|} = \frac{\ddot{a}_{\overline{n}|} - n v^n}{i}</div>
<p>The <b>decreasing annuity</b> pays <span class="tex">n</span>, <span class="tex">n-1</span>, …, 1 at times 1, 2, …, <span class="tex">n</span>:</p>
<div class="texd">(Da)_{\overline{n}|} = \frac{n - a_{\overline{n}|}}{i}</div>
<p>Note the <b>double dot</b> in the increasing formula: it is <span class="tex">\ddot{a}</span>, not <span class="tex">a</span>. Accumulated values follow by multiplying by <span class="tex">(1+i)^n</span>, and due versions by multiplying by <span class="tex">1+i</span>.</p>
<p><b>General arithmetic pattern.</b> Payments <span class="tex">P, P+Q, P+2Q, \dots, P+(n-1)Q</span> at times 1 to <span class="tex">n</span> split into a level annuity of <span class="tex">P</span> plus <span class="tex">Q</span> times an increasing annuity that starts one period later:</p>
<div class="texd">PV = P\,a_{\overline{n}|} + Q\,\frac{a_{\overline{n}|} - n v^n}{i}</div>
<p>This works for decreasing patterns too, with <span class="tex">Q</span> negative. Always check that payments stay positive.</p>
<p><b>Increasing perpetuity.</b> Payments 1, 2, 3, … forever: <span class="tex">(Ia)_{\overline{\infty}|} = \dfrac{1}{i\,d} = \dfrac{1}{i} + \dfrac{1}{i^2}</span>.</p>`,
      example: {
        title: 'Worked example: payments rising by 10',
        html: t`<p>Payments of 100, 110, 120, …, 190 are made at the end of years 1 to 10, at 5% annual effective. Here <span class="tex">P = 100</span> and <span class="tex">Q = 10</span>, with <span class="tex">a_{\overline{10}|} = 7.721735</span> and <span class="tex">v^{10} = 0.613913</span>:</p>
<div class="texd">PV = 100(7.721735) + 10\cdot\frac{7.721735 - 10(0.613913)}{0.05} = 772.17 + 316.52 = 1{,}088.69</div>`,
      },
      checks: [
        { q: t`Find <span class="tex">(Ia)_{\overline{5}|}</span> at 5% annual effective.`,
          opts: ['12.5664', '13.1947', '13.4105', '15.0000'], correct: 0,
          explain: t`<span class="tex">\ddot{a}_{\overline{5}|} = 4.545951</span> and <span class="tex">5v^5 = 3.917631</span>, so <span class="tex">(4.545951 - 3.917631)/0.05 = 12.5664</span>. 13.1947 is the annuity-due version, 13.4105 is <span class="tex">(Da)_{\overline{5}|}</span>, and 15 ignores interest.` },
        { q: t`A perpetuity pays 1, 2, 3, … at the end of years 1, 2, 3, …. At 5% annual effective, find its present value.`,
          opts: ['20', '400', '420', '441'], correct: 2,
          explain: t`<span class="tex">1/i + 1/i^2 = 20 + 400 = 420</span>. 20 is the level perpetuity of 1, and 441 is the perpetuity-due version (<span class="tex">420 \times 1.05</span>).` },
      ],
    },
    {
      id: 'fm-an-geometric', title: 'Geometric (compound) growth annuities', short: 'Geometric growth', topic: 'varying', minutes: 7,
      body: t`
<p>When payments grow by a fixed <i>percentage</i> <span class="tex">g</span> each period (cost-of-living raises, dividends, rent escalation), they form a <b>geometric</b> annuity. With first payment 1 at time 1 and payments <span class="tex">1, (1+g), (1+g)^2, \dots, (1+g)^{n-1}</span>:</p>
<div class="texd">PV = \sum_{k=1}^{n}(1+g)^{k-1}v^k = \frac{1 - \left(\frac{1+g}{1+i}\right)^n}{i - g}, \qquad g \ne i</div>
<p>If <span class="tex">g = i</span>, every term equals <span class="tex">v</span>, so <span class="tex">PV = n/(1+i)</span>. If <span class="tex">g &lt; i</span>, the perpetuity converges:</p>
<div class="texd">PV_{\infty} = \frac{1}{i - g}</div>
<p>That last line is the dividend discount model from corporate finance. Two traps:</p>
<ul>
  <li>The formula is for a <b>first payment of 1</b>. If the payment at time 1 is already grown (for example "payments start at 1,000 and the first raise happens immediately"), adjust.</li>
  <li>Some solutions use the "net rate" <span class="tex">j = (1+i)/(1+g) - 1</span>. Then <span class="tex">PV = a_{\overline{n}|j}/(1+g)</span> for an annuity-immediate. Forgetting the division by <span class="tex">1+g</span> overstates the value.</li>
</ul>`,
      example: {
        title: 'Worked example: payments growing 4% a year',
        html: t`<p>A payment of 1,000 is made at the end of year 1, and each later payment is 4% larger, for 15 payments in all. At 7% annual effective:</p>
<div class="texd">PV = 1000\cdot\frac{1 - (1.04/1.07)^{15}}{0.07 - 0.04} = 1000\cdot\frac{1 - 0.652745}{0.03} = 11{,}575.17</div>`,
      },
      checks: [
        { q: t`The first payment of 500 is made in one year. Payments grow 5% a year for 20 payments in total. At 5% annual effective, find the present value.`,
          opts: ['9,500.00', '9,523.81', '10,000.00', '10,500.00'], correct: 1,
          explain: t`With <span class="tex">g = i</span>, each payment's present value is <span class="tex">500/1.05</span>, so <span class="tex">PV = 20 \times 500/1.05 = 9{,}523.81</span>.` },
        { q: t`A stock will pay a dividend of 600 in one year, growing 2% a year forever. At 6%, find its value.`,
          opts: ['7,500', '10,000', '15,000', '15,300'], correct: 2,
          explain: t`<span class="tex">600/(0.06 - 0.02) = 15{,}000</span>. 10,000 ignores growth, and 15,300 grows the first dividend once too often.` },
      ],
    },
    {
      id: 'fm-an-balance', title: 'Loans: outstanding balance', short: 'Outstanding balance', topic: 'loan', minutes: 9,
      body: t`
<p>A loan of <span class="tex">L</span> repaid by level payments at the end of each period is an annuity viewed from the lender's side. The level payment is</p>
<div class="texd">R = \frac{L}{a_{\overline{n}|}}</div>
<p>The <b>outstanding balance</b> (also called loan balance or unpaid principal) just after the <span class="tex">k</span>-th payment can be found two ways.</p>
<ul>
  <li><b>Prospective method</b> (look forward): the present value of the payments still to come.
  <div class="texd">B_k = R\,a_{\overline{n-k}|}</div></li>
  <li><b>Retrospective method</b> (look back): what was borrowed, accumulated, minus what was paid, accumulated.
  <div class="texd">B_k = L(1+i)^k - R\,s_{\overline{k}|}</div></li>
</ul>
<p>When the payments are exactly level and the rate does not change, the two always agree. Use the prospective method when the future is simple; use the retrospective method when the future is messy (an irregular final payment, unknown term) or when payments so far are not level.</p>
<p>Off-by-one errors are the classic trap. "After the 8th payment of 15" leaves <span class="tex">15 - 8 = 7</span> payments, so the factor is <span class="tex">a_{\overline{7}|}</span>. Also watch the timing: just <i>before</i> payment <span class="tex">k+1</span> is made, a period of interest has accrued and the balance is <span class="tex">B_k(1+i)</span>.</p>`,
      example: {
        title: 'Worked example: both methods agree',
        html: t`<p>A loan of 80,000 is repaid with 10 annual payments at 5% annual effective. The payment is <span class="tex">R = 80{,}000/a_{\overline{10}|} = 80{,}000/7.721735 = 10{,}360.37</span>. The balance after 4 payments is</p>
<div class="texd">\text{Prospective: } 10{,}360.37\,a_{\overline{6}|} = 10{,}360.37 \times 5.075692 = 52{,}586.03</div>
<div class="texd">\text{Retrospective: } 80{,}000(1.05)^4 - 10{,}360.37\,s_{\overline{4}|} = 97{,}240.50 - 44{,}654.47 = 52{,}586.03</div>`,
      },
      checks: [
        { q: t`A loan of 30,000 is repaid with 8 annual payments at 7% annual effective. Find the outstanding balance just after the 3rd payment.`,
          opts: ['14,927.90', '17,017.46', '20,599.53', '23,947.25'], correct: 2,
          explain: t`<span class="tex">R = 30{,}000/a_{\overline{8}|} = 5{,}024.03</span>, and 5 payments remain: <span class="tex">5{,}024.03\,a_{\overline{5}|} = 20{,}599.53</span>. 23,947.25 uses <span class="tex">a_{\overline{6}|}</span>, 17,017.46 uses <span class="tex">a_{\overline{4}|}</span>, and 14,927.90 subtracts payments with no interest.` },
        { q: t`A loan's final payment is irregular, and you know the amount borrowed, the rate and the first <span class="tex">k</span> payments. Which method finds the balance after payment <span class="tex">k</span> most directly?`,
          opts: ['Prospective', 'Retrospective', 'Either; both require the final payment', 'Neither'], correct: 1,
          explain: t`The retrospective method uses only the past: <span class="tex">L(1+i)^k - R\,s_{\overline{k}|}</span>. The prospective method would need the irregular final payment.` },
      ],
    },
    {
      id: 'fm-an-amortization', title: 'Amortization schedules', short: 'Amortization', topic: 'loan', minutes: 10, widget: 'amort',
      body: t`
<p>Each loan payment splits into <b>interest</b> on the balance outstanding during the period and <b>principal</b>, which reduces the balance. For payment <span class="tex">k</span>:</p>
<div class="texd">I_k = i\,B_{k-1}, \qquad P_k = R - I_k, \qquad B_k = B_{k-1} - P_k</div>
<p>An <b>amortization schedule</b> lists these row by row. For a level-payment loan of <span class="tex">R</span> per period over <span class="tex">n</span> periods there are shortcuts that skip the table:</p>
<div class="texd">I_k = R\left(1 - v^{\,n-k+1}\right), \qquad P_k = R\,v^{\,n-k+1}</div>
<p>Check with <span class="tex">k = n</span>: the last payment is <span class="tex">Rv</span> principal, exactly the balance one period before the end. Some consequences worth remembering:</p>
<ul>
  <li>Principal portions grow geometrically: <span class="tex">P_{k+1} = P_k(1+i)</span>. Knowing one principal portion and <span class="tex">i</span> gives all of them.</li>
  <li>Interest portions shrink over time. Early payments are mostly interest on long loans.</li>
  <li>Total interest is <span class="tex">nR - L</span>, and the principal paid between two dates equals the drop in balance: <span class="tex">P_{a} + \cdots + P_{b} = B_{a-1} - B_b</span>.</li>
</ul>
<p>Use the loan explorer below. Move the principal, rate and term sliders and watch the payment, the schedule, and the interest-versus-principal chart. Notice how raising the rate or lengthening the term pushes more of the early payments into interest.</p>`,
      example: {
        title: 'Worked example: a five-year schedule',
        html: t`<p>A loan of 10,000 is repaid with 5 annual payments at 6%: <span class="tex">R = 10{,}000/a_{\overline{5}|} = 2{,}373.96</span>.</p>
<div class="tblwrap"><table><thead><tr><th>k</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead><tbody>
<tr><td>0</td><td></td><td></td><td></td><td class="num">10,000.00</td></tr>
<tr><td>1</td><td class="num">2,373.96</td><td class="num">600.00</td><td class="num">1,773.96</td><td class="num">8,226.04</td></tr>
<tr><td>2</td><td class="num">2,373.96</td><td class="num">493.56</td><td class="num">1,880.40</td><td class="num">6,345.63</td></tr>
<tr><td>3</td><td class="num">2,373.96</td><td class="num">380.74</td><td class="num">1,993.23</td><td class="num">4,352.41</td></tr>
<tr><td>4</td><td class="num">2,373.96</td><td class="num">261.14</td><td class="num">2,112.82</td><td class="num">2,239.59</td></tr>
<tr><td>5</td><td class="num">2,373.96</td><td class="num">134.38</td><td class="num">2,239.59</td><td class="num">0.00</td></tr></tbody></table></div>
<p>Shortcut check for payment 3: <span class="tex">P_3 = 2373.96\,v^{3} = 1{,}993.23</span>. Total interest is <span class="tex">5(2{,}373.96) - 10{,}000 = 1{,}869.82</span>.</p>`,
      },
      checks: [
        { q: t`A loan of 60,000 is repaid with 20 annual payments at 5% annual effective. Find the interest portion of the 8th payment.`,
          opts: ['2,133.63', '2,261.29', '2,553.26', '3,000.00'], correct: 1,
          explain: t`<span class="tex">R = 60{,}000/a_{\overline{20}|} = 4{,}814.56</span>. With <span class="tex">n - k + 1 = 13</span>: <span class="tex">I_8 = 4814.56(1 - v^{13}) = 2{,}261.29</span>. 2,553.26 is the principal portion, 2,133.63 uses <span class="tex">v^{12}</span>, and 3,000 is the first year's interest.` },
        { q: t`For the same loan, find the total interest paid over its life.`,
          opts: ['30,000.00', '36,291.10', '60,000.00', '96,291.10'], correct: 1,
          explain: t`<span class="tex">20 \times 4{,}814.56 - 60{,}000 = 36{,}291.10</span>. 96,291.10 is the total of all payments.` },
        { q: t`In a level-payment loan at 6%, the principal portion of payment 4 is 1,500. Find the principal portion of payment 5.`,
          opts: ['1,415.09', '1,500.00', '1,590.00', '1,685.40'], correct: 2,
          explain: t`Principal portions grow by the factor <span class="tex">1+i</span>: <span class="tex">1500 \times 1.06 = 1{,}590</span>.` },
      ],
    },
    {
      id: 'fm-an-sinking', title: 'Sinking funds and refinancing', short: 'Sinking funds', topic: 'sinking', minutes: 9,
      body: t`
<p>In the <b>sinking fund method</b> the borrower does not repay principal along the way. Instead, each period the borrower</p>
<ul>
  <li>pays the lender interest only, <span class="tex">iL</span>, and</li>
  <li>deposits <span class="tex">D</span> into a separate fund earning rate <span class="tex">j</span>, sized to grow to <span class="tex">L</span> at the end: <span class="tex">D = L/s_{\overline{n}|j}</span>.</li>
</ul>
<p>The total periodic outlay is <span class="tex">iL + L/s_{\overline{n}|j}</span>. If <span class="tex">j = i</span> this equals the amortization payment, by the identity <span class="tex">1/a_{\overline{n}|} = 1/s_{\overline{n}|} + i</span>. Usually <span class="tex">j &lt; i</span>, so the sinking fund costs more than amortizing.</p>
<p>The <b>net amount of the loan</b> after <span class="tex">k</span> deposits is <span class="tex">L - D\,s_{\overline{k}|j}</span>: the loan minus what has built up in the fund. It plays the role of the outstanding balance.</p>
<p><b>Refinancing</b> replaces a loan with a new one, usually when rates fall. The new loan pays off the outstanding balance at that date (plus any prepayment penalty or fee), and the new payment comes from the new rate and term:</p>
<div class="texd">R_{\text{new}} = \frac{B_k + \text{fees}}{a_{\overline{m}|i_{\text{new}}}}</div>
<p>Compare payments, or the present value of the remaining payments, to decide whether refinancing helps. Always get the balance with the <i>old</i> rate and the new payment with the <i>new</i> rate.</p>`,
      example: {
        title: 'Worked example: a sinking fund and a refinance',
        html: t`<p><b>Sinking fund.</b> A borrower takes 50,000 for 10 years. The lender charges 6% interest annually, and the borrower builds a sinking fund earning 4%. The deposit is <span class="tex">50{,}000/s_{\overline{10}|4\%} = 4{,}164.55</span>, so the total annual outlay is <span class="tex">3{,}000 + 4{,}164.55 = 7{,}164.55</span>. An amortized loan at 6% would cost <span class="tex">50{,}000/a_{\overline{10}|6\%} = 6{,}793.40</span> a year.</p>
<p><b>Refinance.</b> A 15-year loan of 120,000 at 6% has payment <span class="tex">120{,}000/a_{\overline{15}|} = 12{,}355.53</span>. After 5 payments the balance is <span class="tex">12{,}355.53\,a_{\overline{10}|6\%} = 90{,}937.79</span>. Refinanced at 4% over the remaining 10 years, the new payment is <span class="tex">90{,}937.79/a_{\overline{10}|4\%} = 11{,}211.81</span>, saving 1,143.73 a year.</p>`,
      },
      checks: [
        { q: t`In the sinking fund example (50,000, lender rate 6%), what would the total annual outlay be if the fund also earned 6%?`,
          opts: ['6,793.40', '7,000.00', '7,164.55', '8,000.00'], correct: 0,
          explain: t`<span class="tex">3{,}000 + 50{,}000/s_{\overline{10}|6\%} = 3{,}000 + 3{,}793.40 = 6{,}793.40</span>, exactly the amortization payment, because <span class="tex">i + 1/s_{\overline{n}|} = 1/a_{\overline{n}|}</span>.` },
        { q: t`When refinancing, which rate is used to find the outstanding balance being paid off?`,
          opts: ['The new rate', 'The old (original) rate', 'The average of the two', 'The sinking fund rate'], correct: 1,
          explain: t`The balance is what is still owed under the original contract, so it is the remaining old payments valued at the old rate. The new rate only sets the new payment.` },
      ],
    },
  ],
};

export const STEPS = LESSON.steps;
