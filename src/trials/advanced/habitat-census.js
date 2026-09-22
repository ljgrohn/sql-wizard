import { stage, task, commission as craft } from './build-lesson.js';

const censusFrom = 'FROM habitats AS h LEFT JOIN creatures AS c ON h.id = c.habitat_id';

export const habitatCensus = stage({
  id: 'habitat-census', title: 'Room for the quiet ones', place: 'The Sanctuary', scene: 'sanctuary', speaker: 'BRAMBLE', topic: 'LEFT JOIN · grouped counts · zero',
  brief: 'Count residents without erasing empty habitats or merging namesakes.', tables: ['habitats', 'creatures'], relationships: 'habitats.id → creatures.habitat_id (one habitat, many creatures)',
  pages: [
    { title: 'Two moon glades', speaker: 'BRAMBLE', text: 'An old gardener gave two habitats the same name. One is full of rustling wings; the other is waiting for its first resident. Their signs cannot tell you which is which. Their IDs can.' },
    { title: 'A blank page is still a place', speaker: 'QUILL', text: 'Quill almost leaves the empty glade out of the census. “If it disappears from the report,” Bramble says, “how will we remember to repair its shelter?”' },
  ],
  ending: { title: 'Every shelter has a line', speaker: 'BRAMBLE', text: 'The census keeps empty homes visible and gives namesakes separate rows. Bramble can prepare each shelter without confusing it with its neighbor.' },
  paragraphs: [
    'Start from habitats and LEFT JOIN creatures to preserve empty habitats. Group by h.id, h.name, not the display name alone. Two different places can share a name.',
    'COUNT(c.id) counts only matched, non-NULL creature IDs. An empty habitat produces one preserved row with NULL creature columns, so COUNT(*) would incorrectly report one resident. COUNT(c.id) correctly reports zero.',
    'To count only ready residents while preserving all habitats, put AND c.ready = 1 in the ON condition. A WHERE c.ready = 1 filter would remove empty habitats after the join. HAVING filters the completed habitat groups.',
  ],
  example: `SELECT h.id, h.name, COUNT(c.id) AS residents ${censusFrom} GROUP BY h.id, h.name;`, columns: ['id', 'name', 'residents'],
  guided: task('Return habitat id, name, and residents for every habitat, including zero residents.', `SELECT h.id, h.name, COUNT(c.id) AS residents ${censusFrom} GROUP BY h.id, h.name;`, ['Preserve habitats using LEFT JOIN.', 'Count the non-NULL creature key.'], { gap: 'LEFT JOIN', requires: ['LEFT', 'GROUP'], expectedColumns: ['id', 'name', 'residents'] }),
  independent: task('Return habitat id, name, and ready_count for every habitat, counting only ready creatures. Keep habitats with zero ready creatures.', 'SELECT h.id, h.name, COUNT(c.id) AS ready_count FROM habitats AS h LEFT JOIN creatures AS c ON h.id = c.habitat_id AND c.ready = 1 GROUP BY h.id, h.name;', ['Put the ready filter in the join condition.', 'Count c.id and group by habitat identity.'], { requires: ['LEFT', 'GROUP'], expectedColumns: ['id', 'name', 'ready_count'] }),
  mastery: task('Return habitat id, name, and residents only for habitats with fewer than 2 residents, including empty habitats.', `SELECT h.id, h.name, COUNT(c.id) AS residents ${censusFrom} GROUP BY h.id, h.name HAVING COUNT(c.id) < 2;`, ['Keep all habitats until the grouped count exists.', 'HAVING tests the completed count.'], { requires: ['LEFT', 'HAVING'], expectedColumns: ['id', 'name', 'residents'] }),
  commissions: [
    craft('empty-nest', 'Empty Nest Lantern', 'Make a lantern for every shelter awaiting a resident.', task('Return habitat id and name for habitats with zero residents using LEFT JOIN, GROUP BY and HAVING.', `SELECT h.id, h.name ${censusFrom} GROUP BY h.id, h.name HAVING COUNT(c.id) = 0;`, ['Count c.id rather than the preserved row.', 'Keep distinct habitat IDs separate.'], { requires: ['LEFT', 'GROUP', 'HAVING'] })),
    craft('moon-census', 'Moon Census Draught', 'Prepare a counting draught for moon-aligned residents.', task('Return habitat id, name, and moon_count for every habitat, counting only moon creatures. Include zero.', "SELECT h.id, h.name, COUNT(c.id) AS moon_count FROM habitats AS h LEFT JOIN creatures AS c ON h.id = c.habitat_id AND c.element = 'moon' GROUP BY h.id, h.name;", ['The element filter belongs in ON.', 'Namesakes need different grouped rows.'], { requires: ['LEFT', 'GROUP'], expectedColumns: ['id', 'name', 'moon_count'] })),
    craft('busy-shelter', 'Busy Shelter Charm', 'Mark homes sheltering at least two creatures.', task('Return habitat id, name, and residents for habitats with at least 2 residents, ordered by residents descending then habitat id ascending.', `SELECT h.id, h.name, COUNT(c.id) AS residents ${censusFrom} GROUP BY h.id, h.name HAVING COUNT(c.id) >= 2 ORDER BY residents DESC, h.id ASC;`, ['Filter the groups with HAVING.', 'The ID breaks equal-count ties.'], { requires: ['GROUP', 'HAVING', 'ORDER'], ordered: true, expectedColumns: ['id', 'name', 'residents'] })),
  ],
});

export default habitatCensus;
