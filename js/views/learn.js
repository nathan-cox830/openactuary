// Exam P · General Probability lesson (#/learn and #/learn/<stepId>).
// Sidebar of steps with saved progress (namespace "learn"), one step at a time with prose, KaTeX, a worked
// example and "check yourself" questions. Two interactive visuals live here too: a to-scale Venn diagram
// explorer (sets step) and a Bayes' theorem probability tree with a natural-frequencies view (Bayes step).
import { esc, icon, toast } from '../util.js';
import { load, update as updateStore, setLast } from '../progress.js';
import { renderMath } from '../ui/katex.js';
import { applyGlossary } from '../ui/glossary.js';
import { ring, animateRings } from '../ui/charts.js';
import { confetti } from '../ui/motion.js';
import { STEPS } from '../../data/exam-p/lesson.js';

export const title = 'General Probability lesson';

const FALLBACK = { done: {}, current: STEPS[0].id };
let root = null;
let cur = 0;
const getState = () => { const s = load('learn', FALLBACK); s.done = s.done || {}; return s; };

export function render(el, params) {
  root = el;
  el.innerHTML = `
  <div class="container lsn-page">
    <header class="page-head">
      <div class="eyebrow">Exam P · General Probability</div>
      <h1>General Probability</h1>
      <p class="lede">Eight short steps from sample spaces to Bayes' theorem, with interactive visuals and a quick check at the end of each step.</p>
    </header>
    <div class="lsn">
      <aside class="lsn-side" aria-label="Lesson steps">
        <div class="lsn-prog" data-prog></div>
        <ol class="lsn-steps" data-steps></ol>
        <div class="lsn-tools">
          <a class="btn quiet sm" href="#/learn/formulas">${icon('sigma')} Formula sheet</a>
          <a class="btn quiet sm" href="#/learn/glossary">${icon('book')} Glossary &amp; flashcards</a>
        </div>
      </aside>
      <article class="lsn-main card" data-main></article>
    </div>
  </div>`;
  el.addEventListener('click', onClick);
  el.addEventListener('change', onChange);
  showStep(params && params[0]);
}

export function update(params) { if (root) showStep(params && params[0]); }
export function destroy() { root = null; }

/* ---------- step rendering ---------- */
function showStep(id) {
  const st = getState();
  let idx = STEPS.findIndex(s => s.id === id);
  if (idx < 0) idx = Math.max(0, STEPS.findIndex(s => s.id === st.current));
  cur = idx;
  const step = STEPS[idx];
  updateStore('learn', s => { s.done = s.done || {}; s.current = step.id; }, FALLBACK);
  setLast('#/learn/' + step.id, 'Lesson: ' + step.title);
  renderSide();
  renderMain();
}

function renderSide() {
  const st = getState();
  const nDone = STEPS.filter(s => st.done[s.id]).length;
  const prog = root.querySelector('[data-prog]');
  prog.innerHTML = `${ring(nDone / STEPS.length, { size: 54, label: `${nDone}/${STEPS.length}`, done: nDone === STEPS.length })}
    <div><b>${nDone === STEPS.length ? 'Lesson complete' : 'Your progress'}</b><span class="small muted">${nDone} of ${STEPS.length} steps done</span></div>`;
  animateRings(prog);
  const list = root.querySelector('[data-steps]');
  list.innerHTML = STEPS.map((s, i) => {
    const done = !!st.done[s.id], here = i === cur;
    return `<li><a class="lsn-step${here ? ' cur' : ''}${done ? ' done' : ''}" href="#/learn/${s.id}" ${here ? 'aria-current="step"' : ''}>
      <span class="lsn-num" aria-hidden="true">${done ? icon('check') : i + 1}</span>
      <span class="lsn-t">${esc(s.short)}<small>${s.minutes} min${done ? ' · done' : ''}</small></span>
      ${done ? '<span class="sr-only">(completed)</span>' : ''}</a></li>`;
  }).join('');
  const here = list.querySelector('.cur');
  if (here && list.scrollWidth > list.clientWidth) list.scrollLeft = Math.max(0, here.parentElement.offsetLeft - 24);
}

