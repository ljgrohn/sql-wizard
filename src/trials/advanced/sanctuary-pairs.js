import { stage, task, commission as craft } from './build-lesson.js';

const pairFrom = `FROM creatures AS a
JOIN creatures AS b ON a.element = b.element AND a.id < b.id`;
const pairRules = 'WHERE a.ready = 1 AND b.ready = 1';

export const sanctuaryPairs = stage({
  id: 'sanctuary-pairs', title: 'The resonance garden', place: 'The Sanctuary', scene: 'sanctuary', speaker: 'BRAMBLE', topic: 'Self JOIN · canonical pairs',
  brief: 'Find each safe magical resonance pair exactly once.',
  tables: ['creatures'], relationships: 'creatures AS a ↔ creatures AS b, matched by element; a.id < b.id makes each pair unique',
  pages: [
    { title: 'A gate that answers twice', speaker: 'BRAMBLE', text: 'Two Pips answer when Bramble calls across the garden. Their names match, but their numbered collars do not. The sanctuary gate needs two distinct creatures to hum the same magical note.' },
    { title: 'Consent before resonance', speaker: 'BRAMBLE', text: 'A ready mark means a creature is rested and willing to practice. Pair only two ready creatures with the same element. This is a made-up rule for a magical duet, not a rule about breeding or genetics.' },
    { title: 'One duet, one invitation', speaker: 'QUILL', text: 'Quill writes Pip and Pip twice, reversing their collars the second time. Bramble laughs gently: “We need one invitation for each duet, and nobody can duet with themself.”' },
  ],
  ending: { title: 'The gate hears harmony', speaker: 'BRAMBLE', text: 'Each invitation names two different collar IDs. The creatures choose their partners, the gate opens, and a quiet garden becomes a sanctuary again.' },
  paragraphs: [
    'A self join reads the same table twice under different aliases. creatures AS a supplies the first creature and creatures AS b supplies the second. a.energy and b.energy refer to different roles, even though both come from the same table.',
    'Match a.element = b.element for resonance. Add a.id < b.id to exclude self-pairs and reversed copies. Using a.id != b.id would exclude self-pairs but still return both (1,2) and (2,1). Never compare display names to establish identity.',
    'The care rule applies to both roles: WHERE a.ready = 1 AND b.ready = 1. Filtering only a.ready would allow an unready second creature. Pairing never changes readiness, energy, or the database.',
  ],
  example: `SELECT a.id AS first_id, b.id AS second_id, a.element ${pairFrom} ${pairRules};`, columns: ['first_id', 'second_id', 'element'],
  guided: task('Return first_id and second_id for every same-element, ready pair exactly once.', `SELECT a.id AS first_id, b.id AS second_id ${pairFrom} ${pairRules};`, ['Read creatures twice with distinct aliases.', 'Keep a.id < b.id and check both ready marks.'], { gap: 'JOIN', requires: 'JOIN', expectedColumns: ['first_id', 'second_id'] }),
  independent: task('Return first_id, second_id, and element for every same-element, ready pair where BOTH creatures have energy at least 6. Use those aliases for the IDs.', `SELECT a.id AS first_id, b.id AS second_id, a.element ${pairFrom} ${pairRules} AND a.energy >= 6 AND b.energy >= 6;`, ['Each energy condition belongs to one alias.', 'Canonical ID order prevents reversed pairs.'], { requires: 'JOIN', expectedColumns: ['first_id', 'second_id', 'element'] }),
  mastery: task('Return first_id, second_id, and combined_energy for ready, same-element pairs whose combined energy is at least 14. Return each pair once; use the requested aliases.', `SELECT a.id AS first_id, b.id AS second_id, a.energy + b.energy AS combined_energy ${pairFrom} ${pairRules} AND a.energy + b.energy >= 14;`, ['An expression can add values from two aliases.', 'Readiness and pair uniqueness still apply.'], { requires: 'JOIN', expectedColumns: ['first_id', 'second_id', 'combined_energy'] }),
  commissions: [
    craft('moon-duet', 'Moon Duet', 'Invite only moon-aligned duets to light the sanctuary path.', task('Return first_id and second_id for ready moon pairs exactly once.', `SELECT a.id AS first_id, b.id AS second_id ${pairFrom} ${pairRules} AND a.element = 'moon';`, ['The join already guarantees equal elements.', 'Filter one element alias after checking both ready marks.'], { requires: 'JOIN', expectedColumns: ['first_id', 'second_id'] })),
    craft('balanced-tonic', 'Balanced Duet Tonic', 'Prepare a harmless stage prop for partners with at least ten combined energy.', task('Return first_id, second_id, and combined_energy for ready same-element pairs with at least 10 combined energy, each pair once.', `SELECT a.id AS first_id, b.id AS second_id, a.energy + b.energy AS combined_energy ${pairFrom} ${pairRules} AND a.energy + b.energy >= 10;`, ['Add the two energy columns.', 'Keep the existing resonance and readiness rules.'], { requires: 'JOIN', expectedColumns: ['first_id', 'second_id', 'combined_energy'] })),
    craft('home-harmony', 'Home Harmony Charm', 'Mark duets whose partners share a known habitat.', task('Return first_id, second_id, and habitat_id for ready same-element pairs sharing a habitat. Exclude unknown habitats; return each pair once.', `SELECT a.id AS first_id, b.id AS second_id, a.habitat_id ${pairFrom} ${pairRules} AND a.habitat_id = b.habitat_id;`, ['Equality does not match two NULL habitat values.', 'Both roles must still be ready.'], { requires: 'JOIN', expectedColumns: ['first_id', 'second_id', 'habitat_id'] })),
  ],
});

export default sanctuaryPairs;
