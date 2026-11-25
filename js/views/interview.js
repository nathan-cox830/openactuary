// Interview coach (#/careers/interview): timed mock interviews with a large SVG countdown ring,
// model answer outlines, self-review checklists and a browse mode. Everything runs locally.
// Progress: `interview` namespace { sessions, practiced: {qid: count}, flagged: {qid: true}, notes: {qid: string} }.
import { esc, icon, debounce, toast } from '../util.js';
import { load, update, setLast } from '../progress.js';
import { confetti, countUp } from '../ui/motion.js';
import { CATEGORIES, QUESTIONS, STAR } from '../../data/careers/interview-questions.js';

export const title = 'Interview coach';

const DEF = { sessions: 0, practiced: {}, flagged: {}, notes: {} };
const byId = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
const catOf = id => CATEGORIES.find(c => c.id === id);
const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

const R = 104, C = 2 * Math.PI * R;           // timer ring geometry (viewBox 240)
const THINK_OPTS = [[0, 'Off'], [15, '15s'], [30, '30s'], [60, '60s']];
const ANSWER_OPTS = [[60, '1:00'], [120, '2:00'], [180, '3:00'], [300, '5:00']];
const COUNT_OPTS = [3, 5, 8];

let root = null;          // the view element
let ticker = null;        // setInterval handle
let mode = 'mock';        // 'mock' | 'browse'
let flaggedOnly = false;  // browse filter
let cfg = { cats: new Set(CATEGORIES.map(c => c.id)), count: 5, think: 30, answer: 120 };
let st = null;            // current mock session (see startSession)

const mmss = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const prog = () => load('interview', DEF);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ================= lifecycle ================= */

export function render(el) {
  root = el; mode = 'mock'; st = null; flaggedOnly = false;
  setLast('#/careers/interview', 'Interview coach');
  el.innerHTML = `
  <div class="container iv-page">
    <header class="page-head">
      <a class="back-link" href="#/careers">${icon('back')} Careers</a>
      <div class="eyebrow" style="margin-top:14px">Interview coach</div>
      <h1>Practice actuarial interviews</h1>
      <p class="lede">Timed mock interviews with ${QUESTIONS.length} questions. Answer out loud or type notes, then compare with a model outline and score yourself. Nothing leaves your browser.</p>
    </header>
    <div class="row between iv-top">
      <div class="seg" role="group" aria-label="Mode">
        <button type="button" data-mode="mock" aria-pressed="true">${icon('clock')} Mock interview</button>
        <button type="button" data-mode="browse" aria-pressed="false">${icon('book')} Browse questions</button>
      </div>
      <div class="iv-kpis" id="iv-kpis"></div>
    </div>
    <p class="sr-only" aria-live="polite" id="iv-live"></p>
    <div id="iv-main"></div>
  </div>`;

  el.addEventListener('click', onClick);
  el.addEventListener('input', onInput);
  renderKpis(true);
  renderMain();
}

export function destroy() {
  stopTicker();
  if (canSpeak()) { try { speechSynthesis.cancel(); } catch (e) { } }
  root = null; st = null;
}

/* ================= helpers ================= */

const main = () => root.querySelector('#iv-main');
/** Bring the working area into view when it has scrolled above the sticky header. */
function toTop() {
  const m = main(); if (!m) return;
  const y = m.getBoundingClientRect().top;
  if (y < 80) window.scrollTo({ top: Math.max(0, y + window.scrollY - 90) });
}
function announce(msg) { const l = root && root.querySelector('#iv-live'); if (l) { l.textContent = ''; setTimeout(() => { if (l) l.textContent = msg; }, 30); } }

function renderKpis(animate = false) {
  const p = prog();
  const practiced = QUESTIONS.filter(q => (p.practiced || {})[q.id]).length;
  const flagged = QUESTIONS.filter(q => (p.flagged || {})[q.id]).length;
  const box = root.querySelector('#iv-kpis');
  const n = v => animate ? `<b data-count="${v}">0</b>` : `<b>${v}</b>`;
  box.innerHTML = `
    <span class="iv-kpi">${n(p.sessions || 0)}<span>sessions</span></span>
    <span class="iv-kpi">${n(practiced)}<span>of ${QUESTIONS.length} practiced</span></span>
    <span class="iv-kpi">${n(flagged)}<span>flagged</span></span>`;
  if (animate) countUp(box);
}

