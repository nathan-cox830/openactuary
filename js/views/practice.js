// Exam P · General Probability problem generator (#/practice).
// Endless fresh problems from the templates in data/exam-p/generator.js. Each problem is seeded, so
// "Problem #<seed>" can be repeated exactly. Topic chips and difficulty choose the template and level.
// Saves to the "practice" namespace: { attempts, correct, streak, bestStreak, byTemplate: { <id>: [right, total] } }.
import { esc, icon, pct } from '../util.js';
import { load, update as updateStore, setLast } from '../progress.js';
import { renderMath } from '../ui/katex.js';
import { applyGlossary } from '../ui/glossary.js';
import { LEVELS } from '../../data/exam-p/generator.js';
import { loadExam, subtopicLabels, makeProblemFrom, resolveScope, liveExams, exam as examOf } from '../../data/exams.js';

export const title = 'Problem generator';

const LET = ['A', 'B', 'C', 'D', 'E'];
const FALLBACK = { attempts: 0, correct: 0, streak: 0, bestStreak: 0, byTemplate: {} };
let root = null;
// area: one Exam P topic (e.g. 'univariate'); ui.topics: the subtopics switched on within it.
let ALL = [], ALLT = [], TEMPLATES = [], TOPICS = {}, area = null, EXAM = 'p';
const ui = { topics: new Set(), diff: 'mixed' };
const makeProblem = (tid, level, seed) => makeProblemFrom(ALLT, tid, level, seed);
function setArea(id) {
  const t = ALL.find(x => x.id === id) || ALL[0]; area = t.id;
  TEMPLATES = t.templates; ui.topics = new Set(TEMPLATES.map(x => x.topic));
  try { history.replaceState(null, '', '#/practice/' + area); } catch (e) { }
  setLast('#/practice/' + area, 'Problem generator: ' + t.short);
}
function areaChips() { return ALL.map(t => `<button type="button" class="chip" data-area="${t.id}" aria-pressed="${t.id === area}">${esc(t.short)}</button>`).join(''); }
function topicChips() {
  return [...new Set(TEMPLATES.map(x => x.topic))].map(k => `<button type="button" class="chip" data-topic="${k}" aria-pressed="${ui.topics.has(k)}">${esc(TOPICS[k] || k)}</button>`).join('');
}
let prob = null, answered = false;
const counted = new Set();                 // problems already scored in this visit (repeats don't count twice)
const stats = () => { const s = load('practice', FALLBACK); s.byTemplate = s.byTemplate || {}; return s; };

export async function render(el, params) {
  root = el;
  const sc = resolveScope(params && params[0]); EXAM = sc.examId;
  ALL = await loadExam(EXAM); ALLT = ALL.flatMap(t => t.templates); TOPICS = subtopicLabels(ALL);
  setArea(sc.topicId);
  el.innerHTML = `
  <div class="container gen-page">
    <header class="page-head">
      <div class="eyebrow" data-eyebrow>${esc(examOf(EXAM).name)} · Practice</div>
      <h1>Problem generator</h1>
      <p class="lede">Fresh exam problems every time, each with a step-by-step solution using the actual numbers. Pick a topic and difficulty, then keep your streak going.</p>
    </header>
    <div class="gen-layout">
      <aside class="gen-side">
        <section class="card gen-ctrl" aria-labelledby="gen-t-h">
          ${liveExams().length > 1 ? `<div class="seg gen-exam" role="group" aria-label="Exam">${liveExams().map(e => `<button type="button" data-exam="${e.id}" aria-pressed="${e.id === EXAM}">${esc(e.name)}</button>`).join('')}</div>` : ''}
          <h3 id="gen-t-h" class="gen-h">Topic</h3>
          <div class="chips gen-area" role="group" aria-label="Topic" data-areas>${areaChips()}</div>
          <h3 class="gen-h">Problem types</h3>
          <div class="chips gen-topics" role="group" aria-label="Problem types" data-topics>${topicChips()}</div>
          <h3 class="gen-h">Difficulty</h3>
          <div class="seg gen-diff" role="group" aria-label="Difficulty">
            ${[['mixed', 'Mixed'], ['1', 'Easy'], ['2', 'Medium'], ['3', 'Hard']].map(([k, l]) => `<button type="button" data-diff="${k}" aria-pressed="${k === ui.diff}">${l}</button>`).join('')}
          </div>
        </section>
        <section class="gen-stats" aria-label="Your stats" data-stats></section>
        <details class="disclose gen-by"><summary>Accuracy by problem type</summary><div data-by></div></details>
      </aside>
      <section class="card gen-card" aria-labelledby="gen-q-h" data-card></section>
    </div>
  </div>`;
  el.addEventListener('click', onClick);
  el.addEventListener('change', onChange);
  drawStats();
  next();
}
export function destroy() { root = null; }

