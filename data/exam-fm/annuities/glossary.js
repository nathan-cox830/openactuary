// Financial mathematics terms for Exam FM (Annuities and Loans). Format: { term: definition }.
// These merge with the other glossaries and are underlined in lesson and case text.
export default {
  'annuity': 'A series of payments made at regular intervals, such as loan payments, rent or pension income.',
  'annuity-immediate': 'An annuity whose payments are made at the end of each period. Its present value is a with angle n = (1 − vⁿ)/i.',
  'annuity-due': 'An annuity whose payments are made at the start of each period. Each value is (1 + i) times the annuity-immediate value.',
  'perpetuity': 'An annuity whose payments continue forever. A perpetuity-immediate of 1 per period is worth 1/i.',
  'deferred annuity': 'An annuity whose first payment is delayed beyond the first period. Value it as an annuity at its start, then discount to today.',
  'increasing annuity': 'An annuity whose payments rise by a fixed amount each period, such as 1, 2, 3, …, n.',
  'decreasing annuity': 'An annuity whose payments fall by a fixed amount each period, such as n, n − 1, …, 1.',
  'geometric annuity': 'An annuity whose payments grow by a fixed percentage each period, valued with (1 − ((1+g)/(1+i))ⁿ)/(i − g).',
  'continuous annuity': 'An annuity paid as a continuous flow at a stated rate per year, valued with the force of interest.',
  'level payment': 'A payment amount that stays the same every period, as in a standard mortgage or car loan.',
  'amortization': 'Repaying a loan with payments that each cover the period\'s interest and reduce the principal, so the balance reaches zero at the end.',
  'amortization schedule': 'A table showing, for each loan payment, the interest portion, the principal portion and the outstanding balance after the payment.',
  'outstanding balance': 'The amount still owed on a loan at a given time, just after a payment unless stated otherwise.',
  'prospective method': 'Finding a loan balance as the present value of the payments still to be made.',
  'retrospective method': 'Finding a loan balance as the original loan accumulated with interest, minus the accumulated value of payments already made.',
  'sinking fund': 'A separate fund built up by periodic deposits so that a loan\'s principal can be repaid in one lump sum at the end, while interest is paid along the way.',
  'net amount of loan': 'In the sinking fund method, the loan amount minus the current sinking fund balance.',
  'refinancing': 'Paying off a loan\'s outstanding balance with a new loan, usually at a lower rate or different term.',
  'drop payment': 'A smaller final loan payment made one period after the last full payment.',
  'balloon payment': 'A larger final loan payment that combines the last regular payment with the remaining balance.',
};
