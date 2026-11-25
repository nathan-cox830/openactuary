// Multivariate probability terms for Exam P. Format: { term: definition }.
// These merge with the other glossaries and are underlined in lesson and case text.
export default {
  'joint distribution': 'The distribution of two or more random variables considered together, given by a joint PMF, joint density or joint CDF.',
  'joint density': 'A function f(x, y) ≥ 0 whose double integral over a region gives the probability that (X, Y) lands in that region. It integrates to 1 over the plane.',
  'joint CDF': 'F(x, y) = P(X ≤ x, Y ≤ y), the probability that both variables are at or below the given values.',
  'marginal distribution': 'The distribution of one variable on its own, found by summing or integrating the joint distribution over the other variable.',
  'conditional distribution': 'The distribution of one variable once the other is known: the joint divided by the marginal of the known variable.',
  'conditional expectation': 'E[Y | X = x], the mean of Y under its conditional distribution given X = x. Before X is observed, E[Y | X] is itself a random variable.',
  'law of total expectation': 'E[Y] = E[E[Y | X]]: average the conditional means, weighted by the distribution of X.',
  'law of total variance': 'Var(Y) = E[Var(Y | X)] + Var(E[Y | X]): the average spread within groups plus the spread between group means.',
  'independent random variables': 'Variables whose joint distribution is the product of their marginals, so knowing one tells you nothing about the other.',
  'covariance': 'Cov(X, Y) = E[XY] − E[X]E[Y]. Positive when the variables tend to move together, negative when they move in opposite directions.',
  'correlation coefficient': 'ρ = Cov(X, Y) ÷ (σ_X σ_Y), a unit-free measure of linear association between −1 and 1.',
  'linear combination': 'A weighted sum aX + bY + c of random variables. Its mean is aE[X] + bE[Y] + c and its variance includes 2ab Cov(X, Y).',
  'iid': 'Independent and identically distributed: separate random variables that share one distribution and do not affect each other.',
  'order statistic': 'A sample value ranked by size, such as the minimum, the maximum or the k-th smallest of several random variables.',
  'central limit theorem': 'The sum (or average) of many iid random variables is approximately normal, with mean nμ and variance nσ² for the sum.',
  'multinomial distribution': 'The joint distribution of the counts in k categories from n independent trials with fixed category probabilities. It generalizes the binomial.',
  'mixture distribution': 'A distribution built in two stages: first draw a risk class or parameter, then draw the outcome from that class. Its variance comes from the law of total variance.',
};
