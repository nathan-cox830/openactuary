// Skills lesson (#/skills/<track>/<lesson>/<step>): one step at a time with a live workspace.
//   Excel steps: the in-app spreadsheet (js/ui/sheet.js); checked against a reference workbook built from the
//                step's own data plus its solution, so expected values are never hard-coded.
//   SQL steps:   an editor and results table on a practice database (js/ui/sql.js); checked against the
//                step's reference query.
// Progress namespace "skills": { done: {stepId: true}, helped: {stepId: true}, sheets: {stepId: overrides}, sql: {stepId: text}, hint: {stepId: n} }.
import { esc, icon, toast } from '../util.js';
import { load, update as updateStore, setLast } from '../progress.js';
import { applyGlossary } from '../ui/glossary.js';
import { confetti } from '../ui/motion.js';
import { mountSheet, buildWorkbook } from '../ui/sheet.js';
import { expandRange, parseAddr, shiftFormula, formatValue, isErr } from '../ui/formula.js';
import { loadTrack } from '../../data/skills/tracks.js';
import { go } from '../router.js';

export let title = 'Skills lesson';

const FALLBACK = { done: {}, helped: {}, sheets: {}, sql: {}, hint: {} };
let root = null, T = null, L = null, S = null, si = 0, sheet = null;
let runner = null, sqlDb = null, refCache = {};
const getSt = () => { const s = load('skills', FALLBACK); for (const k of Object.keys(FALLBACK)) s[k] = s[k] || {}; return s; };
const href = (lid, sid) => `#/skills/${T.id}/${lid}${sid ? '/' + sid : ''}`;

export async function render(el, params) {
  root = el;
  const [tid, lid, sid] = params || [];
  T = await loadTrack(tid);
  if (!T) { go('skills', { replace: true }); return; }
  L = T.lessons.find(l => l.id === lid);
  if (!L) { go('skills', { replace: true }); return; }
  const st = getSt();
  si = Math.max(0, L.steps.findIndex(s => s.id === sid));
  if (!sid) si = Math.max(0, L.steps.findIndex(s => !st.done[s.id]));
  S = L.steps[si];
  title = `${L.title} · ${T.name}`; document.title = `${L.title} · OpenActuary`;
  setLast(href(L.id, S.id), `${T.name}: ${L.title}`);
  const li = T.lessons.indexOf(L), nextL = T.lessons[li + 1];
  el.innerHTML = `
  <div class="container sk-page">
    <header class="page-head">
      <div class="eyebrow"><a href="#/skills">Skills</a> · ${esc(T.name)} · Lesson ${li + 1} of ${T.lessons.length}</div>
      <h1>${esc(L.title)}</h1>
      <div class="prose lede sk-intro">${L.intro || ''}</div>
    </header>
    <div class="sk-layout">
      <aside class="sk-side" aria-label="Lesson steps">
        <ol class="lsn-steps" data-steps></ol>
        <div class="lsn-tools">
          <a class="btn quiet sm" href="#/skills">${icon('back')} All ${esc(T.name)} lessons</a>
          ${nextL ? `<a class="btn quiet sm" href="${href(nextL.id)}">${icon('arrow')} Next: ${esc(nextL.short || nextL.title)}</a>` : ''}
        </div>
      </aside>
      <article class="sk-main" data-main></article>
    </div>
  </div>`;
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);
  el.addEventListener('input', onInput);
  drawSide(); drawMain();
}
export async function update(params) {
  if (!root) return;
  if (sheet) { sheet.destroy(); sheet = null; }
  root.removeEventListener('click', onClick); root.removeEventListener('keydown', onKey); root.removeEventListener('input', onInput);
  root.innerHTML = ''; window.scrollTo(0, 0);
  await render(root, params);
}
export function destroy() { if (sheet) sheet.destroy(); sheet = null; if (runner) runner.destroy(); runner = null; sqlDb = null; refCache = {}; root = null; }

