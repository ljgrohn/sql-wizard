export const stockRows = data => data.ingredients.map(([id, name]) => {
  const match = data.stock.find(row => row[0] === id);
  return [id, name, match ? match[1] : null];
});
export const stockTokens = result => result.values.map(row => {
  const [name, quantity] = row.slice(-2);
  return quantity === null ? { label: `${name} · unknown stock (NULL)`, kind: 'stock-unknown' }
    : quantity === 0 ? { label: `${name} · empty (0)`, kind: 'stock-empty' }
    : { label: `${name} · ${quantity} recorded`, kind: 'stock-recorded' };
});
const join = 'FROM ingredients AS i\nLEFT JOIN stock AS s ON i.id = s.ingredient_id';
const exercises = {
  guided: {
    instruction: 'Try together: return every ingredient name and its stock quantity, including ingredients without a stock record. Insert LEFT JOIN before stock. Do not add a quantity filter.',
    starter: 'SELECT i.name, s.quantity\nFROM ingredients AS i\n stock AS s ON i.id = s.ingredient_id;',
    slots: [{ after: 'FROM ingredients AS i\n', label: 'Join type that keeps every ingredient' }],
    solution: `SELECT i.name, s.quantity\n${join};`,
    hints: ['The ingredients table must stay on the left, so all its rows remain.', 'Use LEFT JOIN instead of an ordinary JOIN. Missing stock values will be NULL.', `SELECT i.name, s.quantity\n${join};`],
    success: 'All four ingredients remain. Crystal has 8 and Mushroom has 12 recorded. Moonstone has a recorded zero: its shelf is empty. Emberroot has NULL because no stock record matched: its quantity is unknown. Iona can see both gaps without treating them as the same thing.',
  },
  independent: {
    instruction: 'Try yourself: return name and stock quantity only for ingredients with no matching stock record. Use LEFT JOIN, then test s.ingredient_id IS NULL.',
    starter: '', solution: `SELECT i.name, s.quantity\n${join}\nWHERE s.ingredient_id IS NULL;`,
    hints: ['A missing match leaves the right table’s columns NULL.', 'Use IS NULL, not = NULL. A matched ingredient_id identifies an existing stock record, even when its quantity is zero.', `SELECT i.name, s.quantity\n${join}\nWHERE s.ingredient_id IS NULL;`],
    success: 'Emberroot has no matching stock record, so its quantity is unknown. Moonstone is not included: its stock row exists and records zero. Iona marks Emberroot for a physical count instead of assuming it is empty.',
  },
  mastery: {
    instruction: 'Fresh challenge: return ID, name, and stock quantity for every ingredient, in that order. Preserve missing stock as NULL and recorded zero as zero. Do not filter any ingredients out.',
    starter: '', solution: `SELECT i.id, i.name, s.quantity\n${join};`,
    hints: ['Keep ingredients on the left and select three columns.', 'Every ingredient is requested. Leave missing values unknown rather than replacing them with zero.'],
    success: 'Every ingredient now has an ID and name in the audit, whether its stock is positive, zero, or unknown. Iona can distinguish the empty shelf from the uncounted shelf. The records are ready for her to verify before brewing.',
  },
};
export default {
  id: 'empty-shelves', title: 'The empty shelf', place: 'The Storeroom', scene: 'storeroom', speaker: 'IONA', topic: 'LEFT JOIN · NULL',
  brief: 'Keep ingredients visible when stock records are missing.',
  story: 'Iona checks the cupboard before brewing. A recorded zero says the shelf is empty. A missing record says something different: nobody has recorded its quantity. Keep every ingredient in view.',
  teaching: 'LEFT JOIN keeps every row from ingredients, the left table. If stock has no match, its columns become NULL. Zero is a known quantity; NULL is unknown. Test missing matches with s.ingredient_id IS NULL, not = NULL.',
  tables: ['ingredients', 'stock'], relationships: 'ingredients.id → stock.ingredient_id (keep every ingredients row)', requires: 'LEFT', reward: 'Careful Archivist · mastered',
  resultCaption: 'Stock audit · recorded / empty / unknown', sceneTokens: stockTokens,
  ...exercises.guided, exercises,
  tutorial: {
    title: 'Keep missing records visible with LEFT JOIN', question: 'Iona asks: which ingredient has a recorded stock quantity of zero?',
    paragraphs: [
      'An ordinary JOIN keeps matching pairs. That hid Emberroot in the ingredient ledger, because its ID has no stock row. The ingredient itself still exists in the catalog.',
      'LEFT JOIN keeps every row from the table before it. Write FROM ingredients AS i LEFT JOIN stock AS s ON i.id = s.ingredient_id. The aliases and matching rule work as before, but an ingredient survives even when no stock row matches.',
      'For a missing match, SQLite fills the right table’s columns with NULL, meaning missing or unknown. Moonstone has a real stock row with quantity 0. Emberroot has no stock row, so s.quantity and s.ingredient_id are NULL. Neither result changes the physical shelf.',
      'IS NULL tests whether a value is unknown. To find ingredients without a stock record, use WHERE s.ingredient_id IS NULL. Do not use = NULL: equality cannot establish that an unknown value equals something.',
      'A WHERE condition still filters the joined result. WHERE s.quantity = 0 keeps known zeros but excludes missing stock; WHERE s.quantity > 0 keeps positive amounts only. To show every ingredient, leave those filters out. Do not turn NULL into 0: unknown and empty are different facts.',
    ],
    relationshipColumns: ['ingredient ID', 'name', 'stock quantity'], relationshipRows: stockRows,
    example: `SELECT i.name, s.quantity\n${join}\nWHERE s.quantity = 0;`,
    columns: ['name', 'quantity'], exampleRows: data => stockRows(data).filter(row => row[2] === 0).map(row => row.slice(1)),
    annotation: 'Moonstone has a matched stock record whose quantity is zero. Emberroot was preserved by LEFT JOIN, but the WHERE filter excludes its unknown quantity. This example finds known empty stock; it does not find missing stock records.',
    next: 'First preserve every ingredient. Then find the ingredients whose stock records are missing, without confusing them with recorded zero.',
  },
};
