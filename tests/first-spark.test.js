import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/first-spark.js';
import { evaluate } from '../src/query-engine.js';

const SQL = await initSqlJs();
test(lesson.title + ': reference solution passes changed datasets', () => {
  assert.equal(evaluate(SQL, lesson.id, lesson.solution).correct, true);
});

import { migrateProgress, completeFirstSpark } from '../src/first-spark-progress.js';
import { createDatabase, executeQuery } from '../src/query-engine.js';
import { fixture } from '../src/lesson-data.js';

test('each first-spark exercise evaluates its own task across changed catalogs', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) {
    assert.equal(evaluate(SQL, lesson.id, exercise.solution, stage).correct, true);
    assert.equal(evaluate(SQL, lesson.id, 'SELECT glowing FROM ingredients;', stage).correct, false);
  }
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name, id FROM ingredients;', 'mastery').correct, false);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4;', 'independent').correct, false);
  assert.throws(() => evaluate(SQL, lesson.id, lesson.solution, 'unknown'), /exercise/);
});

test('teaching example displays the actual SQLite result', () => {
  const db = createDatabase(SQL);
  try {
    const result = executeQuery(db, lesson.tutorial.example);
    assert.deepEqual(result.columns, lesson.tutorial.columns);
    assert.deepEqual(result.values, fixture().ingredients.map(row => lesson.tutorial.sourceIndices.map(i => row[i])));
  } finally { db.close(); }
});

test('migration preserves other trials and drafts without awarding old first-spark mastery', () => {
  const migrated = migrateProgress({ progress: { 'first-spark': 'complete', 'light-the-ward': 'guided' }, drafts: { 'first-spark': 'SELECT name FROM ingredients;', 'light-the-ward': 'draft' } });
  assert.equal(migrated.progress['first-spark'], undefined);
  assert.equal(migrated.progress['light-the-ward'], 'guided');
  assert.equal(migrated.drafts['first-spark'], 'SELECT name FROM ingredients;');
  assert.equal(migrated.firstSpark.stage, 'learn');
  assert.equal(migrated.firstSpark.migrated, true);
});

test('solution assistance survives reload and requires a fresh independent variant', () => {
  const firstSpark = { stage: 'independent', assisted: true, learned: true };
  const reloaded = migrateProgress(JSON.parse(JSON.stringify({ version: 2, firstSpark })));
  const completed = completeFirstSpark(reloaded.firstSpark);
  assert.equal(completed.stage, 'independent');
  assert.equal(completed.independentDone, true);
  assert.equal(completeFirstSpark({ ...completed, stage: 'mastery' }).stage, 'done');
  assert.equal(completeFirstSpark({ stage: 'guided' }).stage, 'guided');
  assert.equal(completeFirstSpark({ stage: 'independent', assisted: false }).stage, 'independent');
});
