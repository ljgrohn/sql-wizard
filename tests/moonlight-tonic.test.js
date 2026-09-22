import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/moonlight-tonic.js';
import { evaluate } from '../src/query-engine.js';

const SQL = await initSqlJs();
test(lesson.title + ': reference solution passes changed datasets', () => {
  assert.equal(evaluate(SQL, lesson.id, lesson.solution).correct, true);
});

import { createDatabase, executeQuery } from '../src/query-engine.js';
import { recipeRows } from '../src/trials/moonlight-tonic.js';
import { fixture } from '../src/lesson-data.js';
import { migrateLearning } from '../src/learning-progress.js';

test('recipe stages validate alternate recipes and preserve duplicate entries', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) assert.equal(evaluate(SQL, lesson.id, exercise.solution, stage).correct, true);
  assert.equal(evaluate(SQL, lesson.id, lesson.solution, 'independent').correct, false);
  assert.equal(evaluate(SQL, lesson.id, lesson.solution.replace('SELECT', 'SELECT DISTINCT')).correct, false);
  assert.equal(evaluate(SQL, lesson.id, lesson.solution.replace("r.name = 'Moonlight tonic'", 'r.id = 1')).correct, false);
  assert.equal(evaluate(SQL, lesson.id, lesson.solution.replace('i.id = ri.ingredient_id', 'i.id = ri.recipe_id')).correct, false);
});

test('recipe examples and all-entry results agree with SQLite on all fixtures', () => {
  for (let variant=0;variant<3;variant++) {
    const db=createDatabase(SQL,variant);
    try {
      assert.deepEqual(executeQuery(db,lesson.tutorial.example).values,lesson.tutorial.exampleRows(fixture(variant)));
      assert.deepEqual(executeQuery(db,lesson.exercises.mastery.solution).values,recipeRows(fixture(variant)));
    } finally {db.close();}
  }
});

test('recipe revision resets old completion but preserves learned joins and drafts', () => {
  const migrated=migrateLearning({version:5,lessonId:lesson.id,progress:{[lesson.id]:'complete','ingredient-ledger':'complete'},learning:{'ingredient-ledger':{stage:'done',learned:true}},drafts:{[lesson.id]:'old recipe draft'}});
  assert.equal(migrated.progress[lesson.id],undefined);
  assert.equal(migrated.learning[lesson.id].migrated,true);
  assert.equal(migrated.progress['ingredient-ledger'],'complete');
  assert.equal(migrated.drafts[lesson.id],'old recipe draft');
});
