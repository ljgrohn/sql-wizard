import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/empty-shelves.js';
import { evaluate } from '../src/query-engine.js';

const SQL = await initSqlJs();
test(lesson.title + ': reference solution passes changed datasets', () => {
  assert.equal(evaluate(SQL, lesson.id, lesson.solution).correct, true);
});

import { createDatabase, executeQuery } from '../src/query-engine.js';
import { stockRows, stockTokens } from '../src/trials/empty-shelves.js';
import { fixture } from '../src/lesson-data.js';
import { migrateLearning, completeLesson } from '../src/learning-progress.js';

test('LEFT JOIN stages preserve unknown stock and distinguish it from zero', () => {
  for (const [stage, exercise] of Object.entries(lesson.exercises)) assert.equal(evaluate(SQL,lesson.id,exercise.solution,stage).correct,true);
  assert.deepEqual(evaluate(SQL,lesson.id,lesson.solution).result.values,[['Crystal',8],['Moonstone',0],['Mushroom',12],['Emberroot',null]]);
  assert.equal(evaluate(SQL,lesson.id,lesson.solution.replace('LEFT JOIN','JOIN')).correct,false);
  assert.equal(evaluate(SQL,lesson.id,lesson.solution.replace('s.quantity','COALESCE(s.quantity, 0)')).correct,false);
  assert.equal(evaluate(SQL,lesson.id,lesson.solution.replace(';',' WHERE s.quantity >= 0;')).correct,false);
  assert.equal(evaluate(SQL,lesson.id,lesson.exercises.independent.solution.replace('IS NULL','= NULL'),'independent').correct,false);
  assert.equal(evaluate(SQL,lesson.id,lesson.tutorial.example,'independent').correct,false);
});

test('LEFT JOIN walkthrough and example agree with SQLite on every fixture', () => {
  for(let variant=0;variant<3;variant++) {
    const db=createDatabase(SQL,variant);
    try {
      assert.deepEqual(executeQuery(db,lesson.tutorial.example).values,lesson.tutorial.exampleRows(fixture(variant)));
      assert.deepEqual(executeQuery(db,lesson.exercises.mastery.solution).values,stockRows(fixture(variant)));
    } finally {db.close();}
  }
});

test('stock scene uses actual values for distinct recorded, empty, and unknown labels', () => {
  const tokens=stockTokens({values:[['Azure shard',0],['Star glass',null],['Sun root',3]]});
  assert.deepEqual(tokens.map(token=>token.kind),['stock-empty','stock-unknown','stock-recorded']);
  assert.match(tokens[0].label,/empty \(0\)/);
  assert.match(tokens[1].label,/unknown stock \(NULL\)/);
  assert.match(tokens[2].label,/3 recorded/);
});

test('stock revision preserves other mastery, drafts and persistent assistance', () => {
  const migrated=migrateLearning({version:5,lessonId:lesson.id,progress:{[lesson.id]:'guided','moonlight-tonic':'complete'},learning:{'moonlight-tonic':{stage:'done',learned:true}},drafts:{[lesson.id]:'old stock draft'}});
  assert.equal(migrated.progress[lesson.id],undefined);
  assert.equal(migrated.progress['moonlight-tonic'],'complete');
  assert.equal(migrated.learning[lesson.id].migrated,true);
  assert.equal(migrated.drafts[lesson.id],'old stock draft');
  migrated.learning[lesson.id]={stage:'independent',assisted:true,learned:true};
  const state=migrateLearning(JSON.parse(JSON.stringify(migrated))).learning[lesson.id];
  assert.equal(completeLesson(state).stage,'independent');
  assert.equal(completeLesson({...state,stage:'mastery'}).stage,'done');
});
