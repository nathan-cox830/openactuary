// Accessible modal dialog. Buttons inside with data-modal="<action>" call onAction(action).
// data-modal="cancel" closes it.

let lastFocus = null;
export function showModal(html, onAction = () => {}) {
  closeModal();
  lastFocus = document.activeElement;
  const o = document.createElement('div');
  o.id = 'modal';
  o.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(o);
  o.addEventListener('click', e => {
    if (e.target === o) { closeModal(); return; }
    const b = e.target.closest('[data-modal]'); if (!b) return;
    const a = b.dataset.modal;
    if (a === 'cancel') { closeModal(); return; }
    onAction(a, o);
  });
  o.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {                                  // trap focus
      const f = [...o.querySelectorAll('button, [href], input, textarea, select')].filter(x => !x.disabled);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
  const f = o.querySelector('[data-autofocus]') || o.querySelector('button'); if (f) f.focus();
  return o;
}
export function closeModal() {
  const o = document.getElementById('modal'); if (!o) return;
  o.remove(); if (lastFocus && lastFocus.focus) lastFocus.focus();
}