function renderMain() {
  const step = STEPS[cur], st = getState();
  const prev = STEPS[cur - 1], next = STEPS[cur + 1];
  const done = !!st.done[step.id];
  const main = root.querySelector('[data-main]');
  main.innerHTML = `
    <div class="lsn-meta"><span class="eyebrow">Step ${cur + 1} of ${STEPS.length}</span><span class="pill">${icon('clock')} ${step.minutes} min</span></div>
    <h2 class="lsn-title">${esc(step.title)}</h2>
    <div class="prose lsn-body">${step.body}</div>
    ${step.widget ? `<div class="lsn-widget" data-widget="${step.widget}"></div>` : ''}
    <div class="example lsn-example"><div class="lsn-ex-h">${icon('pencil')} ${esc(step.example.title)}</div><div class="prose">${step.example.html}</div></div>
    <section class="lsn-check" aria-labelledby="chk-h">
      <h3 id="chk-h">${icon('target')} Check yourself</h3>
      ${step.checks.map((c, qi) => `
        <fieldset class="chk" data-q="${qi}">
          <legend><span class="chk-n">${qi + 1}</span><span>${c.q}</span></legend>
          <div class="opts">${c.opts.map((o, oi) => `<label><input type="radio" name="chk-${step.id}-${qi}" value="${oi}"><span>${o}</span></label>`).join('')}</div>
          <div class="chk-fb" aria-live="polite"></div>
        </fieldset>`).join('')}
    </section>
    ${next ? '' : finishBox()}
    <nav class="lsn-pager" aria-label="Step navigation">
      ${prev ? `<a class="btn ghost" href="#/learn/${prev.id}">${icon('back')} <span>Previous</span></a>` : '<span></span>'}
      <button type="button" class="btn ${done ? 'ghost is-done' : 'primary'}" data-act="complete" aria-pressed="${done}">${done ? icon('check') + ' Completed' : 'Mark complete'}</button>
      ${next ? `<a class="btn ghost" href="#/learn/${next.id}"><span>Next</span> ${icon('arrow')}</a>` : '<a class="btn ghost" href="#/practice/quiz"><span>Take the quiz</span> ' + icon('arrow') + '</a>'}
    </nav>`;
  const w = main.querySelector('[data-widget]');
  if (w) (w.dataset.widget === 'venn' ? vennWidget : bayesWidget)(w);
  renderMath(main);
  applyGlossary(main);
}

function finishBox() {
  return `<section class="lsn-finish" aria-labelledby="fin-h">
    <h3 id="fin-h">Where to next</h3>
    <div class="lsn-next">
      <a class="card lift lsn-go" href="#/learn/formulas">${icon('sigma')}<b>Formula sheet</b><span class="small muted">Every rule from this lesson on one printable page.</span></a>
      <a class="card lift lsn-go" href="#/practice/quiz">${icon('quiz')}<b>Practice quiz</b><span class="small muted">20 exam-style questions with full solutions.</span></a>
      <a class="card lift lsn-go" href="#/practice">${icon('dice')}<b>Problem generator</b><span class="small muted">Endless fresh problems on every topic.</span></a>
    </div>
  </section>`;
}

/* ---------- events ---------- */
function onClick(e) {
  const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
  if (b.dataset.act === 'complete') toggleComplete();
  if (b.dataset.act === 'retry') {
    const fs = b.closest('.chk');
    fs.querySelectorAll('input').forEach(i => { i.disabled = false; i.checked = false; });
    fs.querySelectorAll('label').forEach(l => l.classList.remove('right', 'wrong'));
    fs.querySelector('.chk-fb').innerHTML = '';
    const first = fs.querySelector('input'); if (first) first.focus();
  }
}

