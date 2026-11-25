// SQL skills track: eight lessons on the Meridian Mutual practice database (data/skills/sql-db.js).
// Each step is checked by running the learner's query and `solution` on fresh copies of the database and
// comparing the results (js/ui/sql.js compareResults): same column count, same rows as a multiset
// (in order when `ordered: true`), column names ignored, numbers rounded to 4 decimals, text exact.
// Every solution, plus an alternative correct query and a plausible wrong query per step, was run against the
// seeded database in Python's sqlite3 before publishing (see the verification notes in the build report).

export const TRACK = {
  id: 'sql',
  title: 'SQL for actuaries',
  blurb: 'Query a practice insurer\'s policies, claims and payments in your browser: filters, aggregates, joins, dates, CTEs and window functions, ending with a loss triangle and a loss ratio report.',
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'sq-select', title: 'Selecting and filtering rows', short: 'SELECT and WHERE', minutes: 15, level: 'Beginner',
      intro: `
<p>Meridian Mutual is an invented insurer that writes <b>Auto</b>, <b>Home</b> and <b>Commercial</b> policies in five states. Its data lives in five tables: <code>policies</code>, <code>claims</code>, <code>payments</code>, <code>rate_changes</code> and <code>mortality</code>. Every figure is made up, but the shapes are the ones you will meet at work.</p>
<p>A query reads like a sentence: <code>SELECT</code> the columns you want, <code>FROM</code> a table, <code>WHERE</code> rows pass a test, <code>ORDER BY</code> a sort, and <code>LIMIT</code> how many rows come back. Only <code>SELECT</code> and <code>FROM</code> are required.</p>
<p>Each query runs on a fresh copy of the database, so you cannot break anything. Experiment freely.</p>`,
      steps: [
        {
          id: 'sq-select-1', title: 'Pick columns, filter rows', tables: ['policies'],
          body: `
<p>Start by running the starter query to see what a policy row looks like. Then change it.</p>
<p><b>Task:</b> return every <b>Auto</b> policy written in <b>TX</b>, with three columns in this order: <code>policy_id</code>, <code>holder_name</code>, <code>written_premium</code>.</p>
<p>Text values go in single quotes, and text comparisons are case-sensitive: <code>'Auto'</code> matches, <code>'auto'</code> does not.</p>`,
          starter: 'SELECT *\nFROM policies\nLIMIT 10;',
          solution: "SELECT policy_id, holder_name, written_premium\nFROM policies\nWHERE line = 'Auto' AND state = 'TX';",
          ordered: false,
          hints: [
            '<p>Replace <code>*</code> with the three column names, separated by commas.</p>',
            '<p>You need two conditions joined with <code>AND</code>: one on <code>line</code> and one on <code>state</code>.</p>',
            "<p><code>WHERE line = 'Auto' AND state = 'TX'</code></p>",
          ],
          takeaway: '<p><code>SELECT</code> chooses columns, <code>WHERE</code> chooses rows. <code>SELECT *</code> is handy for exploring, but name your columns in anything you keep.</p>',
        },
        {
          id: 'sq-select-2', title: 'Ranges and lists', tables: ['policies'],
          body: `
<p><code>BETWEEN a AND b</code> keeps values from <code>a</code> to <code>b</code>, <b>including both ends</b>. <code>IN ('x', 'y')</code> is shorthand for <code>= 'x' OR = 'y'</code>.</p>
<p><b>Task:</b> return policies written in <b>CA or NY</b> whose <code>written_premium</code> is from <b>2,000 to 4,000</b> inclusive. Columns, in order: <code>policy_id</code>, <code>line</code>, <code>state</code>, <code>written_premium</code>.</p>`,
          starter: 'SELECT policy_id, line, state, written_premium\nFROM policies\nWHERE ',
          solution: "SELECT policy_id, line, state, written_premium\nFROM policies\nWHERE state IN ('CA', 'NY')\n  AND written_premium BETWEEN 2000 AND 4000;",
          ordered: false,
          hints: [
            '<p>Two conditions again: one on <code>state</code>, one on <code>written_premium</code>.</p>',
            "<p>If you write the states with <code>OR</code>, wrap them in parentheses: <code>(state = 'CA' OR state = 'NY') AND …</code>. <code>AND</code> binds tighter than <code>OR</code>, so without the brackets you get every NY policy regardless of premium.</p>",
            "<p><code>WHERE state IN ('CA', 'NY') AND written_premium BETWEEN 2000 AND 4000</code></p>",
          ],
          takeaway: '<p><code>IN</code> and <code>BETWEEN</code> keep filters short and avoid the classic <code>AND</code>/<code>OR</code> precedence bug. Amounts are numbers, so never quote them.</p>',
        },
        {
          id: 'sq-select-3', title: 'Pattern matching with LIKE', tables: ['policies'],
          body: `
<p><code>LIKE</code> matches text patterns: <code>%</code> stands for any run of characters (including none) and <code>_</code> for exactly one. So <code>'%Bakery%'</code> finds "Bakery" anywhere in the text.</p>
<p><b>Task:</b> list the policyholders whose name <b>ends in</b> <code>LLC</code>. Columns, in order: <code>policy_id</code>, <code>holder_name</code>, <code>state</code>.</p>`,
          starter: '',
          solution: "SELECT policy_id, holder_name, state\nFROM policies\nWHERE holder_name LIKE '%LLC';",
          ordered: false,
          hints: [
            '<p>"Ends in" means anything may come before <code>LLC</code>, and nothing after it.</p>',
            "<p><code>WHERE holder_name LIKE '%LLC'</code></p>",
          ],
          takeaway: "<p>In SQLite, <code>LIKE</code> ignores the case of A to Z, while <code>=</code> does not. Other databases differ, so check before relying on it.</p>",
        },
        {
          id: 'sq-select-4', title: 'Sort and limit', tables: ['policies'],
          body: `
<p><code>ORDER BY col DESC</code> sorts largest first; <code>ASC</code> (the default) sorts smallest first. <code>LIMIT n</code> keeps the first <code>n</code> rows <i>after</i> sorting.</p>
<p><b>Task:</b> return the <b>five largest policies by written premium</b>, largest first. Columns, in order: <code>policy_id</code>, <code>holder_name</code>, <code>line</code>, <code>written_premium</code>. The order of rows is checked.</p>`,
          starter: '',
          solution: 'SELECT policy_id, holder_name, line, written_premium\nFROM policies\nORDER BY written_premium DESC\nLIMIT 5;',
          ordered: true,
          hints: [
            '<p>Sort by <code>written_premium</code> so the biggest comes first, then keep five rows.</p>',
            '<p><code>ORDER BY written_premium DESC LIMIT 5</code></p>',
          ],
          takeaway: '<p>Without <code>ORDER BY</code>, a database may return rows in any order, so "top n" always needs an explicit sort. Watch for ties at the cut-off: here all premiums differ, but in real data you may need a second sort column.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'sq-agg', title: 'Aggregates and GROUP BY', short: 'Aggregates', minutes: 18, level: 'Beginner',
      intro: `
<p>Actuaries rarely want individual rows; they want totals, counts and averages. <b>Aggregate functions</b> collapse many rows into one: <code>COUNT(*)</code>, <code>SUM(x)</code>, <code>AVG(x)</code>, <code>MIN(x)</code>, <code>MAX(x)</code>.</p>
<p><code>GROUP BY</code> splits the rows into groups first, and the aggregates are then computed once per group. <code>HAVING</code> filters the groups after they are formed, the way <code>WHERE</code> filters rows before.</p>`,
      steps: [
        {
          id: 'sq-agg-1', title: 'One-line portfolio summary', tables: ['policies'],
          body: `
<p>With no <code>GROUP BY</code>, an aggregate query returns exactly one row covering the whole table.</p>
<p><b>Task:</b> return one row with three columns, in order: the number of policies, the total written premium, and the average written premium rounded to 2 decimals (<code>ROUND(AVG(written_premium), 2)</code>).</p>`,
          starter: 'SELECT COUNT(*)\nFROM policies;',
          solution: 'SELECT COUNT(*), SUM(written_premium), ROUND(AVG(written_premium), 2)\nFROM policies;',
          ordered: false,
          hints: [
            '<p>Put all three aggregates in one <code>SELECT</code> list, separated by commas.</p>',
            '<p><code>SELECT COUNT(*), SUM(written_premium), ROUND(AVG(written_premium), 2) FROM policies</code></p>',
          ],
          takeaway: '<p>One aggregate query gives the portfolio at a glance. Name results with <code>AS</code> (for example <code>SUM(written_premium) AS total_wp</code>) to make output readable.</p>',
        },
        {
          id: 'sq-agg-2', title: 'Premium by line', tables: ['policies'],
          body: `
<p>Add <code>GROUP BY line</code> and the same aggregates are computed separately for each line of business. Every non-aggregated column in the <code>SELECT</code> list should also appear in <code>GROUP BY</code>.</p>
<p><b>Task:</b> one row per line. Columns, in order: <code>line</code>, number of policies, total written premium, average written premium rounded to 2 decimals.</p>`,
          starter: '',
          solution: 'SELECT line, COUNT(*), SUM(written_premium), ROUND(AVG(written_premium), 2)\nFROM policies\nGROUP BY line;',
          ordered: false,
          hints: [
            '<p>Start from your previous answer and add <code>line</code> as the first column.</p>',
            '<p>Finish with <code>GROUP BY line</code>.</p>',
          ],
          takeaway: '<p>Commercial has far fewer policies but much larger premiums, so the average per policy differs by an order of magnitude. Counts and totals tell different stories; report both.</p>',
        },
        {
          id: 'sq-agg-3', title: 'Filtering groups with HAVING', tables: ['policies'],
          body: `
<p>You cannot use an aggregate in <code>WHERE</code>, because <code>WHERE</code> runs before the groups exist. Use <code>HAVING</code> for conditions on a group's count or total.</p>
<p><b>Task:</b> count policies by <b>line and state</b>, keeping only the combinations with <b>at least 8 policies</b>. Columns, in order: <code>line</code>, <code>state</code>, number of policies.</p>`,
          starter: '',
          solution: 'SELECT line, state, COUNT(*)\nFROM policies\nGROUP BY line, state\nHAVING COUNT(*) >= 8;',
          ordered: false,
          hints: [
            '<p>Group by two columns: <code>GROUP BY line, state</code>.</p>',
            '<p>"At least 8" is <code>&gt;= 8</code>, and it goes in <code>HAVING COUNT(*) &gt;= 8</code> after the <code>GROUP BY</code>.</p>',
          ],
          takeaway: '<p>Small cells give unstable statistics. A <code>HAVING COUNT(*) &gt;= n</code> filter is a quick way to see which segments have enough data to stand on their own.</p>',
        },
        {
          id: 'sq-agg-4', title: 'Policies with repeat claims', tables: ['claims'],
          body: `
<p>The <code>claims</code> table has one row per claim and a <code>policy_id</code> column, so grouping it by <code>policy_id</code> counts claims per policy.</p>
<p><b>Task:</b> list the policies with <b>3 or more claims</b>. Columns, in order: <code>policy_id</code>, number of claims.</p>`,
          starter: '',
          solution: 'SELECT policy_id, COUNT(*)\nFROM claims\nGROUP BY policy_id\nHAVING COUNT(*) >= 3;',
          ordered: false,
          hints: [
            '<p>Query <code>claims</code>, not <code>policies</code>, and group by <code>policy_id</code>.</p>',
            '<p><code>GROUP BY policy_id HAVING COUNT(*) &gt;= 3</code></p>',
          ],
          takeaway: '<p>Repeat claimants matter for underwriting and for frequency models: claim counts per policy are often over-dispersed compared with a Poisson distribution.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'sq-join', title: 'Joining tables', short: 'JOINs', minutes: 20, level: 'Beginner',
      intro: `
<p>Real questions span tables. A claim knows its <code>policy_id</code> but not its line or state; those live in <code>policies</code>. A <b>join</b> lines rows up on a matching key:</p>
<p><code>FROM claims c JOIN policies p ON p.policy_id = c.policy_id</code></p>
<p>The short names <code>c</code> and <code>p</code> are <b>aliases</b>; write <code>c.claim_id</code> or <code>p.line</code> to say which table a column comes from. An <b>inner join</b> (<code>JOIN</code>) keeps only rows with a match on both sides. A <b>left join</b> (<code>LEFT JOIN</code>) keeps every row from the left table and fills the right side with <code>NULL</code> when nothing matches.</p>`,
      steps: [
        {
          id: 'sq-join-1', title: 'Claims with policy details', tables: ['claims', 'policies'],
          body: `
<p><b>Task:</b> for every claim, return its <code>claim_id</code>, <code>accident_date</code>, and the <code>line</code> and <code>state</code> of the policy it belongs to. Four columns, in that order, one row per claim.</p>`,
          starter: 'SELECT c.claim_id, c.accident_date\nFROM claims c\n',
          solution: 'SELECT c.claim_id, c.accident_date, p.line, p.state\nFROM claims c\nJOIN policies p ON p.policy_id = c.policy_id;',
          ordered: false,
          hints: [
            '<p>Add <code>JOIN policies p ON …</code> after the <code>FROM</code> line.</p>',
            '<p>The key both tables share is <code>policy_id</code>: <code>ON p.policy_id = c.policy_id</code>. Then add <code>p.line, p.state</code> to the <code>SELECT</code>.</p>',
          ],
          takeaway: '<p>Check the row count after a join: here it should equal the number of claims, because each claim has exactly one policy. A join that adds rows usually means the key is not unique on one side.</p>',
        },
        {
          id: 'sq-join-2', title: 'Claim counts by state', tables: ['claims', 'policies'],
          body: `
<p>Joins and <code>GROUP BY</code> combine naturally: join first, then group by a column from either table.</p>
<p><b>Task:</b> count claims by the <b>state</b> of the policy. Columns, in order: <code>state</code>, number of claims.</p>`,
          starter: '',
          solution: 'SELECT p.state, COUNT(*)\nFROM claims c\nJOIN policies p ON p.policy_id = c.policy_id\nGROUP BY p.state;',
          ordered: false,
          hints: [
            '<p>Reuse the join from the previous step.</p>',
            '<p>Then <code>SELECT p.state, COUNT(*)</code> and <code>GROUP BY p.state</code>.</p>',
          ],
          takeaway: '<p>A count of claims is only half of a frequency: you also need the exposure (policies or policy-years) in each state. Lesson 6 puts the two together.</p>',
        },
        {
          id: 'sq-join-3', title: 'Policies with no claims', tables: ['policies', 'claims'],
          body: `
<p>A <code>LEFT JOIN</code> from <code>policies</code> to <code>claims</code> keeps every policy. Policies without a claim get <code>NULL</code> in every claims column, so <code>WHERE c.claim_id IS NULL</code> picks them out. (Use <code>IS NULL</code>, never <code>= NULL</code>.)</p>
<p><b>Task:</b> list the policies that have <b>no claims</b>. Columns, in order: <code>policy_id</code>, <code>holder_name</code>, <code>line</code>.</p>`,
          starter: '',
          solution: 'SELECT p.policy_id, p.holder_name, p.line\nFROM policies p\nLEFT JOIN claims c ON c.policy_id = p.policy_id\nWHERE c.claim_id IS NULL;',
          ordered: false,
          hints: [
            '<p>Start <code>FROM policies p LEFT JOIN claims c ON c.policy_id = p.policy_id</code>.</p>',
            '<p>Keep the unmatched rows: <code>WHERE c.claim_id IS NULL</code>.</p>',
            '<p>Another way: <code>WHERE policy_id NOT IN (SELECT policy_id FROM claims)</code>. Both are fine here.</p>',
          ],
          takeaway: '<p>Claim-free policies are still exposure. Dropping them (with an inner join) overstates frequency, one of the most common mistakes in rating data.</p>',
        },
        {
          id: 'sq-join-4', title: 'Paid to date per claim', tables: ['payments', 'claims', 'policies'],
          body: `
<p>You can chain joins: <code>payments</code> to <code>claims</code> on <code>claim_id</code>, then <code>claims</code> to <code>policies</code> on <code>policy_id</code>.</p>
<p><b>Task:</b> for each claim that has at least one payment, return <code>claim_id</code>, the policy's <code>line</code>, the number of payments, and the total amount paid. Four columns, in that order.</p>`,
          starter: '',
          solution: 'SELECT c.claim_id, p.line, COUNT(*), SUM(pm.amount)\nFROM payments pm\nJOIN claims c ON c.claim_id = pm.claim_id\nJOIN policies p ON p.policy_id = c.policy_id\nGROUP BY c.claim_id, p.line;',
          ordered: false,
          hints: [
            '<p>Start from <code>payments</code>, so only claims with a payment appear.</p>',
            '<p>Two joins: <code>JOIN claims c ON c.claim_id = pm.claim_id JOIN policies p ON p.policy_id = c.policy_id</code>. Then group by the claim.</p>',
          ],
          takeaway: '<p>"Paid to date" is the sum of all payments so far. It becomes a building block for incurred losses, development triangles and large-loss analysis later on.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'sq-case', title: 'CASE expressions and NULLs', short: 'CASE and NULL', minutes: 18, level: 'Intermediate',
      intro: `
<p><code>CASE</code> is SQL's if-then-else. It is checked top to bottom and returns the first match:</p>
<p><code>CASE WHEN written_premium &lt; 2000 THEN 'Small' WHEN … THEN … ELSE 'Large' END</code></p>
<p><code>NULL</code> means "unknown". Any arithmetic or comparison with <code>NULL</code> gives <code>NULL</code>, and <code>COUNT(column)</code> skips it. <code>COALESCE(a, b)</code> returns the first value that is not <code>NULL</code>, which is the standard way to fill gaps.</p>`,
      steps: [
        {
          id: 'sq-case-1', title: 'Premium size bands', tables: ['policies'],
          body: `
<p><b>Task:</b> for every policy return <code>policy_id</code>, <code>written_premium</code>, and a third column <code>band</code> with exactly these labels:</p>
<ul>
<li><code>'Small'</code> when the premium is under 2,000</li>
<li><code>'Medium'</code> from 2,000 up to (but not including) 10,000</li>
<li><code>'Large'</code> at 10,000 or more</li>
</ul>`,
          starter: '',
          solution: "SELECT policy_id, written_premium,\n  CASE WHEN written_premium < 2000 THEN 'Small'\n       WHEN written_premium < 10000 THEN 'Medium'\n       ELSE 'Large' END AS band\nFROM policies;",
          ordered: false,
          hints: [
            '<p>Because <code>CASE</code> stops at the first true <code>WHEN</code>, the second test only needs <code>written_premium &lt; 10000</code>.</p>',
            "<p><code>CASE WHEN written_premium &lt; 2000 THEN 'Small' WHEN written_premium &lt; 10000 THEN 'Medium' ELSE 'Large' END</code></p>",
          ],
          takeaway: '<p>Label text is compared exactly, so <code>\'small\'</code> is not <code>\'Small\'</code>. Order your <code>WHEN</code> branches so each band boundary is tested once.</p>',
        },
        {
          id: 'sq-case-2', title: 'Group by a CASE', tables: ['policies'],
          body: `
<p>A <code>CASE</code> expression can be grouped like any column. In SQLite you may group by its alias.</p>
<p><b>Task:</b> using the same three bands, return one row per band. Columns, in order: the band label, the number of policies, the total written premium.</p>`,
          starter: '',
          solution: "SELECT CASE WHEN written_premium < 2000 THEN 'Small'\n            WHEN written_premium < 10000 THEN 'Medium'\n            ELSE 'Large' END AS band,\n       COUNT(*), SUM(written_premium)\nFROM policies\nGROUP BY band;",
          ordered: false,
          hints: [
            '<p>Put the <code>CASE … END AS band</code> first in the <code>SELECT</code>, then the two aggregates.</p>',
            '<p>Finish with <code>GROUP BY band</code>.</p>',
          ],
          takeaway: '<p>Banding a continuous variable and grouping is how most rating factor and size-of-loss tables start.</p>',
        },
        {
          id: 'sq-case-3', title: 'Missing causes', tables: ['claims'],
          body: `
<p>A few claims have no <code>cause</code> recorded yet: the value is <code>NULL</code>. Grouping on <code>cause</code> would give them an unlabelled group.</p>
<p><b>Task:</b> count claims by cause, showing missing causes as <code>'Not recorded'</code>. Columns, in order: the cause label, number of claims.</p>`,
          starter: 'SELECT cause, COUNT(*)\nFROM claims\nGROUP BY cause;',
          solution: "SELECT COALESCE(cause, 'Not recorded') AS cause_label, COUNT(*)\nFROM claims\nGROUP BY cause_label;",
          ordered: false,
          hints: [
            '<p>Run the starter: one group has an empty cause. That is the <code>NULL</code> group.</p>',
            "<p>Replace <code>cause</code> with <code>COALESCE(cause, 'Not recorded')</code> in both the <code>SELECT</code> and the grouping (or group by its alias).</p>",
          ],
          takeaway: "<p><code>WHERE cause = NULL</code> matches nothing, because <code>NULL = NULL</code> is unknown, not true. Test with <code>IS NULL</code> and fill with <code>COALESCE</code>.</p>",
        },
        {
          id: 'sq-case-4', title: 'Incurred for every claim', tables: ['claims', 'payments'],
          body: `
<p><b>Incurred loss</b> = paid to date + case reserve. Some claims have no payments yet, so an inner join to <code>payments</code> would drop them, and <code>SUM</code> over no rows is <code>NULL</code>, not 0.</p>
<p><b>Task:</b> one row for <b>every</b> claim (150 rows). Columns, in order: <code>claim_id</code>, <code>status</code>, paid to date (0 when there are no payments), <code>case_reserve</code>, incurred (paid + case reserve).</p>`,
          starter: '',
          solution: 'SELECT c.claim_id, c.status, COALESCE(SUM(pm.amount), 0) AS paid, c.case_reserve,\n       COALESCE(SUM(pm.amount), 0) + c.case_reserve AS incurred\nFROM claims c\nLEFT JOIN payments pm ON pm.claim_id = c.claim_id\nGROUP BY c.claim_id, c.status, c.case_reserve;',
          ordered: false,
          hints: [
            '<p>Use <code>FROM claims c LEFT JOIN payments pm ON pm.claim_id = c.claim_id</code> and group by the claim.</p>',
            '<p>Wrap the sum: <code>COALESCE(SUM(pm.amount), 0)</code>. Without it, unpaid claims show a blank paid amount and a blank incurred.</p>',
          ],
          takeaway: '<p>A forgotten <code>COALESCE</code> turns "nothing paid yet" into "unknown", and that row then quietly vanishes from any total built on it.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'sq-dates', title: 'Working with dates', short: 'Dates', minutes: 22, level: 'Intermediate',
      intro: `
<p>SQLite stores dates as text like <code>'2023-07-14'</code>. Because that format sorts correctly, you can compare dates with <code>&lt;</code>, <code>&gt;</code> and <code>BETWEEN</code> directly. Three functions do the rest:</p>
<ul>
<li><code>strftime('%Y', d)</code> extracts the year as <b>text</b> (<code>'%m'</code> the month). Wrap it in <code>CAST(… AS INTEGER)</code> to get a number.</li>
<li><code>julianday(d)</code> turns a date into a day number, so <code>julianday(b) - julianday(a)</code> is the days between them.</li>
<li><code>date(d, '+6 months')</code> shifts a date.</li>
</ul>`,
      steps: [
        {
          id: 'sq-dates-1', title: 'Accident year and report lag', tables: ['claims'],
          body: `
<p>The <b>accident year</b> is the calendar year of the accident date. The <b>report lag</b> is the number of days from accident to report.</p>
<p><b>Task:</b> for every claim return <code>claim_id</code>, the accident year <b>as an integer</b>, and the report lag in days. Three columns, in that order.</p>
<p>The year must be a number: the checker treats the text <code>'2022'</code> and the number <code>2022</code> as different.</p>`,
          starter: "SELECT claim_id, strftime('%Y', accident_date)\nFROM claims;",
          solution: "SELECT claim_id,\n       CAST(strftime('%Y', accident_date) AS INTEGER) AS accident_year,\n       julianday(report_date) - julianday(accident_date) AS report_lag\nFROM claims;",
          ordered: false,
          hints: [
            "<p>Wrap the year: <code>CAST(strftime('%Y', accident_date) AS INTEGER)</code>.</p>",
            '<p>The lag is <code>julianday(report_date) - julianday(accident_date)</code>.</p>',
          ],
          takeaway: '<p>Accident year is the main axis of reserving: losses are grouped by the year the accident happened, whatever year they were reported or paid.</p>',
        },
        {
          id: 'sq-dates-2', title: 'Late-reported claims', tables: ['claims'],
          body: `
<p>A claim whose accident happened in one year but was reported in a later year was <b>incurred but not reported</b> (IBNR) at the earlier year-end. Reserving actuaries estimate how much of that is still out there.</p>
<p><b>Task:</b> list the claims reported in a <b>later calendar year</b> than their accident. Columns, in order: <code>claim_id</code>, <code>accident_date</code>, <code>report_date</code>, report lag in days.</p>`,
          starter: '',
          solution: "SELECT claim_id, accident_date, report_date,\n       julianday(report_date) - julianday(accident_date) AS report_lag\nFROM claims\nWHERE strftime('%Y', report_date) > strftime('%Y', accident_date);",
          ordered: false,
          hints: [
            '<p>Compare the two years in the <code>WHERE</code> clause.</p>',
            "<p><code>WHERE strftime('%Y', report_date) &gt; strftime('%Y', accident_date)</code>. Comparing two four-digit year texts works; so does casting both to integers.</p>",
          ],
          takeaway: '<p>Notice the lags: some are only a few days, because an accident on 28 December reported on 3 January still crosses the year-end. IBNR is about calendar cut-offs, not only slow reporting.</p>',
        },
        {
          id: 'sq-dates-3', title: 'Average lag by line', tables: ['claims', 'policies'],
          body: `
<p><b>Task:</b> return the average report lag in days for each line of business, rounded to 1 decimal. Columns, in order: <code>line</code>, average lag.</p>`,
          starter: '',
          solution: 'SELECT p.line, ROUND(AVG(julianday(c.report_date) - julianday(c.accident_date)), 1)\nFROM claims c\nJOIN policies p ON p.policy_id = c.policy_id\nGROUP BY p.line;',
          ordered: false,
          hints: [
            '<p>Join <code>claims</code> to <code>policies</code> for the line, then group by it.</p>',
            '<p><code>ROUND(AVG(julianday(c.report_date) - julianday(c.accident_date)), 1)</code></p>',
          ],
          takeaway: '<p>A long average lag in one line signals more IBNR to hold for it. Averages are pulled up by a few very late reports, so look at the distribution too.</p>',
        },
        {
          id: 'sq-dates-4', title: 'Earned premium for 2023', tables: ['policies'],
          body: `
<p>Written premium is booked when a policy starts; it is <b>earned</b> evenly over the term. The premium earned in calendar year 2023 is the written premium times the fraction of the term that falls in 2023. Use exactly these pieces:</p>
<ul>
<li>Expiry: <code>date(effective_date, '+' || term_months || ' months')</code></li>
<li>Days in force during 2023: <code>MAX(0, MIN(julianday(expiry), julianday('2024-01-01')) - MAX(julianday(effective_date), julianday('2023-01-01')))</code></li>
<li>Days in the term: <code>julianday(expiry) - julianday(effective_date)</code></li>
<li>Earned in 2023 = <code>written_premium * days in 2023 / days in term</code></li>
</ul>
<p>With several arguments, SQLite's <code>MIN</code> and <code>MAX</code> act on a single row (not as aggregates). The outer <code>MAX(0, …)</code> gives 0 for policies not in force in 2023.</p>
<p><b>Task:</b> total 2023 earned premium by line, rounded to 2 decimals. Columns, in order: <code>line</code>, earned premium.</p>`,
          starter: "SELECT policy_id, effective_date, term_months,\n       date(effective_date, '+' || term_months || ' months') AS expiry\nFROM policies;",
          solution: "WITH t AS (\n  SELECT line, written_premium, effective_date,\n         date(effective_date, '+' || term_months || ' months') AS expiry\n  FROM policies\n)\nSELECT line,\n       ROUND(SUM(written_premium\n         * MAX(0, MIN(julianday(expiry), julianday('2024-01-01')) - MAX(julianday(effective_date), julianday('2023-01-01')))\n         / (julianday(expiry) - julianday(effective_date))), 2) AS earned_2023\nFROM t\nGROUP BY line;",
          ordered: false,
          hints: [
            '<p>Compute <code>expiry</code> first, in a subquery in the <code>FROM</code> clause (<code>FROM (SELECT …, date(…) AS expiry FROM policies)</code>), so you can refer to it by name. Or repeat the <code>date(…)</code> expression everywhere it is needed.</p>',
            '<p>Build the per-policy earned amount, check it on a few rows, then wrap it in <code>SUM(…)</code> with <code>GROUP BY line</code>.</p>',
            '<p><code>julianday</code> returns a decimal, so the division is not integer division. Round only the final sum.</p>',
          ],
          takeaway: '<p>Earned premium is the denominator of every loss ratio. A policy written on 1 July 2023 for 12 months earns about half its premium in 2023 and half in 2024.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 6
    {
      id: 'sq-cte', title: 'Subqueries and CTEs', short: 'Subqueries, CTEs', minutes: 22, level: 'Intermediate',
      intro: `
<p>A <b>subquery</b> is a query inside another one. It can return a single value (<code>WHERE x &gt; (SELECT AVG(x) FROM …)</code>), a list (<code>WHERE id IN (SELECT …)</code>), or a whole table to select from.</p>
<p>A <b>common table expression</b> (CTE) names a subquery up front with <code>WITH</code>, so a long calculation reads top to bottom:</p>
<p><code>WITH pol AS (SELECT …), clm AS (SELECT …) SELECT … FROM pol JOIN clm …</code></p>`,
      steps: [
        {
          id: 'sq-cte-1', title: 'Above-average Home policies', tables: ['policies'],
          body: `
<p><b>Task:</b> list the <b>Home</b> policies whose written premium is above the <b>average Home</b> written premium. Columns, in order: <code>policy_id</code>, <code>holder_name</code>, <code>written_premium</code>.</p>`,
          starter: '',
          solution: "SELECT policy_id, holder_name, written_premium\nFROM policies\nWHERE line = 'Home'\n  AND written_premium > (SELECT AVG(written_premium) FROM policies WHERE line = 'Home');",
          ordered: false,
          hints: [
            "<p>First write the single-value query: <code>SELECT AVG(written_premium) FROM policies WHERE line = 'Home'</code>.</p>",
            "<p>Drop it into the outer <code>WHERE</code> in parentheses, and keep <code>line = 'Home'</code> in the outer query too.</p>",
          ],
          takeaway: '<p>Make sure the subquery and the outer query use the same population. Comparing Home policies with the all-lines average would mix in the much larger Commercial premiums.</p>',
        },
        {
          id: 'sq-cte-2', title: 'Filtering with IN (subquery)', tables: ['claims', 'policies'],
          body: `
<p><b>Task:</b> list the claims on <b>Commercial</b> policies written in <b>TX</b>. Columns, in order: <code>claim_id</code>, <code>policy_id</code>, <code>accident_date</code>. Use a subquery with <code>IN</code> (a join gives the same answer).</p>`,
          starter: '',
          solution: "SELECT claim_id, policy_id, accident_date\nFROM claims\nWHERE policy_id IN (SELECT policy_id FROM policies WHERE line = 'Commercial' AND state = 'TX');",
          ordered: false,
          hints: [
            "<p>The inner query returns a list of policy ids: <code>SELECT policy_id FROM policies WHERE line = 'Commercial' AND state = 'TX'</code>.</p>",
            '<p>The outer query: <code>SELECT … FROM claims WHERE policy_id IN ( … )</code>.</p>',
          ],
          takeaway: '<p><code>IN (subquery)</code> never duplicates rows, whereas a join can if the key repeats on the other side. That makes it a safe way to filter.</p>',
        },
        {
          id: 'sq-cte-3', title: 'Claim frequency by line', tables: ['policies', 'claims'],
          body: `
<p><b>Frequency</b> = number of claims / number of policies. (A fuller analysis would use earned exposure; policy count keeps it simple.) Count each side in its own CTE, then join the two small results on <code>line</code>.</p>
<p><b>Task:</b> one row per line. Columns, in order: <code>line</code>, number of policies, number of claims, frequency rounded to 4 decimals.</p>
<p>Careful: in SQLite, an integer divided by an integer is truncated (<code>7 / 2</code> is <code>3</code>). Multiply by <code>1.0</code> first.</p>`,
          starter: 'WITH pol AS (\n  SELECT line, COUNT(*) AS n_pol\n  FROM policies\n  GROUP BY line\n)\nSELECT * FROM pol;',
          solution: 'WITH pol AS (\n  SELECT line, COUNT(*) AS n_pol FROM policies GROUP BY line\n), clm AS (\n  SELECT p.line, COUNT(*) AS n_clm\n  FROM claims c JOIN policies p ON p.policy_id = c.policy_id\n  GROUP BY p.line\n)\nSELECT pol.line, n_pol, n_clm, ROUND(1.0 * n_clm / n_pol, 4)\nFROM pol JOIN clm ON clm.line = pol.line;',
          ordered: false,
          hints: [
            '<p>Add a second CTE after a comma: <code>, clm AS (SELECT p.line, COUNT(*) AS n_clm FROM claims c JOIN policies p ON … GROUP BY p.line)</code>.</p>',
            '<p>Join the CTEs: <code>FROM pol JOIN clm ON clm.line = pol.line</code>, and compute <code>ROUND(1.0 * n_clm / n_pol, 4)</code>.</p>',
            '<p>Why not one <code>LEFT JOIN</code> with <code>COUNT(*)</code>? Policies with several claims appear several times, so the policy count would be inflated. <code>COUNT(DISTINCT p.policy_id)</code> fixes that, but separate CTEs make the logic obvious.</p>',
          ],
          takeaway: '<p>Aggregate each table to the same grain (here, line) before joining. Joining detail rows first and counting afterwards is the classic source of double counting.</p>',
        },
        {
          id: 'sq-cte-4', title: 'Large-loss share', tables: ['payments', 'claims', 'policies'],
          body: `
<p>A few large claims can dominate a line's losses. Call a claim <b>large</b> if its total paid to date is <b>over 5,000</b>.</p>
<p><b>Task:</b> one row per line (only claims with payments count). Columns, in order: <code>line</code>, total paid, paid on large claims, and the large-loss share = large paid / total paid, rounded to 4 decimals.</p>`,
          starter: '',
          solution: 'WITH paid AS (\n  SELECT pm.claim_id, SUM(pm.amount) AS paid\n  FROM payments pm\n  GROUP BY pm.claim_id\n)\nSELECT p.line,\n       SUM(paid.paid) AS total_paid,\n       SUM(CASE WHEN paid.paid > 5000 THEN paid.paid ELSE 0 END) AS large_paid,\n       ROUND(1.0 * SUM(CASE WHEN paid.paid > 5000 THEN paid.paid ELSE 0 END) / SUM(paid.paid), 4) AS large_share\nFROM paid\nJOIN claims c ON c.claim_id = paid.claim_id\nJOIN policies p ON p.policy_id = c.policy_id\nGROUP BY p.line;',
          ordered: false,
          hints: [
            '<p>The size test is on each claim\'s <i>total</i>, not on single payments. First build a CTE with paid per claim.</p>',
            '<p>Then join that CTE to <code>claims</code> and <code>policies</code>, and use <code>SUM(CASE WHEN paid &gt; 5000 THEN paid ELSE 0 END)</code> for the large part.</p>',
          ],
          takeaway: '<p>Large-loss shares drive decisions on reinsurance, capping losses in ratemaking, and how much weight a line\'s own experience deserves.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 7
    {
      id: 'sq-window', title: 'Window functions', short: 'Window functions', minutes: 25, level: 'Advanced',
      intro: `
<p>A <b>window function</b> computes across a set of related rows <i>without</i> collapsing them, so every row keeps its detail and gains a calculated column. The pattern is</p>
<p><code>function(…) OVER (PARTITION BY group_cols ORDER BY sort_cols)</code></p>
<ul>
<li><code>SUM(x) OVER (PARTITION BY claim_id ORDER BY payment_date)</code>: running total within each claim.</li>
<li><code>ROW_NUMBER()</code>, <code>RANK()</code>: position within each partition.</li>
<li><code>LAG(x)</code>: the value from the previous row in the partition (<code>NULL</code> for the first).</li>
</ul>
<p>Window functions run after <code>WHERE</code> and <code>GROUP BY</code>, so to filter on one, compute it in a CTE and filter outside.</p>`,
      steps: [
        {
          id: 'sq-window-1', title: 'Running paid per claim', tables: ['payments'],
          body: `
<p><b>Task:</b> for every payment return <code>payment_id</code>, <code>claim_id</code>, <code>payment_date</code>, <code>amount</code>, and the claim's <b>cumulative paid</b> up to and including that payment (payments in date order within each claim). Five columns, in that order.</p>`,
          starter: '',
          solution: 'SELECT payment_id, claim_id, payment_date, amount,\n       SUM(amount) OVER (PARTITION BY claim_id ORDER BY payment_date) AS cum_paid\nFROM payments;',
          ordered: false,
          hints: [
            '<p>Partition by the claim, order by the date.</p>',
            '<p><code>SUM(amount) OVER (PARTITION BY claim_id ORDER BY payment_date)</code></p>',
          ],
          takeaway: '<p>With <code>ORDER BY</code> inside <code>OVER</code>, the window runs from the first row of the partition to the current row. Rows with the same sort value are treated together, so add a tie-breaker (such as <code>payment_id</code>) when dates can repeat.</p>',
        },
        {
          id: 'sq-window-2', title: 'Three largest claims per line', tables: ['payments', 'claims', 'policies'],
          body: `
<p><b>Task:</b> using total paid per claim (claims with payments only), return the <b>three largest claims in each line</b>. Columns, in order: <code>line</code>, <code>claim_id</code>, total paid, and its position within the line (1 = largest). That gives 9 rows.</p>`,
          starter: '',
          solution: 'WITH paid AS (\n  SELECT p.line, c.claim_id, SUM(pm.amount) AS paid\n  FROM payments pm\n  JOIN claims c ON c.claim_id = pm.claim_id\n  JOIN policies p ON p.policy_id = c.policy_id\n  GROUP BY p.line, c.claim_id\n), ranked AS (\n  SELECT line, claim_id, paid,\n         ROW_NUMBER() OVER (PARTITION BY line ORDER BY paid DESC) AS rn\n  FROM paid\n)\nSELECT line, claim_id, paid, rn\nFROM ranked\nWHERE rn <= 3;',
          ordered: false,
          hints: [
            '<p>Step 1: a CTE with paid per claim and its line (as in lesson 6).</p>',
            '<p>Step 2: add <code>ROW_NUMBER() OVER (PARTITION BY line ORDER BY paid DESC)</code> in a second CTE.</p>',
            '<p>Step 3: <code>WHERE rn &lt;= 3</code> in the final query. You cannot filter on a window function in the same query that computes it.</p>',
          ],
          takeaway: '<p><code>ROW_NUMBER</code> always gives 1, 2, 3; <code>RANK</code> gives tied rows the same number and skips the next. There are no ties here, but choose deliberately in real data.</p>',
        },
        {
          id: 'sq-window-3', title: 'Time between rate changes', tables: ['rate_changes'],
          body: `
<p><b>Task:</b> for each rate change that has an <b>earlier change in the same line</b>, return <code>line</code>, <code>effective_date</code>, the previous change's <code>pct_change</code>, this <code>pct_change</code>, and the number of days since the previous change. Five columns, in that order. Leave out each line's first change.</p>`,
          starter: 'SELECT * FROM rate_changes ORDER BY line, effective_date;',
          solution: 'WITH r AS (\n  SELECT line, effective_date, pct_change,\n         LAG(pct_change) OVER (PARTITION BY line ORDER BY effective_date) AS prev_pct,\n         LAG(effective_date) OVER (PARTITION BY line ORDER BY effective_date) AS prev_date\n  FROM rate_changes\n)\nSELECT line, effective_date, prev_pct, pct_change,\n       julianday(effective_date) - julianday(prev_date) AS days_since\nFROM r\nWHERE prev_date IS NOT NULL;',
          ordered: false,
          hints: [
            '<p>Use <code>LAG(…) OVER (PARTITION BY line ORDER BY effective_date)</code> twice: once for the previous <code>pct_change</code>, once for the previous <code>effective_date</code>.</p>',
            '<p>Do that in a CTE, then filter with <code>WHERE prev_date IS NOT NULL</code> and subtract the <code>julianday</code> values.</p>',
          ],
          takeaway: '<p>Rate change history feeds <b>on-level</b> premium: restating past premium at today\'s rates before computing loss ratios. <code>LAG</code> is the tool for any "compared with last time" question.</p>',
        },
        {
          id: 'sq-window-4', title: 'Cumulative paid triangle', tables: ['payments', 'claims'],
          body: `
<p>A <b>development triangle</b> tracks each accident year's losses as they mature. The <b>development year</b> of a payment is <code>payment year - accident year + 1</code> (1 = the accident year itself). The data is valued at 2024-12-31, so accident year 2021 has four development years and 2024 has one.</p>
<p><b>Task:</b> return one row per accident year and development year that has payments. Columns, in order: accident year (integer), development year (integer), incremental paid in that development year, and <b>cumulative</b> paid for that accident year up to that development year.</p>`,
          starter: '',
          solution: "WITH inc AS (\n  SELECT CAST(strftime('%Y', c.accident_date) AS INTEGER) AS ay,\n         CAST(strftime('%Y', pm.payment_date) AS INTEGER) - CAST(strftime('%Y', c.accident_date) AS INTEGER) + 1 AS dev,\n         SUM(pm.amount) AS paid\n  FROM payments pm\n  JOIN claims c ON c.claim_id = pm.claim_id\n  GROUP BY ay, dev\n)\nSELECT ay, dev, paid,\n       SUM(paid) OVER (PARTITION BY ay ORDER BY dev) AS cum_paid\nFROM inc;",
          ordered: false,
          hints: [
            '<p>First a CTE of incremental paid by accident year and development year: join <code>payments</code> to <code>claims</code>, compute both years with <code>CAST(strftime(\'%Y\', …) AS INTEGER)</code>, and group by them.</p>',
            '<p>Then a running total over development years within each accident year: <code>SUM(paid) OVER (PARTITION BY ay ORDER BY dev)</code>.</p>',
            '<p>An aggregate inside a window also works in one query: <code>SUM(SUM(pm.amount)) OVER (PARTITION BY … ORDER BY …)</code>.</p>',
          ],
          takeaway: '<p>Ratios of successive cumulative values (dev 2 / dev 1, and so on) are the age-to-age factors behind the chain-ladder method, the starting point of most reserve analyses.</p>',
        },
      ],
    },
    // ------------------------------------------------------------------ 8
    {
      id: 'sq-capstone', title: 'Capstone: loss ratios and survival', short: 'Capstone', minutes: 30, level: 'Advanced',
      intro: `
<p>Time to put it together. You will build the incurred losses behind a loss ratio report, compare them with premium, and finish with a life-contingencies calculation on the <code>mortality</code> table.</p>
<p>Plan before you type: decide the grain of each intermediate result (one row per claim? per line and year?), build it as a CTE, check it, then join.</p>`,
      steps: [
        {
          id: 'sq-cap-1', title: 'Incurred by line and accident year', tables: ['claims', 'payments', 'policies'],
          body: `
<p>Incurred = paid to date + case reserve, as in lesson 4. Include claims with no payments.</p>
<p><b>Task:</b> one row per line and accident year. Columns, in order: <code>line</code>, accident year (integer), number of claims, total paid, total case reserve, total incurred.</p>`,
          starter: '',
          solution: "WITH paid AS (\n  SELECT claim_id, SUM(amount) AS paid FROM payments GROUP BY claim_id\n)\nSELECT p.line,\n       CAST(strftime('%Y', c.accident_date) AS INTEGER) AS ay,\n       COUNT(*) AS n_claims,\n       SUM(COALESCE(paid.paid, 0)) AS paid,\n       SUM(c.case_reserve) AS reserve,\n       SUM(COALESCE(paid.paid, 0) + c.case_reserve) AS incurred\nFROM claims c\nJOIN policies p ON p.policy_id = c.policy_id\nLEFT JOIN paid ON paid.claim_id = c.claim_id\nGROUP BY p.line, ay;",
          ordered: false,
          hints: [
            '<p>If you join <code>claims</code> straight to <code>payments</code>, a claim with three payments appears three times and its case reserve is added three times. Aggregate payments to one row per claim first.</p>',
            '<p>CTE: <code>paid AS (SELECT claim_id, SUM(amount) AS paid FROM payments GROUP BY claim_id)</code>, then <code>claims JOIN policies … LEFT JOIN paid …</code>.</p>',
            '<p>Use <code>COALESCE(paid.paid, 0)</code> for unpaid claims, and <code>COUNT(*)</code> counts claims because there is now one row per claim.</p>',
          ],
          takeaway: '<p>The "fan-out" from joining a parent row to many child rows is the most common way SQL reports go wrong. Bring every table to the same grain before joining.</p>',
        },
        {
          id: 'sq-cap-2', title: 'Loss ratio report', tables: ['policies', 'claims', 'payments'],
          body: `
<p>To keep this step focused on SQL, use a <b>simplified earned premium</b>: for a line and year Y, earned premium = total <code>written_premium</code> of that line's policies whose <code>effective_date</code> is in year Y. Match it to incurred losses for accident year Y.</p>
<p><b>Task:</b> one row per line and accident year that has claims. Columns, in order: <code>line</code>, year (integer), earned premium, incurred, and the loss ratio = incurred / earned premium rounded to 4 decimals.</p>`,
          starter: '',
          solution: "WITH paid AS (\n  SELECT claim_id, SUM(amount) AS paid FROM payments GROUP BY claim_id\n), inc AS (\n  SELECT p.line, CAST(strftime('%Y', c.accident_date) AS INTEGER) AS yr,\n         SUM(COALESCE(paid.paid, 0) + c.case_reserve) AS incurred\n  FROM claims c\n  JOIN policies p ON p.policy_id = c.policy_id\n  LEFT JOIN paid ON paid.claim_id = c.claim_id\n  GROUP BY p.line, yr\n), ep AS (\n  SELECT line, CAST(strftime('%Y', effective_date) AS INTEGER) AS yr, SUM(written_premium) AS earned\n  FROM policies\n  GROUP BY line, yr\n)\nSELECT inc.line, inc.yr, ep.earned, inc.incurred, ROUND(1.0 * inc.incurred / ep.earned, 4) AS loss_ratio\nFROM inc\nJOIN ep ON ep.line = inc.line AND ep.yr = inc.yr;",
          ordered: false,
          hints: [
            '<p>Reuse your incurred query from the previous step as a CTE called <code>inc</code> (line, year, incurred).</p>',
            "<p>Add a CTE <code>ep</code>: <code>SELECT line, CAST(strftime('%Y', effective_date) AS INTEGER) AS yr, SUM(written_premium) AS earned FROM policies GROUP BY line, yr</code>.</p>",
            '<p>Join them on <b>both</b> line and year, and divide with <code>1.0 *</code> to avoid integer division.</p>',
          ],
          takeaway: '<p>Young accident years look better than they will end up: their claims are not all reported or settled. That is why reported loss ratios are developed to ultimate before they drive pricing.</p>',
        },
        {
          id: 'sq-cap-3', title: 'A survival table with a recursive CTE', tables: ['mortality'],
          body: `
<p>The number of survivors follows <code>l(x+1) = l(x) × (1 - q(x))</code>. Each row depends on the one before, which a <b>recursive CTE</b> handles: a starting row, <code>UNION ALL</code>, and a step that refers to the CTE itself.</p>
<p><code>WITH RECURSIVE s(age, lx) AS (SELECT 60, 100000.0 UNION ALL SELECT s.age + 1, s.lx * (1 - m.qx) FROM s JOIN mortality m ON m.age = s.age WHERE s.age &lt; 70) SELECT … FROM s;</code></p>
<p><b>Task:</b> starting from <code>l(60) = 100000</code>, return ages 60 to 70 (11 rows). Columns, in order: <code>age</code>, <code>lx</code> rounded to 2 decimals.</p>`,
          starter: '',
          solution: 'WITH RECURSIVE s(age, lx) AS (\n  SELECT 60, 100000.0\n  UNION ALL\n  SELECT s.age + 1, s.lx * (1 - m.qx)\n  FROM s JOIN mortality m ON m.age = s.age\n  WHERE s.age < 70\n)\nSELECT age, ROUND(lx, 2)\nFROM s;',
          ordered: false,
          hints: [
            '<p>The example in the task is nearly complete: add the final <code>SELECT age, ROUND(lx, 2) FROM s</code>.</p>',
            '<p>Check the stopping rule: <code>WHERE s.age &lt; 70</code> produces the row for 70 and then stops.</p>',
          ],
          takeaway: '<p>Recursive CTEs handle any "this row depends on the last one" calculation: survivorship, reserve roll-forwards, or compounding a sequence of rate changes.</p>',
        },
        {
          id: 'sq-cap-4', title: 'Ten-year survival probability', tables: ['mortality'],
          body: `
<p>The probability that a life aged 60 survives 10 years is <code>10p60 = l(70) / l(60)</code>, the product of <code>(1 - qx)</code> for ages 60 to 69. The probability of dying within the 10 years is <code>10q60 = 1 - 10p60</code>.</p>
<p><b>Task:</b> return one row with two columns, in order: <code>10p60</code> and <code>10q60</code>, each rounded to 4 decimals.</p>`,
          starter: '',
          solution: 'WITH RECURSIVE s(age, p) AS (\n  SELECT 60, 1.0\n  UNION ALL\n  SELECT s.age + 1, s.p * (1 - m.qx)\n  FROM s JOIN mortality m ON m.age = s.age\n  WHERE s.age < 70\n)\nSELECT ROUND(p, 4), ROUND(1 - p, 4)\nFROM s\nWHERE age = 70;',
          ordered: false,
          hints: [
            '<p>Reuse the recursive CTE from the last step. You can start from 1.0 instead of 100000 so the value is already a probability.</p>',
            '<p>Pick the row <code>WHERE age = 70</code> and return <code>p</code> and <code>1 - p</code>, both rounded.</p>',
            '<p>Do not sum the <code>qx</code> values: that ignores the shrinking number of survivors and overstates the probability of death.</p>',
          ],
          takeaway: '<p>The same table answers pricing questions for term insurance and annuities: survival probabilities times discount factors give expected present values.</p>',
        },
      ],
    },
  ],
};
