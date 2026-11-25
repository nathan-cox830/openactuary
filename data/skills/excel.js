// Excel for actuaries: interactive spreadsheet lessons.
// Each step's sheet is independent. `rows` are built from a base grid plus earlier steps' solutions
// (filled exactly as Excel fill-down/right would), so later steps start where earlier ones finished.
// Expected answers are never hard-coded: the site evaluates rows + solution and compares the `check` cells.
// All data are invented. Key numbers were verified in Python (see the authoring report).
import { expandRange, parseAddr, shiftFormula } from '../../js/ui/formula.js';

/** Copy `base` and write each map of {cell or range: value/formula} into it, shifting formulas across ranges. */
function build(base, ...maps) {
  const rows = base.map(r => r.slice());
  for (const m of maps) {
    for (const [key, v] of Object.entries(m)) {
      const cells = expandRange(key); const p = parseAddr(cells[0]);
      for (const a of cells) {
        const q = parseAddr(a);
        while (rows.length <= q.r) rows.push([]);
        const row = rows[q.r]; while (row.length <= q.c) row.push('');
        row[q.c] = typeof v === 'string' ? shiftFormula(v, q.r - p.r, q.c - p.c) : v;
      }
    }
  }
  return rows;
}

/* =====================================================================
   Lesson 1 · Formulas & relative references
   ===================================================================== */
const L1_BASE = [
  ['Rating class', 'Exposures', 'Rate', 'Premium', 'Summary', 'Value'],
  ['Adult pleasure', 1250, 520, ''],
  ['Adult commute', 980, 610, ''],
  ['Business use', 410, 780, ''],
  ['Youthful male', 160, 1450, ''],
  ['Youthful female', 140, 1180, ''],
  ['Senior', 620, 560, ''],
  ['Farm', 85, 430, ''],
  ['Fleet', 300, 690, ''],
  ['Rideshare', 45, 1320, ''],
  ['Student away', 70, 380, ''],
];
const L1_S1 = { 'D2:D11': '=B2*C2' };
const L1_LABELS2 = { E2: 'Total premium', E3: 'Total exposures', E4: 'Average rate (premium ÷ exposures)', E5: 'Simple average of rates' };
const L1_S2 = { F2: '=SUM(D2:D11)', F3: '=SUM(B2:B11)', F4: '=F2/F3', F5: '=AVERAGE(C2:C11)' };
const L1_LABELS3 = { E7: 'Smallest class premium', E8: 'Largest class premium', E9: 'Average class premium', E10: 'Number of classes', E11: 'Largest class share of total' };
const L1_S3 = { F7: '=MIN(D2:D11)', F8: '=MAX(D2:D11)', F9: '=AVERAGE(D2:D11)', F10: '=COUNT(D2:D11)', F11: '=F8/F2' };
const L1_COLS = { A: 150, B: 100, C: 80, D: 110, E: 250, F: 120 };

/* =====================================================================
   Lesson 2 · Absolute & mixed references
   ===================================================================== */
const L2_BASE = [
  ['Annual severity trend', 0.05],
  ['Project to year', 2027],
  [],
  ['Accident year', 'Avg severity', 'Years of trend', 'Trend factor', 'Trended severity'],
  [2018, 8200, '', '', ''],
  [2019, 8450, '', '', ''],
  [2020, 8100, '', '', ''],
  [2021, 8900, '', '', ''],
  [2022, 9600, '', '', ''],
  [2023, 10100, '', '', ''],
  [2024, 10500, '', '', ''],
  [2025, 11000, '', '', ''],
];
const L2_S1 = { 'C5:C12': '=$B$2-A5' };
const L2_S2 = { 'D5:D12': '=(1+$B$1)^C5', 'E5:E12': '=B5*D5' };
const L2_FMT = { B1: 'pct1', 'B5:B12': 'money0', 'C5:C12': 'int', 'D5:D12': 'dec4', 'E5:E12': 'money0' };
const L2_GRID = [
  ['Trend factor = (1 + annual trend) ^ years'],
  [],
  ['Years  \\  Trend', 0.02, 0.03, 0.04, 0.05, 0.06],
  [1], [2], [3], [4], [5], [6], [7], [8],
];

/* =====================================================================
   Lesson 3 · Logic: IF, AND/OR, MIN/MAX, IFERROR
   ===================================================================== */
const L3_BASE = [
  ['Deductible', 1000],
  ['Policy limit', 25000],
  ['Large-loss threshold', 20000],
  [],
  ['Claim', 'Ground-up loss', 'Litigated?', 'Insurer pays', 'Large loss?', 'Referral'],
  ['CL-01', 450, 'N'],
  ['CL-02', 2800, 'N'],
  ['CL-03', 12500, 'Y'],
  ['CL-04', 31000, 'Y'],
  ['CL-05', 800, 'N'],
  ['CL-06', 6400, 'Y'],
  ['CL-07', 22000, 'N'],
  ['CL-08', 1000, 'N'],
  ['CL-09', 47500, 'Y'],
  ['CL-10', 3900, 'N'],
  ['CL-11', 15200, 'N'],
  ['CL-12', 9000, 'Y'],
];
const L3_S1 = { 'D6:D17': '=MIN(MAX(B6-$B$1,0),$B$2)', H6: '=SUM(D6:D17)' };
const L3_S2 = { 'E6:E17': '=IF(B6>$B$3,"Yes","No")' };
const L3_S3 = { 'F6:F17': '=IF(OR(B6>$B$3,AND(C6="Y",B6>5000)),"Refer","OK")' };
const L3_FMT = { 'B1:B3': 'money0', 'B6:B17': 'money0', 'D6:D17': 'money0', H6: 'money0' };
const L3_COLS = { A: 150, B: 120, C: 90, D: 110, E: 100, F: 90, G: 150, H: 110 };
const L3_SEV = [
  ['Month', 'Paid on closed claims', 'Claims closed', 'Average severity', '', ''],
  ['Jan', 38400, 4, '', 'Overall severity', ''],
  ['Feb', 0, 0, '', 'Average of monthly severities', ''],
  ['Mar', 51000, 6],
  ['Apr', 29700, 3],
  ['May', 0, 0],
  ['Jun', 46500, 5],
  ['Jul', 60200, 7],
  ['Aug', 23800, 2],
  ['Sep', 0, 0],
  ['Oct', 35600, 4],
  ['Nov', 55200, 6],
  ['Dec', 31500, 3],
];
const L3_S4 = { 'D2:D13': '=IFERROR(B2/C2,"n/a")', F2: '=SUM(B2:B13)/SUM(C2:C13)', F3: '=AVERAGE(D2:D13)' };

/* =====================================================================
   Lesson 4 · Conditional aggregation
   ===================================================================== */
const L4_BASE = [
  ['Claim', 'Line', 'Accident year', 'Status', 'Incurred'],
  ['C001', 'Auto', 2023, 'Closed', 4200],
  ['C002', 'Home', 2023, 'Closed', 12500],
  ['C003', 'GL', 2023, 'Open', 38000],
  ['C004', 'Auto', 2023, 'Closed', 2600],
  ['C005', 'Home', 2024, 'Open', 8900],
  ['C006', 'Auto', 2024, 'Closed', 5100],
  ['C007', 'GL', 2024, 'Closed', 15000],
  ['C008', 'Auto', 2024, 'Open', 7300],
  ['C009', 'Home', 2024, 'Closed', 3400],
  ['C010', 'GL', 2025, 'Open', 22000],
  ['C011', 'Auto', 2025, 'Open', 3800],
  ['C012', 'Home', 2025, 'Open', 16200],
  ['C013', 'Auto', 2025, 'Closed', 1900],
  ['C014', 'GL', 2023, 'Closed', 9500],
  ['C015', 'Home', 2023, 'Closed', 6100],
];
const L4_LAB1 = { G2: 'Line', H2: 'Incurred', I2: 'Claims', G3: 'Auto', G4: 'Home', G5: 'GL' };
const L4_S1 = { 'H3:H5': '=SUMIFS($E$2:$E$16,$B$2:$B$16,G3)', 'I3:I5': '=COUNTIFS($B$2:$B$16,G3)' };
const L4_LAB2 = { J2: 'Avg closed severity', K2: 'Open claims' };
const L4_S2 = { 'J3:J5': '=AVERAGEIFS($E$2:$E$16,$B$2:$B$16,G3,$D$2:$D$16,"Closed")', 'K3:K5': '=COUNTIFS($B$2:$B$16,G3,$D$2:$D$16,"Open")' };
const L4_LAB3 = { G8: 'Incurred by line and accident year', G9: 'Line', H9: 2023, I9: 2024, J9: 2025, K9: 'Total', G10: 'Auto', G11: 'Home', G12: 'GL', G13: 'Total' };
const L4_S3 = { 'H10:J12': '=SUMIFS($E$2:$E$16,$B$2:$B$16,$G10,$C$2:$C$16,H$9)', 'K10:K12': '=SUM(H10:J10)', K13: '=SUM(H10:J12)' };
const L4_LAB4 = { G16: 'Large-claim threshold', H16: 10000, G17: 'Claims above threshold', G18: 'Incurred above threshold', G19: 'Share of incurred from large claims' };
const L4_S4 = { H17: '=COUNTIFS(E2:E16,">"&H16)', H18: '=SUMIFS(E2:E16,E2:E16,">"&H16)', H19: '=H18/SUM(E2:E16)' };
const L4_COLS = { A: 70, B: 70, C: 110, D: 80, E: 100, F: 30, G: 230, H: 110, I: 90, J: 140, K: 100 };
const L4_FMT = { 'E2:E16': 'money0', 'H3:H5': 'money0', 'J3:J5': 'money0', 'H10:K13': 'money0', H16: 'money0', H18: 'money0', H19: 'pct1' };

