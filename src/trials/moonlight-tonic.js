export default {
  "id": "moonlight-tonic",
  "title": "The moonlight recipe",
  "place": "Potion Workshop",
  "scene": "workshop",
  "speaker": "IONA",
  "topic": "INNER JOIN",
  "brief": "Reconnect a potion recipe with its ingredient names.",
  "story": "The recipe book records ingredient IDs, but the jars have names. To brew Moonlight tonic, connect the recipe, its entries, and the ingredient catalog.",
  "instruction": "Return ingredient name and recipe quantity for 'Moonlight tonic'. Connect recipes \u2192 recipe_items \u2192 ingredients using their IDs.",
  "teaching": "JOIN connects matching rows. recipe_items is a bridge: each row records one ingredient and its quantity in one recipe. The aliases r, ri, and i are short names for the tables.",
  "starter": "SELECT i.name, ri.quantity\nFROM recipes AS r\nJOIN recipe_items AS ri ON r.id = ri.recipe_id\nJOIN ingredients AS i ON \nWHERE r.name = 'Moonlight tonic';",
  "solution": "SELECT i.name, ri.quantity FROM recipes AS r JOIN recipe_items AS ri ON r.id = ri.recipe_id JOIN ingredients AS i ON i.id = ri.ingredient_id WHERE r.name = 'Moonlight tonic';",
  "tables": [
    "recipes",
    "recipe_items",
    "ingredients"
  ],
  "requires": "JOIN",
  "hints": [
    "The remaining connection is between recipe_items and ingredients.",
    "ri.ingredient_id refers to i.id. Match those two columns in ON.",
    "SELECT i.name, ri.quantity\nFROM recipes AS r\nJOIN recipe_items AS ri ON r.id = ri.recipe_id\nJOIN ingredients AS i ON i.id = ri.ingredient_id\nWHERE r.name = 'Moonlight tonic';"
  ],
  "success": "The recipe is readable again. Your first tonic is ready to brew.",
  "reward": "Recipe Reader",
  "legacyStarter": "SELECT i.name, ri.quantity\nFROM recipes AS r\nJOIN recipe_items AS ri ON r.id = ri.recipe_id\nJOIN ingredients AS i ON ___\nWHERE r.name = 'Moonlight tonic';",
  "slots": [
    {
      "after": "JOIN ingredients AS i ON ",
      "label": "Matching ingredient IDs"
    }
  ]
};
