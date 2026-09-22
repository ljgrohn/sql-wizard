export default {
  "id": "empty-shelves",
  "title": "The empty shelf",
  "place": "The Storeroom",
  "scene": "storeroom",
  "speaker": "IONA",
  "topic": "LEFT JOIN \u00b7 NULL",
  "brief": "Inspect every ingredient, even those missing from stock.",
  "story": "Before we brew, check the cupboard. An ordinary join hides ingredients without a stock record. We need to see every ingredient, including the empty shelf.",
  "instruction": "Return every ingredient name and its stock quantity. Keep ingredients without a matching stock record; their quantity should be NULL.",
  "teaching": "LEFT JOIN keeps every row from the table on the left. When the right table has no match, its columns become NULL, meaning missing or unknown. A recorded quantity of 0 is different.",
  "starter": "SELECT i.name, s.quantity\nFROM ingredients AS i\n stock AS s ON i.id = s.ingredient_id;",
  "solution": "SELECT i.name, s.quantity FROM ingredients AS i LEFT JOIN stock AS s ON i.id = s.ingredient_id;",
  "tables": [
    "ingredients",
    "stock"
  ],
  "requires": "LEFT",
  "hints": [
    "An INNER JOIN would keep only ingredients with matching stock rows.",
    "Use LEFT JOIN to preserve every ingredient.",
    "SELECT i.name, s.quantity\nFROM ingredients AS i\nLEFT JOIN stock AS s ON i.id = s.ingredient_id;"
  ],
  "success": "Nothing is hidden now. You have completed the first apprentice trial.",
  "reward": "Apprentice Alchemist",
  "legacyStarter": "SELECT i.name, s.quantity\nFROM ingredients AS i\n___ stock AS s ON i.id = s.ingredient_id;",
  "slots": [
    {
      "after": "FROM ingredients AS i\n",
      "label": "Join type"
    }
  ]
};
