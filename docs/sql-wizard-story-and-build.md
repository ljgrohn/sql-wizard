# SQL Wizard — story and first build

Current implementation: 31 playable stages cover the core curriculum, including the sanctuary, observatory, and four expedition transfer assessments. Every stage has illustrated scenes, teaching, guided/independent/recovery problems, and three workshop crafting commissions. See [campaign-coverage.md](campaign-coverage.md) for the live stage map and [next-steps.md](next-steps.md) for remaining human playtesting. The campaign design below remains the narrative reference; the historical prototype and original delivery milestones are retained for context.

## Premise

The ward around the Academy of the Returning Moon is fading. Its knowledge has not disappeared, but it lives in separate catalogs: ingredients, spells, recipes, creatures, habitats, and experiments. The academy needs an apprentice who can connect that knowledge.

Professor Quill, an owl archivist, teaches the player how to ask precise questions of the archive. Every successful query supplies information for a practical act of magic. The long-term goal is to prepare the restoration ritual and restore the academy’s ward.

The tone is curious, warm, and lightly mischievous. Failure makes a spell fizzle and gives useful feedback; it does not punish the learner or injure a creature. No countdown during query entry. The academy is a place to explore and experiment.

## What magic needs joins for

The tables hold different facts because different people recorded them. Joins reconnect those facts using shared identifiers. Show this in the story before introducing SQL syntax.

| Activity | Tables and relationships | Practical question | Learning payoff |
| --- | --- | --- | --- |
| Spell preparation | spells → spell_reagents → ingredients | Which ingredients and quantities does a warding spell require? | Three-table joins and bridge tables |
| Potion recipes | recipes → recipe_items → ingredients; ingredients → stock | What goes into Moonlight tonic, and which required ingredients are missing or insufficient? | INNER JOIN, LEFT JOIN, NULL, calculations |
| Creature care | creatures → species; creatures → care_records | Which creatures have no recorded feeding or health check? | LEFT JOIN, IS NULL, EXISTS / NOT EXISTS |
| Magical creature breeding | creatures → creature_traits → traits; creatures → species; compatibility rules | Which distinct pairs satisfy the sanctuary’s compatibility rules and desired magical traits? | Self-joins, many-to-many relationships, avoiding duplicate or self-pairs |
| Habitat preparation | habitats → residents → creatures | How many creatures live in each habitat, including empty habitats? | GROUP BY after LEFT JOIN; count a matched ID, not COUNT(*) |
| Alchemy | formulas → formula_items → materials; materials → stock | Which formulas can we prepare from the supplies available? | Aggregation, conditional logic, subqueries, CTEs |
| Academy restoration | spell requirements, recipe quantities, stock, expedition discoveries | What must we gather and prepare for the final ritual? | Multi-stage CTEs and a cumulative assessment |

For breeding puzzles, use explicitly fictional, deterministic magical compatibility rules rather than pretending a simple SQL query predicts real genetics. Exclude pairing a creature with itself, represent each unordered pair once, and never advance to a breeding animation until the selected pair meets the care and compatibility rules. A pair-selection query itself only reads the records.

## Campaign structure

### Act I — The first spark: Archive and Herbarium

Quill introduces the ingredient catalog. Read names, find glowing ingredients, and choose a strong enough ingredient to kindle the ward. Explore the herbarium to learn pattern matching, sorting, distinct values, date conditions, and unknown properties.

SQL: curriculum chapters 1–6. Introduce each row’s meaning and IDs immediately.

Checkpoint: find the right supplies from a changed catalog with no starter query.

### Act II — The potion workshop

Meet Iona, the academy’s practical potion maker. Her recipe book lists IDs while the jars have names. Reconnect the records, inspect stock, calculate batch quantities, and summarize orders for the academy.

SQL: curriculum chapters 7–11, with a short preview of a simple join in the first playable slice. The full campaign introduces and practices joins more gradually than the preview.

GROUP BY has a concrete use: calculate total ingredients needed per ingredient or total potion orders per destination. WHERE limits the underlying orders, while HAVING keeps groups whose combined demand exceeds a threshold.

Checkpoint: produce a shopping list that preserves missing stock and does not double-count ingredients shared by recipes.

### Act III — The creature sanctuary

Help keeper Bramble care for moonmoths, ember foxes, and cloud drakes. Find creatures without care records, match their habitat needs, and plan compatible breeding pairs based on magical traits.

SQL: reinforcement of joins, self-joins, grouping, NULL, and chapter 12’s existence tests and subqueries.

Pairing mechanic: inspect both creatures, use their trait records, and apply explicit compatibility criteria. Quill can show how the number of candidate pairs changes at each step. Multiple trait rows must not become multiple copies of the same selected pair.

Checkpoint: return a unique list of compatible, distinct pairs whose care requirements have been met.

