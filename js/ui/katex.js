// Lazy-load KaTeX (pinned, from cdnjs) and render math.
// Markup: <span class="tex">P(A \mid B)</span> for inline, <div class="texd">...</div> for display math.
// If KaTeX can't load (offline), the raw TeX stays visible in a monospace style.
const SRC = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js';
let loading = null;

export function loadKatex() {
  if (window.katex) return Promise.resolve(window.katex);
  if (!loading) loading = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = SRC; s.crossOrigin = 'anonymous'; s.defer = true;
    s.onload = () => res(window.katex); s.onerror = () => { loading = null; rej(new Error('KaTeX failed to load')); };
    document.head.appendChild(s);
  });
  return loading;
}

/** Render every .tex / .texd element inside root that hasn't been rendered yet. */
export async function renderMath(root = document) {
  const els = [...root.querySelectorAll('.tex:not([data-done]), .texd:not([data-done])')];
  if (!els.length) return;
  let k; try { k = await loadKatex(); } catch (e) { els.forEach(el => el.classList.add('tex-fallback')); return; }
  els.forEach(el => {
    const src = el.dataset.src || el.textContent; el.dataset.src = src;
    try { k.render(src, el, { displayMode: el.classList.contains('texd'), throwOnError: false }); el.dataset.done = '1'; }
    catch (e) { el.classList.add('tex-fallback'); }
  });
}
