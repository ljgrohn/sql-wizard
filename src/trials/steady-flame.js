const strong = { column: 3, operator: '>=', value: 7 };
const glowing = { column: 2, equals: 1 };
const strongGlow = { all: [strong, glowing] };
const strongOrdinary = { all: [strong, { column: 2, equals: 0 }] };
const exercises = {
  guided: {
    instruction: 'Try together: from ingredients with potency of at least 7, keep only those that also glow. Add AND glowing = 1 after the strength condition. Return name.',
    starter: 'SELECT name\nFROM ingredients\nWHERE potency >= 7\n  ;',
    slots: [{ after: 'WHERE potency >= 7\n  ', label: 'Add AND and the glowing condition' }],
    solution: 'SELECT name FROM ingredients WHERE potency >= 7 AND glowing = 1;', rowFilter: strongGlow,
    hints: ['Both conditions must be true for the same row.', 'Emberroot is strong enough but does not glow. Connect the glowing condition with AND.', 'SELECT name\nFROM ingredients\nWHERE potency >= 7\n  AND glowing = 1;'],
    success: 'Crystal passes both checks: potency 8 is at least 7, and glowing is 1. Emberroot passes strength at 7 but fails glowing at 0. AND therefore excludes Emberroot. The wizard uses Crystal to steady the ward.',
  },
  independent: {
    instruction: 'Try yourself: return the names of ingredients that have potency of at least 7 AND do not glow. Write both conditions yourself.',
    starter: '', solution: 'SELECT name FROM ingredients WHERE potency >= 7 AND glowing = 0;', rowFilter: strongOrdinary,
    hints: ['Keep the same strength boundary; non-glowing means glowing = 0.', 'Use AND so each returned row passes the strength and non-glowing checks.', 'SELECT name\nFROM ingredients\nWHERE potency >= 7\n  AND glowing = 0;'],
    success: 'Emberroot is strong enough and does not glow, so it matches both requested conditions. Crystal fails the non-glowing check, and Mushroom fails strength. The wizard sets Emberroot aside for another task, not the glowing ward.',
  },
  mastery: {
    instruction: 'Fresh challenge: return ID and name, in that order, for ingredients that glow AND have potency of at least 7. Use both conditions and separate the selected columns with a comma.',
    starter: '', solution: 'SELECT id, name FROM ingredients WHERE glowing = 1 AND potency >= 7;', rowFilter: strongGlow,
    hints: ['One condition checks strength and the other checks glowing.', 'Both conditions must be true for the same ingredient. Changing their order does not change AND.'],
    success: 'Only Crystal satisfies both conditions. Emberroot reaches the strength boundary but still does not glow. You can now combine conditions independently; the wizard has the right ingredient for a steady ward.',
  },
};
export default {
  id: 'steady-flame', title: 'A steadier flame', place: 'The Herbarium', scene: 'herbarium', topic: 'AND · two conditions',
  brief: 'Keep strong ingredients only when they also glow.',
  story: 'The strength check found Crystal and Emberroot. The ward also needs a glow. Learn how one query can check both facts about the same ingredient.',
  teaching: 'AND connects conditions that must both be true for the same row. Potency >= 7 includes exactly 7; glowing = 1 means yes, and glowing = 0 means no. SELECT still chooses columns. Filtering reads records without changing them.',
  tables: ['ingredients'], requires: 'AND', reward: 'Steady Hand · mastered', ...exercises.guided, exercises,
  scenePreview: { filter: strong, caption: 'Strength check only: potency >= 7' },
  tutorial: {
    title: 'Require both conditions with AND',
    question: 'Quill asks: which ingredients glow but have potency below 7?',
    paragraphs: [
      'Potency and glowing describe different facts. Crystal has potency 8 and glowing 1. Emberroot has potency 7 and glowing 0. Both are strong enough, but only Crystal glows.',
      'WHERE can contain more than one condition. AND means every connected condition must be true for the same row. Passing one check is not enough.',
      'Place AND between the conditions, after WHERE. For example, potency < 7 AND glowing = 1 checks for a gentle ingredient that glows. You may put each condition on its own line.',
      'Review: >= means at least, including the boundary; < means below, excluding the boundary. The equals sign compares values. Glowing uses 1 for yes and 0 for no.',
      'SELECT name chooses the name column; FROM ingredients reads the catalog. To return ID and name together, put id, name after SELECT. AND changes which rows are returned, not which columns.',
    ],
    example: 'SELECT name\nFROM ingredients\nWHERE potency < 7\n  AND glowing = 1;',
    annotation: 'Moonstone passes both checks: potency 5 is below 7, and glowing is 1. Mushroom passes the potency check but does not glow. Crystal and Emberroot fail the potency check. Only Moonstone is returned.',
    columns: ['name'], sourceIndices: [1], rowFilter: { all: [{ column: 3, operator: '<', value: 7 }, glowing] },
    next: 'Now choose strong glowing ingredients instead. Watch the two strength candidates become one when the glowing condition is added.',
  },
};