/* =====================================================================
   Lesson 5 · Lookups
   ===================================================================== */
const L5_BASE = [
  ['Base rate', 600],
  [],
  ['Policy', 'Territory', 'Driver age', 'Vehicle', 'Territory factor', 'Age factor', 'Vehicle factor', 'Premium', '', 'Territory', 'Factor', '', 'Age from', 'Factor', '', 'Vehicle', 'Factor'],
  ['P-101', 'T2', 34, 'Standard', '', '', '', '', '', 'T1', 0.85, '', 16, 1.80, '', 'Economy', 0.90],
  ['P-102', 'T4', 19, 'Sports', '', '', '', '', '', 'T2', 1.00, '', 21, 1.35, '', 'Standard', 1.00],
  ['P-103', 'T1', 52, 'SUV', '', '', '', '', '', 'T3', 1.10, '', 25, 1.00, '', 'SUV', 1.10],
  ['P-104', 'T3', 23, 'Economy', '', '', '', '', '', 'T4', 1.25, '', 50, 0.90, '', 'Sports', 1.35],
  ['P-105', 'T5', 67, 'Luxury', '', '', '', '', '', 'T5', 1.40, '', 65, 1.05, '', 'Luxury', 1.25],
  ['P-106', 'T2', 45, 'SUV', '', '', '', '', '', '', '', '', 75, 1.25],
  ['P-107', 'T4', 78, 'Standard'],
  ['P-108', 'T1', 25, 'Economy'],
  ['P-109', 'T3', 30, 'Sports'],
  ['P-110', 'T5', 16, 'Standard'],
];
const L5_S1 = { 'E4:E13': '=VLOOKUP(B4,$J$4:$K$8,2,FALSE)' };
const L5_S2 = { 'F4:F13': '=VLOOKUP(C4,$M$4:$N$9,2,TRUE)' };
const L5_S3 = { 'G4:G13': '=XLOOKUP(D4,$P$4:$P$8,$Q$4:$Q$8)' };
const L5_LAB4 = { J11: 'Find premium for policy', K11: 'P-107', J12: 'Premium' };
const L5_S4 = { 'H4:H13': '=$B$1*E4*F4*G4', K12: '=INDEX(H4:H13,MATCH(K11,A4:A13,0))' };
const L5_COLS = { A: 70, B: 80, C: 80, D: 90, E: 110, F: 90, G: 110, H: 100, I: 24, J: 170, K: 80, L: 24, M: 80, N: 70, O: 24, P: 90, Q: 70 };
const L5_FMT = { B1: 'money0', 'E4:G13': 'dec2', 'H4:H13': 'money2', 'K4:K8': 'dec2', 'N4:N9': 'dec2', 'Q4:Q8': 'dec2', K12: 'money2' };

/* =====================================================================
   Lesson 6 · Loss development triangle
   ===================================================================== */
const L6_TRI = [
  ['Reported incurred losses ($000), cumulative by age in months'],
  [],
  ['AY', 12, 24, 36, 48, 60, 72],
  [2020, 4200, 5880, 6470, 6790, 6930, 7000],
  [2021, 4500, 6390, 7030, 7370, 7520],
  [2022, 4800, 6620, 7350, 7720],
  [2023, 5100, 7190, 7980],
  [2024, 5400, 7450],
  [2025, 5700],
  [],
  ['Age-to-age', '12-24', '24-36', '36-48', '48-60', '60-72', '72-ult'],
  [2020], [2021], [2022], [2023], [2024],
];
const L6_S1 = { 'B12:F12': '=C4/B4', 'B13:E13': '=C5/B5', 'B14:D14': '=C6/B6', 'B15:C15': '=C7/B7', B16: '=C8/B8' };
const L6_LAB2 = { A17: 'Simple average', A18: 'Volume-weighted' };
const L6_S2 = {
  'B17:F17': '=AVERAGE(B12:B16)',
  B18: '=SUM(C4:C8)/SUM(B4:B8)', C18: '=SUM(D4:D7)/SUM(C4:C7)', D18: '=SUM(E4:E6)/SUM(D4:D6)',
  E18: '=SUM(F4:F5)/SUM(E4:E5)', F18: '=G4/F4',
};
const L6_LAB3 = { A19: 'Selected', 'B19:F19': '=B18', G19: 1.01, A20: 'CDF to ultimate' };
const L6_S3 = { 'B20:G20': '=PRODUCT(B19:$G19)' };
const L6_LAB4 = {
  A22: 'AY', B22: 'Age', C22: 'Reported', D22: 'CDF', E22: 'Ultimate', F22: 'IBNR',
  A23: 2020, A24: 2021, A25: 2022, A26: 2023, A27: 2024, A28: 2025,
  B23: 72, B24: 60, B25: 48, B26: 36, B27: 24, B28: 12,
  C23: '=G4', C24: '=F5', C25: '=E6', C26: '=D7', C27: '=C8', C28: '=B9', A29: 'Total', C29: '=SUM(C23:C28)',
};
const L6_S4 = { 'D23:D28': '=INDEX($B$20:$G$20,MATCH(B23,$B$3:$G$3,0))', 'E23:E28': '=C23*D23', 'F23:F28': '=E23-C23', E29: '=SUM(E23:E28)', F29: '=SUM(F23:F28)' };
const L6_COLS = { A: 130, B: 80, C: 80, D: 80, E: 80, F: 80, G: 80 };
const L6_FMT = { 'B4:G9': 'int', 'B12:G20': 'dec4', 'C23:C29': 'int', 'D23:D28': 'dec4', 'E23:F29': 'int' };

/* =====================================================================
   Lesson 7 · Time value of money
   ===================================================================== */
const L7_BASE1 = [
  ['Annual interest rate', 0.04, '', 'Question', 'Answer'],
  ['Years', 15, '', 'PV of the 15 payments', ''],
  ['Annual payment (end of year)', 12000, '', 'FV of the 15 payments', ''],
  ['Savings target', 500000, '', 'Level deposit to reach the target', ''],
  ['Deposit if saving faster', 30000, '', 'Years to reach target at that deposit', ''],
];
const L7_S1 = { E2: '=PV(B1,B2,-B3)', E3: '=FV(B1,B2,-B3)', E4: '=PMT(B1,B2,0,-B4)', E5: '=NPER(B1,-B5,0,B4)' };
const L7_BASE2 = [
  ['Discount rate', 0.06, '', 'Measure', 'Answer'],
  ['', '', '', 'NPV at the discount rate', ''],
  ['Year', 'Cash flow', '', 'IRR', ''],
  [0, -50000],
  [1, 7000],
  [2, 7500],
  [3, 8000, '', 'Annuity payment', 6000],
  [4, 8500, '', 'Years', 12],
  [5, 9000, '', 'Price', 50000],
  [6, 9000, '', 'Implied yield (RATE)', ''],
  [7, 9000],
  [8, 9000],
];
const L7_S2 = { E2: '=NPV(B1,B5:B12)+B4', E3: '=IRR(B4:B12)', E10: '=RATE(E8,E7,-E9)' };
const L7_BASE3 = [
  ['Loan amount', 200000],
  ['Annual rate', 0.06],
  ['Term (years)', 10],
  ['Annual payment', ''],
  [],
  ['Year', 'Opening balance', 'Payment', 'Interest', 'Principal', 'Closing balance'],
  [1], [2], [3], [4], [5], [6], [7], [8], [9], [10],
  ['Total'],
];
const L7_S3 = { B4: '=PMT(B2,B3,-B1)', B7: '=B1', C7: '=$B$4', D7: '=B7*$B$2', E7: '=C7-D7', F7: '=B7-E7' };
const L7_S4 = { 'B8:B16': '=F7', 'C8:C16': '=$B$4', 'D8:D16': '=B8*$B$2', 'E8:E16': '=C8-D8', 'F8:F16': '=B8-E8', D17: '=SUM(D7:D16)', E17: '=SUM(E7:E16)' };
const L7_FMT3 = { B1: 'money0', B2: 'pct1', B4: 'money2', 'B7:F17': 'money2' };

/* =====================================================================
   Lesson 8 · Capstone reserve review
   ===================================================================== */
