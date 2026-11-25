// Glossary & flashcards (#/learn/glossary).
// Searchable list of every glossary term (probability + insurance), filter chips, and a flashcard mode
// with a 3D flip. Known cards are saved in the "flash" namespace: { known: { <term>: true } }.
import { esc, icon, toast } from '../util.js';
import { load, update as updateStore, setLast } from '../progress.js';
import { GLOSSARY, terms } from '../ui/glossary.js';

export const title = 'Glossary & flashcards';

const FILTERS = [['all', 'All'], ['Probability', 'Probability'], ['Insurance', 'Insurance']];
let root = null;
const st = { filter: 'all', query: '', mode: 'list', includeKnown: false, deck: [], pos: 0, flipped: false };
const known = () => load('flash', { known: {} }).known || {};

export function render(el) {
  root = el;
  Object.assign(st, { query: '', mode: 'list', deck: [], pos: 0, flipped: false });
  el.innerHTML = `
  <div class="container gl-page">
    <header class="page-head">
      <div class="eyebrow">Exam P · Study tools</div>
      <h1>Glossary &amp; flashcards</h1>
      <p class="lede">Every probability and insurance term used on the site. Search the list, or switch to flashcards to drill the ones you don't know yet.</p>
    </header>
    <div class="gl-bar card flat">
      <div class="gl-search">
        ${icon('search')}
        <label class="sr-only" for="gl-q">Search terms</label>
        <input id="gl-q" type="search" placeholder="Search terms and definitions" autocomplete="off" data-q>
      </div>
      <div class="chips gl-filters" role="group" aria-label="Filter by topic">
        ${FILTERS.map(([k, l]) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${k === st.filter}">${l} <span class="gl-ct" data-ct="${k}"></span></button>`).join('')}
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" data-mode="list" aria-pressed="true">${icon('table')} List</button>
        <button type="button" data-mode="cards" aria-pressed="false">${icon('layers')} Flashcards</button>
      </div>
    </div>
    <div data-body></div>
  </div>`;
  el.addEventListener('input', e => { if (e.target.matches('[data-q]')) { st.query = e.target.value; refresh(); } });
  el.addEventListener('click', onClick);
  el.addEventListener('change', e => { if (e.target.matches('[data-inc]')) { st.includeKnown = e.target.checked; buildDeck(); drawCards(); } });
  el.addEventListener('keydown', onKey);
  setLast('#/learn/glossary', 'Glossary & flashcards');
  counts();
  refresh();
}
export function destroy() { root = null; }

/* ---------- data ---------- */
function filtered() {
  const q = st.query.trim().toLowerCase();
  return terms().filter(t => {
    const e = GLOSSARY[t];
    if (st.filter !== 'all' && e.topic !== st.filter) return false;
    return !q || t.toLowerCase().includes(q) || e.def.toLowerCase().includes(q);
  });
}
function counts() {
  const all = terms();
  FILTERS.forEach(([k]) => { root.querySelector(`[data-ct="${k}"]`).textContent = k === 'all' ? all.length : all.filter(t => GLOSSARY[t].topic === k).length; });
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function buildDeck() {
  const k = known();
  st.deck = shuffle(filtered().filter(t => st.includeKnown || !k[t]));
  st.pos = 0; st.flipped = false;
}

/* ---------- rendering ---------- */
function refresh() {
  if (st.mode === 'list') drawList(); else { buildDeck(); drawCards(); }
}

function highlight(text) {
  const q = st.query.trim(); const safe = esc(text);
  if (!q) return safe;
  const re = new RegExp('(' + esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
  return safe.replace(re, '<mark>$1</mark>');
}

function drawList() {
  const list = filtered(), k = known();
  const body = root.querySelector('[data-body]');
  body.innerHTML = `
    <p class="small muted gl-count" role="status" aria-live="polite">${list.length} term${list.length === 1 ? '' : 's'}${st.query ? ` matching “${esc(st.query)}”` : ''}</p>
    ${list.length ? `<dl class="gl-list">${list.map(t => `
      <div class="gl-item card flat">
        <dt><span class="gl-term">${highlight(t)}</span>
          <span class="pill ${GLOSSARY[t].topic === 'Probability' ? 'cur' : ''}">${GLOSSARY[t].topic}</span>
          ${k[t] ? `<span class="pill ok">${icon('check')} Known</span>` : ''}</dt>
        <dd>${highlight(GLOSSARY[t].def)}</dd>
      </div>`).join('')}</dl>`
    : `<div class="lockbox"><h3>No matching terms</h3><p>Try a shorter search or another filter.</p></div>`}`;
}

function drawCards() {
  const body = root.querySelector('[data-body]');
  const k = known(); const pool = filtered(); const nKnown = pool.filter(t => k[t]).length;
  const head = `<div class="fc-top">
      <div class="fc-stats"><b>${nKnown}</b> of ${pool.length} known in this deck
        <div class="bar" aria-hidden="true"><i style="width:${pool.length ? (nKnown / pool.length) * 100 : 0}%"></i></div></div>
      <div class="row">
        <label class="fc-inc small"><input type="checkbox" data-inc ${st.includeKnown ? 'checked' : ''}> Include known cards</label>
        <button type="button" class="btn ghost sm" data-act="shuffle">${icon('refresh')} Shuffle</button>
      </div></div>`;
  if (!pool.length) { body.innerHTML = head + `<div class="lockbox"><h3>No cards in this deck</h3><p>Clear the search or pick another filter.</p></div>`; return; }
  if (st.pos >= st.deck.length) {
    body.innerHTML = head + `<div class="fc-done card">
      <div class="fc-done-ic" aria-hidden="true">${icon('star')}</div>
      <h2>${st.deck.length ? 'Deck finished' : 'You know every card here'}</h2>
      <p class="muted">${nKnown} of ${pool.length} terms in this deck are marked known.</p>
      <div class="row" style="justify-content:center">
        <button type="button" class="btn primary" data-act="restart">${icon('refresh')} Go again</button>
        <button type="button" class="btn ghost" data-act="reset-known">Reset known for this deck</button>
      </div></div>`;
    return;
  }
  const term = st.deck[st.pos], e = GLOSSARY[term];
  body.innerHTML = head + `
    <div class="fc-wrap">
      <p class="tiny muted fc-pos">Card ${st.pos + 1} of ${st.deck.length}</p>
      <button type="button" class="fc${st.flipped ? ' flipped' : ''}" data-act="flip" aria-pressed="${st.flipped}"
        aria-label="${esc(st.flipped ? `${term}: ${e.def}` : `${term}. Press to show the definition.`)}">
        <span class="fc-inner">
          <span class="fc-face fc-front" aria-hidden="true"><span class="pill">${e.topic}</span><span class="fc-term">${esc(term)}</span><span class="fc-hint tiny">Tap or press Space to flip</span></span>
          <span class="fc-face fc-back" aria-hidden="true"><span class="pill cur">${esc(term)}</span><span class="fc-def">${esc(e.def)}</span></span>
        </span>
      </button>
      <div class="fc-actions">
        <button type="button" class="btn ghost" data-act="again">${icon('back')} Again</button>
        <button type="button" class="btn primary" data-act="got">${icon('check')} Got it</button>
      </div>
      <p class="tiny muted fc-keys">Keys: Space flips · ← again · → got it</p>
    </div>`;
}

/* ---------- events ---------- */
function onClick(e) {
  const f = e.target.closest('[data-filter]');
  if (f) { st.filter = f.dataset.filter; root.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === f))); refresh(); return; }
  const m = e.target.closest('[data-mode]');
  if (m) { st.mode = m.dataset.mode; root.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === m))); refresh(); if (st.mode === 'cards') focusCard(); return; }
  const a = e.target.closest('[data-act]'); if (!a) return;
  act(a.dataset.act);
}
function act(name) {
  if (name === 'flip') { st.flipped = !st.flipped; const c = root.querySelector('.fc'); if (c) { c.classList.toggle('flipped', st.flipped); c.setAttribute('aria-pressed', String(st.flipped)); const term = st.deck[st.pos]; c.setAttribute('aria-label', st.flipped ? `${term}: ${GLOSSARY[term].def}` : `${term}. Press to show the definition.`); } return; }
  if (name === 'got') {
    const term = st.deck[st.pos]; if (!term) return;
    updateStore('flash', s => { s.known = s.known || {}; s.known[term] = true; }, { known: {} });
    st.pos++; st.flipped = false; drawCards(); focusCard(); return;
  }
  if (name === 'again') {
    const term = st.deck[st.pos]; if (!term) return;
    st.deck.splice(st.pos, 1); st.deck.push(term);          // send to the back of the deck
    st.flipped = false; drawCards(); focusCard(); return;
  }
  if (name === 'shuffle') { buildDeck(); drawCards(); focusCard(); toast('Deck shuffled.'); return; }
  if (name === 'restart') { buildDeck(); drawCards(); focusCard(); return; }
  if (name === 'reset-known') {
    const pool = filtered();
    updateStore('flash', s => { s.known = s.known || {}; pool.forEach(t => delete s.known[t]); }, { known: {} });
    buildDeck(); drawCards(); focusCard(); toast('Known cards reset for this deck.');
  }
}
function focusCard() { const c = root && (root.querySelector('.fc') || root.querySelector('.fc-done .btn')); if (c) c.focus({ preventScroll: true }); }
function onKey(e) {
  if (st.mode !== 'cards' || e.target.matches('input, textarea')) return;
  if (!root.querySelector('.fc')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); act('got'); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); act('again'); }
  else if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('button')) { e.preventDefault(); act('flip'); }
}
