import { stage, task, commission as craft } from './build-lesson.js';







const twoCtes = `WITH care_totals AS (SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id),
trait_counts AS (SELECT creature_id, COUNT(*) AS trait_count FROM traits GROUP BY creature_id)`;
const cteJoin = 'FROM creatures AS c LEFT JOIN care_totals AS v ON c.id = v.creature_id LEFT JOIN trait_counts AS t ON c.id = t.creature_id';

export const restorationPipeline = stage({
  id: 'restoration-pipeline', title: 'The constellation engine', place: 'The Observatory', scene: 'observatory', speaker: 'IONA', topic: 'Multiple CTEs · aggregate first, then join',
  brief: 'Build a readable pipeline from independently summarized evidence.', tables: ['creatures', 'care', 'traits'], relationships: 'Two independent child summaries each become one row per creature_id before joining creatures',
  pages: [
    { title: 'Two lenses, one sky', speaker: 'IONA', text: 'One lens records care visits; the other records magical traits. The observatory needs both views, but overlapping raw notes would multiply every observation.' },
    { title: 'Name every step', speaker: 'QUILL', text: 'Quill marks three spaces on the desk: care totals, trait counts, and the final roster. Each space has a clear question. Every final number can be traced to its own source.' },
  ],
  ending: { title: 'A constellation you can explain', speaker: 'IONA', text: 'The engine combines independently measured totals without inflating either. Beyond the observatory, an unfamiliar restoration ledger is waiting for the same care.' },
  paragraphs: [
    'One WITH can introduce several CTEs separated by commas: WITH first AS (...), second AS (...) SELECT .... Do not repeat WITH before the second name.',
    'Define care_totals by summing minutes per creature_id and trait_counts by counting observations per creature_id. These are independent questions. Each result has at most one row per creature, so joining both cannot create the old visit-by-trait multiplication.',
    'A later CTE can read an earlier CTE. You could define a roster after the two summaries, then filter that roster in the final SELECT. Keep each step focused and check its row granularity: what does one row represent?',
    'Preserve all creatures with LEFT JOIN when the report asks for every creature. COALESCE is appropriate for zero recorded counts. Apply final eligibility filters only after defining the totals they depend on.',
  ],
  example: `${twoCtes} SELECT c.id, c.name, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${cteJoin};`, columns: ['id', 'name', 'total_minutes', 'trait_count'],
  intermediates: [
    { title: 'Step 1: care totals', sql: 'SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id;', explanation: 'One row per creature_id summarizes visit minutes before traits enter the query.' },
    { title: 'Step 2: trait counts', sql: 'SELECT creature_id, COUNT(*) AS trait_count FROM traits GROUP BY creature_id;', explanation: 'A separate one-row-per-creature result measures observations. Neither summary can multiply the other.' },
    { title: 'Step 3: a later CTE reads both earlier CTEs', sql: `${twoCtes}, roster AS (SELECT c.id, c.ready, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${cteJoin}) SELECT id, ready, total_minutes, trait_count FROM roster;`, explanation: 'The roster CTE depends on both named summaries. Its output is one row per creature, ready for a final filter or sort.' },
  ],
  guided: task('Use two CTEs to return every creature id, total_minutes, and trait_count. Use zero for missing recorded summaries.', `${twoCtes} SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${cteJoin};`, ['Separate the CTE definitions with a comma.', 'Join summaries, not raw event rows.'], { gap: 'WITH', requires: 'WITH', expectedColumns: ['id', 'total_minutes', 'trait_count'] }),
  independent: task('Use separate care and trait CTEs to return creature id, name, total_minutes, and trait_count for creatures with at least 10 recorded care minutes and at least 2 traits.', `${twoCtes} SELECT c.id, c.name, v.total_minutes, t.trait_count ${cteJoin} WHERE v.total_minutes >= 10 AND t.trait_count >= 2;`, ['Compute both totals before applying eligibility rules.', 'No COALESCE is needed for selected totals when both must be positive.'], { requires: 'WITH', expectedColumns: ['id', 'name', 'total_minutes', 'trait_count'] }),
  mastery: task('Use separate CTEs to count care visits and trait observations, then a third roster CTE that joins those summaries to creatures. From roster, return every ready creature id, visit_count, and trait_count, with zero when absent. Order by visit_count descending then creature id ascending.', 'WITH visits AS (SELECT creature_id, COUNT(*) AS visit_count FROM care GROUP BY creature_id), observations AS (SELECT creature_id, COUNT(*) AS trait_count FROM traits GROUP BY creature_id), roster AS (SELECT c.id, c.ready, COALESCE(v.visit_count, 0) AS visit_count, COALESCE(t.trait_count, 0) AS trait_count FROM creatures AS c LEFT JOIN visits AS v ON c.id = v.creature_id LEFT JOIN observations AS t ON c.id = t.creature_id) SELECT id, visit_count, trait_count FROM roster WHERE ready = 1 ORDER BY visit_count DESC, id ASC;', ['The third CTE reads the first two CTEs and retains each creature’s ready flag.', 'Filter and order the named roster in the final SELECT.'], { requires: 'WITH', ordered: true, expectedColumns: ['id', 'visit_count', 'trait_count'] }),
  commissions: [
    craft('care-constellation', 'Care Constellation', 'Map the garden’s most thoroughly recorded creatures.', task('Use two CTEs to return creature id, total_minutes, and trait_count where recorded care totals at least 20 minutes. Keep zero traits when none exist.', `${twoCtes} SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${cteJoin} WHERE v.total_minutes >= 20;`, ['Filter on the completed care total.', 'Preserve a missing trait count as zero recorded traits.'], { requires: 'WITH', expectedColumns: ['id', 'total_minutes', 'trait_count'] })),
    craft('quiet-observer', 'Quiet Observer Tonic', 'Prepare a roster of creatures needing more observation notes.', task('Use two CTEs to return creature id, total_minutes, and trait_count where fewer than 2 traits are recorded, including no traits.', `${twoCtes} SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${cteJoin} WHERE COALESCE(t.trait_count, 0) < 2;`, ['Treat absent recorded observations as a count of zero.', 'Do not drop creatures with no care summary.'], { requires: 'WITH', expectedColumns: ['id', 'total_minutes', 'trait_count'] })),
    craft('roster-prism', 'Roster Prism', 'Order the complete roster by recorded care without losing namesakes.', task('Use two CTEs to return every creature id, name, total_minutes, and trait_count. Order by total_minutes descending then creature id ascending.', `${twoCtes} SELECT c.id, c.name, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${cteJoin} ORDER BY total_minutes DESC, c.id ASC;`, ['Use one summary per event type.', 'Order the final combined rows, including zeros.'], { requires: 'WITH', ordered: true, expectedColumns: ['id', 'name', 'total_minutes', 'trait_count'] })),
  ],
});

export default restorationPipeline;