const L8_BASE = [
  ['Reported incurred losses ($000), cumulative by age in months'],
  [],
  ['AY', 12, 24, 36, 48, 60],
  [2021, 3000, 4350, 4890, 5120, 5200],
  [2022, 3200, 4610, 5180, 5400],
  [2023, 3400, 4960, 5560],
  [2024, 3600, 5180],
  [2025, 3800],
  ['Development', '12-24', '24-36', '36-48', '48-60', '60-ult'],
  ['Vol-wtd LDF', '', '', '', '', 1.00],
  ['CDF to ultimate'],
  [],
  ['AY', 'Earned premium', 'Age', 'Reported', 'CDF', 'CL ultimate', 'CL IBNR', '% unreported', 'BF IBNR'],
  [2021, 8000, 60, '=F4'],
  [2022, 8400, 48, '=E5'],
  [2023, 8800, 36, '=D6'],
  [2024, 9200, 24, '=C7'],
  [2025, 9600, 12, '=B8'],
  [],
  ['A priori loss ratio', 0.65],
  ['Total reported', '=SUM(D14:D18)'],
  ['Chain-ladder IBNR'],
  ['Bornhuetter-Ferguson IBNR'],
  ['CL ultimate loss ratio'],
  ['BF ultimate loss ratio'],
  ['BF minus CL IBNR'],
];
const L8_S1 = {
  B10: '=SUM(C4:C7)/SUM(B4:B7)', C10: '=SUM(D4:D6)/SUM(C4:C6)', D10: '=SUM(E4:E5)/SUM(D4:D5)', E10: '=F4/E4',
  'B11:F11': '=PRODUCT(B10:$F10)',
};
const L8_S2 = { 'E14:E18': '=INDEX($B$11:$F$11,MATCH(C14,$B$3:$F$3,0))', 'F14:F18': '=D14*E14', 'G14:G18': '=F14-D14', B22: '=SUMPRODUCT(D14:D18,E14:E18)-B21' };
const L8_S3 = { 'H14:H18': '=1-1/E14', 'I14:I18': '=B14*$B$20*H14', B23: '=SUMPRODUCT(B14:B18,H14:H18)*B20' };
const L8_S4 = { B24: '=(B21+B22)/SUM(B14:B18)', B25: '=(B21+B23)/SUM(B14:B18)', B26: '=B23-B22' };
const L8_COLS = { A: 200, B: 110, C: 70, D: 90, E: 80, F: 100, G: 90, H: 110, I: 90 };
const L8_FMT = { 'B4:F8': 'int', 'B10:F11': 'dec4', 'B14:B18': 'int', 'D14:D18': 'int', 'E14:E18': 'dec4', 'F14:G18': 'int', 'H14:H18': 'pct1', 'I14:I18': 'int', B20: 'pct0', 'B21:B23': 'int', 'B24:B25': 'pct1', B26: 'int' };

/* =====================================================================
   Track
   ===================================================================== */