function speakBtn(text, cls = 'btn ghost sm') {
  if (!canSpeak()) return '';
  return `<button type="button" class="${cls}" data-speak="${esc(text)}">${icon('mic')} Read aloud</button>`;
}
function speak(text) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.lang = 'en-US'; speechSynthesis.speak(u); } catch (e) { }
}

function saveNote(qid, text) {
  update('interview', v => {
    v.notes = v.notes || {};
    if (text.trim()) v.notes[qid] = text.slice(0, 4000); else delete v.notes[qid];
  }, DEF);
}
const saveNoteSoon = debounce(saveNote, 400);

function setFlag(qid, on) {
  update('interview', v => { v.flagged = v.flagged || {}; if (on) v.flagged[qid] = true; else delete v.flagged[qid]; }, DEF);
}

function renderMain() {
  root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  if (mode === 'browse') return renderBrowse();
  if (!st) return renderSetup();
  if (st.phase === 'review') return renderReview();
  if (st.phase === 'done') return renderSummary();
  return renderStage();
}

/* ================= setup ================= */

function segHtml(name, opts, val, label) {
  return `<div class="iv-opt"><span class="iv-flabel" id="iv-l-${name}">${label}</span>
    <div class="seg" role="group" aria-labelledby="iv-l-${name}">
      ${opts.map(([v, l]) => `<button type="button" data-set="${name}" data-val="${v}" aria-pressed="${v === val}">${l}</button>`).join('')}
    </div></div>`;
}

function renderSetup() {
  const p = prog();
  const flaggedN = QUESTIONS.filter(q => p.flagged && p.flagged[q.id]).length;
  main().innerHTML = `
  <div class="iv-setup">
    <div class="card iv-setup-card">
      <h2>Set up your mock interview</h2>
      <p class="muted small">Questions are picked at random from the categories you choose.</p>
      <fieldset class="iv-cats">
        <legend class="iv-flabel">Categories</legend>
        ${CATEGORIES.map(c => {
          const n = QUESTIONS.filter(q => q.cat === c.id).length;
          return `<label class="iv-cat">
            <input type="checkbox" data-cat="${c.id}" ${cfg.cats.has(c.id) ? 'checked' : ''}>
            <span class="iv-cat-ic">${icon(c.icon)}</span>
            <span><b>${esc(c.label)}</b> <span class="muted tiny">${n} questions</span><br><span class="small muted">${esc(c.blurb)}</span></span>
          </label>`;
        }).join('')}
      </fieldset>
      <div class="iv-opts">
        ${segHtml('count', COUNT_OPTS.map(n => [n, String(n)]), cfg.count, 'Questions')}
        ${segHtml('think', THINK_OPTS, cfg.think, 'Think time')}
        ${segHtml('answer', ANSWER_OPTS, cfg.answer, 'Answer time')}
      </div>
      <div class="row iv-start-row">
        <button type="button" class="btn primary lg" data-act="start">${icon('play')} Start interview</button>
        ${flaggedN ? `<button type="button" class="btn ghost" data-act="start-flagged">${icon('flag')} Practice my ${flaggedN} flagged</button>` : ''}
      </div>
      <p class="iv-setup-err small" id="iv-err" role="alert"></p>
    </div>
    <aside class="panel iv-how">
      <h3>How it works</h3>
      <ol class="iv-steps">
        <li><b>Think.</b> A short countdown to gather your thoughts, like a real interviewer’s pause.</li>
        <li><b>Answer.</b> Speak out loud (best practice) or type notes. The ring shows time left.</li>
        <li><b>Review.</b> Compare with a model outline and tick the self-review checklist.</li>
        <li><b>Repeat.</b> Flag weak answers to practice again later.</li>
      </ol>
      <h4>Behavioral answers: use STAR</h4>
      <div class="iv-star">${STAR.map(s => `<div><span>${s.k}</span><b>${s.t}</b><small>${esc(s.d)}</small></div>`).join('')}</div>
    </aside>
  </div>`;
}

function startSession(ids) {
  if (!ids.length) return;
  st = {
    qs: ids, i: 0, results: [],
    phase: 'think', total: 0, remaining: 0, deadline: 0, paused: false,
    thinkUsed: 0, answerTotal: cfg.answer, timeUp: false, flag: false,
  };
  beginQuestion();
}

/* ================= running a question ================= */

