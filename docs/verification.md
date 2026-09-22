# First playable slice — verification

Verified locally on 2026-09-21. This is not a claim of a live Vercel deployment.

## Automated query checks

`npm test`: 14 tests passed. All five reference solutions pass the visible catalog and two changed catalogs. Additional checks cover alternate valid answers, hard-coded output rejection, duplicate/NULL semantics, dropped rows from an incorrect INNER JOIN, output shape, read-only enforcement, multiple-statement rejection, comments/string semicolons, CTE execution, row limits, and malformed SQL.

`npm run build`: static production build passed, including the generated worker and locally bundled SQLite WASM asset.

## Browser checks

Used agent-browser against both Vite development (`127.0.0.1:5173`) and the static production preview (`127.0.0.1:4173`).

- All five trials completed through the query textarea, Cast Spell action, worker evaluation, result table, and Continue action.
- Valid but incorrect answers display corrective feedback; unknown columns display SQL error guidance.
- Recipe source-table tabs switch data and relationship descriptions.
- The potion recipe joins all three tables correctly; the stock query displays both zero and NULL.
- Completion opens the spellbook and updates progress to 5/5.
- Progress and the current draft survive a reload.
- Three hint levels expose a worked example; Reset restores the starter.
- An intentionally nonterminating recursive query times out after eight seconds; the worker is stopped and a subsequent valid query succeeds.
- No browser errors reported for the checked flows.
- At a 390-pixel viewport, page width remains 390 pixels; tables and trial navigation scroll inside their containers.
- Desktop and mobile screenshots were inspected. Local screenshots are in ignored `artifacts/`.

## Remaining product validation

Real beginner playtesting, full keyboard/screen-reader auditing, additional mobile browsers, independent mastery variants, and the rest of the curriculum remain future work. The first five trials reuse one scene and include guided previews of later join concepts.

## Revised first lesson — 2026-09-21

The first trial now offers instruction before typing, a potency example, guided name selection with an insertion point, independent ID selection, and a fresh ID/name challenge after viewing the independent solution. The other four trials retain their prototype flow.

- `npm test`: 18 tests pass, including exercise-specific changed-catalog evaluation, actual example output, progress migration, and assisted-versus-independent completion.
- `npm run build`: static production build passes.
- Browser checks against Vite: automatic teaching page, review, explicit skip, starter caret position, empty-slot feedback, Ctrl+Enter, guided success, independent solution assistance surviving reload, wrong column-order rejection, fresh mastery, mastery persistence, and continuation to trial two.
- Checked the unassisted skip path, desktop teaching page, and 390px mobile layout. No horizontal page overflow or browser errors were observed. Verified mobile casting with a pointer click after explicitly scrolling the Cast button into view.
- Full editor highlighting/indentation and distinct room artwork remain planned; the first trial adds result-derived catalog labels to the existing archive artwork.

## Shared SQL editor — 2026-09-21

CodeMirror now supplies SQLite parsing, EGA syntax colors, line numbers, wrapping, undo/redo, and indentation. Executable starters no longer contain scaffold markers; exact legacy starters are upgraded while other drafts retain their text. Guided ranges are saved with drafts.

- 20 automated tests pass; the static production build passes.
- Browser checks: first guided query cast through SQLite; Tab at the caret, selected-line indentation/outdent, undo, Enter preserving indentation, persisted whitespace, missing-slot prevention in the recipe trial, and two-slot navigation.
- Both Ctrl+Enter and platform Command+Enter are bound. Escape then Tab moves focus to the next control without altering SQL.
- Verified keyword/string/number/comment colors, resize and full-frame focus indication at a 390px viewport; page width remains 390px. No completion popups are installed.

## Revised WHERE lesson — 2026-09-21

The teaching flow now supports both SELECT and WHERE trials. WHERE introduces equality and numeric flags before requiring a condition; its example finds ID 2, guided practice finds glowing names, independent practice finds non-glowing names, and the fresh mastery task returns glowing IDs and names.

- 24 automated tests pass. New tests cover all three exercises on changed datasets, reversed equality, wrong filters, hard-coded names, column order, example output, source-row inclusion, v2 migration, and assistance surviving reload.
- Browser checks cover guided success, incorrect independent answers, syntax errors, viewing the solution then reloading, guided completion, fresh mastery, persisted mastery/scene labels, and review access. Both Ctrl+Enter and Command+Enter were used successfully.
- Verified v2 migration in the browser: completed SELECT and unaffected trial progress remain; old WHERE completion is offered for practice again with a migration explanation and the previous draft accessible. Explicitly skipping to independent practice and completing it without a solution earns mastery.
- Source rows agree with results: Crystal/Moonstone for glowing = 1, Mushroom/Emberroot for glowing = 0. Included/excluded labels accompany color; failed queries preserve the last successful scene. A 390px viewport has no horizontal page overflow; wide source tables scroll internally.
- Static production build passes. No browser errors observed. Other three trials retain their original teaching content and use the shared editor.
