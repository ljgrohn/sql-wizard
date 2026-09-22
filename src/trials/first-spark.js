const exercises = {
  guided: {
    instruction: 'Try together: return the name of every ingredient. Type name in the gap after SELECT.',
    starter: 'SELECT \nFROM ingredients;',
    slots: [{ after: 'SELECT ', label: 'Column name' }],
    solution: 'SELECT name FROM ingredients;',
    hints: ['The name column contains each ingredient’s label.', 'Put name after SELECT, before FROM.', 'SELECT name\nFROM ingredients;'],
    success: 'Every ingredient appears once: Crystal, Moonstone, Mushroom, and Emberroot. SELECT chose the name column; no rows were excluded. Reading the catalog helps you label the archive.',
  },
  independent: {
    instruction: 'Try yourself: return the unique ID of every ingredient. Your result should have one column: id. Write the query yourself.',
    starter: '',
    solution: 'SELECT id FROM ingredients;',
    hints: ['An ID identifies one ingredient, even when names are shared.', 'Choose the id column and read the ingredients table.', 'SELECT id\nFROM ingredients;'],
    success: 'You read all four IDs: 1, 2, 3, and 4. SELECT chooses a column, while FROM chooses the table. Every row remains included.',
  },
  mastery: {
    instruction: 'Fresh challenge: return every ingredient’s ID and name, in that column order. Separate the two column names with a comma. Write a new query without a worked solution.',
    starter: '',
    solution: 'SELECT id, name FROM ingredients;',
    hints: ['Use the same table. Each output row should contain two facts about one ingredient.', 'A comma separates columns after SELECT. Their order follows the request.'],
    success: 'Each returned row pairs an ingredient’s ID with its name. All ingredients remain included. You can now read the archive independently; the wizard uses these labels to prepare the first spark.',
  },
};

export default {
  id: 'first-spark',
  title: 'The first spark',
  place: 'The Archive',
  topic: 'SELECT · FROM',
  brief: 'Read the ingredient catalog.',
  story: 'The academy’s ward has gone dark. Before we can kindle it, learn to read the archive. A query asks a question; the wizard uses its answer.',
  instruction: exercises.guided.instruction,
  teaching: 'SELECT chooses columns. FROM names the table. Each row in ingredients describes one ingredient; id uniquely identifies it. Separate multiple columns with a comma.',
  starter: exercises.guided.starter,
  solution: exercises.guided.solution,
  tables: ['ingredients'],
  hints: exercises.guided.hints,
  success: exercises.guided.success,
  reward: 'First Spark · mastered',
  exercises,
  tutorial: {
    paragraphs: [
      'A table is a catalog. A row runs across it and describes one ingredient. A column runs down it and holds one kind of fact.',
      'Our table is called ingredients. Its name column holds labels such as Crystal. Its id column holds a unique number for each ingredient. The glowing column records 1 for yes or 0 for no. The potency column records strength.',
      'SELECT tells SQLite which columns to show. FROM tells it which table to read. These keywords are instructions; column and table names identify the records you want. SQL reads these records without changing them.',
      'Write column names after SELECT and the table name after FROM. A comma separates multiple columns. A semicolon ends the query. Spaces and line breaks separate words; either layout works.',
    ],
    example: 'SELECT potency\nFROM ingredients;',
    annotation: 'SELECT potency chooses the strength column. FROM ingredients reads the ingredient catalog. The result has one column and all four rows; choosing a column does not remove rows.',
    columns: ['potency'],
    sourceIndices: [3],
  },
};
