// Learn hub (#/learn): every exam and topic with progress, plus the shared study tools.
// Old lesson links (#/learn/<stepId>) redirect to #/learn/p/<topic>/<stepId>.
import { esc, icon } from '../util.js';
import { load } from '../progress.js';
import { ring, animateRings } from '../ui/charts.js';
import { reveal } from '../ui/motion.js';
import { EXAMS, loadExam, topicOfStep } from '../../data/exams.js';
import { go } from '../router.js';

export const title = 'Learn';

export async function render(el, params) {
  const pTopics = await loadExam('p');
  const legacy = params && params[0];
  if (legacy) {
    const t = topicOfStep(pTopics, legacy);
    go(t ? `learn/p/${t.id}/${legacy}` : 'learn', { replace: true }); return;
  }
  const st = load('learn', { done: {}, cur: {} }); const done = st.done || {}; const curMap = st.cur || {};
  const loaded = { p: pTopics };
  for (const ex of EXAMS) if (ex.id !== 'p' && ex.topics.length) loaded[ex.id] = await loadExam(ex.id);
  el.innerHTML = `
  <div class="container">
    <header class="page-head">
      <div class="eyebrow">Learn</div>
      <h1>Study for the actuarial exams</h1>
      <p class="lede">Short interactive lessons, a formula sheet and flashcards, then exam-style quizzes and a problem generator for every topic.</p>
    </header>
    <div class="hub-tools" data-reveal>
      ${[['sigma', 'Formula sheets', 'Exam P and FM, grouped by topic', '#/learn/formulas'], ['book', 'Glossary & flashcards', 'Definitions and spaced review', '#/learn/glossary'], ['quiz', 'Practice quizzes', 'Exam-style, with worked solutions', '#/practice/quiz'], ['dice', 'Problem generator', 'A fresh problem every time', '#/practice']]
        .map(([ic, t, d, h]) => `<a class="hub-tool card lift" href="${h}"><span class="path-ic">${icon(ic)}</span><span><b>${t}</b><span class="small muted">${d}</span></span></a>`).join('')}
    </div>
    ${EXAMS.map(ex => {
      const topics = ex.topics.map(m => (loaded[ex.id] || []).find(t => t.id === m.id) || null);
      return `<section class="hub-exam" data-reveal>
        <div class="hub-exam-h"><div><div class="eyebrow">${esc(ex.name)}</div><h2>${esc(ex.title)}</h2></div>${ex.status === 'soon' ? '<span class="pill st">Coming soon</span>' : ''}</div>
        <p class="muted hub-blurb">${esc(ex.blurb)}</p>
        ${ex.topics.length ? `<div class="hub-topics">${ex.topics.map((m, i) => {
          const t = topics[i];
          if (!t) return `<div class="card hub-topic off"><span class="hub-n">${i + 1}</span><h3>${esc(m.title)}</h3><p class="small muted">${esc(m.blurb)}</p><span class="pill">Not available</span></div>`;
          const n = t.steps.length, d = t.steps.filter(s => done[s.id]).length;
          const resume = curMap[t.id] || (t.id === 'general-probability' ? st.current : null);
          const href = `#/learn/${ex.id}/${t.id}${resume ? '/' + resume : ''}`;
          return `<article class="card hub-topic">
            <div class="row between" style="align-items:flex-start"><div><span class="hub-n">${i + 1}</span>${m.weight ? `<span class="chip">${esc(m.weight)} of exam</span>` : ''}</div>${ring(n ? d / n : 0, { size: 58, label: `${d}/${n}`, done: n && d === n })}</div>
            <h3>${esc(t.title)}</h3><p class="small muted">${esc(t.blurb)}</p>
            <div class="small muted">${n} lesson steps · ${t.questions.length} quiz questions · ${t.templates.length} problem types</div>
            <div class="row hub-acts"><a class="btn primary sm" href="${href}">${d ? (d === n ? 'Review' : 'Continue') : 'Start'} ${icon('arrow')}</a><a class="btn ghost sm" href="#/practice/quiz/${t.id}">Quiz</a><a class="btn quiet sm" href="#/practice/${t.id}">Practice</a></div>
          </article>`;
        }).join('')}</div>` : ''}
      </section>`;
    }).join('')}
  </div>`;
  animateRings(el); reveal(el);
}
