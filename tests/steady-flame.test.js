import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/steady-flame.js';
import { evaluate } from '../src/query-engine.js';

const SQL = await initSqlJs();
test(lesson.title + ': reference solution passes changed datasets', () => {
  assert.equal(evaluate(SQL, lesson.id, lesson.solution).correct, true);
});

import { createDatabase, executeQuery } from '../src/query-engine.js';
import { fixture } from '../src/lesson-data.js';
import { matchesFilter, filterExplanation } from '../src/row-filters.js';
import { migrateLearning, completeLesson } from '../src/learning-progress.js';

test('AND keeps Crystal and excludes Emberroot despite its boundary potency', () => {
  assert.deepEqual(evaluate(SQL, lesson.id, lesson.solution).result.values, [['Crystal']]);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients WHERE glowing = 1 AND potency > 6;').correct, true);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients WHERE potency >= 7;').correct, false);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients WHERE potency >= 7 OR glowing = 1;').correct, false);
  assert.equal(evaluate(SQL, lesson.id, "SELECT name FROM ingredients WHERE name = 'Crystal';").correct, false);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name FROM ingredients WHERE glowing = 1 INTERSECT SELECT name FROM ingredients WHERE potency >= 7;').correct, false);
  const emberroot = fixture().ingredients.find(row => row[1] === 'Emberroot');
  assert.equal(filterExplanation(emberroot, lesson.rowFilter, ['id', 'name', 'glowing', 'potency']), 'potency >= 7: yes; glowing = 1: no');
});

test('AND exercises and source-row explanations match SQLite on all fixtures', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) {
    assert.equal(evaluate(SQL, lesson.id, exercise.solution, stage).correct, true);
    for (let variant = 0; variant < 3; variant++) {
      const db = createDatabase(SQL, variant);
      try {
        assert.deepEqual(executeQuery(db, exercise.solution).values.map(row => row.at(-1)), fixture(variant).ingredients.filter(row => matchesFilter(row, exercise.rowFilter)).map(row => row[1]));
      } finally { db.close(); }
    }
  }
  assert.equal(evaluate(SQL, lesson.id, lesson.solution, 'independent').correct, false);
});

test('AND example and pre-query strength preview teach different questions', () => {
  const db = createDatabase(SQL);
  try { assert.deepEqual(executeQuery(db, lesson.tutorial.example).values, [['Moonstone']]); }
  finally { db.close(); }
  assert.deepEqual(fixture().ingredients.filter(row => matchesFilter(row, lesson.scenePreview.filter)).map(row => row[1]), ['Crystal', 'Emberroot']);
});

test('old AND credit becomes practice without disturbing completed comparison work', () => {
  const saved = { version: 4, lessonId: 'steady-flame', progress: { 'steady-flame': 'complete', 'potent-ingredients': 'complete' }, learning: { 'potent-ingredients': { stage: 'done', completedExercise: 'independent', learned: true } }, drafts: { 'steady-flame': 'old AND draft' } };
  const migrated = migrateLearning(saved);
  assert.equal(migrated.progress['steady-flame'], undefined);
  assert.equal(migrated.learning['steady-flame'].stage, 'learn');
  assert.equal(migrated.learning['steady-flame'].migrated, true);
  assert.equal(migrated.progress['potent-ingredients'], 'complete');
  assert.equal(migrated.drafts['steady-flame'], 'old AND draft');
  migrated.learning['steady-flame'] = { stage: 'independent', assisted: true, learned: true };
  const reloaded = migrateLearning(JSON.parse(JSON.stringify(migrated)));
  assert.equal(completeLesson(reloaded.learning['steady-flame']).stage, 'independent');
  assert.equal(completeLesson({ ...reloaded.learning['steady-flame'], stage: 'mastery' }).stage, 'done');
});
