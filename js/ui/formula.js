// A small spreadsheet formula engine (Excel-compatible subset). No dependencies.
// Used by the in-app workbook (js/ui/sheet.js) in cases and in the Excel skills lessons.
//
//   const wb = new Workbook({ A1: 5, A2: '=A1*2' });
//   wb.value('A2')            // 10
//   wb.set('A1', '7');        // raw text, exactly as typed
//   shiftFormula('=A1+$B$2', 1, 0)  // '=A2+$B$2'  (copy one row down)
//
// Values are numbers, strings, booleans, or error objects { err: '#DIV/0!' }.

/* ---------------- references ---------------- */
export const colNum = s => { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
export const colName = i => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
export const addr = (r, c) => colName(c) + (r + 1);
export function parseAddr(a) {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(String(a).trim()); if (!m) return null;
  return { r: +m[2] - 1, c: colNum(m[1]) };
}
/** Expand "A1:C3" (or a single address) into a list of addresses. */
export function expandRange(rng) {
  const [a, b] = String(rng).split(':'); const p = parseAddr(a), q = parseAddr(b || a); if (!p || !q) return [];
  const out = [];
  for (let r = Math.min(p.r, q.r); r <= Math.max(p.r, q.r); r++) for (let c = Math.min(p.c, q.c); c <= Math.max(p.c, q.c); c++) out.push(addr(r, c));
  return out;
}

/* ---------------- errors ---------------- */
const E = code => ({ err: code });
export const isErr = v => v != null && typeof v === 'object' && 'err' in v;
const ERR = { DIV: E('#DIV/0!'), VAL: E('#VALUE!'), REF: E('#REF!'), NAME: E('#NAME?'), NA: E('#N/A'), NUM: E('#NUM!'), CIRC: E('#CIRC!') };
class FErr extends Error { constructor(v) { super(v.err); this.v = v; } }
const raise = v => { throw new FErr(v); };

/* ---------------- tokenizer ---------------- */
const RE_TOKEN = /\s*(?:("(?:[^"]|"")*")|(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)(?![A-Za-z0-9_(])|(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_.]*)|(<>|<=|>=|[-+*/^&=<>(),%:;]))/y;
export function tokenize(src) {
  const out = []; RE_TOKEN.lastIndex = 0; let pos = 0;
  while (pos < src.length) {
    if (/^\s*$/.test(src.slice(pos))) break;
    RE_TOKEN.lastIndex = pos; const m = RE_TOKEN.exec(src);
    if (!m) throw new SyntaxError('Unexpected "' + src.slice(pos, pos + 8) + '"');
    const start = m.index + m[0].length - m[0].trimStart().length;
    if (m[1] != null) out.push({ t: 'str', v: m[1].slice(1, -1).replace(/""/g, '"'), s: start, e: RE_TOKEN.lastIndex });
    else if (m[2] != null) out.push({ t: 'ref', v: m[2], s: start, e: RE_TOKEN.lastIndex });
    else if (m[3] != null) out.push({ t: 'num', v: parseFloat(m[3]), s: start, e: RE_TOKEN.lastIndex });
    else if (m[4] != null) out.push({ t: 'name', v: m[4], s: start, e: RE_TOKEN.lastIndex });
    else out.push({ t: 'op', v: m[5] === ';' ? ',' : m[5], s: start, e: RE_TOKEN.lastIndex });
    pos = RE_TOKEN.lastIndex;
  }
  return out;
}

/* ---------------- parser (precedence climbing) ---------------- */
// Excel precedence, low → high: comparison, &, + -, * /, ^, unary -, %.
const BIN = { '=': 1, '<>': 1, '<': 1, '>': 1, '<=': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5 };
export function parse(src) {
  const toks = tokenize(src); let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  const expect = v => { const t = next(); if (!t || t.v !== v) throw new SyntaxError(`Expected "${v}"`); };
  function primary() {
    const t = next(); if (!t) throw new SyntaxError('The formula ends too early');
    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === 'str') return { k: 'str', v: t.v };
    if (t.t === 'ref') return t.v.includes(':') ? { k: 'range', v: t.v.replace(/\$/g, '').toUpperCase() } : { k: 'ref', v: t.v.replace(/\$/g, '').toUpperCase() };
    if (t.t === 'op' && t.v === '(') { const e = expr(0); expect(')'); return e; }
    if (t.t === 'op' && (t.v === '-' || t.v === '+')) { const e = unary(); return t.v === '-' ? { k: 'neg', e } : e; }
    if (t.t === 'name') {
      const up = t.v.toUpperCase();
      if (peek() && peek().v === '(') {
        next(); const args = [];
        if (peek() && peek().v === ')') { next(); return { k: 'fn', name: up, args }; }
        for (;;) {
          if (peek() && (peek().v === ',' || peek().v === ')')) args.push({ k: 'blank' }); else args.push(expr(0));
          const s = next(); if (!s) throw new SyntaxError('Missing ")"'); if (s.v === ')') break; if (s.v !== ',') throw new SyntaxError('Expected "," or ")"');
        }
        return { k: 'fn', name: up, args };
      }
      if (up === 'TRUE') return { k: 'bool', v: true }; if (up === 'FALSE') return { k: 'bool', v: false };
      return { k: 'name', v: up };
    }
    throw new SyntaxError(`Unexpected "${t.v}"`);
  }
  function unary() {
    const t = peek();
    if (t && t.t === 'op' && (t.v === '-' || t.v === '+')) { next(); const e = unary(); return t.v === '-' ? { k: 'neg', e } : e; }
    let e = primary();
    while (peek() && peek().v === '%') { next(); e = { k: 'pct', e }; }
    return e;
  }
  function expr(min) {
    let left = unary();
    for (;;) {
      const t = peek(); if (!t || t.t !== 'op' || !(t.v in BIN)) break;
      const p = BIN[t.v]; if (p < min) break; next();
      const right = expr(t.v === '^' ? p + 1 : p + 1); // left-assoc (Excel's ^ is left-assoc too)
      left = { k: 'bin', op: t.v, a: left, b: right };
    }
    return left;
  }
  const ast = expr(0);
  if (i < toks.length) throw new SyntaxError(`Unexpected "${toks[i].v}"`);
  return ast;
}