/* ---------- layout ---------- */
function drawSide() {
  const st = getSt();
  root.querySelector('[data-steps]').innerHTML = L.steps.map((s, i) => {
    const d = !!st.done[s.id], here = i === si;
    return `<li><a class="lsn-step${here ? ' cur' : ''}${d ? ' done' : ''}" href="${href(L.id, s.id)}" ${here ? 'aria-current="step"' : ''}>
      <span class="lsn-num" aria-hidden="true">${d ? icon('check') : i + 1}</span><span class="lsn-t">${esc(s.title)}${d ? '<small>done</small>' : ''}</span></a></li>`;
  }).join('');
}
function drawMain() {
  const st = getSt(); const done = !!st.done[S.id];
  const prev = L.steps[si - 1], next = L.steps[si + 1];
  const li = T.lessons.indexOf(L), nextL = T.lessons[li + 1];
  const main = root.querySelector('[data-main]');
  main.innerHTML = `
    <section class="card sk-task">
      <div class="lsn-meta"><span class="eyebrow">Step ${si + 1} of ${L.steps.length}</span>${done ? `<span class="pill ok">${icon('check')} Done${st.helped[S.id] ? ' with help' : ''}</span>` : ''}</div>
      <h2 class="lsn-title">${esc(S.title)}</h2>
      <div class="prose">${S.body}</div>
    </section>
    <section class="sk-work" data-work></section>
    <div class="row sk-actions">
      <button type="button" class="btn primary" data-act="check">${icon('check')} Check my work</button>
      <button type="button" class="btn ghost" data-act="hint">${icon('spark')} Hint</button>
      <button type="button" class="btn quiet" data-act="solution">Show solution</button>
      <button type="button" class="btn quiet" data-act="reset">${icon('refresh')} Reset</button>
    </div>
    <div data-fb aria-live="polite"></div>
    <div data-hints></div>
    <div data-take>${done && S.takeaway ? takeawayHtml() : ''}</div>
    <nav class="lsn-pager" aria-label="Step navigation">
      ${prev ? `<a class="btn ghost" href="${href(L.id, prev.id)}">${icon('back')} Previous</a>` : '<span></span>'}
      ${next ? `<a class="btn ${done ? 'primary' : 'ghost'}" href="${href(L.id, next.id)}">Next step ${icon('arrow')}</a>`
        : nextL ? `<a class="btn ${done ? 'primary' : 'ghost'}" href="${href(nextL.id)}">Next lesson ${icon('arrow')}</a>` : `<a class="btn ghost" href="#/skills">All lessons ${icon('arrow')}</a>`}
    </nav>`;
  drawHints();
  applyGlossary(main);
  if (T.id === 'excel') mountExcel(); else mountSql();
}
const takeawayHtml = () => `<div class="callout sk-take"><b>${icon('star')} Takeaway</b><div class="prose">${S.takeaway}</div></div>`;
function drawHints() {
  const n = getSt().hint[S.id] || 0;
  root.querySelector('[data-hints]').innerHTML = n ? `<div class="hints">${(S.hints || []).slice(0, n).map((h, k) => `<div class="hint-step"><b>Hint ${k + 1}</b><div class="prose">${h}</div></div>`).join('')}</div>` : '';
  const hb = root.querySelector('[data-act="hint"]');
  if (hb) { const left = (S.hints || []).length - n; hb.disabled = left <= 0; hb.innerHTML = `${icon('spark')} ${left <= 0 ? 'No more hints' : n ? 'Next hint' : 'Hint'}`; }
}
function feedback(ok, html) { root.querySelector('[data-fb]').innerHTML = `<div class="fb ${ok === true ? 'ok' : ok === false ? 'no' : 'info'}"><div>${html}</div></div>`; }
function markDone(helped) {
  let allDone = false;
  updateStore('skills', s => {
    for (const k of Object.keys(FALLBACK)) s[k] = s[k] || {};
    s.done[S.id] = true; if (helped) s.helped[S.id] = true;
    allDone = L.steps.every(x => s.done[x.id]);
  }, FALLBACK);
  drawSide();
  root.querySelector('[data-take]').innerHTML = S.takeaway ? takeawayHtml() : '';
  const nx = root.querySelector('.lsn-pager .btn:last-child'); if (nx) nx.classList.replace('ghost', 'primary');
  if (allDone && !helped) { confetti(); toast(`"${L.title}" complete.`); }
}

/* =====================================================================
   Excel
   ===================================================================== */
