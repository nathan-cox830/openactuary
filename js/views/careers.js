// Careers page (#/careers): curated job-search links, the exam-and-career path guide,
// resume/project tips, and the entry point to the interview coach.
import { esc, icon } from '../util.js';
import { load, setLast } from '../progress.js';
import { reveal, countUp } from '../ui/motion.js';
import { ring, animateRings } from '../ui/charts.js';
import { AREAS, LEVELS, BOARDS, linkedInUrl, indeedUrl, describe } from '../../data/careers/job-links.js';
import { PATH, SKILLS, RESUME_TIPS, PROJECT_TIPS, PROJECT_EXAMPLE } from '../../data/careers/path-guide.js';
import { QUESTIONS } from '../../data/careers/interview-questions.js';

export const title = 'Careers';

const EXT = 'target="_blank" rel="noopener"';
const extLabel = '<span class="sr-only"> (opens in a new tab)</span>';

function link(l) {
  if (l.ext) return `<a class="cr-link" href="${esc(l.href)}" ${EXT}>${esc(l.label)} ${icon('external')}${extLabel}</a>`;
  return `<a class="cr-link" href="${esc(l.href)}">${esc(l.label)} ${icon('arrow')}</a>`;
}

function searchRows(level, area, loc) {
  return `
    <a class="cr-search" href="${esc(linkedInUrl(level, area, loc))}" ${EXT} data-src="li">
      <span class="cr-src li" aria-hidden="true">in</span>
      <span class="cr-search-txt"><b>LinkedIn Jobs</b><span class="muted tiny">${esc(describe(level, area, loc, 'li'))}</span></span>
      ${icon('external')}${extLabel}
    </a>
    <a class="cr-search" href="${esc(indeedUrl(level, area, loc))}" ${EXT} data-src="in">
      <span class="cr-src ind" aria-hidden="true">i</span>
      <span class="cr-search-txt"><b>Indeed</b><span class="muted tiny">${esc(describe(level, area, loc))}</span></span>
      ${icon('external')}${extLabel}
    </a>`;
}

