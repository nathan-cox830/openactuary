// Browser-only progress storage. Everything lives in localStorage under "oa:v1:<namespace>".
// Every read/write is wrapped in try/catch so the site still works when storage is blocked
// (private windows, strict privacy settings): progress then simply lasts for the visit.

const PREFIX = 'oa:v1:';
const memory = {};           // fallback when localStorage is unavailable
let storageOk = true;
try { const k = PREFIX + '__test'; localStorage.setItem(k, '1'); localStorage.removeItem(k); } catch (e) { storageOk = false; }

export const persistent = () => storageOk;

function rawGet(key) {
  if (storageOk) { try { return localStorage.getItem(key); } catch (e) { /* fall through */ } }
  return key in memory ? memory[key] : null;
}
function rawSet(key, val) {
  memory[key] = val;
  if (storageOk) { try { localStorage.setItem(key, val); } catch (e) { /* quota or blocked: memory copy remains */ } }
}
function rawDel(key) {
  delete memory[key];
  if (storageOk) { try { localStorage.removeItem(key); } catch (e) { } }
}

/** Load a namespace. Returns a fresh copy of `fallback` (merged with saved fields) if present. */
export function load(ns, fallback = {}) {
  const s = rawGet(PREFIX + ns);
  const base = structuredClone(fallback);
  if (!s) return base;
  try {
    const v = JSON.parse(s);
    const mergeable = o => o && typeof o === 'object' && !Array.isArray(o);
    return (mergeable(v) && mergeable(base)) ? Object.assign(base, v) : v;
  } catch (e) { return base; }
}
export function save(ns, obj) { rawSet(PREFIX + ns, JSON.stringify(obj)); notify(ns); }
/** Read-modify-write helper. */
export function update(ns, fn, fallback = {}) { const v = load(ns, fallback); const r = fn(v); save(ns, r === undefined ? v : r); return v; }
export function remove(ns) { rawDel(PREFIX + ns); notify(ns); }

export function namespaces() {
  const out = new Set(Object.keys(memory).filter(k => k.startsWith(PREFIX)).map(k => k.slice(PREFIX.length)));
  if (storageOk) { try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) out.add(k.slice(PREFIX.length)); } } catch (e) { } }
  out.delete('__test');
  return [...out];
}

/** "Continue where you left off" pointer. */
export function setLast(route, label) { save('last', { route, label, at: Date.now() }); }
export function getLast() { return load('last', null); }

/* ---------- export / import ---------- */
export function exportAll() {
  const data = {};
  namespaces().forEach(ns => { if (ns === 'theme') return; data[ns] = load(ns, null); });
  return { app: 'openactuary', version: 1, exported: new Date().toISOString(), data };
}
/** Returns number of namespaces imported; throws on a bad file. */
export function importAll(payload) {
  if (!payload || payload.app !== 'openactuary' || typeof payload.data !== 'object') throw new Error('Not an OpenActuary progress file.');
  let n = 0;
  Object.entries(payload.data).forEach(([ns, v]) => { if (v != null) { save(ns, v); n++; } });
  return n;
}
export function clearAll() { namespaces().forEach(ns => { if (ns !== 'theme') rawDel(PREFIX + ns); }); notify('*'); }

/* ---------- change listeners ---------- */
const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify(ns) { listeners.forEach(fn => { try { fn(ns); } catch (e) { } }); }
