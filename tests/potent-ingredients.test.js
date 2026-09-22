import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/potent-ingredients.js';
import { createDatabase, evaluate, executeQuery } from '../src/query-engine.js';
import { fixture, lessons } from '../src/lessons.js';
import { matchesFilter } from '../src/row-filters.js';
import { migrateLearning } from '../src/learning-progress.js';
const SQL = await initSqlJs();

test('potency includes the boundary and accepts equivalent integer comparisons', () => {
  assert.deepEqual(evaluate(SQL, lesson.id, lesson.solution).result.values, [['Crystal'], ['Emberroot']]);
  for (const sql of [lesson.solution, 'SELECT name FROM ingredients WHERE potency > 6;', 'SELECT name FROM ingredients WHERE 7 <= potency ORDER BY name DESC;']) assert.equal(evaluate(SQL, lesson.id, sql).correct, true);
  for (const sql of ['SELECT name FROM ingredients WHERE potency > 7;', 'SELECT name FROM ingredients WHERE potency >= 7 AND glowing = 1;', "SELECT 'Crystal' UNION ALL SELECT 'Emberroot';"]) assert.equal(evaluate(SQL, lesson.id, sql).correct, false);
});

test('all potency exercises validate changed datasets and their visual filters', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) {
    assert.equal(evaluate(SQL, lesson.id, exercise.solution, stage).correct, true);
    for (let variant = 0; variant < 3; variant++) {
      const db = createDatabase(SQL, variant);
      try {
        const names = executeQuery(db, exercise.solution).values.map(row => row.at(-1));
        assert.deepEqual(names, fixture(variant).ingredients.filter(row => matchesFilter(row, exercise.rowFilter)).map(row => row[1]));
      } finally { db.close(); }
    }
  }
});

test('example and comparison explanation distinguish whole numbers from decimals', () => {
  const db = createDatabase(SQL);
  try {
    assert.deepEqual(executeQuery(db, lesson.tutorial.example).values, [['Crystal']]);
    assert.deepEqual(executeQuery(db, 'SELECT 6.5 > 6, 6.5 >= 7;').values, [[1, 0]]);
  } finally { db.close(); }
});

test('inserting potency preserves the saved trial identity and never inherits old AND credit', () => {
  const saved = { version: 3, index: 2, progress: { 'steady-flame': 'complete', 'first-spark': 'complete' }, learning: { 'first-spark': { stage: 'done', learned: true } }, drafts: { 'steady-flame': 'old query' } };
  const migrated = migrateLearning(saved);
  assert.equal(lessons[migrated.index].id, 'steady-flame');
  assert.equal(migrated.progress['potent-ingredients'], undefined);
  assert.equal(migrated.learning['potent-ingredients'].stage, 'learn');
  assert.equal(migrated.progress['first-spark'], 'complete');
  assert.equal(migrated.drafts['steady-flame'], 'old query');
  assert.equal(migrateLearning({ ...migrated, lessonId: 'moonlight-tonic', index: 0 }).lessonId, 'moonlight-tonic');
});
