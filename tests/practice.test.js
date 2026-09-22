import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { lessons } from '../src/lessons.js';
import { createDatabase, executeQuery, keywords } from '../src/query-engine.js';
import { practiceByLesson, practiceProblems, getPracticeProblem, evaluatePractice } from '../src/practice.js';

const SQL = await initSqlJs();

test('each stage has three distinct, fully specified crafting problems', () => {
  assert.equal(practiceProblems.length, 21);
  assert.equal(new Set(practiceProblems.map(item => item.id)).size, practiceProblems.length);
  assert.equal(new Set(practiceProblems.map(item => item.reward.id)).size, practiceProblems.length);
  for (const lesson of lessons) {
    const tasks = practiceByLesson[lesson.id];
    assert.equal(tasks.length, 3, lesson.id);
    const existing = Object.values(lesson.exercises).map(item => item.solution.replace(/\s+/g, ' ').trim());
    for (const task of tasks) {
      assert.equal(task.lessonId, lesson.id);
      assert.ok(task.instruction && task.story && task.success);
      assert.ok(['spell', 'potion', 'charm'].includes(task.reward.kind));
      assert.equal(task.hints.at(-1), task.solution);
      assert.equal(task.expectedSql, task.solution);
      assert.equal(getPracticeProblem(task.id), task);
      assert.ok(!existing.includes(task.solution.replace(/\s+/g, ' ').trim()), task.id);
    }
  }
});

test('every crafting solution passes all changed catalogs and has a visible result', () => {
  for (const task of practiceProblems) {
    const evaluated = evaluatePractice(SQL, task.id, task.solution);
    assert.equal(evaluated.correct, true, task.id);
    assert.ok(evaluated.result.values.length, task.id);
    assert.equal(evaluated.message, task.success);
    assert.equal(evaluatePractice(SQL, task.id, 'SELECT 999;').correct, false, task.id);
  }
});

test('hard-coded visible answers cannot earn a craft', () => {
  const db = createDatabase(SQL);
  try {
    for (const task of practiceProblems) {
      const actual = executeQuery(db, task.solution);
      const literal = value => value === null ? 'NULL' : typeof value === 'string' ? `'${value.replaceAll("'", "''")}'` : String(value);
      const sql = actual.values.map(row => `SELECT ${row.map(literal).join(', ')}`).join(' UNION ALL ');
      const evaluated = evaluatePractice(SQL, task.id, sql);
      assert.equal(evaluated.correct, false, task.id);
      assert.match(evaluated.message, /changed catalog/, task.id);
    }
  } finally { db.close(); }
});

test('practice stays within concepts taught at each stage', () => {
  for (const [index, lesson] of lessons.entries()) {
    for (const task of practiceByLesson[lesson.id]) {
      const words = keywords(task.solution);
      for (const unsupported of ['GROUP', 'HAVING', 'COUNT', 'SUM', 'UNION', 'DISTINCT', 'OR', 'BETWEEN']) {
        assert.ok(!words.includes(unsupported), `${task.id}: ${unsupported}`);
      }
      if (index === 0) assert.ok(!words.includes('WHERE'));
      if (index < 3) assert.ok(!words.includes('AND'));
      if (index < 4) assert.ok(!words.includes('JOIN'));
      if (index < 6) assert.ok(!words.includes('LEFT') && !words.includes('NULL'));
    }
  }
});

test('practice distinguishes missing stock from zero and preserves duplicate recipe entries', () => {
  const missing = getPracticeProblem('empty-shelves-uncounted-stars');
  assert.equal(evaluatePractice(SQL, missing.id, missing.solution.replace('s.ingredient_id IS NULL', 's.quantity = 0')).correct, false);
  const recipe = getPracticeProblem('moonlight-tonic-double-measure');
  assert.equal(evaluatePractice(SQL, recipe.id, recipe.solution.replace('SELECT ', 'SELECT DISTINCT ')).correct, false);
});

test('equivalent aliases and output ordering are accepted without consuming inventory', () => {
  const id = 'ingredient-ledger-reserve-tonic';
  const sql = 'SELECT a.name AS ingredient, b.quantity AS amount FROM ingredients a JOIN stock b ON b.ingredient_id = a.id WHERE b.quantity >= 8 ORDER BY a.name DESC;';
  const first = evaluatePractice(SQL, id, sql);
  assert.equal(first.correct, true);
  assert.deepEqual(evaluatePractice(SQL, id, sql), first);
});

test('unknown problems, writes, and multiple statements are rejected', () => {
  assert.throws(() => evaluatePractice(SQL, 'missing', 'SELECT 1'), /could not be found/);
  const id = practiceProblems[0].id;
  assert.throws(() => evaluatePractice(SQL, id, 'DELETE FROM ingredients;'), /SELECT or WITH/);
  assert.throws(() => evaluatePractice(SQL, id, 'SELECT name FROM ingredients; SELECT 1;'), /one query/);
});