/* ---------- problem selection ---------- */
function next() {
  const pool = TEMPLATES.filter(t => ui.topics.has(t.topic));
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  const level = ui.diff === 'mixed' ? 1 + Math.floor(Math.random() * 3) : +ui.diff;
  const seed = 1 + Math.floor(Math.random() * 999999);
  show(makeProblem(tpl.id, level, seed));
}
function show(p) {
  prob = p; answered = false;
  const card = root.querySelector('[data-card]');
  card.innerHTML = `
    <div class="gen-meta">
      <span class="chip accent">${esc(TOPICS[p.topic])}</span>
      <span class="pill">${LEVELS[p.level]}</span>
      <span class="gen-name small muted">${esc(p.name)}</span>
      <span class="gen-seed mono tiny" title="Problems with the same number, type and level are identical">Problem #${p.seed}</span>
    </div>
    <h2 class="sr-only" id="gen-q-h">Problem ${p.seed}</h2>
    <div class="prose gen-q" id="gen-q">${p.q}</div>
    <fieldset class="opts gen-opts" aria-labelledby="gen-q">
      ${p.choices.map((c, k) => `<label><input type="radio" name="gen" value="${k}"><span class="qz-let">${LET[k]}</span><span class="mono">${esc(c.text)}</span></label>`).join('')}
    </fieldset>
    <div class="gen-act">
      <button type="button" class="btn primary" data-act="check" disabled>Check answer</button>
      <button type="button" class="btn quiet" data-act="skip">Skip ${icon('arrow')}</button>
    </div>
    <div class="gen-fb" data-fb aria-live="polite"></div>`;
  renderMath(card);
  applyGlossary(card);
}

/* ---------- answering ---------- */
function check() {
  const sel = root.querySelector('input[name="gen"]:checked'); if (!sel || answered) return;
  answered = true;
  const k = +sel.value, ok = k === prob.correctIndex;
  const key = `${prob.tid}|${prob.level}|${prob.seed}`;
  if (!counted.has(key)) {
    counted.add(key);
    updateStore('practice', s => {
      s.attempts = (s.attempts || 0) + 1; s.correct = (s.correct || 0) + (ok ? 1 : 0);
      s.streak = ok ? (s.streak || 0) + 1 : 0; s.bestStreak = Math.max(s.bestStreak || 0, s.streak);
      s.byTemplate = s.byTemplate || {}; const b = s.byTemplate[prob.tid] || [0, 0]; b[0] += ok ? 1 : 0; b[1]++; s.byTemplate[prob.tid] = b;
    }, FALLBACK);
  }
  const labels = [...root.querySelectorAll('.gen-opts label')];
  labels.forEach((l, i) => { l.classList.toggle('right', i === prob.correctIndex); l.classList.toggle('wrong', i === k && !ok); });
  root.querySelectorAll('.gen-opts input').forEach(i => { i.disabled = true; });
  const s = stats();
  const fb = root.querySelector('[data-fb]');
  fb.innerHTML = `
    <div class="fb ${ok ? 'ok' : 'no'}"><div><b>${ok ? 'Correct!' : 'Not this time.'}</b> The answer is <b>${LET[prob.correctIndex]}: ${esc(prob.choices[prob.correctIndex].text)}</b>.
      ${ok && s.streak > 1 ? `<span class="pill ok gen-streak">${icon('spark')} ${s.streak} in a row</span>` : ''}</div></div>
    <div class="gen-sol prose"><div class="qz-solh">Worked solution</div>${prob.steps}</div>
    <div class="gen-act">
      <button type="button" class="btn primary" data-act="next">Next problem ${icon('arrow')}</button>
      <button type="button" class="btn ghost" data-act="repeat">${icon('refresh')} Repeat #${prob.seed}</button>
    </div>`;
  const act = root.querySelector('.gen-card > .gen-act'); if (act) act.remove();
  renderMath(fb);
  drawStats(true);
  const nb = fb.querySelector('[data-act="next"]'); if (nb) nb.focus({ preventScroll: true });
}

