export default {
  "id": "first-spark",
  "title": "The first spark",
  "place": "The Archive",
  "topic": "SELECT · FROM",
  "brief": "Read the names in the ingredient catalog.",
  "story": "The academy’s ward has gone dark. Before we can kindle it, you must learn to read the archive. A query is how we ask it a question.",
  "instruction": "Return the name of every ingredient. Your result should have one column: name.",
  "teaching": "SELECT chooses the columns you want. FROM names the table to read. Each row in ingredients describes one ingredient; id uniquely identifies it.",
  "starter": "SELECT ___\nFROM ingredients;",
  "solution": "SELECT name FROM ingredients;",
  "tables": [
    "ingredients"
  ],
  "hints": [
    "The column you need is called name.",
    "Replace ___ with the column name. Keep FROM ingredients.",
    "SELECT name\nFROM ingredients;"
  ],
  "success": "The archive answers. You have learned your first incantation.",
  "reward": "First Spark"
};
