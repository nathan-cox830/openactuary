// OpenActuary entry point: routes, header behavior, theme, export/import.
import { route, start, refresh } from './router.js';
import { icon, toast, saveFile, dateStamp, $ } from './util.js';
import * as store from './progress.js';
import { initGlossaryTips } from './ui/glossary.js';

/* ---------- routes (most specific first) ---------- */
route(/^learn\/formulas$/, () => import('./views/formulas.js'), 'learn');
route(/^learn\/glossary$/, () => import('./views/glossary.js'), 'learn');
route(/^learn(?:\/([\w-]+))?$/, () => import('./views/learn.js'), 'learn');
route(/^practice\/quiz$/, () => import('./views/quiz.js'), 'practice');
route(/^practice$/, () => import('./views/practice.js'), 'practice');
route(/^cases\/([\w-]+)(?:\/(\w+))?$/, () => import('./views/case.js'), 'cases');
route(/^cases$/, () => import('./views/cases.js'), 'cases');
route(/^careers\/interview$/, () => import('./views/interview.js'), 'careers');
route(/^careers$/, () => import('./views/careers.js'), 'careers');
route(/^progress$/, () => import('./views/progress.js'), 'progress');
route(/^$/, () => import('./views/home.js'), '');

/* ---------- header ---------- */
const nav = $('#nav'), menuBtn = $('#menuBtn');
menuBtn.innerHTML = icon('menu');
function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.innerHTML = icon('menu'); }
menuBtn.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.innerHTML = icon(open ? 'x' : 'menu');
});
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });

function onNavigate({ nav: key, title }) {
  document.querySelectorAll('#nav a').forEach(a => {
    if (a.dataset.nav === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.title = title ? `${title} · OpenActuary` : 'OpenActuary · Free actuarial exam prep and case studies';
  closeMenu();
}

/* ---------- theme: auto → light → dark ---------- */
const themeBtn = $('#themeBtn');
const MODES = ['auto', 'light', 'dark'];
function applyTheme(mode) {
  if (mode === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = mode;
  themeBtn.innerHTML = icon(mode === 'auto' ? 'auto' : mode === 'light' ? 'sun' : 'moon');
  const label = { auto: 'Theme: match system', light: 'Theme: light', dark: 'Theme: dark' }[mode];
  themeBtn.setAttribute('aria-label', label + '. Click to change.'); themeBtn.title = label;
}
let theme = store.load('theme', { mode: 'auto' }).mode || 'auto';
applyTheme(theme);
themeBtn.addEventListener('click', () => {
  theme = MODES[(MODES.indexOf(theme) + 1) % MODES.length];
  store.save('theme', { mode: theme }); applyTheme(theme);
});

/* ---------- export / import progress (works on every page) ---------- */
export function exportProgress() {
  const ok = saveFile(`openactuary-progress-${dateStamp()}.json`, JSON.stringify(store.exportAll(), null, 1), 'application/json');
  toast(ok ? 'Progress exported. Import it on any device to pick up where you left off.' : 'Your browser blocked the download.');
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-export-progress]')) exportProgress();
  if (e.target.closest('[data-import-progress]')) $('#importFile').click();
});
$('#importFile').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try { const n = store.importAll(JSON.parse(rd.result)); toast(`Progress imported (${n} item${n === 1 ? '' : 's'}).`); refresh(); }
    catch (err) { toast('That file is not an OpenActuary progress file.'); }
  };
  rd.onerror = () => toast('Could not read that file.');
  rd.readAsText(f); e.target.value = '';
});

if (!store.persistent()) setTimeout(() => toast('Your browser is blocking storage, so progress will only last for this visit. Use Export to keep it.', 6000), 1200);

initGlossaryTips();
start($('#app'), onNavigate);
