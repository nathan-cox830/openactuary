// Exam and topic registry. Every learning page (lesson, quiz, generator, formula sheet, progress) reads from here,
// so adding a topic means adding its content folder and one entry below.
//
// A topic folder holds: lesson.js (LESSON, STEPS), quiz.js (QUESTIONS, TOPICS), generator.js (TEMPLATES),
// formulas.js (FORMULA_GROUPS) and glossary.js (default { term: definition }). Lesson step ids, quiz ids and
// template ids must be unique across the whole site (prefix them, e.g. "uv-").
import { mulberry } from '../js/util.js';
import { buildChoices } from './exam-p/generator.js';

export const EXAMS = [
  {
    id: 'p', name: 'Exam P', title: 'Probability', status: 'live',
    blurb: 'The first SOA/CAS exam: probability tools for measuring risk. Three topics, each with a lesson, quiz questions and a problem generator.',
    topics: [
      { id: 'general-probability', title: 'General Probability', short: 'General Probability', weight: '23–30%', icon: 'dice',
        blurb: 'Sets, counting, conditional probability, independence and Bayes\' theorem.',
        load: () => Promise.all([import('./exam-p/lesson.js'), import('./exam-p/quiz.js'), import('./exam-p/generator.js'), import('./exam-p/formulas.js')]) },
      { id: 'univariate', title: 'Univariate Random Variables', short: 'Univariate RVs', weight: '44–50%', icon: 'chart',
        blurb: 'PMFs, PDFs and CDFs, expectation and variance, the named distributions, and deductibles and limits.',
        load: () => Promise.all([import('./exam-p/univariate/lesson.js'), import('./exam-p/univariate/quiz.js'), import('./exam-p/univariate/generator.js'), import('./exam-p/univariate/formulas.js')]) },
      { id: 'multivariate', title: 'Multivariate Random Variables', short: 'Multivariate RVs', weight: '23–30%', icon: 'layers',
        blurb: 'Joint and conditional distributions, covariance, sums of random variables, order statistics and the CLT.',
        load: () => Promise.all([import('./exam-p/multivariate/lesson.js'), import('./exam-p/multivariate/quiz.js'), import('./exam-p/multivariate/generator.js'), import('./exam-p/multivariate/formulas.js')]) },
    ],
  },
  {
    id: 'fm', name: 'Exam FM', title: 'Financial Mathematics', status: 'soon',
    blurb: 'Interest theory, annuities, loans, bonds, cash-flow analysis, duration and immunization. Coming soon.',
    topics: [],
  },
];

export const exam = id => EXAMS.find(e => e.id === id);
export const topicMeta = (examId, topicId) => exam(examId)?.topics.find(t => t.id === topicId);

const cache = {};
/** Load one topic's content. Resolves to null if its files are missing or broken. */
export async function loadTopic(examId, topicId) {
  const key = examId + '/' + topicId;
  if (key in cache) return cache[key];
  const meta = topicMeta(examId, topicId); if (!meta) return null;
  try {
    const [L, Q, G, F] = await meta.load();
    cache[key] = { examId, ...meta, lesson: L.LESSON, steps: L.STEPS, questions: Q.QUESTIONS, subtopics: Q.TOPICS, templates: G.TEMPLATES, formulas: F.FORMULA_GROUPS };
  } catch (e) { console.warn('Topic failed to load:', key, e); cache[key] = null; }
  return cache[key];
}
/** Load every available topic of an exam, in syllabus order. */
export async function loadExam(examId) {
  const ex = exam(examId); if (!ex) return [];
  return (await Promise.all(ex.topics.map(t => loadTopic(examId, t.id)))).filter(Boolean);
}
/** Every quiz subtopic label across all loaded topics: { key: label }. */
export function subtopicLabels(topics) { const out = {}; topics.forEach(t => Object.assign(out, t.subtopics)); return out; }
/** Which topic a lesson step belongs to. */
export function topicOfStep(topics, stepId) { return topics.find(t => t.steps.some(s => s.id === stepId)) || null; }

/** Build a full multiple-choice problem from a template list (same contract as data/exam-p/generator.js). */
export function makeProblemFrom(templates, tid, level, seed) {
  const tpl = templates.find(x => x.id === tid) || templates[0];
  const r = mulberry(seed);
  const g = tpl.gen(r, level);
  const choices = buildChoices(r, g.answer, g.wrongs, g.kind);
  return { tid: tpl.id, topic: tpl.topic, name: tpl.name, level, seed, q: g.q, steps: g.steps, kind: g.kind, params: g.params,
    answer: g.answer, choices, correctIndex: choices.findIndex(c => c.correct) };
}
