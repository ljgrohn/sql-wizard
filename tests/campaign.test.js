import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { lessons, tableInfo } from '../src/lessons.js';
import { createDatabase, evaluate, executeQuery } from '../src/query-engine.js';
import { migrateLearning, completeLesson } from '../src/learning-progress.js';
import { practiceByLesson } from '../src/practice.js';
const SQL = await initSqlJs();
const campaign = lessons.filter(lesson => lesson.storyPages);
for (const lesson of campaign) {
  test(`${lesson.id}: all lesson variants, teaching examples and intermediate results execute`, () => {
    assert.ok(lesson.tutorial.paragraphs.length >= 2);
    assert.ok(lesson.storyPages.length >= 2);
    assert.ok(lesson.ending.text.length > 20);
    assert.equal(practiceByLesson[lesson.id].length, 3);
    for (const name of lesson.tables) assert.ok(tableInfo[name], name);
    const answers = Object.values(lesson.exercises).map(exercise => exercise.solution.trim());
    assert.equal(new Set(answers).size, 3, 'guided, independent and recovery must ask different questions');
    for (const [stage, exercise] of Object.entries(lesson.exercises)) {
      const actual = evaluate(SQL, lesson.id, exercise.solution, stage);
      assert.equal(actual.correct, true, `${stage}: ${actual.message}`);
      assert.equal(evaluate(SQL, lesson.id, 'SELECT 999;', stage).correct, false);
      if (stage !== 'guided') assert.equal(exercise.starter, '');
      if (stage === 'mastery') assert.ok(exercise.hints.length < 3, 'recovery has no worked answer');
    }
    for (let variant = 0; variant < 3; variant++) {
      const db = createDatabase(SQL, variant);
      try {
        const example = executeQuery(db, lesson.tutorial.example);
        assert.ok(example.columns.length);
        for (const step of lesson.tutorial.intermediates || []) assert.ok(executeQuery(db, step.sql).columns.length);
      } finally { db.close(); }
    }
  });
}

test('appending the campaign preserves completed lessons, drafts, location and persistent assistance', () => {
  const original = { version: 5, index: 6, lessonId: 'empty-shelves', progress: { 'first-spark': 'complete' }, learning: { 'first-spark': { stage: 'done', learned: true }, 'empty-shelves': { stage: 'independent', assisted: true, learned: true } }, drafts: { 'empty-shelves:independent': 'SELECT i.name\nFROM ingredients i;' } };
  const migrated = migrateLearning(original);
  assert.equal(migrated.lessonId, 'empty-shelves');
  assert.equal(migrated.progress['first-spark'], 'complete');
  assert.deepEqual(migrated.drafts, original.drafts);
  assert.equal(migrated.learning['empty-shelves'].assisted, true);
  for (const lesson of campaign) {
    assert.equal(migrated.learning[lesson.id].stage, 'learn');
    assert.equal(migrated.progress[lesson.id], undefined);
  }
  assert.equal(completeLesson({ stage: 'independent', assisted: true }).stage, 'independent');
  assert.equal(completeLesson({ stage: 'mastery', assisted: true }).stage, 'done');
});
