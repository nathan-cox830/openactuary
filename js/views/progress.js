// My progress: everything saved in this browser, in one dashboard. Also export / import / reset.
import { esc, icon, pct, fmt, toast } from '../util.js';
import { ring, animateRings, lineChart, barChart } from '../ui/charts.js';
import { countUp, reveal } from '../ui/motion.js';
import { showModal, closeModal } from '../ui/modal.js';
import { CASES } from '../cases/registry.js';
import { loadState, progressOf, LINES } from '../cases/engine.js';
import { terms } from '../ui/glossary.js';
import * as store from '../progress.js';

export const title = 'My progress';

const TOPICS = { sets: 'Sets & inclusion–exclusion', counting: 'Counting', conditional: 'Conditional probability', independence: 'Independence', bayes: 'Bayes & total probability' };

async function lessonTotal() {
  try {
    const m = await import('../../data/exam-p/lesson.js');
    const d = m.default || m.LESSON || m.lesson || m.steps || m.STEPS;
    const steps = Array.isArray(d) ? d : (d && (d.steps || d.STEPS));
    return Array.isArray(steps) ? steps.length : 0;
  } catch (e) { return 0; }
}

export async function render(el) {
  const learn = store.load('learn', { done: {} });
  const quiz = store.load('quiz', { history: [], missed: {}, best: 0 });
  const practice = store.load('practice', { attempts: 0, correct: 0, streak: 0, bestStreak: 0, byTemplate: {} });
  const flash = store.load('flash', { known: {} });
  const interview = store.load('interview', { sessions: 0, practiced: {}, flagged: {} });
  const total = await lessonTotal();
  const lessonDone = Object.values(learn.done || {}).filter(Boolean).length;
  const cases = CASES.map(def => ({ def, p: progressOf(def, loadState(def)) }));
  const casesDone = cases.filter(c => c.p.locked).length;
  const hist = quiz.history || [];
  const lastQuiz = hist[hist.length - 1];
  const topicAgg = {};
  hist.forEach(h => Object.entries(h.byTopic || {}).forEach(([t, [r, n]]) => { topicAgg[t] = topicAgg[t] || [0, 0]; topicAgg[t][0] += r; topicAgg[t][1] += n; }));
  const nTerms = terms().length, known = Object.values(flash.known || {}).filter(Boolean).length;
  const anything = lessonDone || hist.length || practice.attempts || cases.some(c => c.p.started) || known || interview.sessions;

  el.innerHTML = `<div class="container">
    <header class="page-head"><div class="eyebrow">Saved in this browser</div><h1>My progress</h1>
      <p class="lede">Everything here lives on this device only. Export it to keep a backup or move to another computer.</p></header>
    ${!store.persistent() ? `<div class="callout warn" style="margin-bottom:20px"><b>Storage is blocked in this browser.</b> Your progress will be lost when you close the tab. Use Export to save a copy.</div>` : ''}
    ${!anything ? `<div class="lockbox" style="margin-bottom:24px"><h3>Nothing here yet</h3><p>Start the lesson, take a quiz or open a case, and your progress shows up here.</p><div class="row" style="justify-content:center"><a class="btn primary" href="#/learn">Start Exam P</a><a class="btn ghost" href="#/cases">Open a case</a></div></div>` : ''}

    <div class="dash-kpis kpis">
      <div class="kpi hero"><div class="l">Lesson steps done</div><div class="v"><span data-count="${lessonDone}">${lessonDone}</span>${total ? `<span class="muted small"> / ${total}</span>` : ''}</div></div>
      <div class="kpi"><div class="l">Best quiz score</div><div class="v">${hist.length ? pct(quiz.best > 1 ? quiz.best / 100 : quiz.best, 0) : '—'}</div></div>
      <div class="kpi"><div class="l">Generator accuracy</div><div class="v">${practice.attempts ? pct(practice.correct / practice.attempts, 0) : '—'}</div></div>
      <div class="kpi"><div class="l">Cases completed</div><div class="v"><span data-count="${casesDone}">${casesDone}</span><span class="muted small"> / ${CASES.length}</span></div></div>
    </div>

    <div class="dash-grid">
      <section class="card dash-card" data-reveal>
        <div class="row between"><h3>${icon('book')} Exam P lesson</h3><a class="btn sm quiet" href="#/learn">Open ${icon('arrow')}</a></div>
        <div class="row" style="gap:16px;margin-top:10px">${ring(total ? lessonDone / total : 0, { size: 84, label: total ? `${lessonDone}/${total}` : String(lessonDone), done: total && lessonDone >= total })}
          <p class="small muted" style="margin:0;flex:1;min-width:160px">${lessonDone ? (total && lessonDone >= total ? 'You finished the General Probability lesson. Try the quiz to lock it in.' : 'Pick up at the next unfinished step.') : 'Seven-plus short steps with interactive visuals.'}</p></div>
        <div class="flash-row"><span class="small"><b>${known}</b> of ${nTerms} glossary terms marked known</span><div class="bar"><i style="width:${nTerms ? Math.round(100 * known / nTerms) : 0}%"></i></div><a class="small" href="#/learn/glossary">Flashcards →</a></div>
      </section>

      <section class="card dash-card" data-reveal>
        <div class="row between"><h3>${icon('quiz')} Practice quiz</h3><a class="btn sm quiet" href="#/practice/quiz">Take a quiz ${icon('arrow')}</a></div>
        ${hist.length ? `<p class="small muted" style="margin:6px 0 0">${hist.length} attempt${hist.length > 1 ? 's' : ''} · last: ${lastQuiz.score}/${lastQuiz.total} · ${Object.keys(quiz.missed || {}).length} question${Object.keys(quiz.missed || {}).length === 1 ? '' : 's'} to review</p>
          ${hist.length > 1 ? lineChart([{ v: hist.slice(-12).map(h => h.total ? h.score / h.total : null), c: 'var(--chart-1)', area: true, w: 2.4 }], { x: hist.slice(-12).map((_, i) => '#' + (Math.max(0, hist.length - 12) + i + 1)), yfmt: v => Math.round(v * 100) + '%', min: 0, max: 1, aria: 'Quiz scores over time', h: 180, ticks: 4 }) : ''}
          ${Object.keys(topicAgg).length ? `<h4 style="margin:10px 0 4px">Accuracy by topic</h4>${barChart(Object.entries(topicAgg).map(([t, [r, n]]) => ({ l: TOPICS[t] || t, v: n ? r / n : 0, c: n && r / n >= 0.7 ? 'var(--chart-4)' : 'var(--chart-3)' })), { fmt: v => pct(v, 0), aria: 'Quiz accuracy by topic', labelW: 210 })}` : ''}`
          : `<p class="small muted">No quizzes yet. Ten questions takes about 20 minutes.</p>`}
      </section>

      <section class="card dash-card" data-reveal>
        <div class="row between"><h3>${icon('dice')} Problem generator</h3><a class="btn sm quiet" href="#/practice">Practice ${icon('arrow')}</a></div>
        ${practice.attempts ? `<div class="mini-stats"><div><b>${fmt(practice.attempts)}</b><span>problems</span></div><div><b>${pct(practice.correct / practice.attempts, 0)}</b><span>correct</span></div><div><b>${practice.bestStreak || 0}</b><span>best streak</span></div></div>` : `<p class="small muted">Fresh problems every time, with worked solutions.</p>`}
      </section>

      <section class="card dash-card" data-reveal>
        <div class="row between"><h3>${icon('mic')} Interview coach</h3><a class="btn sm quiet" href="#/careers/interview">Practice ${icon('arrow')}</a></div>
        ${interview.sessions || Object.keys(interview.practiced || {}).length ? `<div class="mini-stats"><div><b>${interview.sessions || 0}</b><span>mock interviews</span></div><div><b>${Object.keys(interview.practiced || {}).length}</b><span>questions practiced</span></div><div><b>${Object.values(interview.flagged || {}).filter(Boolean).length}</b><span>flagged to redo</span></div></div>` : `<p class="small muted">Timed mock interviews with model answer outlines.</p>`}
      </section>
    </div>

    <h2 class="section-title">Cases</h2>
    <div class="dash-cases">${cases.map(({ def, p }) => `<a class="dash-case card lift" href="#/cases/${def.id}/${p.locked ? 'debrief' : p.started ? 'work' : 'brief'}">
      ${ring(p.d / p.n, { size: 56, label: p.locked ? '✓' : `${p.d}/${p.n}`, done: p.locked, stroke: 8 })}
      <div><b>${esc(def.title)}</b><div class="small muted">${esc(LINES[def.line])} · ${esc(def.levelLabel)}</div><div class="small">${p.locked ? '<span class="pill ok">Answer locked</span>' : p.started ? '<span class="pill cur">In progress</span>' : '<span class="pill">Not started</span>'}</div></div></a>`).join('')}</div>

    <section class="card data-card">
      <div><h3>Your data</h3><p class="small muted" style="margin:4px 0 0">Export a backup file, import one from another device, or clear everything on this device.</p></div>
      <div class="row"><button class="btn ghost" data-export-progress>${icon('download')} Export</button><button class="btn ghost" data-import-progress>${icon('upload')} Import</button><button class="btn quiet" data-reset-all style="color:var(--bad)">Reset everything</button></div>
    </section>
  </div>`;
  countUp(el); reveal(el); animateRings(el);

  if (el.dataset.bound) return; el.dataset.bound = '1';
  el.addEventListener('click', e => {
    if (!e.target.closest('[data-reset-all]')) return;
    showModal(`<h2>Reset everything?</h2><p>This clears all lessons, quizzes, practice stats, flashcards, interview notes and case work saved in this browser. Your theme setting is kept.</p><p class="small muted">This can't be undone. Export first if you might want it back.</p>
      <div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn ghost" data-modal="export">${icon('download')} Export first</button><button class="btn ghost" data-modal="cancel">Cancel</button><button class="btn danger" data-modal="reset">Reset everything</button></div>`,
    a => {
      if (a === 'export') document.querySelector('.site-footer [data-export-progress]')?.click();
      if (a === 'reset') { store.clearAll(); closeModal(); toast('All progress was cleared.'); render(el); }
    });
  });
}
