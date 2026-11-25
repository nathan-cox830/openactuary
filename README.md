# OpenActuary

Free actuarial exam prep and interactive insurance case studies. **Free forever, for everyone:** no accounts, no server, no API keys, no ads and no tracking. Everything runs in the visitor's browser, and progress is saved on their device.

## What's inside
- **Learn:** Exam P General Probability lesson with interactive Venn diagrams and Bayes trees, a formula sheet, and a glossary with flashcards.
- **Practice:** an Exam P-style quiz with worked solutions, and a problem generator that writes a fresh problem every time.
- **Cases:** interactive case studies that run Brief → Learn → Exhibits → Work → Recommend → Debrief:
  - *Who's a Risky Driver?* (Exam P level): Bayes' theorem and accident surcharges
  - *The Stale Triangle* (advanced): workers comp reserving on real Schedule P data
  - *Should We File?* (advanced): personal auto rate indication on real Schedule P data
- **Careers:** curated job searches, the path from first exam to credential, and a timed mock interview coach.
- **My progress:** a dashboard of everything saved in the browser, with export and import.

## Run it locally
ES modules don't load from `file://`, so serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy for free
The site is plain static files, so any static host works:
- **GitHub Pages:** push this folder to a repository, then go to Settings → Pages → Deploy from branch.
- **Netlify or Cloudflare Pages:** drag the folder onto their dashboard, or connect the repository. There's no build command, and the publish directory is the project root.

The only outside requests are for Google Fonts and KaTeX (from cdnjs). If those can't load, the site falls back to system fonts and plain-text math.

## Add content
- **A new case:** see "Adding a case" in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Each case is one file in `js/cases/defs/`, plus any calculators in `js/cases/benches/`. Life, health and retirement cases plug into the same engine.
- **Glossary terms:** `data/glossary-insurance.js` and `data/exam-p/glossary.js`.
- **Exam P content:** `data/exam-p/`.
- **Careers content:** `data/careers/`.

## Data and credits
Case data for The Stale Triangle and Should We File? comes from the CAS Loss Reserving Database (Schedule P data prepared by Glenn Meyers and Peng Shi, published by the Casualty Actuarial Society). Company names are fictional. Items marked "illustrative" were constructed for teaching. These two cases are adapted from P&C Case Lab. OpenActuary is independent and is not affiliated with the SOA or CAS. All practice questions are original.
