import { stage, task, commission as craft } from './build-lesson.js';



const exists = 'SELECT 1 FROM care AS v WHERE v.creature_id = c.id';





export const missingCare = stage({
  id: 'missing-care', title: 'The unvisited collar', place: 'The Sanctuary', scene: 'sanctuary', speaker: 'BRAMBLE', topic: 'Correlated EXISTS · NOT EXISTS · NULL traps',
  brief: 'Find missing care records even when an unassigned visit has a NULL creature ID.', tables: ['creatures', 'care', 'traits'], relationships: 'care.creature_id and traits.creature_id refer to creatures.id; care may contain an unassigned NULL key',
  pages: [
    { title: 'The smudged collar number', speaker: 'BRAMBLE', text: 'One visit entry has a smudged collar number. It belongs in the archive, but nobody knows which creature it describes. A missing-care query suddenly returns no creatures at all.' },
    { title: 'Ask about this creature', speaker: 'IONA', text: 'Iona asks a smaller question for each collar: “Does a visit exist with this exact creature ID?” An unrelated, unknown collar number cannot answer yes.' },
  ],
  ending: { title: 'A fair follow-up list', speaker: 'BRAMBLE', text: 'The unassigned visit stays in the book for investigation. The follow-up list correctly finds creatures without matched visits, without declaring that they were neglected.' },
  paragraphs: [
    'EXISTS checks whether a subquery returns at least one row. SELECT 1 is conventional because only row existence matters, not the value selected. Repeated matching visits still produce one outer creature row.',
    'A correlated subquery refers to the current outer row: WHERE v.creature_id = c.id. This asks whether a visit exists for this particular creature. Without that condition, EXISTS would merely ask whether any visit exists anywhere.',
    'NOT EXISTS reverses the existence test: keep creatures with no matching visit. A recorded zero-minute visit still exists; it must not count as a missing record.',
    'Avoid id NOT IN (SELECT creature_id FROM care) here. The NULL creature_id means “unknown”; when no definite match exists, NOT IN can still evaluate to unknown and exclude the row. NOT EXISTS with an equality correlation handles the missing-match question directly.',
    'Dates here use YYYY-MM-DD text, so lexical comparisons follow calendar order. A visit on or after 2026-09-03 satisfies checked_on >= \'2026-09-03\'. Put that date condition inside the existence test when asking whether a recent visit exists.',
  ],
  example: `SELECT c.id, c.name FROM creatures AS c WHERE NOT EXISTS (${exists});`, columns: ['id', 'name'],
  guided: task('Return creature id, name, and element for creatures with no matched care visit, using NOT EXISTS.', `SELECT c.id, c.name, c.element FROM creatures AS c WHERE NOT EXISTS (${exists});`, ['Correlate the visit to c.id.', 'An unassigned NULL-key visit is not a match.'], { gap: 'NOT EXISTS', requires: ['NOT', 'EXISTS'] }),
  independent: task('Return creature id and name for creatures with a recorded visit on or after 2026-09-03. Use EXISTS and return each creature once.', `SELECT c.id, c.name FROM creatures AS c WHERE EXISTS (${exists} AND v.checked_on >= '2026-09-03');`, ['The date condition belongs inside the subquery.', 'Several recent visits should not duplicate the creature.'], { requires: 'EXISTS' }),
  mastery: task('Return creature id, name, and ready for creatures with at least one trait observation but no recorded care visit. Use EXISTS and NOT EXISTS.', `SELECT c.id, c.name, c.ready FROM creatures AS c WHERE EXISTS (SELECT 1 FROM traits AS t WHERE t.creature_id = c.id) AND NOT EXISTS (${exists});`, ['Ask two separate existence questions about the same outer creature.', 'A zero-minute visit is still a visit.'], { requires: ['EXISTS', 'NOT'] }),
  commissions: [
    craft('rest-reminder', 'Rest Reminder', 'Check on resting creatures whose files contain no visit.', task('Use NOT EXISTS to return creature id and name for creatures with ready = 0 and no recorded care visit.', `SELECT c.id, c.name FROM creatures AS c WHERE c.ready = 0 AND NOT EXISTS (${exists});`, ['Filter the outer readiness flag.', 'The absence test still needs an ID correlation.'], { requires: ['NOT', 'EXISTS'] })),
    craft('recent-rest', 'Recent Rest Draught', 'Prepare reminders for creatures without a recent visit.', task('Return creature id, name, and energy for creatures without a care visit on or after 2026-09-03. Use NOT EXISTS.', `SELECT c.id, c.name, c.energy FROM creatures AS c WHERE NOT EXISTS (${exists} AND v.checked_on >= '2026-09-03');`, ['An old visit does not satisfy the recent-visit question.', 'Filter the date inside the correlated subquery.'], { requires: ['NOT', 'EXISTS'] })),
    craft('observed-care', 'Observed Care Seal', 'Link two kinds of evidence without multiplying them.', task('Use EXISTS to return creature id and name for creatures with both a care visit and a trait observation.', `SELECT c.id, c.name FROM creatures AS c WHERE EXISTS (${exists}) AND EXISTS (SELECT 1 FROM traits AS t WHERE t.creature_id = c.id);`, ['Use independent correlated existence tests.', 'Neither event table needs to join into the outer rows.'], { requires: 'EXISTS' })),
  ],
});

export default missingCare;
