# OpenActuary architecture

A free, static site. No build step, no server, no API keys, no accounts, no AI services. Everything runs in the visitor's browser from plain HTML, CSS and ES modules. Progress is saved in `localStorage`.

Run locally: `python3 -m http.server 8000` in the project folder, then open http://localhost:8000. (ES modules don't load from `file://`.)

Live: https://nathan-cox830.github.io/openactuary/ (GitHub Pages, `main` branch, root folder). Publish by committing and pushing to `main`. The site is served under `/openactuary/`, so always use relative paths (never a leading `/`).

## Hard rules
- **Free forever:** never add a server, paid API, API key, account system, analytics or tracking. Only external requests allowed: Google Fonts, KaTeX from cdnjs, and sql.js 1.12.0 from cdnjs (loaded only on SQL lesson pages).
- **No external JS libraries** beyond KaTeX and sql.js. Charts are hand-written SVG (`js/ui/charts.js`).
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
js/ui/formula.js           spreadsheet formula engine (Excel subset): Workbook, shiftFormula, formatValue, FUNCTIONS
js/ui/sheet.js             spreadsheet grid UI: mountSheet(host, opts), buildWorkbook(rows, overrides), rowsOf()
css/sheet.css              spreadsheet grid + case workbook drawer
css/skills.css             Skills hub and lessons
js/ui/sql.js               SqlRunner (sql.js in a Web Worker, fresh DB per run, timeout) and compareResults()
data/skills/tracks.js      Skills tracks registry: TRACKS, loadTrack, loadAllTracks
data/skills/excel.js       Excel lessons (TRACK)
data/skills/sql.js         SQL lessons (TRACK)
data/skills/sql-db.js      practice database: TABLES (schema panel), SCHEMA_SQL, SEED_SQL
js/cases/engine.js         generic case workspace
js/cases/registry.js       list of cases (+ "coming soon" lines)
js/cases/defs/*.js         one file per case
js/cases/benches/*.js      interactive calculators used by cases
data/glossary-insurance.js insurance terms   { term: definition }
data/exam-p/glossary.js    probability terms { term: definition }
data/exams.js              exam/topic registry: EXAMS, loadTopic, loadExam, subtopicLabels, makeProblemFrom
data/exam-p/*.js           Exam P · General Probability lesson, quiz, generator, formulas (also buildChoices)
data/exam-p/<topic>/*.js   Exam P · univariate/ and multivariate/ topics (same five files each)
data/exam-fm/<topic>/*.js  Exam FM · tvm/, annuities/, bonds/, immunization/ (same five files each)
js/ui/fm-widgets.js        FM lesson widgets: timelineWidget, amortWidget, priceYieldWidget, immunizeWidget
js/ui/prob-widgets.js      lesson widgets: distWidget, coverageWidget, jointWidget, cltWidget (+ gammaP)
data/careers/*.js          job links, interview questions
```

## Routes
| Hash | View module | Notes |
|---|---|---|
| `#/` | views/home.js | |
| `#/learn` | views/learn-hub.js | every exam and topic with progress. Old `#/learn/<step>` links redirect to the topic lesson |
| `#/learn/<exam>/<topic>[/<step>]` | views/learn.js | topic lesson, e.g. `#/learn/p/univariate/uv-exponential` |
| `#/learn/formulas[/<exam>]` | views/formulas.js | KaTeX formula sheet for one exam (`p` default, `fm`) |
| `#/learn/glossary` | views/glossary.js | searchable glossary + flashcards |
| `#/practice[/<exam or topic>]` | views/practice.js | problem generator for one topic, with an exam switch |
| `#/practice/quiz[/<exam or topic>]` | views/quiz.js | topic quiz, or a mixed exam-length quiz across an exam (P 30, FM 35 questions) |
| `#/cases`, `#/cases/<id>/<tab>` | views/cases.js, views/case.js | case library / workspace |
| `#/skills` | views/skills.js | Excel and SQL tracks with progress |
| `#/skills/<track>/<lesson>[/<step>]` | views/skill-lesson.js | one step with a live spreadsheet or SQL editor, checked automatically |
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
| `learn` | `{ done: { <stepId>: true }, cur: { <topicId>: <stepId> }, current: <General Probability stepId, legacy> }`. Step ids are unique site-wide. |
| `quiz` | `{ history: [{ at: ms, score, total, secs, byTopic: { <subtopic>: [right, total] }, scope: <topicId or 'all'> }], missed: { <qid>: true }, best: percent 0–100 }` |
| `practice` | `{ attempts, correct, streak, bestStreak, byTemplate: { <templateId>: [right, total] } }` |
| `flash` | `{ known: { <term>: true } }` |
| `interview` | `{ sessions, practiced: { <qid>: count }, flagged: { <qid>: true }, notes: { <qid>: string } }` |
| `skills` | `{ done: { <stepId>: true }, helped: { <stepId>: true }, sheets: { <stepId>: overrides }, sql: { <stepId>: text }, hint: { <stepId>: n } }` |
| `case:<id>` | managed by the case engine (`wb` holds workbook edits, `wbOpen`/`wbH` the drawer state) |
| `last` | `{ route, label, at }`, set with `setLast()` so Home can offer "Continue where you left off". `route` may be `learn/bayes` or `#/learn/bayes`; Home handles both. |

## Exams and topics
`data/exams.js` lists each exam and its topics. A topic folder has five modules: `lesson.js` (`LESSON`, `STEPS`), `quiz.js` (`QUESTIONS`, `TOPICS` = subtopic labels), `generator.js` (`TEMPLATES`), `formulas.js` (`FORMULA_GROUPS`) and `glossary.js` (default `{ term: definition }`, merged in `js/ui/glossary.js`). Views load topics with `loadTopic(exam, topic)` / `loadExam(exam)`; a missing or broken topic is skipped rather than breaking the page. Ids for lesson steps, quiz questions and templates must be unique across the site (prefix them: `uv-`, `mv-`).

Generator templates return `{ q, answer, wrongs, kind, steps, params }` where `kind` is `prob` (4-dp probability), `int` (whole number) or `num` (any other decimal: means, variances, payments). A template (or a single result) may set `dp` to show `num` choices with fixed decimal places, e.g. `dp: 2` for money or `dp: 3` for durations. `buildChoices` in `data/exam-p/generator.js` turns that into five choices.

Lesson steps can set `widget` to `venn`, `bayes` (in views/learn.js), `dist`, `coverage`, `joint`, `clt` (js/ui/prob-widgets.js), `timeline`, `amort`, `priceyield` or `immunize` (js/ui/fm-widgets.js).

Topic ids are unique across exams (FM topics are prefixed `fm-`), so a route parameter can be an exam id or a topic id; `resolveScope()` in data/exams.js tells them apart.

Quiz subtopic keys (use these exact ids):
- General Probability: `sets`, `counting`, `conditional`, `independence`, `bayes`
- Univariate: `rv`, `moments`, `discrete`, `continuous`, `coverage`
- Multivariate: `joint`, `condexp`, `covariance`, `sums`, `orderclt`
- FM interest & TVM (`fm-tvm`, ids `fm-tv-`): `interest`, `force`, `equiv`, `realrates`
- FM annuities & loans (`fm-annuities`, ids `fm-an-`): `annuity`, `varying`, `loan`, `sinking`
- FM bonds & cash flows (`fm-bonds`, ids `fm-bd-`): `bond`, `bookvalue`, `cashflow`, `termstruct`
- FM duration & swaps (`fm-immunization`, ids `fm-im-`): `duration`, `immunize`, `swap`

Test generator templates without a browser: `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m test.mjs` runs ES modules on macOS (use `print()`).

## Adding a case
Create `js/cases/defs/<id>.js` exporting `{ id, title, sub, line, level, levelLabel, minutes, icon, audience, tagline, concepts, exam, inspiration, source, brief(), briefStats?(), primers, exhibits(st), tasks, stages, hints, pickShow, pickHint, model(), debrief(st), modelSummary, judgeBank, context(st), csv?() }` and add it to `js/cases/registry.js`. Optional `workbook: { inputs, formats, cols, checks, links }` turns `csv()` into the in-app case workbook (see below). Task types: `num` (answer, tol or rtol, explain), `multi` (fields, answer(i), tol), `mcq` (options, correct, explain), `bench` (bench name, check(st)), `pick` (the final locked answer). Benches go in `js/cases/benches/` and are registered in `benches/index.js`. Bench names are global, so prefix them by case (`lt*` life, `hl*` health, `pn*` pension). A bench placed outside a task (e.g. in a debrief, wrapped in `data-bench="name"` with a `data-bench-out`) also refreshes live.

Cases by line: P&C `risky-driver`, `stale-triangle`, `should-we-file`; life `mortality-table`; health `trend-watch`; retirement `promises-to-keep`. Remaining "coming soon": Hurricane Season and Messy Claims (P&C).

## Spreadsheets (in-app workbook)
`js/ui/formula.js` is a dependency-free formula engine: A1 and `$A$1` references, ranges, `+ - * / ^ & %`, comparisons, and these functions: SUM, AVERAGE, MIN, MAX, COUNT(A/BLANK/IF/IFS), SUMIF(S), AVERAGEIF(S), SUMPRODUCT, PRODUCT, ROUND(UP/DOWN), INT, MOD, ABS, SQRT, EXP, LN, LOG, POWER, FACT, COMBIN, STDEV, VAR, MEDIAN, IF, IFS, IFERROR, IFNA, AND, OR, NOT, IS*, text functions, VLOOKUP, HLOOKUP, XLOOKUP, INDEX, MATCH, LOGEST, PMT, PV, FV, NPER, NPV, IRR, RATE. Errors follow Excel (`#DIV/0!`, `#VALUE!`, `#REF!`, `#NAME?`, `#N/A`, `#NUM!`), plus `#CIRC!` for circular references.

`mountSheet(host, opts)` in `js/ui/sheet.js` draws an editable grid. Options: `rows` (2D array of raw values: numbers, text, or `=formulas`), `overrides` (the user's edits `{A1: raw}`, mutated in place and passed to `onChange`), `inputs` (ranges shaded as "yours to fill"), `formats` (`{range: 'int'|'dec3'|'pct1'|'money0'…}`), `cols` (`{A: 220}` widths), `checks` (`[{cell, label, answer, tol|rtol}]`, shown as pass/fail chips), `notes` (merge text-only rows into full-width notes). Keyboard: type to replace, F2 to edit, Enter/Tab, arrows (+Shift), Delete, Ctrl/Cmd+C/V/X/Z/Y/D/R, Ctrl+` shows formulas. Clicking a cell while typing a formula inserts its reference; the fill handle copies formulas with relative references shifted.

**Case workbooks:** if a case has `csv()`, the engine shows an "Open workbook" drawer on the Exhibits and Work tabs, built from the same rows as the CSV. Edits save in `case:<id>.wb`. `workbook.links` (`[{cell, path, scale}]`) powers "Use my task inputs" (copies task fields into input cells). Any case answer box accepts a workbook reference such as `=F52`; it is replaced by the value when checked. The CSV download includes the user's edits.

## Skills lessons
**Excel steps** (`data/skills/excel.js`): `{ id, title, body, sheet: { rows, cols, formats, inputs }, solution, check, require?, hints, takeaway }`. `solution` maps a cell or a range to a value/formula; a range key means the formula is written for its first cell and filled across the range (relative references shift). The checker builds a reference workbook from `rows` + `solution` and compares every cell in `check`, so expected values are never typed by hand. `require` rules (`{ range, formula | fn | pattern, msg }`) make sure the learner used the technique being taught. Each step's sheet is independent.

**SQL steps** (`data/skills/sql.js`): `{ id, title, body, tables, starter, solution, ordered, hints, takeaway }`. Queries run on a fresh copy of the practice database (`data/skills/sql-db.js`). The learner's result must match the reference query's: same column count, same rows (multiset unless `ordered`), numbers compared to 4 decimals, column names ignored. sql.js's SQLite has no `ln`/`exp`/`power`, so lessons avoid math functions.
