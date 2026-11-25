// Skills hub (#/skills): the Excel and SQL tracks with lesson-by-lesson progress.
import { esc, icon } from '../util.js';
import { load } from '../progress.js';
import { ring, animateRings } from '../ui/charts.js';
import { reveal } from '../ui/motion.js';
import { loadAllTracks, TRACKS } from '../../data/skills/tracks.js';

export const title = 'Technical skills';

export async function render(el) {
  const tracks = await loadAllTracks();
  const st = load('skills', { done: {} }); const done = st.done || {};
  el.innerHTML = `
  <div class="container">
    <header class="page-head">
      <div class="eyebrow">Skills</div>
      <h1>Technical skills for actuaries</h1>
      <p class="lede">Hands-on Excel and SQL tutorials on insurance data. Everything runs in your browser: a real spreadsheet and a real SQL database, checked as you go. No software to install.</p>
    </header>
    ${TRACKS.map((meta, ti) => {
      const t = tracks[ti];
      if (!t) return `<section class="sk-track card"><h2>${esc(meta.name)}</h2><p class="muted">This track could not load. Try reloading the page.</p></section>`;
      const steps = t.lessons.flatMap(l => l.steps), d = steps.filter(s => done[s.id]).length;
      return `<section class="sk-track" data-reveal>
        <div class="sk-track-h">
          <span class="path-ic">${icon(meta.icon)}</span>
          <div style="flex:1;min-width:220px"><div class="eyebrow">${esc(meta.name)}</div><h2>${esc(t.title)}</h2><p class="muted" style="margin:4px 0 0;max-width:68ch">${esc(t.blurb || meta.tagline)}</p></div>
          ${ring(steps.length ? d / steps.length : 0, { size: 72, label: `${d}/${steps.length}`, done: steps.length && d === steps.length })}
        </div>
        ${meta.id === 'sql' ? `<p class="tiny muted sk-note">${icon('download')} The SQL lessons download a free SQLite engine (about 1 MB) from cdnjs the first time you open one.</p>` : ''}
        <ol class="sk-lessons">${t.lessons.map((l, i) => {
          const ld = l.steps.filter(s => done[s.id]).length, n = l.steps.length;
          const next = l.steps.find(s => !done[s.id]) || l.steps[0];
          return `<li><a class="card lift sk-lesson ${ld === n ? 'complete' : ''}" href="#/skills/${t.id}/${l.id}/${next.id}">
            <span class="sk-n">${ld === n ? icon('check') : i + 1}</span>
            <span class="sk-lt"><b>${esc(l.title)}</b><span class="small muted">${esc(l.level)} · ${n} steps · ~${l.minutes} min</span></span>
            <span class="sk-lp"><span class="bar"><i style="width:${Math.round(100 * ld / n)}%"></i></span><span class="tiny muted">${ld}/${n}</span></span>
          </a></li>`;
        }).join('')}</ol>
      </section>`;
    }).join('')}
  </div>`;
  animateRings(el); reveal(el);
}