function onChange(e) {
  const inp = e.target; if (!inp.matches('.chk input[type=radio]')) return;
  const fs = inp.closest('.chk'); const qi = +fs.dataset.q;
  const c = STEPS[cur].checks[qi]; const pickI = +inp.value; const ok = pickI === c.correct;
  const labels = [...fs.querySelectorAll('label')];
  labels.forEach((l, i) => { l.classList.toggle('right', i === c.correct); l.classList.toggle('wrong', i === pickI && !ok); });
  fs.querySelectorAll('input').forEach(i => { i.disabled = true; });
  const fb = fs.querySelector('.chk-fb');
  fb.innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><div><b>${ok ? 'Correct.' : 'Not quite.'}</b> ${c.explain}
    ${ok ? '' : '<div><button type="button" class="btn quiet sm" data-act="retry">Try again</button></div>'}</div></div>`;
  renderMath(fb);
  // once every question is answered, nudge toward "Mark complete"
  const all = [...root.querySelectorAll('.chk')].every(f => f.querySelector('input:checked'));
  const btn = root.querySelector('[data-act="complete"]');
  if (all && btn && btn.getAttribute('aria-pressed') !== 'true') btn.classList.add('nudge');
}

function toggleComplete() {
  const step = STEPS[cur];
  let nowDone = false, allDone = false;
  updateStore('learn', s => {
    s.done = s.done || {};
    if (s.done[step.id]) delete s.done[step.id]; else s.done[step.id] = true;
    nowDone = !!s.done[step.id]; allDone = STEPS.every(x => s.done[x.id]);
  }, FALLBACK);
  const btn = root.querySelector('[data-act="complete"]');
  btn.className = 'btn ' + (nowDone ? 'ghost is-done' : 'primary');
  btn.setAttribute('aria-pressed', String(nowDone));
  btn.innerHTML = nowDone ? icon('check') + ' Completed' : 'Mark complete';
  renderSide();
  if (nowDone && allDone) { confetti(); toast('Lesson complete. Try the practice quiz next.'); }
  else if (nowDone) toast(STEPS[cur + 1] ? `Step ${cur + 1} done. On to "${STEPS[cur + 1].short}".` : 'Step done.');
}

/* =====================================================================
   Venn diagram explorer
   Sliders in hundredths (integers) to avoid floating-point noise. Circle areas are proportional to
   P(A) and P(B), and the overlap area is proportional to P(A∩B) (distance solved by bisection).
   ===================================================================== */
const VR = 118;                                   // radius of a circle with probability 1 (viewBox units)
function lensArea(r1, r2, dd) {
  if (dd >= r1 + r2) return 0;
  if (dd <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a1 = r1 * r1 * Math.acos((dd * dd + r1 * r1 - r2 * r2) / (2 * dd * r1));
  const a2 = r2 * r2 * Math.acos((dd * dd + r2 * r2 - r1 * r1) / (2 * dd * r2));
  const k = 0.5 * Math.sqrt(Math.max(0, (-dd + r1 + r2) * (dd + r1 - r2) * (dd - r1 + r2) * (dd + r1 + r2)));
  return a1 + a2 - k;
}
function solveDist(r1, r2, area) {
  if (r1 <= 0 || r2 <= 0) return r1 + r2 + 6;
  let lo = Math.abs(r1 - r2), hi = r1 + r2;
  if (area >= Math.PI * Math.min(r1, r2) ** 2 - 1e-6) return lo;
  if (area <= 1e-6) return hi + 6;               // small visible gap when disjoint
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (lensArea(r1, r2, m) > area) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
const h2 = v => (v / 100).toFixed(2);

function vennWidget(host) {
  const s = { a: 45, b: 35, ab: 15, mode: 'union' };
  const W = 420, H = 280, cy = 140;
  const slider = (k, label, aria) => `<div class="sl"><label for="v-${k}"><span>${label}</span><output data-out="${k}"></output></label>
    <input id="v-${k}" type="range" min="0" max="100" step="1" value="${s[k]}" data-k="${k}" aria-label="${aria}"></div>`;
  const TILES = [['union', 'A or B'], ['inter', 'both'], ['aonly', 'A only'], ['bonly', 'B only'], ['acomp', 'not A'], ['bcomp', 'not B'], ['neither', 'neither']];
  const TEX = { union: 'P(A\\cup B)', inter: 'P(A\\cap B)', aonly: 'P(A\\cap B^{c})', bonly: 'P(A^{c}\\cap B)', acomp: 'P(A^{c})', bcomp: 'P(B^{c})', neither: 'P(A^{c}\\cap B^{c})' };
  host.innerHTML = `
  <div class="viz venn">
    <div class="viz-head"><span class="viz-tag">${icon('layers')} Interactive</span><h3>Venn diagram explorer</h3>
      <p class="small muted">Set the probabilities and every region updates. Areas are drawn to scale. Tap a result to highlight its region.</p></div>
    <div class="venn-grid">
      <div class="venn-ctrls">
        ${slider('a', 'P(A)', 'Probability of A')}
        ${slider('b', 'P(B)', 'Probability of B')}
        ${slider('ab', 'P(A ∩ B)', 'Probability of A and B')}
        <p class="venn-range tiny muted" data-range></p>
        <p class="venn-note small" data-note role="status" aria-live="polite"></p>
      </div>
      <figure class="venn-fig">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Venn diagram of events A and B" data-svg>
          <defs>
            <clipPath id="vn-clipA"><circle data-c="A"/></clipPath>
            <!-- masks use luminance (white shows, black hides); these are not visible colors -->
            <mask id="vn-notA" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/><circle data-c="A" fill="#000"/></mask>
            <mask id="vn-notB" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/><circle data-c="B" fill="#000"/></mask>
            <mask id="vn-none" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/><circle data-c="A" fill="#000"/><circle data-c="B" fill="#000"/></mask>
          </defs>
          <rect class="v-S" x="6" y="6" width="${W - 12}" height="${H - 12}" rx="16"/>
          <text class="v-Slab" x="22" y="30">S</text>
          <circle class="v-fillA" data-c="A"/><circle class="v-fillB" data-c="B"/>
          <g class="v-hl">
            <g data-m="union"><circle data-c="A"/><circle data-c="B"/></g>
            <g data-m="inter"><circle data-c="B" clip-path="url(#vn-clipA)"/></g>
            <g data-m="aonly"><circle data-c="A" mask="url(#vn-notB)"/></g>
            <g data-m="bonly"><circle data-c="B" mask="url(#vn-notA)"/></g>
            <g data-m="acomp"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="16" mask="url(#vn-notA)"/></g>
            <g data-m="bcomp"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="16" mask="url(#vn-notB)"/></g>
            <g data-m="neither"><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="16" mask="url(#vn-none)"/></g>
          </g>
          <circle class="v-lineA" data-c="A"/><circle class="v-lineB" data-c="B"/>
          <text class="v-name v-nameA" data-name="A">A</text><text class="v-name v-nameB" data-name="B">B</text>
          <text class="v-val" data-val="aonly"/><text class="v-val" data-val="inter"/><text class="v-val" data-val="bonly"/>
          <text class="v-val v-val-n" data-val="neither" x="22" y="${H - 20}"/>
        </svg>
      </figure>
    </div>
    <div class="venn-tiles" role="group" aria-label="Results. Choose one to highlight its region.">
      ${TILES.map(([m, word]) => `<button type="button" class="vtile" data-m="${m}" aria-pressed="${m === s.mode}"><span class="vt-l"><span class="tex">${TEX[m]}</span><span class="vt-w">${word}</span></span><b data-tile="${m}"></b></button>`).join('')}
    </div>
    <p class="venn-cond small" data-cond></p>
  </div>`;
  const svg = host.querySelector('[data-svg]');
  const q = sel => host.querySelector(sel);

  function draw() {
    const { a, b, ab } = s;
    const rA = VR * Math.sqrt(a / 100), rB = VR * Math.sqrt(b / 100);
    const dd = solveDist(rA, rB, (ab / 100) * Math.PI * VR * VR);
    const eL = Math.min(-rA, dd - rB), eR = Math.max(rA, dd + rB);
    const cxA = W / 2 - (eL + eR) / 2, cxB = cxA + dd;
    svg.querySelectorAll('[data-c="A"]').forEach(c => { c.setAttribute('cx', cxA.toFixed(2)); c.setAttribute('cy', cy); c.setAttribute('r', rA.toFixed(2)); });
    svg.querySelectorAll('[data-c="B"]').forEach(c => { c.setAttribute('cx', cxB.toFixed(2)); c.setAttribute('cy', cy); c.setAttribute('r', rB.toFixed(2)); });
    const nA = q('[data-name="A"]'), nB = q('[data-name="B"]');
    nA.setAttribute('x', (cxA - rA * 0.55).toFixed(1)); nA.setAttribute('y', (cy - rA * 0.55 + 4).toFixed(1)); nA.style.display = a ? '' : 'none';
    nB.setAttribute('x', (cxB + rB * 0.55).toFixed(1)); nB.setAttribute('y', (cy - rB * 0.55 + 4).toFixed(1)); nB.style.display = b ? '' : 'none';
    const ao = a - ab, bo = b - ab, ne = 100 - a - b + ab;
    const place = (key, v, x) => { const el = q(`[data-val="${key}"]`); el.textContent = h2(v); el.setAttribute('x', x.toFixed(1)); el.setAttribute('y', cy + 5); el.style.display = v > 0 ? '' : 'none'; };
    place('aonly', ao, ((cxA - rA) + Math.min(cxA + rA, cxB - rB)) / 2);
    place('inter', ab, (Math.max(cxA - rA, cxB - rB) + Math.min(cxA + rA, cxB + rB)) / 2);
    place('bonly', bo, (Math.max(cxB - rB, cxA + rA) + (cxB + rB)) / 2);
    q('[data-val="neither"]').textContent = 'Neither: ' + h2(ne);
    const vals = { union: a + b - ab, inter: ab, aonly: ao, bonly: bo, acomp: 100 - a, bcomp: 100 - b, neither: ne };
    Object.entries(vals).forEach(([k, v]) => { q(`[data-tile="${k}"]`).textContent = h2(v); });
    ['a', 'b', 'ab'].forEach(k => { const inp = q(`[data-k="${k}"]`); inp.value = s[k]; inp.setAttribute('aria-valuetext', h2(s[k])); q(`[data-out="${k}"]`).textContent = h2(s[k]); });
    const lo = Math.max(0, a + b - 100), hi = Math.min(a, b);
    q('[data-range]').textContent = `Allowed range for P(A ∩ B) right now: ${h2(lo)} to ${h2(hi)}.`;
    // conditional + independence readout
    const prod = a * b;                                   // in ten-thousandths
    let ind;
    if (ab === 0 && a > 0 && b > 0) ind = '<b>Mutually exclusive</b>: they never happen together, so they are not independent.';
    else if (ab * 100 === prod) ind = `<b>Independent</b>: P(A ∩ B) = P(A) × P(B) = ${(prod / 10000).toFixed(4)}.`;
    else ind = `<b>Not independent</b>: P(A) × P(B) = ${(prod / 10000).toFixed(4)}, but P(A ∩ B) = ${h2(ab)} (${ab * 100 > prod ? 'more' : 'less'} overlap than independence would give).`;
    const cond = b > 0 ? `P(A | B) = ${h2(ab)} ÷ ${h2(b)} = ${(ab / b).toFixed(4)}.` : 'P(A | B) is undefined when P(B) = 0.';
    q('[data-cond]').innerHTML = `${cond} ${ind}`;
    svg.setAttribute('aria-label', `Venn diagram. A only ${h2(ao)}, both ${h2(ab)}, B only ${h2(bo)}, neither ${h2(ne)}.`);
  }
  function setMode(m) {
    s.mode = m;
    host.querySelectorAll('.v-hl > g').forEach(g => g.classList.toggle('on', g.dataset.m === m));
    host.querySelectorAll('.vtile').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
  }
  host.addEventListener('input', e => {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    s[k] = +e.target.value;
    const lo = Math.max(0, s.a + s.b - 100), hi = Math.min(s.a, s.b);
    let note = '';
    if (s.ab > hi) {
      note = k === 'ab' ? `The overlap can't be bigger than the smaller event, so P(A ∩ B) stops at ${h2(hi)}.`
        : `P(A ∩ B) was lowered to ${h2(hi)}: the overlap can't be bigger than either event.`;
      s.ab = hi;
    } else if (s.ab < lo) {
      note = k === 'ab' ? `P(A) + P(B) = ${h2(s.a + s.b)} is more than 1, so A and B must overlap by at least ${h2(lo)}.`
        : `P(A ∩ B) was raised to ${h2(lo)}: since P(A) + P(B) = ${h2(s.a + s.b)} exceeds 1, the events must overlap at least that much.`;
      s.ab = lo;
    }
    const n = q('[data-note]'); n.textContent = note; n.classList.toggle('show', !!note);
    draw();
  });
  host.addEventListener('click', e => { const b = e.target.closest('.vtile'); if (b) setMode(b.dataset.m); });
  draw(); setMode(s.mode);
}

