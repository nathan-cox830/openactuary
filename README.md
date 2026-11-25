# OpenActuary

Free actuarial exam prep and interactive insurance case studies. **Free forever, for everyone:** no accounts, no server, no API keys, no ads and no tracking. Everything runs in the visitor's browser, and progress is saved on their device.

## What's inside
- **Learn:** lessons on all three Exam P topics (General Probability, Univariate and Multivariate Random Variables) with interactive Venn diagrams, Bayes trees, a distribution explorer, a deductible and limit explorer, a joint distribution table and a central limit theorem simulator, plus a formula sheet and a glossary with flashcards.
- **Practice:** Exam P-style quizzes for each topic or across the whole exam, with worked solutions, and a problem generator that writes a fresh problem every time.
- **Cases:** interactive case studies that run Brief → Learn → Exhibits → Work → Recommend → Debrief, each with a built-in spreadsheet workbook (live formulas, no Excel needed):
  - *Who's a Risky Driver?* (Exam P level): Bayes' theorem and accident surcharges
  - *The Stale Triangle* (advanced): workers comp reserving on real Schedule P data
  - *Should We File?* (advanced): personal auto rate indication on real Schedule P data
- **Skills:** hands-on Excel tutorials in a built-in spreadsheet and SQL tutorials on a practice insurance database (real SQLite in the browser), checked automatically.
- **Careers:** curated job searches, the path from first exam to credential, and a timed mock interview coach.
- **My progress:** a dashboard of everything saved in the browser, with export and import.

## Run it locally
ES modules don't load from `file://`, so serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Live site
**https://nathan-cox830.github.io/openactuary/**, hosted free on GitHub Pages from the `main` branch of [nathan-cox830/openactuary](https://github.com/nathan-cox830/openactuary).

### Publish an update
From the project folder:

```bash
git add -A && git commit -m "Describe the change" && git push
```

GitHub Pages rebuilds automatically, and the live site updates in about a minute. Refresh with Cmd+Shift+R if you still see the old version.

Other free static hosts (Netlify, Cloudflare Pages) also work: there's no build command, and the publish directory is the project root.

The only outside requests are for Google Fonts, KaTeX (from cdnjs) and, on SQL lesson pages only, the sql.js SQLite engine (from cdnjs). If those can't load, the site falls back to system fonts and plain-text math.

## Add content
- **A new case:** see "Adding a case" in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Each case is one file in `js/cases/defs/`, plus any calculators in `js/cases/benches/`. Life, health and retirement cases plug into the same engine.
- **Glossary terms:** `data/glossary-insurance.js` and `data/exam-p/glossary.js`.
- **Exam content:** topics are listed in `data/exams.js`; each topic's lesson, quiz, generator, formulas and glossary live in its own folder under `data/exam-p/`.
- **Careers content:** `data/careers/`.

## Data and credits
Case data for The Stale Triangle and Should We File? comes from the CAS Loss Reserving Database (Schedule P data prepared by Glenn Meyers and Peng Shi, published by the Casualty Actuarial Society). Company names are fictional. Items marked "illustrative" were constructed for teaching. These two cases are adapted from P&C Case Lab. OpenActuary is independent and is not affiliated with the SOA or CAS. All practice questions are original.
