// Exam P · General Probability practice quiz (#/practice/quiz).
// Modes: 10 random questions, all 20, or review missed. Optional timer at the Exam P pace (6 min/question).
// One question at a time, then a results screen with a ring, per-topic breakdown and worked solutions.
// Saves to the "quiz" namespace: { history: [{ at, score, total, secs, byTopic }], missed: { qid: true }, best }.
// `best` is the best score as a whole-number percentage (0–100), since quizzes can be 10 or 20 questions.
import { esc, icon, pct } from '../util.js';
import { load, update as updateStore, setLast } from '../progress.js';
import { renderMath } from '../ui/katex.js';
import { ring, animateRings } from '../ui/charts.js';
import { confetti, countUp } from '../ui/motion.js';
import { QUESTIONS, TOPICS } from '../../data/exam-p/quiz.js';

export const title = 'Practice quiz · General Probability';

const PACE = 360;                         // Exam P: about 6 minutes per question
const LET = ['A', 'B', 'C', 'D', 'E'];
const DIFF = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const FALLBACK = { history: [], missed: {}, best: 0 };
let root = null, timer = null;
let run = null;                           // { mode, qs, ans, i, t0, timed }
let opts = { timed: true };

export function render(el) {
  root = el; run = null;
  el.innerHTML = `<div class="container qz-page">
    <header class="page-head">
      <div class="eyebrow">Exam P · Practice</div>
      <h1>Practice quiz</h1>
      <p class="lede">Original exam-style questions on General Probability, five choices each, with a full worked solution for every one.</p>
    </header>
    <div data-body></div>
  </div>`;
  el.addEventListener('click', onClick);
  el.addEventListener('change', onChange);
  setLast('#/practice/quiz', 'Practice quiz');
  drawStart();
}
export function destroy() { stopTimer(); root = null; run = null; }

