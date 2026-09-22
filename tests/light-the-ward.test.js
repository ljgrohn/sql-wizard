import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/light-the-ward.js';
import { evaluate } from '../src/query-engine.js';

const SQL = await initSqlJs();
test(lesson.title + ': reference solution passes changed datasets', () => {
  assert.equal(evaluate(SQL, lesson.id, lesson.solution).correct, true);
});

import { createDatabase, executeQuery } from '../src/query-engine.js';
import { fixture } from '../src/lesson-data.js';
import { migrateLearning, completeLesson } from '../src/learning-progress.js';

test('WHERE practice and mastery validate changed data, not fixed names', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) {
    assert.equal(evaluate(SQL, lesson.id, exercise.solution, stage).correct, true);
    assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients;', stage).correct, false);
  }
  assert.equal(evaluate(SQL, lesson.id, "SELECT 'Mushroom' UNION ALL SELECT 'Emberroot';", 'independent').correct, false);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients WHERE 0 = glowing ORDER BY name DESC;', 'independent').correct, true);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients WHERE glowing = 1;', 'independent').correct, false);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name, id FROM ingredients WHERE glowing = 1;', 'mastery').correct, false);
});

test('WHERE example and row inclusion visuals agree with actual SQLite results', () => {
  const db = createDatabase(SQL);
  try {
    assert.deepEqual(executeQuery(db, lesson.tutorial.example).values, [['Moonstone']]);
    for (const exercise of Object.values(lesson.exercises)) {
      const included = fixture().ingredients.filter(row => row[exercise.rowFilter.column] === exercise.rowFilter.equals);
      const result = executeQuery(db, exercise.solution);
      assert.equal(result.values.length, included.length);
      assert.deepEqual(result.values.map(row => row.at(-1)), included.map(row => row[1]));
    }
  } finally { db.close(); }
});

test('v2 migration preserves first lesson mastery, other trials, drafts and editor ranges', () => {
  const original = { version: 2, index: 1, firstSpark: { stage: 'done', completedExercise: 'mastery', assisted: true, learned: true }, progress: { 'first-spark': 'complete', 'light-the-ward': 'complete', 'moonlight-tonic': 'complete' }, drafts: { 'light-the-ward': 'SELECT name FROM ingredients WHERE glowing = 1;', 'first-spark:mastery': 'SELECT id, name FROM ingredients;' }, editorSlots: { 'first-spark:guided': [{ from: 7, to: 11, label: 'Column' }] } };
  const migrated = migrateLearning(original);
  assert.equal(migrated.learning['first-spark'].stage, 'done');
  assert.equal(migrated.progress['first-spark'], 'complete');
  assert.equal(migrated.progress['moonlight-tonic'], 'complete');
  assert.equal(migrated.progress['light-the-ward'], undefined);
  assert.equal(migrated.learning['light-the-ward'].migrated, true);
  assert.deepEqual(migrated.drafts, original.drafts);
  assert.deepEqual(migrated.editorSlots, original.editorSlots);
});

test('WHERE solution assistance and stage survive reload, while guided practice does not award mastery', () => {
  const saved = migrateLearning({});
  saved.learning['light-the-ward'] = { stage: 'independent', assisted: true, learned: true };
  const reloaded = migrateLearning(JSON.parse(JSON.stringify(saved)));
  const state = completeLesson(reloaded.learning['light-the-ward']);
  assert.equal(state.stage, 'independent');
  assert.equal(state.independentDone, true);
  assert.equal(completeLesson({ ...state, stage: 'mastery' }).stage, 'done');
  assert.equal(completeLesson({ stage: 'guided' }).guidedDone, true);
  assert.equal(completeLesson({ stage: 'guided' }).stage, 'guided');
  assert.equal(completeLesson({ stage: 'independent', assisted: false }).stage, 'done');
});