/* =====================================================================
   Bayes' theorem probability tree
   Three sliders (prior, true-positive rate, false-positive rate) drive a tree whose branch widths scale
   with the joint probability, a prior → posterior comparison, the split of positives, and a
   natural-frequency (out of 10,000) view.
   ===================================================================== */
const SCEN = {
  fraud: { label: 'Claim fraud screen', pop: 'claims', one: 'claim', H: 'Fraudulent', Hc: 'Legitimate', pos: 'Flagged', neg: 'Cleared',
    hq: 'fraud', posq: 'flagged', prior: 40, sens: 900, fpr: 80,
    priorL: 'Claims that are fraudulent', sensL: 'Fraudulent claims flagged', fprL: 'Legitimate claims flagged (false alarms)' },
  medical: { label: 'Medical screening test', pop: 'people', one: 'person', H: 'Has condition', Hc: 'Healthy', pos: 'Positive', neg: 'Negative',
    hq: 'condition', posq: 'positive', prior: 10, sens: 950, fpr: 50,
    priorL: 'People with the condition', sensL: 'Sick people who test positive', fprL: 'Healthy people who test positive (false alarms)' },
};
const N10 = 10000;
const p1 = x => (x * 100).toFixed(1) + '%';
const p4 = x => x.toFixed(4);
const cnt = x => Math.round(x).toLocaleString('en-US');