function drawStats(bump) {
  const s = stats();
  const acc = s.attempts ? s.correct / s.attempts : null;
  root.querySelector('[data-stats]').innerHTML = `
    <div class="kpi hero${bump ? ' bump' : ''}"><div class="l">Current streak</div><div class="v">${s.streak || 0}</div><div class="tiny muted">Best ${s.bestStreak || 0}</div></div>
    <div class="kpi"><div class="l">Accuracy</div><div class="v">${acc == null ? '—' : pct(acc, 0)}</div><div class="tiny muted">${s.correct || 0} of ${s.attempts || 0} correct</div></div>`;
  const rows = ALLT.map(t => { const b = s.byTemplate[t.id]; return `<tr><td class="wrap">${esc(t.name)}<div class="tiny muted">${esc(TOPICS[t.topic])}</div></td><td class="num">${b ? `${b[0]}/${b[1]}` : '—'}</td><td class="num">${b && b[1] ? pct(b[0] / b[1], 0) : '—'}</td></tr>`; }).join('');
  root.querySelector('[data-by]').innerHTML = `<div class="tblwrap"><table><thead><tr><th>Problem type</th><th>Right</th><th>Rate</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ---------- events ---------- */
function onChange(e) {
  if (e.target.name === 'gen' && !answered) { const b = root.querySelector('[data-act="check"]'); if (b) b.disabled = false; }
}
function onClick(e) {
  const ex = e.target.closest('[data-exam]');
  if (ex) {
    if (ex.dataset.exam === EXAM) return;
    EXAM = ex.dataset.exam;
    loadExam(EXAM).then(all => {
      ALL = all; ALLT = ALL.flatMap(t => t.templates); TOPICS = subtopicLabels(ALL); setArea(null);
      root.querySelectorAll('[data-exam]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.exam === EXAM)));
      root.querySelector('[data-eyebrow]').textContent = examOf(EXAM).name + ' · Practice';
      root.querySelector('[data-areas]').innerHTML = areaChips(); root.querySelector('[data-topics]').innerHTML = topicChips();
      drawStats(); next();
    });
    return;
  }
  const ar = e.target.closest('[data-area]');
  if (ar) {
    setArea(ar.dataset.area);
    root.querySelectorAll('[data-area]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.area === area)));
    root.querySelector('[data-topics]').innerHTML = topicChips();
    next(); return;
  }
  const tp = e.target.closest('[data-topic]');
  if (tp) {
    const k = tp.dataset.topic;
    if (ui.topics.has(k) && ui.topics.size === 1) { tp.classList.add('shake'); setTimeout(() => tp.classList.remove('shake'), 400); return; }   // keep at least one topic
    if (ui.topics.has(k)) ui.topics.delete(k); else ui.topics.add(k);
    tp.setAttribute('aria-pressed', String(ui.topics.has(k)));
    if (!ui.topics.has(prob.topic) && !answered) next();
    return;
  }
  const df = e.target.closest('[data-diff]');
  if (df) { ui.diff = df.dataset.diff; root.querySelectorAll('[data-diff]').forEach(b => b.setAttribute('aria-pressed', String(b === df))); if (!answered) next(); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.dataset.act === 'check') check();
  else if (a.dataset.act === 'next' || a.dataset.act === 'skip') { next(); focusQ(); }
  else if (a.dataset.act === 'repeat') { show(makeProblem(prob.tid, prob.level, prob.seed)); focusQ(); }
}
function focusQ() { const q = root.querySelector('.gen-card'); if (q) { q.setAttribute('tabindex', '-1'); q.focus({ preventScroll: false }); } }
