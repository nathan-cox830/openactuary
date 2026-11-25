// Home: hero, continue card, the four paths, featured cases, free-forever promise.
import { esc, icon } from '../util.js';
import { heroCurves, animateRings } from '../ui/charts.js';
import { countUp, reveal } from '../ui/motion.js';
import { CASES } from '../cases/registry.js';
import { caseCard } from './cases.js';
import * as store from '../progress.js';

export const title = '';

export function render(el) {
  const last = store.getLast();
  el.innerHTML = `
  <section class="home-hero">
    <div class="hero-art-wrap">${heroCurves()}</div>
    <div class="container hero-inner">
      <div class="hero-copy">
        <div class="eyebrow on-dark">Free actuarial exam prep &amp; case studies</div>
        <h1>Think like an actuary.<br><span class="grad">Free, forever.</span></h1>
        <p class="hero-lede">Learn all of Exam P, practice with endless fresh problems, and solve interactive insurance cases built on real data. No account, no fees, no ads.</p>
        <div class="row hero-ctas">
          <a class="btn primary lg" href="#/learn">Start Exam P ${icon('arrow')}</a>
          <a class="btn lg on-dark-ghost" href="#/cases">Explore the cases</a>
        </div>
        ${last && last.route ? `<a class="continue" href="#/${esc(String(last.route).replace(/^#?\/?/, ''))}"><span class="continue-ic">${icon('play')}</span><span><span class="tiny">Continue where you left off</span><b>${esc(last.label || 'Your last page')}</b></span>${icon('arrow')}</a>` : ''}
      </div>
    </div>
  </section>

  <section class="container stats-strip" data-reveal>
    <div><b data-count="3">3</b><span>interactive cases</span></div>
    <div><b>∞</b><span>fresh practice problems</span></div>
    <div><b data-count="0" data-prefix="$">$0</b><span>forever, for everyone</span></div>
    <div><b data-count="0">0</b><span>accounts needed</span></div>
  </section>

  <section class="container paths">
    <h2 class="section-title" data-reveal>Four ways in</h2>
    <div class="path-grid">
      ${[
        ['book', 'Learn', 'All of Exam P', 'Step-by-step lessons on all three Exam P topics, with interactive Venn diagrams, distribution explorers and simulators, plus a formula sheet and flashcards.', '#/learn', 'Start learning'],
        ['dice', 'Practice', 'Quiz and problem generator', 'Exam-style multiple choice with worked solutions, and a generator that writes a new problem every time.', '#/practice', 'Practice now'],
        ['layers', 'Cases', 'Solve real insurance problems', 'Reserve a fast-growing insurer, file an auto rate, price an accident surcharge. Then see what happened.', '#/cases', 'Browse cases'],
        ['briefcase', 'Careers', 'Land the internship', 'Curated job searches, the path from first exam to credential, and a timed mock interview coach.', '#/careers', 'Plan your career'],
      ].map(([ic, k, t, d, href, cta], i) => `<a class="path card lift" href="${href}" data-reveal style="--d:${i * 60}ms"><span class="path-ic">${icon(ic)}</span><span class="eyebrow">${k}</span><h3>${t}</h3><p>${d}</p><span class="path-go">${cta} ${icon('arrow')}</span></a>`).join('')}
    </div>
  </section>

  <section class="container">
    <div class="row between section-row" data-reveal><h2 class="section-title" style="margin:0">Interactive cases</h2><a class="btn quiet" href="#/cases">All cases ${icon('arrow')}</a></div>
    <div class="case-grid">${CASES.map(caseCard).join('')}</div>
  </section>

  <section class="container">
    <div class="promise" data-reveal>
      <div class="promise-copy"><span class="path-ic">${icon('shield')}</span><h2>Free forever. Private by design.</h2>
      <p>OpenActuary runs entirely in your browser. There's no account, no server collecting your answers and no paid features. Your progress is saved on this device, and you can export it and take it anywhere.</p>
      <div class="row"><a class="btn ghost" href="#/progress">See my progress</a><button class="btn quiet" type="button" data-export-progress>${icon('download')} Export progress</button></div></div>
      <ul class="promise-list">${['No sign-up or email', 'No ads or tracking', 'Works on any device', 'Original practice content', 'Real Schedule P data in the cases'].map(x => `<li>${icon('check')} ${x}</li>`).join('')}</ul>
    </div>
  </section>`;
  countUp(el); reveal(el); animateRings(el);
}
