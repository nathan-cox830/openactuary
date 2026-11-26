// Exam P · General Probability problem generator.
// Each template: { id, topic, name, gen(rng, level) } where gen returns
//   { q (HTML), answer (number), wrongs (numbers from common mistakes), kind ('prob' | 'int'), steps (HTML), params }.
// makeProblem(templateId, level, seed) runs a template with a seeded RNG (mulberry32) and builds five shuffled,
// de-duplicated choices (A–E). Same (template, level, seed) always gives the same problem.
// Levels: 1 easy, 2 medium, 3 hard. All arithmetic is done here from the random parameters.
import { mulberry, choose } from '../../js/util.js';

const t = String.raw;

/* ---------- small helpers ---------- */
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
/** Decimal for display: rounded to dp places, trailing zeros trimmed, never exponent notation. */
const d = (x, dp = 4) => { let s = Number(x).toFixed(dp); if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s === '-0' ? '0' : s; };
/** "= x" when exact at dp places, "\approx x" otherwise. */
const eq = (x, dp = 4) => (Math.abs(x - Number(x.toFixed(dp))) < 1e-12 ? '= ' : '\\approx ') + d(x, dp);
/** Integer with thousands separators for HTML, and a TeX-safe version. */
const n = x => Math.round(x).toLocaleString('en-US');
const nt = x => n(x).replace(/,/g, '{,}');
const P = (nn, k) => { let v = 1; for (let i = 0; i < k; i++) v *= (nn - i); return v; };
const fact = k => P(k, k);
const sumA = a => a.reduce((s, x) => s + x, 0);
const tex = s => `<span class="tex">${s}</span>`;
const texd = s => `<div class="texd">${s}</div>`;
const pc = k => k + '%';                     // integer percent for prose