export function render(el) {
  setLast('#/careers', 'Careers');
  const iv = load('interview', { sessions: 0, practiced: {}, flagged: {}, notes: {} });
  const practicedN = QUESTIONS.filter(q => (iv.practiced || {})[q.id]).length;
  const flaggedN = Object.keys(iv.flagged || {}).filter(k => iv.flagged[k]).length;
  let area = 'any', loc = '';

  el.innerHTML = `
  <div class="cr-page">
    <section class="cr-hero">
      <div class="container cr-hero-in">
        <div class="cr-hero-copy">
          <div class="eyebrow">Careers</div>
          <h1>Turn exam prep into an actuarial career</h1>
          <p class="lede">Curated job searches, a clear map from your first exam to fellowship, and a timed interview coach. All free, nothing to sign up for.</p>
          <div class="row cr-hero-cta">
            <button class="btn primary lg" type="button" data-jump="cr-find">${icon('search')} Find jobs</button>
            <a class="btn ghost lg cr-ghost" href="#/careers/interview">${icon('mic')} Interview coach</a>
          </div>
          <div class="row cr-hero-jumps">
            <button class="btn quiet sm" type="button" data-jump="cr-path">The path guide</button>
            <button class="btn quiet sm" type="button" data-jump="cr-tips">Resume tips</button>
          </div>
        </div>
        <ol class="cr-hero-steps" aria-label="Path preview">
          ${PATH.map(p => `<li><span>${p.n}</span>${esc(p.title.replace(/ \(.*\)/, ''))}</li>`).join('')}
        </ol>
      </div>
    </section>

    <div class="container stack-lg cr-body">

      <section id="cr-find" class="stack" aria-labelledby="cr-find-h">
        <div class="cr-sec-head">
          <div class="eyebrow">Find jobs</div>
          <h2 id="cr-find-h">Pre-filtered searches, ready to open</h2>
          <p class="muted">Pick an area and a location; every link below updates. Links open the real job site in a new tab. We do not collect or store any job data.</p>
        </div>

        <div class="panel cr-filters">
          <div class="cr-filter-group" role="group" aria-labelledby="cr-area-l">
            <span id="cr-area-l" class="cr-flabel">Practice area</span>
            <div class="chips">
              ${AREAS.map(a => `<button type="button" class="chip" data-area="${a.id}" aria-pressed="${a.id === area}">${esc(a.label)}</button>`).join('')}
            </div>
          </div>
          <label class="field cr-loc">Location
            <span class="cr-loc-in">${icon('search')}<input type="search" id="cr-loc" placeholder="City, state, or leave blank for nationwide" autocomplete="off"></span>
          </label>
        </div>

        <div class="grid-3 cr-levels">
          ${LEVELS.map(l => `
            <article class="card cr-level" data-reveal>
              <div class="row cr-level-h"><span class="cr-ic">${icon(l.icon)}</span><h3>${esc(l.label)}</h3></div>
              <p class="small muted">${esc(l.blurb)}</p>
              <div class="cr-searches" data-level="${l.id}">${searchRows(l, area, loc)}</div>
            </article>`).join('')}
        </div>

        <h3 class="cr-sub">Actuarial job boards and guides</h3>
        <div class="grid-3 cr-boards">
          ${BOARDS.map(b => `
            <a class="card lift cr-board" href="${esc(b.url)}" ${EXT} data-reveal>
              <span class="row between"><span class="tiny muted cr-org">${esc(b.org)}</span>${icon('external')}</span>
              <b class="cr-board-name">${esc(b.name)}</b>
              <span class="small cr-board-best">${esc(b.best)}</span>
              <span class="chips">${b.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</span>
              ${extLabel}
            </a>`).join('')}
        </div>
        <p class="tiny muted">OpenActuary is independent and not affiliated with these sites, the SOA or the CAS. Postings and filters are controlled by each site.</p>
      </section>

      <section id="cr-path" class="stack" aria-labelledby="cr-path-h">
        <div class="cr-sec-head">
          <div class="eyebrow">The path guide</div>
          <h2 id="cr-path-h">From curious student to fellow</h2>
          <p class="muted">The typical route, with practical advice at each step. Requirements change, so confirm details on <a href="https://www.soa.org/" ${EXT}>soa.org</a> or <a href="https://www.casact.org/" ${EXT}>casact.org</a>.</p>
        </div>

        <nav class="cr-stepper" aria-label="Jump to a step">
          ${PATH.map((p, i) => `<button type="button" data-step="${p.id}"${i === 0 ? ' aria-current="step"' : ''}><span class="n">${p.n}</span><span class="t">${esc(p.title.replace(/ \(.*\)/, '').replace(', while continuing exams', ''))}</span></button>`).join('')}
        </nav>

        <ol class="cr-timeline">
          ${PATH.map((p, i) => `
            <li class="cr-step" id="cr-step-${p.id}" data-reveal${i === 0 ? ' data-active' : ''}>
              <span class="cr-node" aria-hidden="true">${icon(p.icon)}</span>
              <div class="card cr-step-card">
                <div class="row between"><span class="pill cur">Step ${p.n} · ${esc(p.stage)}</span></div>
                <h3>${esc(p.title)}</h3>
                <p class="cr-step-sum">${esc(p.summary)}</p>
                <ul class="cr-ticks">${p.tips.map(t => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>
                ${p.links.length ? `<div class="row cr-step-links">${p.links.map(link).join('')}</div>` : ''}
              </div>
            </li>`).join('')}
        </ol>

        <div class="card cr-skills" data-reveal>
          <h3>What employers look for</h3>
          <p class="small muted">Exams open the door; these skills win the interview. You do not need all of them on day one.</p>
          <div class="cr-skill-grid">
            ${SKILLS.map(s => `<div class="cr-skill"><span class="cr-ic">${icon(s.icon)}</span><b>${esc(s.title)}</b><ul>${s.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
          </div>
        </div>
      </section>

      <section id="cr-tips" class="stack" aria-labelledby="cr-tips-h">
        <div class="cr-sec-head">
          <div class="eyebrow">Tips</div>
          <h2 id="cr-tips-h">Resume and project tips</h2>
        </div>
        <div class="grid-2">
          <div class="card" data-reveal>
            <div class="row cr-level-h"><span class="cr-ic">${icon('pencil')}</span><h3>Resume tips for actuarial internships</h3></div>
            <ol class="cr-numlist">${RESUME_TIPS.map(t => `<li><b>${esc(t.t)}</b> <span class="muted">${esc(t.d)}</span></li>`).join('')}</ol>
          </div>
          <div class="card" data-reveal>
            <div class="row cr-level-h"><span class="cr-ic">${icon('brief')}</span><h3>Talking about case studies as projects</h3></div>
            <p class="small muted">The <a href="#/cases">OpenActuary case studies</a> use real public data, which makes them good talking points in interviews.</p>
            <ul class="cr-ticks">${PROJECT_TIPS.map(t => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>
            <div class="example"><span class="tiny muted cr-ex-l">Example resume bullet</span><br>${esc(PROJECT_EXAMPLE)}</div>
          </div>
        </div>
      </section>

      <section class="cr-coach" aria-labelledby="cr-coach-h" data-reveal>
        <div class="cr-coach-copy">
          <div class="eyebrow">Interview coach</div>
          <h2 id="cr-coach-h">Rehearse before the real thing</h2>
          <p>Timed mock interviews with ${QUESTIONS.length} actuarial questions: technical, behavioral and “why actuarial”. Model answer outlines and a self-review checklist after every answer.</p>
          <div class="row">
            <a class="btn primary lg" href="#/careers/interview">${icon('play')} Start a mock interview</a>
          </div>
        </div>
        <div class="cr-coach-stats">
          ${ring(practicedN / QUESTIONS.length, { size: 112, label: `${practicedN}/${QUESTIONS.length}`, done: practicedN === QUESTIONS.length, stroke: 7 })}
          <div class="cr-coach-kv">
            <div><b data-count="${iv.sessions || 0}">0</b><span>sessions</span></div>
            <div><b data-count="${practicedN}">0</b><span>questions practiced</span></div>
            <div><b data-count="${flaggedN}">0</b><span>flagged to redo</span></div>
          </div>
        </div>
      </section>
    </div>
  </div>`;

  /* ----- filters ----- */
  const refreshLinks = () => {
    el.querySelectorAll('.cr-searches').forEach(box => {
      const lv = LEVELS.find(l => l.id === box.dataset.level);
      box.innerHTML = searchRows(lv, area, loc);
    });
  };
  el.querySelectorAll('[data-area]').forEach(b => b.addEventListener('click', () => {
    area = b.dataset.area;
    el.querySelectorAll('[data-area]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    refreshLinks();
  }));
  el.querySelector('#cr-loc').addEventListener('input', e => { loc = e.target.value.slice(0, 80); refreshLinks(); });

  /* ----- in-page jumps (buttons, so the hash router is not triggered) ----- */
  el.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => {
    const t = el.querySelector('#' + b.dataset.jump);
    if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); const h = t.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  }));

  /* ----- path stepper: highlights a step and scrolls it into view ----- */
  const steps = [...el.querySelectorAll('.cr-stepper button')];
  steps.forEach(btn => btn.addEventListener('click', () => {
    steps.forEach(t => { if (t === btn) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current'); });
    el.querySelectorAll('.cr-step').forEach(s => s.toggleAttribute('data-active', s.id === 'cr-step-' + btn.dataset.step));
    const s = el.querySelector('#cr-step-' + btn.dataset.step);
    s.classList.add('in'); s.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));

  reveal(el);
  countUp(el);
  animateRings(el);
}
