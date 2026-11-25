// The case engine. Renders any case definition (see README "Adding a case") as an interactive
// workspace: Brief → Learn → Exhibits → Work → Recommend → Debrief.
// Everything runs in the browser; state is saved per case under "case:<id>".
import { esc, fmt, num, mdLite, csvEncode, saveFile, dateStamp, icon, toast, $ } from '../util.js';
import * as store from '../progress.js';
import { ring, animateRings } from '../ui/charts.js';
import { countUp, confetti } from '../ui/motion.js';
import { applyGlossary } from '../ui/glossary.js';
import { showModal, closeModal } from '../ui/modal.js';
import BENCHES from './benches/index.js';
import { mountSheet, buildWorkbook, rowsOf } from '../ui/sheet.js';
import { isErr, formatValue } from '../ui/formula.js';

export const TABS = [
  ['brief', 'Brief', 'brief'], ['learn', 'Learn', 'book'], ['exhibits', 'Exhibits', 'table'],
  ['work', 'Work', 'pencil'], ['recommend', 'Recommend', 'target'], ['debrief', 'Debrief', 'star'],
];
export const LINES = { pc: 'Property & casualty', life: 'Life', health: 'Health', retirement: 'Retirement' };

export const RUBRIC_CHECKS = [
  ['Technical soundness', ['States the key numbers (estimate, indication or premium) and how they were produced', 'Names the methods used and why they fit this data', 'No arithmetic, unit or labeling errors']],
  ['Assumptions & judgment', ['States each key assumption with a reason', 'Shows where a judgment call moved the answer, and by roughly how much']],
  ['Recommendation & business sense', ['Answers the question asked in the first two sentences', 'Connects the recommendation to the business constraint (earnings, retention, budget, competitiveness)']],
  ['Risks & limitations', ['Names the biggest uncertainty and which direction it could go', 'Says what new information would change the recommendation']],
  ['Clarity & structure', ['A non-actuary could follow it: recommendation, support, risks, next steps', 'Roughly 200–350 words, with numbers rounded sensibly']],
];
const RUBRIC = RUBRIC_CHECKS.map(r => r[0]);

/* ---------------- state ---------------- */
export const freshState = old => ({ tab: 'brief', done: {}, ans: {}, sel: [], mode: (old && old.mode) || 'guided' });
export const loadState = def => store.load('case:' + def.id, freshState());
export const saveState = (def, st) => store.save('case:' + def.id, st);
export function progressOf(def, st) {
  const d = def.tasks.filter(t => t.type === 'pick' ? st.locked : st.done[t.id]).length;
  return { d, n: def.tasks.length, locked: !!st.locked, started: d > 0 || Object.keys(st.ans || {}).length > 0 || (st.sel || []).length > 0 };
}

/* ---------------- task logic (pure-ish helpers) ---------------- */
const pickTask = def => def.tasks.find(t => t.type === 'pick');
const AUTO_REVEAL = t => ['num', 'multi', 'mcq'].includes(t.type);
const hintList = (def, t) => (def.hints && def.hints[t.id]) || (t.hint ? [t.hint] : []);
function maxHint(def, st, t) { const H = hintList(def, t); const full = AUTO_REVEAL(t) ? (H.length ? H.length + 1 : (t.explain ? 1 : 0)) : H.length; return st.mode === 'competition' ? Math.min(full, 2) : full; }
function revealLevel(def, t) { const H = hintList(def, t); return AUTO_REVEAL(t) ? H.length + 1 : (H.length >= 3 ? 3 : Infinity); }
const call = (f, st) => typeof f === 'function' ? f(st) : f;
function hintText(def, st, t, k) {
  const H = hintList(def, t);
  if (k < H.length) { const h = H[k]; return typeof h === 'function' ? h(st) : esc(h); }
  if (t.type === 'mcq') return `<b>${esc(t.options[t.correct])}</b> ${esc(t.explain)}`;
  return t.explain ? (typeof t.explain === 'function' ? t.explain(st) : esc(t.explain)) : '';
}
const foundationsDone = (def, st) => def.tasks.filter(t => t.tier === 'F' && t.type !== 'pick').every(t => st.done[t.id]);
function nextTask(def, st) {
  const vis = def.tasks.filter(t => t.type !== 'pick' && (t.tier === 'F' || st.mode === 'competition' || foundationsDone(def, st)));
  const n = vis.find(t => !st.done[t.id]); return n ? n.id : pickTask(def).id;
}
const within = (v, a, t) => t.rtol ? Math.abs(v / a - 1) <= t.rtol : Math.abs(v - a) <= t.tol;
function setPath(st, path, val) {
  const parts = path.split('.'); let o = st;
  for (let i = 0; i < parts.length - 1; i++) { const k = parts[i]; if (o[k] == null) o[k] = /^\d+$/.test(parts[i + 1]) ? [] : {}; o = o[k]; }
  o[parts[parts.length - 1]] = val;
}

