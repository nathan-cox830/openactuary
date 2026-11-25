// Exam P · General Probability formula sheet (#/learn/formulas).
// Grouped by topic with a "when to use" note per formula; KaTeX display math; print-friendly via css/learn.css.
import { esc, icon } from '../util.js';
import { renderMath } from '../ui/katex.js';
import { FORMULA_GROUPS } from '../../data/exam-p/formulas.js';

export const title = 'Formula sheet · General Probability';

export function render(el) {
  el.innerHTML = `
  <div class="container fsheet">
    <header class="page-head fs-head">
      <div>
        <div class="eyebrow">Exam P · General Probability</div>
        <h1>Formula sheet</h1>
        <p class="lede">Every rule from the lesson on one page, with a note on when to reach for it. Print it or save it as a PDF for review.</p>
      </div>
      <div class="fs-actions no-print">
        <button type="button" class="btn primary" data-print>${icon('download')} Print or save PDF</button>
        <a class="btn ghost" href="#/learn">${icon('book')} Back to the lesson</a>
      </div>
    </header>
    <nav class="fs-jump no-print" aria-label="Jump to a topic">
      ${FORMULA_GROUPS.map(g => `<a class="chip outline" href="#/learn/formulas" data-jump="fs-${g.id}">${esc(g.title)}</a>`).join('')}
    </nav>
    <div class="fs-groups">
      ${FORMULA_GROUPS.map((g, gi) => `
      <section class="fs-group card" id="fs-${g.id}" aria-labelledby="fs-${g.id}-h">
        <div class="fs-gh"><span class="fs-badge" aria-hidden="true">${gi + 1}</span><div><h2 id="fs-${g.id}-h">${esc(g.title)}</h2><p class="small muted">${esc(g.blurb)}</p></div></div>
        <div class="fs-items">
          ${g.items.map(it => `
          <div class="fs-item">
            <h3>${esc(it.name)}</h3>
            <div class="texd">${esc(it.tex)}</div>
            <p class="fs-when"><span class="fs-wl">When to use</span> ${esc(it.when)}</p>
          </div>`).join('')}
        </div>
      </section>`).join('')}
    </div>
    <p class="tiny muted fs-foot">OpenActuary · free Exam P prep · General Probability formula sheet</p>
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
