import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/ingredient-ledger.js';
import { createDatabase, evaluate, executeQuery } from '../src/query-engine.js';
import { fixture, lessons } from '../src/lessons.js';
import { migrateLearning } from '../src/learning-progress.js';
const SQL = await initSqlJs();

test('two-table exercises pass all fixtures and preserve zero-stock matches', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) assert.equal(evaluate(SQL, lesson.id, exercise.solution, stage).correct, true);
  assert.deepEqual(evaluate(SQL, lesson.id, lesson.solution).result.values, [['Crystal',8],['Moonstone',0],['Mushroom',12]]);
  assert.equal(evaluate(SQL, lesson.id, lesson.exercises.independent.solution).correct, false);
  assert.equal(evaluate(SQL, lesson.id, 'SELECT name, quantity FROM stock JOIN ingredients ON ingredient_id = id ORDER BY name DESC;').correct, true);
});

test('join validation rejects wrong keys, cross joins, missing matches and hard-coded output', () => {
  for (const query of [
    'SELECT i.name, s.quantity FROM ingredients i JOIN stock s ON i.id = s.quantity;',
    'SELECT i.name, s.quantity FROM ingredients i CROSS JOIN stock s;',
    'SELECT i.name, s.quantity FROM ingredients i LEFT JOIN stock s ON i.id = s.ingredient_id;',
    "SELECT 'Crystal', 8 UNION ALL SELECT 'Moonstone', 0 UNION ALL SELECT 'Mushroom', 12;",
  ]) assert.equal(evaluate(SQL, lesson.id, query).correct, false);
});

test('example and matching-row walkthrough agree with SQLite across changed IDs and duplicate names', () => {
  for (let variant=0; variant<3; variant++) {
    const db = createDatabase(SQL, variant);
    try {
      assert.deepEqual(executeQuery(db, lesson.tutorial.example).values, lesson.tutorial.exampleRows(fixture(variant)));
      assert.deepEqual(executeQuery(db, 'SELECT s.ingredient_id, i.id, i.name, s.quantity FROM stock s JOIN ingredients i ON i.id = s.ingredient_id;').values, lesson.tutorial.relationshipRows(fixture(variant)));
    } finally { db.close(); }
  }
});

test('inserting the ledger preserves recipe position, story transition, drafts and prior progress', () => {
  const saved={version:4,index:4,progress:{'moonlight-tonic':'guided','steady-flame':'complete'},learning:{'steady-flame':{stage:'done',learned:true}},drafts:{'moonlight-tonic':'my recipe draft'},story:{seen:{prologue:true},pending:{id:'after:steady-flame',mode:'transition',page:0,target:'moonlight-tonic'}}};
  const migrated=migrateLearning(saved);
  assert.equal(lessons[migrated.index].id,'moonlight-tonic');
  assert.equal(migrated.progress['moonlight-tonic'],'guided');
  assert.equal(migrated.learning['ingredient-ledger'].stage,'learn');
  assert.equal(migrated.progress['ingredient-ledger'],undefined);
  assert.deepEqual(migrated.story,saved.story);
  assert.deepEqual(migrated.drafts,saved.drafts);
});
