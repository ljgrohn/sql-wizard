import { stage, task, commission as craft } from './build-lesson.js';

const manifestPages = [
  { title: 'Beyond the familiar shelves', speaker: 'IONA', text: 'The eastern roads have reopened, and a courier brings three unfamiliar ledgers: expeditions, deliveries, and surveys. The restoration council needs answers before sending its teams into the field.' },
  { title: 'Read the map before the spell', speaker: 'QUILL', text: 'No creature collars or potion jars appear here. An expedition ID identifies a project; delivery and survey rows describe separate events. Names can repeat. The patterns you learned must travel to new data.' },
];







export const expeditionManifest = stage({
  id: 'expedition-manifest', title: 'The restoration manifest', place: 'The Restoration Camp', scene: 'restoration', speaker: 'IONA', topic: 'Transfer assessment · filtering and ordering',
  brief: 'Apply familiar SQL to an unfamiliar expedition ledger.', tables: ['expeditions'], relationships: 'expeditions.id identifies one project; name is a display label, not an identifier',
  pages: manifestPages,
  ending: { title: 'A readable dispatch list', speaker: 'IONA', text: 'The council receives a stable list ordered by the stated priorities. You used the new schema to answer the question without relying on familiar names or memorized IDs.' },
  paragraphs: [
    'This final chapter transfers your skills to a new dataset. expeditions contains id, name, region, and priority. A larger priority value means more urgent work. IDs identify projects; two projects can share a name.',
    'Review the source table before writing. SELECT determines the output columns, WHERE determines which rows qualify, and ORDER BY determines presentation order. Use an ID tie-breaker when priorities match.',
    'The guided query is a schema warm-up. The independent and mastery tasks begin with a blank editor and ask different questions. Work from the requirement, not a copied row list. Hidden catalogs change names, values, and ties.',
  ],
  example: 'SELECT id, name, region, priority FROM expeditions ORDER BY id ASC;', columns: ['id', 'name', 'region', 'priority'],
  guided: task('Return expedition id, name, and priority for every expedition, ordered by priority descending then id ascending.', 'SELECT id, name, priority FROM expeditions ORDER BY priority DESC, id ASC;', ['Larger priority means earlier in this report.', 'Use ID to resolve ties.'], { gap: 'ORDER BY', requires: 'ORDER', ordered: true }),
  independent: task('Return id, name, and priority for north-region expeditions with priority at least 5. Order by priority descending then id ascending.', "SELECT id, name, priority FROM expeditions WHERE region = 'north' AND priority >= 5 ORDER BY priority DESC, id ASC;", ['Both eligibility conditions must hold.', 'State both requested ordering keys.'], { requires: 'ORDER', ordered: true }),
  mastery: task('Return id, name, region, and priority for expeditions in marsh OR ridge, but only when priority is at least 5. Order by region ascending, priority descending, then id ascending.', "SELECT id, name, region, priority FROM expeditions WHERE (region = 'marsh' OR region = 'ridge') AND priority >= 5 ORDER BY region ASC, priority DESC, id ASC;", ['Parentheses keep the two region alternatives together.', 'Apply the urgency threshold to both regions.'], { requires: 'ORDER', ordered: true }),
  commissions: [
    craft('north-beacon', 'North Beacon', 'Mark every northern project on the courier’s map.', task('Return id and name for north-region expeditions, ordered by id ascending.', "SELECT id, name FROM expeditions WHERE region = 'north' ORDER BY id ASC;", ['Read the region from expeditions.', 'Only two columns are requested.'], { requires: 'ORDER', ordered: true })),
    craft('urgent-ink', 'Urgent Dispatch Ink', 'Write the names of projects whose priority is at least seven.', task('Return id, name, and region for expeditions with priority at least 7, ordered by priority descending then id ascending.', 'SELECT id, name, region FROM expeditions WHERE priority >= 7 ORDER BY priority DESC, id ASC;', ['An ordering column does not need to be displayed.', 'At least includes priority 7.'], { requires: 'ORDER', ordered: true })),
    craft('patient-route', 'Patient Route Charm', 'Plan visits to projects with priority below seven.', task('Return id, name, and priority for expeditions with priority below 7, ordered by priority ascending then id ascending.', 'SELECT id, name, priority FROM expeditions WHERE priority < 7 ORDER BY priority ASC, id ASC;', ['Below excludes the threshold.', 'This route requests ascending priority.'], { requires: 'ORDER', ordered: true })),
  ],
});

export default expeditionManifest;