export const TRACK = {
  id: 'excel',
  title: 'Excel for actuaries',
  blurb: 'Build the spreadsheet habits actuaries use every day, from fill-down formulas to a full chain-ladder and Bornhuetter-Ferguson reserve review, checked cell by cell.',
  lessons: [
    /* ---------------- 1 ---------------- */
    {
      id: 'xl-formulas', title: 'Formulas and relative references', short: 'Formulas', minutes: 15, level: 'Beginner',
      intro: `<p>Most actuarial spreadsheets are the same idea repeated: one formula written for the first row, then copied down a column. Excel makes this work with <b>relative references</b>. When you copy <code>=B2*C2</code> one row down it becomes <code>=B3*C3</code>, because the references move with the cell.</p>
<p>In this lesson you price a small personal auto book: premium equals exposures times rate, class by class. Then you summarise it the way a pricing actuary would before a rate review.</p>`,
      steps: [
        {
          id: 'xl-formulas-1', title: 'Premium = exposures × rate',
          body: `<p>Each row is a rating class. <b>Exposures</b> are car-years insured, and <b>Rate</b> is the premium per car-year.</p>
<p>In <code>D2</code> type <code>=B2*C2</code> and press Enter. Then fill it down to <code>D11</code>: select D2:D11 and press Ctrl+D, or drag the fill handle.</p>`,
          sheet: { rows: build(L1_BASE), cols: L1_COLS, formats: { 'B2:B11': 'int', 'C2:C11': 'money0', 'D2:D11': 'money0' }, inputs: ['D2:D11'] },
          solution: L1_S1,
          check: ['D2:D11'],
          require: [{ range: 'D2:D11', formula: true, msg: 'Use a formula (=B2*C2) rather than typing the premium, so it updates when a rate changes.' }],
          hints: [
            '<p>Every formula starts with <code>=</code>. Multiply with <code>*</code>.</p>',
            '<p>Write the formula once in D2, then copy it. Excel shifts B2 and C2 to B3 and C3 for you.</p>',
            '<p>D2: <code>=B2*C2</code>, then fill down to D11.</p>',
          ],
          takeaway: '<p>Write the formula once with relative references and fill it down; never retype it row by row.</p>',
        },
        {
          id: 'xl-formulas-2', title: 'Totals and the average rate',
          body: `<p>Now summarise the book in column F.</p>
<ul><li><code>F2</code>: total premium, <code>=SUM(D2:D11)</code></li>
<li><code>F3</code>: total exposures</li>
<li><code>F4</code>: average rate per exposure, total premium ÷ total exposures</li>
<li><code>F5</code>: the simple average of the ten rates in column C, using <code>AVERAGE</code></li></ul>
<p>Compare F4 and F5. They differ because F4 weights each class by its exposures.</p>`,
          sheet: { rows: build(L1_BASE, L1_S1, L1_LABELS2), cols: L1_COLS, formats: { 'B2:B11': 'int', 'C2:C11': 'money0', 'D2:D11': 'money0', F2: 'money0', F3: 'int', 'F4:F5': 'money2' }, inputs: ['F2:F5'] },
          solution: L1_S2,
          check: ['F2:F5'],
          require: [
            { range: 'F2:F3', fn: 'SUM', msg: 'Use SUM over the column range.' },
            { range: 'F4', formula: true, msg: 'Divide the two totals with a formula, e.g. =F2/F3.' },
            { range: 'F5', fn: 'AVERAGE', msg: 'Use AVERAGE over C2:C11.' },
          ],
          hints: [
            '<p>A range is written first cell, colon, last cell: <code>B2:B11</code>.</p>',
            '<p>F3 is the same idea as F2 but over the exposures column. F4 can point at your two totals.</p>',
            '<p><code>F3 =SUM(B2:B11)</code>, <code>F4 =F2/F3</code>, <code>F5 =AVERAGE(C2:C11)</code>.</p>',
          ],
          takeaway: '<p>An average rate should be exposure-weighted (total premium ÷ total exposures); a plain AVERAGE of rates overweights small classes.</p>',
        },
        {
          id: 'xl-formulas-3', title: 'MIN, MAX, AVERAGE and COUNT',
          body: `<p>A quick profile of the classes helps you spot problems before a review.</p>
<ul><li><code>F7</code>: smallest class premium (<code>MIN</code>)</li>
<li><code>F8</code>: largest class premium (<code>MAX</code>)</li>
<li><code>F9</code>: average class premium (<code>AVERAGE</code> of column D)</li>
<li><code>F10</code>: number of classes (<code>COUNT</code> of column D)</li>
<li><code>F11</code>: largest class's share of total premium, F8 ÷ F2</li></ul>`,
          sheet: { rows: build(L1_BASE, L1_S1, L1_LABELS2, L1_S2, L1_LABELS3), cols: L1_COLS, formats: { 'B2:B11': 'int', 'C2:C11': 'money0', 'D2:D11': 'money0', F2: 'money0', F3: 'int', 'F4:F5': 'money2', 'F7:F9': 'money0', F10: 'int', F11: 'pct1' }, inputs: ['F7:F11'] },
          solution: L1_S3,
          check: ['F7:F11'],
          require: [
            { range: 'F7', fn: 'MIN', msg: 'Use MIN(D2:D11).' },
            { range: 'F8', fn: 'MAX', msg: 'Use MAX(D2:D11).' },
            { range: 'F9', fn: 'AVERAGE', msg: 'Use AVERAGE(D2:D11).' },
            { range: 'F10', fn: 'COUNT', msg: 'Use COUNT(D2:D11), which counts the cells holding numbers.' },
            { range: 'F11', formula: true, msg: 'Divide with a formula so the share updates.' },
          ],
          hints: [
            '<p>All four functions take the same range, <code>D2:D11</code>.</p>',
            '<p>COUNT counts cells with numbers; COUNTA would also count text.</p>',
            '<p><code>F7 =MIN(D2:D11)</code> … <code>F11 =F8/F2</code>. Format F11 as a percent.</p>',
          ],
          takeaway: '<p>MIN, MAX, AVERAGE and COUNT give a fast sanity check on any column before you build on it.</p>',
        },
      ],
    },

    /* ---------------- 2 ---------------- */
    {
      id: 'xl-refs', title: 'Absolute and mixed references', short: 'Absolute refs', minutes: 15, level: 'Beginner',
      intro: `<p>Assumptions such as a trend rate live in one cell, and every row must point at that same cell. A dollar sign locks a reference when you copy it: <code>$B$1</code> never moves, <code>B$1</code> keeps its row, <code>$B1</code> keeps its column. Press F4 while editing a reference to cycle through the four forms.</p>
<p>Here you trend historical claim severities to a future year, the first step of almost every ratemaking analysis.</p>`,
      steps: [
        {
          id: 'xl-refs-1', title: 'Years of trend with a locked cell',
          body: `<p>Losses from 2018 must be projected to the future policy year in <code>B2</code>. The number of years of trend is B2 minus the accident year.</p>
<p>In <code>C5</code> type <code>=$B$2-A5</code> and fill down to <code>C12</code>. The <code>$</code> signs keep every row pointing at B2.</p>`,
          sheet: { rows: build(L2_BASE), cols: { A: 160, B: 110, C: 120, D: 110, E: 130 }, formats: L2_FMT, inputs: ['C5:C12'] },
          solution: L2_S1,
          check: ['C5:C12'],
          require: [{ range: 'C5:C12', pattern: '\\$B\\$2', msg: 'Lock the projection year with $B$2 so it does not move when you fill down.' }],
          hints: [
            '<p>Try <code>=B2-A5</code> and fill down: row 6 becomes <code>=B3-A6</code>, which points at an empty cell. That is the bug absolute references fix.</p>',
            '<p>Put the cursor on B2 inside the formula and press F4 to get <code>$B$2</code>.</p>',
            '<p>C5: <code>=$B$2-A5</code>, filled down.</p>',
          ],
          takeaway: '<p>Lock assumption cells with $ so filled formulas keep pointing at them.</p>',
        },
        {
          id: 'xl-refs-2', title: 'Trend factors and trended severity',
          body: `<p>The trend factor is <code>(1 + trend)^years</code>.</p>
<ul><li><code>D5</code>: <code>=(1+$B$1)^C5</code>, filled down to D12</li>
<li><code>E5</code>: trended severity, average severity × trend factor, filled down to E12</li></ul>
<p>Try changing B1 to 4% afterwards: the whole column updates. That is why the assumption lives in one cell.</p>`,
          sheet: { rows: build(L2_BASE, L2_S1), cols: { A: 160, B: 110, C: 120, D: 110, E: 130 }, formats: L2_FMT, inputs: ['D5:E12'] },
          solution: L2_S2,
          check: ['D5:E12'],
          require: [
            { range: 'D5:D12', pattern: '\\$B\\$1', msg: 'Lock the trend cell with $B$1.' },
            { range: 'E5:E12', formula: true, msg: 'Multiply with a formula: =B5*D5.' },
          ],
          hints: [
            '<p><code>^</code> raises to a power. Brackets matter: <code>(1+$B$1)^C5</code>.</p>',
            '<p>Only the trend cell is locked. C5 and B5 should move as you fill down.</p>',
            '<p><code>D5 =(1+$B$1)^C5</code>, <code>E5 =B5*D5</code>; fill both down.</p>',
          ],
          takeaway: '<p>Mix locked assumptions with relative data references in one formula, then fill.</p>',
        },
        {
          id: 'xl-refs-3', title: 'A two-way table with mixed references',
          body: `<p>Build a lookup table of trend factors: trend rates across row 3, years down column A.</p>
<p>In <code>B4</code> type <code>=(1+B$3)^$A4</code>, then fill it across and down to <code>F11</code>. <code>B$3</code> keeps row 3 (the rates) as you go down; <code>$A4</code> keeps column A (the years) as you go right.</p>`,
          sheet: { rows: build(L2_GRID), cols: { A: 130, B: 80, C: 80, D: 80, E: 80, F: 80 }, formats: { 'B3:F3': 'pct0', 'B4:F11': 'dec4' }, inputs: ['B4:F11'] },
          solution: { 'B4:F11': '=(1+B$3)^$A4' },
          check: ['B4:F11'],
          require: [
            { range: 'B4:F11', pattern: '[A-F]\\$3', msg: 'Lock the row of the rate reference (B$3) so it stays on row 3.' },
            { range: 'B4:F11', pattern: '\\$A\\d', msg: 'Lock the column of the years reference ($A4) so it stays in column A.' },
          ],
          hints: [
            '<p>Ask of each reference: should it move when I fill down? When I fill right?</p>',
            '<p>The rate must stay on row 3 but move across columns; the year must stay in column A but move down rows.</p>',
            '<p>B4: <code>=(1+B$3)^$A4</code>. Select B4:F11, then Ctrl+D and Ctrl+R.</p>',
          ],
          takeaway: '<p>One formula with mixed references fills an entire two-way table.</p>',
        },
      ],
    },

    /* ---------------- 3 ---------------- */
    {
      id: 'xl-logic', title: 'Logic: deductibles, limits and flags', short: 'Logic', minutes: 20, level: 'Intermediate',
      intro: `<p>Policy terms turn a ground-up loss into what the insurer actually pays. A deductible removes the first part of each loss; a limit caps the payment. In a spreadsheet that is <code>MIN</code> and <code>MAX</code>, and claim triage rules are <code>IF</code>, <code>AND</code> and <code>OR</code>.</p>
<p>You will apply policy terms to a claim listing, flag large and litigated claims, and handle months with no data without breaking a report.</p>`,
      steps: [
        {
          id: 'xl-logic-1', title: 'Payment after deductible and limit',
          body: `<p>The insurer pays the loss minus the deductible (never below zero), capped at the policy limit:</p>
<p><code>payment = MIN(MAX(loss − deductible, 0), limit)</code></p>
<p>In <code>D6</code> type <code>=MIN(MAX(B6-$B$1,0),$B$2)</code> and fill down to <code>D17</code>. Then in <code>H6</code> total the insurer's payments.</p>`,
          sheet: { rows: build(L3_BASE, { G6: 'Total insurer pays' }), cols: L3_COLS, formats: L3_FMT, inputs: ['D6:D17', 'H6'] },
          solution: L3_S1,
          check: ['D6:D17', 'H6'],
          require: [
            { range: 'D6:D17', fn: 'MIN', msg: 'Cap the payment at the limit with MIN.' },
            { range: 'D6:D17', fn: 'MAX', msg: 'Floor the payment at zero with MAX.' },
            { range: 'D6:D17', pattern: '\\$B\\$1', msg: 'Lock the deductible cell with $B$1.' },
            { range: 'H6', fn: 'SUM', msg: 'Total the column with SUM.' },
          ],
          hints: [
            '<p>Work inside out: <code>B6-$B$1</code> is the loss above the deductible, which can be negative for small claims.</p>',
            '<p><code>MAX(…,0)</code> turns negatives into zero. <code>MIN(…,$B$2)</code> stops at the limit.</p>',
            '<p>D6: <code>=MIN(MAX(B6-$B$1,0),$B$2)</code>; H6: <code>=SUM(D6:D17)</code>.</p>',
          ],
          takeaway: '<p>MIN(MAX(loss − deductible, 0), limit) is the one-line formula for a deductible plus limit.</p>',
        },
        {
          id: 'xl-logic-2', title: 'Flag large losses with IF',
          body: `<p>Reserving actuaries often handle large losses separately. Flag any ground-up loss above the threshold in <code>B3</code>.</p>
<p>In <code>E6</code> type <code>=IF(B6>$B$3,"Yes","No")</code> and fill down to <code>E17</code>. Text results go in double quotes, spelled exactly <code>Yes</code> and <code>No</code>.</p>`,
          sheet: { rows: build(L3_BASE, { G6: 'Total insurer pays' }, L3_S1), cols: L3_COLS, formats: L3_FMT, inputs: ['E6:E17'] },
          solution: L3_S2,
          check: ['E6:E17'],
          require: [
            { range: 'E6:E17', fn: 'IF', msg: 'Use IF(test, value if true, value if false).' },
            { range: 'E6:E17', pattern: '\\$B\\$3', msg: 'Lock the threshold cell with $B$3.' },
          ],
          hints: [
            '<p>IF takes three parts: a test, what to show when it is true, and what to show when it is false.</p>',
            '<p>The test is <code>B6>$B$3</code>.</p>',
            '<p>E6: <code>=IF(B6>$B$3,"Yes","No")</code>, filled down.</p>',
          ],
          takeaway: '<p>IF turns a rule into a column; lock the threshold so the rule is applied consistently.</p>',
        },
        {
          id: 'xl-logic-3', title: 'Combine tests with AND and OR',
          body: `<p>Claims go to a senior adjuster if <b>either</b> the loss is above the large-loss threshold, <b>or</b> the claim is litigated (<code>C</code> = "Y") <b>and</b> the loss is above 5,000.</p>
<p>In <code>F6</code> return <code>Refer</code> or <code>OK</code>:</p>
<p><code>=IF(OR(B6>$B$3,AND(C6="Y",B6>5000)),"Refer","OK")</code></p>
<p>Fill down to <code>F17</code>.</p>`,
          sheet: { rows: build(L3_BASE, { G6: 'Total insurer pays' }, L3_S1, L3_S2), cols: L3_COLS, formats: L3_FMT, inputs: ['F6:F17'] },
          solution: L3_S3,
          check: ['F6:F17'],
          require: [
            { range: 'F6:F17', fn: 'OR', msg: 'Use OR for "either" conditions.' },
            { range: 'F6:F17', fn: 'AND', msg: 'Use AND for "litigated and above 5,000".' },
          ],
          hints: [
            '<p>AND is true only when every test is true; OR is true when any test is true.</p>',
            '<p>The litigation test is <code>AND(C6="Y",B6>5000)</code>. Put it inside an OR with the large-loss test.</p>',
            '<p>F6: <code>=IF(OR(B6>$B$3,AND(C6="Y",B6>5000)),"Refer","OK")</code>.</p>',
          ],
          takeaway: '<p>Nest AND inside OR inside IF to write a triage rule exactly as the claims manual states it.</p>',
        },
        {
          id: 'xl-logic-4', title: 'IFERROR for months with no data',
          body: `<p>Average severity is paid ÷ claims closed, but some months closed nothing, so the division gives <code>#DIV/0!</code>.</p>
<ul><li><code>D2</code>: <code>=IFERROR(B2/C2,"n/a")</code>, filled down to D13</li>
<li><code>F2</code>: overall severity, total paid ÷ total closed</li>
<li><code>F3</code>: <code>AVERAGE</code> of D2:D13</li></ul>
<p>AVERAGE skips the "n/a" text. If you had used 0 instead, those months would drag the average down.</p>`,
          sheet: { rows: build(L3_SEV), cols: { A: 70, B: 170, C: 110, D: 130, E: 220, F: 110 }, formats: { 'B2:B13': 'money0', 'D2:D13': 'money0', 'F2:F3': 'money0' }, inputs: ['D2:D13', 'F2:F3'] },
          solution: L3_S4,
          check: ['D2:D13', 'F2:F3'],
          require: [
            { range: 'D2:D13', fn: 'IFERROR', msg: 'Wrap the division in IFERROR(…,"n/a").' },
            { range: 'F2', fn: 'SUM', msg: 'Divide total paid by total closed, using SUM for each.' },
            { range: 'F3', fn: 'AVERAGE', msg: 'Use AVERAGE(D2:D13).' },
          ],
          hints: [
            '<p><code>IFERROR(value, fallback)</code> returns the value unless it is an error.</p>',
            '<p>F2 and F3 differ: F2 weights by claim count, F3 weights each month equally.</p>',
            '<p><code>D2 =IFERROR(B2/C2,"n/a")</code>, <code>F2 =SUM(B2:B13)/SUM(C2:C13)</code>, <code>F3 =AVERAGE(D2:D13)</code>.</p>',
          ],
          takeaway: '<p>Use IFERROR to keep reports readable, and choose a fallback that will not distort later averages.</p>',
        },
      ],
    },

    /* ---------------- 4 ---------------- */
    {
      id: 'xl-cond', title: 'Conditional sums and counts', short: 'SUMIFS', minutes: 20, level: 'Intermediate',
      intro: `<p>Claim listings arrive as one row per claim. Actuaries summarise them by line, accident year and status with <code>SUMIFS</code>, <code>COUNTIFS</code> and <code>AVERAGEIFS</code>. These take a range to add up followed by pairs of (criteria range, criterion).</p>
<p>In full Excel you might build the same summary with a pivot table. Formulas have the advantage of updating live and sitting exactly where your exhibit needs them.</p>`,
      steps: [
        {
          id: 'xl-cond-1', title: 'Incurred and counts by line',
          body: `<p>Fill the summary in columns H and I for each line in G3:G5.</p>
<ul><li><code>H3</code>: <code>=SUMIFS($E$2:$E$16,$B$2:$B$16,G3)</code>, filled down to H5</li>
<li><code>I3</code>: claim count with <code>COUNTIFS($B$2:$B$16,G3)</code>, filled down to I5</li></ul>
<p>The data ranges are locked; the criterion G3 moves down to G4 and G5.</p>`,
          sheet: { rows: build(L4_BASE, L4_LAB1), cols: L4_COLS, formats: L4_FMT, inputs: ['H3:I5'] },
          solution: L4_S1,
          check: ['H3:I5'],
          require: [
            { range: 'H3:H5', fn: 'SUMIFS', msg: 'Use SUMIFS(sum range, criteria range, criterion).' },
            { range: 'H3:H5', pattern: '\\$E\\$2:\\$E\\$16', msg: 'Lock the sum range as $E$2:$E$16 so it does not slide when filled.' },
            { range: 'I3:I5', fn: 'COUNTIFS', msg: 'Use COUNTIFS(criteria range, criterion).' },
          ],
          hints: [
            '<p>SUMIFS puts the range to add <b>first</b>, then the column to test and the value to test for.</p>',
            '<p>Lock the listing ranges with $ but leave G3 relative.</p>',
            '<p>H3: <code>=SUMIFS($E$2:$E$16,$B$2:$B$16,G3)</code>; I3: <code>=COUNTIFS($B$2:$B$16,G3)</code>.</p>',
          ],
          takeaway: '<p>SUMIFS and COUNTIFS with locked data ranges and a relative criterion cell fill cleanly down a summary.</p>',
        },
        {
          id: 'xl-cond-2', title: 'Two criteria: closed severity and open counts',
          body: `<p>Average severity is usually measured on closed claims, because open claims may still develop.</p>
<ul><li><code>J3</code>: average incurred of <b>closed</b> claims for the line in G3, using <code>AVERAGEIFS</code></li>
<li><code>K3</code>: number of <b>open</b> claims for that line, using <code>COUNTIFS</code> with two criteria</li></ul>
<p>Fill both down to row 5. Type the status in quotes: <code>"Closed"</code>, <code>"Open"</code>.</p>`,
          sheet: { rows: build(L4_BASE, L4_LAB1, L4_S1, L4_LAB2), cols: L4_COLS, formats: L4_FMT, inputs: ['J3:K5'] },
          solution: L4_S2,
          check: ['J3:K5'],
          require: [
            { range: 'J3:J5', fn: 'AVERAGEIFS', msg: 'Use AVERAGEIFS with a line criterion and a status criterion.' },
            { range: 'K3:K5', fn: 'COUNTIFS', msg: 'Use COUNTIFS with two criteria pairs.' },
          ],
          hints: [
            '<p>Each extra condition is another pair: <code>$D$2:$D$16,"Closed"</code>.</p>',
            '<p>AVERAGEIFS has the same shape as SUMIFS: the averaging range first.</p>',
            '<p>J3: <code>=AVERAGEIFS($E$2:$E$16,$B$2:$B$16,G3,$D$2:$D$16,"Closed")</code>; K3: <code>=COUNTIFS($B$2:$B$16,G3,$D$2:$D$16,"Open")</code>.</p>',
          ],
          takeaway: '<p>Add criteria pairs to slice the same listing as many ways as the analysis needs.</p>',
        },
        {
          id: 'xl-cond-3', title: 'A line × accident-year grid',
          body: `<p>Build incurred by line (rows) and accident year (columns) with one formula.</p>
<p>In <code>H10</code> type <code>=SUMIFS($E$2:$E$16,$B$2:$B$16,$G10,$C$2:$C$16,H$9)</code> and fill to <code>J12</code>. Then:</p>
<ul><li><code>K10:K12</code>: row totals with SUM</li>
<li><code>K13</code>: grand total of H10:J12. It should equal the sum of column E, a reconciliation every actuary checks.</li></ul>`,
          sheet: { rows: build(L4_BASE, L4_LAB1, L4_S1, L4_LAB2, L4_S2, L4_LAB3), cols: L4_COLS, formats: L4_FMT, inputs: ['H10:K12', 'K13'] },
          solution: L4_S3,
          check: ['H10:K12', 'K13'],
          require: [
            { range: 'H10:J12', fn: 'SUMIFS', msg: 'Use SUMIFS with a line criterion and a year criterion.' },
            { range: 'H10:J12', pattern: '\\$G\\d', msg: 'Lock the column of the line label ($G10).' },
            { range: 'H10:J12', pattern: '[H-J]\\$9', msg: 'Lock the row of the year header (H$9).' },
            { range: 'K10:K13', fn: 'SUM', msg: 'Use SUM for the totals.' },
          ],
          hints: [
            '<p>The line label is always in column G; the year is always on row 9.</p>',
            '<p>So the line criterion is <code>$G10</code> and the year criterion is <code>H$9</code>.</p>',
            '<p>H10: <code>=SUMIFS($E$2:$E$16,$B$2:$B$16,$G10,$C$2:$C$16,H$9)</code>; K10: <code>=SUM(H10:J10)</code>; K13: <code>=SUM(H10:J12)</code>.</p>',
          ],
          takeaway: '<p>Mixed references turn SUMIFS into a whole two-way exhibit, and a grand-total reconciliation proves it.</p>',
        },
        {
          id: 'xl-cond-4', title: 'Criteria with operators',
          body: `<p>How concentrated is the book in large claims? Use the threshold in <code>H16</code>.</p>
<ul><li><code>H17</code>: number of claims with incurred above H16: <code>=COUNTIFS(E2:E16,"&gt;"&amp;H16)</code></li>
<li><code>H18</code>: total incurred of those claims, using SUMIFS</li>
<li><code>H19</code>: their share of all incurred</li></ul>
<p>Joining <code>"&gt;"</code> to the cell with <code>&amp;</code> lets you change the threshold without editing formulas.</p>`,
          sheet: { rows: build(L4_BASE, L4_LAB1, L4_S1, L4_LAB2, L4_S2, L4_LAB3, L4_S3, L4_LAB4), cols: L4_COLS, formats: L4_FMT, inputs: ['H17:H19'] },
          solution: L4_S4,
          check: ['H17:H19'],
          require: [
            { range: 'H17', fn: 'COUNTIFS', msg: 'Use COUNTIFS with the criterion ">"&H16.' },
            { range: 'H18', fn: 'SUMIFS', msg: 'Use SUMIFS with the criterion ">"&H16.' },
            { range: 'H17:H18', pattern: '&\\s*\\$?H\\$?16', msg: 'Build the criterion from the threshold cell: ">"&H16.' },
          ],
          hints: [
            '<p>A criterion can be text like <code>">10000"</code>. To use a cell instead, join the operator to it.</p>',
            '<p>In SUMIFS the sum range and the criteria range can be the same column.</p>',
            '<p><code>H18 =SUMIFS(E2:E16,E2:E16,"&gt;"&amp;H16)</code>, <code>H19 =H18/SUM(E2:E16)</code>.</p>',
          ],
          takeaway: '<p>Build criteria like "&gt;"&amp;cell so thresholds are assumptions, not hard-coded text.</p>',
        },
      ],
    },

    /* ---------------- 5 ---------------- */
    {
      id: 'xl-lookup', title: 'Lookups and rating factors', short: 'Lookups', minutes: 20, level: 'Intermediate',
      intro: `<p>A rating algorithm multiplies a base rate by factors read from tables: territory, driver age, vehicle type. Lookup functions fetch the right factor for each policy.</p>
<ul><li><b>Exact match</b> (VLOOKUP with FALSE, XLOOKUP, MATCH with 0) for codes like territories.</li>
<li><b>Approximate match</b> (VLOOKUP with TRUE) for bands: it finds the largest key not above the value, so the table must be sorted ascending.</li></ul>`,
      steps: [
        {
          id: 'xl-lookup-1', title: 'Territory factor with VLOOKUP',
          body: `<p>The territory table is in <code>J4:K8</code>. In <code>E4</code> type <code>=VLOOKUP(B4,$J$4:$K$8,2,FALSE)</code> and fill down to <code>E13</code>.</p>
<p>The arguments: what to find, the table (locked), which column to return, and FALSE for an exact match.</p>`,
          sheet: { rows: build(L5_BASE), cols: L5_COLS, formats: L5_FMT, inputs: ['E4:E13'] },
          solution: L5_S1,
          check: ['E4:E13'],
          require: [
            { range: 'E4:E13', fn: 'VLOOKUP', msg: 'Use VLOOKUP.' },
            { range: 'E4:E13', pattern: '\\$J\\$4', msg: 'Lock the table as $J$4:$K$8.' },
          ],
          hints: [
            '<p>VLOOKUP searches the first column of the table and returns a value from the same row.</p>',
            '<p>The factor is in the 2nd column of J4:K8. Use FALSE so "T2" only matches "T2".</p>',
            '<p>E4: <code>=VLOOKUP(B4,$J$4:$K$8,2,FALSE)</code>.</p>',
          ],
          takeaway: '<p>Exact-match VLOOKUP with a locked table maps codes to factors.</p>',
        },
        {
          id: 'xl-lookup-2', title: 'Age bands with approximate match',
          body: `<p>The age table in <code>M4:N9</code> lists the <b>start</b> of each band: 16–20, 21–24, 25–49, and so on.</p>
<p>In <code>F4</code> type <code>=VLOOKUP(C4,$M$4:$N$9,2,TRUE)</code> and fill down to <code>F13</code>. With TRUE, age 34 finds the largest start age not above 34, which is 25.</p>`,
          sheet: { rows: build(L5_BASE, L5_S1), cols: L5_COLS, formats: L5_FMT, inputs: ['F4:F13'] },
          solution: L5_S2,
          check: ['F4:F13'],
          require: [
            { range: 'F4:F13', fn: 'VLOOKUP', msg: 'Use VLOOKUP with TRUE for banded lookups.' },
            { range: 'F4:F13', pattern: '\\$M\\$4', msg: 'Lock the age table as $M$4:$N$9.' },
          ],
          hints: [
            '<p>An exact match would fail for age 34, which is not in the table.</p>',
            '<p>Approximate match needs the first column sorted from smallest to largest, which it is.</p>',
            '<p>F4: <code>=VLOOKUP(C4,$M$4:$N$9,2,TRUE)</code>.</p>',
          ],
          takeaway: '<p>Approximate-match lookups turn sorted band starts into factors without listing every age.</p>',
        },
        {
          id: 'xl-lookup-3', title: 'Vehicle factor with XLOOKUP',
          body: `<p>XLOOKUP takes a lookup column and a return column separately, defaults to exact match, and does not care where the return column sits.</p>
<p>In <code>G4</code> type <code>=XLOOKUP(D4,$P$4:$P$8,$Q$4:$Q$8)</code> and fill down to <code>G13</code>.</p>`,
          sheet: { rows: build(L5_BASE, L5_S1, L5_S2), cols: L5_COLS, formats: L5_FMT, inputs: ['G4:G13'] },
          solution: L5_S3,
          check: ['G4:G13'],
          require: [{ range: 'G4:G13', fn: 'XLOOKUP', msg: 'Use XLOOKUP(value, lookup column, return column).' }],
          hints: [
            '<p>The vehicle names are in P4:P8 and the factors in Q4:Q8.</p>',
            '<p>Lock both ranges so they stay put as you fill down.</p>',
            '<p>G4: <code>=XLOOKUP(D4,$P$4:$P$8,$Q$4:$Q$8)</code>.</p>',
          ],
          takeaway: '<p>XLOOKUP is a cleaner exact-match lookup: separate find and return ranges, no column number to miscount.</p>',
        },
        {
          id: 'xl-lookup-4', title: 'Premium, then INDEX/MATCH',
          body: `<p>Now apply the rating algorithm: premium = base rate × territory × age × vehicle factor.</p>
<ul><li><code>H4</code>: <code>=$B$1*E4*F4*G4</code>, filled down to H13</li>
<li><code>K12</code>: the premium of the policy named in K11, using <code>=INDEX(H4:H13,MATCH(K11,A4:A13,0))</code></li></ul>
<p>MATCH finds the row position; INDEX returns the value at that position. Try typing another policy number in K11.</p>`,
          sheet: { rows: build(L5_BASE, L5_S1, L5_S2, L5_S3, L5_LAB4), cols: L5_COLS, formats: L5_FMT, inputs: ['H4:H13', 'K12'] },
          solution: L5_S4,
          check: ['H4:H13', 'K12'],
          require: [
            { range: 'H4:H13', pattern: '\\$B\\$1', msg: 'Lock the base rate with $B$1.' },
            { range: 'K12', fn: 'INDEX', msg: 'Use INDEX(return range, position).' },
            { range: 'K12', fn: 'MATCH', msg: 'Use MATCH(value, lookup range, 0) for the position.' },
          ],
          hints: [
            '<p>Multiply the base rate by all three factors. Only the base rate is locked.</p>',
            '<p><code>MATCH(K11,A4:A13,0)</code> returns 7 for P-107. INDEX then picks the 7th premium.</p>',
            '<p><code>H4 =$B$1*E4*F4*G4</code>; <code>K12 =INDEX(H4:H13,MATCH(K11,A4:A13,0))</code>.</p>',
          ],
          takeaway: '<p>Premium is base rate times looked-up factors; INDEX/MATCH retrieves any row by key.</p>',
        },
      ],
    },

    /* ---------------- 6 ---------------- */
    {
      id: 'xl-triangle', title: 'Loss development triangle', short: 'Triangles', minutes: 25, level: 'Advanced',
      intro: `<p>A loss development triangle shows each accident year's cumulative losses at successive ages. Losses keep growing as claims are reported and case reserves move. The chain-ladder method measures that growth with <b>age-to-age factors</b>, chains them into <b>cumulative development factors</b> (CDFs), and projects each year to ultimate.</p>
<p>The difference between ultimate and reported losses is the <b>IBNR</b> reserve, a number that goes straight into the company's balance sheet.</p>`,
      steps: [
        {
          id: 'xl-triangle-1', title: 'Age-to-age factors',
          body: `<p>Each factor is the next age's losses ÷ this age's losses for the same accident year.</p>
<p>In <code>B12</code> type <code>=C4/B4</code>. Fill it right and down, but only over the triangle: B12:F12 for 2020, B13:E13 for 2021, … B16 alone for 2024. Clear any cells that land outside the triangle.</p>`,
          sheet: { rows: build(L6_TRI), cols: L6_COLS, formats: L6_FMT, inputs: ['B12:F12', 'B13:E13', 'B14:D14', 'B15:C15', 'B16'] },
          solution: L6_S1,
          check: ['B12:F12', 'B13:E13', 'B14:D14', 'B15:C15', 'B16'],
          require: [{ range: 'B12:F12', formula: true, msg: 'Use formulas so the factors update with the triangle.' }],
          hints: [
            '<p>Row 12 is accident year 2020, which is triangle row 4. The 12-24 factor is 24-month ÷ 12-month: C4/B4.</p>',
            '<p>All references are relative, so one formula filled right and down covers the triangle.</p>',
            '<p>B12: <code>=C4/B4</code>. Fill to F12, then fill B12:E12 down a row at a time, stopping at the diagonal.</p>',
          ],
          takeaway: '<p>Age-to-age factors are a single relative formula filled across the triangle shape.</p>',
        },
        {
          id: 'xl-triangle-2', title: 'Simple and volume-weighted averages',
          body: `<p>Summarise each column of factors two ways.</p>
<ul><li><code>B17:F17</code>: simple average, <code>=AVERAGE(B12:B16)</code> filled right (AVERAGE ignores empty cells)</li>
<li><code>B18:F18</code>: volume-weighted average = sum of later-age losses ÷ sum of earlier-age losses, over the years that have both. For 12-24: <code>=SUM(C4:C8)/SUM(B4:B8)</code>.</li></ul>
<p>The ranges in row 18 get one row shorter each column, so type each one (C18 uses rows 4 to 7, D18 rows 4 to 6, and so on).</p>`,
          sheet: { rows: build(L6_TRI, L6_S1, L6_LAB2), cols: L6_COLS, formats: L6_FMT, inputs: ['B17:F18'] },
          solution: L6_S2,
          check: ['B17:F18'],
          require: [
            { range: 'B17:F17', fn: 'AVERAGE', msg: 'Use AVERAGE over each factor column.' },
            { range: 'B18:E18', fn: 'SUM', msg: 'Volume-weighted = SUM of the later column ÷ SUM of the earlier column.' },
            { range: 'F18', formula: true, msg: 'With one year of data, F18 is just G4/F4.' },
          ],
          hints: [
            '<p>Volume weighting gives bigger accident years more say. It equals the ratio of column totals.</p>',
            '<p>For 24-36, use only accident years with a 36-month value: rows 4 to 7.</p>',
            '<p><code>C18 =SUM(D4:D7)/SUM(C4:C7)</code>, <code>D18 =SUM(E4:E6)/SUM(D4:D6)</code>, <code>E18 =SUM(F4:F5)/SUM(E4:E5)</code>, <code>F18 =G4/F4</code>.</p>',
          ],
          takeaway: '<p>The volume-weighted factor is SUM ÷ SUM over matching years, not an average of ratios.</p>',
        },
        {
          id: 'xl-triangle-3', title: 'Cumulative development factors',
          body: `<p>Row 19 holds the selected factors (here the volume-weighted ones) and a tail factor of 1.01 in <code>G19</code> for development after 72 months.</p>
<p>The CDF from an age to ultimate is the product of every selected factor from that age onward. In <code>B20</code> type <code>=PRODUCT(B19:$G19)</code> and fill right to <code>G20</code>. The <code>$G</code> anchors the end of the range while the start slides right.</p>`,
          sheet: { rows: build(L6_TRI, L6_S1, L6_LAB2, L6_S2, L6_LAB3), cols: L6_COLS, formats: L6_FMT, inputs: ['B20:G20'] },
          solution: L6_S3,
          check: ['B20:G20'],
          require: [
            { range: 'B20:G20', fn: 'PRODUCT', msg: 'Use PRODUCT over the remaining selected factors.' },
            { range: 'B20:G20', pattern: '\\$G\\$?19', msg: 'Anchor the end of the range with $G19.' },
          ],
          hints: [
            '<p>The 12-ultimate CDF multiplies all six factors in B19:G19. The 24-ultimate CDF multiplies C19:G19.</p>',
            '<p>Only the end of the range should stay fixed, so lock its column: <code>$G19</code>.</p>',
            '<p>B20: <code>=PRODUCT(B19:$G19)</code>, filled right.</p>',
          ],
          takeaway: '<p>A half-anchored range like B19:$G19 builds every CDF from one formula.</p>',
        },
        {
          id: 'xl-triangle-4', title: 'Ultimate losses and IBNR',
          body: `<p>Rows 23–28 list each accident year with its age and latest reported losses (the diagonal).</p>
<ul><li><code>D23</code>: the CDF for that age, <code>=INDEX($B$20:$G$20,MATCH(B23,$B$3:$G$3,0))</code>, filled down to D28</li>
<li><code>E23</code>: ultimate = reported × CDF</li>
<li><code>F23</code>: IBNR = ultimate − reported</li>
<li><code>E29</code> and <code>F29</code>: totals</li></ul>`,
          sheet: { rows: build(L6_TRI, L6_S1, L6_LAB2, L6_S2, L6_LAB3, L6_S3, L6_LAB4), cols: L6_COLS, formats: L6_FMT, inputs: ['D23:F28', 'E29:F29'] },
          solution: L6_S4,
          check: ['D23:F28', 'E29:F29'],
          require: [
            { range: 'D23:D28', fn: 'MATCH', msg: 'Find the age in row 3 with MATCH(…,0) and return the CDF with INDEX.' },
            { range: 'E29:F29', fn: 'SUM', msg: 'Total with SUM.' },
          ],
          hints: [
            '<p>The ages in row 3 line up with the CDFs in row 20, so the column position of an age gives its CDF.</p>',
            '<p>MATCH(72,$B$3:$G$3,0) is 6, and the 6th CDF is the 72-ultimate factor.</p>',
            '<p><code>D23 =INDEX($B$20:$G$20,MATCH(B23,$B$3:$G$3,0))</code>, <code>E23 =C23*D23</code>, <code>F23 =E23-C23</code>, <code>F29 =SUM(F23:F28)</code>.</p>',
          ],
          takeaway: '<p>Ultimate = latest × CDF to ultimate, and IBNR = ultimate − reported; most of it sits in the youngest years.</p>',
        },
      ],
    },

    /* ---------------- 7 ---------------- */
    {
      id: 'xl-tvm', title: 'Time value of money', short: 'TVM', minutes: 20, level: 'Intermediate',
      intro: `<p>Excel's financial functions answer the interest theory questions on actuarial exams in one line: <code>PV</code>, <code>FV</code>, <code>PMT</code>, <code>NPER</code>, <code>RATE</code>, <code>NPV</code> and <code>IRR</code>.</p>
<p>They use a cash-flow sign convention: money you pay out is negative, money you receive is positive. If an answer comes out negative, flip the sign of one input. Payments are at the end of each period unless you set the optional type argument to 1.</p>`,
      steps: [
        {
          id: 'xl-tvm-1', title: 'PV, FV, PMT and NPER',
          body: `<p>Answer each question in column E, using the inputs in B1:B5. Make every answer positive.</p>
<ul><li><code>E2</code>: present value of 15 payments of 12,000: <code>=PV(B1,B2,-B3)</code></li>
<li><code>E3</code>: accumulated value of the same payments, with <code>FV</code></li>
<li><code>E4</code>: level annual deposit that grows to the target in B4 over 15 years, with <code>PMT</code></li>
<li><code>E5</code>: years needed if you deposit B5 each year instead, with <code>NPER</code></li></ul>`,
          sheet: { rows: build(L7_BASE1), cols: { A: 210, B: 100, C: 24, D: 270, E: 120 }, formats: { B1: 'pct1', B3: 'money0', 'B4:B5': 'money0', 'E2:E4': 'money2', E5: 'dec2' }, inputs: ['E2:E5'] },
          solution: L7_S1,
          check: ['E2:E5'],
          require: [
            { range: 'E2', fn: 'PV', msg: 'Use PV(rate, nper, pmt).' },
            { range: 'E3', fn: 'FV', msg: 'Use FV(rate, nper, pmt).' },
            { range: 'E4', fn: 'PMT', msg: 'Use PMT(rate, nper, pv, fv).' },
            { range: 'E5', fn: 'NPER', msg: 'Use NPER(rate, pmt, pv, fv).' },
          ],
          hints: [
            '<p>The order is always rate, number of periods, payment, present value, future value.</p>',
            '<p>For PMT the present value is 0 and the future value is the target; pass the target as negative to get a positive deposit. For NPER pass the deposit as negative and the target as positive.</p>',
            '<p><code>E3 =FV(B1,B2,-B3)</code>, <code>E4 =PMT(B1,B2,0,-B4)</code>, <code>E5 =NPER(B1,-B5,0,B4)</code>.</p>',
          ],
          takeaway: '<p>Every annuity question is one TVM function once you keep the signs straight.</p>',
        },
        {
          id: 'xl-tvm-2', title: 'NPV, IRR and RATE',
          body: `<p>An insurer can pay 50,000 today for the cash flows in B5:B12.</p>
<ul><li><code>E2</code>: net present value at the rate in B1. Excel's <code>NPV</code> discounts its first value by one full year, so add the time-0 flow separately: <code>=NPV(B1,B5:B12)+B4</code></li>
<li><code>E3</code>: internal rate of return of B4:B12, with <code>IRR</code></li>
<li><code>E10</code>: the yield implied by an annuity of 6,000 a year for 12 years costing 50,000, with <code>RATE</code></li></ul>`,
          sheet: { rows: build(L7_BASE2), cols: { A: 120, B: 100, C: 24, D: 200, E: 110 }, formats: { B1: 'pct1', 'B4:B12': 'money0', E2: 'money2', E3: 'pct2', 'E7:E9': 'money0', E10: 'pct2' }, inputs: ['E2:E3', 'E10'] },
          solution: L7_S2,
          check: ['E2:E3', 'E10'],
          require: [
            { range: 'E2', fn: 'NPV', msg: 'Use NPV for years 1 to 8 and add the year-0 flow.' },
            { range: 'E3', fn: 'IRR', msg: 'Use IRR over all flows including year 0.' },
            { range: 'E10', fn: 'RATE', msg: 'Use RATE(nper, pmt, pv).' },
          ],
          hints: [
            '<p>A common mistake is <code>=NPV(B1,B4:B12)</code>, which discounts the year-0 payment by a year.</p>',
            '<p>IRR is the rate that makes the NPV zero. For RATE, the price is money paid out, so make it negative.</p>',
            '<p><code>E2 =NPV(B1,B5:B12)+B4</code>, <code>E3 =IRR(B4:B12)</code>, <code>E10 =RATE(E8,E7,-E9)</code>.</p>',
          ],
          takeaway: '<p>NPV starts discounting at period 1, so add time-0 flows yourself; IRR and RATE solve for the yield.</p>',
        },
        {
          id: 'xl-tvm-3', title: 'Loan payment and the first schedule row',
          body: `<p>Build an amortization schedule for the loan in B1:B3.</p>
<ul><li><code>B4</code>: annual payment, <code>=PMT(B2,B3,-B1)</code></li>
<li><code>B7</code>: opening balance in year 1, <code>=B1</code></li>
<li><code>C7</code>: payment, <code>=$B$4</code></li>
<li><code>D7</code>: interest on the opening balance, <code>=B7*$B$2</code></li>
<li><code>E7</code>: principal repaid, payment − interest</li>
<li><code>F7</code>: closing balance, opening − principal</li></ul>
<p>Lock the payment and rate now; you will fill this row down next.</p>`,
          sheet: { rows: build(L7_BASE3), cols: { A: 120, B: 130, C: 110, D: 110, E: 110, F: 130 }, formats: L7_FMT3, inputs: ['B4', 'B7:F7'] },
          solution: L7_S3,
          check: ['B4', 'B7:F7'],
          require: [
            { range: 'B4', fn: 'PMT', msg: 'Use PMT(rate, nper, -loan).' },
            { range: 'C7', pattern: '\\$B\\$4', msg: 'Lock the payment cell with $B$4.' },
            { range: 'D7', pattern: '\\$B\\$2', msg: 'Lock the rate cell with $B$2.' },
            { range: 'E7:F7', formula: true, msg: 'Use formulas for principal and closing balance.' },
          ],
          hints: [
            '<p>Each year, interest is charged on the opening balance; the rest of the payment reduces the balance.</p>',
            '<p>Only B4 and B2 need $ signs. B7, C7 and D7 in later rows should point at their own row.</p>',
            '<p><code>B4 =PMT(B2,B3,-B1)</code>, <code>D7 =B7*$B$2</code>, <code>E7 =C7-D7</code>, <code>F7 =B7-E7</code>.</p>',
          ],
          takeaway: '<p>Interest on the opening balance, principal is the remainder; lock the inputs before you fill.</p>',
        },
        {
          id: 'xl-tvm-4', title: 'Fill the schedule down',
          body: `<p>Next year's opening balance is this year's closing balance, so <code>B8</code> is <code>=F7</code>. Columns C to F copy the row-7 formulas.</p>
<ul><li>Fill <code>B8:F16</code> (B8 <code>=F7</code>, and C7:F7 copied down)</li>
<li><code>D17</code>: total interest; <code>E17</code>: total principal</li></ul>
<p>F16 should show a balance of $0.00, and E17 should equal the loan amount. Those two checks prove the schedule is right.</p>`,
          sheet: { rows: build(L7_BASE3, L7_S3), cols: { A: 120, B: 130, C: 110, D: 110, E: 110, F: 130 }, formats: L7_FMT3, inputs: ['B8:F16', 'D17:E17'] },
          solution: L7_S4,
          check: ['B8:E16', 'F8:F15', 'D17:E17'],
          require: [
            { range: 'B8:F16', formula: true, msg: 'Every schedule cell should be a formula.' },
            { range: 'D17:E17', fn: 'SUM', msg: 'Total with SUM.' },
          ],
          hints: [
            '<p>Select C7:F7 and fill it down to row 16; the locked payment and rate stay put.</p>',
            '<p>Column B is different: from row 8 on, it links to the previous row\'s closing balance.</p>',
            '<p><code>B8 =F7</code> filled down to B16; <code>D17 =SUM(D7:D16)</code>, <code>E17 =SUM(E7:E16)</code>.</p>',
          ],
          takeaway: '<p>Link each row\'s opening balance to the prior closing balance, then confirm the loan ends at zero.</p>',
        },
      ],
    },

    /* ---------------- 8 ---------------- */
    {
      id: 'xl-capstone', title: 'Capstone: a mini reserve review', short: 'Capstone', minutes: 30, level: 'Advanced',
      intro: `<p>Put it all together. You have a five-year reported loss triangle, earned premium by accident year and an a priori expected loss ratio of 65%. You will estimate IBNR two ways:</p>
<ul><li><b>Chain ladder</b>: ultimate = reported × CDF. Fully driven by the company's own development.</li>
<li><b>Bornhuetter-Ferguson</b>: IBNR = premium × expected loss ratio × (1 − 1/CDF). Blends development with the expected loss ratio, which steadies immature years.</li></ul>
<p>An actuary compares the two before choosing a reserve. In full Excel you would also chart the results; here the summary cells tell the story.</p>`,
      steps: [
        {
          id: 'xl-capstone-1', title: 'Development factors and CDFs',
          body: `<p>Tail factor <code>F10</code> is given as 1.000.</p>
<ul><li><code>B10:E10</code>: volume-weighted age-to-age factors, e.g. <code>B10 =SUM(C4:C7)/SUM(B4:B7)</code></li>
<li><code>B11:F11</code>: CDFs to ultimate with <code>=PRODUCT(B10:$F10)</code>, filled right</li></ul>`,
          sheet: { rows: build(L8_BASE), cols: L8_COLS, formats: L8_FMT, inputs: ['B10:E10', 'B11:F11'] },
          solution: L8_S1,
          check: ['B10:E10', 'B11:F11'],
          require: [
            { range: 'B10:D10', fn: 'SUM', msg: 'Volume-weighted = SUM ÷ SUM over the matching accident years.' },
            { range: 'E10', formula: true, msg: 'With one year of data, E10 is F4/E4.' },
            { range: 'B11:F11', fn: 'PRODUCT', msg: 'Use PRODUCT(B10:$F10) filled right.' },
          ],
          hints: [
            '<p>For 24-36 use accident years with a 36-month value: rows 4 to 6.</p>',
            '<p>Each CDF multiplies its own factor and every later one, including the tail.</p>',
            '<p><code>C10 =SUM(D4:D6)/SUM(C4:C6)</code>, <code>D10 =SUM(E4:E5)/SUM(D4:D5)</code>, <code>E10 =F4/E4</code>, <code>B11 =PRODUCT(B10:$F10)</code>.</p>',
          ],
          takeaway: '<p>Volume-weighted factors and an anchored PRODUCT give the CDFs every method below relies on.</p>',
        },
        {
          id: 'xl-capstone-2', title: 'Chain-ladder IBNR',
          body: `<ul><li><code>E14:E18</code>: CDF for each age, <code>=INDEX($B$11:$F$11,MATCH(C14,$B$3:$F$3,0))</code></li>
<li><code>F14:F18</code>: CL ultimate = reported × CDF</li>
<li><code>G14:G18</code>: CL IBNR = ultimate − reported</li>
<li><code>B22</code>: total chain-ladder IBNR in one cell, <code>=SUMPRODUCT(D14:D18,E14:E18)-B21</code></li></ul>
<p>B22 should match the sum of column G. SUMPRODUCT multiplies pairs and adds them, a whole column of ultimates in one step.</p>`,
          sheet: { rows: build(L8_BASE, L8_S1), cols: L8_COLS, formats: L8_FMT, inputs: ['E14:G18', 'B22'] },
          solution: L8_S2,
          check: ['E14:G18', 'B22'],
          require: [
            { range: 'E14:E18', fn: 'MATCH', msg: 'Look up the CDF with INDEX and MATCH on the age.' },
            { range: 'F14:G18', formula: true, msg: 'Use formulas for ultimate and IBNR.' },
            { range: 'B22', fn: 'SUMPRODUCT', msg: 'Use SUMPRODUCT(reported, CDF) minus total reported.' },
          ],
          hints: [
            '<p>The age in column C sits in row 3 above its CDF in row 11.</p>',
            '<p>Total ultimate = Σ reported × CDF = SUMPRODUCT(D14:D18,E14:E18). Total reported is already in B21.</p>',
            '<p><code>E14 =INDEX($B$11:$F$11,MATCH(C14,$B$3:$F$3,0))</code>, <code>F14 =D14*E14</code>, <code>G14 =F14-D14</code>.</p>',
          ],
          takeaway: '<p>Chain-ladder IBNR = Σ reported × CDF − Σ reported, one SUMPRODUCT.</p>',
        },
        {
          id: 'xl-capstone-3', title: 'Bornhuetter-Ferguson IBNR',
          body: `<p>BF assumes the unreported part of ultimate follows the a priori expectation rather than the reported losses so far.</p>
<ul><li><code>H14:H18</code>: % unreported = <code>1-1/E14</code></li>
<li><code>I14:I18</code>: BF IBNR = earned premium × a priori loss ratio (<code>$B$20</code>) × % unreported</li>
<li><code>B23</code>: total BF IBNR, <code>=SUMPRODUCT(B14:B18,H14:H18)*B20</code></li></ul>`,
          sheet: { rows: build(L8_BASE, L8_S1, L8_S2), cols: L8_COLS, formats: L8_FMT, inputs: ['H14:I18', 'B23'] },
          solution: L8_S3,
          check: ['H14:I18', 'B23'],
          require: [
            { range: 'H14:H18', formula: true, msg: 'Use =1-1/E14.' },
            { range: 'I14:I18', pattern: '\\$B\\$20', msg: 'Lock the a priori loss ratio with $B$20.' },
            { range: 'B23', fn: 'SUMPRODUCT', msg: 'Use SUMPRODUCT(premium, % unreported) × loss ratio.' },
          ],
          hints: [
            '<p>If the CDF is 1.25, then 1/1.25 = 80% is reported and 20% is still to come.</p>',
            '<p>Expected losses for a year are premium × 65%; BF IBNR is the unreported share of that.</p>',
            '<p><code>H14 =1-1/E14</code>, <code>I14 =B14*$B$20*H14</code>, <code>B23 =SUMPRODUCT(B14:B18,H14:H18)*B20</code>.</p>',
          ],
          takeaway: '<p>BF IBNR = premium × expected loss ratio × (1 − 1/CDF): stable where the chain ladder is most leveraged.</p>',
        },
        {
          id: 'xl-capstone-4', title: 'Loss ratios and the comparison',
          body: `<p>Finish the summary.</p>
<ul><li><code>B24</code>: chain-ladder ultimate loss ratio = (total reported + CL IBNR) ÷ total earned premium</li>
<li><code>B25</code>: BF ultimate loss ratio = (total reported + BF IBNR) ÷ total earned premium</li>
<li><code>B26</code>: BF IBNR minus CL IBNR</li></ul>
<p>The chain ladder implies a loss ratio above the 65% a priori, so BF, which leans on 65% for the immature years, gives less IBNR. Which to book is a judgment call that the actuary explains in the reserve report.</p>`,
          sheet: { rows: build(L8_BASE, L8_S1, L8_S2, L8_S3), cols: L8_COLS, formats: L8_FMT, inputs: ['B24:B26'] },
          solution: L8_S4,
          check: ['B24:B26'],
          require: [
            { range: 'B24:B25', fn: 'SUM', msg: 'Divide by total earned premium, SUM(B14:B18).' },
            { range: 'B26', formula: true, msg: 'Subtract with a formula: =B23-B22.' },
          ],
          hints: [
            '<p>Ultimate loss = reported + IBNR. Divide by the sum of earned premium.</p>',
            '<p>B21 already holds total reported; B22 and B23 hold the two IBNR totals.</p>',
            '<p><code>B24 =(B21+B22)/SUM(B14:B18)</code>, <code>B25 =(B21+B23)/SUM(B14:B18)</code>, <code>B26 =B23-B22</code>.</p>',
          ],
          takeaway: '<p>Compare methods through the ultimate loss ratio they imply; a gap from the a priori is what the reserve review must explain.</p>',
        },
      ],
    },
  ],
};
