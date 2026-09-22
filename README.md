# SQL Wizard

A small browser game that teaches real SQL through an apprentice wizard’s training. The first playable build contains five challenges: SELECT, WHERE, AND, a potion-recipe JOIN, and a LEFT JOIN stock check.

## Run locally

Requires a current Node.js version supported by Vite (developed with Node 24).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Use the source-table tabs and field notes, write a query, then click **Cast spell** or press **Ctrl/⌘ + Enter**. The spellbook lists progress and future chapters.

## Check and build

```sh
npm test
npm run build
npm run preview
```

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
- Five playable trials, not the full curriculum. Grouping, CTE lessons, animal breeding, and alchemy are mapped in the plan but not yet authored as playable chapters.
- The guided join challenges preview later curriculum topics and reuse the archive illustration.
- Assisted completion is labeled; independent mastery variants are planned.
- Hidden fixture checks are educational validation, not secure grading.
- One SQLite dialect; PostgreSQL/MySQL differences are not taught in this version.

## Project map

- `src/lessons.js`: ordered trial registry.
- `src/trials/`: one content module per trial, recorded in its own commit.
- `src/lesson-data.js`: schema descriptions, visible and validation fixtures.
- `src/query-engine.js`: read-only query execution and answer checking.
- `src/sql-worker.js`: isolated SQLite runner.
- `src/main.js`, `src/style.css`: accessible game interface and local progress.
- `public/art/archive.png`: EGA library background; UI is rendered separately.
- `docs/sql-wizard-curriculum.md`: full curriculum.
- `docs/sql-wizard-story-and-build.md`: narrative, magical uses of SQL, delivery plan.
- `docs/next-steps.md`: first-playtest feedback, teaching/editor improvements, scene variation, and the planned per-trial commit sequence.

Vercel’s Vite guide: https://vercel.com/docs/frameworks/frontend/vite
