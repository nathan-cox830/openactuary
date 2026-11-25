// The typical route into the actuarial profession, plus resume and project tips.
// Deliberately avoids dates, pass rates and salaries that go stale; links to official sources instead.

/**
 * Steps of the path. links: [{ href, label, ext? }]; internal links are hash routes.
 */
export const PATH = [
  {
    id: 'explore', n: 1, title: 'Explore the career', stage: 'Start here', icon: 'search',
    summary: 'Actuaries put a price on uncertainty: insurance premiums, reserves for future claims, pension funding and more. Learn what the day-to-day work looks like before committing to exams.',
    tips: [
      'Read the career overviews on BeAnActuary and talk to one or two working actuaries (alumni, LinkedIn, a campus actuarial club).',
      'Learn the two main tracks: the SOA (life, health, retirement, investments) and the CAS (property and casualty). The first exams are shared, so you do not need to choose yet.',
      'Try a hands-on case study to see whether you enjoy the work, not just the math.',
    ],
    links: [
      { href: 'https://www.beanactuary.org/', label: 'BeAnActuary', ext: true },
      { href: '#/cases', label: 'Try a case study' },
    ],
  },
  {
    id: 'exam-p', n: 2, title: 'Pass Exam P (Probability)', stage: 'First exam', icon: 'dice',
    summary: 'Exam P is the most common first exam and counts toward both SOA and CAS credentials. It tests calculus-based probability applied to risk problems.',
    tips: [
      'Plan for a few months of steady study; many candidates study alongside classes.',
      'Do lots of timed problems. Speed and accuracy under time pressure matter as much as understanding.',
      'Listing a passed exam on your resume is one of the clearest signals to employers.',
    ],
    links: [
      { href: '#/learn', label: 'Exam P lesson' },
      { href: '#/practice', label: 'Practice problems' },
      { href: 'https://www.soa.org/education/exam-req/edu-exam-p-detail/', label: 'Official Exam P page (SOA)', ext: true },
    ],
  },
  {
    id: 'exam-fm', n: 3, title: 'Pass Exam FM (Financial Mathematics)', stage: 'Second exam', icon: 'chart',
    summary: 'Exam FM covers interest theory, annuities, loans, bonds and basic asset-liability ideas. It is also shared by the SOA and CAS paths.',
    tips: [
      'Get fluent with a financial calculator early; it saves real time on the exam.',
      'Some candidates take FM first. Either order works; pick the one that fits your coursework.',
      'Two passed exams makes you a noticeably stronger internship and entry-level candidate.',
    ],
    links: [
      { href: 'https://www.soa.org/education/exam-req/edu-exam-fm-detail/', label: 'Official Exam FM page (SOA)', ext: true },
    ],
  },
  {
    id: 'intern', n: 4, title: 'Land an internship', stage: 'Experience', icon: 'briefcase',
    summary: 'Internships are the single best route to a full-time offer. Many employers hire most of their entry-level analysts from their own intern classes.',
    tips: [
      'Apply broadly in the fall for the following summer; some programs recruit even earlier.',
      'One passed exam plus solid Excel skills is often enough to get interviews; two exams helps further.',
      'Related analyst roles (underwriting, data analytics, risk) at insurers are also valuable experience.',
    ],
    links: [
      { href: 'https://www.beanactuary.org/jobs-and-internships/actuarial-internships/', label: 'Internship advice (BeAnActuary)', ext: true },
    ],
  },
  {
    id: 'vee', n: 5, title: 'Earn VEE credits', stage: 'Coursework', icon: 'book',
    summary: 'Validation by Educational Experience (VEE) credits are required for the associate credentials. You earn them through approved college courses or other approved programs, not exams.',
    tips: [
      'Subjects include areas such as economics, accounting and finance, and mathematical statistics. The exact list differs between the SOA and CAS and changes over time.',
      'Check the official approved-course list before you register for classes; earning VEE in school is usually the easiest route.',
      'Keep transcripts handy: you will submit grades to claim the credit.',
    ],
    links: [
      { href: 'https://www.soa.org/education/exam-req/edu-vee/', label: 'SOA VEE requirements', ext: true },
      { href: 'https://www.casact.org/', label: 'CAS requirements (casact.org)', ext: true },
    ],
  },
  {
    id: 'analyst', n: 6, title: 'Entry-level analyst, while continuing exams', stage: 'First job', icon: 'table',
    summary: 'Most actuaries keep taking exams after they start working. Many employers support this with study hours, exam fees and raises tied to passing.',
    tips: [
      'Ask during interviews how the student program works: study time, exam support and rotations.',
      'Rotations across pricing, reserving, valuation or modeling help you find the area you enjoy.',
      'Build habits that make you trusted: check your numbers, document your work, and explain results clearly.',
    ],
    links: [
      { href: '#/careers/interview', label: 'Practice interviews' },
    ],
  },
  {
    id: 'associate', n: 7, title: 'Associateship: ASA or ACAS', stage: 'Credential', icon: 'shield',
    summary: 'The associate credential (ASA from the SOA, ACAS from the CAS) combines further exams, VEE, online modules and a professionalism course. It is a major career milestone.',
    tips: [
      'Choose your society here based on the work you want: P&C points to the CAS; life, health and retirement to the SOA.',
      'Requirements are revised from time to time. Always check the current pathway on the official site.',
    ],
    links: [
      { href: 'https://www.soa.org/', label: 'soa.org', ext: true },
      { href: 'https://www.casact.org/', label: 'casact.org', ext: true },
    ],
  },
  {
    id: 'fellow', n: 8, title: 'Fellowship: FSA or FCAS', stage: 'Expert', icon: 'star',
    summary: 'Fellowship is the highest credential, with advanced exams and specialized coursework in your practice area. Fellows often lead teams, sign opinions and shape company strategy.',
    tips: [
      'Many actuaries reach fellowship while working full time; pacing yourself matters more than speed.',
      'Communication and judgment become as important as technical skill at this level.',
    ],
    links: [],
  },
];

