// Formula sheet (#/learn/formulas[/<exam>]): every topic of one exam from data/exams.js, one section per topic.
// Grouped by topic with a "when to use" note per formula; KaTeX display math; print-friendly via css/learn.css.
import { esc, icon } from '../util.js';
import { renderMath } from '../ui/katex.js';
import { loadExam, exam as examOf, liveExams } from '../../data/exams.js';

export let title = 'Formula sheet';

export async function render(el, params) {
  const EX = examOf((params && params[0]) || 'p') || examOf('p');
  const TOPICS = await loadExam(EX.id);
  title = `Formula sheet · ${EX.name}`; document.title = `${title} · OpenActuary`;
  let gi = 0;
  const groupHtml = (t, g) => `
      <section class="fs-group card" id="fs-${t.id}-${g.id}" aria-labelledby="fs-${t.id}-${g.id}-h">
        <div class="fs-gh"><span class="fs-badge" aria-hidden="true">${++gi}</span><div><h2 id="fs-${t.id}-${g.id}-h">${esc(g.title)}</h2>${g.blurb ? `<p class="small muted">${esc(g.blurb)}</p>` : ''}</div></div>
        <div class="fs-items">
          ${g.items.map(it => `
          <div class="fs-item">
            <h3>${esc(it.name)}</h3>
            <div class="texd">${esc(it.tex)}</div>
            <p class="fs-when"><span class="fs-wl">When to use</span> ${esc(it.when)}</p>
          </div>`).join('')}
        </div>
      </section>`;
  el.innerHTML = `
  <div class="container fsheet">
    <header class="page-head fs-head">
      <div>
        <div class="eyebrow">${esc(EX.name)} · ${esc(EX.title)}</div>
        <h1>Formula sheet</h1>
        <p class="lede">Every rule from the ${esc(EX.name)} lessons on one page, with a note on when to reach for it. Print it or save it as a PDF for review.</p>
      </div>
      <div class="fs-actions no-print">
        <button type="button" class="btn primary" data-print>${icon('download')} Print or save PDF</button>
        <a class="btn ghost" href="#/learn">${icon('book')} Back to Learn</a>
      </div>
    </header>
    ${liveExams().length > 1 ? `<div class="seg fs-exams no-print" role="group" aria-label="Exam">${liveExams().map(e => `<a class="segl" href="#/learn/formulas/${e.id}" aria-current="${e.id === EX.id ? 'page' : 'false'}">${esc(e.name)}</a>`).join('')}</div>` : ''}
    <nav class="fs-jump no-print" aria-label="Jump to a topic">
      ${TOPICS.map(t => `<span class="fs-jt">${esc(t.short)}</span>${t.formulas.map(g => `<a class="chip outline" href="#/learn/formulas" data-jump="fs-${t.id}-${g.id}">${esc(g.title)}</a>`).join('')}`).join('')}
    </nav>
    ${TOPICS.map(t => `<h2 class="fs-topic" id="fs-${t.id}">${esc(t.title)}</h2><div class="fs-groups">${t.formulas.map(g => groupHtml(t, g)).join('')}</div>`).join('')}
    <p class="tiny muted fs-foot">OpenActuary · free exam prep · ${esc(EX.name)} formula sheet</p>
  </div>`;
  el.addEventListener('click', e => {
    if (e.target.closest('[data-print]')) { window.print(); return; }
    const j = e.target.closest('[data-jump]');
    if (j) {                                   // in-page jump without changing the route
      e.preventDefault();
      const t = el.querySelector('#' + j.dataset.jump);
      if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    }
  });
  renderMath(el);
}
