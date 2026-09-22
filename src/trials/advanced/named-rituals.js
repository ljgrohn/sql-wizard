import { stage, task, commission as craft } from './build-lesson.js';





const careCte = 'WITH care_totals AS (SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id)';



export const namedRituals = stage({
  id: 'named-rituals', title: 'Give the ritual a name', place: 'The Observatory', scene: 'observatory', speaker: 'QUILL', topic: 'WITH · a single common table expression',
  brief: 'Name an intermediate result so another query can read it.', tables: ['creatures', 'care'], relationships: 'care_totals has at most one row per creature_id after grouping care',
  pages: [
    { title: 'The margin runs out', speaker: 'QUILL', text: 'Quill’s nested notes have reached the edge of the page. The calculation is sound, but its purpose is buried. A named intermediate result will let the next reader follow the thought.' },
    { title: 'A name, not a new ledger', speaker: 'IONA', text: '“Call this part care_totals,” Iona suggests. “It lasts for the statement, like a note pinned beside your work. We have not created or changed a permanent table.”' },
  ],
  ending: { title: 'A readable ritual', speaker: 'QUILL', text: 'The query now reads in two steps: calculate the care totals, then use them. Another apprentice can explain every number before lighting the lens.' },
  paragraphs: [
    'A common table expression, or CTE, gives a query result a name for one statement. Write WITH care_totals AS (SELECT ...), then the main SELECT. The parentheses hold an ordinary SELECT, and the main query reads care_totals like a table.',
    'A CTE is not a permanent table and does not update data. Its name is available only within this statement. Use names that explain the result, such as care_totals, rather than mysterious abbreviations.',
    'The CTE can group visits into one row per creature. The final SELECT then joins that summary to creatures. This is the same aggregate-first rule as the derived-table lesson, expressed with a named step.',
    'COALESCE(total_minutes, 0) labels zero recorded minutes when no summary matches. Filtering total_minutes >= 20 in the outer query tests the already-computed totals; the grouping happened inside the CTE.',
  ],
  example: `${careCte} SELECT c.id, c.name, COALESCE(v.total_minutes, 0) AS total_minutes FROM creatures AS c LEFT JOIN care_totals AS v ON c.id = v.creature_id;`, columns: ['id', 'name', 'total_minutes'],
  intermediates: [{ title: 'The named result: care_totals', sql: 'SELECT creature_id, SUM(minutes) AS total_minutes FROM care GROUP BY creature_id;', explanation: 'The CTE names exactly this grouped result. The final query joins it to creature identities.' }],
  guided: task('Use a CTE to return creature id and total_minutes for every creature, showing zero recorded minutes when no care summary matches.', `${careCte} SELECT c.id, COALESCE(v.total_minutes, 0) AS total_minutes FROM creatures AS c LEFT JOIN care_totals AS v ON c.id = v.creature_id;`, ['WITH introduces the named query.', 'The final SELECT reads the CTE by its name.'], { gap: 'WITH', requires: 'WITH', expectedColumns: ['id', 'total_minutes'] }),
  independent: task('Use a care_totals CTE to return creature id, name, and total_minutes only where total recorded care is at least 20 minutes.', `${careCte} SELECT c.id, c.name, v.total_minutes FROM creatures AS c JOIN care_totals AS v ON c.id = v.creature_id WHERE v.total_minutes >= 20;`, ['Group inside the CTE.', 'Filter the completed total in the main SELECT.'], { requires: 'WITH', expectedColumns: ['id', 'name', 'total_minutes'] }),
  mastery: task('Use one CTE to count recorded visits by creature. Return every creature id, name, and visit_count, including zero visits.', 'WITH visit_counts AS (SELECT creature_id, COUNT(*) AS visit_count FROM care GROUP BY creature_id) SELECT c.id, c.name, COALESCE(v.visit_count, 0) AS visit_count FROM creatures AS c LEFT JOIN visit_counts AS v ON c.id = v.creature_id;', ['The CTE should count visits, not minutes.', 'Preserve every creature in the final join.'], { requires: 'WITH', expectedColumns: ['id', 'name', 'visit_count'] }),
  commissions: [
    craft('minute-lantern', 'Minute Lantern', 'Light the route for creatures with recorded care minutes.', task('Use a CTE to return creature id and total_minutes where total recorded care is greater than zero.', `${careCte} SELECT c.id, v.total_minutes FROM creatures AS c JOIN care_totals AS v ON c.id = v.creature_id WHERE v.total_minutes > 0;`, ['Summarize first and filter second.', 'Positive totals exclude zero-minute visits.'], { requires: 'WITH', expectedColumns: ['id', 'total_minutes'] })),
    craft('visit-average', 'Visit Average Tonic', 'Measure the average length of each creature’s recorded visits.', task('Use a CTE to return creature id, name, and average_minutes for creatures with care visits. Include a zero average; exclude creatures with no visit.', 'WITH care_averages AS (SELECT creature_id, AVG(minutes) AS average_minutes FROM care GROUP BY creature_id) SELECT c.id, c.name, v.average_minutes FROM creatures AS c JOIN care_averages AS v ON c.id = v.creature_id;', ['AVG belongs inside the grouped CTE.', 'A normal JOIN keeps matched summaries.'], { requires: 'WITH', expectedColumns: ['id', 'name', 'average_minutes'] })),
    craft('repeat-visit', 'Repeat Visit Charm', 'Mark creatures visited more than once.', task('Use a CTE to return creature id, name, and visit_count for creatures with at least 2 recorded visits.', 'WITH visit_counts AS (SELECT creature_id, COUNT(*) AS visit_count FROM care GROUP BY creature_id) SELECT c.id, c.name, v.visit_count FROM creatures AS c JOIN visit_counts AS v ON c.id = v.creature_id WHERE v.visit_count >= 2;', ['The CTE counts visits by creature ID.', 'Use the named count in the outer filter.'], { requires: 'WITH', expectedColumns: ['id', 'name', 'visit_count'] })),
  ],
});

export default namedRituals;
