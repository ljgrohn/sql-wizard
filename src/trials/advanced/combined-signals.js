import { stage, task, commission as craft } from './build-lesson.js';








export const combinedSignals = stage({
  id: 'combined-signals', title: 'Two bells in the fog', place: 'The Observatory', scene: 'observatory', speaker: 'QUILL', topic: 'UNION · UNION ALL',
  brief: 'Combine result sets while deliberately keeping or removing repeated rows.', tables: ['creatures', 'care', 'traits'], relationships: 'Care and traits both identify creatures; combining sets stacks rows rather than matching columns',
  pages: [
    { title: 'The bells disagree', speaker: 'QUILL', text: 'One bell rings for a care visit and another for a trait observation. The keeper sometimes needs every ringing, and sometimes only the list of collars that rang at least once.' },
    { title: 'What counts as the same?', speaker: 'IONA', text: 'A roster can remove repeated IDs. An event log cannot erase two real visits just because they name the same creature. Decide what one output row means before combining the bells.' },
  ],
  ending: { title: 'A signal with a meaning', speaker: 'QUILL', text: 'The roster and the event stream now answer different, explicit questions. The final expedition ledger arrives; no familiar creature names appear on its pages.' },
  paragraphs: [
    'UNION stacks the rows of two SELECT results and removes duplicate complete rows. UNION ALL stacks them without removing duplicates. Neither operation joins matching columns side by side.',
    'Both SELECTs must return the same number of columns in the same meaning and order. The output column names come from the first SELECT. Combining creature_id with creature_id makes sense; stacking IDs over minutes would not.',
    'For a unique set of observed creature IDs, use UNION. For every recorded visit and trait observation, use UNION ALL. Repeated IDs in an event stream are meaningful: several events can belong to one creature.',
    'Add a literal label such as \'care\' AS source when event provenance matters. UNION compares the whole row, so the same ID with different source labels is not a duplicate. Filter NULL creature IDs when the question requests known creatures.',
    'An ORDER BY at the end orders the entire combined result. Do not rely on the first SELECT appearing first in the output.',
  ],
  example: 'SELECT creature_id FROM care WHERE creature_id IS NOT NULL UNION SELECT creature_id FROM traits;', columns: ['creature_id'],
  guided: task('Return the unique known creature IDs appearing in care or traits, ordered by creature_id ascending. Use UNION.', 'SELECT creature_id FROM care WHERE creature_id IS NOT NULL UNION SELECT creature_id FROM traits ORDER BY creature_id ASC;', ['UNION removes repeated IDs across both sources.', 'The final ORDER BY applies to the combined set.'], { gap: 'UNION', requires: 'UNION', ordered: true }),
  independent: task('Return creature_id and source for every care visit with a known creature ID and every trait observation. Label sources care and trait. Preserve repeated events using UNION ALL.', "SELECT creature_id, 'care' AS source FROM care WHERE creature_id IS NOT NULL UNION ALL SELECT creature_id, 'trait' AS source FROM traits;", ['Use a literal label in each SELECT.', 'Every event requires retaining duplicate rows.'], { requires: ['UNION', 'ALL'], expectedColumns: ['creature_id', 'source'] }),
  mastery: task('Use UNION to return a unique id column for creatures that are ready OR have a glowing trait observation. Keep distinct IDs even when names match.', "SELECT id FROM creatures WHERE ready = 1 UNION SELECT creature_id AS id FROM traits WHERE trait = 'glowing';", ['Each SELECT must supply the same kind of identity.', 'UNION removes overlaps between the two eligibility groups.'], { requires: 'UNION', expectedColumns: ['id'] }),
  commissions: [
    craft('double-bell', 'Double Bell Spell', 'Keep every recorded signal from both books.', task('Use UNION ALL to return creature_id for every known-ID care visit and every trait observation. Preserve repetitions.', 'SELECT creature_id FROM care WHERE creature_id IS NOT NULL UNION ALL SELECT creature_id FROM traits;', ['Do not collapse multiple events for one creature.', 'Exclude the unassigned care entry.'], { requires: ['UNION', 'ALL'] })),
    craft('glow-chorus', 'Glow Chorus Tonic', 'Make one invitation per creature that glows or sings.', task('Use UNION to return unique creature_id values for glowing or singing trait observations.', "SELECT creature_id FROM traits WHERE trait = 'glowing' UNION SELECT creature_id FROM traits WHERE trait = 'singing';", ['Both sets come from traits with different filters.', 'Remove duplicate IDs across the two selections.'], { requires: 'UNION' })),
    craft('source-seal', 'Source Seal', 'Keep one source label per creature per book.', task('Use UNION to return unique creature_id and source pairs from known-ID care records and traits. Label sources care and trait; order by creature_id then source ascending.', "SELECT creature_id, 'care' AS source FROM care WHERE creature_id IS NOT NULL UNION SELECT creature_id, 'trait' AS source FROM traits ORDER BY creature_id ASC, source ASC;", ['UNION compares the entire pair, not just the ID.', 'Order after the second SELECT.'], { requires: 'UNION', ordered: true, expectedColumns: ['creature_id', 'source'] })),
  ],
});

export default combinedSignals;
