// Case workspace view: #/cases/<id>/<tab>
import { byId } from '../cases/registry.js';
import { mount } from '../cases/engine.js';
import { go } from '../router.js';

export let title = 'Case';
let ws = null;

export function render(el, [id, tab]) {
  const def = byId(id);
  if (!def) { go('cases', { replace: true }); return; }
  title = def.title;
  document.title = `${def.title} · OpenActuary`;
  ws = mount(el, def, tab);
}
export function update([, tab]) { if (ws) ws.setTab(tab || 'brief'); }
export function destroy() { if (ws) ws.destroy(); ws = null; }
