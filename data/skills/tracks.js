// Skills tracks (#/skills). Each track module exports TRACK = { id, title, blurb, lessons: [{ id, title, short, minutes, level, intro, steps }] }.
// Excel steps: { id, title, body, sheet: { rows, cols, formats, inputs }, solution, check, require?, hints, takeaway }.
// SQL steps:   { id, title, body, tables, starter, solution, ordered, hints, takeaway }; the database is in sql-db.js.
export const TRACKS = [
  { id: 'excel', name: 'Excel', icon: 'grid', tagline: 'Formulas, references, lookups, triangles and time value of money, in a spreadsheet built into the page.',
    load: () => import('./excel.js') },
  { id: 'sql', name: 'SQL', icon: 'table', tagline: 'Query a practice insurance database: filters, joins, CASE, dates, CTEs and window functions.',
    load: () => import('./sql.js') },
];
const cache = {};
export async function loadTrack(id) {
  if (id in cache) return cache[id];
  const t = TRACKS.find(x => x.id === id); if (!t) return null;
  try { cache[id] = { ...t, ...(await t.load()).TRACK }; } catch (e) { console.warn('Track failed to load', id, e); cache[id] = null; }
  return cache[id];
}
export const loadAllTracks = () => Promise.all(TRACKS.map(t => loadTrack(t.id)));