/* ---------------- coercion ---------------- */
function toNum(v) {
  if (isErr(v)) raise(v);
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v == null || v === '') return 0;
  const n = Number(String(v).trim().replace(/,/g, '')); if (String(v).trim() !== '' && isFinite(n)) return n;
  raise(ERR.VAL);
}
const toStr = v => { if (isErr(v)) raise(v); if (v == null) return ''; if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'; if (typeof v === 'number') return fmtGeneral(v); return String(v); };
const toBool = v => { if (isErr(v)) raise(v); if (typeof v === 'string') { const u = v.toUpperCase(); if (u === 'TRUE') return true; if (u === 'FALSE') return false; raise(ERR.VAL); } return !!toNum(v); };
const fmtGeneral = n => { if (Number.isInteger(n)) return String(n); return String(+n.toPrecision(12)); };
/** Flatten args (ranges become 2D arrays) into a flat list of cell values. */
const flat = args => { const out = []; args.forEach(a => Array.isArray(a) ? a.forEach(r => Array.isArray(r) ? r.forEach(x => out.push(x)) : out.push(r)) : out.push(a)); return out; };
/** Numbers for SUM-style functions: numbers in ranges only; direct scalars coerced. */
function nums(args, raw) {
  const out = [];
  args.forEach((a, k) => {
    if (Array.isArray(a)) flat([a]).forEach(x => { if (isErr(x)) raise(x); if (typeof x === 'number') out.push(x); });
    else if (raw[k] && raw[k].k === 'blank') { /* skip */ }
    else out.push(toNum(a));
  });
  return out;
}
const as2d = v => Array.isArray(v) ? v : [[v]];

/* criteria for COUNTIF / SUMIF */
function criteria(c) {
  if (typeof c === 'number') return x => typeof x === 'number' ? x === c : String(x).trim() !== '' && Number(x) === c;
  const s = String(c ?? ''); const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(s); const op = m[1] || '='; const rhs = m[2];
  const n = Number(rhs); const isN = rhs.trim() !== '' && isFinite(n);
  if (isN) return x => { if (x === '' || x == null) return op === '<>'; const v = typeof x === 'number' ? x : Number(x); if (!isFinite(v) || (typeof x === 'string' && x.trim() === '')) return op === '<>'; return op === '=' ? v === n : op === '<>' ? v !== n : op === '<' ? v < n : op === '>' ? v > n : op === '<=' ? v <= n : v >= n; };
  const re = new RegExp('^' + rhs.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
  if (op === '=') return x => rhs === '' ? (x == null || x === '') : re.test(toStrSafe(x));
  if (op === '<>') return x => rhs === '' ? !(x == null || x === '') : !re.test(toStrSafe(x));
  return x => { const a = toStrSafe(x).toLowerCase(), b = rhs.toLowerCase(); return op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b; };
}
const toStrSafe = x => isErr(x) ? x.err : x == null ? '' : typeof x === 'number' ? fmtGeneral(x) : String(x);

/* ---------------- functions ---------------- */
function lookupEq(a, b) { if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b) && String(a).trim() !== '' && String(b).trim() !== ''; return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase(); }
function approxIdx(list, x) { let best = -1; for (let k = 0; k < list.length; k++) { const v = list[k]; if (v === '' || v == null) continue; if ((typeof x === 'number' ? Number(v) : String(v).toLowerCase()) <= (typeof x === 'number' ? x : String(x).toLowerCase())) best = k; else break; } return best; }
function pmt(r, n, pv, fv = 0, type = 0) { if (n === 0) raise(ERR.NUM); if (r === 0) return -(pv + fv) / n; const f = Math.pow(1 + r, n); return -(r * (pv * f + fv)) / ((1 + r * type) * (f - 1)); }
function pvF(r, n, p, fv = 0, type = 0) { if (r === 0) return -(fv + p * n); const f = Math.pow(1 + r, n); return -(fv + p * (1 + r * type) * (f - 1) / r) / f; }
function fvF(r, n, p, pv = 0, type = 0) { if (r === 0) return -(pv + p * n); const f = Math.pow(1 + r, n); return -(pv * f + p * (1 + r * type) * (f - 1) / r); }
function solve(f, guess) {
  let x = guess;
  for (let k = 0; k < 100; k++) { const y = f(x), h = 1e-6 * Math.max(1, Math.abs(x)), d = (f(x + h) - y) / h; if (!isFinite(y) || !isFinite(d) || d === 0) break; const nx = x - y / d; if (Math.abs(nx - x) < 1e-12) return nx; x = nx; if (x <= -1) x = -0.999; }
  if (Math.abs(f(x)) < 1e-7) return x;
  raise(ERR.NUM);
}
function logest(ys, xs) {
  const y = ys.map(v => { if (v <= 0) raise(ERR.NUM); return Math.log(v); }); const x = xs || y.map((_, i) => i + 1);
  if (x.length !== y.length || y.length < 2) raise(ERR.VAL);
  const n = y.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; }
  return Math.exp(sxy / sxx);
}