function beginQuestion() {
  const qid = st.qs[st.i];
  st.flag = !!(prog().flagged || {})[qid];
  st.timeUp = false; st.thinkUsed = 0; st.answerTotal = cfg.answer;
  if (cfg.think > 0) setPhase('think', cfg.think); else setPhase('answer', cfg.answer);
  renderStage();
  const q = byId[qid];
  announce(`Question ${st.i + 1} of ${st.qs.length}. ${q.q}`);
}

function setPhase(phase, secs) {
  st.phase = phase; st.total = secs; st.remaining = secs; st.paused = false;
  st.deadline = Date.now() + secs * 1000;
  startTicker();
}

function startTicker() { stopTicker(); ticker = setInterval(tick, 200); }
function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }

function tick() {
  if (!st || st.paused || (st.phase !== 'think' && st.phase !== 'answer')) return;
  st.remaining = Math.max(0, (st.deadline - Date.now()) / 1000);
  if (st.remaining <= 0) {
    if (st.phase === 'think') { st.thinkUsed = st.total; toAnswer(); }
    else { st.timeUp = true; toReview(); }
    return;
  }
  paintTimer();
}

function toAnswer() {
  if (st.phase === 'think') st.thinkUsed = st.total - st.remaining;
  setPhase('answer', st.answerTotal);
  // Update the stage in place so a visitor typing notes keeps focus.
  const ring = root.querySelector('.iv-ring');
  if (ring) {
    ring.querySelector('.iv-phase').textContent = 'Answer';
    root.querySelector('.iv-hint').textContent = 'Aim to finish with a short, clear conclusion.';
    renderControls(); paintTimer();
  } else renderStage();
  announce('Answer time. Begin your answer.');
}

/** Save the notes box right away (the input handler is debounced). */
function flushNote() {
  const ta = root && root.querySelector('#iv-notes');
  if (ta) saveNote(ta.dataset.note, ta.value);
}

function toReview() {
  stopTicker();
  flushNote();
  const used = st.phase === 'answer' ? st.total - st.remaining : 0;
  st.answerUsed = Math.min(st.total, Math.max(0, used));
  st.phase = 'review';
  renderReview();
  announce(st.timeUp ? 'Time is up. Review your answer.' : 'Review your answer.');
}

function togglePause() {
  if (!st) return;
  if (st.paused) { st.paused = false; st.deadline = Date.now() + st.remaining * 1000; }
  else { st.remaining = Math.max(0, (st.deadline - Date.now()) / 1000); st.paused = true; }
  renderControls(); paintTimer();
  announce(st.paused ? 'Timer paused.' : 'Timer resumed.');
}

function addTime(s) {
  if (!st || st.phase !== 'answer') return;
  if (st.paused) st.remaining += s; else st.deadline += s * 1000;
  st.total += s; st.answerTotal = st.total;
  st.remaining = st.paused ? st.remaining : (st.deadline - Date.now()) / 1000;
  paintTimer();
}

function ringSvg() {
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180, long = i % 5 === 0;
    const r1 = long ? 112.5 : 114, r2 = 119;
    ticks += `<line x1="${(120 + r1 * Math.cos(a)).toFixed(2)}" y1="${(120 + r1 * Math.sin(a)).toFixed(2)}" x2="${(120 + r2 * Math.cos(a)).toFixed(2)}" y2="${(120 + r2 * Math.sin(a)).toFixed(2)}" class="${long ? 'lg' : ''}"/>`;
  }
  return `<svg viewBox="0 0 240 240" class="iv-ring-svg" aria-hidden="true">
    <defs>
      <linearGradient id="ivGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent-strong)"/><stop offset="1" style="stop-color:var(--chart-2)"/></linearGradient>
    </defs>
    <g class="iv-ticks">${ticks}</g>
    <circle class="iv-track" cx="120" cy="120" r="${R}" fill="none" stroke-width="12"/>
    <circle class="iv-arc" cx="120" cy="120" r="${R}" fill="none" stroke-width="12" stroke-linecap="round"
      stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="0" transform="rotate(-90 120 120)"/>
    <circle class="iv-knob" cx="120" cy="${120 - R}" r="7.5"/>
  </svg>`;
}