function expandSolution(sol) {
  const out = {};
  Object.entries(sol || {}).forEach(([k, v]) => {
    if (!k.includes(':')) { out[k.toUpperCase()] = v; return; }
    const cells = expandRange(k), p0 = parseAddr(cells[0]);
    cells.forEach(a => { const p = parseAddr(a); out[a] = typeof v === 'string' ? shiftFormula(v, p.r - p0.r, p.c - p0.c) : v; });
  });
  return out;
}
function mountExcel() {
  const host = root.querySelector('[data-work]');
  host.innerHTML = `<div class="sk-sheet"></div><p class="tiny muted sk-tip">Type in a cell or the formula bar. Enter moves down, Tab moves right. Click a cell while typing a formula to insert it. Fill down with Ctrl/Cmd+D or drag the small square. Your work saves automatically.</p>`;
  const st = getSt();
  const over = st.sheets[S.id] || {};
  sheet = mountSheet(host.querySelector('.sk-sheet'), {
    rows: S.sheet.rows, overrides: over, inputs: S.sheet.inputs, formats: S.sheet.formats, cols: S.sheet.cols, label: S.title, extraRows: 2, extraCols: 1,
    onChange(o) { updateStore('skills', s => { s.sheets = s.sheets || {}; if (Object.keys(o).length) s.sheets[S.id] = { ...o }; else delete s.sheets[S.id]; }, FALLBACK); },
  });
}
function checkExcel() {
  const ref = buildWorkbook(S.sheet.rows, expandSolution(S.solution));
  const wb = sheet.wb; const problems = []; let first = null;
  const cells = (S.check || []).flatMap(expandRange);
  for (const a of cells) {
    const raw = wb.raw[a], u = wb.value(a), r = ref.value(a);
    if (raw == null || raw === '') { problems.push(`<b>${a}</b> is empty.`); first = first || a; continue; }
    if (isErr(u)) { problems.push(`<b>${a}</b> shows ${u.err}. ${esc(u.msg || '')}`); first = first || a; continue; }
    const same = typeof r === 'number' ? (typeof u === 'number' && Math.abs(u - r) <= 1e-6 * Math.max(1, Math.abs(r)))
      : String(u).trim().toLowerCase() === String(r).trim().toLowerCase();
    if (!same) { problems.push(`<b>${a}</b> shows ${esc(formatValue(u))}, which isn't what the task asks for.`); first = first || a; }
  }
  if (!problems.length) for (const rule of S.require || []) {
    for (const a of expandRange(rule.range)) {
      const raw = String(wb.raw[a] ?? '');
      const bad = (rule.formula && !raw.startsWith('=')) || (rule.fn && !new RegExp('\\b' + rule.fn.replace('.', '\\.') + '\\s*\\(', 'i').test(raw)) || (rule.pattern && !new RegExp(rule.pattern, 'i').test(raw));
      if (bad) { problems.push(`<b>${a}</b>: ${esc(rule.msg || 'Use a formula here, as the task describes.')}`); first = first || a; break; }
    }
  }
  if (first) sheet.select(first);
  if (problems.length) {
    const more = problems.length > 4 ? `<br><span class="small muted">…and ${problems.length - 4} more.</span>` : '';
    feedback(false, `Not quite yet.<br>${problems.slice(0, 4).join('<br>')}${more}`);
  } else { feedback(true, `Correct. Every checked cell (${cells.length}) matches.`); markDone(!!getSt().helped[S.id]); }
}

/* =====================================================================
   SQL
   ===================================================================== */
