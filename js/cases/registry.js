// The case library. Add new case definitions here (see docs/ARCHITECTURE.md "Adding a case").
import riskyDriver from './defs/risky-driver.js';
import staleTriangle from './defs/stale-triangle.js';
import shouldWeFile from './defs/should-we-file.js';

export const CASES = [riskyDriver, staleTriangle, shouldWeFile];
export const byId = id => CASES.find(c => c.id === id);

export const LEVELS = { 'exam-p': 'Exam P level', advanced: 'Advanced' };

/** Planned cases, shown as "coming soon" so the library's shape is visible. */
export const COMING_SOON = [
  { line: 'pc', title: 'Hurricane Season', sub: 'Catastrophe risk and reinsurance', icon: 'shield', concepts: ['EP curves', 'Reinsurance layers', 'Parametric triggers'] },
  { line: 'pc', title: 'Messy Claims', sub: 'Pricing a multi-line commercial package', icon: 'table', concepts: ['Data cleaning', 'Severity fitting', 'Simulation'] },
  { line: 'life', title: 'The Mortality Table', sub: 'Pricing a term life product', icon: 'heart', concepts: ['Life tables', 'Present value', 'Net premiums'] },
  { line: 'health', title: 'Trend Watch', sub: 'Projecting health claim costs', icon: 'chart', concepts: ['Medical trend', 'Utilization', 'Risk adjustment'] },
  { line: 'retirement', title: 'Promises to Keep', sub: 'Funding a pension plan', icon: 'briefcase', concepts: ['Annuities', 'Funding ratios', 'Longevity risk'] },
];
