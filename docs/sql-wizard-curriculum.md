# SQL Wizard — curriculum proposal

Status: reviewed direction; proceeding with the narrative and a small playable foundation. See `sql-wizard-story-and-build.md` for the campaign mapping and implementation milestones.

## Goal and boundaries

Teach a beginner to independently turn a question into a correct, readable SQL query against an existing relational database. Graduates should be able to inspect unfamiliar tables, filter and sort rows, combine tables, summarize data, and break a complex question into subqueries and CTEs.

The game is SQL Wizard. The selected visual direction is the 1980s B EGA artwork with the 1980s A flat black panels and drawn white borders. Reference: `output/mockups/sql-wizard-decades/1980s-mixed-ega-drawn-boxes.png`.

Queries operate on prepared datasets. Exclude database creation, schema migrations, administration, permissions, backups, indexes, query-plan tuning, and data-changing commands such as INSERT, UPDATE, DELETE, and DROP. Explain keys and relationships only as needed to query correctly.

Use one SQL dialect consistently. The first build uses SQLite through SQL.js in the browser. Explicitly teach any dialect-specific syntax for row limits, text matching, dates, concatenation, and casting. Do not mix syntax from different engines in examples.

## Completion outcome

Given an unfamiliar dataset and a plain-language question, the learner can:

- Identify the relevant tables, columns, relationships, and what one row represents.
- State what each output row should represent and choose appropriate columns.
- Apply filters, ordering, calculations, and missing-value handling.
- Join tables without accidentally changing the meaning of the result.
- Aggregate at the requested level and distinguish WHERE from HAVING.
- Use subqueries, EXISTS, and nonrecursive CTEs when useful.
- Validate results and explain how the query answers the question.

## Core campaign

Each chapter introduces a narrow set of concepts and revisits earlier ones. Challenge counts are preliminary content estimates, not fixed production commitments.

### 1. Reading tables and retrieving data

Topics: rows, columns, common data types, table and column names, what one row represents, identifiers and a first glimpse of relationships, SELECT, FROM, SELECT *, choosing specific columns, AS aliases, query formatting, comments.

Outcome: retrieve exactly the requested fields and explain what a returned row means.

Practice: inspect a small table; retrieve names; return two named fields; rename an output column; repair a misspelled column reference.

### 2. Filtering rows

Topics: WHERE; =, <>, <, <=, >, >=; quoted string literals versus numeric values; AND, OR, NOT; parentheses and boolean precedence.

Outcome: translate a plain-language condition into an accurate row filter.

Practice: match a category; apply a numeric threshold; combine two requirements; fix a filter whose OR admits unintended rows.

### 3. Useful matching patterns

Topics: IN, BETWEEN and its inclusive endpoints, LIKE, % and _ wildcards; dialect-specific case sensitivity.

Outcome: express membership, ranges, and simple text patterns without excessive repeated conditions.

Practice: select from several categories; find a prefix; include boundary values correctly; distinguish a single-character wildcard from a variable-length one.

### 4. Missing values

Topics: NULL, IS NULL, IS NOT NULL; NULL versus zero or empty text; comparisons involving NULL; COALESCE.

Outcome: deliberately include, exclude, or display missing information.

Practice: find unknown values; fix = NULL; show fallback text; explain why an ordinary comparison did not include a missing value.

### 5. Sorting, limiting, and distinct values

Topics: ORDER BY, ASC, DESC, multiple sort keys, dialect-appropriate row limiting, DISTINCT, ties and deterministic ordering.

Outcome: produce a meaningful ranked or unique result without relying on incidental row order.

Practice: list the highest values; break ties with a second column; return distinct combinations of two fields; distinguish unique values from the first few rows.

### 6. Calculated fields and conditional results

Topics: arithmetic, expression aliases, CASE WHEN, COALESCE revisited, basic CAST, rounding, common text and date functions supported by the chosen engine.

Outcome: derive useful answers from stored values, including readable labels and date-based filters.

Practice: calculate a total; classify rows into categories; normalize text; query a date interval; avoid integer-division surprises and handle a zero denominator with CASE or NULLIF.

Keep the function list small. Teach how to consult the in-game function reference rather than memorizing a large catalog.