/* ---------------- mount ---------------- */
export function mount(el, def, tab) {
  const st = loadState(def);
  if (tab && TABS.some(x => x[0] === tab)) st.tab = tab;
  const save = () => saveState(def, st);

  el.innerHTML = `
  <section class="case-hero">
    <div class="container">
      <a class="back-link" href="#/cases">${icon('back')} All cases</a>
      <div class="case-hero-grid">
        <div>
          <div class="chips" style="margin-bottom:12px"><span class="chip on-dark">${esc(LINES[def.line] || def.line)}</span><span class="chip on-dark">${esc(def.levelLabel)}</span><span class="chip on-dark">${icon('clock')} ~${def.minutes} min</span></div>
          <h1>${esc(def.title)}</h1>
          <p class="case-tagline">${esc(def.tagline || def.sub)}</p>
        </div>
        <div class="case-hero-progress" id="caseProgress"></div>
      </div>
    </div>
  </section>
  <div class="container case-layout">
    <nav class="case-rail" aria-label="Case sections"><div class="case-rail-inner" id="caseRail"></div></nav>
    <div class="case-body" id="tabbody" role="tabpanel"></div>
  </div>
  ${def.csv ? `<aside class="wb-drawer" id="wbDrawer" aria-label="Case workbook" aria-hidden="true">
    <div class="wb-grip" id="wbGrip" title="Drag to resize" aria-hidden="true"></div>
    <div class="wb-head"><h2>${icon('grid')} Workbook</h2><span class="small muted wb-sub">Live formulas. Yellow cells are yours to fill.</span>
      <div class="wb-actions">
        ${def.workbook?.links ? `<button class="btn sm ghost" data-wb="pull" title="Copy the values you entered in the Work tab tasks into the workbook's input cells">${icon('pencil')}<span class="lbl"> Use my task inputs</span></button>` : ''}
        <button class="btn sm ghost" data-wb="csv" title="Download this workbook, with your edits, as a CSV for Excel or Google Sheets">${icon('download')}<span class="lbl"> CSV</span></button>
        <button class="btn sm quiet" data-wb="reset" title="Undo all your edits to the workbook">${icon('refresh')}<span class="lbl"> Reset</span></button>
        <button class="btn sm quiet" data-wb="max" aria-label="Expand or shrink the workbook">${icon('expand')}</button>
        <button class="btn sm quiet" data-wb="close" aria-label="Close the workbook">${icon('x')}</button>
      </div></div>
    <div class="wb-body" id="wbBody"></div>
  </aside>
  <button class="btn primary wb-fab" id="wbFab" data-wb="open" hidden>${icon('grid')} Open workbook</button>` : ''}`;

  const body = $('#tabbody', el), rail = $('#caseRail', el), prog = $('#caseProgress', el);

  /* ---------- workbook (in-app spreadsheet built from def.csv) ---------- */
  const W = def.workbook || {};
  // The drawer is fixed-position, so it lives on <body>: the view wrapper's entry animation leaves a transform
  // that would otherwise pin "fixed" children to the view instead of the viewport.
  const drawer = $('#wbDrawer', el), fab = $('#wbFab', el);
  if (drawer) { document.body.append(drawer, fab); }
  let sheet = null;
  const wbRows = () => def.csv(st);
  const liveWb = () => sheet ? sheet.wb : buildWorkbook(wbRows(), st.wb || {});
  const wbTab = () => st.tab === 'work' || st.tab === 'exhibits';
  function mountWb() {
    if (sheet || !drawer) return;
    st.wb = st.wb || {};
    sheet = mountSheet($('#wbBody', drawer), { rows: wbRows(), overrides: st.wb, inputs: W.inputs, formats: W.formats, cols: W.cols, checks: W.checks, notes: true, label: def.title + ' workbook', onChange(o) { st.wb = o; save(); } });
  }
  function showWb(open) {
    if (!drawer) return;
    if (open != null) { st.wbOpen = open; save(); }
    const vis = !!st.wbOpen && wbTab();
    if (vis) mountWb();
    drawer.classList.toggle('open', vis); drawer.setAttribute('aria-hidden', String(!vis));
    if (vis) drawer.removeAttribute('inert'); else drawer.setAttribute('inert', '');
    document.body.classList.toggle('wb-open', vis);
    if (fab) fab.hidden = vis || !wbTab();
    if (st.wbH) { drawer.style.setProperty('--wb-h', st.wbH + 'px'); document.body.style.setProperty('--wb-h', st.wbH + 'px'); }
    if (vis && open) setTimeout(() => sheet && sheet.focus(), 330);
  }
  /** Replace "=F52"-style entries in answer boxes with the workbook value. Returns an error message or ''. */
  function resolveFormulas(scope) {
    if (!def.csv) return '';
    let bad = '';
    scope.querySelectorAll('input[type="text"]').forEach(x => {
      if (x.closest('.wb-drawer') || !x.value.trim().startsWith('=')) return;
      const v = liveWb().evaluate(x.value);
      if (typeof v !== 'number') { bad = `The workbook formula ${x.value.trim()} gives ${isErr(v) ? v.err : 'text, not a number'}.`; return; }
      x.value = String(+v.toPrecision(10)); writeInput(x);
    });
    return bad;
  }
  function writeInput(x) {
    const d = x.dataset;
    if (d.ans) st.ans[d.ans] = x.value; else if (d.field) setPath(st, d.field, x.value);
  }
  function pullInputs() {
    const ch = {}; let n = 0;
    (W.links || []).forEach(({ cell, path, scale }) => { const v = num(path.split('.').reduce((o, k) => o == null ? o : o[k], st)); if (isFinite(v)) { ch[cell] = +(v * (scale || 1)).toPrecision(10); n++; } });
    if (!n) { toast('Nothing to copy yet: fill in the task inputs on the Work tab first.'); return; }
    mountWb(); sheet.setCells(ch); toast(`Copied ${n} value${n === 1 ? '' : 's'} from your tasks into the workbook.`);
  }
  function wbCsv() {
    const rows = wbRows(); const wb = liveWb();
    const out = rowsOf(wb, rows.length + 3, Math.max(...rows.map(r => r.length)) + 1);
    return saveFile(`${def.id}-workbook.csv`, '\ufeff' + csvEncode(out), 'text/csv;charset=utf-8');
  }
  if (drawer) {
    const grip = $('#wbGrip', drawer);
    grip.addEventListener('pointerdown', e => {
      e.preventDefault(); grip.setPointerCapture(e.pointerId);
      const move = ev => { const h = Math.max(180, Math.min(window.innerHeight - 90, window.innerHeight - ev.clientY)); st.wbH = Math.round(h); drawer.style.setProperty('--wb-h', h + 'px'); document.body.style.setProperty('--wb-h', h + 'px'); };
      const up = () => { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); save(); };
      grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up);
    });
  }

  function renderHeader() {
    const p = progressOf(def, st);
    prog.innerHTML = `${ring(p.d / p.n, { size: 76, label: `${p.d}/${p.n}`, done: p.locked })}
      <div><div class="hp-title">${p.locked ? 'Answer locked' : p.d ? 'In progress' : 'Not started'}</div>
      <div class="hp-sub">${p.d} of ${p.n} tasks complete</div>
      <button class="btn sm quiet on-dark" data-reset-case>${icon('refresh')} Start over</button></div>`;
    animateRings(prog);
    rail.innerHTML = TABS.map(([k, l, ic], i) => {
      const locked = k === 'debrief' && !st.locked;
      return `<a class="rail-tab" href="#/cases/${def.id}/${k}" role="tab" aria-selected="${st.tab === k}" ${st.tab === k ? 'aria-current="page"' : ''}>
        <span class="rail-ic">${icon(locked ? 'lock' : ic)}</span><span class="rail-l"><span class="rail-n">${i + 1}</span>${l}</span></a>`;
    }).join('');
  }

  function renderTab({ keepScroll = false } = {}) {
    body.innerHTML = tabBody();
    showWb();
    applyGlossary(body); countUp(body); animateRings(body);
    if (!keepScroll && st.tab !== 'work') { /* leave scroll where the router put it */ }
    store.setLast(`cases/${def.id}/${st.tab}`, `${def.title}: ${TABS.find(t => t[0] === st.tab)[1]}`);
    if (st.tab === 'debrief' && st.locked && !st.celebrated) { st.celebrated = true; save(); setTimeout(() => confetti(), 250); }
  }

  /* ---------- tab bodies ---------- */
  function tabBody() {
    switch (st.tab) {
      case 'brief': return briefTab();
      case 'learn': return learnTab();
      case 'exhibits': return exhibitsTab();
      case 'work': return workTab();
      case 'recommend': return recommendTab();
      case 'debrief': return debriefTab();
    }
    return '';
  }
  const nextBtn = (tab, label) => `<div class="tab-next"><a class="btn primary" href="#/cases/${def.id}/${tab}">${label} ${icon('arrow')}</a></div>`;

  function briefTab() {
    const stats = def.briefStats ? def.briefStats() : [];
    return `<div class="stack-lg">
      ${stats.length ? `<div class="kpis">${stats.map((s, i) => `<div class="kpi ${i === 0 ? 'hero' : ''}"><div class="l">${esc(s.l)}</div><div class="v" ${s.raw ? '' : `data-count="${s.v}" data-dec="${s.dec || 0}" data-prefix="${s.pre || ''}" data-suffix="${s.suf || ''}"`}>${s.raw ? s.v : (s.pre || '') + fmt(s.v, s.dec || 0) + (s.suf || '')}</div></div>`).join('')}</div>` : ''}
      <div class="card brief-card">${def.brief()}</div>
      <div class="grid-2">
        <div class="card"><h3>What you'll do</h3><ol class="stage-list">${(def.stages || []).map(([l, , opt]) => `<li>${esc(l)}${opt ? ' <span class="pill st">Stretch</span>' : ''}</li>`).join('')}<li>Write a recommendation and defend it</li><li>See what really happened</li></ol></div>
        <div class="card"><h3>Real-world grounding</h3><p class="small">${esc(def.source)}</p><p class="small"><b>Exam tie-in:</b> ${esc(def.exam)}</p>
          ${def.inspiration?.length ? `<p class="small"><b>Inspired by:</b></p><ul class="small link-list">${def.inspiration.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ${icon('external')}</a></li>`).join('')}</ul>` : ''}
          <div class="chips">${def.concepts.map(x => `<span class="chip accent">${esc(x)}</span>`).join('')}</div></div>
      </div>
      ${nextBtn('learn', 'Learn the concepts')}</div>`;
  }

  function learnTab() {
    return `<div class="stack">
      <p class="muted" style="margin:0">Short primers on every concept the case uses. Read them now or come back while you work.</p>
      ${def.primers.map((p, i) => `<article class="primer card"><div class="row between"><h3><span class="primer-n">${i + 1}</span>${esc(p.t)}</h3>${p.tier === 'S' ? '<span class="pill st">Stretch</span>' : ''}</div><div class="prose">${p.h}</div></article>`).join('')}
      ${nextBtn('exhibits', 'Look at the data')}</div>`;
  }

  function exhibitsTab() {
    return `<div class="stack-lg">
      ${def.csv ? `<div class="card excel-card"><div class="excel-ic">${icon('grid')}</div><div style="flex:1;min-width:220px"><b>Work it in the case workbook</b><div class="small muted">A spreadsheet built into this page with all of the case data, step-by-step guidance and live formulas. Your edits save automatically. Prefer Excel or Google Sheets? Download it as a CSV.</div></div><div class="row"><button class="btn primary" data-wb="open">${icon('grid')} Open workbook</button><button class="btn ghost" data-csv>${icon('download')} CSV</button></div></div>` : ''}
      ${def.exhibits(st)}
      ${nextBtn('work', 'Start the work')}</div>`;
  }

  function trackerHtml() {
    const nx = nextTask(def, st), pk = pickTask(def).id;
    return `<div class="tracker" role="list">${(def.stages || []).map(([label, ids, opt], i) => {
      const done = ids.every(id => id === pk ? st.locked : st.done[id]); const cur = ids.includes(nx);
      const locked = opt && st.mode !== 'competition' && !foundationsDone(def, st);
      return `<button class="stage ${done ? 'done' : ''} ${cur ? 'cur' : ''} ${locked ? 'locked' : ''}" role="listitem" data-stage="${ids[0]}" ${locked ? 'disabled' : ''}><span class="n">${done ? '✓' : i + 1}</span><span>${esc(label)}${opt ? ' <i>(stretch)</i>' : ''}</span></button>`;
    }).join('')}</div>`;
  }

  function hintHtml(t) {
    const lv = (st.hintLv || {})[t.id] || 0, mx = maxHint(def, st, t), rl = revealLevel(def, t); if (!mx) return '';
    let h = '';
    for (let k = 0; k < lv; k++) { const isReveal = k + 1 === rl; h += `<div class="hint-step ${isReveal ? 'reveal' : ''}"><b>${isReveal ? (AUTO_REVEAL(t) ? 'Worked answer' : 'Model approach') : 'Hint ' + (k + 1)}</b><div>${hintText(def, st, t, k)}</div></div>`; }
    if (lv < mx) { const nextReveal = lv + 1 === rl; h += `<div class="row"><button class="btn sm quiet" data-hint="${t.id}">${icon('spark')} ${nextReveal ? (AUTO_REVEAL(t) ? 'Show the worked answer' : 'Show the model approach') : lv ? 'Show the next hint' : 'Show a hint'}</button>${nextReveal ? '<span class="tiny muted">This marks the task "done with help".</span>' : ''}</div>`; }
    else if (st.mode === 'competition' && (AUTO_REVEAL(t) ? hintList(def, t).length + 1 : hintList(def, t).length) > mx) h += `<p class="tiny muted" style="margin:0">Worked answers are off in Competition mode.</p>`;
    return `<div class="hints">${h}</div>`;
  }
  function doneBadge(t) {
    if (!st.done[t.id]) return '';
    return (st.helped || {})[t.id] ? '<span class="pill st">Done with help</span><button class="btn sm quiet" data-retry="' + t.id + '">Try again</button>' : '<span class="pill ok">' + icon('check') + ' Done</span>';
  }

  function taskHtml(t) {
    const done = !!st.done[t.id], fb = st.ans['fb_' + t.id];
    const prompt = call(t.prompt, st);
    let bodyH = '';
    if (t.type === 'num') {
      bodyH = `${t.extra ? t.extra(st) : ''}<div class="row"><input type="text" inputmode="decimal" class="f answer" data-ans="${t.id}" value="${esc(st.ans[t.id] ?? '')}" aria-label="Your answer"><button class="btn" data-check="${t.id}">Check</button></div>`;
    } else if (t.type === 'multi') {
      bodyH = `<div class="row">${t.fields.map(([k, l]) => `<label class="field">${esc(l)} <input type="text" inputmode="decimal" class="f" data-field="${k}" value="${esc(st[k] ?? '')}"></label>`).join('')}<button class="btn" data-check="${t.id}" style="align-self:flex-end">Check</button></div>`;
    } else if (t.type === 'mcq') {
      bodyH = `<div class="opts" role="radiogroup">${t.options.map((o, i) => `<label><input type="radio" name="mcq-${t.id}" value="${i}" ${String(st.ans[t.id]) === String(i) ? 'checked' : ''} data-mcq="${t.id}"> <span>${esc(o)}</span></label>`).join('')}</div><div><button class="btn" data-check="${t.id}">Check</button></div>`;
    } else if (t.type === 'bench') {
      const b = BENCHES[t.bench];
      bodyH = `<div class="bench" data-bench="${t.bench}">${b.inputs(st)}<div class="bench-out live" data-bench-out="${t.bench}">${b.outputs(st)}</div></div><div><button class="btn" data-check="${t.id}">Mark complete</button></div>`;
    } else if (t.type === 'pick') {
      bodyH = st.locked
        ? `<div class="fb ok"><div>Locked: <b>${esc(def.pickShow(st))}</b>. <a href="#/cases/${def.id}/debrief">See the debrief →</a></div></div><div><button class="btn sm ghost" data-unlock>Unlock and change</button></div>`
        : `<div class="row"><input type="text" inputmode="decimal" class="f answer" style="width:150px" data-field="pick" value="${esc(st.pick ?? '')}" aria-label="Your selection"><span class="small muted">${esc(def.pickHint)}</span><button class="btn primary" data-lock>${icon('lock')} Lock selection</button></div>`;
    }
    const isNext = t.id === nextTask(def, st) && !done && !(t.type === 'pick' && st.locked) && st.mode !== 'competition';
    return `<article class="task ${done || (t.type === 'pick' && st.locked) ? 'done' : ''} ${t.tier === 'S' ? 'stretch' : ''} ${isNext ? 'next' : ''}" id="task-${t.id}">
      <div class="task-h"><h3>${esc(t.title)}</h3><div class="row">${t.tier === 'S' ? '<span class="pill st">Stretch</span>' : ''}${doneBadge(t)}${isNext ? '<span class="pill cur">Next up</span>' : ''}</div></div>
      <div class="prose" style="max-width:none">${prompt}</div>${bodyH}
      <div data-fb="${t.id}">${fb ? `<div class="fb ${fb.ok ? 'ok' : 'no'}"><div>${fb.msg}</div></div>` : ''}</div>
      ${hintHtml(t)}</article>`;
  }

  function workTab() {
    const mode = st.mode || 'guided';
    const F = def.tasks.filter(t => t.tier === 'F' && t.type !== 'pick'), S = def.tasks.filter(t => t.tier === 'S'), pick = pickTask(def);
    const fd = F.filter(t => st.done[t.id]).length;
    let h = `<div class="work-head card tight"><p class="small muted" style="margin:0;max-width:62ch">${mode === 'guided' ? 'Guided mode: work through the steps in order. Hints come in steps, and the last one shows the worked answer. Stretch tasks unlock when the Foundations are done.' : 'Competition mode: every task is open and worked answers are off, as in a real competition.'} Hover over or tap any <span class="gl" tabindex="0" data-def="Underlined terms show a short definition. The full list is on the Glossary page.">underlined term</span> for a definition.${def.csv ? ` <br><b>Workbook:</b> <button class="linklike" data-wb="open">open the case workbook</button> to calculate in a spreadsheet. Any answer box accepts a workbook reference such as <code>=F52</code>.` : ''}</p>
      <div class="seg" role="group" aria-label="Mode"><button data-mode="guided" aria-pressed="${mode === 'guided'}">Guided</button><button data-mode="competition" aria-pressed="${mode === 'competition'}">Competition</button></div></div>
      ${trackerHtml()}`;
    h += `<section class="stack"><h2>Foundations <span class="count">${fd}/${F.length}</span></h2>${F.map(taskHtml).join('')}</section>`;
    if (S.length) {
      if (mode === 'competition' || fd === F.length) h += `<section class="stack"><h2>Stretch</h2><p class="muted small" style="margin:0">Optional, more advanced material. Many competition teams use these methods.</p>${S.map(taskHtml).join('')}</section>`;
      else h += `<section class="stack"><h2>Stretch</h2><div class="lockbox">${icon('lock')}<p style="margin:6px 0 0">${S.length} stretch tasks unlock when you finish the Foundations (${fd} of ${F.length} done). Switch to Competition mode to open them now.</p></div></section>`;
    }
    h += `<section class="stack"><h2>Your answer</h2>${taskHtml(pick)}</section>`;
    return `<div class="stack-lg">${h}</div>`;
  }

  function selfCheckHtml() {
    const s = st.self || {}; let n = 0, tot = 0;
    const h = RUBRIC_CHECKS.map(([crit, items], ci) => `<div><b class="small">${esc(crit)}</b><div class="opts" style="margin-top:6px">${items.map((it, k) => { tot++; const on = !!s[ci + '-' + k]; if (on) n++; return `<label><input type="checkbox" data-self="${ci}-${k}" ${on ? 'checked' : ''}> <span class="small">${esc(it)}</span></label>`; }).join('')}</div></div>`).join('');
    return `<div class="card stack"><div class="row between"><span class="small muted">Tick each item your summary does. Be strict: judges are.</span><span class="pill ${n === tot ? 'ok' : ''}" id="selfcount">${n} of ${tot}</span></div>${h}</div>`;
  }
  function qbHtml() {
    const Q = def.judgeBank, i = Math.min(st.qbi || 0, Q.length - 1), shown = (st.qbShow || {})[i];
    return `<div class="card stack">
      <div class="row between"><span class="pill cur">Question ${i + 1} of ${Q.length}</span><span class="small muted">${Object.values(st.qb || {}).filter(v => v && v.trim()).length} answered</span></div>
      <p style="margin:0;font-size:16.5px;font-weight:650">${esc(Q[i][0])}</p>
      <textarea data-qb="${i}" style="min-height:120px" aria-label="Your answer">${esc((st.qb || {})[i] || '')}</textarea>
      <div class="row"><button class="btn sm ghost" data-qbmove="-1" ${i === 0 ? 'disabled' : ''}>Previous</button><button class="btn sm" data-qbshow="${i}">${shown ? 'Hide' : 'Show'} what judges look for</button><button class="btn sm ghost" data-qbmove="1" ${i === Q.length - 1 ? 'disabled' : ''}>Next question</button></div>
      ${shown ? `<div class="fb info"><div><b>A strong answer:</b> ${esc(Q[i][1])}</div></div>` : ''}</div>`;
  }
  function feedbackPrompt() {
    return `You are an experienced FCAS actuary judging an undergraduate actuarial case competition. The student is early in their exams, so be encouraging but specific and honest. Score the executive summary below on each criterion from 1 (weak) to 5 (excellent): ${RUBRIC.join('; ')}. Base technical comments on the case facts and the student's actual numbers. Do not reveal what actually happened later or give a model answer.
${def.context(st)}
EXECUTIVE SUMMARY:
"""${(st.rec || '').trim()}"""
Reply with a table of the five criteria (score and a 1-2 sentence comment each), then the single strongest point, then three short, concrete improvements.`;
  }
  function judgePrompt() {
    return `Act as a judge on an actuarial case competition panel (an experienced FCAS). I am an undergraduate early in my actuarial exams. Read the case facts, my work and my executive summary below. Then ask me ONE probing follow-up question at a time, like a real judge, and wait for my answer before the next. Vary the topics: a technical choice, a business judgment, and a risk or what could go wrong. After my third answer, give a short debrief: what I defended well, what was weakest, and one tip for answering judges. Do not reveal what actually happened in later years.
${def.context(st)}
MY EXECUTIVE SUMMARY:
"""${(st.rec || '(not written yet)').trim()}"""
Begin with your first question.`;
  }
  function recommendTab() {
    const words = (st.rec || '').trim().split(/\s+/).filter(Boolean).length;
    return `<div class="split">
      <div class="stack">
        <h2>Executive summary</h2>
        <p class="small muted" style="margin:0">Write the one-page summary you'd hand the ${esc(def.audience)}: your recommendation first, the key numbers, the two or three judgments that drive them, the risks, and next steps. Aim for 200–350 words.</p>
        <textarea id="rec" data-field="rec" aria-label="Executive summary" style="min-height:260px">${esc(st.rec ?? '')}</textarea>
        <div class="row between"><span class="small muted" id="wc">${words} words</span><span class="tiny muted">Saved in this browser as you type</span></div>
        <h3>1. Check it against the judging rubric</h3>${selfCheckHtml()}
        <h3>2. Compare with the model summary</h3>
        ${st.locked ? `<div class="card prose" style="max-width:none">${mdLite(def.modelSummary)}</div>` : `<div class="lockbox">${icon('lock')}<p style="margin:6px 0 0">Unlocks once you lock your answer on the Work tab. Write your own first.</p></div>`}
      </div>
      <div class="stack">
        <h2>Judge Q&amp;A drill</h2>
        <p class="small muted" style="margin:0">Questions real judges ask about this kind of case. Answer out loud or in writing first, then check what a strong answer covers.</p>
        ${qbHtml()}
        <details class="disclose"><summary>Optional: practice with your own AI assistant</summary><div class="stack">
          <p class="small muted" style="margin:0">OpenActuary never sends your work anywhere. If you already use an AI assistant, these prompts include the case facts, your numbers and your summary. Copy one and paste it in yourself.</p>
          <div class="row"><button class="btn sm ghost" data-copy="feedback">Copy feedback prompt</button><button class="btn sm ghost" data-copy="judge">Copy judge Q&amp;A prompt</button></div>
          <textarea readonly id="promptBox" style="min-height:120px;font-size:12px" aria-label="Prompt text">${esc(feedbackPrompt())}</textarea>
        </div></details>
      </div></div>`;
  }

  function debriefTab() {
    if (!st.locked) return `<div class="lockbox"><h3>${icon('lock')} Debrief locked</h3><p>Lock your answer in the last task on the Work tab to see what actually happened and the model solution.</p><a class="btn primary" href="#/cases/${def.id}/work">Go to the Work tab</a></div>`;
    return `<div class="stack-lg"><div class="debrief-banner"><div><div class="eyebrow">Debrief</div><h2>Here's what really happened</h2><p class="muted" style="margin:4px 0 0">Your locked answer: <b>${esc(def.pickShow(st))}</b></p></div><button class="btn ghost" data-dl-attempt>${icon('download')} Download my attempt</button></div>
      ${def.debrief(st)}</div>`;
  }

  /* ---------- actions ---------- */
  function setFb(id, ok, msg) { st.ans['fb_' + id] = { ok, msg }; }
  function check(id) {
    const t = def.tasks.find(x => x.id === id);
    const taskEl = $('#task-' + id, el); const wbErr = taskEl ? resolveFormulas(taskEl) : '';
    if (wbErr) { setFb(id, false, esc(wbErr)); save(); return rerender(id); }
    if (t.type === 'num') {
      const v = num(st.ans[id]); const a = t.answer(st);
      if (!isFinite(a)) setFb(id, false, 'Complete the earlier task this one depends on first.');
      else if (!isFinite(v)) setFb(id, false, 'Enter a number.');
      else if (within(v, a, t)) { st.done[id] = true; setFb(id, true, 'Correct. ' + call(t.explain, st)); }
      else setFb(id, false, 'Not quite. Check your arithmetic, or open a hint.');
    }
    if (t.type === 'multi') {
      let all = true, any = false;
      t.fields.forEach(([k, , i]) => { const v = num(st[k]); if (!isFinite(v)) all = false; else if (!within(v, t.answer(i), t)) { all = false; any = true; } });
      if (all) { st.done[id] = true; setFb(id, true, 'Correct. ' + call(t.explain, st)); } else setFb(id, false, any ? 'At least one value is off. Recheck it against the hint.' : 'Fill in every box.');
    }
    if (t.type === 'mcq') {
      const v = st.ans[id];
      if (v == null) setFb(id, false, 'Choose an option.');
      else if (+v === t.correct) { st.done[id] = true; setFb(id, true, 'Right. ' + esc(t.explain)); }
      else setFb(id, false, 'Not the best answer. Think about what the data can and can\'t tell you, then try again.');
    }
    if (t.type === 'bench') { const r = t.check(st); if (r.ok) st.done[id] = true; else delete st.done[id]; setFb(id, r.ok, r.msg); }
    if (st.done[id] && ((st.hintLv || {})[id] || 0) >= revealLevel(def, t)) { st.helped = st.helped || {}; st.helped[id] = true; }
    save(); rerender(id);
  }
  function rerender(taskId) {
    renderHeader(); renderTab({ keepScroll: true });
    if (taskId) { const t = $('#task-' + taskId, el); if (t) t.scrollIntoView({ block: 'nearest' }); }
  }
  function refreshBenchOutputs() {
    el.querySelectorAll('[data-bench-out]').forEach(o => { o.innerHTML = BENCHES[o.dataset.benchOut].outputs(st); });
  }
  function attemptText() {
    const L = [], p = progressOf(def, st);
    L.push('OpenActuary | ' + def.title + ' (' + def.sub + ')'); L.push('Attempt saved ' + new Date().toLocaleString()); L.push('');
    L.push('Tasks completed: ' + p.d + ' of ' + p.n + (Object.keys(st.helped || {}).length ? ' (' + Object.keys(st.helped).length + ' with help)' : ''));
    L.push('Final answer: ' + (st.locked ? def.pickShow(st) : 'not locked')); L.push('');
    L.push('=== EXECUTIVE SUMMARY ==='); L.push((st.rec || '(not written)').trim()); L.push('');
    const s = st.self || {}; L.push('=== RUBRIC SELF-CHECK ===');
    RUBRIC_CHECKS.forEach(([crit, items], ci) => items.forEach((it, k) => L.push((s[ci + '-' + k] ? '[x] ' : '[ ] ') + crit + ': ' + it))); L.push('');
    const qb = st.qb || {}; const qs = Object.keys(qb).filter(k => (qb[k] || '').trim());
    if (qs.length) { L.push('=== JUDGE QUESTIONS: YOUR ANSWERS ==='); qs.sort((a, b) => a - b).forEach(k => { L.push('Q: ' + def.judgeBank[k][0]); L.push('A: ' + qb[k].trim()); L.push(''); }); }
    return L.join('\r\n');
  }
  const downloadAttempt = () => saveFile(`${def.id}-attempt-${dateStamp()}.txt`, attemptText());

  function openReset() {
    showModal(`<h2>Start "${esc(def.title)}" over?</h2>
      <p>This clears everything in this case: task answers and checks, hints used, your locked answer, your executive summary, Judge Q&amp;A answers and the rubric checklist. Your other cases are kept.</p>
      <p class="small muted">This can't be undone. Download a copy first if you want to compare attempts later.</p>
      <div class="row"><button class="btn sm ghost" data-modal="dl">${icon('download')} Download my attempt first</button></div>
      <div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn ghost" data-modal="cancel">Cancel</button><button class="btn danger" data-modal="reset">Start over</button></div>`,
    a => {
      if (a === 'dl') { toast(downloadAttempt() ? 'Attempt downloaded. You can start over now.' : 'Your browser blocked the download.'); }
      if (a === 'reset') { const keepTab = st.tab; Object.keys(st).forEach(k => delete st[k]); Object.assign(st, freshState(), { tab: keepTab }); save(); if (sheet) { sheet.destroy(); sheet = null; } closeModal(); toast(`"${def.title}" was reset.`); rerender(); window.scrollTo(0, 0); }
    });
  }

  async function copyPrompt(kind) {
    const text = kind === 'feedback' ? feedbackPrompt() : judgePrompt();
    const box = $('#promptBox', el); if (box) box.value = text;
    try { await navigator.clipboard.writeText(text); toast('Copied. Paste it into your AI assistant.'); }
    catch (e) { if (box) { box.focus(); box.select(); } toast('Copy was blocked. The prompt is selected: press Ctrl+C (Cmd+C on Mac).'); }
  }

  /* ---------- event delegation ---------- */
  function onClick(e) {
    const b = e.target.closest('button'); if (!b || !(el.contains(b) || drawer?.contains(b) || b === fab)) return;
    const d = b.dataset;
    if (d.check) return check(d.check);
    if (d.act) { const bn = b.closest('[data-bench]')?.dataset.bench; const bench = BENCHES[bn]; if (bench && bench.action && bench.action(d.act, d.arg, st)) { save(); rerender(); const t = b.closest('.task'); if (t) $('#' + t.id, el)?.scrollIntoView({ block: 'nearest' }); } return; }
    if (d.hint) { const t = def.tasks.find(x => x.id === d.hint); st.hintLv = st.hintLv || {}; st.hintLv[t.id] = Math.min(maxHint(def, st, t), (st.hintLv[t.id] || 0) + 1); save(); return rerender(t.id); }
    if (d.retry) { const id = d.retry; ['done', 'helped', 'hintLv'].forEach(k => { if (st[k]) delete st[k][id]; }); delete st.ans[id]; delete st.ans['fb_' + id]; save(); return rerender(id); }
    if (d.setstate) { try { Object.assign(st, JSON.parse(d.setstate)); } catch (err) { } const t = b.closest('.task'); save(); return rerender(t ? t.id.replace('task-', '') : null); }
    if (d.mode) { st.mode = d.mode; save(); return rerender(); }
    if (d.stage) { $('#task-' + d.stage, el)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (d.copy) return copyPrompt(d.copy);
    if (d.qbmove) { const n = def.judgeBank.length; st.qbi = Math.max(0, Math.min(n - 1, (st.qbi || 0) + (+d.qbmove))); save(); return rerender(); }
    if (d.qbshow != null) { st.qbShow = st.qbShow || {}; st.qbShow[d.qbshow] = !st.qbShow[d.qbshow]; save(); return rerender(); }
    if ('csv' in d || d.wb === 'csv') { toast(wbCsv() ? 'Workbook downloaded with your edits. Open it in Excel or Google Sheets; the formulas calculate on open.' : 'Your browser blocked the download.', 5000); return; }
    if (d.wb) {
      if (d.wb === 'open') return showWb(true);
      if (d.wb === 'close') { showWb(false); return; }
      if (d.wb === 'max') { drawer.classList.toggle('max'); b.innerHTML = icon(drawer.classList.contains('max') ? 'shrink' : 'expand'); return; }
      if (d.wb === 'pull') return pullInputs();
      if (d.wb === 'reset') {
        showModal(`<h2>Reset the workbook?</h2><p>This removes every edit you made in the workbook and restores the original data and formulas. Your task answers are not affected.</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-modal="cancel">Cancel</button><button class="btn danger" data-modal="ok">Reset workbook</button></div>`,
          a => { if (a === 'ok') { mountWb(); sheet.reset(); closeModal(); toast('Workbook reset.'); } });
        return;
      }
    }
    if ('lock' in d) {
      const pt = pickTask(def);
      const lockErr = resolveFormulas(b.closest('.task') || el); if (lockErr) { setFb(pt.id, false, esc(lockErr)); save(); return rerender(pt.id); } const ok = def.pickOk ? def.pickOk(st) : isFinite(num(st.pick));
      if (!ok) { setFb(pt.id, false, 'Enter a number first.'); save(); return rerender(pt.id); }
      st.locked = true; delete st.ans['fb_' + pt.id]; save(); rerender(pt.id); confetti({ count: 90, duration: 1800 });
      toast('Answer locked. The Debrief is open.'); return;
    }
    if ('unlock' in d) { st.locked = false; save(); return rerender(pickTask(def).id); }
    if ('resetCase' in d) return openReset();
    if ('dlAttempt' in d) { toast(downloadAttempt() ? 'Attempt downloaded.' : 'Your browser blocked the download.'); return; }
  }
  function onInput(e) {
    const x = e.target; const d = x.dataset;
    if (d.qb != null) { st.qb = st.qb || {}; st.qb[d.qb] = x.value; save(); return; }
    if (d.self) { st.self = st.self || {}; st.self[d.self] = x.checked; save(); const n = Object.values(st.self).filter(Boolean).length, tot = RUBRIC_CHECKS.reduce((s, r) => s + r[1].length, 0); const c = $('#selfcount', el); if (c) { c.textContent = `${n} of ${tot}`; c.classList.toggle('ok', n === tot); } return; }
    if (d.ans) st.ans[d.ans] = x.value;
    else if (d.mcq) st.ans[d.mcq] = x.value;
    else if (d.field) {
      setPath(st, d.field, x.value);
      if (x.type === 'range') { const o = x.closest('.slider')?.querySelector('output'); if (o) o.textContent = x.value + '%'; }
      if (x.id === 'rec') { const wc = $('#wc', el); if (wc) wc.textContent = x.value.trim().split(/\s+/).filter(Boolean).length + ' words'; } }
    else return;
    save(); refreshBenchOutputs();
  }
  function onKey(e) {
    if (e.key !== 'Enter') return;
    const x = e.target; if (x.tagName !== 'INPUT' || x.type === 'checkbox' || x.type === 'radio') return;
    const btn = x.closest('.task')?.querySelector('[data-check],[data-lock]'); if (btn) { e.preventDefault(); btn.click(); }
  }
  el.addEventListener('click', onClick);
  if (drawer) { drawer.addEventListener('click', onClick); fab.addEventListener('click', onClick); }
  el.addEventListener('input', onInput);
  el.addEventListener('change', e => {
    if (e.target.dataset.self != null || e.target.dataset.mcq) return onInput(e);
    const x = e.target;
    if (def.csv && x.tagName === 'INPUT' && x.type === 'text' && !x.closest('.wb-drawer') && x.value.trim().startsWith('=') && (x.dataset.ans || x.dataset.field)) {
      const msgErr = resolveFormulas(x.parentElement); if (msgErr) toast(msgErr, 4000); else { save(); refreshBenchOutputs(); }
    }
  });
  el.addEventListener('keydown', onKey);

  renderHeader(); renderTab();

  return {
    setTab(tab) {
      if (!TABS.some(x => x[0] === tab)) tab = 'brief';
      st.tab = tab; save(); renderHeader(); renderTab();
      const top = el.querySelector('.case-layout'); if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: 'start' });
    },
    destroy() { document.body.classList.remove('wb-open'); document.body.style.removeProperty('--wb-h'); if (sheet) sheet.destroy(); drawer?.remove(); fab?.remove(); el.removeEventListener('click', onClick); el.removeEventListener('input', onInput); el.removeEventListener('keydown', onKey); },
  };
}