// Each function gets (args, raw ast args, ctx). Lazy functions (IF, IFERROR, AND, OR) get unevaluated nodes.
const LAZY = new Set(['IF', 'IFERROR', 'IFNA', 'IFS']);
const F = {
  SUM: (a, r) => nums(a, r).reduce((s, x) => s + x, 0),
  PRODUCT: (a, r) => nums(a, r).reduce((s, x) => s * x, 1),
  AVERAGE: (a, r) => { const v = nums(a, r); if (!v.length) raise(ERR.DIV); return v.reduce((s, x) => s + x, 0) / v.length; },
  MIN: (a, r) => { const v = nums(a, r); return v.length ? Math.min(...v) : 0; },
  MAX: (a, r) => { const v = nums(a, r); return v.length ? Math.max(...v) : 0; },
  COUNT: a => flat(a).filter(x => typeof x === 'number').length,
  COUNTA: a => flat(a).filter(x => x !== '' && x != null).length,
  COUNTBLANK: a => flat(a).filter(x => x === '' || x == null).length,
  SUMPRODUCT: a => { const m = a.map(x => flat([as2d(x)])); const n = m[0].length; if (m.some(x => x.length !== n)) raise(ERR.VAL); let s = 0; for (let i = 0; i < n; i++) s += m.reduce((p, col) => p * (typeof col[i] === 'number' ? col[i] : isErr(col[i]) ? raise(col[i]) : 0), 1); return s; },
  COUNTIF: a => { const f = criteria(a[1]); return flat([as2d(a[0])]).filter(f).length; },
  COUNTIFS: a => { const rs = []; for (let k = 0; k < a.length; k += 2) rs.push([flat([as2d(a[k])]), criteria(a[k + 1])]); const n = rs[0][0].length; let c = 0; for (let i = 0; i < n; i++) if (rs.every(([v, f]) => f(v[i]))) c++; return c; },
  SUMIF: a => { const r = flat([as2d(a[0])]), f = criteria(a[1]), s = a.length > 2 ? flat([as2d(a[2])]) : r; let t = 0; r.forEach((x, i) => { if (f(x) && typeof s[i] === 'number') t += s[i]; }); return t; },
  SUMIFS: a => { const s = flat([as2d(a[0])]); const rs = []; for (let k = 1; k < a.length; k += 2) rs.push([flat([as2d(a[k])]), criteria(a[k + 1])]); let t = 0; s.forEach((x, i) => { if (typeof x === 'number' && rs.every(([v, f]) => f(v[i]))) t += x; }); return t; },
  AVERAGEIF: a => { const r = flat([as2d(a[0])]), f = criteria(a[1]), s = a.length > 2 ? flat([as2d(a[2])]) : r; let t = 0, n = 0; r.forEach((x, i) => { if (f(x) && typeof s[i] === 'number') { t += s[i]; n++; } }); if (!n) raise(ERR.DIV); return t / n; },
  AVERAGEIFS: a => { const s = flat([as2d(a[0])]); const rs = []; for (let k = 1; k < a.length; k += 2) rs.push([flat([as2d(a[k])]), criteria(a[k + 1])]); let t = 0, n = 0; s.forEach((x, i) => { if (typeof x === 'number' && rs.every(([v, f]) => f(v[i]))) { t += x; n++; } }); if (!n) raise(ERR.DIV); return t / n; },
  ROUND: a => { const d = toNum(a[1] ?? 0), m = Math.pow(10, d); const x = toNum(a[0]); return Math.sign(x) * Math.round(Math.abs(x) * m + 1e-9) / m; },
  ROUNDUP: a => { const m = Math.pow(10, toNum(a[1] ?? 0)), x = toNum(a[0]); return Math.sign(x) * Math.ceil(Math.abs(x) * m - 1e-9) / m; },
  ROUNDDOWN: a => { const m = Math.pow(10, toNum(a[1] ?? 0)), x = toNum(a[0]); return Math.sign(x) * Math.floor(Math.abs(x) * m + 1e-9) / m; },
  INT: a => Math.floor(toNum(a[0])),
  MOD: a => { const n = toNum(a[0]), d = toNum(a[1]); if (d === 0) raise(ERR.DIV); return n - d * Math.floor(n / d); },
  ABS: a => Math.abs(toNum(a[0])),
  SQRT: a => { const x = toNum(a[0]); if (x < 0) raise(ERR.NUM); return Math.sqrt(x); },
  EXP: a => Math.exp(toNum(a[0])),
  LN: a => { const x = toNum(a[0]); if (x <= 0) raise(ERR.NUM); return Math.log(x); },
  LOG: a => { const x = toNum(a[0]), b = a.length > 1 ? toNum(a[1]) : 10; if (x <= 0 || b <= 0) raise(ERR.NUM); return Math.log(x) / Math.log(b); },
  LOG10: a => { const x = toNum(a[0]); if (x <= 0) raise(ERR.NUM); return Math.log10(x); },
  POWER: a => Math.pow(toNum(a[0]), toNum(a[1])),
  PI: () => Math.PI,
  FACT: a => { let n = Math.floor(toNum(a[0])), p = 1; if (n < 0) raise(ERR.NUM); while (n > 1) p *= n--; return p; },
  COMBIN: a => { const n = Math.floor(toNum(a[0])), k = Math.floor(toNum(a[1])); if (k < 0 || k > n) raise(ERR.NUM); let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return Math.round(c); },
  AND: a => flat(a).filter(x => x !== '' && x != null).every(toBool),
  OR: a => flat(a).filter(x => x !== '' && x != null).some(toBool),
  NOT: a => !toBool(a[0]),
  ISBLANK: a => a[0] === '' || a[0] == null,
  ISNUMBER: a => typeof a[0] === 'number',
  ISERROR: a => isErr(a[0]),
  CONCAT: a => flat(a).map(toStr).join(''),
  CONCATENATE: a => flat(a).map(toStr).join(''),
  LEN: a => toStr(a[0]).length,
  LEFT: a => toStr(a[0]).slice(0, a.length > 1 ? toNum(a[1]) : 1),
  RIGHT: a => { const s = toStr(a[0]), n = a.length > 1 ? toNum(a[1]) : 1; return n ? s.slice(-n) : ''; },
  MID: a => toStr(a[0]).substr(toNum(a[1]) - 1, toNum(a[2])),
  UPPER: a => toStr(a[0]).toUpperCase(),
  LOWER: a => toStr(a[0]).toLowerCase(),
  TRIM: a => toStr(a[0]).trim().replace(/\s+/g, ' '),
  VLOOKUP: a => {
    const tbl = as2d(a[1]), col = toNum(a[2]), approx = a.length > 3 ? toBool(a[3]) : true;
    if (col < 1 || col > tbl[0].length) raise(ERR.REF);
    const keys = tbl.map(r => r[0]); const i = approx ? approxIdx(keys, a[0]) : keys.findIndex(k => lookupEq(k, a[0]));
    if (i < 0) raise(ERR.NA); return tbl[i][col - 1];
  },
  HLOOKUP: a => {
    const tbl = as2d(a[1]), row = toNum(a[2]), approx = a.length > 3 ? toBool(a[3]) : true;
    if (row < 1 || row > tbl.length) raise(ERR.REF);
    const keys = tbl[0]; const i = approx ? approxIdx(keys, a[0]) : keys.findIndex(k => lookupEq(k, a[0]));
    if (i < 0) raise(ERR.NA); return tbl[row - 1][i];
  },
  MATCH: a => {
    const list = flat([as2d(a[1])]), type = a.length > 2 ? toNum(a[2]) : 1;
    const i = type === 0 ? list.findIndex(k => lookupEq(k, a[0])) : approxIdx(list, a[0]);
    if (i < 0) raise(ERR.NA); return i + 1;
  },
  INDEX: a => {
    const tbl = as2d(a[0]); let r = toNum(a[1] ?? 0), c = a.length > 2 ? toNum(a[2]) : 0;
    if (tbl.length === 1 && a.length === 2) { c = r; r = 1; }
    if (!c) c = 1; if (!r) r = 1;
    if (r < 1 || r > tbl.length || c < 1 || c > tbl[0].length) raise(ERR.REF); return tbl[r - 1][c - 1];
  },
  XLOOKUP: (a, r) => {
    const keys = flat([as2d(a[1])]), ret = as2d(a[2]); const i = keys.findIndex(k => lookupEq(k, a[0]));
    if (i < 0) { if (a.length > 3 && r[3].k !== 'blank') return a[3]; raise(ERR.NA); }
    return ret.length === 1 ? ret[0][i] : ret[i][0];
  },
  LOGEST: a => logest(flat([as2d(a[0])]).filter(x => typeof x === 'number'), a.length > 1 ? flat([as2d(a[1])]).filter(x => typeof x === 'number') : null),
  PMT: a => pmt(toNum(a[0]), toNum(a[1]), toNum(a[2]), toNum(a[3] ?? 0), toNum(a[4] ?? 0)),
  PV: a => pvF(toNum(a[0]), toNum(a[1]), toNum(a[2]), toNum(a[3] ?? 0), toNum(a[4] ?? 0)),
  FV: a => fvF(toNum(a[0]), toNum(a[1]), toNum(a[2]), toNum(a[3] ?? 0), toNum(a[4] ?? 0)),
  NPER: a => { const r = toNum(a[0]), p = toNum(a[1]), pv = toNum(a[2]), fv = toNum(a[3] ?? 0), t = toNum(a[4] ?? 0); if (r === 0) return -(pv + fv) / p; const z = p * (1 + r * t) / r; const v = (z - fv) / (z + pv); if (v <= 0) raise(ERR.NUM); return Math.log(v) / Math.log(1 + r); },
  NPV: (a, r) => { const rate = toNum(a[0]); return nums(a.slice(1), r.slice(1)).reduce((s, x, i) => s + x / Math.pow(1 + rate, i + 1), 0); },
  IRR: a => { const cf = flat([as2d(a[0])]).filter(x => typeof x === 'number'); return solve(x => cf.reduce((s, c, i) => s + c / Math.pow(1 + x, i), 0), a.length > 1 ? toNum(a[1]) : 0.1); },
  RATE: a => { const n = toNum(a[0]), p = toNum(a[1]), pv = toNum(a[2]), fv = toNum(a[3] ?? 0), t = toNum(a[4] ?? 0); return solve(x => Math.abs(x) < 1e-10 ? pv + p * n + fv : pv * Math.pow(1 + x, n) + p * (1 + x * t) * (Math.pow(1 + x, n) - 1) / x + fv, a.length > 5 ? toNum(a[5]) : 0.1); },
};
F.STDEV = F['STDEV.S'] = (a, r) => { const v = nums(a, r); if (v.length < 2) raise(ERR.DIV); const m = v.reduce((s, x) => s + x, 0) / v.length; return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1)); };
F.VAR = F['VAR.S'] = (a, r) => F.STDEV(a, r) ** 2;
F.MEDIAN = (a, r) => { const v = nums(a, r).sort((x, y) => x - y); if (!v.length) raise(ERR.NUM); const h = v.length >> 1; return v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2; };
export const FUNCTIONS = Object.keys(F).concat([...LAZY]).sort();

