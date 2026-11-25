// In-app spreadsheet grid on top of js/ui/formula.js. Excel-like keyboard and mouse behavior:
//   type to replace, F2 / double-click to edit, Enter ↓, Tab →, Esc cancels, arrows move (Shift extends),
//   Delete clears, Ctrl/Cmd + C / V / X / Z / Y / D (fill down) / R (fill right), Ctrl+` shows formulas,
//   click a cell while typing a formula to insert its reference, drag the fill handle to copy formulas.
//
//   const s = mountSheet(host, { rows, overrides, inputs: ['B38:K38'], formats: { 'H42:H51': 'pct1' },
//                                cols: { A: 220 }, checks: [{ cell: 'D8', label: 'P(A)', answer: 0.085, tol: 1e-4 }],
//                                notes: true, onChange(overrides) {} });
//   s.wb.value('F52'); s.setCells({ B38: 1.4 }); s.reset(); s.destroy();
import { Workbook, addr, parseAddr, colName, expandRange, references, shiftFormula, formatValue, isErr, FUNCTIONS } from './formula.js';
import { esc, icon, toast } from '../util.js';

/** Build the base cell map from a 2D array of raw values (row 0 = row 1). */
export function cellsFromRows(rows) {
  const cells = {};
  rows.forEach((row, r) => (row || []).forEach((v, c) => { if (v !== '' && v != null) cells[addr(r, c)] = v; }));
  return cells;
}
/** A workbook with the base rows plus the user's overrides (no UI). */
export function buildWorkbook(rows, overrides = {}) {
  const wb = new Workbook(cellsFromRows(rows));
  Object.entries(overrides).forEach(([a, v]) => wb.setRaw(a, v));
  return wb;
}
/** Current contents (base + overrides) as a 2D array, for CSV export. */
export function rowsOf(wb, nRows, nCols) {
  const out = [];
  for (let r = 0; r < nRows; r++) { const row = []; for (let c = 0; c < nCols; c++) { const v = wb.raw[addr(r, c)]; row.push(v == null ? '' : v); } out.push(row); }
  while (out.length && out[out.length - 1].every(v => v === '')) out.pop();
  return out;
}

const checkOk = (v, k) => typeof v === 'number' && (k.rtol ? Math.abs(v / k.answer - 1) <= k.rtol : Math.abs(v - k.answer) <= (k.tol ?? 1e-6));

