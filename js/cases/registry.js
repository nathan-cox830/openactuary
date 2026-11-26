// The case library. Add new case definitions here (see docs/ARCHITECTURE.md "Adding a case").
import riskyDriver from './defs/risky-driver.js';
import staleTriangle from './defs/stale-triangle.js';
import shouldWeFile from './defs/should-we-file.js';
import mortalityTable from './defs/mortality-table.js';
import promisesToKeep from './defs/promises-to-keep.js';
import trendWatch from './defs/trend-watch.js';

export const CASES = [riskyDriver, staleTriangle, shouldWeFile, mortalityTable, trendWatch, promisesToKeep];
export const byId = id => CASES.find(c => c.id === id);

export const LEVELS = { 'exam-p': 'Exam P level', advanced: 'Advanced' };

/** Planned cases, shown as "coming soon" so the library's shape is visible. */
export const COMING_SOON = [
  { line: 'pc', title: 'Hurricane Season', sub: 'Catastrophe risk and reinsurance', icon: 'shield', concepts: ['EP curves', 'Reinsurance layers', 'Parametric triggers'] },
  { line: 'pc', title: 'Messy Claims', sub: 'Pricing a multi-line commercial package', icon: 'table', concepts: ['Data cleaning', 'Severity fitting', 'Simulation'] },
];
