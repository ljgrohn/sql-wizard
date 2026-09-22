import { stage, task, commission as craft } from './build-lesson.js';



const deliveryJoin = 'FROM expeditions AS e LEFT JOIN deliveries AS d ON e.id = d.expedition_id';





export const expeditionGaps = stage({
  id: 'expedition-gaps', title: 'The wagon that never arrived', place: 'The Restoration Camp', scene: 'restoration', speaker: 'IONA', topic: 'Transfer assessment · relationships and missing records',
  brief: 'Separate missing deliveries from real deliveries containing zero units.', tables: ['expeditions', 'deliveries', 'surveys'], relationships: 'expeditions.id → deliveries.expedition_id and surveys.expedition_id; each child table can have several rows per project',
  pages: [
    { title: 'An empty wagon and no wagon', speaker: 'IONA', text: 'One project received a wagon with zero usable units. Another has no delivery entry at all. The quartermaster needs different follow-ups for these two situations.' },
    { title: 'The project stays on the page', speaker: 'QUILL', text: 'If you start from deliveries, a project without a wagon disappears before you can ask about it. Start from the expedition roster and preserve its missing relationships.' },
  ],
  ending: { title: 'The right follow-up', speaker: 'IONA', text: 'The quartermaster can distinguish absent records from recorded zeros. Missing supplies remain a question to investigate, not a number invented by the report.' },
  paragraphs: [
    'deliveries contains id, expedition_id, units, and delivered_on. expedition_id matches expeditions.id. There may be many deliveries for one expedition, so an ordinary join can return that expedition several times.',
    'Keep all projects by starting from expeditions and using LEFT JOIN. A NULL d.id after that join proves no delivery row matched. A matched delivery with units = 0 is a real record and has a non-NULL ID.',
    'The surveys table independently records field risk. Missing surveys and missing deliveries are different questions. Read the relationship requested in each assessment and test that child table’s key.',
  ],
  example: `SELECT e.id, e.name, d.id AS delivery_id, d.units ${deliveryJoin};`, columns: ['id', 'name', 'delivery_id', 'units'],
  guided: task('Return expedition id, name, and delivery units for every expedition, keeping missing deliveries as NULL and showing one row per matched delivery.', `SELECT e.id, e.name, d.units ${deliveryJoin};`, ['Keep expeditions on the left.', 'Do not replace NULL with zero in this report.'], { gap: 'LEFT JOIN', requires: 'LEFT' }),
  independent: task('Return expedition id, name, and priority for expeditions with no delivery record. A zero-unit delivery is a record and must not qualify. Use LEFT JOIN.', `SELECT e.id, e.name, e.priority ${deliveryJoin} WHERE d.id IS NULL;`, ['Use the child row identity to test a missing match.', 'The units value answers a different question.'], { requires: 'LEFT' }),
  mastery: task('Return expedition id, name, and region for expeditions with no survey record. Use LEFT JOIN and keep namesake projects distinct.', 'SELECT e.id, e.name, e.region FROM expeditions AS e LEFT JOIN surveys AS s ON e.id = s.expedition_id WHERE s.id IS NULL;', ['Choose the child relation named in the question.', 'A missing survey leaves its primary key NULL.'], { requires: 'LEFT' }),
  commissions: [
    craft('empty-wagon', 'Empty Wagon Signal', 'Signal projects with a recorded zero-unit delivery.', task('Use JOIN to return expedition id, name, and delivery_id for each delivery with units equal to zero.', 'SELECT e.id, e.name, d.id AS delivery_id FROM expeditions AS e JOIN deliveries AS d ON e.id = d.expedition_id WHERE d.units = 0;', ['This asks for existing delivery records.', 'Each output row represents one zero-unit delivery.'], { requires: 'JOIN', expectedColumns: ['id', 'name', 'delivery_id'] })),
    craft('missing-wagon', 'Missing Wagon Draught', 'Prioritize projects still waiting for their first recorded delivery.', task('Use LEFT JOIN to return expedition id and name for projects with no delivery and priority at least 7.', `${'SELECT e.id, e.name'} ${deliveryJoin} WHERE d.id IS NULL AND e.priority >= 7;`, ['Combine the missing-key check with a parent priority filter.', 'Do not test units = 0.'], { requires: 'LEFT' })),
    craft('survey-watch', 'Survey Watch Charm', 'Mark every recorded high-risk survey with its project.', task('Use JOIN to return expedition id, name, survey_id, and risk for surveys with risk at least 8.', 'SELECT e.id, e.name, s.id AS survey_id, s.risk FROM expeditions AS e JOIN surveys AS s ON e.id = s.expedition_id WHERE s.risk >= 8;', ['Match the survey foreign key to the expedition ID.', 'Several survey rows for one project must remain separate.'], { requires: 'JOIN', expectedColumns: ['id', 'name', 'survey_id', 'risk'] })),
  ],
});

export default expeditionGaps;