/** What employers look for, grouped. */
export const SKILLS = [
  {
    title: 'Spreadsheets', icon: 'table',
    items: ['Lookups (XLOOKUP / INDEX-MATCH), pivot tables, clean formulas', 'Building a small model others can follow and audit'],
  },
  {
    title: 'Data and code', icon: 'layers',
    items: ['SQL to pull and join data', 'Python or R for analysis and charts', 'Comfort with messy, real-world data'],
  },
  {
    title: 'Communication', icon: 'mic',
    items: ['Explaining results to non-actuaries', 'Clear, short written summaries', 'Asking good questions and flagging risks'],
  },
  {
    title: 'Exams and curiosity', icon: 'spark',
    items: ['Passed exams show commitment and skill', 'Interest in insurance and how the business makes money'],
  },
];

/** Resume tips for actuarial internships. */
export const RESUME_TIPS = [
  { t: 'Put exams near the top.', d: 'List each passed exam with the sitting (for example “Exam P: passed”). If you are registered for one, you can write “Exam FM: sitting scheduled”.' },
  { t: 'Keep it to one page.', d: 'Recruiters skim. Lead with education, exams, skills, then experience and projects.' },
  { t: 'Name your tools.', d: 'Be specific: “Excel (pivot tables, XLOOKUP)”, “SQL”, “Python (pandas)”. Only list what you can discuss in an interview.' },
  { t: 'Show results, not duties.', d: 'Start bullets with a verb and include a number when you honestly can: hours saved, rows analyzed, people helped.' },
  { t: 'Non-actuarial jobs count.', d: 'Retail, tutoring or campus jobs show reliability, teamwork and customer communication. Frame them that way.' },
  { t: 'Add VEE coursework.', d: 'List courses that qualify for VEE credit so employers can see you are on track.' },
];

/** How to present OpenActuary case studies as projects. */
export const PROJECT_TIPS = [
  'List it under “Projects”, not “Experience”, and describe it honestly as a self-directed case study using public data.',
  'Say what question you answered, the method you used and what you recommended.',
  'Mention the tools and techniques (for example chain-ladder reserving, loss ratios, Excel or Python).',
  'Be ready to walk through one number in detail: where it came from and why it is reasonable.',
  'Talk about a judgment call you made and what you would check with more data.',
];

/** Example resume bullet for a case study project. */
export const PROJECT_EXAMPLE = 'Reserving case study (public CAS Schedule P data): built a paid-loss development triangle, selected age-to-age factors and estimated unpaid claims; summarized the reserve recommendation and its key uncertainties in a one-page memo.';