export function mountSheet(host, opts) {
  const rows = opts.rows || [];
  const base = cellsFromRows(rows);
  const over = opts.overrides || {};
  const wb = buildWorkbook(rows, over);
  const nR = Math.max(opts.minRows || 0, rows.length + (opts.extraRows ?? 3));
  const nC = Math.max(opts.minCols || 0, Math.max(1, ...rows.map(r => (r || []).length)) + (opts.extraCols ?? 1));
  const inputs = new Set((opts.inputs || []).flatMap(expandRange));
  const fmtOf = {}; Object.entries(opts.formats || {}).forEach(([rng, f]) => expandRange(rng).forEach(a => { fmtOf[a] = f; }));
  const checks = opts.checks || [];
  const checkAt = {}; checks.forEach(k => { checkAt[k.cell] = k; });
  // Rows where only column A holds plain text become full-width note rows.
  const noteRow = new Set();
  if (opts.notes) rows.forEach((row, r) => { const vals = (row || []).map(v => v ?? ''); if (typeof vals[0] === 'string' && vals[0] && !vals[0].startsWith('=') && vals.slice(1).every(v => v === '') && ![...inputs].some(a => parseAddr(a).r === r)) noteRow.add(r); });

  let showF = false;
  let act = { r: firstCell().r, c: firstCell().c }, anchor = { ...act };
  let editing = null;   // { a, input, fromBar }
  let clip = null;      // { cells: raw[][], r, c, cut }
  const undo = [], redo = [];

  function firstCell() { for (const a of inputs) return parseAddr(a); return { r: 0, c: 0 }; }

  const colW = c => (opts.cols || {})[colName(c)] || (c === 0 ? 120 : 96);
  const tableW = 44 + Array.from({ length: nC }, (_, c) => colW(c)).reduce((a, b) => a + b, 0);
  host.innerHTML = `
  <div class="sheet" data-sheet>
    <div class="sheet-tools" role="toolbar" aria-label="Workbook tools">
      <button type="button" class="sbtn" data-s="undo" title="Undo (Ctrl+Z)" aria-label="Undo">${icon('undo')}</button>
      <button type="button" class="sbtn" data-s="redo" title="Redo (Ctrl+Y)" aria-label="Redo">${icon('redo')}</button>
      <span class="sdiv"></span>
      <button type="button" class="sbtn" data-s="filldown" title="Fill down (Ctrl+D): copy the top row of the selection into the rows below">Fill ↓</button>
      <button type="button" class="sbtn" data-s="fillright" title="Fill right (Ctrl+R): copy the left column of the selection into the columns to its right">Fill →</button>
      <span class="sdiv"></span>
      <button type="button" class="sbtn" data-s="formulas" aria-pressed="false" title="Show formulas instead of values (Ctrl+\`)">${icon('sigma')} Formulas</button>
      <span class="sheet-extra">${opts.toolbarExtra || ''}</span>
    </div>
    <div class="sheet-bar">
      <span class="sheet-name" aria-live="polite"></span>
      <span class="sheet-fxl" aria-hidden="true"><i>fx</i></span>
      <input class="sheet-fx" type="text" spellcheck="false" autocomplete="off" aria-label="Formula bar: contents of the selected cell">
    </div>
    <div class="sheet-scroll" tabindex="0" role="grid" aria-label="${esc(opts.label || 'Workbook')}" aria-rowcount="${nR}" aria-colcount="${nC}">
      <div class="sheet-inner">
        <table class="sheet-grid" style="width:${tableW}px">
          <colgroup><col class="rh">${Array.from({ length: nC }, (_, c) => `<col style="width:${colW(c)}px">`).join('')}</colgroup>
          <thead><tr><th class="corner"></th>${Array.from({ length: nC }, (_, c) => `<th scope="col" data-col="${c}">${colName(c)}</th>`).join('')}</tr></thead>
          <tbody>${Array.from({ length: nR }, (_, r) => `<tr><th scope="row" data-row="${r}">${r + 1}</th>${noteRow.has(r)
            ? `<td data-a="${addr(r, 0)}" colspan="${nC}" class="note"></td>`
            : Array.from({ length: nC }, (_, c) => `<td data-a="${addr(r, c)}"></td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <div class="sheet-handle" aria-hidden="true"></div>
      </div>
    </div>
    <div class="sheet-status"><span class="sheet-msg"></span><span class="sheet-agg"></span></div>
    ${checks.length ? `<div class="sheet-checks" aria-live="polite"></div>` : ''}
  </div>`;

  const root = host.querySelector('[data-sheet]');
  const scroll = root.querySelector('.sheet-scroll'), inner = root.querySelector('.sheet-inner');
  const fx = root.querySelector('.sheet-fx'), nameBox = root.querySelector('.sheet-name');
  const msg = root.querySelector('.sheet-msg'), agg = root.querySelector('.sheet-agg');
  const handle = root.querySelector('.sheet-handle'), chkBox = root.querySelector('.sheet-checks');
  const tdMap = {}; root.querySelectorAll('td[data-a]').forEach(td => { tdMap[td.dataset.a] = td; });
  const td = (r, c) => tdMap[addr(r, noteRow.has(r) ? 0 : c)];

  /* ---------- painting ---------- */
  function paintCell(a) {
    const el = tdMap[a]; if (!el) return;
    const raw = wb.raw[a]; const isF = typeof raw === 'string' && raw.startsWith('=') && raw.length > 1;
    const v = wb.value(a);
    el.textContent = showF && isF ? raw : formatValue(v, fmtOf[a]);
    el.className = [noteRow.has(+a.match(/\d+/)[0] - 1) ? 'note' : '', typeof v === 'number' && !(showF && isF) ? 'num' : '', isErr(v) ? 'err' : '', isF ? 'fml' : '',
      inputs.has(a) ? 'inp' : '', a in over ? 'mod' : '', checkAt[a] && raw != null && raw !== '' ? (checkOk(v, checkAt[a]) ? 'chk-ok' : 'chk-no') : ''].filter(Boolean).join(' ');
    if (isErr(v)) el.title = v.msg || errHelp(v.err); else if (typeof v === 'string' && v.length > 14 && !noteRow.has(+a.match(/\d+/)[0] - 1)) el.title = v; else if (el.title) el.removeAttribute('title');
  }
  function paintAll() { Object.keys(tdMap).forEach(paintCell); paintSel(); paintChecks(); }
  function selRect() { return { r0: Math.min(act.r, anchor.r), r1: Math.max(act.r, anchor.r), c0: Math.min(act.c, anchor.c), c1: Math.max(act.c, anchor.c) }; }
  function paintSel() {
    root.querySelectorAll('.sel,.act,.prec').forEach(e => e.classList.remove('sel', 'act', 'prec'));
    root.querySelectorAll('th.hl').forEach(e => e.classList.remove('hl'));
    const R = selRect();
    for (let r = R.r0; r <= R.r1; r++) for (let c = R.c0; c <= R.c1; c++) td(r, c)?.classList.add('sel');
    const a = addr(act.r, noteRow.has(act.r) ? 0 : act.c);
    const cur = tdMap[a]; cur?.classList.add('act');
    for (let c = R.c0; c <= R.c1; c++) root.querySelector(`th[data-col="${c}"]`)?.classList.add('hl');
    for (let r = R.r0; r <= R.r1; r++) root.querySelector(`th[data-row="${r}"]`)?.classList.add('hl');
    if (wb.isFormula(a)) references(wb.raw[a]).flatMap(expandRange).forEach(x => tdMap[x]?.classList.add('prec'));
    nameBox.textContent = (R.r0 !== R.r1 || R.c0 !== R.c1) ? `${addr(R.r0, R.c0)}:${addr(R.r1, R.c1)}` : a;
    if (!editing || !editing.fromBar) fx.value = rawText(a);
    const v = wb.value(a);
    msg.textContent = isErr(v) ? `${v.err}  ${v.msg || errHelp(v.err)}` : inputs.has(a) ? 'Input cell: type your value or formula here.' : '';
    msg.classList.toggle('bad', isErr(v));
    // Excel-style status: sum / average / count of the numeric cells in the selection
    if (R.r0 !== R.r1 || R.c0 !== R.c1) {
      const vs = []; for (let r = R.r0; r <= R.r1; r++) for (let c = R.c0; c <= R.c1; c++) { const x = wb.value(addr(r, c)); if (typeof x === 'number') vs.push(x); }
      agg.textContent = vs.length ? `Sum ${formatValue(vs.reduce((s, x) => s + x, 0))}   Average ${formatValue(vs.reduce((s, x) => s + x, 0) / vs.length)}   Count ${vs.length}` : '';
    } else agg.textContent = '';
    placeHandle();
  }
  function placeHandle() {
    const R = selRect(), last = td(R.r1, R.c1);
    if (!last || editing) { handle.hidden = true; return; }
    handle.hidden = false; handle.style.left = (last.offsetLeft + last.offsetWidth - 4) + 'px'; handle.style.top = (last.offsetTop + last.offsetHeight - 4) + 'px';
  }
  function paintChecks() {
    if (!chkBox) return;
    const ok = checks.filter(k => checkOk(wb.value(k.cell), k)).length;
    chkBox.innerHTML = `<span class="small"><b>${ok} of ${checks.length}</b> checks pass</span>` + checks.map(k => {
      const v = wb.value(k.cell), filled = wb.raw[k.cell] != null && wb.raw[k.cell] !== '', good = checkOk(v, k);
      return `<button type="button" class="schk ${good ? 'ok' : filled ? 'no' : ''}" data-goto="${k.cell}" title="${esc(k.label)}">${good ? '✓' : filled ? '✗' : '○'} ${esc(k.cell)} <span>${esc(k.label)}</span></button>`;
    }).join('');
  }
  const rawText = a => { const v = wb.raw[a]; return v == null ? '' : String(v); };
  function errHelp(e) {
    return { '#DIV/0!': 'Division by zero, or by an empty cell.', '#VALUE!': 'A value has the wrong type, for example text where a number is needed.', '#REF!': 'The formula points outside the sheet.', '#NAME?': 'Unknown function or name. Check the spelling.', '#N/A': 'The lookup value was not found.', '#NUM!': 'The calculation has no valid numeric result.', '#CIRC!': 'Circular reference: the formula depends on its own cell.', '#ERROR!': 'The formula could not be read. Check brackets and commas.' }[e] || '';
  }

  /* ---------- writes (with undo) ---------- */
  function write(changes, record = true) {
    const batch = [];
    Object.entries(changes).forEach(([a, v]) => {
      const cur = a in over ? over[a] : (base[a] ?? ''); const val = v == null ? '' : v;
      if (String(cur) === String(val)) return;
      batch.push({ a, before: a in over ? { v: over[a] } : null, after: null });
      if (String(val) === String(base[a] ?? '')) delete over[a]; else over[a] = val;
      batch[batch.length - 1].after = a in over ? { v: over[a] } : null;
      wb.setRaw(a, val);
    });
    if (!batch.length) return;
    wb.cache = {};
    if (record) { undo.push(batch); if (undo.length > 200) undo.shift(); redo.length = 0; }
    paintAll(); opts.onChange && opts.onChange(over);
  }
  function applyHist(from, to, useAfter) {
    const batch = from.pop(); if (!batch) return;
    batch.forEach(({ a, before, after }) => { const s = useAfter ? after : before; if (s) over[a] = s.v; else delete over[a]; wb.setRaw(a, s ? s.v : (base[a] ?? '')); });
    wb.cache = {}; to.push(batch); paintAll(); opts.onChange && opts.onChange(over);
  }

  /* ---------- selection ---------- */
  function select(r, c, extend = false) {
    r = Math.max(0, Math.min(nR - 1, r)); c = Math.max(0, Math.min(nC - 1, c));
    if (noteRow.has(r)) c = 0;
    act = { r, c }; if (!extend) anchor = { r, c };
    paintSel(); td(r, c)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /* ---------- editing ---------- */
  function startEdit(initial, caretEnd = true) {
    if (editing) return;
    const a = addr(act.r, noteRow.has(act.r) ? 0 : act.c), cell = tdMap[a]; if (!cell) return;
    const input = document.createElement('input');
    input.className = 'sheet-edit'; input.type = 'text'; input.spellcheck = false; input.autocomplete = 'off';
    input.setAttribute('aria-label', `Edit cell ${a}`);
    input.value = initial != null ? initial : rawText(a);
    Object.assign(input.style, { left: cell.offsetLeft + 'px', top: cell.offsetTop + 'px', minWidth: cell.offsetWidth + 'px', height: cell.offsetHeight + 'px' });
    inner.appendChild(input); editing = { a, input, fromBar: false }; handle.hidden = true;
    input.focus(); if (caretEnd) input.setSelectionRange(input.value.length, input.value.length);
    input.addEventListener('input', () => { fx.value = input.value; });
    input.addEventListener('keydown', editKey);
    input.addEventListener('blur', () => { setTimeout(() => { if (editing && editing.input === input && document.activeElement !== input && !pointing) commit(); }, 0); });
    fx.value = input.value;
  }
  function commit(move) {
    if (!editing) return;
    const { a, input, fromBar } = editing; const val = fromBar ? fx.value : input.value;
    if (input) input.remove(); editing = null;
    write({ [a]: autoClose(val) });
    if (move) select(act.r + move[0], act.c + move[1]); else paintSel();
    scroll.focus({ preventScroll: true });
  }
  function cancel() { if (!editing) return; editing.input?.remove(); editing = null; paintSel(); scroll.focus({ preventScroll: true }); }
  const autoClose = v => { if (typeof v !== 'string' || !v.startsWith('=')) return v; const open = (v.match(/\(/g) || []).length - (v.match(/\)/g) || []).length; return open > 0 ? v + ')'.repeat(open) : v; };
  function editKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); commit([e.shiftKey ? -1 : 1, 0]); }
    else if (e.key === 'Tab') { e.preventDefault(); commit([0, e.shiftKey ? -1 : 1]); }
    else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    else if (!editing.fromBar && ['ArrowUp', 'ArrowDown'].includes(e.key) && !isFormulaInProgress(editing.input)) { e.preventDefault(); commit([e.key === 'ArrowUp' ? -1 : 1, 0]); }
  }
  const isFormulaInProgress = inp => inp && inp.value.startsWith('=');
  // Point mode: clicking a cell while typing a formula inserts its reference.
  let pointing = null;
  function canPoint() {
    if (!editing) return false; const inp = editing.fromBar ? fx : editing.input; if (!inp.value.startsWith('=')) return false;
    const before = inp.value.slice(0, inp.selectionStart).trimEnd(); return /[=(,+\-*/^&<>:]$/.test(before) || (pointing && pointing.inp === inp);
  }
  function pointAt(a, extendFrom) {
    const inp = editing.fromBar ? fx : editing.input;
    if (!pointing) { pointing = { inp, start: inp.selectionStart, end: inp.selectionStart, from: a }; }
    const text = extendFrom && extendFrom !== a ? `${extendFrom}:${a}` : a;
    inp.value = inp.value.slice(0, pointing.start) + text + inp.value.slice(pointing.end);
    pointing.end = pointing.start + text.length; inp.setSelectionRange(pointing.end, pointing.end);
    if (!editing.fromBar) fx.value = inp.value; else if (editing.input) editing.input.value = inp.value;
  }

  /* ---------- clipboard & fill ---------- */
  function rectRaw(R) { const out = []; for (let r = R.r0; r <= R.r1; r++) { const row = []; for (let c = R.c0; c <= R.c1; c++) row.push(rawText(addr(r, c))); out.push(row); } return out; }
  function copy(cut) {
    const R = selRect(); clip = { cells: rectRaw(R), r: R.r0, c: R.c0, cut, text: '' };
    clip.text = Array.from({ length: R.r1 - R.r0 + 1 }, (_, i) => Array.from({ length: R.c1 - R.c0 + 1 }, (_, j) => formatValue(wb.value(addr(R.r0 + i, R.c0 + j)))).join('\t')).join('\n');
    return clip.text;
  }
  function paste(text) {
    const R = selRect(); const ch = {};
    if (clip && (text == null || text === clip.text)) {
      const h = clip.cells.length, w = clip.cells[0].length;
      const rh = Math.max(h, (R.r1 - R.r0 + 1) - ((R.r1 - R.r0 + 1) % h)), rw = Math.max(w, (R.c1 - R.c0 + 1) - ((R.c1 - R.c0 + 1) % w));
      for (let i = 0; i < rh; i++) for (let j = 0; j < rw; j++) {
        const r = R.r0 + i, c = R.c0 + j; if (r >= nR || c >= nC) continue;
        const src = clip.cells[i % h][j % w];
        ch[addr(r, c)] = clip.cut ? src : shiftFormula(src, r - (clip.r + (i % h)), c - (clip.c + (j % w)));
      }
      if (clip.cut) { for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) { const a = addr(clip.r + i, clip.c + j); if (!(a in ch)) ch[a] = ''; } clip = null; }
    } else if (text != null) {
      text.replace(/\r/g, '').replace(/\n$/, '').split('\n').forEach((line, i) => line.split('\t').forEach((v, j) => { const r = R.r0 + i, c = R.c0 + j; if (r < nR && c < nC) ch[addr(r, c)] = v; }));
    }
    write(ch);
  }
  function fill(dir, R = selRect(), src = null) {
    const ch = {};
    if (dir === 'down') { const s = src ?? R.r0; for (let c = R.c0; c <= R.c1; c++) { const raw = rawText(addr(s, c)); for (let r = s + 1; r <= R.r1; r++) ch[addr(r, c)] = shiftFormula(raw, r - s, 0); } }
    if (dir === 'right') { const s = src ?? R.c0; for (let r = R.r0; r <= R.r1; r++) { const raw = rawText(addr(r, s)); for (let c = s + 1; c <= R.c1; c++) ch[addr(r, c)] = shiftFormula(raw, 0, c - s); } }
    write(ch);
  }
  function clearSel() { const R = selRect(), ch = {}; for (let r = R.r0; r <= R.r1; r++) for (let c = R.c0; c <= R.c1; c++) ch[addr(r, c)] = ''; write(ch); }

  /* ---------- events ---------- */
  function cellFromEvent(e) { const t = e.target.closest && e.target.closest('td[data-a]'); return t && root.contains(t) ? parseAddr(t.dataset.a) : null; }
  let dragging = null;
  function onDown(e) {
    if (e.button !== 0) return;
    if (e.target === handle) { e.preventDefault(); dragging = { fill: true, R: selRect(), to: null }; return; }
    const hd = e.target.closest('th[data-col],th[data-row]');
    if (hd && !editing) { e.preventDefault(); if (hd.dataset.col != null) { anchor = { r: 0, c: +hd.dataset.col }; act = { r: nR - 1, c: +hd.dataset.col }; } else { anchor = { r: +hd.dataset.row, c: 0 }; act = { r: +hd.dataset.row, c: nC - 1 }; } paintSel(); scroll.focus({ preventScroll: true }); return; }
    const p = cellFromEvent(e); if (!p) return;
    if (editing && canPoint()) { e.preventDefault(); const a = addr(p.r, p.c); pointAt(a); dragging = { point: a }; return; }
    if (editing) commit();
    e.preventDefault(); scroll.focus({ preventScroll: true });
    select(p.r, p.c, e.shiftKey); dragging = { sel: true };
  }
  function onMove(e) {
    if (!dragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY); const t = el && el.closest && el.closest('td[data-a]'); if (!t || !root.contains(t)) return;
    const p = parseAddr(t.dataset.a);
    if (dragging.sel) { act = { r: p.r, c: noteRow.has(p.r) ? act.c : p.c }; paintSel(); }
    else if (dragging.point) pointAt(t.dataset.a, dragging.point);
    else if (dragging.fill) {
      const R = dragging.R; dragging.to = p;
      root.querySelectorAll('.fillprev').forEach(x => x.classList.remove('fillprev'));
      const down = p.r - R.r1, right = p.c - R.c1;
      if (down > 0 && down >= right) for (let r = R.r1 + 1; r <= p.r; r++) for (let c = R.c0; c <= R.c1; c++) td(r, c)?.classList.add('fillprev');
      else if (right > 0) for (let c = R.c1 + 1; c <= p.c; c++) for (let r = R.r0; r <= R.r1; r++) td(r, c)?.classList.add('fillprev');
    }
  }
  function onUp() {
    if (!dragging) return; const d = dragging; dragging = null;
    if (d.point) { pointing = null; return; }
    if (d.fill && d.to) {
      root.querySelectorAll('.fillprev').forEach(x => x.classList.remove('fillprev'));
      const R = d.R, p = d.to, down = p.r - R.r1, right = p.c - R.c1;
      if (down > 0 && down >= right) { fillPattern('down', R, p.r); anchor = { r: R.r0, c: R.c0 }; act = { r: p.r, c: R.c1 }; }
      else if (right > 0) { fillPattern('right', R, p.c); anchor = { r: R.r0, c: R.c0 }; act = { r: R.r1, c: p.c }; }
      paintSel();
    }
  }
  // Fill handle: repeat the selected block (shifting relative references), like Excel's copy-fill.
  function fillPattern(dir, R, end) {
    const ch = {}, h = R.r1 - R.r0 + 1, w = R.c1 - R.c0 + 1;
    if (dir === 'down') for (let r = R.r1 + 1; r <= end; r++) for (let c = R.c0; c <= R.c1; c++) { const sr = R.r0 + ((r - R.r0) % h); ch[addr(r, c)] = shiftFormula(rawText(addr(sr, c)), r - sr, 0); }
    else for (let c = R.c1 + 1; c <= end; c++) for (let r = R.r0; r <= R.r1; r++) { const sc = R.c0 + ((c - R.c0) % w); ch[addr(r, c)] = shiftFormula(rawText(addr(r, sc)), 0, c - sc); }
    write(ch);
  }
  function onDbl(e) { const p = cellFromEvent(e); if (!p || editing) return; select(p.r, p.c); startEdit(null); }
  function onKey(e) {
    if (editing || e.target !== scroll) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[k]) { e.preventDefault(); const [dr, dc] = moves[k]; if (mod) { select(dr ? (dr < 0 ? 0 : nR - 1) : act.r, dc ? (dc < 0 ? 0 : nC - 1) : act.c, e.shiftKey); } else select(act.r + dr, act.c + dc, e.shiftKey); return; }
    if (k === 'Enter') { e.preventDefault(); select(act.r + (e.shiftKey ? -1 : 1), act.c); return; }
    if (k === 'Tab') { e.preventDefault(); select(act.r, act.c + (e.shiftKey ? -1 : 1)); return; }
    if (k === 'F2') { e.preventDefault(); startEdit(null); return; }
    if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); clearSel(); return; }
    if (k === 'Home') { e.preventDefault(); select(mod ? 0 : act.r, 0); return; }
    if (mod && (k === 'z' || k === 'Z')) { e.preventDefault(); e.shiftKey ? applyHist(redo, undo, true) : applyHist(undo, redo, false); return; }
    if (mod && (k === 'y' || k === 'Y')) { e.preventDefault(); applyHist(redo, undo, true); return; }
    if (mod && (k === 'd' || k === 'D')) { e.preventDefault(); fill('down'); return; }
    if (mod && (k === 'r' || k === 'R')) { e.preventDefault(); fill('right'); return; }
    if (mod && (k === 'a' || k === 'A')) { e.preventDefault(); anchor = { r: 0, c: 0 }; act = { r: nR - 1, c: nC - 1 }; paintSel(); return; }
    if (mod && k === '`') { e.preventDefault(); toggleFormulas(); return; }
    if (!mod && !e.altKey && k.length === 1) { e.preventDefault(); startEdit(k); }
  }
  function onCopy(e) { if (editing) return; e.preventDefault(); e.clipboardData.setData('text/plain', copy(false)); }
  function onCut(e) { if (editing) return; e.preventDefault(); e.clipboardData.setData('text/plain', copy(true)); }
  function onPaste(e) { if (editing) return; e.preventDefault(); paste(e.clipboardData.getData('text/plain')); }
  function toggleFormulas() { showF = !showF; root.querySelector('[data-s="formulas"]').setAttribute('aria-pressed', showF); root.classList.toggle('show-f', showF); paintAll(); }
  function onTool(e) {
    const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.dataset.goto) { const p = parseAddr(b.dataset.goto); select(p.r, p.c); scroll.focus({ preventScroll: true }); return; }
    const s = b.dataset.s; if (!s) return;
    if (editing) commit();
    if (s === 'undo') applyHist(undo, redo, false); if (s === 'redo') applyHist(redo, undo, true);
    if (s === 'filldown') { const R = selRect(); if (R.r0 === R.r1) toast('Select a range first: the top row is copied into the rows below it.'); else fill('down'); }
    if (s === 'fillright') { const R = selRect(); if (R.c0 === R.c1) toast('Select a range first: the left column is copied into the columns to its right.'); else fill('right'); }
    if (s === 'formulas') toggleFormulas();
    scroll.focus({ preventScroll: true });
  }
  // Formula bar
  fx.addEventListener('focus', () => {
    if (editing && !editing.fromBar) return;
    if (!editing) { editing = { a: addr(act.r, noteRow.has(act.r) ? 0 : act.c), input: null, fromBar: true }; handle.hidden = true; }
  });
  fx.addEventListener('keydown', e => { if (!editing) return; if (editing.fromBar || e.key === 'Escape' || e.key === 'Enter' || e.key === 'Tab') editKey(e); });
  fx.addEventListener('input', () => { if (editing && editing.input) editing.input.value = fx.value; });
  fx.addEventListener('blur', () => { setTimeout(() => { if (editing && editing.fromBar && document.activeElement !== fx && !pointing && !dragging) commit(); }, 0); });

  scroll.addEventListener('mousedown', onDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  scroll.addEventListener('dblclick', onDbl);
  scroll.addEventListener('keydown', onKey);
  scroll.addEventListener('copy', onCopy); scroll.addEventListener('cut', onCut); scroll.addEventListener('paste', onPaste);
  root.addEventListener('click', onTool);
  // Touch: tap selects; tapping the selected cell again opens the editor.
  scroll.addEventListener('touchend', e => {
    const p = cellFromEvent(e); if (!p || editing) return;
    if (p.r === act.r && p.c === act.c) { e.preventDefault(); startEdit(null); }
  });

  paintAll();
  { const first = td(act.r, act.c); if (first && act.r > 3) scroll.scrollTop = Math.max(0, first.offsetTop - 80); }
  return {
    wb, root, over,
    select: a => { const p = parseAddr(a); if (p) select(p.r, p.c); },
    focus: () => scroll.focus({ preventScroll: true }),
    setCells(map) { write(map); },
    reset() { const ch = {}; Object.keys(over).forEach(a => { ch[a] = base[a] ?? ''; }); write(ch); },
    rows: () => rowsOf(wb, nR, nC),
    refresh: paintAll,
    destroy() {
      document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp);
      host.innerHTML = '';
    },
    functions: FUNCTIONS,
  };
}
