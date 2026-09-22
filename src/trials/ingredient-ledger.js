const matchingRows = data => data.stock.flatMap(([ingredientId, quantity]) => data.ingredients.filter(row => row[0] === ingredientId).map(row => [ingredientId, row[0], row[1], quantity]));
const exercises = {
  guided: {
    instruction: 'Try together: return each ingredient name and its recorded stock quantity, in that order. Match ingredients.id with stock.ingredient_id in the ON condition. Keep every matching record, including a recorded zero.',
    starter: 'SELECT i.name, s.quantity\nFROM ingredients AS i\nJOIN stock AS s ON ;',
    slots: [{ after: 'JOIN stock AS s ON ', label: 'Match i.id with s.ingredient_id' }],
    solution: 'SELECT i.name, s.quantity FROM ingredients AS i JOIN stock AS s ON i.id = s.ingredient_id;',
    hints: ['The catalog gives each ingredient a unique id. Stock refers to the same number as ingredient_id.', 'The aliases i and s name the two tables. Compare their ID columns with =.', 'SELECT i.name, s.quantity\nFROM ingredients AS i\nJOIN stock AS s ON i.id = s.ingredient_id;'],
    success: 'The shared IDs pair Crystal with 8, Moonstone with 0, and Mushroom with 12. Zero is still a recorded quantity, so Moonstone stays. Emberroot has no stock row and this JOIN leaves it out; that does not prove its stock is zero. Iona can now read the recorded jars by name.',
  },
  independent: {
    instruction: 'Try yourself: join the two tables and return ingredient name and stock quantity only where the recorded quantity is greater than zero. Use name first, quantity second.',
    starter: '',
    solution: 'SELECT i.name, s.quantity FROM ingredients AS i JOIN stock AS s ON i.id = s.ingredient_id WHERE s.quantity > 0;',
    hints: ['Connect IDs first. Then filter the joined records by their quantity.', 'Use WHERE on s.quantity to keep only positive amounts.', 'SELECT i.name, s.quantity\nFROM ingredients AS i\nJOIN stock AS s ON i.id = s.ingredient_id\nWHERE s.quantity > 0;'],
    success: 'Crystal has 8 recorded and Mushroom has 12. Moonstone joins successfully but is excluded by quantity > 0. Emberroot never matches a stock row. Iona can distinguish positive recorded supplies from an empty or unrecorded shelf.',
  },
  mastery: {
    instruction: 'Fresh challenge: return ingredient ID, name, and recorded stock quantity, in that order. Include all matching stock records, even zero. Write the two-table JOIN yourself.',
    starter: '',
    solution: 'SELECT i.id, i.name, s.quantity FROM ingredients AS i JOIN stock AS s ON i.id = s.ingredient_id;',
    hints: ['Select three columns after matching the two ID fields.', 'This request keeps every matching record. It does not ask you to filter quantities.'],
    success: 'Each row now carries an ID, a name, and its recorded quantity. Matching the IDs reconnects the facts without guessing from names or row order. The ingredient ledger is ready; next Iona will show you how recipe entries use the same idea.',
  },
};
export default {
  id: 'ingredient-ledger', title: 'The ingredient ledger', place: 'Potion Workshop', scene: 'workshop', speaker: 'IONA', topic: 'JOIN · ON · aliases',
  brief: 'Reconnect stock records with ingredient names.',
  story: 'Iona’s stock ledger holds quantities and ingredient IDs. The catalog holds IDs and names. Find the shared identity so she can read the two records together.',
  teaching: 'JOIN pairs rows. ON gives the matching rule: ingredients.id = stock.ingredient_id. AS gives a table a short alias, and a dot identifies its column, such as i.name. Matching is by ID, not row position or quantity.',
  tables: ['ingredients', 'stock'], relationships: 'ingredients.id → stock.ingredient_id', requires: 'JOIN', reward: 'Ledger Reader · mastered', resultCaption: 'Matched records · ingredient / recorded quantity',
  ...exercises.guided, exercises,
  tutorial: {
    title: 'Match two records with one shared ID',
    question: 'Iona asks: which recorded ingredient has a quantity of zero?',
    paragraphs: [
      'The ingredients catalog has one row per ingredient. Its id is a unique identifier and its name is the label. Stock has one row per recorded ingredient, with ingredient_id and quantity. These tables describe different facts about the same supplies.',
      'The same ID connects the records. A stock ingredient_id of 2 belongs to the ingredients row whose id is 2: Moonstone. Match the ID values, not the positions of rows, and not numbers that merely happen to be quantities.',
      'JOIN asks SQLite to pair rows from two tables. ON gives the rule for a pair: ingredients.id = stock.ingredient_id. This JOIN (also called INNER JOIN) keeps matching pairs only. Emberroot has no stock record and will not appear. A missing record does not mean a quantity of zero.',
      'AS introduces an alias, a short name used only in this query. FROM ingredients AS i calls the first table i; JOIN stock AS s calls the other s. The dot in i.name means the name column of table i. ON i.id = s.ingredient_id is the same matching rule with shorter names.',
      'SELECT i.name, s.quantity chooses the two output columns; the comma separates them. WHERE can then filter the matching rows. s.quantity = 0 keeps a recorded zero; s.quantity > 0 keeps positive quantities. The query reads records without moving jars or changing stock.',
    ],
    relationshipColumns: ['stock.ingredient_id', 'ingredients.id', 'name', 'quantity'],
    relationshipRows: matchingRows,
    example: 'SELECT i.name, s.quantity\nFROM ingredients AS i\nJOIN stock AS s ON i.id = s.ingredient_id\nWHERE s.quantity = 0;',
    annotation: 'The IDs match Moonstone to its stock record. Its quantity is exactly zero, so WHERE keeps it. Crystal and Mushroom match the join but fail the zero check. Emberroot has no stock row to match.',
    columns: ['name', 'quantity'], exampleRows: data => matchingRows(data).filter(row => row[3] === 0).map(row => [row[2], row[3]]),
    next: 'First reconnect every recorded ingredient with its quantity. Then use the same join to find positive quantities yourself.',
  },
};