/* ---------- templates ---------- */
export const TEMPLATES = [
  {
    id: 'ie-coverage', topic: 'sets', name: 'Overlapping coverages',
    gen(r, L) {
      let both, ao, bo, ne;
      do { both = ri(r, 5, 25); ao = ri(r, 10, 40); bo = ri(r, 8, 35); ne = 100 - both - ao - bo; } while (ne < 5);
      const [c1, c2] = pick(r, [['auto', 'homeowners'], ['dental', 'vision'], ['life', 'disability'], ['renters', 'pet']]);
      const Ap = ao + both, Bp = bo + both;
      const A = Ap / 100, B = Bp / 100, AB = both / 100, U = (ao + bo + both) / 100, N = ne / 100;
      const params = { level: L, A, B, AB, N };
      if (L === 1) {
        return { kind: 'prob', params, answer: A + B - AB, wrongs: [A + B, A + B - 2 * AB, 1 - U, A + B - A * B, AB],
          q: `Of an insurer's customers, ${pc(Ap)} hold ${c1} coverage, ${pc(Bp)} hold ${c2} coverage and ${pc(both)} hold both. What is the probability that a randomly chosen customer holds at least one of the two?`,
          steps: `<p>"At least one" is the union. Add the two groups and subtract the overlap, which was counted twice:</p>${texd(t`P(A\cup B) = ${d(A)} + ${d(B)} - ${d(AB)} ${eq(A + B - AB)}`)}<p>Forgetting to subtract the overlap gives ${d(A + B)}.</p>` };
      }
      if (L === 2) {
        const ans = A + B - 2 * AB;
        return { kind: 'prob', params, answer: ans, wrongs: [U, A + B, A - AB, 1 - ans, N],
          q: `Of an insurer's customers, ${pc(Ap)} hold ${c1} coverage, ${pc(Bp)} hold ${c2} coverage and ${pc(both)} hold both. What is the probability that a randomly chosen customer holds exactly one of the two?`,
          steps: `<p>${c1[0].toUpperCase() + c1.slice(1)} only: ${tex(t`${d(A)} - ${d(AB)} = ${d(A - AB)}`)}. ${c2[0].toUpperCase() + c2.slice(1)} only: ${tex(t`${d(B)} - ${d(AB)} = ${d(B - AB)}`)}.</p>${texd(t`P(\text{exactly one}) = P(A) + P(B) - 2P(A\cap B) = ${d(A)} + ${d(B)} - 2(${d(AB)}) ${eq(ans)}`)}<p>The union, ${d(U)}, also counts the customers who hold both.</p>` };
      }
      const ans = A + B - 2 * AB;
      return { kind: 'prob', params, answer: ans, wrongs: [U, AB, 1 - ans, A + B - N, A - AB],
        q: `Of an insurer's customers, ${pc(Ap)} hold ${c1} coverage and ${pc(Bp)} hold ${c2} coverage. ${pc(ne)} hold neither. What is the probability that a randomly chosen customer holds exactly one of the two?`,
        steps: `<p>Neither is the complement of the union, so ${tex(t`P(A\cup B) = 1 - ${d(N)} = ${d(U)}`)}.</p><p>Inclusion-exclusion gives the overlap: ${tex(t`P(A\cap B) = ${d(A)} + ${d(B)} - ${d(U)} = ${d(AB)}`)}.</p>${texd(t`P(\text{exactly one}) = P(A\cup B) - P(A\cap B) = ${d(U)} - ${d(AB)} ${eq(ans)}`)}` };
    },
  },
  {
    id: 'ie-three', topic: 'sets', name: 'Three benefits (inclusion–exclusion)',
    gen(r, L) {
      let a, b, c, ab, ac, bc, abc, none;
      do {
        abc = ri(r, 2, 8); ab = ri(r, 2, 10); ac = ri(r, 2, 10); bc = ri(r, 2, 10);
        a = ri(r, 5, 22); b = ri(r, 5, 22); c = ri(r, 5, 22);
        none = 100 - (a + b + c + ab + ac + bc + abc);
      } while (none < 3);
      const pA = a + ab + ac + abc, pB = b + ab + bc + abc, pC = c + ac + bc + abc;
      const pAB = ab + abc, pAC = ac + abc, pBC = bc + abc;
      const S1 = (pA + pB + pC) / 100, S2 = (pAB + pAC + pBC) / 100, T = abc / 100;
      const U = S1 - S2 + T, NONE = 1 - U, EX1 = S1 - 2 * S2 + 3 * T;
      const params = { level: L, pA, pB, pC, pAB, pAC, pBC, abc };
      const q0 = `Employees may enroll in medical (M), dental (D) and vision (V) plans. ${pc(pA)} enroll in M, ${pc(pB)} in D and ${pc(pC)} in V. ${pc(pAB)} enroll in both M and D, ${pc(pAC)} in both M and V, ${pc(pBC)} in both D and V, and ${pc(abc)} in all three.`;
      const ie = texd(t`P(M\cup D\cup V) = (${d(pA / 100)} + ${d(pB / 100)} + ${d(pC / 100)}) - (${d(pAB / 100)} + ${d(pAC / 100)} + ${d(pBC / 100)}) + ${d(T)} = ${d(S1)} - ${d(S2)} + ${d(T)} ${eq(U)}`);
      if (L === 1) return { kind: 'prob', params, answer: U, wrongs: [S1 - S2, S1 - S2 - T, S1, NONE, EX1],
        q: q0 + ' What is the probability that a randomly chosen employee enrolls in at least one plan?',
        steps: `<p>Add the singles, subtract the pairs, add back the triple:</p>${ie}<p>Forgetting the triple overlap gives ${d(S1 - S2)}.</p>` };
      if (L === 2) return { kind: 'prob', params, answer: NONE, wrongs: [1 - (S1 - S2), 1 - (S1 - S2 - T), U, 1 - S1, EX1],
        q: q0 + ' What is the probability that a randomly chosen employee enrolls in none of the plans?',
        steps: `<p>First the union by inclusion-exclusion:</p>${ie}<p>Then the complement: ${tex(t`P(\text{none}) = 1 - ${d(U)} ${eq(NONE)}`)}.</p>` };
      return { kind: 'prob', params, answer: EX1, wrongs: [U, S1 - S2, S1 - 2 * S2 + T, NONE, S1 - 2 * S2 + 2 * T],
        q: q0 + ' What is the probability that a randomly chosen employee enrolls in exactly one plan?',
        steps: `<p>Count each region once. "Exactly one" keeps each single region, so</p>${texd(t`P(\text{exactly one}) = \sum P(\text{single}) - 2\sum P(\text{pair}) + 3P(\text{all three})`)}<p>Each pair overlap was counted twice in the singles and must be removed twice; the triple was counted three times, removed six times, and must be added back three times.</p>${texd(t`= ${d(S1)} - 2(${d(S2)}) + 3(${d(T)}) ${eq(EX1)}`)}<p>Check by regions: M only ${tex(d(a / 100))}, D only ${tex(d(b / 100))}, V only ${tex(d(c / 100))}, total ${tex(d((a + b + c) / 100))}.</p>` };
    },
  },
  {
    id: 'perm-assign', topic: 'counting', name: 'Arrangements and permutations',
    gen(r, L) {
      if (L === 1) {
        const nn = ri(r, 5, 9), k = ri(r, 2, Math.min(4, nn - 1));
        const ans = P(nn, k);
        return { kind: 'int', params: { level: L, n: nn, k }, answer: ans, wrongs: [choose(nn, k), nn ** k, fact(k), P(nn, k - 1), nn * k],
          q: `${k} different claims must each be assigned to a different adjuster, chosen from a team of ${nn}. In how many ways can the claims be assigned?`,
          steps: `<p>Order matters: which adjuster gets which claim. The first claim has ${nn} choices, the next ${nn - 1}, and so on.</p>${texd(t`P(${nn},${k}) = \frac{${nn}!}{${nn - k}!} = ${Array.from({ length: k }, (_, i) => nn - i).join(t` \times `)} = ${nt(ans)}`)}<p>${tex(t`\binom{${nn}}{${k}} = ${nt(choose(nn, k))}`)} would count only which adjusters are used, not who gets which claim.</p>` };
      }
      if (L === 2) {
        const nn = ri(r, 5, 8); const ans = 2 * fact(nn - 1);
        return { kind: 'int', params: { level: L, n: nn }, answer: ans, wrongs: [fact(nn - 1), fact(nn), fact(nn) - ans, 2 * fact(nn - 2), fact(nn) / 2],
          q: `${nn} claim files will be processed one after another. Two of them involve the same policyholder and must be processed consecutively (in either order). How many processing orders are possible?`,
          steps: `<p>Glue the two related files into one block. Now arrange ${nn - 1} items: ${tex(t`${nn - 1}! = ${nt(fact(nn - 1))}`)}.</p><p>The two files inside the block can be in ${tex('2! = 2')} orders.</p>${texd(t`2 \times ${nn - 1}! = 2 \times ${nt(fact(nn - 1))} = ${nt(ans)}`)}` };
      }
      const nn = ri(r, 6, 9); const ans = 6 / (nn * (nn - 1));
      return { kind: 'prob', params: { level: L, n: nn }, answer: ans, wrongs: [1 / (nn * (nn - 1)), 1 / choose(nn, 3), 3 / nn, 1 - ans],
        q: `${nn} applications are reviewed in a random order. Three of them came from the same broker. What is the probability that the broker's three applications are reviewed consecutively?`,
        steps: `<p>Total orders: ${tex(t`${nn}! = ${nt(fact(nn))}`)}.</p><p>Treat the three as one block: arrange ${nn - 2} items in ${tex(t`${nn - 2}! = ${nt(fact(nn - 2))}`)} ways, times ${tex('3! = 6')} orders inside the block.</p>${texd(t`\frac{3!\,${nn - 2}!}{${nn}!} = \frac{${nt(6 * fact(nn - 2))}}{${nt(fact(nn))}} = \frac{6}{${nn}\cdot ${nn - 1}} ${eq(ans)}`)}<p>Forgetting the ${tex('3!')} internal orders gives ${d(1 / (nn * (nn - 1)), 4)}.</p>` };
    },
  },
  {
    id: 'committee', topic: 'counting', name: 'Committees and samples',
    gen(r, L) {
      let A, U, m, j;
      do { A = ri(r, 4, 9); U = ri(r, 3, 8); m = ri(r, 3, 5); j = ri(r, 1, m - 1); } while (j > A || m - j > U || (L === 3 && A < m));
      const tot = choose(A + U, m), fav = choose(A, j) * choose(U, m - j);
      const params = { level: L, A, U, m, j };
      const intro = `A committee of ${m} is chosen from ${A} actuaries and ${U} underwriters.`;
      if (L === 1) return { kind: 'int', params, answer: fav, wrongs: [tot, choose(A, j) + choose(U, m - j), P(A, j) * P(U, m - j), choose(A, j) * choose(A + U - j, m - j)],
        q: `${intro} How many different committees have exactly ${j} actuar${j === 1 ? 'y' : 'ies'}?`,
        steps: `<p>Choose the actuaries and the underwriters separately, then multiply (multiplication principle). Order does not matter, so use combinations.</p>${texd(t`\binom{${A}}{${j}}\binom{${U}}{${m - j}} = ${choose(A, j)} \times ${choose(U, m - j)} = ${nt(fav)}`)}<p>Adding instead of multiplying gives ${choose(A, j) + choose(U, m - j)}.</p>` };
      if (L === 2) {
        const ans = fav / tot, pa = A / (A + U);
        return { kind: 'prob', params, answer: ans, wrongs: [choose(m, j) * pa ** j * (1 - pa) ** (m - j), choose(A, j) / tot, 1 - ans, pa, j / m],
          q: `${intro} If every committee is equally likely, what is the probability that it has exactly ${j} actuar${j === 1 ? 'y' : 'ies'}?`,
          steps: `<p>Total committees: ${tex(t`\binom{${A + U}}{${m}} = ${nt(tot)}`)}. Favorable: ${tex(t`\binom{${A}}{${j}}\binom{${U}}{${m - j}} = ${nt(fav)}`)}.</p>${texd(t`\frac{${nt(fav)}}{${nt(tot)}} ${eq(ans)}`)}<p>A binomial with ${tex(t`p = ${A}/${A + U}`)} would treat the picks as independent (with replacement); here people cannot be chosen twice.</p>` };
      }
      const none = choose(A, m) / tot, ans = 1 - none;
      return { kind: 'prob', params, answer: ans, wrongs: [U * choose(A, m - 1) / tot, 1 - (A / (A + U)) ** m, none, U / (A + U), m * U / (A + U)],
        q: `${intro} If every committee is equally likely, what is the probability that it includes at least one underwriter?`,
        steps: `<p>Use the complement: no underwriters means all ${m} members are actuaries.</p>${texd(t`P(\text{no underwriters}) = \frac{\binom{${A}}{${m}}}{\binom{${A + U}}{${m}}} = \frac{${nt(choose(A, m))}}{${nt(tot)}}`)}${texd(t`P(\text{at least one}) = 1 - \frac{${nt(choose(A, m))}}{${nt(tot)}} ${eq(ans)}`)}` };
    },
  },
  {
    id: 'cond-table', topic: 'conditional', name: 'Two-way table',
    gen(r, L) {
      const n1 = 10 * ri(r, 10, 40), r1 = ri(r, 15, 35), n2 = 10 * ri(r, 50, 150), r2 = ri(r, 5, 14);
      const c1 = Math.round(n1 * r1 / 100), c2 = Math.round(n2 * r2 / 100);
      const N = n1 + n2, C = c1 + c2;
      const params = { level: L, n1, c1, n2, c2 };
      const table = `<div class="tblwrap"><table><thead><tr><th>Driver age</th><th>Claim</th><th>No claim</th><th>Total</th></tr></thead><tbody>
<tr><td>Under 25</td><td class="num">${n(c1)}</td><td class="num">${n(n1 - c1)}</td><td class="num">${n(n1)}</td></tr>
<tr><td>25 and over</td><td class="num">${n(c2)}</td><td class="num">${n(n2 - c2)}</td><td class="num">${n(n2)}</td></tr>
<tr class="total"><td>Total</td><td class="num">${n(C)}</td><td class="num">${n(N - C)}</td><td class="num">${n(N)}</td></tr></tbody></table></div>`;
      const intro = `<p>An auto insurer reviews ${n(N)} policies for one year:</p>${table}`;
      if (L === 1) { const ans = c1 / n1;
        return { kind: 'prob', params, answer: ans, wrongs: [c1 / C, c1 / N, C / N, c2 / n2, n1 / N],
          q: intro + `<p>A policy with a driver under 25 is chosen at random. What is the probability that it had a claim?</p>`,
          steps: `<p>"Given under 25" restricts attention to that row (${n(n1)} policies).</p>${texd(t`P(\text{claim}\mid\text{under 25}) = \frac{${nt(c1)}}{${nt(n1)}} ${eq(ans)}`)}<p>Dividing by the claim column total instead gives the reverse conditional, ${d(c1 / C)}.</p>` }; }
      if (L === 2) { const ans = c1 / C;
        return { kind: 'prob', params, answer: ans, wrongs: [c1 / n1, c1 / N, n1 / N, c2 / C, C / N],
          q: intro + `<p>A policy that had a claim is chosen at random. What is the probability that its driver is under 25?</p>`,
          steps: `<p>"Given a claim" restricts attention to the claim column (${n(C)} policies).</p>${texd(t`P(\text{under 25}\mid\text{claim}) = \frac{${nt(c1)}}{${nt(C)}} ${eq(ans)}`)}<p>${tex(t`P(\text{claim}\mid\text{under 25}) = ${nt(c1)}/${nt(n1)} ${eq(c1 / n1)}`)} is a different question.</p>` }; }
      const ans = (n1 - c1) / (N - C);
      return { kind: 'prob', params, answer: ans, wrongs: [(n1 - c1) / n1, (n1 - c1) / N, n1 / N, c1 / C, (n2 - c2) / (N - C)],
        q: intro + `<p>A policy with no claim is chosen at random. What is the probability that its driver is under 25?</p>`,
        steps: `<p>Restrict to the "No claim" column: ${tex(t`${nt(N)} - ${nt(C)} = ${nt(N - C)}`)} policies, of which ${n(n1 - c1)} have a driver under 25.</p>${texd(t`P(\text{under 25}\mid\text{no claim}) = \frac{${nt(n1 - c1)}}{${nt(N - C)}} ${eq(ans)}`)}<p>Compare with the overall share of young drivers, ${tex(t`${nt(n1)}/${nt(N)} ${eq(n1 / N)}`)}: a clean year makes "under 25" a little less likely.</p>` };
    },
  },
  {
    id: 'seq-draw', topic: 'conditional', name: 'Drawing without replacement',
    gen(r, L) {
      const N = ri(r, 8, 20), K = ri(r, 2, Math.floor(N / 2));
      const params = { level: L, N, K };
      const intro = `A drawer holds ${N} claim files, ${K} of which are large-loss claims. Files are drawn at random, one at a time, without replacement.`;
      if (L === 1) { const ans = K * (K - 1) / (N * (N - 1));
        return { kind: 'prob', params, answer: ans, wrongs: [(K / N) ** 2, K * (K - 1) / (N * N), K / N, (K - 1) / (N - 1)],
          q: intro + ' Two files are drawn. What is the probability that both are large-loss claims?',
          steps: `<p>Multiplication rule: the second draw is conditional on the first.</p>${texd(t`P(\text{both}) = \frac{${K}}{${N}} \times \frac{${K - 1}}{${N - 1}} = \frac{${K * (K - 1)}}{${N * (N - 1)}} ${eq(ans)}`)}<p>Using ${tex(t`(${K}/${N})^2`)} would assume the first file goes back in the drawer.</p>` }; }
      if (L === 2) { const ans = 2 * K * (N - K) / (N * (N - 1));
        return { kind: 'prob', params, answer: ans, wrongs: [K * (N - K) / (N * (N - 1)), 2 * (K / N) * (1 - K / N), K / N, 1 - K * (K - 1) / (N * (N - 1))],
          q: intro + ' Two files are drawn. What is the probability that exactly one of them is a large-loss claim?',
          steps: `<p>Two orders give exactly one: large then small, or small then large.</p>${texd(t`\frac{${K}}{${N}}\cdot\frac{${N - K}}{${N - 1}} + \frac{${N - K}}{${N}}\cdot\frac{${K}}{${N - 1}} = \frac{2 \cdot ${K} \cdot ${N - K}}{${N}\cdot ${N - 1}} ${eq(ans)}`)}<p>Counting only one order gives ${d(K * (N - K) / (N * (N - 1)))}.</p>` }; }
      const ans = (N - K) * (N - K - 1) * K / (N * (N - 1) * (N - 2));
      return { kind: 'prob', params, answer: ans, wrongs: [((N - K) / N) ** 2 * (K / N), K / N, Math.min(0.9999, 3 * ans), K / (N - 2)],
        q: intro + ' What is the probability that the first large-loss claim appears on the third draw?',
        steps: `<p>The first two files must be ordinary and the third large. Chain the conditional probabilities:</p>${texd(t`\frac{${N - K}}{${N}} \times \frac{${N - K - 1}}{${N - 1}} \times \frac{${K}}{${N - 2}} = \frac{${nt((N - K) * (N - K - 1) * K)}}{${nt(N * (N - 1) * (N - 2))}} ${eq(ans)}`)}<p>${tex(t`${K}/${N}`)} is the chance the third file is large, ignoring what came before.</p>` };
    },
  },
  {
    id: 'cond-formula', topic: 'conditional', name: 'Conditional from set probabilities',
    gen(r, L) {
      let both, ao, bo, ne;
      do { both = ri(r, 5, 30); ao = ri(r, 5, 35); bo = ri(r, 5, 35); ne = 100 - both - ao - bo; } while (ne < 10);
      const A = (ao + both) / 100, B = (bo + both) / 100, AB = both / 100, U = (ao + bo + both) / 100;
      const params = { level: L, A, B, AB, U };
      const ev = 'Let A be the event that a randomly chosen policyholder files a claim this year and B the event that the policyholder lives in an urban area.';
      if (L === 1) { const ans = AB / B;
        return { kind: 'prob', params, answer: ans, wrongs: [AB, B, AB * B, 1 - ans, AB / (1 - B)],
          q: `${ev} ${tex(t`P(A\cap B) = ${d(AB)}`)} and ${tex(t`P(B) = ${d(B)}`)}. Calculate ${tex(t`P(A\mid B)`)}.`,
          steps: texd(t`P(A\mid B) = \frac{P(A\cap B)}{P(B)} = \frac{${d(AB)}}{${d(B)}} ${eq(ans)}`) + '<p>The joint probability is not the conditional one; divide by the probability of the condition.</p>' }; }
      if (L === 2) { const ans = AB / B;
        return { kind: 'prob', params, answer: ans, wrongs: [AB / A, AB, AB / U, A, A * B],
          q: `${ev} ${tex(t`P(A) = ${d(A)}`)}, ${tex(t`P(B) = ${d(B)}`)} and ${tex(t`P(A\cup B) = ${d(U)}`)}. Calculate ${tex(t`P(A\mid B)`)}.`,
          steps: `<p>First the overlap: ${tex(t`P(A\cap B) = ${d(A)} + ${d(B)} - ${d(U)} = ${d(AB)}`)}.</p>${texd(t`P(A\mid B) = \frac{${d(AB)}}{${d(B)}} ${eq(ans)}`)}<p>Dividing by ${tex('P(A)')} instead gives ${tex(t`P(B\mid A) ${eq(AB / A)}`)}.</p>` }; }
      const ans = (U - B) / (1 - B);
      return { kind: 'prob', params, answer: ans, wrongs: [U - B, (U - B) / (1 - A), AB / (1 - B), A, 1 - ans],
        q: `${ev} ${tex(t`P(A) = ${d(A)}`)}, ${tex(t`P(B) = ${d(B)}`)} and ${tex(t`P(A\cup B) = ${d(U)}`)}. Calculate ${tex(t`P(A\mid B^{c})`)}, the probability of a claim for a policyholder outside urban areas.`,
        steps: `<p>The part of A outside B is the union minus B: ${tex(t`P(A\cap B^{c}) = P(A\cup B) - P(B) = ${d(U)} - ${d(B)} = ${d(U - B)}`)}.</p>${texd(t`P(A\mid B^{c}) = \frac{P(A\cap B^{c})}{1 - P(B)} = \frac{${d(U - B)}}{${d(1 - B)}} ${eq(ans)}`)}` };
    },
  },
  {
    id: 'atleast-one', topic: 'independence', name: '"At least one" with independence',
    gen(r, L) {
      const thing = pick(r, [['buildings', 'a fire claim'], ['policies', 'a claim'], ['delivery vans', 'an accident'], ['warehouses', 'a flood claim']]);
      if (L === 1) {
        const k = ri(r, 3, 8), pp = ri(r, 2, 15), p = pp / 100; const ans = 1 - (1 - p) ** k;
        return { kind: 'prob', params: { level: L, k, p }, answer: ans, wrongs: [k * p, p ** k, (1 - p) ** k, 1 - p ** k],
          q: `An insurer covers ${k} ${thing[0]}. Each has probability ${d(p)} of ${thing[1]} this year, independently of the others. What is the probability that at least one has ${thing[1]}?`,
          steps: `<p>Use the complement. With independence, the probability that none has ${thing[1]} is a product:</p>${texd(t`P(\text{none}) = (1 - ${d(p)})^{${k}} = ${d(1 - p)}^{${k}} ${eq((1 - p) ** k, 6)}`)}${texd(t`P(\text{at least one}) = 1 - ${d((1 - p) ** k, 6)} ${eq(ans)}`)}<p>Adding ${tex(t`${k} \times ${d(p)} = ${d(k * p)}`)} double counts years with two or more.</p>` };
      }
      if (L === 2) {
        const ps = [ri(r, 3, 25), ri(r, 3, 25), ri(r, 3, 25)].map(x => x / 100);
        const none = ps.reduce((s, p) => s * (1 - p), 1), ans = 1 - none;
        return { kind: 'prob', params: { level: L, ps }, answer: ans, wrongs: [sumA(ps), ps.reduce((s, p) => s * p, 1), none, 1 - ps.reduce((s, p) => s * p, 1)],
          q: `An insurer covers three ${thing[0]} with probabilities ${d(ps[0])}, ${d(ps[1])} and ${d(ps[2])} of ${thing[1]} this year, independently. What is the probability that at least one has ${thing[1]}?`,
          steps: `${texd(t`P(\text{none}) = (1-${d(ps[0])})(1-${d(ps[1])})(1-${d(ps[2])}) = ${d(1 - ps[0])} \times ${d(1 - ps[1])} \times ${d(1 - ps[2])} ${eq(none, 6)}`)}${texd(t`P(\text{at least one}) = 1 - ${d(none, 6)} ${eq(ans)}`)}` };
      }
      const k = ri(r, 3, 7), pp = ri(r, 5, 25), p = pp / 100; const ans = k * p * (1 - p) ** (k - 1);
      return { kind: 'prob', params: { level: L, k, p }, answer: ans, wrongs: [p * (1 - p) ** (k - 1), 1 - (1 - p) ** k, k * p, (1 - p) ** k],
        q: `An insurer covers ${k} ${thing[0]}. Each has probability ${d(p)} of ${thing[1]} this year, independently. What is the probability that exactly one of them has ${thing[1]}?`,
        steps: `<p>Pick which one has the event (${k} ways), then multiply: that one happens, the other ${k - 1} do not.</p>${texd(t`\binom{${k}}{1}(${d(p)})(1-${d(p)})^{${k - 1}} = ${k} \times ${d(p)} \times ${d((1 - p) ** (k - 1), 6)} ${eq(ans)}`)}<p>Leaving out the factor ${k} gives the probability for one particular ${thing[0].replace(/s$/, '')} only.</p>` };
    },
  },
  {
    id: 'indep-union', topic: 'independence', name: 'Independent events',
    gen(r, L) {
      const a = ri(r, 10, 60) / 100, b = ri(r, 10, 60) / 100;
      if (L === 1) { const ans = a + b - a * b;
        return { kind: 'prob', params: { level: L, a, b }, answer: ans, wrongs: [a + b, a * b, a + b - 2 * a * b, 1 - a * b],
          q: `A and B are independent events with ${tex(t`P(A) = ${d(a)}`)} and ${tex(t`P(B) = ${d(b)}`)}. Calculate ${tex(t`P(A\cup B)`)}.`,
          steps: `<p>Independence gives the overlap as a product: ${tex(t`P(A\cap B) = ${d(a)} \times ${d(b)} = ${d(a * b)}`)}.</p>${texd(t`P(A\cup B) = ${d(a)} + ${d(b)} - ${d(a * b)} ${eq(ans)}`)}` }; }
      if (L === 2) { const u = a + b - a * b, ans = b;
        return { kind: 'prob', params: { level: L, a, u }, answer: ans, wrongs: [u - a, (u - a) / a, 1 - b, (u - a) / (1 - u)],
          q: `A and B are independent with ${tex(t`P(A) = ${d(a)}`)} and ${tex(t`P(A\cup B) = ${d(u)}`)}. Calculate ${tex(t`P(B)`)}.`,
          steps: `<p>Write ${tex('x = P(B)')}. Inclusion-exclusion with independence:</p>${texd(t`${d(u)} = ${d(a)} + x - ${d(a)}x = ${d(a)} + ${d(1 - a)}x`)}${texd(t`x = \frac{${d(u)} - ${d(a)}}{${d(1 - a)}} = \frac{${d(u - a)}}{${d(1 - a)}} ${eq(ans)}`)}<p>Answering ${d(u - a)} treats A and B as mutually exclusive.</p>` }; }
      const c = ri(r, 10, 60) / 100; const s2 = a * b + a * c + b * c, abc = a * b * c, ans = s2 - 3 * abc;
      return { kind: 'prob', params: { level: L, a, b, c }, answer: ans, wrongs: [s2, s2 - 2 * abc, abc, 1 - ans],
        q: `Three independent risks have probabilities ${d(a)}, ${d(b)} and ${d(c)} of producing a claim this year. What is the probability that exactly two of them produce a claim?`,
        steps: `<p>Add the three ways to get exactly two, each a product because of independence:</p>${texd(t`${d(a)}(${d(b)})(${d(1 - c)}) + ${d(a)}(${d(1 - b)})(${d(c)}) + (${d(1 - a)})(${d(b)})(${d(c)})`)}${texd(t`= ${d(a * b * (1 - c), 6)} + ${d(a * (1 - b) * c, 6)} + ${d((1 - a) * b * c, 6)} ${eq(ans)}`)}<p>Adding just the pairwise products, ${d(s2)}, counts the case where all three happen three times.</p>` };
    },
  },
  {
    id: 'total-prob', topic: 'bayes', name: 'Total probability across risk classes',
    gen(r, L) {
      const k = L + 1;
      const names = { 2: ['Low risk', 'High risk'], 3: ['Preferred', 'Standard', 'Substandard'], 4: ['Preferred', 'Standard', 'Rated', 'High risk'] }[k];
      let w; do { w = Array.from({ length: k - 1 }, () => ri(r, 10, 60)); w.push(100 - sumA(w)); } while (w[k - 1] < 10);
      const rates = Array.from({ length: k }, () => ri(r, 1, 30)).sort((x, y) => x - y);
      const W = w.map(x => x / 100), R = rates.map(x => x / 100);
      const terms = W.map((x, i) => x * R[i]); const ans = sumA(terms);
      const mean = sumA(R) / k;
      return { kind: 'prob', params: { level: L, w: W, rates: R }, answer: ans,
        wrongs: [mean, sumA(R), ans - terms[k - 1], R[W.indexOf(Math.max(...W))], sumA(terms.slice(1))],
        q: `A portfolio is split into ${k} risk classes: ${names.map((nm, i) => `${nm} ${pc(w[i])}`).join(', ')}. The probability of a claim this year is ${names.map((nm, i) => `${d(R[i])} (${nm.toLowerCase()})`).join(', ')}. What is the probability that a randomly chosen policy has a claim?`,
        steps: `<p>The classes form a partition, so weight each class's claim rate by its share of the portfolio (law of total probability):</p>${texd(W.map((x, i) => t`${d(x)}(${d(R[i])})`).join(' + ') + ' = ' + terms.map(x => d(x, 6)).join(' + ') + ' ' + eq(ans))}<p>The simple average of the rates, ${d(mean)}, ignores how big each class is.</p>` };
    },
  },
  {
    id: 'bayes-post', topic: 'bayes', name: "Bayes' theorem",
    gen(r, L) {
      if (L === 3) {
        const k = 3, names = ['preferred', 'standard', 'substandard'];
        let w; do { w = [ri(r, 10, 60), ri(r, 10, 60)]; w.push(100 - w[0] - w[1]); } while (w[2] < 10);
        const R = [ri(r, 1, 30), ri(r, 1, 30), ri(r, 1, 30)].sort((x, y) => x - y).map(x => x / 100), W = w.map(x => x / 100);
        const j = ri(r, 0, 2); const joint = W.map((x, i) => x * R[i]); const tot = sumA(joint); const ans = joint[j] / tot;
        return { kind: 'prob', params: { level: L, w: W, rates: R, j }, answer: ans, wrongs: [R[j], W[j], joint[j], R[j] / sumA(R), 1 - ans],
          q: `An insurer's policies are ${pc(w[0])} preferred, ${pc(w[1])} standard and ${pc(w[2])} substandard. The annual claim probabilities are ${d(R[0])}, ${d(R[1])} and ${d(R[2])} respectively. A policy has a claim. What is the probability that it is ${names[j]}?`,
          steps: `<p>Joint probability of each class and a claim: ${W.map((x, i) => tex(t`${d(x)}(${d(R[i])}) = ${d(joint[i], 6)}`)).join(', ')}.</p><p>Total probability of a claim: ${tex(t`${joint.map(x => d(x, 6)).join(' + ')} = ${d(tot, 6)}`)}.</p>${texd(t`P(\text{${names[j]}}\mid\text{claim}) = \frac{${d(joint[j], 6)}}{${d(tot, 6)}} ${eq(ans)}`)}<p>${d(R[j])} is the reverse conditional, ${tex(t`P(\text{claim}\mid\text{${names[j]}})`)}.</p>` };
      }
      const p = ri(r, 1, 10) / 100, s = ri(r, 70, 99) / 100, f = ri(r, 2, 15) / 100;
      const sc = pick(r, [
        { pop: 'claims', one: 'claim', Hs: 'are fraudulent', Hq: 'is fraudulent', pos: 'are flagged by the fraud screen', posOne: 'is flagged', negOne: 'is not flagged' },
        { pop: 'applicants', one: 'applicant', Hs: 'have the condition', Hq: 'has the condition', pos: 'test positive on a screening exam', posOne: 'tests positive', negOne: 'tests negative' },
        { pop: 'drivers', one: 'driver', Hs: 'are high risk', Hq: 'is high risk', pos: 'trigger a telematics alert', posOne: 'triggers an alert', negOne: 'does not trigger an alert' },
      ]);
      const pop = sc.pop;
      const tp = p * s, fp = (1 - p) * f, Ppos = tp + fp;
      const intro = `${pc(Math.round(p * 100))} of ${sc.pop} ${sc.Hs}. ${pc(Math.round(s * 100))} of those that ${sc.Hs} ${sc.pos}, and ${pc(Math.round(f * 100))} of the others also ${sc.pos}.`;
      if (L === 1) { const ans = tp / Ppos;
        return { kind: 'prob', params: { level: L, p, s, f }, answer: ans, wrongs: [s, Ppos, tp, s / (s + f), p],
          q: `${intro} A randomly chosen ${sc.one} ${sc.posOne}. What is the probability that the ${sc.one} ${sc.Hq}?`,
          steps: `<p>Total probability of the evidence:</p>${texd(t`P(+) = ${d(p)}(${d(s)}) + ${d(1 - p)}(${d(f)}) = ${d(tp, 6)} + ${d(fp, 6)} = ${d(Ppos, 6)}`)}<p>Bayes' theorem:</p>${texd(t`P(H\mid +) = \frac{${d(tp, 6)}}{${d(Ppos, 6)}} ${eq(ans)}`)}<p>${d(s)} is ${tex(t`P(+\mid H)`)}, the other direction. In 10,000 ${pop}: about ${n(10000 * tp)} true and ${n(10000 * fp)} false positives.</p>` }; }
      const tn = (1 - p) * (1 - f), fn = p * (1 - s), Pneg = tn + fn, ans = fn / Pneg;
      return { kind: 'prob', params: { level: L, p, s, f }, answer: ans, wrongs: [1 - s, p, fn, (1 - s) / ((1 - s) + (1 - f)), tp / Ppos],
        q: `${intro} A randomly chosen ${sc.one} ${sc.negOne}. What is the probability that the ${sc.one} ${sc.Hq} anyway?`,
        steps: `<p>Total probability of a negative result:</p>${texd(t`P(-) = ${d(p)}(${d(1 - s)}) + ${d(1 - p)}(${d(1 - f)}) = ${d(fn, 6)} + ${d(tn, 6)} = ${d(Pneg, 6)}`)}${texd(t`P(H\mid -) = \frac{${d(fn, 6)}}{${d(Pneg, 6)}} ${eq(ans)}`)}<p>A negative result lowers the probability from the prior of ${d(p)}, but not to zero.</p>` };
    },
  },
];

