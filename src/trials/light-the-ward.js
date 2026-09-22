const exercises = {
  guided: {
    instruction: 'Try together: return the names of ingredients that glow. Complete the condition after WHERE using glowing = 1.',
    starter: 'SELECT name\nFROM ingredients\nWHERE ;',
    slots: [{ after: 'WHERE ', label: 'Condition: compare glowing with 1' }],
    solution: 'SELECT name FROM ingredients WHERE glowing = 1;',
    rowFilter: { column: 2, equals: 1 },
    hints: ['The glowing column records 1 for yes and 0 for no.', 'Use glowing = 1 after WHERE.', 'SELECT name\nFROM ingredients\nWHERE glowing = 1;'],
    success: 'Crystal and Moonstone match because glowing is 1. Mushroom and Emberroot have 0, so WHERE excludes them. SELECT reads the names; the wizard uses that answer to light the ward.',
  },
  independent: {
    instruction: 'Try yourself: return the names of ingredients that do not glow. Your result should have one column: name. Write the query yourself.',
    starter: '',
    solution: 'SELECT name FROM ingredients WHERE glowing = 0;',
    rowFilter: { column: 2, equals: 0 },
    hints: ['Non-glowing ingredients have a 0 in the glowing column.', 'SELECT chooses name, FROM reads ingredients, and WHERE keeps rows whose glowing value equals zero.', 'SELECT name\nFROM ingredients\nWHERE glowing = 0;'],
    success: 'Mushroom and Emberroot match glowing = 0; Crystal and Moonstone do not. WHERE chooses rows, while SELECT chooses columns. The wizard leaves these ordinary ingredients on their shelves.',
  },
  mastery: {
    instruction: 'Fresh challenge: return the ID and name of each glowing ingredient, in that column order. Use a comma between columns and an equality condition to keep glowing ingredients.',
    starter: '',
    solution: 'SELECT id, name FROM ingredients WHERE glowing = 1;',
    rowFilter: { column: 2, equals: 1 },
    hints: ['The output has two columns. The glowing column decides which rows remain.', 'Use SELECT for the requested columns, FROM for the table, and WHERE for the condition.'],
    success: 'IDs and names now identify only Crystal and Moonstone. The other rows were excluded by the glowing condition. You can choose columns and filter rows independently; the wizard selects the glowing supplies.',
  },
};

export default {
  id: 'light-the-ward', title: 'Light the ward', place: 'The Archive', topic: 'WHERE · =',
  brief: 'Find the ingredients that carry their own light.',
  story: 'The ward needs ingredients that glow. First learn to ask which records match. Your query reads the archive; the wizard uses its answer to choose supplies.',
  teaching: 'SELECT chooses columns. FROM names the table. WHERE keeps rows matching a condition. The equals sign (=) compares two values; glowing = 1 means the ingredient glows, and glowing = 0 means it does not.',
  tables: ['ingredients'], reward: 'Lightkeeper · mastered',
  ...exercises.guided,
  exercises,
  tutorial: {
    title: 'Choose matching rows with WHERE',
    question: 'Quill asks: which ingredient has the unique ID 2?',
    next: 'Next, use the glowing column to find ingredients for the ward, then try a new filter yourself.',
    paragraphs: [
      'SELECT chooses columns, and FROM names the table. Each row in ingredients describes one ingredient. Now we will choose which rows appear.',
      'WHERE introduces a condition after FROM. SQLite checks that condition for each row and keeps only rows where it is true. The equals sign (=) asks whether two values are the same; it does not change the stored value.',
      'The id column identifies each ingredient with a unique number. The name column holds its label. The glowing column records 1 for yes and 0 for no. Numbers such as 0, 1, and 2 are written without quotes.',
      'For example, id = 2 is true only for the row whose ID is 2. SELECT name still shows only the name column, even though the condition checks id. You may select multiple columns by separating their names with a comma.',
    ],
    example: 'SELECT name\nFROM ingredients\nWHERE id = 2;',
    annotation: 'FROM reads ingredients. WHERE id = 2 keeps Moonstone and excludes the other three rows. SELECT name shows just its name. Filtering reads records; it does not remove them from the source table.',
    columns: ['name'], sourceIndices: [1], rowFilter: { column: 0, equals: 2 },
  },
};
