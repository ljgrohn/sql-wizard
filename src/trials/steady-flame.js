export default {
  "id": "steady-flame",
  "title": "A steadier flame",
  "place": "The Archive",
  "topic": "AND · comparisons",
  "brief": "Choose a glowing ingredient strong enough for the ward.",
  "story": "A spark is a beginning, but the ward needs a steady flame. Choose ingredients that both glow and have potency of at least 7.",
  "instruction": "Return name for ingredients with glowing = 1 AND potency >= 7. Try writing the query yourself.",
  "teaching": "AND means both conditions must be true. >= includes the boundary value: potency 7 counts as well as anything higher.",
  "starter": "",
  "solution": "SELECT name FROM ingredients WHERE glowing = 1 AND potency >= 7;",
  "tables": [
    "ingredients"
  ],
  "hints": [
    "Begin with SELECT name FROM ingredients.",
    "Your WHERE needs two conditions joined by AND.",
    "SELECT name\nFROM ingredients\nWHERE glowing = 1 AND potency >= 7;"
  ],
  "success": "The flame holds. The archive door opens onto the potion workshop.",
  "reward": "Steady Hand"
};