### 7. Summarizing a table

Topics: COUNT(*), COUNT(column), COUNT(DISTINCT column), SUM, AVG, MIN, MAX; aggregates and NULL; filtering before aggregation.

Outcome: return an accurate overall summary and choose the right aggregate for the question.

Practice: count rows versus known values; count unique entities; find a filtered average; explain the result of counting an empty selection.

### 8. Grouping and filtering summaries

Topics: GROUP BY, multiple grouping columns, HAVING, WHERE versus HAVING, ordering aggregated results, valid grouped select lists.

Outcome: return one row per requested group and filter both inputs and group results correctly.

Practice: totals by category; totals by category and location; include only groups above a threshold; filter a date range before calculating grouped totals.

Clarification: WHERE filters input rows, GROUP BY forms groups, and HAVING filters the resulting groups. They are separate operations, not a single “group by where” feature.

### 9. Relationships and inner joins

Topics: identifiers and foreign-key relationships; one-to-one and one-to-many relationships; INNER JOIN ... ON; table aliases; qualified column names; joining more than two tables; reading a bridge table for a many-to-many relationship.

Outcome: combine related records using the intended keys and predict how many rows a join can produce.

Practice: attach a name to a record; find related records across three tables; fix an incorrect join key; explain repeated names after a one-to-many join.

### 10. Outer joins and missing relationships

Topics: LEFT JOIN, unmatched rows, ON versus WHERE filtering, finding entities with no related records, a simple self-join.

Outcome: preserve entities that lack related data and explain which filters remove them.

Practice: list every entity including those without activity; find missing relationships; repair a LEFT JOIN accidentally narrowed by a WHERE condition; match a person to a mentor using aliases of the same table.

RIGHT JOIN and FULL OUTER JOIN are reference material or optional exercises if supported by the chosen engine. CROSS JOIN appears as a short cardinality demonstration and an optional intentional-combinations puzzle.

### 11. Aggregating joined data safely

Topics: result grain, join fan-out, COUNT(*) versus counting a matched identifier after a LEFT JOIN, choosing grouping keys, pre-aggregation as a strategy introduced here and implemented with CTEs later.

Outcome: summarize joined data without double-counting or merging unrelated entities with the same display name.

Practice: counts per entity including zero; totals across a bridge table; diagnose inflated totals from two one-to-many joins; explain why DISTINCT is not a universal repair.

This chapter is required. Correct syntax alone is insufficient evidence of correct joins.

### 12. Subqueries and existence tests

Topics: scalar subqueries, IN (SELECT ...), EXISTS, NOT EXISTS, a simple correlated subquery, derived tables with aliases, NULL pitfalls with NOT IN.

Outcome: use one query to answer a question needed by another query.

Practice: find values above the overall average; find entities with qualifying related rows; find those with none; compare a join solution and an EXISTS solution.

### 13. Common table expressions

Topics: WITH, named intermediate results, multiple CTEs, referring to an earlier CTE, readable step-by-step query construction, aggregate first and then join.

Outcome: break a multi-step question into understandable parts and inspect intermediate answers.

Practice: rewrite a nested query as a CTE; calculate totals then filter them; combine independently summarized tables without fan-out; complete a multi-CTE query from a blank editor.

Teach CTEs as query-scoped named results, not permanent tables or an automatic performance improvement. Recursive CTEs are outside the core campaign.

### 14. Combining result sets and final assessment

Topics: UNION ALL versus UNION, compatible column shapes, result-set duplicates; mixed application of the full curriculum.

Outcome: combine comparable records from different sources and solve a new reporting question independently.

Practice: merge two compatible lists while intentionally retaining or removing duplicates. Optional reference material: INTERSECT and EXCEPT where supported.

Final assessment uses a new prepared dataset with a browsable schema and no solution template. Tasks cover filtering and sorting, a join with missing relationships, grouped summaries with WHERE and HAVING, and a multi-step CTE query. At least one task contains duplicate display names and one contains an entity with no matches.

## Optional advanced practice

Unlock after the core campaign rather than making these prerequisites for basic querying.

