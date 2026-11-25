// Curated actuarial job-search links. No live data: we only build pre-filtered search URLs
// that open on the source site in a new tab. Base URLs checked Nov 2026 (see notes per source).

/** Practice-area filters. `kw` is appended to the search keywords. */
export const AREAS = [
  { id: 'any', label: 'All areas', kw: '' },
  { id: 'pc', label: 'P&C', kw: 'property casualty' },
  { id: 'life', label: 'Life & annuities', kw: 'life annuity' },
  { id: 'health', label: 'Health', kw: 'health' },
  { id: 'pension', label: 'Pension / retirement', kw: 'pension retirement' },
  { id: 'consulting', label: 'Consulting', kw: 'consulting' },
];

/**
 * Role levels. LinkedIn filters: f_E=1 internship, f_E=2 entry level, f_WT=2 remote.
 * Indeed: no stable public remote parameter we could confirm, so "remote" goes in the query.
 */
export const LEVELS = [
  {
    id: 'intern', label: 'Internships', icon: 'target',
    kw: 'actuarial intern',
    blurb: 'Summer internships are the most common way into the profession. Many fill in the fall for the following summer, so search early.',
    li: { f_E: '1' }, liNote: 'Internship filter', indeedExtra: '',
  },
  {
    id: 'entry', label: 'Entry-level analyst', icon: 'briefcase',
    kw: 'actuarial analyst',
    blurb: 'Entry roles usually want one or two exams passed (often P and FM) plus spreadsheet and coding skills. Many include paid study time.',
    li: { f_E: '2' }, liNote: 'Entry-level filter', indeedExtra: 'entry level',
  },
  {
    id: 'remote', label: 'Remote-friendly', icon: 'layers',
    kw: 'actuarial analyst',
    blurb: 'Fully remote entry roles are less common than hybrid ones. Read each posting closely: “remote” can mean remote within certain states.',
    li: { f_WT: '2' }, liNote: 'Remote filter', indeedExtra: 'remote',
  },
];

const q = s => encodeURIComponent(s.trim().replace(/\s+/g, ' '));

function keywords(level, area) {
  const a = AREAS.find(x => x.id === area);
  return [level.kw, a ? a.kw : ''].filter(Boolean).join(' ');
}

/** LinkedIn Jobs search. Empty location → United States (nationwide). */
export function linkedInUrl(level, area, location) {
  const p = [`keywords=${q(keywords(level, area))}`, `location=${q(location || 'United States')}`];
  Object.entries(level.li).forEach(([k, v]) => p.push(`${k}=${v}`));
  return 'https://www.linkedin.com/jobs/search/?' + p.join('&');
}

/** Indeed (US) search. Empty location → nationwide. */
export function indeedUrl(level, area, location) {
  const kw = [keywords(level, area), level.indeedExtra].filter(Boolean).join(' ');
  return `https://www.indeed.com/jobs?q=${q(kw)}&l=${q(location || '')}`;
}

/** Human-readable summary of what a search looks for. src: 'li' or 'indeed'. */
export function describe(level, area, location, src = 'indeed') {
  const kw = src === 'li' ? keywords(level, area) : [keywords(level, area), level.indeedExtra].filter(Boolean).join(' ');
  const where = location && location.trim() ? location.trim() : 'Nationwide (US)';
  return `“${kw}” · ${where}` + (src === 'li' ? ` · ${level.liNote}` : '');
}

/** Actuarial-specific boards and guides. Static links to each site's main page. */
export const BOARDS = [
  {
    name: 'SOA Career Center',
    url: 'https://jobs.soa.org/',
    org: 'Society of Actuaries',
    best: 'Life, health, retirement and general actuarial roles posted by employers who specifically want actuaries.',
    tags: ['Life', 'Health', 'Retirement'],
  },
  {
    name: 'CAS Career Center',
    url: 'https://careers.casact.org/',
    org: 'Casualty Actuarial Society',
    best: 'Property and casualty roles: pricing, reserving and analytics at insurers, reinsurers and consultancies.',
    tags: ['P&C', 'Reserving', 'Pricing'],
  },
  {
    name: 'DW Simpson',
    url: 'https://www.dwsimpson.com/',
    org: 'Actuarial recruiting firm',
    best: 'Recruiter-listed actuarial and analytics openings, plus a useful sense of what roles exist at each credential stage.',
    tags: ['All areas', 'Recruiter'],
  },
  {
    name: 'BeAnActuary: Internships',
    url: 'https://www.beanactuary.org/jobs-and-internships/actuarial-internships/',
    org: 'SOA and CAS joint site',
    best: 'Plain-language advice on finding and landing an actuarial internship, written for students.',
    tags: ['Students', 'Guide'],
  },
  {
    name: 'BeAnActuary: Finding a job',
    url: 'https://www.beanactuary.org/jobs-and-internships/finding-a-job/',
    org: 'SOA and CAS joint site',
    best: 'Guidance on moving from student to full-time analyst, including how exams fit into hiring.',
    tags: ['Entry level', 'Guide'],
  },
];