const store = () => { const s = load('quiz', FALLBACK); s.history = s.history || []; s.missed = s.missed || {}; return s; };
const mmss = secs => { secs = Math.max(0, Math.round(secs)); return Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'); };
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- start screen ---------- */
function drawStart() {
  stopTimer();
  const s = store(); const nMissed = QUESTIONS.filter(q => s.missed[q.id]).length;
  const last = s.history[s.history.length - 1];
  const body = root.querySelector('[data-body]');
  body.innerHTML = `
    <div class="qz-start">
      <div class="qz-modes">
        <button type="button" class="card lift qz-mode" data-start="quick">
          <span class="qz-mode-ic" aria-hidden="true">${icon('play')}</span>
          <b>Quick quiz</b><span class="small muted">10 random questions · about 60 minutes at exam pace</span></button>
        <button type="button" class="card lift qz-mode" data-start="full">
          <span class="qz-mode-ic" aria-hidden="true">${icon('layers')}</span>
          <b>Full set</b><span class="small muted">All ${QUESTIONS.length} questions in random order</span></button>
        <button type="button" class="card lift qz-mode" data-start="missed" ${nMissed ? '' : 'disabled aria-disabled="true"'}>
          <span class="qz-mode-ic" aria-hidden="true">${icon('refresh')}</span>
          <b>Review my missed questions</b><span class="small muted">${nMissed ? `${nMissed} question${nMissed === 1 ? '' : 's'} to review` : 'Nothing to review yet'}</span></button>
      </div>
      <div class="qz-side">
        <label class="qz-toggle card flat"><input type="checkbox" data-timed ${opts.timed ? 'checked' : ''}>
          <span><b>Show a timer</b><span class="small muted">Exam P gives you about 6 minutes per question. We'll show elapsed time and your pace. Nothing is cut off.</span></span></label>
        <div class="kpis qz-kpis">
          <div class="kpi"><div class="l">Best score</div><div class="v">${s.history.length ? s.best + '%' : '—'}</div></div>
          <div class="kpi"><div class="l">Quizzes taken</div><div class="v">${s.history.length}</div></div>
          <div class="kpi"><div class="l">Last score</div><div class="v">${last ? `${last.score}/${last.total}` : '—'}</div></div>
        </div>
        <p class="small muted">Topics: ${Object.values(TOPICS).map(esc).join(' · ')}.</p>
      </div>
    </div>`;
}

function start(mode) {
  const s = store();
  let qs = mode === 'missed' ? QUESTIONS.filter(q => s.missed[q.id]) : QUESTIONS.slice();
  shuffle(qs);
  if (mode === 'quick') qs = qs.slice(0, 10);
  if (!qs.length) return;
  run = { mode, qs, ans: qs.map(() => null), i: 0, t0: Date.now(), timed: opts.timed };
  drawQuestion(true);
  if (run.timed) timer = setInterval(tick, 1000);
}
function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
const elapsed = () => (Date.now() - run.t0) / 1000;

/* ---------- running ---------- */
function drawQuestion(focus) {
  const { qs, ans, i } = run, q = qs[i], n = qs.length;
  const answered = ans.filter(a => a != null).length;
  const body = root.querySelector('[data-body]');
  body.innerHTML = `
    <div class="qz-run">
      <div class="qz-top">
        <div class="qz-count"><b>Question ${i + 1}</b> of ${n}</div>
        <div class="qz-tags"><span class="chip accent">${esc(TOPICS[q.topic])}</span><span class="pill">${DIFF[q.diff]}</span></div>
        ${run.timed ? `<div class="qz-timer" aria-live="off">${icon('clock')}<span data-el></span><span class="qz-pace" data-pace></span></div>` : ''}
      </div>
      <div class="bar qz-bar" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${answered}"><i style="width:${(answered / n) * 100}%"></i></div>
      <nav class="qz-dots" aria-label="Jump to question">
        ${qs.map((x, k) => `<button type="button" class="qz-dot${k === i ? ' cur' : ''}${ans[k] != null ? ' ans' : ''}" data-go="${k}" aria-label="Question ${k + 1}${ans[k] != null ? ', answered' : ''}" ${k === i ? 'aria-current="true"' : ''}>${k + 1}</button>`).join('')}
      </nav>
      <div class="card qz-card">
        <div class="prose qz-q" id="qz-q">${q.q}</div>
        <fieldset class="opts qz-opts" aria-labelledby="qz-q">
          ${q.choices.map((c, k) => `<label><input type="radio" name="qz" value="${k}" ${ans[i] === k ? 'checked' : ''}><span class="qz-let">${LET[k]}</span><span>${c}</span></label>`).join('')}
        </fieldset>
      </div>
      <div class="qz-nav">
        <button type="button" class="btn ghost" data-act="prev" ${i === 0 ? 'disabled' : ''}>${icon('back')} Previous</button>
        <button type="button" class="btn quiet" data-act="quit">Quit</button>
        ${i < n - 1 ? `<button type="button" class="btn primary" data-act="next">Next ${icon('arrow')}</button>`
          : `<button type="button" class="btn primary" data-act="finish">Finish ${icon('check')}</button>`}
      </div>
      <p class="qz-warn small" data-warn role="status" aria-live="polite"></p>
    </div>`;
  renderMath(body);
  if (run.timed) tick();
  if (focus) { const f = body.querySelector('.qz-count'); f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
}

function tick() {
  if (!run || !root) return;
  const el = root.querySelector('[data-el]'), pace = root.querySelector('[data-pace]');
  if (!el) return;
  const t = elapsed(), n = run.qs.length, budget = n * PACE;
  el.textContent = mmss(t) + ' / ' + mmss(budget);
  const target = (run.i + 1) * PACE;                       // time by which this question "should" be done
  const ahead = t <= target;
  pace.textContent = ahead ? 'on pace' : 'behind pace';
  pace.className = 'qz-pace ' + (ahead ? 'ok' : 'slow');
}

function onChange(e) {
  if (e.target.matches('[data-timed]')) { opts.timed = e.target.checked; return; }
  if (run && e.target.name === 'qz') {
    run.ans[run.i] = +e.target.value;
    const answered = run.ans.filter(a => a != null).length, n = run.qs.length;
    const bar = root.querySelector('.qz-bar'); bar.setAttribute('aria-valuenow', answered); bar.querySelector('i').style.width = (answered / n) * 100 + '%';
    const dot = root.querySelector(`[data-go="${run.i}"]`); dot.classList.add('ans'); dot.setAttribute('aria-label', `Question ${run.i + 1}, answered`);
  }
}

function onClick(e) {
  const st = e.target.closest('[data-start]'); if (st && !st.disabled) { start(st.dataset.start); return; }
  const go = e.target.closest('[data-go]'); if (go && run) { run.i = +go.dataset.go; drawQuestion(false); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act;
  if (act === 'prev' && run && run.i > 0) { run.i--; drawQuestion(true); }
  else if (act === 'next' && run) { run.i++; drawQuestion(true); }
  else if (act === 'quit') { run = null; drawStart(); }
  else if (act === 'finish' && run) {
    const left = run.ans.filter(x => x == null).length;
    if (left && !a.dataset.sure) {
      a.dataset.sure = '1'; a.innerHTML = `Finish anyway ${icon('check')}`;
      root.querySelector('[data-warn]').textContent = `${left} question${left === 1 ? ' is' : 's are'} unanswered and will be marked wrong. Use the numbers above to go back, or press Finish anyway.`;
      return;
    }
    finish();
  }
  else if (act === 'again' && run) { const m = run.mode; start(m === 'missed' ? 'quick' : m); }
  else if (act === 'missed') start('missed');
  else if (act === 'home') { run = null; drawStart(); }
}

/* ---------- results ---------- */
function finish() {
  stopTimer();
  const { qs, ans } = run; const secs = Math.round(elapsed());
  const byTopic = {}; let score = 0;
  qs.forEach((q, k) => { const ok = ans[k] === q.answer; if (ok) score++; const b = byTopic[q.topic] || (byTopic[q.topic] = [0, 0]); b[0] += ok ? 1 : 0; b[1]++; });
  const total = qs.length, pc = Math.round((score / total) * 100);
  let prevBest = 0;
  updateStore('quiz', s => {
    s.history = s.history || []; s.missed = s.missed || {};
    prevBest = s.history.length ? (s.best || 0) : -1;
    s.history.push({ at: Date.now(), score, total, secs, byTopic });
    if (s.history.length > 100) s.history = s.history.slice(-100);
    qs.forEach((q, k) => { if (ans[k] === q.answer) delete s.missed[q.id]; else s.missed[q.id] = true; });
    s.best = Math.max(s.best || 0, pc);
  }, FALLBACK);
  run.result = { score, total, secs, byTopic, pc };
  drawResults(prevBest);
  if (pc >= 80) confetti();
}

function drawResults(prevBest) {
  const { qs, ans, result: r } = run;
  const nMissed = Object.keys(store().missed).length;
  const verdict = r.pc >= 80 ? 'Excellent work.' : r.pc >= 60 ? 'Solid. Review the misses below.' : 'Good practice. The solutions below show where points slipped.';
  const body = root.querySelector('[data-body]');
  body.innerHTML = `
    <div class="qz-res">
      <section class="card qz-score" aria-labelledby="qz-res-h">
        ${ring(r.score / r.total, { size: 132, stroke: 8, label: r.pc + '%', done: r.pc >= 80 })}
        <div>
          <h2 id="qz-res-h"><span data-count="${r.score}">${r.score}</span> of ${r.total} correct</h2>
          <p class="muted">${verdict}${prevBest >= 0 && r.pc > prevBest ? ' <span class="pill ok">New best</span>' : ''}</p>
          <p class="small muted">${icon('clock')} ${mmss(r.secs)} total · ${mmss(r.secs / r.total)} per question (exam pace ${mmss(PACE)})</p>
          <div class="row qz-res-act">
            <button type="button" class="btn primary" data-act="again">${icon('refresh')} New ${run.mode === 'full' ? 'full set' : 'quiz'}</button>
            ${nMissed ? `<button type="button" class="btn ghost" data-act="missed">Review missed (${nMissed})</button>` : ''}
            <button type="button" class="btn quiet" data-act="home">All modes</button>
          </div>
        </div>
      </section>
      <section class="card qz-topics" aria-labelledby="qz-top-h">
        <h3 id="qz-top-h">By topic</h3>
        ${Object.keys(TOPICS).filter(t => r.byTopic[t]).map(t => { const [a, b] = r.byTopic[t]; return `
          <div class="qz-trow"><span class="qz-tl">${esc(TOPICS[t])}</span>
            <div class="bar" aria-hidden="true"><i style="width:${(a / b) * 100}%"></i></div>
            <span class="qz-tv"><b>${a}/${b}</b> <span class="muted">${pct(a / b, 0)}</span></span></div>`; }).join('')}
      </section>
    </div>
    <section class="qz-sols" aria-labelledby="qz-sol-h">
      <h2 id="qz-sol-h">Worked solutions</h2>
      ${qs.map((q, k) => { const ok = ans[k] === q.answer; const mine = ans[k]; return `
        <details class="disclose qz-sol ${ok ? 'is-ok' : 'is-no'}" ${ok ? '' : 'open'}>
          <summary><span class="qz-sn">${k + 1}</span><span class="pill ${ok ? 'ok' : 'bad'}">${ok ? icon('check') + ' Correct' : mine == null ? 'Skipped' : 'Wrong'}</span><span class="qz-st">${esc(TOPICS[q.topic])}</span></summary>
          <div>
            <div class="prose">${q.q}</div>
            <ol class="qz-ch" type="A">${q.choices.map((c, j) => `<li class="${j === q.answer ? 'right' : j === mine ? 'wrong' : ''}"><span class="qz-let">${LET[j]}</span><span>${c}</span>${j === q.answer ? ' <span class="pill ok">Answer</span>' : j === mine ? ' <span class="pill bad">Your choice</span>' : ''}</li>`).join('')}</ol>
            <div class="qz-solbox prose"><div class="qz-solh">Solution</div>${q.sol}</div>
          </div>
        </details>`; }).join('')}
    </section>`;
  renderMath(body);
  animateRings(body);
  countUp(body);
  const h = body.querySelector('#qz-res-h'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false });
}
