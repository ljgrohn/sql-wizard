import { createDatabase, executeQuery, keywords, sameResult } from './query-engine.js';

const stockJoin = 'FROM ingredients AS i\nJOIN stock AS s ON i.id = s.ingredient_id';
const fullStockJoin = 'FROM ingredients AS i\nLEFT JOIN stock AS s ON i.id = s.ingredient_id';
const recipeJoin = 'FROM recipes AS r\nJOIN recipe_items AS ri ON r.id = ri.recipe_id\nJOIN ingredients AS i ON i.id = ri.ingredient_id';

// Crafting rewards are story inventory. Queries only read the practice catalog;
// crafting never changes the SQL fixtures or claims that recipe stock was spent.
const problem = (lessonId, slug, title, kind, story, instruction, solution, hints, options = {}) => ({
  id: `${lessonId}-${slug}`, lessonId, title, story, instruction, starter: '',
  solution, expectedSql: solution, hints: [...hints, solution],
  tables: ['ingredients'], ...options,
  success: `${title} crafted. ${options.explanation || 'Your answer holds up when the catalog changes, too.'}`,
  reward: { id: slug, name: title, kind, description: story },
});

export const practiceByLesson = {
  'first-spark': [
    problem('first-spark', 'catalog-spark', 'Catalog Spark', 'spell',
      'Quill needs a reading light that reveals the strength written beside every jar.',
      'Return name and potency for every ingredient, in that column order. Keep every row.',
      'SELECT name, potency FROM ingredients;',
      ['SELECT chooses the facts to show; FROM chooses their table.', 'Separate name and potency with a comma.']),
    problem('first-spark', 'glimmer-ink', 'Glimmer Ink', 'potion',
      'A bottle of practice ink will copy each label and its glow mark into your field journal.',
      'Return name and glowing for every ingredient, in that column order. Include glowing and non-glowing ingredients.',
      'SELECT name, glowing FROM ingredients;',
      ['The glowing column is a fact to display here, not a filter.', 'Read both requested columns from ingredients.']),
    problem('first-spark', 'survey-charm', 'Survey Charm', 'charm',
      'The archive shutters rattle. Bind a charm to the numbered jars so their readings cannot be confused.',
      'Return id, potency, and glowing for every ingredient, in that column order.',
      'SELECT id, potency, glowing FROM ingredients;',
      ['Choose three columns from the same table.', 'Put the unique identifier first, then strength, then glow.']),
  ],
  'light-the-ward': [
    problem('light-the-ward', 'lantern-wisp', 'Lantern Wisp', 'spell',
      'A small wisp will guide the younger apprentices through the dark archive aisles.',
      'Return name and potency for ingredients whose glowing value is 1, in that column order.',
      'SELECT name, potency FROM ingredients WHERE glowing = 1;',
      ['Show two columns, but filter on a third.', 'Use WHERE glowing = 1 to keep the light-bearing ingredients.']),
    problem('light-the-ward', 'quiet-ink', 'Quiet Ink', 'potion',
      'Quill needs ink that will not shine through a folded message to the gatekeeper.',
      'Return id, name, and potency for ingredients whose glowing value is 0, in that column order.',
      'SELECT id, name, potency FROM ingredients WHERE glowing = 0;',
      ['Non-glowing is recorded as 0.', 'The WHERE condition chooses rows; SELECT still chooses three columns.']),
    problem('light-the-ward', 'sevenfold-seal', 'Sevenfold Seal', 'charm',
      'The practice cabinet has a delicate seal calibrated to exactly seven units of strength.',
      'Return name and glowing for ingredients with potency exactly 7, in that column order.',
      'SELECT name, glowing FROM ingredients WHERE potency = 7;',
      ['Equality works on potency as well as glowing.', 'Exactly 7 means potency = 7.']),
  ],
  'potent-ingredients': [
    problem('potent-ingredients', 'softstep-tonic', 'Softstep Tonic', 'potion',
      'Iona wants a gentle practice brew for crossing the herbarium without waking the seed sprites.',
      'Return name and potency for ingredients with potency at most 7, in that column order.',
      'SELECT name, potency FROM ingredients WHERE potency <= 7;',
      ['At most includes the boundary value.', 'Use <= to include 7 and everything below it.']),
    problem('potent-ingredients', 'brightburst', 'Brightburst', 'spell',
      'A signal above the greenhouse must use ingredients stronger than the ordinary seven-strength ward.',
      'Return id, name, and potency for ingredients with potency strictly greater than 7, in that column order.',
      'SELECT id, name, potency FROM ingredients WHERE potency > 7;',
      ['Strictly greater excludes exactly 7.', 'The requested comparison is >, not >=.']),
    problem('potent-ingredients', 'dew-vial', 'Dew Vial', 'potion',
      'The herbarium keeper asks you to identify the mildest supplies for a dew-catching vial.',
      'Return name and potency for ingredients with potency below 5, in that column order.',
      'SELECT name, potency FROM ingredients WHERE potency < 5;',
      ['Below 5 excludes 5 itself.', 'An empty answer on a changed catalog can be correct; keep the requested condition.']),
  ],
  'steady-flame': [
    problem('steady-flame', 'nightlight', 'Nightlight', 'spell',
      'A frightened seed sprite needs a soft light rather than the ward’s fierce flame.',
      'Return name and potency for ingredients that glow AND have potency below 7, in that column order.',
      'SELECT name, potency FROM ingredients WHERE glowing = 1 AND potency < 7;',
      ['Both requirements must hold for the same ingredient.', 'Connect glowing = 1 and potency < 7 with AND.'], { requires: 'AND' }),
    problem('steady-flame', 'hush-draught', 'Hush Draught', 'potion',
      'Iona prepares a quiet exercise: choose gentle ingredients that will not light up the cauldron.',
      'Return id and name for ingredients that do not glow AND have potency below 7, in that column order.',
      'SELECT id, name FROM ingredients WHERE glowing = 0 AND potency < 7;',
      ['Non-glowing means glowing = 0; gentle here means potency < 7.', 'AND keeps only rows that satisfy both conditions.'], { requires: 'AND' }),
    problem('steady-flame', 'measured-flame', 'Measured Flame', 'spell',
      'Quill marks a safe strength band for the practice brazier: seven through eight, including both edges.',
      'Return name and potency for ingredients with potency at least 7 AND at most 8, in that column order.',
      'SELECT name, potency FROM ingredients WHERE potency >= 7 AND potency <= 8;',
      ['You can compare the same column twice.', 'Use >= for the lower edge and <= for the upper edge, joined by AND.'], { requires: 'AND' }),
  ],
  'ingredient-ledger': [
    problem('ingredient-ledger', 'shelf-lantern', 'Shelf Lantern', 'charm',
      'The workshop lantern needs labels for glowing ingredients with a recorded stock entry.',
      'Use JOIN to return ingredient name and recorded stock quantity for glowing ingredients, in that order. Include recorded zero; omit ingredients without a matching stock row.',
      `SELECT i.name, s.quantity\n${stockJoin}\nWHERE i.glowing = 1;`,
      ['Match i.id with s.ingredient_id before checking glowing.', 'Filter i.glowing, not stock quantity. A zero is still a stock record.'],
      { requires: 'JOIN', tables: ['ingredients', 'stock'] }),
    problem('ingredient-ledger', 'reserve-tonic', 'Reserve Tonic', 'potion',
      'Iona marks well-stocked ingredients for tomorrow’s practice session.',
      'Use JOIN to return ingredient name and recorded stock quantity where stock quantity is at least 8, in that order.',
      `SELECT i.name, s.quantity\n${stockJoin}\nWHERE s.quantity >= 8;`,
      ['The threshold applies to s.quantity, not potency.', 'Connect ingredients and stock using their ingredient IDs.'],
      { requires: 'JOIN', tables: ['ingredients', 'stock'] }),
    problem('ingredient-ledger', 'ember-index', 'Ember Index', 'spell',
      'Quill asks for the strength written beside each non-glowing jar with a ledger entry.',
      'Use JOIN to return ingredient name, potency, and recorded stock quantity for non-glowing ingredients, in that order.',
      `SELECT i.name, i.potency, s.quantity\n${stockJoin}\nWHERE i.glowing = 0;`,
      ['Name and potency come from ingredients; quantity comes from stock.', 'Keep matching rows where i.glowing = 0.'],
      { requires: 'JOIN', tables: ['ingredients', 'stock'] }),
  ],
  'moonlight-tonic': [
    problem('moonlight-tonic', 'moon-matrix', 'Moon Matrix', 'charm',
      'Iona wants a moonlight recipe card that identifies ingredients even when two jars share a name.',
      'Join recipes, recipe_items, and ingredients. For Moonlight tonic, return ingredient id, ingredient name, and required recipe quantity, in that order.',
      `SELECT i.id, i.name, ri.quantity\n${recipeJoin}\nWHERE r.name = 'Moonlight tonic';`,
      ['Follow the recipe ID to its entries, then each ingredient ID to the catalog.', 'Use r.name for the recipe filter; ri.quantity is the required amount.'],
      { requires: 'JOIN', tables: ['recipes', 'recipe_items', 'ingredients'] }),
    problem('moonlight-tonic', 'ember-brew', 'Ember Brew', 'potion',
      'The cauldron’s practice run needs a strength reading for each Ember draught ingredient.',
      'Join all three recipe tables. For Ember draught, return ingredient name, potency, and required recipe quantity, in that order.',
      `SELECT i.name, i.potency, ri.quantity\n${recipeJoin}\nWHERE r.name = 'Ember draught';`,
      ['Potency belongs to ingredients, while required quantity belongs to recipe_items.', "Filter with r.name = 'Ember draught' after both joins."],
      { requires: 'JOIN', tables: ['recipes', 'recipe_items', 'ingredients'] }),
    problem('moonlight-tonic', 'double-measure', 'Double Measure', 'spell',
      'Quill marks recipe entries that require more than a single measure for the next workshop.',
      'Across every recipe, return recipe name, ingredient name, and required quantity for entries requiring at least 2 measures, in that order. Keep separate entries as separate rows.',
      `SELECT r.name, i.name, ri.quantity\n${recipeJoin}\nWHERE ri.quantity >= 2;`,
      ['Use both joins so each entry has its recipe and ingredient names.', 'Filter ri.quantity >= 2; do not combine or deduplicate entries.'],
      { requires: 'JOIN', tables: ['recipes', 'recipe_items', 'ingredients'] }),
  ],
  'empty-shelves': [
    problem('empty-shelves', 'honest-ledger', 'Honest Ledger', 'charm',
      'Iona’s final audit needs each jar’s strength beside its stock reading, including unknown stock.',
      'Use LEFT JOIN to return ingredient name, potency, and stock quantity for every ingredient, in that order. Preserve missing quantities as NULL.',
      `SELECT i.name, i.potency, s.quantity\n${fullStockJoin};`,
      ['Start with ingredients on the left so every ingredient remains.', 'A missing stock match stays NULL; do not replace it with zero.'],
      { requires: 'LEFT', tables: ['ingredients', 'stock'] }),
    problem('empty-shelves', 'empty-vial-beacon', 'Empty Vial Beacon', 'spell',
      'A beacon marks shelves that are known to be empty so the next apprentice can refill them.',
      'Use LEFT JOIN to return ingredient id, name, and stock quantity only where the recorded stock quantity equals 0, in that order. Do not include missing records.',
      `SELECT i.id, i.name, s.quantity\n${fullStockJoin}\nWHERE s.quantity = 0;`,
      ['Known empty means quantity = 0, not IS NULL.', 'LEFT JOIN preserves missing matches first; the zero filter then excludes them.'],
      { requires: 'LEFT', tables: ['ingredients', 'stock'] }),
    problem('empty-shelves', 'uncounted-stars', 'Uncounted Stars', 'potion',
      'Before the academy celebrates, Iona sets aside a practice vial for every ingredient still awaiting a count.',
      'Use LEFT JOIN to return ingredient id, name, and potency only for ingredients with no matching stock record, in that order.',
      `SELECT i.id, i.name, i.potency\n${fullStockJoin}\nWHERE s.ingredient_id IS NULL;`,
      ['Test the right-hand ingredient ID for a missing match.', 'Use IS NULL, not = NULL. A recorded zero is a matching record.'],
      { requires: 'LEFT', tables: ['ingredients', 'stock'] }),
  ],
};

