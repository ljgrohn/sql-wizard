# SQL Wizard — next steps after the first playtest

Status: implementation plan, not completed changes. This supersedes the immediate next steps in the initial build plan. Preserve the EGA artwork, drawn window borders, and static Vercel architecture.

## Priority 1: teach before asking

The current build introduces the problem before reliably teaching the tools to solve it. Fix that before adding more curriculum.

Make the spellbook the home of instruction, with a short lesson page automatically offered the first time a trial opens. Keep a clearly labeled “Review this spell” action beside the editor. Hints are support after teaching, not the primary teaching mechanism.

Each trial follows this sequence:

1. **Learn:** explain the new idea in plain language. Introduce every new keyword, identifier, and operator before asking the learner to type it.
2. **See:** show a small annotated example and its actual result. Use a different question from the assessed challenge so copying is not the only activity.
3. **Try together:** offer a guided query with an obvious insertion point and explain how it maps to the source table.
4. **Try yourself:** pose a nearby problem with less scaffolding after a successful guided attempt.
5. **Understand:** show why rows were included or excluded, then connect the result to the scene.

Returning learners can explicitly skip the explanation. Beginners should never land in a blank editor before seeing the relevant syntax. Do not require opening collapsed field notes to discover essential instructions.

Acceptance:

- A new learner encounters the SELECT/FROM explanation and example before their first challenge.
- The potency lesson explains comparison operators before an independent attempt.
- Joins first explain IDs, matching rows, and aliases; introduce a two-table join before a three-table recipe query.
- The spellbook remembers learned concepts and remains accessible during every trial.
- Completion after viewing a full solution is labeled guided. A fresh unassisted variant is required for mastery; page reloads must not discard the assistance state.

## Priority 2: clarify potency versus glowing

The screenshot’s SQL is correct for the existing data:

```sql
SELECT name
FROM ingredients
WHERE glowing = 1
  AND potency > 6;
```

Crystal has glowing = 1 and potency = 8. Emberroot has glowing = 0 and potency = 7, so the AND condition excludes it. Do not change SQL evaluation or hard-code the result to include Emberroot.

Proposed lesson revision: separate comparison operators from combining conditions.

- **Potency trial:** “Find ingredients with potency of at least 7.” `WHERE potency >= 7` returns **Crystal and Emberroot** in the visible catalog.
- **Following AND trial:** “From the strong ingredients, keep only those that also glow.” `WHERE potency >= 7 AND glowing = 1` returns **Crystal**.

Keep the existing ingredient facts. The contrast becomes a useful lesson: show both rows for the first condition, then visibly exclude Emberroot when the second condition is applied.

For the current integer potency data, `> 6` and `>= 7` produce equivalent results and should both pass the potency trial. Teach `>= 7` as the direct expression of “at least 7”; do not claim those expressions are equivalent for arbitrary decimal values.

Acceptance: instructions, source data, example results, success dialogue, scene objects, and changed-dataset validation agree for both trials.

## Priority 3: editor that helps the learner

Implement these together as one shared editor change, rather than patching each trial separately.

### Replace underscore placeholders

- Remove literal `___` markers from executable starter SQL.
- Give guided starters an explicit insertion position, with ghost guidance or a labeled editable slot that is not SQL text.
- Put the caret at the intended insertion position when beginning or resetting a guided exercise; any selected starter token is replaced by typing.
- If a guided exercise has multiple slots, offer a visible next-slot control. Do not silently reinterpret ordinary indentation keys.
- Never submit instructional placeholder text to SQLite. If a required guided field is empty, explain what to fill in before casting.
- Preserve actual query whitespace, indentation, and drafts. This request is about removing scaffold markers, not deleting intentional spaces from the learner’s SQL.

### Tabs and syntax highlighting

- Use a maintained SQL-aware editor component; select the small dependency and configure SQLite support during implementation.
- Tab inserts two spaces at the caret or indents selected lines. Shift+Tab outdents.
- Enter preserves useful indentation; undo/redo and multiline paste work normally.
- Highlight SQL keywords, strings, numbers, and comments using the EGA palette, while keeping adequate contrast and readable text.
- Preserve Ctrl/Command+Enter for casting.
- Provide a documented keyboard escape from indentation mode, such as Escape then Tab, so keyboard users can leave the editor. Do not create a keyboard trap.
- Avoid giving away complete answers through aggressive autocomplete in independent challenges.

### Correct the focus outline

- Use one focus indicator attached to the editor’s actual outer frame, including its gutter.
- Remove the offset native textarea ring only once the replacement focus indicator is present.
- Ensure the focus indicator tracks editor resize, scroll, line wrapping, browser zoom, and narrow screens.
- Keep the focused state visible; do not solve the misalignment by hiding focus styling.

Acceptance: a learner can enter the first guided answer without deleting markers, format a multiline query with Tab, see correct syntax colors, cast by keyboard, and move focus out of the editor. The outline aligns with the frame at desktop and mobile widths.

## Priority 4: meaningful scene variation

Keep the selected 1980s EGA palette and drawn UI boxes. Use distinct scene compositions plus lightweight state changes; do not generate a new background for every query.