function bayesWidget(host) {
  const s = { scen: 'fraud', view: 'prob', ...pickScen('fraud') };
  function pickScen(k) { const c = SCEN[k]; return { prior: c.prior, sens: c.sens, fpr: c.fpr }; }
  // tree geometry (viewBox 600 x 330)
  const G = { root: [58, 165], H: [236, 82], Hc: [236, 248], L: [[516, 34], [516, 128], [516, 202], [516, 296]] };
  const edge = (a, b) => { const xm = (a[0] + b[0]) / 2; return `M${a[0]},${a[1]} C${xm},${a[1]} ${xm},${b[1]} ${b[0]},${b[1]}`; };
  const node = (key, [x, y], w, cls) => `<g class="bt-node ${cls}" transform="translate(${x},${y})"><rect x="${-w / 2}" y="-23" width="${w}" height="46" rx="12"/>
      <text class="bt-n1" y="-4" data-t="${key}1"></text><text class="bt-n2" y="14" data-t="${key}2"></text></g>`;
  const rootR = [G.root[0] + 52, G.root[1]], HR = [G.H[0] + 66, G.H[1]], HcR = [G.Hc[0] + 66, G.Hc[1]];
  const HL = [G.H[0] - 66, G.H[1]], HcL = [G.Hc[0] - 66, G.Hc[1]];
  const LL = G.L.map(([x, y]) => [x - 80, y]);
  host.innerHTML = `
  <div class="viz bayes">
    <div class="viz-head"><span class="viz-tag">${icon('spark')} Interactive</span><h3>Bayes' theorem, branch by branch</h3>
      <p class="small muted">Branch thickness shows how much of the population flows down each path.</p></div>
    <div class="bt-bar">
      <div class="seg" role="group" aria-label="Scenario">
        <button type="button" data-scen="fraud" aria-pressed="true">Fraud screen</button>
        <button type="button" data-scen="medical" aria-pressed="false">Medical test</button>
      </div>
      <div class="seg" role="group" aria-label="Display">
        <button type="button" data-view="prob" aria-pressed="true">Probabilities</button>
        <button type="button" data-view="freq" aria-pressed="false">Out of 10,000</button>
      </div>
    </div>
    <div class="bt-grid">
      <div class="bt-ctrls">
        <div class="sl"><label for="bt-prior"><span data-lab="prior"></span><output data-out="prior"></output></label>
          <input id="bt-prior" type="range" min="1" max="500" step="1" data-k="prior"><span class="sl-hint tiny muted">Prior, <span class="tex">P(H)</span></span></div>
        <div class="sl"><label for="bt-sens"><span data-lab="sens"></span><output data-out="sens"></output></label>
          <input id="bt-sens" type="range" min="500" max="1000" step="5" data-k="sens"><span class="sl-hint tiny muted">Sensitivity, <span class="tex">P(+\\mid H)</span></span></div>
        <div class="sl"><label for="bt-fpr"><span data-lab="fpr"></span><output data-out="fpr"></output></label>
          <input id="bt-fpr" type="range" min="0" max="500" step="5" data-k="fpr"><span class="sl-hint tiny muted">False-positive rate, <span class="tex">P(+\\mid H^{c})</span></span></div>
        <button type="button" class="btn quiet sm" data-reset>${icon('refresh')} Reset</button>
      </div>
      <figure class="bt-fig">
        <svg viewBox="0 0 600 330" role="img" data-tree aria-label="Probability tree">
          <path class="bt-e e-h" data-e="H" d="${edge(rootR, HL)}"/>
          <path class="bt-e e-hc" data-e="Hc" d="${edge(rootR, HcL)}"/>
          <path class="bt-e e-pos" data-e="L0" d="${edge(HR, LL[0])}"/>
          <path class="bt-e e-neg" data-e="L1" d="${edge(HR, LL[1])}"/>
          <path class="bt-e e-pos" data-e="L2" d="${edge(HcR, LL[2])}"/>
          <path class="bt-e e-neg" data-e="L3" d="${edge(HcR, LL[3])}"/>
          <text class="bt-el" x="${(rootR[0] + HL[0]) / 2}" y="${(rootR[1] + HL[1]) / 2 - 10}" data-t="eH"></text>
          <text class="bt-el" x="${(rootR[0] + HcL[0]) / 2}" y="${(rootR[1] + HcL[1]) / 2 + 20}" data-t="eHc"></text>
          <text class="bt-el" x="${(HR[0] + LL[0][0]) / 2}" y="${(HR[1] + LL[0][1]) / 2 - 8}" data-t="e0"></text>
          <text class="bt-el" x="${(HR[0] + LL[1][0]) / 2}" y="${(HR[1] + LL[1][1]) / 2 + 18}" data-t="e1"></text>
          <text class="bt-el" x="${(HcR[0] + LL[2][0]) / 2}" y="${(HcR[1] + LL[2][1]) / 2 - 8}" data-t="e2"></text>
          <text class="bt-el" x="${(HcR[0] + LL[3][0]) / 2}" y="${(HcR[1] + LL[3][1]) / 2 + 18}" data-t="e3"></text>
          ${node('r', G.root, 104, 'n-root')}
          ${node('h', G.H, 132, 'n-h')}
          ${node('hc', G.Hc, 132, 'n-hc')}
          ${node('l0', G.L[0], 160, 'n-tp')}
          ${node('l1', G.L[1], 160, 'n-leaf')}
          ${node('l2', G.L[2], 160, 'n-fp')}
          ${node('l3', G.L[3], 160, 'n-leaf')}
        </svg>
      </figure>
    </div>
    <div class="bt-out">
      <div class="kpi"><div class="l" data-t="kPosL"></div><div class="v" data-t="kPos"></div><div class="tiny muted" data-t="kPosS"></div></div>
      <div class="kpi hero"><div class="l" data-t="kPostL"></div><div class="v" data-t="kPost"></div><div class="tiny muted" data-t="kPostS"></div></div>
      <div class="kpi"><div class="l">Evidence multiplied the odds by</div><div class="v" data-t="kLR"></div><div class="tiny muted">likelihood ratio <span class="tex">P(+\\mid H) / P(+\\mid H^{c})</span></div></div>
    </div>
    <div class="bt-shift" aria-hidden="true">
      <div class="bt-row"><span class="bt-rl">Before</span><div class="bt-track"><i class="bt-fill prior" data-bar="prior"></i></div><b data-t="bPrior"></b></div>
      <div class="bt-row"><span class="bt-rl" data-t="bPostL">After</span><div class="bt-track"><i class="bt-fill post" data-bar="post"></i></div><b data-t="bPost"></b></div>
    </div>
    <div class="bt-split">
      <div class="bt-split-h small"><b data-t="splitH"></b></div>
      <div class="bt-stack" aria-hidden="true"><i class="tp" data-bar="tp"></i><i class="fp" data-bar="fp"></i></div>
      <div class="bt-legend tiny"><span><i class="sw tp"></i><span data-t="lgTp"></span></span><span><i class="sw fp"></i><span data-t="lgFp"></span></span></div>
    </div>
    <p class="bt-story" data-t="story"></p>
    <p class="sr-only" aria-live="polite" data-live></p>
    <div class="tblwrap bt-tbl"><table>
      <thead><tr><th>Path</th><th>Multiply</th><th>Joint probability</th><th>Out of 10,000</th></tr></thead>
      <tbody data-rows></tbody></table></div>
  </div>`;
  const q = sel => host.querySelector(sel);
  const T = (k, v) => { const el = q(`[data-t="${k}"]`); if (el) el.textContent = v; };

  function compute() {
    const p = s.prior / 1000, se = s.sens / 1000, f = s.fpr / 1000;
    const tp = p * se, fn = p * (1 - se), fp = (1 - p) * f, tn = (1 - p) * (1 - f);
    const pos = tp + fp, post = pos > 0 ? tp / pos : 0;
    // natural frequencies: whole numbers down the tree
    const nH = Math.round(N10 * p), nHc = N10 - nH, nTP = Math.round(nH * se), nFN = nH - nTP, nFP = Math.round(nHc * f), nTN = nHc - nFP;
    return { p, se, f, tp, fn, fp, tn, pos, post, nH, nHc, nTP, nFN, nFP, nTN };
  }

  function draw() {
    const c = SCEN[s.scen], r = compute(), freq = s.view === 'freq';
    ['prior', 'sens', 'fpr'].forEach(k => {
      const inp = q(`[data-k="${k}"]`); inp.value = s[k];
      inp.setAttribute('aria-valuetext', p1(s[k] / 1000)); q(`[data-out="${k}"]`).textContent = p1(s[k] / 1000);
      q(`[data-lab="${k}"]`).textContent = c[k + 'L'];
    });
    // edges: width ∝ sqrt(joint probability) so thin branches stay visible
    const wid = x => (1.5 + 18 * Math.sqrt(Math.max(0, x))).toFixed(2) + 'px';
    const ew = { H: r.p, Hc: 1 - r.p, L0: r.tp, L1: r.fn, L2: r.fp, L3: r.tn };
    Object.entries(ew).forEach(([k, v]) => { q(`[data-e="${k}"]`).style.strokeWidth = wid(v); });
    T('eH', p1(r.p)); T('eHc', p1(1 - r.p)); T('e0', p1(r.se)); T('e1', p1(1 - r.se)); T('e2', p1(r.f)); T('e3', p1(1 - r.f));
    T('r1', 'All ' + c.pop); T('r2', freq ? cnt(N10) : '100%');
    T('h1', c.H); T('h2', freq ? cnt(r.nH) : p1(r.p));
    T('hc1', c.Hc); T('hc2', freq ? cnt(r.nHc) : p1(1 - r.p));
    // leaves sit under their parent, so line 1 only names the result; the false-positive leaf says so in words
    const leaf = (k, a, v, n) => { T(k + '1', a); T(k + '2', freq ? cnt(n) : p4(v)); };
    leaf('l0', c.pos + ' (true)', r.tp, r.nTP); leaf('l1', c.neg, r.fn, r.nFN);
    leaf('l2', c.pos + ' (false)', r.fp, r.nFP); leaf('l3', c.neg, r.tn, r.nTN);
    // KPIs
    T('kPosL', `P(${c.posq})`); T('kPos', freq ? cnt(r.nTP + r.nFP) : p4(r.pos));
    T('kPosS', freq ? `of ${cnt(N10)} ${c.pop} are ${c.posq}` : `${p4(r.tp)} + ${p4(r.fp)}`);
    T('kPostL', `P(${c.hq} | ${c.posq})`); T('kPost', p1(r.post));
    const nPos = r.nTP + r.nFP;
    T('kPostS', freq ? (nPos ? `${cnt(r.nTP)} of ${cnt(nPos)} ${c.posq} ${c.pop}` : `no ${c.posq} ${c.pop}`) : `${p4(r.tp)} ÷ ${p4(r.pos)}`);
    T('kLR', r.f > 0 ? '×' + (r.se / r.f).toFixed(1) : '∞');
    // prior vs posterior bars
    q('[data-bar="prior"]').style.width = Math.max(0.6, r.p * 100) + '%';
    q('[data-bar="post"]').style.width = Math.max(0.6, r.post * 100) + '%';
    T('bPrior', p1(r.p)); T('bPost', p1(r.post)); T('bPostL', `After ${c.posq === 'flagged' ? 'a flag' : 'a positive'}`);
    // who is positive?
    const tpS = r.pos > 0 ? r.tp / r.pos : 0;
    q('[data-bar="tp"]').style.width = (tpS * 100) + '%'; q('[data-bar="fp"]').style.width = ((1 - tpS) * 100) + '%';
    T('splitH', `Of everyone ${c.posq}:`);
    T('lgTp', `${c.H}: ${freq ? cnt(r.nTP) : p1(tpS)}`); T('lgFp', `${c.Hc} (false alarms): ${freq ? cnt(r.nFP) : p1(1 - tpS)}`);
    // story
    const story = freq
      ? `Out of ${cnt(N10)} ${c.pop}, about ${cnt(r.nH)} are ${c.H.toLowerCase()} and ${cnt(r.nHc)} are ${c.Hc.toLowerCase()}. ${cnt(r.nTP)} of the first group and ${cnt(r.nFP)} of the second come back ${c.posq}. So ${cnt(nPos)} ${c.pop} are ${c.posq}, and only ${cnt(r.nTP)} of them${nPos ? ` (${p1(r.nTP / nPos)})` : ''} are really ${c.H.toLowerCase()}.`
      : `Bayes' theorem: P(${c.hq} | ${c.posq}) = P(${c.posq} | ${c.hq}) P(${c.hq}) ÷ P(${c.posq}) = ${p4(r.se)} × ${p4(r.p)} ÷ ${p4(r.pos)} = ${p1(r.post)}. ${r.post < 0.5 ? `Even with this screen, most ${c.posq} ${c.pop} are false alarms, because ${c.Hc.toLowerCase()} ${c.pop} vastly outnumber the rest.` : `Here most ${c.posq} ${c.pop} really are ${c.H.toLowerCase()}.`}`;
    T('story', story);
    q('[data-rows]').innerHTML = [
      [`${c.H} → ${c.pos}`, `${p1(r.p)} × ${p1(r.se)}`, r.tp, r.nTP, 'tp'],
      [`${c.H} → ${c.neg}`, `${p1(r.p)} × ${p1(1 - r.se)}`, r.fn, r.nFN, ''],
      [`${c.Hc} → ${c.pos}`, `${p1(1 - r.p)} × ${p1(r.f)}`, r.fp, r.nFP, 'fp'],
      [`${c.Hc} → ${c.neg}`, `${p1(1 - r.p)} × ${p1(1 - r.f)}`, r.tn, r.nTN, ''],
    ].map(([a, b, v, n, cls]) => `<tr class="${cls}"><td>${esc(a)}${cls === 'tp' ? ' <span class="pill cur">true +</span>' : cls === 'fp' ? ' <span class="pill st">false +</span>' : ''}</td><td class="num">${b}</td><td class="num">${p4(v)}</td><td class="num">${cnt(n)}</td></tr>`).join('');
    q('[data-tree]').setAttribute('aria-label', `Probability tree. Prior ${p1(r.p)}, sensitivity ${p1(r.se)}, false-positive rate ${p1(r.f)}. P(${c.posq}) ${p4(r.pos)}. Posterior ${p1(r.post)}.`);
    return r;
  }
  function announce() { const r = compute(), c = SCEN[s.scen]; q('[data-live]').textContent = `P(${c.hq} given ${c.posq}) is now ${p1(r.post)}.`; }
  host.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; s[k] = +e.target.value; draw(); });
  host.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.k) announce(); });
  host.addEventListener('click', e => {
    const sc = e.target.closest('[data-scen]'), vw = e.target.closest('[data-view]');
    if (sc) { s.scen = sc.dataset.scen; Object.assign(s, pickScen(s.scen)); host.querySelectorAll('[data-scen]').forEach(b => b.setAttribute('aria-pressed', String(b === sc))); draw(); announce(); }
    if (vw) { s.view = vw.dataset.view; host.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === vw))); host.querySelector('.bayes').classList.toggle('is-freq', s.view === 'freq'); draw(); }
    if (e.target.closest('[data-reset]')) { Object.assign(s, pickScen(s.scen)); draw(); announce(); }
  });
  draw();
}
