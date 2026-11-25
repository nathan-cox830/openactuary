// Interview coach question bank. Original content written for OpenActuary.
// Each question: { id, cat, q, tests, outline: [what a strong answer covers], checklist: [self-review items] }.
// Question ids are stored in the `interview` progress namespace, so do not rename them.

export const CATEGORIES = [
  { id: 'technical', label: 'Technical', icon: 'sigma', blurb: 'Probability, insurance basics and explaining ideas simply.' },
  { id: 'behavioral', label: 'Behavioral', icon: 'brief', blurb: 'Stories about your experience, in STAR format.' },
  { id: 'why', label: 'Why actuarial', icon: 'heart', blurb: 'Your motivation, and why this company.' },
];

export const STAR = [
  { k: 'S', t: 'Situation', d: 'Brief context: where, when, what was going on.' },
  { k: 'T', t: 'Task', d: 'What you specifically were responsible for.' },
  { k: 'A', t: 'Action', d: 'The steps you took. Say “I”, not “we”.' },
  { k: 'R', t: 'Result', d: 'What happened, ideally measurable, and what you learned.' },
];

export const QUESTIONS = [
  /* ---------- technical ---------- */
  {
    id: 't-explain-actuary', cat: 'technical',
    q: 'How would you explain what an actuary does to a friend with no math background?',
    tests: 'Whether you understand the job and can explain it without jargon.',
    outline: [
      'One-sentence core idea: actuaries use data to estimate the cost of future uncertain events, such as accidents, illness or long lives.',
      'A concrete example: setting a car insurance price so it covers expected claims and expenses.',
      'Why it matters: keeps insurers and pension plans able to pay what they promised.',
      'Mention judgment and communication, not only math.',
    ],
    checklist: ['Used no unexplained jargon', 'Gave a concrete everyday example', 'Explained why the work matters', 'Kept it under about a minute'],
  },
  {
    id: 't-indep-mutex', cat: 'technical',
    q: 'What is the difference between independent events and mutually exclusive events?',
    tests: 'Core Exam P understanding and precision with definitions.',
    outline: [
      'Mutually exclusive: the events cannot both happen, so P(A and B) = 0.',
      'Independent: one happening does not change the probability of the other, so P(A and B) = P(A)·P(B).',
      'Key insight: two events with positive probability cannot be both independent and mutually exclusive.',
      'A quick example of each (one die roll showing 1 vs 2; two separate coin flips).',
    ],
    checklist: ['Defined both terms correctly', 'Stated the formula for each', 'Explained why they cannot both hold (for positive probabilities)', 'Used a simple example'],
  },
  {
    id: 't-expected-value', cat: 'technical',
    q: 'What is expected value, and why does it matter when pricing insurance?',
    tests: 'Linking a probability concept to the business.',
    outline: [
      'Definition: the probability-weighted average outcome over many repetitions.',
      'Small example: a 1% chance of a $10,000 loss has an expected loss of $100.',
      'Insurance link: the expected claim cost per policy is the starting point of a premium.',
      'What gets added: expenses, profit margin and a load for uncertainty, because results vary around the average.',
    ],
    checklist: ['Gave a correct definition', 'Worked a small numeric example', 'Connected it to premium setting', 'Mentioned variability or loadings beyond the average'],
  },
  {
    id: 't-deductible', cat: 'technical',
    q: 'How does a deductible affect an insurer’s expected claim cost, and why do insurers use them?',
    tests: 'Insurance basics and intuition about loss distributions.',
    outline: [
      'Mechanics: the insurer pays the loss minus the deductible, and nothing for losses below it.',
      'Effect: lowers expected claim payments and removes many small claims entirely.',
      'Reasons: lower premiums for customers, fewer costly small-claim handling expenses, and less moral hazard because the insured shares the risk.',
      'Bonus: mention that the premium reduction depends on how many losses fall below the deductible.',
    ],
    checklist: ['Described how payment is calculated', 'Explained the effect on expected cost', 'Gave at least two reasons insurers use them', 'Mentioned moral hazard or expense savings'],
  },
  {
    id: 't-reserves', cat: 'technical',
    q: 'What is a loss reserve, and why might an estimate change over time?',
    tests: 'P&C fundamentals; useful even for SOA-track candidates.',
    outline: [
      'Definition: money set aside for claims that have happened but are not yet fully paid, including claims not yet reported.',
      'Why estimates move: claims develop as more information arrives, settlements, inflation, legal changes, reporting delays.',
      'Method idea: patterns from past years (for example a loss development triangle) project today’s claims to their ultimate cost.',
      'Why it matters: reserves drive reported profit and the company’s ability to pay claims.',
    ],
    checklist: ['Gave a clear definition', 'Mentioned incurred-but-not-reported claims', 'Listed at least two reasons estimates change', 'Explained why reserves matter to the company'],
  },
  {
    id: 't-data-check', cat: 'technical',
    q: 'You receive a new claims data file. What do you check before you analyze it?',
    tests: 'Practical habits with Excel, SQL or Python, and attention to detail.',
    outline: [
      'Completeness: row counts and totals reconcile to a known source.',
      'Validity: missing values, duplicates, negative or impossible amounts, dates out of order.',
      'Consistency: same definitions as last time (paid vs incurred, policy vs accident year).',
      'Reasonableness: compare key figures to prior periods and ask about big swings.',
      'Name your tools: pivot tables, filters, SQL GROUP BY, or a quick Python summary.',
    ],
    checklist: ['Mentioned reconciling to a control total', 'Named specific data problems to look for', 'Mentioned comparing to prior data', 'Named the tools you would use'],
  },

  /* ---------- behavioral (STAR) ---------- */
  {
    id: 'b-team-deadline', cat: 'behavioral',
    q: 'Tell me about a time you worked on a team under a tight deadline.',
    tests: 'Teamwork, planning and staying calm under pressure.',
    outline: [
      'Situation and task in two sentences: the project, the deadline, your role.',
      'Actions you personally took: splitting work, checking in, solving a blocker.',
      'Result: delivered on time, or what you learned if not.',
      'A takeaway you still use today.',
    ],
    checklist: ['Followed STAR order', 'Focused on my own actions (“I”)', 'Stated a clear result', 'Kept it to about two minutes'],
  },
  {
    id: 'b-mistake', cat: 'behavioral',
    q: 'Describe a time you made a mistake in your work. What did you do?',
    tests: 'Honesty, ownership and quality control, which matter a lot in actuarial work.',
    outline: [
      'Pick a real but manageable mistake, not a disaster and not a disguised strength.',
      'Show you noticed it (or owned it once pointed out) and told the right person quickly.',
      'Explain how you fixed it.',
      'Most important: the check or habit you added so it does not happen again.',
    ],
    checklist: ['Chose a genuine mistake', 'Took ownership without blaming others', 'Explained the fix', 'Described a lasting process change'],
  },
  {
    id: 'b-explain-complex', cat: 'behavioral',
    q: 'Tell me about a time you explained something complex to someone without a technical background.',
    tests: 'Communication, the skill employers most often say entry-level candidates lack.',
    outline: [
      'Who the audience was and why they needed to understand.',
      'How you adjusted: analogy, visual, starting from the conclusion.',
      'How you checked they understood.',
      'The result: a decision made, a grade improved, a problem solved.',
    ],
    checklist: ['Described the audience clearly', 'Named a specific technique (analogy, chart, etc.)', 'Mentioned checking for understanding', 'Ended with a result'],
  },
  {
    id: 'b-balance', cat: 'behavioral',
    q: 'How do you balance studying for exams with school or work?',
    tests: 'Discipline and realism, since you will study while working.',
    outline: [
      'Your actual system: a schedule, weekly hours, practice exams.',
      'An example of sticking to it during a busy stretch.',
      'How you adjust when you fall behind.',
      'Show you understand exams continue after you are hired, and that you are ready for that.',
    ],
    checklist: ['Described a concrete routine', 'Gave a real example', 'Mentioned how I adapt', 'Connected it to studying on the job'],
  },
  {
    id: 'b-data-decision', cat: 'behavioral',
    q: 'Tell me about a time you used data to solve a problem or make a recommendation.',
    tests: 'Analytical thinking and whether you can turn numbers into a decision.',
    outline: [
      'The question you were trying to answer.',
      'The data and tools you used (a class project, job, or a case study like the ones on OpenActuary).',
      'One key finding, stated simply.',
      'The recommendation, what happened, and a limitation you were aware of.',
    ],
    checklist: ['Stated the question up front', 'Named data and tools', 'Gave a specific finding', 'Mentioned a limitation or next step'],
  },

  /* ---------- why actuarial / why this company ---------- */
  {
    id: 'w-why-actuary', cat: 'why',
    q: 'Why do you want to be an actuary?',
    tests: 'Genuine motivation and an accurate picture of the job.',
    outline: [
      'A personal moment that sparked interest (a class, a project, a conversation).',
      'What appeals about the work itself: applying math to real decisions, business impact.',
      'Evidence of commitment: exams passed or scheduled, a club, a project.',
      'Avoid leading with pay or job rankings.',
    ],
    checklist: ['Told a specific personal reason', 'Described the actual work accurately', 'Gave evidence of commitment', 'Did not lead with salary or rankings'],
  },
  {
    id: 'w-why-company', cat: 'why',
    q: 'Why do you want to work here?',
    tests: 'Whether you researched the company.',
    outline: [
      'Two specific facts about the company: lines of business, customers, recent news, culture.',
      'How the role or student program fits your goals (rotations, exam support, practice area).',
      'Something you learned from talking to someone there, if possible.',
      'What you would bring to the team.',
    ],
    checklist: ['Mentioned at least two company-specific facts', 'Linked the role to my goals', 'Said what I would contribute', 'Avoided generic praise that fits any company'],
  },
  {
    id: 'w-practice-area', cat: 'why',
    q: 'Which practice area interests you most (P&C, life, health or retirement), and why?',
    tests: 'Awareness of the profession’s structure, and fit with the role.',
    outline: [
      'Show you know the main areas and which society (SOA or CAS) they connect to.',
      'Name one area and a concrete reason (a case study, course or experience).',
      'Stay open: say you are glad to learn others, especially early on.',
      'Tie your answer to the role you are interviewing for.',
    ],
    checklist: ['Showed I know the main areas', 'Gave a concrete reason for my choice', 'Stayed open to other areas', 'Connected it to this role'],
  },
  {
    id: 'w-five-years', cat: 'why',
    q: 'Where do you see yourself in five years?',
    tests: 'Ambition, realism and commitment to the profession.',
    outline: [
      'Progress through exams toward an associate credential.',
      'Growing technical depth in an area and taking ownership of a piece of work.',
      'Starting to mentor newer analysts or interns.',
      'Keep it realistic and connected to the company.',
    ],
    checklist: ['Mentioned exam and credential progress', 'Described growth in responsibility', 'Kept it realistic', 'Linked it to this company'],
  },
  {
    id: 'w-your-questions', cat: 'why',
    q: 'What questions do you have for us?',
    tests: 'Curiosity and preparation. “None” is a missed chance.',
    outline: [
      'Prepare three or four, and ask two.',
      'About the work: what a typical week looks like for an analyst or intern.',
      'About growth: how the student program supports exams, and how rotations work.',
      'About the team: what separates interns who receive offers.',
    ],
    checklist: ['Asked at least two thoughtful questions', 'Asked about the actual work', 'Asked about growth or exam support', 'Avoided questions answered on their website'],
  },
];
