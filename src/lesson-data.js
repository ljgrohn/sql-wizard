export const tableInfo = {
  ingredients: { description: 'One row per ingredient. id is its unique identifier.', columns: ['id', 'name', 'glowing', 'potency'] },
  recipes: { description: 'One row per potion recipe. id identifies the recipe.', columns: ['id', 'name'] },
  recipe_items: { description: 'One ingredient per recipe entry. recipe_id → recipes.id; ingredient_id → ingredients.id.', columns: ['recipe_id', 'ingredient_id', 'quantity'] },
  stock: { description: 'One recorded stock quantity per ingredient. ingredient_id → ingredients.id. Missing records are unknown, not zero.', columns: ['ingredient_id', 'quantity'] },
};

export function fixture(variant = 0) {
  if (variant === 1) return {
    ingredients: [[11, 'Azure shard', 1, 7], [12, 'Night pearl', 1, 3], [13, 'Bitter cap', 0, 9], [14, 'Sun root', 0, 7], [15, 'Star glass', 1, 12]],
    recipes: [[9, 'Moonlight tonic'], [10, 'Ember draught']],
    recipe_items: [[9, 11, 4], [9, 13, 2], [9, 15, 1], [10, 14, 2]],
    stock: [[11, 0], [13, 8], [14, 3]],
  };
  if (variant === 2) return {
    ingredients: [[21, 'Crystal', 1, 6], [22, 'Crystal', 1, 9], [23, 'Moss', 0, 0], [24, 'Moonstone', 1, 7]],
    recipes: [[6, 'Moonlight tonic'], [7, 'Ember draught']],
    recipe_items: [[6, 21, 2], [6, 22, 2], [7, 23, 3]],
    stock: [[21, 5], [22, 0], [24, 9]],
  };
  return {
    ingredients: [[1, 'Crystal', 1, 8], [2, 'Moonstone', 1, 5], [3, 'Mushroom', 0, 2], [4, 'Emberroot', 0, 7]],
    recipes: [[1, 'Moonlight tonic'], [2, 'Ember draught']],
    recipe_items: [[1, 1, 2], [1, 2, 1], [2, 3, 3], [2, 4, 1]],
    stock: [[1, 8], [2, 0], [3, 12]],
  };
}