/* ---------------- evaluation ---------------- */
function evalNode(n, ctx) {
  switch (n.k) {
    case 'num': case 'str': case 'bool': return n.v;
    case 'blank': return '';
    case 'ref': return ctx.get(n.v);
    case 'range': return ctx.range(n.v);
    case 'name': raise(ERR.NAME);
    case 'neg': return -toNum(scalar(evalNode(n.e, ctx)));
    case 'pct': return toNum(scalar(evalNode(n.e, ctx))) / 100;
    case 'bin': {
      const a = scalar(evalNode(n.a, ctx)), b = scalar(evalNode(n.b, ctx));
      if (isErr(a)) raise(a); if (isErr(b)) raise(b);
      switch (n.op) {
        case '+': return toNum(a) + toNum(b);
        case '-': return toNum(a) - toNum(b);
        case '*': return toNum(a) * toNum(b);
        case '/': { const d = toNum(b); if (d === 0) raise(ERR.DIV); return toNum(a) / d; }
        case '^': { const r = Math.pow(toNum(a), toNum(b)); if (!isFinite(r)) raise(ERR.NUM); return r; }
        case '&': return toStr(a) + toStr(b);
        default: return compare(a, b, n.op);
      }
    }
    case 'fn': {
      const name = n.name;
      if (name === 'IF') { const c = toBool(scalar(evalNode(n.args[0], ctx))); const pick = c ? n.args[1] : n.args[2]; return pick ? scalar(evalNode(pick, ctx)) : c ? true : false; }
      if (name === 'IFS') { for (let k = 0; k < n.args.length; k += 2) if (toBool(scalar(evalNode(n.args[k], ctx)))) return scalar(evalNode(n.args[k + 1], ctx)); raise(ERR.NA); }
      if (name === 'IFERROR' || name === 'IFNA') {
        try { const v = scalar(evalNode(n.args[0], ctx)); if (isErr(v) && (name === 'IFERROR' || v.err === '#N/A')) return scalar(evalNode(n.args[1], ctx)); return v; }
        catch (e) { if (e instanceof FErr && (name === 'IFERROR' || e.v.err === '#N/A')) return scalar(evalNode(n.args[1], ctx)); throw e; }
      }
      const f = F[name]; if (!f) raise(ERR.NAME);
      const args = n.args.map(a => evalNode(a, ctx));
      args.forEach(v => { if (!Array.isArray(v) && isErr(v) && !['ISERROR', 'ISBLANK', 'ISNUMBER'].includes(name)) raise(v); });
      const r = f(args, n.args, ctx);
      if (typeof r === 'number' && !isFinite(r)) raise(ERR.NUM);
      return r;
    }
  }
  raise(ERR.VAL);
}
const scalar = v => Array.isArray(v) ? (v.length === 1 && v[0].length === 1 ? v[0][0] : raise(ERR.VAL)) : v;
function compare(a, b, op) {
  let x = a, y = b;
  if (typeof x === 'string' && typeof y === 'string') { x = x.toLowerCase(); y = y.toLowerCase(); }
  else if (typeof x !== typeof y) { if (x === '' || x == null) x = typeof y === 'number' ? 0 : ''; if (y === '' || y == null) y = typeof x === 'number' ? 0 : ''; }
  switch (op) { case '=': return x === y; case '<>': return x !== y; case '<': return x < y; case '>': return x > y; case '<=': return x <= y; case '>=': return x >= y; }
}

