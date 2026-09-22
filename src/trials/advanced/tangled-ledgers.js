import { stage, task, commission as craft } from './build-lesson.js';

const careSummary = '(SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id)';
const traitSummary = '(SELECT creature_id, COUNT(*) AS trait_count FROM traits GROUP BY creature_id)';
const aggregateJoin = `FROM creatures AS c
LEFT JOIN ${careSummary} AS v ON c.id = v.creature_id
LEFT JOIN ${traitSummary} AS t ON c.id = t.creature_id`;

export const tangledLedgers = stage({
  id: 'tangled-ledgers', title: 'The ledger that counted twice', place: 'The Sanctuary', scene: 'sanctuary', speaker: 'IONA', topic: 'Join fanout · aggregate-first derived tables',
  brief: 'Combine independent care and trait records without multiplying them.', tables: ['creatures', 'care', 'traits'], relationships: 'creatures.id → care.creature_id and traits.creature_id (two independent one-to-many relations)',
  pages: [
    { title: 'An impossible afternoon', speaker: 'IONA', text: 'A report claims the keeper spent an entire afternoon with one creature. Iona remembers two short visits. Every visit has been copied once for each observed trait.' },
    { title: 'Two books, two totals', speaker: 'QUILL', text: 'Quill lays the care book beside the trait book. Their entries describe different events. “Summarize each book first,” Iona says, “then match the summaries to collars.”' },
  ],
  ending: { title: 'Time returned', speaker: 'IONA', text: 'The corrected report measures visits and observations separately. Nobody invents extra care, and creatures with no records remain visible for follow-up.' },
  paragraphs: [
    'Joining creatures directly to both care and traits creates one row for every combination of child records. Two care visits and three traits produce six joined rows. SUM(care.minutes) then repeats each visit three times.',
    'SUM(DISTINCT minutes) is not a repair: two genuine visits may take the same number of minutes. Preserve the events and aggregate each child table independently.',
    'A derived table is a SELECT inside parentheses in FROM or JOIN, followed by an alias. (SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id) AS v produces at most one row per creature_id. Join that summary rather than the raw visits.',
    'Build a separate trait summary using COUNT(*) AS trait_count. Join both summaries to creatures by ID. Each summary has at most one matching row, so neither multiplies the other.',
    'COALESCE(v.total_minutes, 0) returns the first non-NULL argument. Here zero means zero recorded care minutes, not proof that no care happened in the real world. We use zero for missing recorded totals and counts; we do not change unknown measurements into known ones.',
  ],
  example: `SELECT c.id, c.name, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${aggregateJoin};`, columns: ['id', 'name', 'total_minutes', 'trait_count'],
  intermediates: [{ title: 'The fanout: one row per visit–trait combination', sql: 'SELECT c.id, v.id AS visit_id, v.minutes, t.id AS trait_id FROM creatures AS c JOIN care AS v ON c.id = v.creature_id JOIN traits AS t ON c.id = t.creature_id;', explanation: 'Count how often each visit_id repeats. Summing these minutes would invent extra care.' }, { title: 'Care summarized before the join', sql: 'SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id;', explanation: 'Each creature_id now has at most one summary row. NULL is an unassigned visit group; it cannot match a creature ID.' }],
  annotation: 'Inspect the care and traits source tables. Each is summarized to one row per creature before either summary joins the parent.',
  guided: task('Return every creature id, name, total_minutes, and trait_count. Sum care and count traits separately before joining. Missing recorded totals should be zero.', `SELECT c.id, c.name, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${aggregateJoin};`, ['Each parent must match at most one row in each summary.', 'COALESCE supplies zero for missing recorded totals.'], { gap: 'LEFT JOIN', requires: ['JOIN', 'GROUP'], expectedColumns: ['id', 'name', 'total_minutes', 'trait_count'] }),
  independent: task('Return creature id, name, total_minutes, and trait_count only for creatures with at least 2 recorded traits. Avoid multiplying care visits.', `SELECT c.id, c.name, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${aggregateJoin} WHERE t.trait_count >= 2;`, ['Filter the already summarized trait count.', 'Keep the care summary independent.'], { requires: ['JOIN', 'GROUP'], expectedColumns: ['id', 'name', 'total_minutes', 'trait_count'] }),
  mastery: task('Return every creature id, care_visits, and trait_count. Count visits and traits independently; report zero for missing records.', 'SELECT c.id, COALESCE(v.care_visits, 0) AS care_visits, COALESCE(t.trait_count, 0) AS trait_count FROM creatures AS c LEFT JOIN (SELECT creature_id, COUNT(*) AS care_visits FROM care GROUP BY creature_id) AS v ON c.id = v.creature_id LEFT JOIN (SELECT creature_id, COUNT(*) AS trait_count FROM traits GROUP BY creature_id) AS t ON c.id = t.creature_id;', ['Summarize each child table to one row per creature.', 'Counting visits is different from summing their minutes.'], { requires: ['JOIN', 'GROUP'], expectedColumns: ['id', 'care_visits', 'trait_count'] }),
  commissions: [
    craft('honest-clock', 'Honest Clock Spell', 'Restore accurate minute totals to the keeper’s clock.', task('Return creature id, total_minutes, and trait_count for ready creatures, with zero for absent summaries. Avoid fanout.', `SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${aggregateJoin} WHERE c.ready = 1;`, ['Read readiness from creatures.', 'Aggregate each independent child table before joining.'], { requires: ['JOIN', 'GROUP'], expectedColumns: ['id', 'total_minutes', 'trait_count'] })),
    craft('long-visit', 'Long Visit Tonic', 'Label creatures whose recorded visits total at least twenty minutes.', task('Return creature id, total_minutes, and trait_count for creatures with total recorded care of at least 20 minutes. Show zero traits when absent.', `SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${aggregateJoin} WHERE v.total_minutes >= 20;`, ['Test the care summary rather than individual visits.', 'A missing trait summary must not hide a creature.'], { requires: ['JOIN', 'GROUP'], expectedColumns: ['id', 'total_minutes', 'trait_count'] })),
    craft('observation-seal', 'Observation Seal', 'Track creatures with observations but no positive recorded care total.', task('Return creature id, total_minutes, and trait_count where trait_count is at least 1 and total recorded care is zero, counting missing care as zero.', `SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes, COALESCE(t.trait_count, 0) AS trait_count ${aggregateJoin} WHERE t.trait_count >= 1 AND COALESCE(v.total_minutes, 0) = 0;`, ['Zero recorded minutes includes no visit and a zero-minute visit.', 'Do not mistake this for a missing-record-only search.'], { requires: ['JOIN', 'GROUP'], expectedColumns: ['id', 'total_minutes', 'trait_count'] })),
  ],
});

export default tangledLedgers;
