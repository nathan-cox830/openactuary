// Exam FM · Annuities and Loans formula sheet, grouped by topic id (annuity, varying, loan, sinking).
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'annuity', title: 'Level annuities and perpetuities', blurb: 'Valuing equal payments: immediate, due, deferred, forever, and at other frequencies.',
    items: [
      { name: 'Annuity-immediate', tex: t`a_{\overline{n}|} = \frac{1 - v^n}{i}, \qquad s_{\overline{n}|} = \frac{(1+i)^n - 1}{i}`, when: 'Payments at the end of each period. a values them one period before the first payment; s values them at the last payment.' },
      { name: 'Annuity-due', tex: t`\ddot{a}_{\overline{n}|} = \frac{1 - v^n}{d} = (1+i)a_{\overline{n}|}, \qquad \ddot{s}_{\overline{n}|} = (1+i)s_{\overline{n}|}`, when: 'Payments at the start of each period (rent, premiums, savings deposits).' },
      { name: 'Shift identities', tex: t`\ddot{a}_{\overline{n}|} = 1 + a_{\overline{n-1}|}, \qquad \ddot{s}_{\overline{n}|} = s_{\overline{n+1}|} - 1`, when: 'Converting between due and immediate with one formula or table.' },
      { name: 'a and s link', tex: t`s_{\overline{n}|} = a_{\overline{n}|}(1+i)^n, \qquad \frac{1}{a_{\overline{n}|}} = \frac{1}{s_{\overline{n}|}} + i`, when: 'Moving values in time; finding i from a and s; sinking fund versus amortization.' },
      { name: 'Deferred annuity', tex: t`{}_{k|}a_{\overline{n}|} = v^k a_{\overline{n}|} = a_{\overline{k+n}|} - a_{\overline{k}|}`, when: 'First payment at time k + 1. Draw the timeline to get k right.' },
      { name: 'Perpetuities', tex: t`a_{\overline{\infty}|} = \frac{1}{i}, \qquad \ddot{a}_{\overline{\infty}|} = \frac{1}{d}`, when: 'Payments that never end: endowments, preferred stock, the tail of a longer stream.' },
      { name: 'Payments every k periods', tex: t`PV = \frac{a_{\overline{n}|}}{s_{\overline{k}|}} = a_{\overline{n/k}|\,j}, \quad j = (1+i)^k - 1`, when: 'Payments less often than interest converts.' },
      { name: 'm-thly annuity', tex: t`a^{(m)}_{\overline{n}|} = \frac{1 - v^n}{i^{(m)}} = \frac{i}{i^{(m)}}a_{\overline{n}|}`, when: 'm payments of 1/m per year. Or simply use the per-payment rate (1+i)^{1/m} − 1.' },
      { name: 'Continuous annuity', tex: t`\bar{a}_{\overline{n}|} = \frac{1 - v^n}{\delta}, \qquad \bar{s}_{\overline{n}|} = \frac{(1+i)^n - 1}{\delta}`, when: 'Payments flowing continuously at rate 1 per year.' },
      { name: 'Solving for n', tex: t`n = \frac{-\ln(1 - Li/R)}{\ln(1+i)}`, when: 'Known loan and payment. Round down for full payments, then add a drop or balloon payment.' },
    ],
  },
  {
    id: 'varying', title: 'Varying annuities', blurb: 'Payments that rise or fall by a fixed amount or a fixed percentage.',
    items: [
      { name: 'Increasing annuity', tex: t`(Ia)_{\overline{n}|} = \frac{\ddot{a}_{\overline{n}|} - nv^n}{i}`, when: 'Payments 1, 2, …, n at times 1 to n. Note the double dot.' },
      { name: 'Decreasing annuity', tex: t`(Da)_{\overline{n}|} = \frac{n - a_{\overline{n}|}}{i}`, when: 'Payments n, n − 1, …, 1 at times 1 to n.' },
      { name: 'General arithmetic', tex: t`P\,a_{\overline{n}|} + Q\,\frac{a_{\overline{n}|} - nv^n}{i}`, when: 'Payments P, P + Q, …, P + (n − 1)Q. Q may be negative.' },
      { name: 'Increasing perpetuity', tex: t`(Ia)_{\overline{\infty}|} = \frac{1}{id} = \frac{1}{i} + \frac{1}{i^2}`, when: 'Payments 1, 2, 3, … forever.' },
      { name: 'Geometric annuity', tex: t`\frac{1 - \left(\frac{1+g}{1+i}\right)^n}{i - g} \quad (g \ne i), \qquad \frac{n}{1+i} \quad (g = i)`, when: 'First payment 1 at time 1, each later payment (1 + g) times the previous.' },
      { name: 'Geometric perpetuity', tex: t`\frac{1}{i - g}, \quad g \lt i`, when: 'Growing payments forever (dividend discount model). First payment 1 at time 1.' },
    ],
  },
  {
    id: 'loan', title: 'Loans and amortization', blurb: 'Level payments, balances, and how each payment splits into interest and principal.',
    items: [
      { name: 'Level payment', tex: t`R = \frac{L}{a_{\overline{n}|}}`, when: 'Loan L repaid by n equal end-of-period payments.' },
      { name: 'Prospective balance', tex: t`B_k = R\,a_{\overline{n-k}|}`, when: 'Balance after payment k when the remaining payments are known and level.' },
      { name: 'Retrospective balance', tex: t`B_k = L(1+i)^k - R\,s_{\overline{k}|}`, when: 'Balance from past payments: best when the final payment is irregular or unknown.' },
      { name: 'Schedule recursion', tex: t`I_k = iB_{k-1}, \quad P_k = R - I_k, \quad B_k = B_{k-1} - P_k`, when: 'Building an amortization schedule row by row.' },
      { name: 'Payment k split', tex: t`I_k = R\left(1 - v^{n-k+1}\right), \qquad P_k = R\,v^{n-k+1}`, when: 'Interest or principal in one payment without the full table.' },
      { name: 'Principal growth', tex: t`P_{k+j} = P_k(1+i)^j`, when: 'One principal portion is known; find another.' },
      { name: 'Totals', tex: t`\sum I_k = nR - L, \qquad \sum_{k=a}^{b} P_k = B_{a-1} - B_b`, when: 'Total interest over the life, or principal repaid between two dates.' },
    ],
  },
  {
    id: 'sinking', title: 'Sinking funds and refinancing', blurb: 'Repaying principal in one lump from a separate fund, and replacing a loan mid-term.',
    items: [
      { name: 'Sinking fund deposit', tex: t`D = \frac{L}{s_{\overline{n}|j}}`, when: 'Level deposits into a fund earning j that must grow to L.' },
      { name: 'Total outlay', tex: t`iL + \frac{L}{s_{\overline{n}|j}}`, when: 'Interest to the lender plus the deposit. Equals L/a at rate i when j = i.' },
      { name: 'Net amount of loan', tex: t`L - D\,s_{\overline{k}|j}`, when: 'The sinking fund version of the outstanding balance after k deposits.' },
      { name: 'Refinanced payment', tex: t`R_{\text{new}} = \frac{B_k + \text{fees}}{a_{\overline{m}|\,i_{\text{new}}}}`, when: 'Balance at the old rate, new payment at the new rate and term.' },
    ],
  },
];