/** Collect the references a formula reads (for highlighting precedents). */
export function references(src) {
  try { return tokenize(String(src).replace(/^=/, '')).filter(t => t.t === 'ref').map(t => t.v.replace(/\$/g, '').toUpperCase()); } catch (e) { return []; }
}

/** Shift relative references in a formula by (dr, dc), as Excel does on copy/fill. */
export function shiftFormula(src, dr, dc) {
  const s = String(src); if (!s.startsWith('=')) return s;
  let toks; try { toks = tokenize(s.slice(1)); } catch (e) { return s; }
  let out = '', last = 0; const body = s.slice(1);
  const shiftOne = ref => {
    const m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(ref);
    const c = m[1] ? colNum(m[2]) : colNum(m[2]) + dc, r = m[3] ? +m[4] - 1 : +m[4] - 1 + dr;
    if (c < 0 || r < 0) return '#REF!';
    return m[1] + colName(c) + m[3] + (r + 1);
  };
  toks.forEach(t => { if (t.t !== 'ref') return; out += body.slice(last, t.s) + t.v.split(':').map(shiftOne).join(':'); last = t.e; });
  return '=' + out + body.slice(last);
}

/* ---------------- workbook ---------------- */
/** Parse a typed entry into a constant (number/boolean/string) or a formula. */
export function literal(raw) {
  if (raw == null) return '';
  if (typeof raw === 'number' || typeof raw === 'boolean') return raw;
  const s = String(raw); const t = s.trim(); if (t === '') return '';
  const pct = /^(-?\d*\.?\d+(?:[eE][+-]?\d+)?)%$/.exec(t.replace(/,/g, '')); if (pct) return parseFloat(pct[1]) / 100;
  const n = t.replace(/,(?=\d{3}(\D|$))/g, ''); if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(n)) return parseFloat(n);
  if (/^true$/i.test(t)) return true; if (/^false$/i.test(t)) return false;
  return s;
}