export const LEVELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

/* ---------- choices ---------- */
function shuffle(r, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** Five choices: the answer plus four distinct wrong values (common mistakes first, then nearby fillers). */
export function buildChoices(r, answer, wrongs, kind, dp) {
  // 'int': whole numbers; 'prob': probabilities to 4 dp; 'num': any other decimal (means, variances, payments)
  const fmtNum = v => Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(+v.toPrecision(Math.abs(v) >= 1 ? 6 : 4));
  // dp (optional, 'num' only): fixed decimal places, e.g. 2 for money or 3 for durations
  const fmtDp = v => v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const fmt = kind === 'int' ? (v => Math.round(v).toLocaleString('en-US')) : kind === 'num' ? (dp != null ? fmtDp : fmtNum) : (v => v.toFixed(4));
  // wrong values must be valid answers too: whole numbers ≥ 1, probabilities that display strictly between 0 and 1,
  // or (for 'num') finite values with the same sign as the answer
  const ok = v => isFinite(v) && (kind === 'int' ? v >= 1 && Math.abs(v - Math.round(v)) < 1e-9
    : kind === 'num' ? (answer >= 0 ? v >= 0 : v < 0) && Math.abs(v) > 1e-9
    : +fmt(v) > 0 && +fmt(v) < 1);
  const ansT = fmt(answer); const seen = new Set([ansT]); const out = [];
  const add = v => { if (out.length >= 4 || !ok(v)) return; const s = fmt(v); if (seen.has(s)) return; seen.add(s); out.push({ text: s, value: v, correct: false }); };
  wrongs.forEach(add);
  const fill = kind === 'int'
    ? [answer * 2, Math.round(answer / 2), answer + 1, answer - 1, answer + 2, answer * 3, answer + 10, answer - 2]
    : kind === 'num' ? [answer * 1.25, answer * 0.8, answer * 1.5, answer * 0.6, answer * 2, answer / 2, answer * 1.1, answer * 0.9, answer * 3]
    : [answer * 1.25, answer * 0.8, answer + 0.05, answer - 0.05, answer * 1.5, answer * 0.6, answer + 0.1, answer - 0.1, answer * 2, answer / 2, answer + 0.02, answer - 0.02];
  fill.forEach(add);
  for (let k = 1; out.length < 4 && k < 200; k++) add(kind === 'int' ? answer + 3 * k : kind === 'num' ? answer * (1 + 0.07 * k) : answer + 0.0137 * k);
  out.push({ text: ansT, value: answer, correct: true });
  return shuffle(r, out);
}

/** Build a full problem from a template id, level (1–3) and integer seed. */
export function makeProblem(tid, level, seed) {
  const tpl = TEMPLATES.find(x => x.id === tid) || TEMPLATES[0];
  const r = mulberry(seed);
  const g = tpl.gen(r, level);
  const choices = buildChoices(r, g.answer, g.wrongs, g.kind, g.dp ?? tpl.dp);
  return { tid: tpl.id, topic: tpl.topic, name: tpl.name, level, seed, q: g.q, steps: g.steps, kind: g.kind, params: g.params,
    answer: g.answer, choices, correctIndex: choices.findIndex(c => c.correct) };
}