### Act IV — The alchemy observatory

Archivist Sable maintains experimental formulas. The challenge is no longer finding one item: the apprentice must calculate requirements, compare them with stock, and identify feasible recipes.

SQL: chapter 13’s CTEs, earlier aggregates and subqueries, then chapter 14’s set operations.

CTE example flow: choose the ritual’s formulas → total required quantities by material → combine with available stock → calculate shortages → report what to gather. Each named step gets a visible intermediate result.

Checkpoint: build a readable multi-CTE plan and explain each intermediate table.

### Act V — The restoration trial

Restore the academy’s ward using a new dataset that brings together spell preparation, potion supplies, and sanctuary protection. The player chooses query structure without a template.

Assess query outcomes and reasoning, not typing speed. Optional post-game observatory trials introduce window functions for ranked experiments, best results within each alchemy school, and running resource totals.

## Original first playable slice — historical scope

Five trials, one illustrated scene, real SQLite queries, progressive hints, result tables, and local progress:

1. The first spark: SELECT ingredient names.
2. Light the ward: WHERE glowing = 1.
3. A steadier flame: two conditions with AND, written from a blank editor.
4. The moonlight recipe: guided three-table JOIN.
5. The empty shelf: LEFT JOIN with missing stock and a recorded zero quantity.

The recipe and empty-shelf trials preview later lessons to test that relational querying can work as a game mechanic. They are accessible from the trial bar so experienced learners can try them directly. They are not a substitute for all of the practice in the full curriculum.

The slice is set in the archive; the location caption changes for the workshop preview, but distinct workshop art and room navigation remain future work. Correct queries trigger a simple summoning effect. Reusable ingredient sprites and richer per-lesson animations also remain future work.

Completion is recorded, not claimed as mastery. Using the worked-example hint is marked in the spellbook. The full curriculum will require a fresh unassisted variant after assisted completion. No locked progression in this prototype.

## Minimal hosting architecture

- Vite with plain JavaScript and CSS; static build in `dist`.
- SQL.js provides SQLite through WebAssembly in the browser. The application ships the WASM file itself.
- A worker runs each query away from the interface. Long queries terminate after eight seconds; output is capped at 200 rows.
- Prepared lesson fixtures are recreated for each evaluation, and SQLite query_only is enabled. Only one SELECT/WITH statement is accepted.
- Query answers are compared as row multisets, preserving duplicates and NULL. Alternate aliases and row order are allowed in these five lessons.
- Additional prepared datasets catch hard-coded answers. These are client-side teaching checks, not tamper-proof exams.
- Progress and query drafts are stored with localStorage. Private browsing or blocked storage may make progress session-only. No account or cross-device sync in this version.
- Vercel serves the static files. No Functions, managed database, environment secrets, or paid integration is needed for this design. Hosting usage remains subject to the account’s plan.
- No client-side path routing yet, so no SPA rewrite is necessary.

Dialect: SQLite. Use SQLite syntax throughout lesson content. Later dates, case-sensitive matching, and casts must be documented with that dialect in mind. The engine supports the core campaign’s nonrecursive CTEs; its exact SQLite version is controlled by the locked SQL.js dependency.

## Delivery milestones

### 1. Playable foundation (this build)

Create the first five trials and test the learning loop end-to-end. Check syntax errors, incorrect answers, alternate correct answers, changed datasets, hints, saved drafts, progression, and a narrow mobile viewport. Prepare a static production build for Vercel.

### 2. Beginner pacing

Have beginners play the first three trials. Observe where they hesitate. Add a brief prediction exercise, explicit column/row selection visuals, and fresh variants for assisted completion. Build the intermediate filtering and sorting lessons before expanding the guided joins into their full chapter.

### 3. Potion chapter

Add workshop art, single-join scaffolding, relationship visualization, recipe quantities, stock comparisons, and grouped orders. Add a joined-aggregation checkpoint with duplicate names and multiple relationships.

### 4. Sanctuary and alchemy

Implement creature traits, compatibility puzzles, missing care records, subqueries, and CTE pipelines. Revisit earlier skills across these domains.

### 5. Release and expansion

Complete the core campaign, add the unfamiliar-data final trial, verify keyboard and reduced-motion access, then add optional window-function practice. Introduce accounts only if cross-device progress becomes a real user need.

## Design source

The scene is generated with the built-in image tool from the selected mixed EGA mockup. The delivered app uses `public/art/archive.png`; its generation prompt is saved alongside this document in `archive-art-prompt.txt`. All panels, text, tables, and controls are native HTML/CSS, not text baked into the image.

Platform references checked during setup:

- https://vercel.com/docs/frameworks/frontend/vite
- https://vite.dev/guide/
- https://sql.js.org/documentation/Database.html
