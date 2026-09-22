import { stage, task, commission as craft } from './build-lesson.js';





const matchedDelivery = 'FROM expeditions AS e JOIN deliveries AS d ON e.id = d.expedition_id';



export const expeditionPriorities = stage({
  id: 'expedition-priorities', title: 'The council’s shortlist', place: 'The Restoration Camp', scene: 'restoration', speaker: 'QUILL', topic: 'Transfer assessment · WHERE, GROUP BY, HAVING',
  brief: 'Filter records before grouping, then filter the resulting project totals.', tables: ['expeditions', 'deliveries', 'surveys'], relationships: 'Group child records by expedition identity, never by shared project name alone',
  pages: [
    { title: 'Which supplies count?', speaker: 'QUILL', text: 'The council wants recent supplies, not every wagon that ever crossed the road. First decide which delivery rows belong in the calculation; then decide which project totals qualify.' },
    { title: 'Two projects, one name', speaker: 'IONA', text: 'A pair of restoration projects share their founder’s chosen name. Combining them would create a false success. Their expedition IDs must stay separate all the way through the grouping.' },
  ],
  ending: { title: 'A defensible shortlist', speaker: 'QUILL', text: 'The council can see which source rows counted and why each total qualified. The shortlist preserves project identity and uses the requested boundaries.' },
  paragraphs: [
    'WHERE filters individual delivery or survey records before aggregation. GROUP BY defines one output group per expedition. HAVING filters groups after SUM, COUNT, or AVG has been calculated.',
    'Group by e.id, e.name when the result shows project identity and display name. Grouping only by name would merge separate projects. Joining a single event table is safe for that event’s total; adding another raw event table would recreate fanout.',
    'ISO dates compare in calendar order. WHERE d.delivered_on >= \'2026-09-02\' includes September 2 and later. HAVING SUM(d.units) >= 8 then tests the qualifying deliveries’ total, not the lifetime total.',
  ],
  example: `SELECT e.id, e.name, SUM(d.units) AS total_units ${matchedDelivery} GROUP BY e.id, e.name;`, columns: ['id', 'name', 'total_units'],
  guided: task('Return expedition id, name, and total_units for projects whose lifetime delivered units total at least 10.', `SELECT e.id, e.name, SUM(d.units) AS total_units ${matchedDelivery} GROUP BY e.id, e.name HAVING SUM(d.units) >= 10;`, ['SUM is calculated separately for each expedition.', 'The threshold belongs after grouping.'], { gap: 'HAVING', requires: ['GROUP', 'HAVING'], expectedColumns: ['id', 'name', 'total_units'] }),
  independent: task('Return expedition id, name, and recent_units using only deliveries on or after 2026-09-02. Keep projects whose recent total is at least 8. Order by recent_units descending then expedition id ascending.', `SELECT e.id, e.name, SUM(d.units) AS recent_units ${matchedDelivery} WHERE d.delivered_on >= '2026-09-02' GROUP BY e.id, e.name HAVING SUM(d.units) >= 8 ORDER BY recent_units DESC, e.id ASC;`, ['Filter dates before calculating project totals.', 'Filter the totals after grouping by identity.'], { requires: ['WHERE', 'GROUP', 'HAVING', 'ORDER'], ordered: true, expectedColumns: ['id', 'name', 'recent_units'] }),
  mastery: task('Return expedition id, name, and average_risk for projects with at least 2 survey records and an average risk of at least 5. Keep project identities separate.', 'SELECT e.id, e.name, AVG(s.risk) AS average_risk FROM expeditions AS e JOIN surveys AS s ON e.id = s.expedition_id GROUP BY e.id, e.name HAVING COUNT(s.id) >= 2 AND AVG(s.risk) >= 5;', ['Both conditions describe completed groups.', 'Count survey records and average their risk within each project.'], { requires: ['GROUP', 'HAVING'], expectedColumns: ['id', 'name', 'average_risk'] }),
  commissions: [
    craft('repeat-wagon', 'Repeat Wagon Spell', 'Celebrate projects served by more than one delivery.', task('Return expedition id, name, and delivery_count for projects with at least 2 deliveries.', `SELECT e.id, e.name, COUNT(d.id) AS delivery_count ${matchedDelivery} GROUP BY e.id, e.name HAVING COUNT(d.id) >= 2;`, ['Count delivery identities within project groups.', 'The count threshold is a HAVING condition.'], { requires: ['GROUP', 'HAVING'], expectedColumns: ['id', 'name', 'delivery_count'] })),
    craft('positive-supplies', 'Positive Supplies Tonic', 'Count only wagons carrying usable units.', task('Return expedition id, name, and positive_units using only deliveries with units greater than zero. Keep project totals of at least 9.', `SELECT e.id, e.name, SUM(d.units) AS positive_units ${matchedDelivery} WHERE d.units > 0 GROUP BY e.id, e.name HAVING SUM(d.units) >= 9;`, ['The delivery filter and group filter happen at different stages.', 'Retain separate expedition IDs.'], { requires: ['WHERE', 'GROUP', 'HAVING'], expectedColumns: ['id', 'name', 'positive_units'] })),
    craft('danger-marker', 'Danger Marker', 'Mark projects with at least one survey reporting serious risk.', task('Return expedition id, name, and peak_risk for projects whose maximum survey risk is at least 8.', 'SELECT e.id, e.name, MAX(s.risk) AS peak_risk FROM expeditions AS e JOIN surveys AS s ON e.id = s.expedition_id GROUP BY e.id, e.name HAVING MAX(s.risk) >= 8;', ['MAX selects the highest recorded risk per project.', 'Use HAVING to select qualifying groups.'], { requires: ['GROUP', 'HAVING'], expectedColumns: ['id', 'name', 'peak_risk'] })),
  ],
});

export default expeditionPriorities;