- Window functions: OVER, PARTITION BY, ROW_NUMBER, RANK, DENSE_RANK, running totals, LAG. Explicitly contrast preserving rows with collapsing them using GROUP BY.
- Additional set operations, outer joins, and intentional CROSS JOIN combinations.
- Harder conditional aggregation with SUM(CASE ...) and COUNT(CASE ...).
- More involved date reporting, correlated subqueries, and CTE pipelines.
- Recursive CTEs only as a later expansion if learners want hierarchy traversal.

## Learning loop

Each concept follows a repeatable sequence:

1. Observe a tiny dataset and predict what should be returned.
2. Read a short explanation and run one worked example.
3. Complete a partly written query.
4. Write a query independently against changed data.
5. Diagnose a plausible mistake or explain the result.
6. Revisit the concept in a later mixed challenge.

Aim for most challenges to fit a short session, with roughly four to six challenges per chapter and additional mixed checkpoints. Prototype the timing with beginners before making learning-speed claims. Spread longer chapters across small lessons, introducing one difficult idea at a time.

Hints progress from a conceptual nudge to the relevant schema or operator, then a partial query, then a worked explanation. After seeing a solution, the learner gets a fresh unassisted variant before the concept is marked mastered. Do not equate rapid typing or short SQL with understanding.

No timer during query writing. Unlimited retries. Errors should be useful feedback rather than a lost life. An optional score can reward independent completion and mastery, without blocking progress because a learner needed help.

## Feedback and correctness requirements

- Display the source tables, query, actual result, and desired outcome in distinct areas.
- Highlight returned records or related game objects after execution.
- Provide a schema browser with columns, types, sample rows, and relationship lines.
- Introduce the teaching model FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT progressively. Explain that it is a reasoning model, not a promise about physical execution.
- Show intermediate results for difficult joins, aggregates, and CTEs.
- Differentiate syntax errors, missing tables or columns, and valid queries that answer the wrong question.
- Accept equivalent correct queries instead of requiring an exact SQL string.
- Check duplicate multiplicity and NULL values, and check row order only when ordering is part of the task. Require aliases or specific constructs only when they are explicit learning objectives.
- For independent challenges, validate against additional prepared datasets to catch hard-coded answers. Include boundary values, ties, missing values, duplicate names, and missing relationships where relevant.
- Check construct-specific objectives separately from result correctness: for example, a CTE lesson can require a CTE while accepting many valid CTE solutions.
- Limit the execution environment to read-only lesson data, with a resettable dataset and query time/result limits. Learners should never need to manage a database.

## Narrative design brief — next phase

The curriculum has been reviewed. The initial apprentice-to-wizard progression and chapter mapping now live in `sql-wizard-story-and-build.md`.

For every chapter, define a learning objective, story motivation, world interaction, visible result, practice variation, and mastery challenge. SQL should solve a problem in the world; avoid story actions that misleadingly imply SELECT modifies stored records. A returned result can drive a spell animation or game event without changing the meaning of the SQL operation.

Narrative deliverables: premise, tutor and supporting cast, academy locations, chapter beats, recurring conflict, reward/progression system, opening tutorial, example mission scripts, and a final trial that integrates the curriculum.

## Proposed delivery sequence

1. Review the curriculum: confirm core/optional boundaries, intended learner level, and whether any topics are missing.
2. Write the narrative and chapter-to-game mapping against the approved curriculum.
3. Choose the SQL engine and implementation architecture; specify supported syntax and validation rules.
4. Build a small playable vertical slice covering SELECT, WHERE, and a LEFT JOIN challenge to test both onboarding and relationship visualization.
5. Test with beginners, refine feedback and pacing, and then expand the campaign.
6. Implement mixed assessments, optional advanced practice, accessibility, and release checks.

## Decisions for curriculum review

- Proposed audience: beginners starting with no SQL knowledge; returning learners can use a placement challenge.
- Proposed core scope: all fourteen chapters, including nonrecursive CTEs.
- Proposed optional scope: window functions and more advanced query patterns.
- Selected language: SQLite, using SQL.js in a browser worker for minimal static Vercel hosting.
- Proposed progression: scaffolded teaching followed by independent and mixed practice; no typing timer.