async function getRunner() {
  if (runner) return runner;
  const [{ SqlRunner }, db] = await Promise.all([import('../ui/sql.js'), import('../../data/skills/sql-db.js')]);
  sqlDb = db; runner = new SqlRunner(db.SCHEMA_SQL + '\n' + db.SEED_SQL);
  return runner;
}
function mountSql() {
  const host = root.querySelector('[data-work]');
  const st = getSt(); const text = st.sql[S.id] ?? S.starter ?? '';
  host.innerHTML = `
    <div class="sk-sql">
      <div class="sk-schema card" data-schema><span class="small muted">Loading the practice database…</span></div>
      <div class="sk-ed card">
        <div class="sk-ed-h"><b>${icon('pencil')} Your query</b><span class="tiny muted">Ctrl/Cmd + Enter to run</span></div>
        <textarea class="sk-editor" data-editor spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="SQL query">${esc(text)}</textarea>
        <div class="row"><button type="button" class="btn" data-act="run">${icon('play')} Run</button><span class="small muted" data-status></span></div>
      </div>
    </div>
    <div class="sk-results card" data-results><span class="small muted">Run a query to see its results here.</span></div>`;
  getRunner().then(async r => {
    if (!root || !sqlDb) return;
    drawSchema();
    try { await r.ready; setStatus('Database ready.'); } catch (e) { setStatus(''); showError(e.message); }
  }).catch(e => showError('Could not load the SQL lessons: ' + e.message));
}
function drawSchema() {
  const box = root.querySelector('[data-schema]'); if (!box || !sqlDb) return;
  const focus = new Set(S.tables || []);
  const tables = [...sqlDb.TABLES].sort((a, b) => (focus.has(b.name) - focus.has(a.name)));
  box.innerHTML = `<div class="sk-ed-h"><b>${icon('table')} Tables</b><span class="tiny muted">Tap a table to see its columns</span></div>` + tables.map(t => `
    <details class="sk-tbl" ${focus.has(t.name) ? 'open' : ''}><summary><code>${esc(t.name)}</code>${focus.has(t.name) ? ' <span class="pill cur">used here</span>' : ''}</summary>
      <p class="tiny muted">${esc(t.desc || '')}</p>
      <ul>${t.cols.map(([c, ty, d]) => `<li><code>${esc(c)}</code> <span class="tiny muted">${esc(ty)}${d ? ' · ' + esc(d) : ''}</span></li>`).join('')}</ul>
      <button type="button" class="btn sm quiet" data-preview="${esc(t.name)}">Preview 5 rows</button>
    </details>`).join('');
}
const setStatus = t => { const s = root && root.querySelector('[data-status]'); if (s) s.textContent = t; };
function showError(msg) { const r = root && root.querySelector('[data-results]'); if (r) r.innerHTML = `<div class="fb no"><div><b>Error:</b> ${esc(msg)}</div></div>`; }
function showResult(res, ms) {
  const box = root.querySelector('[data-results]'); if (!box) return;
  if (!res) { box.innerHTML = `<span class="small muted">The statement ran but returned no rows to show.</span>`; return; }
  const n = res.values.length, cap = 200;
  box.innerHTML = `<div class="sk-res-h"><b>${n} row${n === 1 ? '' : 's'}</b><span class="tiny muted">${ms != null ? ms + ' ms' : ''}${n > cap ? ` · showing the first ${cap}` : ''}</span></div>
    <div class="tblwrap"><table class="sk-tbl-res"><thead><tr>${res.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${res.values.slice(0, cap).map(r => `<tr>${r.map(v => `<td class="${typeof v === 'number' ? 'num' : ''}">${v == null ? '<span class="muted">NULL</span>' : esc(typeof v === 'number' ? String(+v.toFixed(6)) : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const editorText = () => (root.querySelector('[data-editor]')?.value || '').trim();
async function runSql(sql) {
  if (!sql) { showError('Type a query first.'); return null; }
  setStatus('Running…'); const t0 = performance.now();
  try { const r = await (await getRunner()).run(sql); const ms = Math.round(performance.now() - t0); setStatus(''); showResult(r, ms); return { r }; }
  catch (e) { setStatus(''); showError(e.message); return null; }
}
async function checkSql() {
  const mine = await runSql(editorText()); if (!mine) { feedback(false, 'Fix the error shown in the results, then check again.'); return; }
  let ref = refCache[S.id];
  if (!ref) { try { ref = refCache[S.id] = await runner.run(S.solution); } catch (e) { feedback(false, 'The reference query failed: ' + esc(e.message)); return; } }
  const { compareResults } = await import('../ui/sql.js');
  const c = compareResults(mine.r, ref, !!S.ordered);
  feedback(c.ok, esc(c.msg));
  if (c.ok) markDone(!!getSt().helped[S.id]);
}

/* ---------- events ---------- */
function onClick(e) {
  const pv = e.target.closest('[data-preview]'); if (pv) { runSql(`SELECT * FROM ${pv.dataset.preview} LIMIT 5`); return; }
  const b = e.target.closest('[data-act]'); if (!b || !root.contains(b)) return;
  const act = b.dataset.act;
  if (act === 'check') return T.id === 'excel' ? checkExcel() : checkSql();
  if (act === 'run') return runSql(editorText());
  if (act === 'hint') { updateStore('skills', s => { s.hint = s.hint || {}; s.hint[S.id] = Math.min((S.hints || []).length, (s.hint[S.id] || 0) + 1); }, FALLBACK); drawHints(); return; }
  if (act === 'solution') {
    updateStore('skills', s => { s.helped = s.helped || {}; s.helped[S.id] = true; }, FALLBACK);
    if (T.id === 'excel') { sheet.setCells(expandSolution(S.solution)); feedback(null, 'The solution is filled in. Click any cell to see its formula, then press <b>Check my work</b>. This step will show as "done with help".'); }
    else { const ed = root.querySelector('[data-editor]'); ed.value = S.solution; saveSql(ed.value); feedback(null, 'The reference query is in the editor. Run it and read it line by line. This step will show as "done with help".'); }
    return;
  }
  if (act === 'reset') {
    if (T.id === 'excel') { sheet.reset(); }
    else { const ed = root.querySelector('[data-editor]'); ed.value = S.starter || ''; saveSql(null); root.querySelector('[data-results]').innerHTML = '<span class="small muted">Run a query to see its results here.</span>'; }
    root.querySelector('[data-fb]').innerHTML = ''; toast('Step reset.');
  }
}
function saveSql(text) { updateStore('skills', s => { s.sql = s.sql || {}; if (text == null) delete s.sql[S.id]; else s.sql[S.id] = text; }, FALLBACK); }
function onInput(e) { if (e.target.matches('[data-editor]')) saveSql(e.target.value); }
function onKey(e) {
  const ed = e.target.closest && e.target.closest('[data-editor]'); if (!ed) return;
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runSql(editorText()); return; }
}
