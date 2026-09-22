const strong = { column: 3, operator: '>=', value: 7 };
const gentle = { column: 3, operator: '<', value: 7 };
const exercises = {
  guided: {
    instruction: 'Try together: return the names of ingredients with potency of at least 7. Complete the condition with potency >= 7.',
    starter: 'SELECT name\nFROM ingredients\nWHERE ;',
    slots: [{ after: 'WHERE ', label: 'Comparison: potency of at least 7' }],
    solution: 'SELECT name FROM ingredients WHERE potency >= 7;', rowFilter: strong,
    hints: ['Potency records strength. At least 7 includes exactly 7.', 'Use potency >= 7 after WHERE.', 'SELECT name\nFROM ingredients\nWHERE potency >= 7;'],
    success: 'Crystal (8) and Emberroot (7) meet potency >= 7. Moonstone (5) and Mushroom (2) do not. Emberroot belongs here even though it does not glow: this query checks strength alone. The wizard sets both strong ingredients on the testing bench.',
  },
  independent: {
    instruction: 'Try yourself: return the names of ingredients with potency below 7. Show one column: name. Write the query yourself.',
    starter: '', solution: 'SELECT name FROM ingredients WHERE potency < 7;', rowFilter: gentle,
    hints: ['Below 7 excludes exactly 7.', 'Use the less-than comparison on potency.', 'SELECT name\nFROM ingredients\nWHERE potency < 7;'],
    success: 'Moonstone (5) and Mushroom (2) are below 7. Emberroot at exactly 7 is excluded, as is Crystal at 8. The wizard keeps these gentler ingredients in a separate tray.',
  },
  mastery: {
    instruction: 'Fresh challenge: return the ID and name of every ingredient with potency of at least 7, in that column order. Separate the columns with a comma.',
    starter: '', solution: 'SELECT id, name FROM ingredients WHERE potency >= 7;', rowFilter: strong,
    hints: ['Select two columns while filtering on potency.', 'At least includes the boundary. Glowing is not part of this request.'],
    success: 'The IDs and names identify Crystal and Emberroot as strong enough. A comparison chooses rows; the selected columns decide which facts appear. Both ingredients are ready for the next test.',
  },
};
export default {
  id: 'potent-ingredients', title: 'Potent ingredients', place: 'The Herbarium', scene: 'herbarium', topic: 'Comparisons · >= · <',
  brief: 'Find ingredients strong enough for the ward.',
  story: 'Quill leads you to the herbarium’s testing bench. Before checking for a glow, find every ingredient strong enough for the ward. Strength and glowing are different facts.',
  teaching: 'Potency is a number. > means greater than, >= means at least, < means less than, and <= means at most. Equality (=) means exactly. A boundary value is included by >= and <=.',
  tables: ['ingredients'], reward: 'Potency Reader · mastered', ...exercises.guided, exercises,
  tutorial: {
    title: 'Compare strength, including the boundary',
    question: 'Quill asks: which ingredients have potency strictly greater than 7?',
    paragraphs: [
      'Each ingredients row describes one ingredient. The name column is its label, id is its unique number, and potency records its strength. Glowing records a different property; strong ingredients need not glow.',
      'SELECT chooses the columns, FROM ingredients chooses the catalog, and WHERE keeps rows where a comparison is true. Write numbers without quotes.',
      '> means greater than and < means less than. Neither includes the boundary itself. >= means greater than or equal to (at least); <= means less than or equal to (at most). The equals sign alone means exactly.',
      'At least 7 includes 7, 8, and larger values. Below 7 excludes 7. Emberroot has potency 7, so changing > 7 to >= 7 changes whether it appears.',
      'This catalog uses whole-number potency. Here, > 6 gives the same results as >= 7. That is not true for arbitrary decimals: 6.5 is greater than 6 but is not at least 7. Use >= 7 to directly express “at least 7.”',
    ],
    example: 'SELECT name\nFROM ingredients\nWHERE potency > 7;',
    annotation: 'Crystal has potency 8, so it is included. Emberroot has exactly 7, so > 7 excludes it. Moonstone (5) and Mushroom (2) also fail the condition. All four records remain in the source table.',
    columns: ['name'], sourceIndices: [1], rowFilter: { column: 3, operator: '>', value: 7 },
    next: 'Now include the boundary: find ingredients with potency of at least 7, then try the opposite side of that boundary yourself.',
  },
};
