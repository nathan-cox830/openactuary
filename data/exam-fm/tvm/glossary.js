// Interest theory terms for Exam FM (Interest and the Time Value of Money). Format: { term: definition }.
// These merge with the other glossaries and are underlined in lesson and case text.
export default {
  'time value of money': 'The idea that a payment is worth more the sooner it arrives, because money on hand can be invested to earn interest.',
  'accumulation function': 'a(t), the value at time t of 1 invested at time 0, with a(0) = 1.',
  'amount function': 'A(t) = A(0)·a(t), the value at time t of an initial investment A(0).',
  'simple interest': 'Interest earned only on the original deposit, so a(t) = 1 + it grows in a straight line.',
  'compound interest': 'Interest that earns interest, so a(t) = (1 + i)^t. The default assumption on Exam FM.',
  'effective rate of interest': 'Interest earned during a period divided by the balance at the start of the period.',
  'effective rate of discount': 'Interest earned during a period divided by the balance at the end of the period; d = i/(1 + i).',
  'present value': 'The amount needed today to fund a future payment: the payment multiplied by the discount factor.',
  'discount factor': 'v = 1/(1 + i), the present value of 1 due one period from now.',
  'nominal rate': 'A rate quoted "convertible m times a year", such as i^(m) or d^(m); the rate credited each 1/m of a year is the nominal rate divided by m.',
  'force of interest': 'δ_t = a′(t)/a(t), the instantaneous rate of growth. Constant force gives a(t) = e^(δt) with δ = ln(1 + i).',
  'equation of value': 'An equation setting the value of inflows equal to the value of outflows at one focal date.',
  'focal date': 'The common date to which all payments are moved before being compared in an equation of value.',
  'rule of 72': 'A mental shortcut: money doubles in about 72 ÷ (rate in percent) years.',
  'method of equated time': 'Approximating the time of a single equivalent payment by the payment-weighted average of the payment times.',
  'real interest rate': 'Growth in purchasing power rather than in dollars: (1 + i)/(1 + inflation) − 1.',
  'Fisher equation': '1 + i = (1 + r)(1 + π), linking the nominal rate i, the real rate r and the inflation rate π.',
  'federal funds rate': 'The overnight rate at which U.S. banks lend reserves to each other; the Federal Reserve sets a target range for it.',
};
