// Case library: #/cases. Filter by insurance line and level; each card shows saved progress.
import { esc, icon } from '../util.js';
import { CASES, COMING_SOON, LEVELS } from '../cases/registry.js';
import { loadState, progressOf, LINES } from '../cases/engine.js';
import { ring, animateRings } from '../ui/charts.js';
import { reveal } from '../ui/motion.js';
import * as store from '../progress.js';

export const title = 'Case studies';

export function caseCard(def) {
  const st = loadState(def), p = progressOf(def, st);
  const tab = p.locked ? 'debrief' : p.started ? (st.tab || 'work') : 'brief';
  return `<a class="case-card card lift" href="#/cases/${def.id}/${tab}" data-reveal>
    <div class="cc-top"><span class="cc-ic">${icon(def.icon || 'layers')}</span>${ring(p.d / p.n, { size: 48, label: p.locked ? '✓' : `${Math.round(100 * p.d / p.n)}%`, done: p.locked, stroke: 8 })}</div>
    <div class="cc-meta"><span class="chip accent">${esc(LINES[def.line])}</span><span class="chip outline">${esc(def.levelLabel)}</span></div>
    <h3>${esc(def.title)}</h3>
    <p class="cc-tag">${esc(def.tagline)}</p>
    <div class="chips cc-concepts">${def.concepts.slice(0, 4).map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div>
    <div class="cc-foot"><span class="small muted">${icon('clock')} ~${def.minutes} min · ${def.tasks.length} tasks</span><span class="cc-go">${p.locked ? 'Review' : p.started ? 'Continue' : 'Start case'} ${icon('arrow')}</span></div>
  </a>`;
}

export function render(el) {
  const f = store.load('ui:cases', { line: 'all', level: 'all' });
  const lines = ['all', 'pc', 'life', 'health', 'retirement'];
  const draw = () => {
    const list = CASES.filter(c => (f.line === 'all' || c.line === f.line) && (f.level === 'all' || c.level === f.level));
    const soon = COMING_SOON.filter(c => (f.line === 'all' || c.line === f.line) && f.level !== 'exam-p');
    el.innerHTML = `<div class="container">
      <header class="page-head"><div class="eyebrow">Case studies</div><h1>Work like an actuary</h1>
        <p class="lede">Each case is a real business problem you solve inside the app: read the brief, learn the concepts, dig into the data, make the call, defend it to judges, then see what actually happened.</p></header>
      <div class="filters">
        <div class="seg" role="group" aria-label="Insurance line">${lines.map(l => `<button data-line="${l}" aria-pressed="${f.line === l}">${l === 'all' ? 'All lines' : esc(LINES[l].replace('Property & casualty', 'P&C'))}</button>`).join('')}</div>
        <div class="seg" role="group" aria-label="Level"><button data-level="all" aria-pressed="${f.level === 'all'}">All levels</button>${Object.entries(LEVELS).map(([k, v]) => `<button data-level="${k}" aria-pressed="${f.level === k}">${esc(v)}</button>`).join('')}</div>
      </div>
      ${list.length ? `<div class="case-grid">${list.map(caseCard).join('')}</div>` : `<div class="lockbox"><h3>No cases here yet</h3><p>We're building cases for this line next. Try another filter.</p></div>`}
      ${soon.length ? `<h2 class="section-title">Coming soon</h2><div class="case-grid soon">${soon.map(c => `<div class="case-card card soon" data-reveal><div class="cc-top"><span class="cc-ic">${icon(c.icon)}</span><span class="pill">Coming soon</span></div><div class="cc-meta"><span class="chip">${esc(LINES[c.line])}</span></div><h3>${esc(c.title)}</h3><p class="cc-tag">${esc(c.sub)}</p><div class="chips">${c.concepts.map(x => `<span class="chip outline">${esc(x)}</span>`).join('')}</div></div>`).join('')}</div>` : ''}
      <div class="card how-card"><h3>How a case works</h3><ol class="how-steps">${[['brief', 'Brief', 'The business question and your role'], ['book', 'Learn', 'Short primers on each concept'], ['table', 'Exhibits', 'Real or realistic data, downloadable to Excel'], ['pencil', 'Work', 'Guided tasks with hints and live calculators'], ['target', 'Recommend', 'Write a summary and drill judge questions'], ['star', 'Debrief', 'See the outcome and a model solution']].map(([ic, t, d]) => `<li><span class="hs-ic">${icon(ic)}</span><b>${t}</b><span>${d}</span></li>`).join('')}</ol></div>
    </div>`;
    animateRings(el); reveal(el);
  };
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-line],button[data-level]'); if (!b) return;
    if (b.dataset.line) f.line = b.dataset.line; if (b.dataset.level) f.level = b.dataset.level;
    store.save('ui:cases', f); draw();
  });
  draw();
}
