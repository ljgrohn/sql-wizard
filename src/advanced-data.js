export const advancedSchema = `
CREATE TABLE habitats (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE creatures (id INTEGER PRIMARY KEY, name TEXT, habitat_id INTEGER, element TEXT, energy INTEGER, ready INTEGER);
CREATE TABLE care (id INTEGER PRIMARY KEY, creature_id INTEGER, minutes INTEGER, checked_on TEXT);
CREATE TABLE traits (id INTEGER PRIMARY KEY, creature_id INTEGER, trait TEXT);
CREATE TABLE expeditions (id INTEGER PRIMARY KEY, name TEXT, region TEXT, priority INTEGER);
CREATE TABLE deliveries (id INTEGER PRIMARY KEY, expedition_id INTEGER, units INTEGER, delivered_on TEXT);
CREATE TABLE surveys (id INTEGER PRIMARY KEY, expedition_id INTEGER, risk INTEGER);`;

export const advancedTableInfo = {
  habitats: { description: 'One row per habitat. id identifies it; names may repeat. Empty habitats still matter.', columns: ['id', 'name'] },
  creatures: { description: 'One row per creature. habitat_id → habitats.id, or NULL when unassigned. ready is 1 or 0. Pairing is an invented magical resonance rule, not genetics.', columns: ['id', 'name', 'habitat_id', 'element', 'energy', 'ready'] },
  care: { description: 'Many care visits per creature. creature_id → creatures.id; NULL marks an unassigned visit. minutes is recorded care, checked_on an ISO date.', columns: ['id', 'creature_id', 'minutes', 'checked_on'] },
  traits: { description: 'Many observed magical traits per creature. creature_id → creatures.id. These observations are independent of care visits.', columns: ['id', 'creature_id', 'trait'] },
  expeditions: { description: 'One row per restoration expedition. id identifies it; names may repeat. Larger priority means more urgent.', columns: ['id', 'name', 'region', 'priority'] },
  deliveries: { description: 'Many supply deliveries per expedition. expedition_id → expeditions.id. A recorded zero is a delivery; missing deliveries have no rows.', columns: ['id', 'expedition_id', 'units', 'delivered_on'] },
  surveys: { description: 'Many field surveys per expedition, independently of deliveries. expedition_id → expeditions.id. Larger risk means greater danger.', columns: ['id', 'expedition_id', 'risk'] },
};

// Every variant includes repeated names, empty parents, multiple independent
// child rows, and a NULL child key to expose accidental fanout and NOT IN traps.
export function advancedFixture(variant = 0) {
  const variants = [
    {
      habitats: [[1, 'Moon glade'], [2, 'Ember den'], [3, 'Moon glade'], [4, 'Quiet pool']],
      creatures: [[1, 'Pip', 1, 'moon', 8, 1], [2, 'Pip', 1, 'moon', 6, 1], [3, 'Cinder', 2, 'fire', 10, 1], [4, 'Wisp', null, 'moon', 3, 0], [5, 'Ash', 2, 'fire', 4, 1], [6, 'Dew', 1, 'moon', 9, 0]],
      care: [[1, 1, 10, '2026-09-01'], [2, 1, 20, '2026-09-03'], [3, 2, 5, '2026-09-02'], [4, 3, 15, '2026-09-04'], [5, null, 12, '2026-09-04'], [6, 5, 0, '2026-08-30']],
      traits: [[1, 1, 'glowing'], [2, 1, 'singing'], [3, 2, 'glowing'], [4, 4, 'floating'], [5, 5, 'warm'], [6, 5, 'singing']],
      expeditions: [[1, 'North lantern', 'north', 8], [2, 'Reed bridge', 'marsh', 5], [3, 'North lantern', 'north', 3], [4, 'Ash watch', 'ridge', 9], [5, 'Quiet inlet', 'marsh', 7]],
      deliveries: [[1, 1, 8, '2026-09-01'], [2, 1, 12, '2026-09-03'], [3, 2, 4, '2026-09-02'], [4, 3, 0, '2026-09-03'], [5, 5, 9, '2026-09-04']],
      surveys: [[1, 1, 6], [2, 1, 8], [3, 2, 3], [4, 4, 9], [5, 5, 2], [6, 5, 4]],
    },
    {
      habitats: [[11, 'Star nest'], [12, 'Star nest'], [13, 'Ash grove'], [14, 'Tide cave']],
      creatures: [[11, 'Glim', 11, 'moon', 2, 1], [12, 'Glim', 12, 'moon', 12, 1], [13, 'Flare', 13, 'fire', 7, 0], [14, 'Ripple', null, 'water', 9, 1], [15, 'Coal', 13, 'fire', 11, 1], [16, 'Pearl', 11, 'moon', 5, 1]],
      care: [[11, 11, 4, '2026-09-05'], [12, 11, 7, '2026-09-06'], [13, 12, 25, '2026-08-29'], [14, null, 3, '2026-09-02'], [15, 15, 0, '2026-09-04'], [16, 16, 18, '2026-09-03']],
      traits: [[11, 11, 'floating'], [12, 11, 'glowing'], [13, 11, 'singing'], [14, 13, 'warm'], [15, 14, 'singing'], [16, 15, 'warm']],
      expeditions: [[11, 'Glass road', 'ridge', 6], [12, 'Glass road', 'north', 10], [13, 'Moss gate', 'marsh', 2], [14, 'Reed camp', 'marsh', 8], [15, 'Star dock', 'north', 5]],
      deliveries: [[11, 11, 7, '2026-09-03'], [12, 11, 7, '2026-09-04'], [13, 12, 22, '2026-09-02'], [14, 14, 0, '2026-09-01'], [15, 14, 6, '2026-09-05']],
      surveys: [[11, 11, 9], [12, 11, 5], [13, 12, 4], [14, 13, 8], [15, 13, 10], [16, 14, 2]],
    },
    {
      habitats: [[21, 'Dew court'], [22, 'Sun court'], [23, 'Dew court'], [24, 'Fern nook']],
      creatures: [[21, 'Echo', 21, 'water', 6, 1], [22, 'Echo', 22, 'water', 6, 1], [23, 'Spark', 22, 'fire', 6, 1], [24, 'Mist', null, 'water', 6, 1], [25, 'Shade', 21, 'moon', 1, 0], [26, 'Flicker', 22, 'fire', 11, 0]],
      care: [[21, 21, 10, '2026-08-31'], [22, 21, 10, '2026-09-01'], [23, 22, 0, '2026-09-02'], [24, 24, 20, '2026-09-03'], [25, null, 8, '2026-09-03'], [26, 26, 30, '2026-09-05']],
      traits: [[21, 21, 'glowing'], [22, 21, 'floating'], [23, 22, 'singing'], [24, 23, 'warm'], [25, 26, 'warm'], [26, 26, 'glowing']],
      expeditions: [[21, 'Fern crossing', 'marsh', 7], [22, 'Fern crossing', 'north', 7], [23, 'Cinder span', 'ridge', 4], [24, 'Moon quay', 'north', 9], [25, 'Dew crossing', 'marsh', 1]],
      deliveries: [[21, 21, 5, '2026-09-01'], [22, 21, 5, '2026-09-03'], [23, 22, 0, '2026-09-04'], [24, 23, 15, '2026-08-30'], [25, 23, 10, '2026-09-02']],
      surveys: [[21, 21, 1], [22, 21, 9], [23, 23, 6], [24, 24, 10], [25, 24, 10], [26, 25, 4]],
    },
  ];
  return variants[variant] || variants[0];
}
