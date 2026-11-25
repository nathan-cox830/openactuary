// Minimal hash router. Routes look like "#/cases/stale-triangle/work".
// Each view module exports `render(el, params, ctx)` and may export `destroy()` and `title`.

const routes = [];
let currentView = null;
let outlet = null;
let onNavigate = () => {};

/**
 * Register a route.
 * @param {RegExp} pattern  matched against the path after "#/", e.g. /^cases\/([\w-]+)(?:\/(\w+))?$/
 * @param {() => Promise<Module>} loader  dynamic import of the view module
 * @param {string} nav  key of the header nav item to highlight
 */
export function route(pattern, loader, nav = '') { routes.push({ pattern, loader, nav }); }

export function path() { return location.hash.replace(/^#\/?/, '').replace(/\/$/, ''); }
export function go(p, { replace = false } = {}) {
  const h = '#/' + p.replace(/^#?\/?/, '');
  if (replace) history.replaceState(null, '', h); else location.hash = h;
  if (replace) resolve();
}

export function start(el, navCallback) {
  outlet = el; onNavigate = navCallback || onNavigate;
  window.addEventListener('hashchange', () => resolve());
  resolve();
}

let token = 0;
async function resolve() {
  const p = path();
  const my = ++token;
  let match = null, r = null;
  for (const x of routes) { const m = p.match(x.pattern); if (m) { match = m; r = x; break; } }
  if (!r) { r = routes.find(x => x.pattern.test('')); match = ['']; }
  let mod;
  try { mod = await r.loader(); }
  catch (e) {
    console.error(e);
    outlet.innerHTML = `<div class="container"><div class="page-head"><h1>Something went wrong</h1><p class="lede">This page could not load. Try reloading. If you opened index.html directly from your files, run a local server instead (see the README).</p></div></div>`;
    return;
  }
  if (my !== token) return;                     // a newer navigation won
  const params = match.slice(1).map(x => x == null ? undefined : decodeURIComponent(x));
  // Same view + same first parameter (e.g. switching tabs inside one case): let the view update in place.
  const key = r.pattern.source + '|' + (params[0] || '');
  const sameView = key === lastKey && currentView === mod && typeof mod.update === 'function';
  lastKey = key;
  onNavigate({ path: p, nav: r.nav, title: mod.title, sameView });
  if (sameView) {
    try { await mod.update(params, { path: p }); } catch (e) { console.error(e); }
    return;
  }
  if (currentView && currentView.destroy) { try { currentView.destroy(); } catch (e) { } }
  currentView = mod;
  outlet.innerHTML = '';
  const view = document.createElement('div');
  view.className = 'view';
  outlet.appendChild(view);
  window.scrollTo(0, 0);
  try { await mod.render(view, params, { path: p }); }
  catch (e) { console.error(e); view.innerHTML = `<div class="container"><div class="page-head"><h1>Something went wrong</h1><p class="lede">${String(e.message || e)}</p></div></div>`; }
  const focusTarget = view.querySelector('h1');
  if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus({ preventScroll: true }); }
}
let lastKey = '';

/** Re-run the current route (e.g. after importing progress). */
export function refresh() { lastKey = ''; resolve(); }