export const practiceProblems = Object.values(practiceByLesson).flat();
export const getPracticeProblem = id => practiceProblems.find(item => item.id === id);

export function evaluatePractice(SQL, problemId, sql) {
  const task = getPracticeProblem(problemId);
  if (!task) throw new Error('This practice problem could not be found.');
  let result;
  let correct = true;
  let visibleMatch = false;
  for (let variant = 0; variant < 3; variant++) {
    const db = createDatabase(SQL, variant);
    try {
      const actual = executeQuery(db, sql);
      const expected = executeQuery(db, task.expectedSql);
      const match = sameResult(actual, expected);
      if (variant === 0) { result = actual; visibleMatch = match; }
      correct &&= match;
    } finally { db.close(); }
  }
  const usesConcept = !task.requires || keywords(sql).includes(task.requires);
  let message = 'The craft needs another adjustment. Check the requested columns, conditions, and table relationships.';
  if (visibleMatch && !correct) message = 'This fits today’s shelves, but not a changed catalog. Use the requested conditions and relationships instead of fixed answers.';
  if (correct && !usesConcept) message = `The result is right. Practice using ${task.requires === 'LEFT' ? 'LEFT JOIN' : task.requires} to complete this craft.`;
  if (correct && usesConcept) message = task.success;
  return { result, correct: correct && usesConcept, message };
}
