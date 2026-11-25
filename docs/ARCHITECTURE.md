# OpenActuary architecture

A free, static site. No build step, no server, no API keys, no accounts, no AI services. Everything runs in the visitor's browser from plain HTML, CSS and ES modules. Progress is saved in `localStorage`.

Run locally: `python3 -m http.server 8000` in the project folder, then open http://localhost:8000. (ES modules don't load from `file://`.)

## Hard rules
- **Free forever:** never add a server, paid API, API key, account system, analytics or tracking. Only external requests allowed: Google Fonts and KaTeX from cdnjs (already wired up).
- **No external JS libraries** beyond KaTeX. Charts are hand-written SVG (`js/ui/charts.js`).
- **Original content only.** Practice questions are written for this site and must not be copied from SOA/CAS materials or textbooks.
- Every math answer must be checked: if a question has a numeric answer, compute it in code or verify it by hand.
- Accessible: real buttons and labels, keyboard usable, color is never the only signal, works at 375px wide, light and dark themes.

## Files
```
index.html                 shell: header nav, <main id="app">, footer
css/tokens.css             color/typography tokens (light + dark). Use the variables; never hard-code colors.
css/base.css               reset, typography, layout (.container, .page-head, .grid-2/.grid-3, .split, .row, .stack)
css/components.css         buttons (.btn .primary .ghost .quiet .sm .lg), .card, .panel, .chip, .pill(.ok/.st/.bad/.cur),
                           .callout, .example, .formula, inputs (.f, label.field), .seg, .opts (radio/checkbox lists,
                           .right/.wrong states), .fb(.ok/.no/.info) feedback, tables (.tblwrap), .kpis/.kpi(.hero), .bar, .ring,
                           details.disclose, .lockbox, modal, toast
css/pages.css              home, case library, progress dashboard
css/case.css               case workspace
css/learn.css              Exam P lesson, formulas, glossary, quiz, generator   (owned by the learning pages)
css/careers.css            careers and interview coach                         (owned by the careers pages)
js/app.js                  routes + header + theme + export/import
js/router.js               hash router (#/learn/...). Views export render(el, params) and optionally update(params), destroy(), title
js/progress.js             storage: load(ns, fallback), save(ns, obj), update(ns, fn, fallback), setLast(route, label)
js/util.js                 esc, fmt, pct, spct, money, num, sum, clamp, round, choose, factorial, gcd, mulberry (seeded RNG),
                           Phi, toast(msg), saveFile, icon(name)
js/ui/charts.js            lineChart, barChart, columnChart, ring(+animateRings), heroCurves
js/ui/motion.js            countUp(root) for [data-count], reveal(root) for [data-reveal], confetti(), reducedMotion()
js/ui/glossary.js          GLOSSARY, terms(), applyGlossary(root) underlines known terms in .prose/.callout
js/ui/katex.js             renderMath(root): renders <span class="tex">…</span> and <div class="texd">…</div>
js/ui/modal.js             showModal(html, onAction), closeModal()
js/cases/engine.js         generic case workspace
js/cases/registry.js       list of cases (+ "coming soon" lines)
js/cases/defs/*.js         one file per case
js/cases/benches/*.js      interactive calculators used by cases
data/glossary-insurance.js insurance terms   { term: definition }
data/exam-p/glossary.js    probability terms { term: definition }
data/exam-p/*.js           Exam P lesson, quiz, generator content
data/careers/*.js          job links, interview questions
```

## Routes
| Hash | View module | Notes |
|---|---|---|
| `#/` | views/home.js | |
| `#/learn`, `#/learn/<step>` | views/learn.js | General Probability lesson |
| `#/learn/formulas` | views/formulas.js | KaTeX formula sheet |
| `#/learn/glossary` | views/glossary.js | searchable glossary + flashcards |
| `#/practice` | views/practice.js | problem generator |
| `#/practice/quiz` | views/quiz.js | 20-question quiz |
| `#/cases`, `#/cases/<id>/<tab>` | views/cases.js, views/case.js | case library / workspace |
| `#/careers` | views/careers.js | job links + path guide |
| `#/careers/interview` | views/interview.js | timed mock interview |
| `#/progress` | views/progress.js | dashboard over all saved progress |

A view module:
```js
export const title = 'Practice quiz';            // browser tab title
export function render(el, params) { ... }       // build the page inside el (a fresh <div class="view">)
export function update(params) { ... }           // optional: same view, different params (avoids full re-render)
export function destroy() { ... }                // optional: clear timers / listeners on document
```
Attach event listeners to `el` (not `document`) so they disappear with the view. Page wrapper pattern:
```html
<div class="container">
  <header class="page-head"><div class="eyebrow">Exam P · General Probability</div><h1>Title</h1><p class="lede">One-sentence intro.</p></header>
  ...
</div>
```

## Progress namespaces (the Progress dashboard reads these, so keep the shapes)
| Namespace | Shape |
|---|---|
| `learn` | `{ done: { <stepId>: true }, current: <stepId> }` |
| `quiz` | `{ history: [{ at: ms, score, total, secs, byTopic: { <topic>: [right, total] } }], missed: { <qid>: true }, best: percent 0–100 }` |
| `practice` | `{ attempts, correct, streak, bestStreak, byTemplate: { <templateId>: [right, total] } }` |
| `flash` | `{ known: { <term>: true } }` |
| `interview` | `{ sessions, practiced: { <qid>: count }, flagged: { <qid>: true }, notes: { <qid>: string } }` |
| `case:<id>` | managed by the case engine |
| `last` | `{ route, label, at }`, set with `setLast()` so Home can offer "Continue where you left off". `route` may be `learn/bayes` or `#/learn/bayes`; Home handles both. |

Topic keys for Exam P General Probability (use these exact ids everywhere): `sets` (set rules, inclusion–exclusion), `counting` (permutations/combinations), `conditional` (conditional probability), `independence`, `bayes` (Bayes' theorem and the law of total probability).

## Adding a case
Create `js/cases/defs/<id>.js` exporting `{ id, title, sub, line, level, levelLabel, minutes, icon, audience, tagline, concepts, exam, inspiration, source, brief(), briefStats?(), primers, exhibits(st), tasks, stages, hints, pickShow, pickHint, model(), debrief(st), modelSummary, judgeBank, context(st), csv?() }` and add it to `js/cases/registry.js`. Task types: `num` (answer, tol or rtol, explain), `multi` (fields, answer(i), tol), `mcq` (options, correct, explain), `bench` (bench name, check(st)), `pick` (the final locked answer). Benches go in `js/cases/benches/` and are registered in `benches/index.js`.
