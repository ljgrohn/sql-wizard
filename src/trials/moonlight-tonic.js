export const recipeRows = data => data.recipes.flatMap(([recipeId, recipeName]) => data.recipe_items.filter(row => row[0] === recipeId).flatMap(([, ingredientId, quantity]) => data.ingredients.filter(row => row[0] === ingredientId).map(row => [recipeName, row[1], quantity])));
const joins = 'FROM recipes AS r\nJOIN recipe_items AS ri ON r.id = ri.recipe_id\nJOIN ingredients AS i ON i.id = ri.ingredient_id';
const exercises = {
  guided: {
    instruction: 'Try together: return ingredient name and recipe quantity for Moonlight tonic. Fill both ON conditions: connect the recipe to its entries, then each entry to its ingredient. Use Next guided slot to move between gaps.',
    starter: "SELECT i.name, ri.quantity\nFROM recipes AS r\nJOIN recipe_items AS ri ON \nJOIN ingredients AS i ON \nWHERE r.name = 'Moonlight tonic';",
    slots: [{ after: 'JOIN recipe_items AS ri ON ', label: 'Match r.id with ri.recipe_id' }, { after: 'JOIN ingredients AS i ON ', label: 'Match i.id with ri.ingredient_id' }],
    solution: `SELECT i.name, ri.quantity\n${joins}\nWHERE r.name = 'Moonlight tonic';`,
    hints: ['recipe_items connects a recipe ID with an ingredient ID and the amount required.', 'Use r.id = ri.recipe_id, then i.id = ri.ingredient_id. The two IDs describe different relationships.', `SELECT i.name, ri.quantity\n${joins}\nWHERE r.name = 'Moonlight tonic';`],
    success: 'Moonlight tonic requires Crystal × 2 and Moonstone × 1. The recipe ID found the correct entries; ingredient IDs supplied their names. These are amounts required by the recipe, not quantities on the shelf. Iona records the requirements before checking stock.',
  },
  independent: {
    instruction: 'Try yourself: return ingredient name and recipe quantity for Ember draught, in that order. Write both joins and filter by the recipe name.',
    starter: '', solution: `SELECT i.name, ri.quantity\n${joins}\nWHERE r.name = 'Ember draught';`,
    hints: ['Use the same two relationships, but ask for Ember draught.', "Recipe names are text: put 'Ember draught' in single quotes. Filter r.name, not i.name.", `SELECT i.name, ri.quantity\n${joins}\nWHERE r.name = 'Ember draught';`],
    success: 'Ember draught requires Mushroom × 3 and Emberroot × 1. Changing the recipe condition selects different entries while keeping the same relationships. Iona can read either recipe without guessing ingredient names from IDs.',
  },
  mastery: {
    instruction: 'Fresh challenge: show every recipe entry with recipe name, ingredient name, and required quantity, in that column order. Include both recipes, with one row per entry.',
    starter: '', solution: `SELECT r.name, i.name, ri.quantity\n${joins};`,
    hints: ['Use both joins and select facts from all three tables.', 'Every recipe is requested. Preserve all entries, even when names or quantities repeat.'],
    success: 'Every recipe entry now carries a recipe name, an ingredient name, and its required quantity. Separate entries remain separate rows. The recipe book is readable; Iona still needs the stock check before brewing.',
  },
};
export default {
  id: 'moonlight-tonic', title: 'The moonlight recipe', place: 'Potion Workshop', scene: 'workshop', speaker: 'IONA', topic: 'Three-table JOIN',
  story: 'Iona opens the recipe book. Recipes have names, their entries record ingredient IDs and amounts, and the catalog names the ingredients. Reconnect the three records before touching the cauldron.',
  brief: 'Read a recipe across three related tables.', tables: ['recipes', 'recipe_items', 'ingredients'], requires: 'JOIN', reward: 'Recipe Reader · mastered',
  relationships: 'recipes.id → recipe_items.recipe_id; recipe_items.ingredient_id → ingredients.id',
  teaching: 'recipe_items is a bridge: one row per ingredient entry in a recipe. Join its recipe_id to recipes.id and its ingredient_id to ingredients.id. ri.quantity is required by the recipe, not available stock. Text values use single quotes.',
  resultCaption: 'Recipe requirements · not available stock', ...exercises.guided, exercises,
  tutorial: {
    title: 'Follow two links through a recipe', question: 'Iona asks: which ingredient names appear in each recipe?',
    paragraphs: [
      'You already matched two tables by an ID. A recipe needs two links: recipes records each recipe ID and name; recipe_items records each recipe ID, ingredient ID, and quantity; ingredients records ingredient IDs and names.',
      'Each recipe_items row is one ingredient entry, not a whole recipe. A recipe may have several entries, and one ingredient may be used by several recipes. Keep those entries as separate result rows, even if displayed names repeat.',
      'Start FROM recipes AS r. JOIN recipe_items AS ri ON r.id = ri.recipe_id attaches that recipe’s entries. Then JOIN ingredients AS i ON i.id = ri.ingredient_id adds the ingredient name to each entry. Do not compare a recipe ID with an ingredient ID.',
      'The aliases r, ri, and i are short names for these three tables. A dot chooses a column from one table: r.name is a recipe name, while i.name is an ingredient name. ri.quantity is the amount the recipe requires, not the amount recorded in stock.',
      "SELECT chooses output columns separated by commas. WHERE r.name = 'Moonlight tonic' keeps just that recipe. Text such as 'Moonlight tonic' or 'Ember draught' goes inside single quotes; column names and numeric values do not need them.",
    ],
    relationshipColumns: ['recipe_id', 'ingredient_id', 'required quantity'], relationshipRows: data => data.recipe_items,
    example: `SELECT r.name, i.name\n${joins};`,
    columns: ['name', 'name'], exampleRows: data => recipeRows(data).map(row => row.slice(0, 2)),
    annotation: 'Each recipe entry becomes one row with two names. Moonlight tonic connects to Crystal and Moonstone; Ember draught connects to Mushroom and Emberroot. Both columns are called name unless you give them output aliases. Their order tells you which is the recipe and which is the ingredient.',
    next: 'Now read the required quantities for Moonlight tonic, then reconnect a different recipe yourself.',
  },
};
