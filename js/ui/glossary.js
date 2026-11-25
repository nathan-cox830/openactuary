// Shared glossary: insurance terms from the cases + probability terms from Exam P.
// applyGlossary(root) underlines the first use of each known term inside .prose and .callout blocks
// and shows a tooltip on hover, focus or tap.
import INSURANCE from '../../data/glossary-insurance.js';
import PROBABILITY from '../../data/exam-p/glossary.js';

const entries = {};            // term -> { def, topic }
Object.entries(INSURANCE).forEach(([k, d]) => { entries[k] = { def: d, topic: 'Insurance' }; });
Object.entries(PROBABILITY).forEach(([k, d]) => { entries[k] = { def: d, topic: 'Probability' }; });

export const GLOSSARY = entries;
export const terms = () => Object.keys(entries).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

const KEYS = Object.keys(entries).sort((a, b) => b.length - a.length);
const SRC = '\\b(' + KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('|') + ')(?![\\w-])';
function lookup(w) {
  if (entries[w]) return w;
  const lw = w.toLowerCase();
  // all-caps abbreviations (IBNR, CDF...) only match exactly; other terms match case-insensitively
  return KEYS.find(k => k.toLowerCase() === lw && k !== k.toUpperCase());
}

export function applyGlossary(root) {
  if (!root) return;
  root.querySelectorAll('.prose, .callout').forEach(box => {
    if (box.dataset.gl || (box.parentElement && box.parentElement.closest('[data-gl]'))) return;
    box.dataset.gl = '1'; const seen = new Set();
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: n => {
      const p = n.parentElement;
      if (!p || p.closest('a,button,input,textarea,label,table,.gl,.formula,.katex,summary,h1,h2,h3,h4,code,svg,[data-nogl]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT; } });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const txt = n.nodeValue; const re = new RegExp(SRC, 'gi'); let m, last = 0, out = null;
      while ((m = re.exec(txt))) {
        const w = m[0]; const key = lookup(w); if (!key || seen.has(key.toLowerCase())) continue; seen.add(key.toLowerCase());
        out = out || document.createDocumentFragment(); out.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const s = document.createElement('span'); s.className = 'gl'; s.tabIndex = 0; s.textContent = w;
        s.dataset.term = key; s.setAttribute('aria-label', w + ': ' + entries[key].def); out.appendChild(s); last = m.index + w.length;
      }
      if (out) { out.appendChild(document.createTextNode(txt.slice(last))); n.parentNode.replaceChild(out, n); }
    });
  });
}

let tip = null;
function showTip(el) {
  const key = el.dataset.term; const e = entries[key]; const def = e ? e.def : el.dataset.def; if (!def) return;
  if (!tip) { tip = document.createElement('div'); tip.id = 'gltip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
  tip.innerHTML = ''; const b = document.createElement('b'); b.textContent = key || el.textContent; tip.appendChild(b); tip.appendChild(document.createTextNode(def));
  tip.style.display = 'block';
  const r = el.getBoundingClientRect(); const w = Math.min(320, innerWidth - 24);
  tip.style.width = w + 'px';
  const x = Math.min(Math.max(12, r.left), innerWidth - w - 12); let y = r.bottom + 8;
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
  const th = tip.offsetHeight; if (y + th > innerHeight - 8) tip.style.top = Math.max(8, r.top - th - 8) + 'px';
}
function hideTip() { if (tip) tip.style.display = 'none'; }

export function initGlossaryTips() {
  document.addEventListener('mouseover', e => { const g = e.target.closest && e.target.closest('.gl'); if (g) showTip(g); });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('.gl')) hideTip(); });
  document.addEventListener('focusin', e => { if (e.target.classList && e.target.classList.contains('gl')) showTip(e.target); });
  document.addEventListener('focusout', e => { if (e.target.classList && e.target.classList.contains('gl')) hideTip(); });
  document.addEventListener('click', e => { const g = e.target.closest && e.target.closest('.gl'); if (g) showTip(g); else hideTip(); }, true);
  window.addEventListener('scroll', hideTip, { passive: true });
}
