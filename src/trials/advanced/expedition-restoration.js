import { stage, task, commission as craft } from './build-lesson.js';







const fieldCtes = 'WITH supply AS (SELECT expedition_id, SUM(units) AS total_units FROM deliveries GROUP BY expedition_id), field AS (SELECT expedition_id, MAX(risk) AS peak_risk FROM surveys GROUP BY expedition_id)';
const fieldJoin = 'FROM expeditions AS e LEFT JOIN supply AS d ON e.id = d.expedition_id LEFT JOIN field AS s ON e.id = s.expedition_id';

export const expeditionRestoration = stage({
  id: 'expedition-restoration', title: 'The restoration council', place: 'The Restoration Camp', scene: 'restoration', speaker: 'IONA', topic: 'Final assessment · independent multi-CTE report',
  brief: 'Combine two event streams accurately and explain what absent evidence means.', tables: ['expeditions', 'deliveries', 'surveys'], relationships: 'Aggregate deliveries and surveys independently to expedition_id before joining their summaries to expeditions',
  pages: [
    { title: 'Every apprentice’s work', speaker: 'IONA', text: 'The council lays out its final request: supplies beside field risk, one row per expedition. Both books contain several entries for some projects. Missing surveys must remain unknown.' },
    { title: 'A report worth acting on', speaker: 'QUILL', text: 'Quill closes the example book. You have learned to preserve identities, distinguish missing records, and avoid multiplying evidence. Now build a report the council can trace and trust.' },
    { title: 'The last spell is a question', speaker: 'IONA', text: 'Before submitting, ask what each row represents, which events each total includes, and what each NULL means. The restoration begins with an answer you can explain.' },
  ],
  ending: { title: 'The roads reopen', speaker: 'IONA', text: 'The council receives an accurate report, with recorded supplies counted once and unknown risks left visible. Teams set out with clearer questions. Beside you, your little sister lifts her lantern toward the restored beacon. You raise your wand to meet its light. Your workshop stays open: mastery grows through another honest query.' },
  paragraphs: [
    'This is the final transfer assessment. deliveries and surveys are independent one-to-many tables. Joining their raw rows would multiply deliveries by surveys. Summarize each to one row per expedition_id before joining.',
    'A delivery total can use zero to mean zero recorded units. An absent survey does not prove zero danger: keep peak_risk NULL when no survey exists. Choose missing-value handling based on what the number means.',
    'Use one WITH with multiple comma-separated CTEs. Review each intermediate result before the final join. The guided report is a warm-up; the independent and mastery reports request different calculations and conditions from a blank editor.',
  ],
  example: `${fieldCtes} SELECT e.id, e.name, COALESCE(d.total_units, 0) AS total_units, s.peak_risk ${fieldJoin};`, columns: ['id', 'name', 'total_units', 'peak_risk'],
  intermediates: [
    { title: 'Supply summary', sql: 'SELECT expedition_id, SUM(units) AS total_units FROM deliveries GROUP BY expedition_id;', explanation: 'Each expedition’s delivery units are counted once, independent of its survey count.' },
    { title: 'Field summary', sql: 'SELECT expedition_id, MAX(risk) AS peak_risk FROM surveys GROUP BY expedition_id;', explanation: 'Only surveyed projects have a risk summary. Missing survey evidence must stay unknown.' },
  ],
  guided: task('Use separate supply and field CTEs to return every expedition id, total_units, and peak_risk. Use zero for missing recorded supply totals and NULL for missing risk.', `${fieldCtes} SELECT e.id, COALESCE(d.total_units, 0) AS total_units, s.peak_risk ${fieldJoin};`, ['Aggregate each child table independently.', 'Only the recorded supply total should receive a zero fallback.'], { gap: 'WITH', requires: 'WITH', expectedColumns: ['id', 'total_units', 'peak_risk'] }),
  independent: task('Use separate CTEs to return expedition id, name, total_units, and peak_risk for projects with fewer than 10 recorded supply units and peak survey risk at least 8. Missing supplies count as zero; unknown risk does not qualify. Order by peak_risk descending then expedition id ascending.', `${fieldCtes} SELECT e.id, e.name, COALESCE(d.total_units, 0) AS total_units, s.peak_risk ${fieldJoin} WHERE COALESCE(d.total_units, 0) < 10 AND s.peak_risk >= 8 ORDER BY s.peak_risk DESC, e.id ASC;`, ['Calculate independent project summaries before filtering.', 'Unknown risk cannot satisfy a numeric danger threshold.'], { requires: ['WITH', 'ORDER'], ordered: true, expectedColumns: ['id', 'name', 'total_units', 'peak_risk'] }),
  mastery: task('Use separate CTEs to return every expedition id, name, delivery_count, survey_count, and average_risk. Counts are zero when records are absent; average_risk remains NULL without surveys. Order by expedition id ascending. Do not multiply events or merge namesake projects.', 'WITH delivery_counts AS (SELECT expedition_id, COUNT(*) AS delivery_count FROM deliveries GROUP BY expedition_id), survey_summary AS (SELECT expedition_id, COUNT(*) AS survey_count, AVG(risk) AS average_risk FROM surveys GROUP BY expedition_id) SELECT e.id, e.name, COALESCE(d.delivery_count, 0) AS delivery_count, COALESCE(s.survey_count, 0) AS survey_count, s.average_risk FROM expeditions AS e LEFT JOIN delivery_counts AS d ON e.id = d.expedition_id LEFT JOIN survey_summary AS s ON e.id = s.expedition_id ORDER BY e.id ASC;', ['Each intermediate row should represent one expedition.', 'Counts describe recorded events; an average requires actual survey evidence.'], { requires: ['WITH', 'ORDER'], ordered: true, expectedColumns: ['id', 'name', 'delivery_count', 'survey_count', 'average_risk'] }),
  commissions: [
    craft('restoration-beacon', 'Restoration Beacon', 'Illuminate the complete council report in urgency order.', task('Use two CTEs to return every expedition id, name, total_units, and peak_risk. Zero means no recorded supply units; missing risk stays NULL. Order by expedition priority descending then id ascending.', `${fieldCtes} SELECT e.id, e.name, COALESCE(d.total_units, 0) AS total_units, s.peak_risk ${fieldJoin} ORDER BY e.priority DESC, e.id ASC;`, ['Priority comes from the expedition parent.', 'Preserve both independent summaries and every project.'], { requires: ['WITH', 'ORDER'], ordered: true, expectedColumns: ['id', 'name', 'total_units', 'peak_risk'] })),
    craft('survey-request', 'Survey Request Tonic', 'Prepare survey requests for supplied projects whose danger is still unknown.', task('Use two CTEs to return expedition id, name, total_units, and peak_risk where a delivery record exists but no survey record exists. A zero-unit delivery counts as a record; keep peak_risk NULL.', `${fieldCtes} SELECT e.id, e.name, d.total_units, s.peak_risk ${fieldJoin} WHERE d.expedition_id IS NOT NULL AND s.expedition_id IS NULL;`, ['Check summary keys for existence, not the numeric total.', 'A recorded zero still creates a supply summary.'], { requires: 'WITH', expectedColumns: ['id', 'name', 'total_units', 'peak_risk'] })),
    craft('supplied-watch', 'Supplied Watch Seal', 'Identify supplied projects with a field survey already on file.', task('Use two CTEs to return expedition id, total_units, and peak_risk for projects with at least 9 recorded supply units and at least one survey.', `${fieldCtes} SELECT e.id, d.total_units, s.peak_risk ${fieldJoin} WHERE d.total_units >= 9 AND s.expedition_id IS NOT NULL;`, ['The supply threshold uses a grouped total.', 'A matched survey summary proves recorded evidence exists.'], { requires: 'WITH', expectedColumns: ['id', 'total_units', 'peak_risk'] })),
  ],
});

export default expeditionRestoration;
