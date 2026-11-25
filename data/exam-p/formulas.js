// Exam P · General Probability formula sheet, grouped by topic id.
// Each item: { name, tex (KaTeX display source), when (plain-language "when to use") }.
const t = String.raw;

export const FORMULA_GROUPS = [
  {
    id: 'sets', title: 'Sets and basic rules', blurb: 'Axioms, complements and combining events.',
    items: [
      { name: 'Complement rule', tex: t`P(A^{c}) = 1 - P(A)`, when: 'Any "at least one" or "not" question. Often the shortest route.' },
      { name: 'Inclusion-exclusion (two events)', tex: t`P(A \cup B) = P(A) + P(B) - P(A \cap B)`, when: 'You need "A or B" and the events can overlap.' },
      { name: 'Inclusion-exclusion (three events)', tex: t`\begin{aligned}P(A\cup B\cup C) ={}& P(A)+P(B)+P(C) \\ &- P(A\cap B)-P(A\cap C) \\ &- P(B\cap C)+P(A\cap B\cap C)\end{aligned}`, when: 'Three overlapping coverages or conditions. Add singles, subtract pairs, add the triple.' },
      { name: "De Morgan's laws", tex: t`(A\cup B)^{c} = A^{c}\cap B^{c} \qquad (A\cap B)^{c} = A^{c}\cup B^{c}`, when: '"Neither" and "not both" questions.' },
      { name: 'One event without the other', tex: t`P(A \cap B^{c}) = P(A) - P(A \cap B)`, when: '"A only" regions of a Venn diagram.' },
      { name: 'Exactly one of two', tex: t`P(\text{exactly one}) = P(A) + P(B) - 2P(A\cap B)`, when: 'Customers with one coverage but not both.' },
      { name: 'Mutually exclusive events', tex: t`P(A\cap B) = 0 \;\Rightarrow\; P(A\cup B) = P(A) + P(B)`, when: 'Events that cannot happen together, such as claim counts of 0 and 1.' },
    ],
  },
  {
    id: 'counting', title: 'Counting', blurb: 'Equally likely outcomes: favorable over total.',
    items: [
      { name: 'Equally likely outcomes', tex: t`P(A) = \frac{|A|}{|S|}`, when: 'Dice, cards, random samples: every outcome has the same chance.' },
      { name: 'Arrangements', tex: t`n! = n(n-1)(n-2)\cdots 1`, when: 'Ordering all n distinct items.' },
      { name: 'Permutations', tex: t`P(n,k) = \frac{n!}{(n-k)!}`, when: 'Choosing k of n when order matters (assigning claims to specific adjusters).' },
      { name: 'Combinations', tex: t`\binom{n}{k} = \frac{n!}{k!\,(n-k)!}`, when: 'Choosing k of n when order does not matter (committees, audit samples).' },
      { name: 'Two-group selection (hypergeometric)', tex: t`P(k \text{ special}) = \frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}}`, when: 'Sampling without replacement from N items, K of them special.' },
      { name: 'Multinomial coefficient', tex: t`\binom{n}{n_1,\,n_2,\,\dots,\,n_r} = \frac{n!}{n_1!\,n_2!\cdots n_r!}`, when: 'Splitting n items into labeled groups of given sizes, or arranging letters with repeats.' },
    ],
  },
  {
    id: 'conditional', title: 'Conditional probability', blurb: 'Updating on information that shrinks the sample space.',
    items: [
      { name: 'Definition', tex: t`P(A \mid B) = \frac{P(A\cap B)}{P(B)}`, when: '"Given", "among those who", "if it is known that".' },
      { name: 'Multiplication rule', tex: t`P(A \cap B) = P(A)\,P(B\mid A) = P(B)\,P(A \mid B)`, when: 'Events in sequence, such as drawing without replacement.' },
      { name: 'Chain rule', tex: t`P(A\cap B\cap C) = P(A)\,P(B\mid A)\,P(C\mid A\cap B)`, when: 'Three or more steps in sequence.' },
      { name: 'Conditional complement', tex: t`P(A^{c}\mid B) = 1 - P(A \mid B)`, when: 'Conditioning on B keeps all the usual rules.' },
    ],
  },
  {
    id: 'independence', title: 'Independence', blurb: 'When one event tells you nothing about the other.',
    items: [
      { name: 'Test for independence', tex: t`P(A\cap B) = P(A)\,P(B)`, when: 'Checking or using independence. Equivalent to P(A | B) = P(A).' },
      { name: 'Union of independent events', tex: t`P(A\cup B) = P(A) + P(B) - P(A)P(B)`, when: 'Inclusion-exclusion with the product plugged in.' },
      { name: 'At least one (independent)', tex: t`P(\text{at least one}) = 1 - \prod_{i=1}^{n}(1-p_i)`, when: 'Several independent risks; at least one claim, failure or hit.' },
      { name: 'Exactly k of n (identical, independent)', tex: t`\binom{n}{k}p^{k}(1-p)^{n-k}`, when: 'n independent policies with the same claim probability p.' },
    ],
  },
  {
    id: 'bayes', title: "Total probability and Bayes' theorem", blurb: 'Weighted averages over a partition, and reversing conditionals.',
    items: [
      { name: 'Law of total probability', tex: t`P(A) = \sum_{i} P(A\mid B_i)\,P(B_i)`, when: 'An overall rate across risk classes, regions or groups that partition the population.' },
      { name: "Bayes' theorem", tex: t`P(B_j\mid A) = \frac{P(A\mid B_j)\,P(B_j)}{\sum_i P(A\mid B_i)\,P(B_i)}`, when: 'You know P(evidence | cause) and want P(cause | evidence).' },
      { name: "Bayes' theorem (two causes)", tex: t`P(B\mid A) = \frac{P(A\mid B)P(B)}{P(A\mid B)P(B) + P(A\mid B^{c})P(B^{c})}`, when: 'Test results, fraud flags, a claim from an unknown risk class.' },
      { name: 'Natural frequencies', tex: t`P(B\mid A) = \frac{\#(A \text{ and } B)}{\#A}`, when: 'Imagine 10,000 people, split them down the tree, and read off counts.' },
    ],
  },
];