| Location | Trials | Visible variation |
| --- | --- | --- |
| Archive | Reading the catalog; glowing ingredients | Dim archive at arrival; catalog labels appear; returned glowing objects rise and light the ward |
| Herbarium | Potency; combined conditions | Ingredient trays and a potency-testing station; Crystal and Emberroot are shown for the potency query, then only Crystal for the AND query |
| Potion workshop | Two-table join; full recipe | Recipe book, named jars, measuring tools, and cauldron; matched entries become labeled recipe ingredients with their quantities |
| Storeroom | LEFT JOIN | Shelves display recorded stock, an explicit zero-stock item, and an unknown stock record distinctly |

Later chapters add the creature sanctuary and alchemy observatory already described in the story plan.

- Tie highlighted objects and counts to the actual returned data, not a fixed three-symbol animation.
- Keep foreground objects and effects separate from the background so scene state can change without replacing the entire image.
- Correct results advance the relevant visual state; failed queries can fizzle without clearing earlier earned story progress.
- Keep text and controls in HTML. Provide text equivalents for visual feedback and respect reduced-motion preferences.
- Explain the story action accurately: SELECT reads records; the wizard uses the answer to choose ingredients or perform an action.

Acceptance: changing between the archive, herbarium, workshop, and storeroom changes the actual artwork, not only a caption. A successful result has a task-specific effect that agrees with the result table.

## Commit plan

The upload preparation initializes Git and records the existing prototype with shared foundations and each of its five trials in separate commits. The sequence below describes the subsequent revised learning experience; its teaching, editor, and scene improvements remain planned work. No existing trial is claimed to include those future improvements.

Keep each commit runnable and narrowly scoped. Separate lesson content into one module per trial so future changes do not mix unrelated trials. Each trial commit includes its teaching page, guided practice, independent task, data requirements, validation cases, story feedback, and scene-state wiring.

| Order | Proposed commit | Scope |
| --- | --- | --- |
| 1 | `chore: establish static game foundation` | Vite/Vercel configuration, shell, SQLite worker, generic evaluation, shared assets, docs, and infrastructure tests. Keep lesson registration extensible and show an honest empty state until trials are registered. |
| 2 | `feat: teach concepts through the spellbook` | Shared learn → example → practice flow, review access, guided-versus-independent progress, and persistence versioning. |
| 3 | `feat: add accessible SQL editor` | Real SQL highlighting, indentation, insertion-point scaffolding, aligned focus frame, keyboard escape, draft persistence, and editor checks. |
| 4 | `feat: add scene locations and result effects` | Reusable scene renderer, archive/herbarium/workshop/storeroom assets, data-driven object highlighting, reduced-motion support, and asset provenance. |
| 5 | `feat: teach SELECT in the first spark trial` | Trial 1: SELECT/FROM, column versus row explanation, guided first query, archive response. |
| 6 | `feat: teach WHERE in the light the ward trial` | Trial 2: equality filters, glowing versus ordinary ingredients, matching-row visualization. |
| 7 | `feat: teach comparisons in the potent ingredients trial` | Trial 3: potency >= 7; visible answer Crystal and Emberroot; boundary-value checks and herbarium feedback. |
| 8 | `feat: teach AND in the steadier flame trial` | Trial 4: intersect two conditions; explain why Emberroot is excluded; independent follow-up. |
| 9 | `feat: introduce joins in the ingredient ledger trial` | Trial 5: one two-table join before a full recipe; teach IDs, aliases, and matching rows. |
| 10 | `feat: connect recipes in the moonlight tonic trial` | Trial 6: build on the earlier join to connect recipes, recipe entries, and ingredients. |
| 11 | `feat: preserve missing stock in the empty shelf trial` | Trial 7: LEFT JOIN, NULL versus zero, all-ingredient stock check and storeroom visualization. |
| 12 | `test: verify the revised apprentice journey` | Cross-trial browser coverage, learning-state persistence, keyboard navigation, mobile/zoom checks, static production build, and final deployment instructions. |

Trial numbers here describe the revised introductory slice, not the fourteen chapters of the full curriculum. The longer curriculum remains intact. Avoid mixing future GROUP BY, breeding, and CTE lessons into these introductory trial commits.

Existing progress needs a versioned migration: keep unaffected trial progress and drafts, but do not reuse the old AND challenge’s completion as proof that the new comparison lesson was completed. Any reassigned or materially changed challenge should be offered for practice again with an explanation.

## Implementation order and completion gate

Start with the teaching flow and editor foundation, then implement the revised trials one at a time. Supply scene assets before the corresponding trial is considered finished. Do not expand into additional curriculum chapters until this onboarding sequence works without guessing syntax.

The revised slice is ready when:

- All six playtest concerns are addressed and verified.
- Each revised trial is its own commit; shared work is grouped as above.
- Each trial teaches its concepts before requiring independent typing.
- The potency-versus-AND distinction is visible and correct.
- Queries, hints, solution assistance, drafts, and progression remain coherent after switching trials or reloading.
- Query-engine tests and the production build pass; browser checks cover success, incorrect answers, editing, accessibility, and scene changes.
- Hosting remains a static Vercel app with browser SQLite and device-local progress.
