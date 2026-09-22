import { stage, task, commission as craft } from './build-lesson.js';








export const aboveAverage = stage({
  id: 'above-average', title: 'A question inside a question', place: 'The Observatory', scene: 'observatory', speaker: 'QUILL', topic: 'Scalar subqueries · IN',
  brief: 'Compare creatures with a computed benchmark and a set of observations.', tables: ['creatures', 'traits'], relationships: 'creatures.id → traits.creature_id',
  pages: [
    { title: 'A moving constellation', speaker: 'QUILL', text: 'The observatory lens dims whenever its roster changes. A fixed energy threshold cannot track the garden forever. Quill asks for a benchmark calculated from the current creatures.' },
    { title: 'A note inside a note', speaker: 'SABLE', text: 'Some creatures glow, some sing, and some have several observations. Sable needs a roster of creatures, not a roster repeated once per trait.' },
  ],
  ending: { title: 'The lens finds its reference', speaker: 'QUILL', text: 'The lens recalculates its benchmark from the current roster. The observation shortlist names each creature once, no matter how many matching notes lie in its file.' },
  paragraphs: [
    'A subquery is a SELECT nested inside another query. A scalar subquery supplies one value: (SELECT AVG(energy) FROM creatures). Without GROUP BY, this aggregate returns one overall average.',
    'Use the scalar value in a comparison: WHERE energy > (SELECT AVG(energy) FROM creatures). The inner query reads all creatures, not just those surviving the outer filter. A benchmark should describe exactly the population requested.',
    'IN checks membership in a one-column result set. WHERE id IN (SELECT creature_id FROM traits WHERE trait = \'glowing\') selects creatures with a glowing observation. Repeated matching trait records do not duplicate the outer creature row.',
    'A scalar subquery must represent one value. A membership subquery may return many rows but only one column. Select creature_id for membership in creature IDs; selecting the trait label would compare unrelated values.',
  ],
  example: 'SELECT id, name, energy FROM creatures WHERE energy > (SELECT AVG(energy) FROM creatures);', columns: ['id', 'name', 'energy'],
  guided: task('Return id and name for creatures whose energy is above the average energy of ALL creatures.', 'SELECT id, name FROM creatures WHERE energy > (SELECT AVG(energy) FROM creatures);', ['Calculate one overall average in the inner query.', 'Compare each outer row with that number.'], { gap: 'WHERE', requires: 'SELECT' }),
  independent: task('Use IN to return id, name, and element for creatures with at least one glowing trait observation. Return each creature once.', "SELECT id, name, element FROM creatures WHERE id IN (SELECT creature_id FROM traits WHERE trait = 'glowing');", ['The inner query should return creature IDs.', 'IN is a membership test, so repeated observations do not multiply rows.'], { requires: 'IN' }),
  mastery: task('Return id, name, and energy for ready creatures whose energy is greater than the average energy of ready creatures. Compute that ready-only average in a subquery.', 'SELECT id, name, energy FROM creatures WHERE ready = 1 AND energy > (SELECT AVG(energy) FROM creatures WHERE ready = 1);', ['Filter readiness in both the candidate population and its benchmark.', 'The requested benchmark is not the average of all creatures.'], { requires: 'SELECT' }),
  commissions: [
    craft('peak-signal', 'Peak Signal', 'Cast a beacon for the most energetic creatures, including ties.', task('Return id and name for every creature tied for maximum energy. Use a scalar subquery.', 'SELECT id, name FROM creatures WHERE energy = (SELECT MAX(energy) FROM creatures);', ['MAX computes one value.', 'Equality preserves all creatures tied at that value.'])),
    craft('chorus-tonic', 'Chorus Tonic', 'Make a rehearsal roster from singing observations.', task('Use IN to return id, name, and energy for creatures with a singing trait.', "SELECT id, name, energy FROM creatures WHERE id IN (SELECT creature_id FROM traits WHERE trait = 'singing');", ['Read creature_id from traits.', 'Keep the outer query at one row per creature.'], { requires: 'IN' })),
    craft('gentle-star', 'Gentle Star Charm', 'Mark creatures at or below the garden’s average for a quiet evening.', task('Return id, name, and energy for creatures with energy at most the average of all creatures, using a scalar subquery.', 'SELECT id, name, energy FROM creatures WHERE energy <= (SELECT AVG(energy) FROM creatures);', ['At most includes equality.', 'Compute the overall average without grouping.'])),
  ],
});

export default aboveAverage;
