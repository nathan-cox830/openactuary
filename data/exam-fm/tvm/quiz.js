// Exam FM · Interest and the Time Value of Money practice quiz: 15 original multiple-choice questions (A–E).
// Each: { id, topic (interest|force|equiv|realrates), diff (1 easy · 2 medium · 3 hard),
//         q (HTML), choices: [5 strings/HTML], answer (index 0–4), sol (HTML worked solution) }.
// Every answer was recomputed in Python before publishing.
const t = String.raw;

export const QUESTIONS = [
  /* ---------- interest: interest & discount rates ---------- */
  {
    id: 'fm-tv-q1', topic: 'interest', diff: 1,
    q: t`A policyholder leaves 3,000 of dividends on deposit for 6 years. Calculate how much more the deposit is worth at 4.5% compound interest than at 4.5% simple interest.`,
    choices: ['63.55', '96.78', '137.59', '810.00', '906.78'], answer: 1,
    sol: t`<div class="texd">3000(1.045)^6 - 3000(1 + 6 \times 0.045) = 3906.78 - 3810.00 = 96.78</div>
<p>810.00 and 906.78 are the interest amounts under simple and compound interest on their own. 63.55 and 137.59 are the same difference after 5 and 7 years.</p>`,
  },
  {
    id: 'fm-tv-q2', topic: 'interest', diff: 2,
    q: t`An investor pays 9,600 for a note that pays 10,000 in 9 months. Calculate the annual effective rate of interest the investor earns.`,
    choices: ['4.00%', '4.17%', '5.33%', '5.56%', '5.59%'], answer: 4,
    sol: t`<p>Over the 9 months the money grows by the factor <span class="tex">10000/9600</span>. Nine months is <span class="tex">3/4</span> of a year, so</p>
<div class="texd">(1+i)^{3/4} = \frac{10000}{9600} \;\Rightarrow\; i = \left(\frac{10000}{9600}\right)^{4/3} - 1 \approx 5.59\%</div>
<p>4.17% (<span class="tex">400/9600</span>) is the 9-month rate, not annual. 5.56% scales it up by <span class="tex">4/3</span> as simple interest would. 4.00% and 5.33% use the discount <span class="tex">400/10000</span> instead.</p>`,
  },
  {
    id: 'fm-tv-q3', topic: 'interest', diff: 2,
    q: t`A loan is quoted at a nominal rate of 9% convertible monthly. Calculate the equivalent nominal rate of discount convertible quarterly.`,
    choices: ['8.80%', '8.87%', '8.93%', '9.00%', '9.07%'], answer: 1,
    sol: t`<p>The monthly rate is 0.75%, so one quarter accumulates by <span class="tex">1.0075^3</span>. A quarter's discount factor is its reciprocal:</p>
<div class="texd">1 - \frac{d^{(4)}}{4} = 1.0075^{-3} \;\Rightarrow\; d^{(4)} = 4\left(1 - 1.0075^{-3}\right) \approx 8.87\%</div>
<p>9.07% is <span class="tex">i^{(4)} = 4(1.0075^3 - 1)</span>, the nominal <i>interest</i> rate. 8.80% discounts using a quarterly rate of <span class="tex">9\%/4</span>, ignoring the monthly compounding. 8.93% treats 9% as a monthly discount rate.</p>`,
  },
  {
    id: 'fm-tv-q4', topic: 'interest', diff: 2,
    q: t`A fund's accumulation function is <span class="tex">a(t) = 1 + 0.02t + 0.004t^2</span>. Calculate the effective rate of <b>discount</b> in year 3.`,
    choices: ['3.20%', '3.65%', '3.79%', '4.00%', '9.60%'], answer: 1,
    sol: t`<p><span class="tex">a(2) = 1.056</span> and <span class="tex">a(3) = 1.096</span>. Discount measures the year's growth against the <i>ending</i> balance:</p>
<div class="texd">d_3 = \frac{a(3) - a(2)}{a(3)} = \frac{0.040}{1.096} \approx 3.65\%</div>
<p>3.79% divides by <span class="tex">a(2)</span>, which is the effective <i>interest</i> rate <span class="tex">i_3</span>. 4.00% is the raw growth, 9.60% the growth over all three years, and 3.20% averages that over three years.</p>`,
  },
  {
    id: 'fm-tv-q5', topic: 'interest', diff: 3,
    q: t`The nominal rate of discount convertible quarterly is 8%. Calculate the equivalent nominal rate of interest convertible semiannually.`,
    choices: ['7.92%', '8.00%', '8.08%', '8.25%', '8.42%'], answer: 3,
    sol: t`<p>Set the one-year accumulations equal:</p>
<div class="texd">\left(1 + \frac{i^{(2)}}{2}\right)^2 = \left(1 - \frac{0.08}{4}\right)^{-4} = 0.98^{-4}</div>
<div class="texd">i^{(2)} = 2\left(0.98^{-2} - 1\right) \approx 8.25\%</div>
<p>8.42% is the annual effective rate <span class="tex">0.98^{-4} - 1</span>. 8.08% treats 8% as <span class="tex">i^{(4)}</span>. 7.92% is <span class="tex">d^{(2)} = 2(1 - 0.98^2)</span>, a semiannual discount rate rather than an interest rate.</p>`,
  },

  /* ---------- force: force of interest ---------- */
  {
    id: 'fm-tv-q6', topic: 'force', diff: 1,
    q: t`The force of interest is a constant 6%. Calculate the annual effective rate of discount.`,
    choices: ['5.66%', '5.82%', '5.83%', '6.00%', '6.18%'], answer: 1,
    sol: t`<p><span class="tex">v = e^{-\delta}</span> and <span class="tex">d = 1 - v</span>, so</p>
<div class="texd">d = 1 - e^{-0.06} \approx 5.82\%</div>
<p>6.18% is the effective interest rate <span class="tex">e^{0.06} - 1</span>. 5.83% is <span class="tex">\ln 1.06</span>, which treats 6% as <span class="tex">i</span>. 5.66% is <span class="tex">0.06/1.06</span>, the discount rate if 6% were the effective interest rate.</p>`,
  },
  {
    id: 'fm-tv-q7', topic: 'force', diff: 2,
    q: t`An insurer invests 5,000 in a fund credited with force of interest <span class="tex">\delta_t = 0.03 + 0.002t</span>. Calculate the fund value at time 10.`,
    choices: ['6,749.29', '7,000.00', '7,401.22', '7,459.12', '8,243.61'], answer: 3,
    sol: t`<div class="texd">\int_0^{10} (0.03 + 0.002t)\,dt = 0.3 + 0.001(10)^2 = 0.4</div>
<div class="texd">5000\,e^{0.4} \approx 7{,}459.12</div>
<p>8,243.61 forgets the <span class="tex">1/2</span> when integrating <span class="tex">0.002t</span> (equivalently, it uses the final force <span class="tex">\delta_{10} = 0.05</span> for all 10 years). 6,749.29 ignores the <span class="tex">0.002t</span> term. 7,000.00 uses <span class="tex">1 + 0.4</span> instead of <span class="tex">e^{0.4}</span>, and 7,401.22 treats the average force 4% as an effective rate.</p>`,
  },
  {
    id: 'fm-tv-q8', topic: 'force', diff: 3,
    q: t`The force of interest is <span class="tex">\delta_t = \dfrac{t}{50 + 5t}</span>. Calculate the present value at time 0 of 1,000 payable at time 4.`,
    choices: ['449.33', '629.06', '795.67', '880.68', '1,135.48'], answer: 3,
    sol: t`<p>Split the integrand: <span class="tex">\dfrac{t}{50+5t} = \dfrac15 - \dfrac{10}{50+5t}</span>. Then</p>
<div class="texd">\int_0^4 \delta_t\,dt = \frac45 - 2\ln\frac{70}{50} = 0.8 - 2\ln 1.4 \approx 0.12706</div>
<div class="texd">\text{PV} = 1000\,e^{-0.12706} \approx 880.68</div>
<p>1,135.48 accumulates instead of discounting. 795.67 uses <span class="tex">\delta_4 \times 4 = 16/70</span>. 629.06 uses 1 instead of <span class="tex">a/b^2 = 50/25 = 2</span> in front of the log, and 449.33 keeps only the <span class="tex">t/5</span> part.</p>`,
  },
  {
    id: 'fm-tv-q9', topic: 'force', diff: 2,
    q: t`Fund A is credited with force of interest <span class="tex">\delta_t = \dfrac{2}{40+t}</span>. Fund B is credited at an annual effective rate <span class="tex">i</span>. Equal deposits at time 0 have equal values at time 10. Calculate <span class="tex">i</span>.`,
    choices: ['2.26%', '4.44%', '4.46%', '4.56%', '5.63%'], answer: 3,
    sol: t`<p>Fund A: <span class="tex">\exp\left(\int_0^{10}\frac{2}{40+t}\,dt\right) = \left(\frac{50}{40}\right)^2 = 1.5625</span>.</p>
<div class="texd">(1+i)^{10} = 1.5625 \;\Rightarrow\; i = 1.5625^{0.1} - 1 \approx 4.56\%</div>
<p>4.46% is the equivalent constant <i>force</i> <span class="tex">\ln(1.5625)/10</span>, not the effective rate. 2.26% forgets the exponent 2. 5.63% spreads the 56.25% growth evenly as simple interest, and 4.44% is <span class="tex">\delta_{5}</span>, the force at the midpoint.</p>`,
  },

  /* ---------- equiv: equations of value ---------- */
  {
    id: 'fm-tv-q10', topic: 'equiv', diff: 1,
    q: t`At an annual effective rate of 6%, how many years does it take an investment to triple?`,
    choices: ['12.00', '18.31', '18.85', '24.00', '33.33'], answer: 2,
    sol: t`<div class="texd">1.06^n = 3 \;\Rightarrow\; n = \frac{\ln 3}{\ln 1.06} \approx 18.85</div>
<p>12.00 is the rule-of-72 <i>doubling</i> time, and 24.00 doubles twice (quadrupling). 33.33 assumes simple interest (<span class="tex">2/0.06</span>). 18.31 divides by 0.06 instead of <span class="tex">\ln 1.06</span>, treating 6% as a force of interest.</p>`,
  },
  {
    id: 'fm-tv-q11', topic: 'equiv', diff: 2,
    q: t`An insurer owes a claimant 2,000 at time 1 and 3,000 at time 4. The parties agree to replace both with a single payment of 5,000 at time <span class="tex">t</span>. At an annual effective rate of 5%, calculate <span class="tex">t</span>.`,
    choices: ['2.50', '2.75', '2.80', '3.00', '3.25'], answer: 1,
    sol: t`<p>Equation of value at time 0:</p>
<div class="texd">5000\,v^t = 2000\,v + 3000\,v^4 \approx 1904.76 + 2468.11 = 4372.87</div>
<div class="texd">t = \frac{\ln(5000/4372.87)}{\ln 1.05} \approx 2.75</div>
<p>2.80 is the <i>method of equated time</i>, the payment-weighted average <span class="tex">(2000 \cdot 1 + 3000 \cdot 4)/5000</span>. It is a quick approximation that always runs a little long. 2.50 is the unweighted average of the two times.</p>`,
  },
  {
    id: 'fm-tv-q12', topic: 'equiv', diff: 3,
    q: t`A deposit of 1,000 is made now and 1,500 at the end of year 2. The account balance at the end of year 4 is 3,000. Calculate the annual effective rate of interest.`,
    choices: ['4.66%', '5.00%', '6.27%', '6.65%', '13.75%'], answer: 3,
    sol: t`<p>Equation of value at time 4, with <span class="tex">x = (1+i)^2</span>:</p>
<div class="texd">1000x^2 + 1500x = 3000 \;\Rightarrow\; x^2 + 1.5x - 3 = 0</div>
<div class="texd">x = \frac{-1.5 + \sqrt{2.25 + 12}}{2} \approx 1.13746 \;\Rightarrow\; i = \sqrt{1.13746} - 1 \approx 6.65\%</div>
<p>13.75% stops at <span class="tex">x - 1</span>, which is a two-year rate. 4.66% pretends all 2,500 was deposited at time 0, and 6.27% pretends it all sat for 3 years. 5.00% is the simple-interest answer <span class="tex">500/(2500 \cdot 4)</span>.</p>`,
  },

  /* ---------- realrates: inflation & interest rate determinants ---------- */
  {
    id: 'fm-tv-q13', topic: 'realrates', diff: 1,
    q: t`A bond fund earns a nominal 8% per year while inflation runs at 3% per year. Calculate the real rate of return.`,
    choices: ['4.63%', '4.85%', '5.00%', '5.15%', '11.24%'], answer: 1,
    sol: t`<div class="texd">1 + r = \frac{1.08}{1.03} \;\Rightarrow\; r \approx 4.85\%</div>
<p>5.00% is the approximation <span class="tex">i - \pi</span>. 4.63% divides the 5% gap by <span class="tex">1+i</span> instead of <span class="tex">1+\pi</span>, and 5.15% divides by <span class="tex">1-\pi</span>. 11.24% multiplies the growth factors when it should divide.</p>`,
  },
  {
    id: 'fm-tv-q14', topic: 'realrates', diff: 2,
    q: t`A roof repair would cost 50,000 at today's prices. It will be done in 6 years, and repair costs rise 4% per year. Using a nominal annual effective rate of 7%, calculate the present value of the repair cost.`,
    choices: ['33,317.11', '41,874.21', '42,156.77', '42,356.16', '63,265.95'], answer: 2,
    sol: t`<p>Project the cost in future dollars, then discount at the nominal rate:</p>
<div class="texd">\text{PV} = 50000\cdot\frac{1.04^6}{1.07^6} \approx 42{,}156.77</div>
<p>Equivalently, discount today's-dollar cost at the exact real rate <span class="tex">1.07/1.04 - 1 \approx 2.885\%</span>. 41,874.21 uses the approximate real rate 3%, and 42,356.16 uses <span class="tex">0.03/1.07</span>. 33,317.11 discounts today's cost at the nominal rate (ignoring inflation), and 63,265.95 is the future cost without discounting.</p>`,
  },
  {
    id: 'fm-tv-q15', topic: 'realrates', diff: 2,
    q: t`Assume the real risk-free rate is 1.0% and expected inflation is 2.5%. A 10-year corporate bond carries a default risk premium of 1.5%, a liquidity premium of 0.5% and a maturity risk premium of 0.8%. A 10-year Treasury bond has the same maturity premium but no default or liquidity premium. Using the additive building-block model, calculate the yield spread of the corporate bond over the Treasury.`,
    choices: ['1.5%', '2.0%', '2.8%', '4.3%', '6.3%'], answer: 1,
    sol: t`<p>Corporate yield: <span class="tex">1.0 + 2.5 + 1.5 + 0.5 + 0.8 = 6.3\%</span>. Treasury yield: <span class="tex">1.0 + 2.5 + 0.8 = 4.3\%</span>.</p>
<div class="texd">\text{spread} = 6.3\% - 4.3\% = 2.0\%</div>
<p>The spread is the premiums the Treasury does not carry: default plus liquidity. 2.8% wrongly includes the maturity premium, which both bonds share. 1.5% leaves out liquidity, and 6.3% and 4.3% are the two yields themselves.</p>`,
  },
];

export const TOPICS = {
  interest: 'Interest & discount rates',
  force: 'Force of interest',
  equiv: 'Equations of value',
  realrates: 'Inflation & interest rate determinants',
};
