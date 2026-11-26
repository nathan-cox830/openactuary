// Exam FM terms for Duration, Immunization and Swaps. Format: { term: definition }.
// These merge with the other glossaries and are underlined in lesson and case text.
export default {
  'Macaulay duration': 'The present-value-weighted average time until cash flows are received. Equals the term of a zero-coupon bond, and −P′(δ)/P with respect to the force of interest.',
  'modified duration': 'The percent drop in price per unit rise in the effective rate: −P′(i)/P(i) = Macaulay duration / (1 + i).',
  'convexity': 'A measure of the curvature of price as a function of the interest rate, P″/P. More convexity means prices fall less and rise more than duration alone predicts.',
  'Macaulay convexity': 'The present-value-weighted average of t², equal to P″(δ)/P(δ). For a zero-coupon bond maturing at n it is n².',
  'immunization': 'Structuring assets so that changes in interest rates do not reduce the surplus of assets over liabilities.',
  'Redington immunization': 'Immunization against small parallel rate changes: asset and liability present values and durations are equal, and asset convexity is larger.',
  'full immunization': 'Immunization that keeps the surplus non-negative for any parallel change in a flat interest rate, typically by bracketing each liability with an earlier and a later zero-coupon asset.',
  'cash-flow matching': 'Buying assets whose payments equal the liability payments on each date, so no reinvestment or early sales are needed. Also called a dedicated portfolio.',
  'dedicated portfolio': 'A portfolio built by exact cash-flow matching, with asset payments set to cover each liability payment when it is due.',
  'interest rate swap': 'A contract in which two parties exchange fixed-rate interest payments for floating-rate payments on the same notional amount, settling only the net difference.',
  'swap rate': 'The fixed rate in an interest rate swap, set so the swap has zero value at the start: (1 − Pₙ) / ΣPₖ for a level notional.',
  'notional amount': 'The principal on which swap interest payments are calculated. It is not itself exchanged.',
  'counterparty': 'The other party to a contract such as a swap. Counterparty risk is the risk that it fails to pay what it owes.',
  'deferred swap': 'A swap whose settlements begin after a delay, used to lock in a rate for money that will be invested or borrowed later.',
  'surplus': 'The present value of assets minus the present value of liabilities.',
};
