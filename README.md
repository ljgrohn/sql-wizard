# SQL Wizard

A small browser game that teaches real SQL through an apprentice wizard’s training. The current build contains seven taught stages plus 21 crafting commissions (three per stage): SELECT, WHERE, potency comparisons, AND, a two-table stock JOIN, a potion-recipe JOIN, and a LEFT JOIN stock check.

## Run locally

Requires a current Node.js version supported by Vite (developed with Node 24).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. An illustrated prologue introduces the academy, and short story scenes connect each lesson. Use **Story** to replay scenes you have reached; skipping or replaying a scene does not award SQL progress. Story pages and unfinished transitions survive reloads. The shared SQL editor highlights SQLite syntax. Tab inserts two spaces or indents a selection; Shift+Tab outdents. Enter keeps indentation, and undo/redo work normally. Press Escape then Tab to leave the editor. Guided slots are labeled outside the SQL and drafts preserve whitespace. Use the source-table tabs and field notes, write a query, then click **Cast spell** or press **Ctrl/⌘ + Enter**. All seven trials open with spellbook explanations and examples, then guided and independent practice. “Review this spell” reopens the current teaching page. The spellbook lists progress and future chapters.

## Practice and crafting

Choose **Practice & craft** in the header, or **3 extra commissions** within any stage, to enter Iona’s workshop. Each stage has three additional problems that create spells, potions, or charms for your satchel. All stages are available for practice; the SQL builds on the matching lesson’s concepts.

Crafting checks your query against three catalogs, so copying fixed answers does not earn a creation. Hints end with a worked example; using it marks that attempt as assisted, including after reload. **Start a fresh attempt** clears the query and assistance for another try. Each commission contributes one collectible, and solving it independently upgrades its record. Crafts and drafts are saved separately from lesson mastery. Reopen the workshop after a reload to resume the commission.

## Check and build

```sh
npm test
npm run build
npm run preview
```

With the preview running, verify the full story and lesson journey in another terminal:

```sh
npm run test:journey -- http://127.0.0.1:4173
npm run test:practice -- http://127.0.0.1:4173
```

Use the actual preview port if it differs. This check uses `npx agent-browser` in a fresh browser session; it verifies seven independent answers, saved mastery, story transitions, and the mobile layout. The practice check verifies rewards, assistance, reload, repeat casts, lesson isolation, and mobile layout. Browser screenshots are saved under ignored `artifacts/journey/` and `artifacts/practice/`.

The query engine uses SQLite (SQL.js) in a worker with read-only fixtures, a timeout, and a result limit. Tests cover all lesson answers on changed datasets, equivalent answers, hard-coded-answer rejection, joins with missing records, duplicate results, CTE support, and write rejection.

## Vercel

This is a static Vite app. `vercel.json` sets `npm run build` and the `dist` output directory. No environment variables or external database are needed.

To publish, import the repository into Vercel as a Vite project, or run the Vercel CLI from this directory:

```sh
npx vercel link
npx vercel deploy
```

This produces a preview deployment. Promote the reviewed preview or use `npx vercel --prod` when ready for production. The repository is prepared for Vercel; local development does not itself publish it.

## Scope and limitations

- Progress and drafts stay in this browser, not across devices.
- Seven playable trials, not the full curriculum. Grouping, CTE lessons, animal breeding, and alchemy are mapped in the plan but not yet authored as playable chapters.
- All seven trials distinguish guided completion from independent mastery and preserve solution assistance across reloads.
- Hidden fixture checks are educational validation, not secure grading.
- One SQLite dialect; PostgreSQL/MySQL differences are not taught in this version.

## Project map

- `src/lessons.js`: ordered trial registry.
- `src/practice.js`, `src/practice-player.js`: 21 validated crafting problems, workshop, and saved satchel.
- `src/sql-editor.js`: shared CodeMirror editor with SQLite syntax and guided slots.
- `src/learning-progress.js`: versioned lesson progress and migration from earlier saves.
- `src/trials/`: one content module per trial, recorded in its own commit.
- `src/lesson-data.js`: schema descriptions, visible and validation fixtures.
- `src/query-engine.js`: read-only query execution and answer checking.
- `src/sql-worker.js`: isolated SQLite runner.
- `src/main.js`, `src/style.css`: accessible game interface and local progress.
- `src/stories.js`, `src/story-player.js`: illustrated prologue, chapter transitions, and story replay.
- `src/scenes.js`, `public/art/`: academy, archive, herbarium, workshop, and storeroom art; text and result labels remain HTML.
- `docs/story-art-prompts.md`: new story artwork prompts and provenance.
- `docs/sql-wizard-curriculum.md`: full curriculum.
- `docs/sql-wizard-story-and-build.md`: narrative, magical uses of SQL, delivery plan.
- `docs/next-steps.md`: first-playtest feedback, teaching/editor improvements, scene variation, and the planned per-trial commit sequence.

Vercel’s Vite guide: https://vercel.com/docs/frameworks/frontend/vite
