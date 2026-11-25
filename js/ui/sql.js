// SQL in the browser for the Skills lessons: sql.js 1.12.0 (SQLite compiled to WebAssembly) from cdnjs,
// loaded only when a SQL page opens. Queries run in a Web Worker so a runaway query can be stopped.
//
//   const runner = new SqlRunner(SCHEMA_SQL + SEED_SQL);
//   const r = await runner.run('SELECT * FROM policies LIMIT 5');   // { columns, values } or throws Error
//   compareResults(mine, reference, ordered)                         // { ok, msg }
// Every run starts from a fresh copy of the seeded database, so INSERT/DELETE/DROP can't break later steps.
export const SQLJS_VERSION = '1.12.0';
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VERSION}/`;

const WORKER_SRC = `
importScripts('${CDN}sql-wasm.min.js');
let SQL = null, base = null;
const ready = initSqlJs({ locateFile: f => '${CDN}' + f }).then(s => { SQL = s; });
onmessage = async e => {
  const { id, op, sql } = e.data;
  try {
    await ready;
    if (op === 'init') { const db = new SQL.Database(); db.exec(sql); base = db.export(); db.close(); postMessage({ id, ok: true }); return; }
    const db = new SQL.Database(base);
    try { const res = db.exec(sql); postMessage({ id, ok: true, res: res.length ? res[res.length - 1] : null }); }
    finally { db.close(); }
  } catch (err) { postMessage({ id, ok: false, error: String((err && err.message) || err) }); }
};`;

export class SqlRunner {
  constructor(initSql, { timeout = 6000 } = {}) { this.initSql = initSql; this.timeout = timeout; this.seq = 0; this.pending = new Map(); this._start(); }
  _start() {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    this.worker = new Worker(url);
    URL.revokeObjectURL(url);
    this.worker.onmessage = e => { const p = this.pending.get(e.data.id); if (!p) return; this.pending.delete(e.data.id); clearTimeout(p.t); e.data.ok ? p.resolve(e.data.res) : p.reject(new Error(e.data.error)); };
    this.worker.onerror = e => { e.preventDefault(); const err = new Error('The SQL engine could not load. Check your internet connection: it is downloaded once from cdnjs.cloudflare.com.'); this.pending.forEach(p => { clearTimeout(p.t); p.reject(err); }); this.pending.clear(); this.failed = err; };
    this.ready = this._send('init', this.initSql, 30000);
  }
  _send(op, sql, timeout) {
    if (this.failed) return Promise.reject(this.failed);
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(op === 'init' ? 'The SQL engine took too long to load. Check your connection and reload the page.' : `The query ran for more than ${Math.round(timeout / 1000)} seconds and was stopped. Look for a join without an ON condition.`));
        if (op !== 'init') { this.worker.terminate(); this.pending.forEach(p => { clearTimeout(p.t); p.reject(new Error('Stopped.')); }); this.pending.clear(); this._start(); }
      }, timeout);
      this.pending.set(id, { resolve, reject, t });
      this.worker.postMessage({ id, op, sql });
    });
  }
  /** Run SQL on a fresh copy of the database. Resolves to { columns, values } (or null when nothing is returned). */
  async run(sql) { await this.ready; return this._send('run', sql, this.timeout); }
  destroy() { this.worker.terminate(); this.pending.clear(); }
}

// numeric text (e.g. strftime('%Y', …) = '2022') counts as the number, so a missing CAST isn't marked wrong
const num4 = x => { const r = Math.round(x * 1e4) / 1e4; return Object.is(r, -0) ? 0 : r; };
const norm = v => v == null ? null : typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) ? num4(+v) : typeof v === 'number' ? (Object.is(Math.round(v * 1e4) / 1e4, -0) ? 0 : Math.round(v * 1e4) / 1e4) : String(v);
const rowKey = r => JSON.stringify(r.map(norm));

/** Compare a learner's result with the reference. Column names are ignored; numbers compared to 4 decimals. */
export function compareResults(mine, ref, ordered = false) {
  if (!ref) return { ok: false, msg: 'The reference query returned nothing. Please report this lesson.' };
  if (!mine) return { ok: false, msg: 'Your query ran but returned no result table. Make sure it ends with a SELECT.' };
  const mc = mine.columns.length, rc = ref.columns.length;
  if (mc !== rc) return { ok: false, msg: `Your result has ${mc} column${mc === 1 ? '' : 's'}; the task asks for ${rc}. Check the SELECT list against the instructions.` };
  const mr = mine.values.length, rr = ref.values.length;
  if (mr !== rr) return { ok: false, msg: `Your query returns ${mr} row${mr === 1 ? '' : 's'}; the task expects ${rr}. Check your WHERE, JOIN and GROUP BY.` };
  const a = mine.values.map(rowKey), b = ref.values.map(rowKey);
  const same = [...a].sort().join('\n') === [...b].sort().join('\n');
  if (!same) {
    // find which column differs most often, as a gentle pointer
    const cols = [];
    for (let j = 0; j < rc; j++) { const x = mine.values.map(r => JSON.stringify(norm(r[j]))).sort().join(), y = ref.values.map(r => JSON.stringify(norm(r[j]))).sort().join(); if (x !== y) cols.push(j + 1); }
    return { ok: false, msg: `Right shape (${rr} rows × ${rc} columns), but some values differ${cols.length ? ` in column${cols.length > 1 ? 's' : ''} ${cols.join(', ')}` : ''}. Check filters, joins and any rounding the task asks for.` };
  }
  if (ordered && a.join('\n') !== b.join('\n')) return { ok: false, msg: 'All the right rows, but not in the order the task asks for. Check your ORDER BY.' };
  return { ok: true, msg: `Correct: ${rr === 1 ? 'the row matches' : `all ${rr} rows match`} the expected result.` };
}