function paintTimer() {
  const box = root && root.querySelector('.iv-ring'); if (!box || !st) return;
  const frac = st.total > 0 ? Math.max(0, Math.min(1, st.remaining / st.total)) : 0;
  box.querySelector('.iv-arc').style.strokeDashoffset = (C * (1 - frac)).toFixed(2);
  const a = (-90 + 360 * frac) * Math.PI / 180;
  const k = box.querySelector('.iv-knob');
  k.setAttribute('cx', (120 + R * Math.cos(a)).toFixed(2)); k.setAttribute('cy', (120 + R * Math.sin(a)).toFixed(2));
  k.style.opacity = frac > 0.002 ? 1 : 0;
  box.querySelector('.iv-time').textContent = mmss(st.remaining);
  box.querySelector('.iv-of').textContent = st.paused ? 'Paused' : `of ${mmss(st.total)}`;
  box.classList.toggle('think', st.phase === 'think');
  box.classList.toggle('answer', st.phase === 'answer');
  box.classList.toggle('low', st.phase === 'answer' && st.remaining <= 15);
  box.classList.toggle('paused', st.paused);
  box.setAttribute('aria-label', `${st.phase === 'think' ? 'Think' : 'Answer'} time remaining: ${mmss(st.remaining)}`);
}

function controlsHtml() {
  if (st.phase === 'think') return `
    <button type="button" class="btn primary" data-act="answer-now">${icon('play')} Start answering</button>
    <button type="button" class="btn ghost" data-act="pause">${icon(st.paused ? 'play' : 'pause')} ${st.paused ? 'Resume' : 'Pause'}</button>`;
  return `
    <button type="button" class="btn primary" data-act="done">${icon('check')} Done, review</button>
    <button type="button" class="btn ghost" data-act="pause">${icon(st.paused ? 'play' : 'pause')} ${st.paused ? 'Resume' : 'Pause'}</button>
    <button type="button" class="btn quiet" data-act="plus30">+30s</button>`;
}
function renderControls() {
  const c = root.querySelector('.iv-controls'); if (!c) return;
  const had = c.contains(document.activeElement) ? document.activeElement.dataset.act : null;
  c.innerHTML = controlsHtml();
  if (had) (c.querySelector(`[data-act="${had}"]`) || c.querySelector('button')).focus();
}

function qHead(q) {
  const c = catOf(q.cat);
  return `<div class="row between iv-qmeta">
      <span class="row" style="gap:8px"><span class="pill cur">${icon(c.icon)} ${esc(c.label)}</span>
      <span class="tiny muted">Question ${st.i + 1} of ${st.qs.length}</span></span>
      <span class="iv-dots" aria-hidden="true">${st.qs.map((_, k) => `<i class="${k < st.i ? 'done' : k === st.i ? 'cur' : ''}"></i>`).join('')}</span>
    </div>
    <h2 class="iv-q">${esc(q.q)}</h2>`;
}

function renderStage() {
  const q = byId[st.qs[st.i]];
  const note = (prog().notes || {})[q.id] || '';
  main().innerHTML = `
  <div class="iv-stage">
    <div class="card iv-qcard">
      ${qHead(q)}
      <div class="row iv-qtools">${speakBtn(q.q)}<button type="button" class="btn quiet sm" data-act="end">End session</button></div>
      ${q.cat === 'behavioral' ? `<div class="iv-star mini" aria-label="STAR reminder">${STAR.map(s => `<div><span>${s.k}</span><b>${s.t}</b></div>`).join('')}</div>` : ''}
      <label class="iv-notes-l" for="iv-notes">Notes <span class="muted tiny">optional · saved on this device</span></label>
      <textarea id="iv-notes" data-note="${q.id}" placeholder="Jot your key points, or just answer out loud.">${esc(note)}</textarea>
    </div>
    <div class="iv-timer-col">
      <div class="iv-ring" role="timer" aria-live="off">
        ${ringSvg()}
        <div class="iv-ring-c">
          <span class="iv-phase">${st.phase === 'think' ? 'Think' : 'Answer'}</span>
          <span class="iv-time">${mmss(st.remaining)}</span>
          <span class="iv-of">of ${mmss(st.total)}</span>
        </div>
      </div>
      <p class="small muted iv-hint">${st.phase === 'think' ? 'Gather your thoughts. Answer time starts automatically.' : 'Aim to finish with a short, clear conclusion.'}</p>
      <div class="row iv-controls">${controlsHtml()}</div>
    </div>
  </div>`;
  paintTimer();
  toTop();
}

/* ================= review ================= */

