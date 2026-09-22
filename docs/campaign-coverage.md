# Playable campaign coverage

The campaign retains the original seven-stage introduction and appends 24 stages. Each has a teaching page, worked example, guided query, blank independent query, a final challenge for every learner, story entry/ending, and three crafting commissions. Total: 31 stages, 93 lesson exercises, and 93 crafting commissions.

## Stage map

| Stage | Lesson | SQL focus | Location |
| --- | --- | --- | --- |
| 1 | The first spark | SELECT · FROM | The Archive |
| 2 | Light the ward | WHERE · = | The Archive |
| 3 | Potent ingredients | Comparisons · >= · < | The Herbarium |
| 4 | A steadier flame | AND · two conditions | The Herbarium |
| 5 | The ingredient ledger | JOIN · ON · aliases | Potion Workshop |
| 6 | The moonlight recipe | Three-table JOIN | Potion Workshop |
| 7 | The empty shelf | LEFT JOIN · NULL | The Storeroom |
| 8 | Labels for the lantern fleet | AS · comments | The Archive |
| 9 | Two ways to carry light | OR · NOT · parentheses | The Herbarium |
| 10 | The seed keeper’s shorthand | IN · BETWEEN · LIKE | The Herbarium |
| 11 | The honest blank | IS NULL · COALESCE | The Workshop |
| 12 | First onto the ferry | ORDER BY · LIMIT | The Workshop |
| 13 | One mark per kind | DISTINCT · tuples | The Archive |
| 14 | Measures for the crossing | Arithmetic · CAST · ROUND | The Workshop |
| 15 | Flags for the dispatch crew | CASE · WHEN · ELSE | The Workshop |
| 16 | Letters from the landing | Text · date functions | The Archive |
| 17 | The whole night’s work | COUNT · SUM · AVG · MIN · MAX | The Archive |
| 18 | A bundle for each landing | GROUP BY · multiple keys | The Workshop |
| 19 | Where the ward needs us most | WHERE · HAVING · aggregate order | The Workshop |
| 20 | The resonance garden | Self JOIN · canonical pairs | The Sanctuary |
| 21 | Room for the quiet ones | LEFT JOIN · grouped counts · zero | The Sanctuary |
| 22 | The ledger that counted twice | Join fanout · aggregate-first derived tables | The Sanctuary |
| 23 | A question inside a question | Scalar subqueries · IN | The Observatory |
| 24 | The unvisited collar | Correlated EXISTS · NOT EXISTS · NULL traps | The Sanctuary |
| 25 | Give the ritual a name | WITH · a single common table expression | The Observatory |
| 26 | The constellation engine | Multiple CTEs · aggregate first, then join | The Observatory |
| 27 | Two bells in the fog | UNION · UNION ALL | The Observatory |
| 28 | The restoration manifest | Transfer assessment · filtering and ordering | The Restoration Camp |
| 29 | The wagon that never arrived | Transfer assessment · relationships and missing records | The Restoration Camp |
| 30 | The council’s shortlist | Transfer assessment · WHERE, GROUP BY, HAVING | The Restoration Camp |
| 31 | The restoration council | Final assessment · independent multi-CTE report | The Restoration Camp |

## Curriculum mapping

- Chapters 1–4: original SELECT/filter introduction plus named-columns, either-or, pattern-matching, unknown-values.
- Chapters 5–6: ordered-shelves, distinct-values, measured-brews, conditional-labels, field-functions.
- Chapters 7–8: aggregate-ledger, grouped-orders, busy-destinations.
- Chapters 9–11: original ledger/recipe/LEFT JOIN introduction plus sanctuary-pairs, habitat-census, tangled-ledgers.
- Chapter 12: above-average and missing-care.
- Chapters 13–14: named-rituals, restoration-pipeline, combined-signals; four expedition transfer assessments.

## Learning and validation

Worked examples and intermediate summaries for the new stages execute in the same read-only SQLite worker as learner queries. Grouping and CTE lessons expose intermediate results in expandable teaching sections. Three fixtures vary IDs, counts, boundaries, duplicate names, missing relationships, dates, and independent child records. Ordered problems validate sequence; explicitly named headings validate column names. Reference answers, common incorrect approaches, progress migration, and all 93 commissions are covered by tests.

The original seven-stage progression and storage version remain compatible. New stages start unlearned. Workshop collections and lesson mastery remain separate. No query changes the fixture or consumes real inventory.

## Remaining work

Human beginner playtests are still needed to assess pacing, retention, and whether multi-concept stages should be split further. Optional window functions, recursive CTEs, INTERSECT/EXCEPT, extra outer joins, and more elaborate creature-trait pairing puzzles remain future expansions. No learning-speed or graduation claims are made from automated checks alone.