export class Workbook {
  constructor(cells = {}) { this.raw = {}; this.cache = {}; this.ast = {}; Object.entries(cells).forEach(([k, v]) => this.setRaw(k, v)); }
  setRaw(a, v) {
    a = a.toUpperCase(); delete this.ast[a];
    if (v === '' || v == null) delete this.raw[a]; else this.raw[a] = v;
  }
  set(a, v) { this.setRaw(a, v); this.cache = {}; }
  get(a) { return this.raw[a.toUpperCase()] ?? ''; }
  isFormula(a) { const v = this.raw[a.toUpperCase()]; return typeof v === 'string' && v.startsWith('=') && v.length > 1; }
  value(a) { a = a.toUpperCase(); if (a in this.cache) { const c = this.cache[a]; if (c === VISITING) return ERR.CIRC; return c; } return this._calc(a); }
  _calc(a) {
    const raw = this.raw[a];
    if (!(typeof raw === 'string' && raw.startsWith('=') && raw.length > 1)) { const v = literal(raw); this.cache[a] = v; return v; }
    this.cache[a] = VISITING; let v;
    try {
      if (!this.ast[a]) { try { this.ast[a] = parse(raw.slice(1)); } catch (e) { this.ast[a] = { k: 'syntax', msg: e.message }; } }
      const ast = this.ast[a];
      if (ast.k === 'syntax') v = { err: '#ERROR!', msg: ast.msg };
      else { v = scalar(evalNode(ast, this._ctx())); if (v === '' || v == null) v = 0; if (isErr(v)) v = { ...v }; }
    } catch (e) { v = e instanceof FErr ? e.v : { err: '#VALUE!', msg: e.message }; }
    this.cache[a] = v; return v;
  }
  _ctx() {
    return {
      get: ref => { const v = this.value(ref); if (isErr(v)) raise(v); return v; },
      range: rng => {
        const [p, q] = rng.split(':').map(parseAddr); if (!p || !q) raise(ERR.REF);
        const out = [];
        for (let r = Math.min(p.r, q.r); r <= Math.max(p.r, q.r); r++) { const row = []; for (let c = Math.min(p.c, q.c); c <= Math.max(p.c, q.c); c++) row.push(this.value(addr(r, c))); out.push(row); }
        return out;
      },
    };
  }
  /** Evaluate an ad-hoc formula (e.g. "=F52" typed into a case answer box) against this workbook. */
  evaluate(src) {
    const s = String(src).trim().replace(/^=/, '');
    try { return scalar(evalNode(parse(s), this._ctx())); } catch (e) { return e instanceof FErr ? e.v : { err: '#ERROR!', msg: e.message }; }
  }
}
const VISITING = Symbol('visiting');

/** Format a value for display. fmt: 'general' | 'int' | 'dec1'..'dec4' | 'pct0'..'pct2' | 'money' | 'text'. */
export function formatValue(v, fmt) {
  if (isErr(v)) return v.err;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v !== 'number') return v == null ? '' : String(v);
  if (fmt && fmt !== 'general') {
    const m = /^(int|dec|pct|money)(\d)?$/.exec(fmt);
    if (m) {
      const d = m[2] != null ? +m[2] : 0;
      if (m[1] === 'pct') return (v * 100).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
      if (m[1] === 'money') return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
      if (m[1] === 'int') return Math.round(v).toLocaleString('en-US');
      return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    }
  }
  const a = Math.abs(v);
  if (a >= 1e11 || (a > 0 && a < 1e-6)) return v.toExponential(3);
  if (Number.isInteger(v)) return a >= 10000 ? v.toLocaleString('en-US') : String(v);
  if (a >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 1 });
  return String(+v.toFixed(a >= 1 ? 4 : 5));
}
