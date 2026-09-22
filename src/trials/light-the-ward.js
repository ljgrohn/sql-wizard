export default {
  "id": "light-the-ward",
  "title": "Light the ward",
  "place": "The Archive",
  "topic": "WHERE",
  "brief": "Find the ingredients that carry their own light.",
  "story": "Well read, apprentice. The ward needs ingredients that glow. Summon only those, and leave the ordinary ingredients on their shelves.",
  "instruction": "Return name for ingredients where glowing is 1. A value of 0 means the ingredient does not glow.",
  "teaching": "WHERE keeps only rows that match a condition. SELECT still controls which columns appear in the result.",
  "starter": "SELECT name\nFROM ingredients\nWHERE ___;",
  "solution": "SELECT name FROM ingredients WHERE glowing = 1;",
  "tables": [
    "ingredients"
  ],
  "hints": [
    "Look at the glowing column: 1 means yes, 0 means no.",
    "Use glowing = 1 as your condition.",
    "SELECT name\nFROM ingredients\nWHERE glowing = 1;"
  ],
  "success": "Crystal and moonstone rise. A little light returns to the ward.",
  "reward": "Lightkeeper"
};