function renderReview() {
  const q = byId[st.qs[st.i]];
  const last = st.i === st.qs.length - 1;
  const note = (prog().notes || {})[q.id] || '';
  main().innerHTML = `
  <div class="iv-review">
    <div class="card iv-qcard">
      ${qHead(q)}
      ${st.timeUp ? `<div class="fb info"><div>Time’s up. In a real interview, wrap up with a one-sentence conclusion when you see you are running long.</div></div>` : ''}
      <p class="small muted">Your answer time: <b class="mono">${mmss(st.answerUsed)}</b> of ${mmss(st.answerTotal)}${st.thinkUsed ? ` · think time used: ${mmss(st.thinkUsed)}` : ''}</p>
      ${note ? `<details class="disclose"><summary>Your notes</summary><div><p class="iv-note-txt">${esc(note)}</p></div></details>` : ''}
    </div>
    <div class="grid-2">
      <div class="card iv-outline">
        <h3>${icon('star')} What a strong answer covers</h3>
        <p class="tiny muted">${esc(q.tests)}</p>
        <ul class="iv-bullets">${q.outline.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h3>${icon('check')} Self-review</h3>
        <p class="tiny muted">Be honest; this is just for you.</p>
        <fieldset class="opts iv-check" aria-label="Self-review checklist">
          ${q.checklist.map((c, k) => `<label><input type="checkbox" data-check="${k}"><span>${esc(c)}</span></label>`).join('')}
        </fieldset>
        <div class="row iv-review-actions">
          <button type="button" class="btn ghost sm iv-flag" data-act="flag" aria-pressed="${st.flag}">${icon('flag')} <span>${st.flag ? 'Flagged to practice again' : 'Flag to practice again'}</span></button>
        </div>
      </div>
    </div>
    <div class="row iv-next-row">
      <button type="button" class="btn primary lg" data-act="next">${last ? 'See summary' : 'Next question'} ${icon('arrow')}</button>
      <button type="button" class="btn quiet" data-act="retry">${icon('refresh')} Try this one again</button>
    </div>
  </div>`;
  toTop();
  const h = main().querySelector('.iv-outline h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
}

function recordAndNext() {
  const q = byId[st.qs[st.i]];
  const checks = [...main().querySelectorAll('[data-check]')].map(x => x.checked);
  st.results.push({ id: q.id, used: st.answerUsed, of: st.answerTotal, score: checks.filter(Boolean).length, max: checks.length, flag: st.flag });
  update('interview', v => { v.practiced = v.practiced || {}; v.practiced[q.id] = (v.practiced[q.id] || 0) + 1; }, DEF);
  setFlag(q.id, st.flag);
  renderKpis();
  if (st.i < st.qs.length - 1) { st.i++; beginQuestion(); const h = main().querySelector('.iv-q'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  else finish();
}

function finish() {
  stopTicker();
  if (!st.results.length) { st = null; renderMain(); return; }
  st.phase = 'done';
  update('interview', v => { v.sessions = (v.sessions || 0) + 1; }, DEF);
  renderKpis();
  renderSummary();
  const tot = st.results.reduce((s, r) => s + r.score, 0), mx = st.results.reduce((s, r) => s + r.max, 0);
  if (st.results.length >= 3 && mx && tot / mx >= 0.8) confetti();
  announce('Session complete. Here is your summary.');
}

/* ================= summary ================= */

function renderSummary() {
  const rs = st.results;
  const tot = rs.reduce((s, r) => s + r.score, 0), mx = rs.reduce((s, r) => s + r.max, 0);
  const time = rs.reduce((s, r) => s + r.used, 0);
  const flagged = rs.filter(r => r.flag);
  const pctv = mx ? Math.round(100 * tot / mx) : 0;
  main().innerHTML = `
  <div class="iv-summary stack">
    <div class="card iv-sum-head">
      <div>
        <div class="eyebrow">Session complete</div>
        <h2>${pctv >= 80 ? 'Strong session.' : pctv >= 50 ? 'Solid practice.' : 'Good start. Repetition is how this gets easier.'}</h2>
        <p class="muted small">Scores are your own checklist ticks, a guide to what to work on, not a grade.</p>
      </div>
      <div class="kpis iv-sum-kpis">
        <div class="kpi hero"><div class="l">Checklist score</div><div class="v"><span data-count="${pctv}" data-suffix="%">0%</span></div></div>
        <div class="kpi"><div class="l">Questions</div><div class="v">${rs.length}</div></div>
        <div class="kpi"><div class="l">Answer time</div><div class="v mono">${mmss(time)}</div></div>
      </div>
    </div>
    <div class="tblwrap">
      <table>
        <caption class="sr-only">Results by question</caption>
        <thead><tr><th>Question</th><th>Time used</th><th>Checklist</th><th>Flag</th></tr></thead>
        <tbody>${rs.map(r => `<tr>
          <td class="wrap iv-tq"><span class="pill">${esc(catOf(byId[r.id].cat).label)}</span> ${esc(byId[r.id].q)}</td>
          <td class="num">${mmss(r.used)} <span class="muted">/ ${mmss(r.of)}</span></td>
          <td><span class="iv-score"><span class="bar"><i style="width:${r.max ? 100 * r.score / r.max : 0}%"></i></span><span class="num">${r.score}/${r.max}</span></span></td>
          <td>${r.flag ? `<span class="pill st">${icon('flag')} Again</span>` : '<span class="muted">—</span>'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
    ${flagged.length ? `<div class="panel">
      <h3>${icon('flag')} Flagged to practice again</h3>
      <ul class="iv-bullets">${flagged.map(r => `<li>${esc(byId[r.id].q)}</li>`).join('')}</ul>
      <button type="button" class="btn ghost" data-act="redo-flagged">${icon('refresh')} Practice these now</button>
    </div>` : ''}
    <div class="row">
      <button type="button" class="btn primary" data-act="new">${icon('play')} New mock interview</button>
      <button type="button" class="btn ghost" data-mode="browse">${icon('book')} Browse all questions</button>
      <a class="btn quiet" href="#/careers">Back to Careers</a>
    </div>
  </div>`;
  countUp(main());
  toTop();
}

/* ================= browse ================= */

function statusHtml(qid, p) {
  const n = (p.practiced || {})[qid] || 0, f = (p.flagged || {})[qid];
  return (n ? `<span class="pill ok">${icon('check')} Practiced ×${n}</span>` : '<span class="pill">New</span>')
    + (f ? ` <span class="pill st">${icon('flag')} Flagged</span>` : '');
}

function renderBrowse() {
  const p = prog();
  const flaggedN = QUESTIONS.filter(q => (p.flagged || {})[q.id]).length;
  main().innerHTML = `
  <div class="stack iv-browse">
    <div class="row between">
      <p class="muted small" style="margin:0">Open a question to see the model outline, checklist and your notes.</p>
      <button type="button" class="chip" data-act="flagged-only" aria-pressed="${flaggedOnly}">${icon('flag')} Flagged only (${flaggedN})</button>
    </div>
    ${CATEGORIES.map(c => {
      const qs = QUESTIONS.filter(q => q.cat === c.id && (!flaggedOnly || (p.flagged || {})[q.id]));
      if (!qs.length) return '';
      return `<section class="stack iv-bcat" aria-labelledby="iv-bc-${c.id}">
        <div class="row iv-bcat-h"><span class="cr-ic">${icon(c.icon)}</span><h2 id="iv-bc-${c.id}">${esc(c.label)}</h2><span class="muted small">${esc(c.blurb)}</span></div>
        ${qs.map(q => `<details class="disclose iv-bq">
          <summary><span class="iv-bq-q">${esc(q.q)}</span><span class="iv-status" data-status="${q.id}">${statusHtml(q.id, p)}</span></summary>
          <div class="stack">
            <p class="small muted" style="margin:0"><b>What it tests:</b> ${esc(q.tests)}</p>
            <div class="grid-2">
              <div><h4>A strong answer covers</h4><ul class="iv-bullets">${q.outline.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
              <div><h4>Self-review checklist</h4><ul class="cr-ticks">${q.checklist.map(o => `<li>${icon('check')}<span>${esc(o)}</span></li>`).join('')}</ul></div>
            </div>
            <label class="iv-notes-l" for="iv-n-${q.id}">Your notes <span class="muted tiny">saved on this device</span></label>
            <textarea id="iv-n-${q.id}" class="iv-bnotes" data-note="${q.id}" placeholder="Key points, a story to use, a number to remember…">${esc((p.notes || {})[q.id] || '')}</textarea>
            <div class="row">
              <button type="button" class="btn primary sm" data-act="practice-one" data-q="${q.id}">${icon('play')} Practice this one</button>
              <button type="button" class="btn ghost sm iv-flag" data-act="bflag" data-q="${q.id}" aria-pressed="${!!(p.flagged || {})[q.id]}">${icon('flag')} <span>${(p.flagged || {})[q.id] ? 'Unflag' : 'Flag to practice'}</span></button>
              ${speakBtn(q.q, 'btn quiet sm')}
            </div>
          </div>
        </details>`).join('')}
      </section>`;
    }).join('') || `<div class="lockbox"><h3>No flagged questions</h3><p>Flag questions during a mock interview or here to build a practice list.</p></div>`}
  </div>`;
}

/* ================= events ================= */

function onInput(e) {
  const t = e.target;
  if (t.matches('textarea[data-note]')) saveNoteSoon(t.dataset.note, t.value);
  if (t.matches('[data-cat]')) {
    if (t.checked) cfg.cats.add(t.dataset.cat); else cfg.cats.delete(t.dataset.cat);
    const err = root.querySelector('#iv-err'); if (err) err.textContent = '';
  }
}

function onClick(e) {
  const speakB = e.target.closest('[data-speak]');
  if (speakB) { speak(speakB.dataset.speak); return; }

  const modeB = e.target.closest('[data-mode]');
  if (modeB) {
    if (modeB.dataset.mode === mode) return;
    flushNote();
    if (st && (st.phase === 'think' || st.phase === 'answer') && !st.paused) { st.remaining = Math.max(0, (st.deadline - Date.now()) / 1000); st.paused = true; }
    mode = modeB.dataset.mode;
    if (mode === 'mock' && st && st.phase === 'done') st = null;
    renderMain();
    if (mode === 'mock' && st && st.paused && (st.phase === 'think' || st.phase === 'answer')) toast('Your interview is paused. Press Resume to continue.');
    return;
  }

  const setB = e.target.closest('[data-set]');
  if (setB) {
    cfg[setB.dataset.set] = +setB.dataset.val;
    root.querySelectorAll(`[data-set="${setB.dataset.set}"]`).forEach(b => b.setAttribute('aria-pressed', String(b === setB)));
    return;
  }

  const actB = e.target.closest('[data-act]');
  if (!actB) return;
  const act = actB.dataset.act;
  const p = prog();
  switch (act) {
    case 'start': {
      const pool = QUESTIONS.filter(q => cfg.cats.has(q.cat)).map(q => q.id);
      if (!pool.length) { root.querySelector('#iv-err').textContent = 'Choose at least one category.'; return; }
      startSession(shuffle(pool).slice(0, cfg.count));
      break;
    }
    case 'start-flagged':
      startSession(shuffle(QUESTIONS.filter(q => (p.flagged || {})[q.id]).map(q => q.id)).slice(0, 8));
      break;
    case 'redo-flagged': {
      const ids = st.results.filter(r => r.flag).map(r => r.id);
      startSession(shuffle(ids));
      break;
    }
    case 'practice-one':
      mode = 'mock';
      root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === 'mock')));
      startSession([actB.dataset.q]);
      break;
    case 'answer-now': toAnswer(); break;
    case 'pause': togglePause(); break;
    case 'plus30': addTime(30); break;
    case 'done': toReview(); break;
    case 'end':
      stopTicker(); flushNote();
      if (st.results.length) finish(); else { st = null; renderMain(); }
      break;
    case 'flag':
      st.flag = !st.flag;
      actB.setAttribute('aria-pressed', String(st.flag));
      actB.querySelector('span').textContent = st.flag ? 'Flagged to practice again' : 'Flag to practice again';
      break;
    case 'retry':
      beginQuestion();
      break;
    case 'next': recordAndNext(); break;
    case 'new': st = null; renderMain(); break;
    case 'flagged-only': flaggedOnly = !flaggedOnly; renderBrowse(); break;
    case 'bflag': {
      const qid = actB.dataset.q, on = !(p.flagged || {})[qid];
      setFlag(qid, on);
      actB.setAttribute('aria-pressed', String(on));
      actB.querySelector('span').textContent = on ? 'Unflag' : 'Flag to practice';
      const s = root.querySelector(`[data-status="${qid}"]`); if (s) s.innerHTML = statusHtml(qid, prog());
      const chip = root.querySelector('[data-act="flagged-only"]');
      if (chip) chip.innerHTML = `${icon('flag')} Flagged only (${QUESTIONS.filter(q => (prog().flagged || {})[q.id]).length})`;
      renderKpis();
      break;
    }
  }
}
