import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { createDatabase, evaluate, executeQuery, sameResult } from '../src/query-engine.js';

const SQL = await initSqlJs();

test('equivalent query with different aliases and order passes', () => {
  const result = evaluate(SQL, 'light-the-ward', 'select name AS ingredient from ingredients where 1 = glowing order by name DESC;');
  assert.equal(result.correct, true);
});

test('hard-coded visible answers fail the changed-catalog check', () => {
  const result = evaluate(SQL, 'light-the-ward', "SELECT 'Crystal' AS name UNION ALL SELECT 'Moonstone';");
  assert.equal(result.correct, false);
  assert.match(result.message, /changed catalog/);
});

test('one-to-many multiplicity and NULL are significant', () => {
  assert.equal(sameResult({ columns: ['x'], values: [[1], [1]] }, { columns: ['x'], values: [[1]] }), false);
  assert.equal(sameResult({ columns: ['x'], values: [[null]] }, { columns: ['x'], values: [[0]] }), false);
});

test('an inner join incorrectly drops the missing stock record', () => {
  const result = evaluate(SQL, 'empty-shelves', 'SELECT i.name, s.quantity FROM ingredients i JOIN stock s ON i.id = s.ingredient_id;');
  assert.equal(result.correct, false);
  assert.equal(result.result.values.length, 3);
});

test('extra output columns do not satisfy the requested shape', () => {
  assert.equal(evaluate(SQL, 'first-spark', 'SELECT * FROM ingredients;').correct, false);
});

test('read-only environment rejects writes, multiple statements and disguised writes', () => {
  const db = createDatabase(SQL);
  try {
    for (const sql of ['DELETE FROM ingredients;', 'PRAGMA query_only = OFF;', 'SELECT 1; DROP TABLE ingredients;', 'WITH x AS (SELECT 1) DELETE FROM ingredients;']) {
      assert.throws(() => executeQuery(db, sql));
    }
    assert.equal(executeQuery(db, 'SELECT * FROM ingredients;').values.length, 4);
  } finally { db.close(); }
});

test('comments and string semicolons are allowed; CTEs execute', () => {
  const db = createDatabase(SQL);
  try {
    assert.deepEqual(executeQuery(db, "-- a comment\nSELECT 'a;b' AS text;").values, [['a;b']]);
    assert.equal(executeQuery(db, 'WITH lit AS (SELECT * FROM ingredients WHERE glowing = 1) SELECT COUNT(*) FROM lit;').values[0][0], 2);
    assert.throws(() => executeQuery(db, 'SELECT name FROM ingredients; SELECT 1;'), /one query/);
  } finally { db.close(); }
});

test('result row limit prevents an oversized result table', () => {
  const db = createDatabase(SQL);
  try {
    assert.throws(() => executeQuery(db, 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 250) SELECT x FROM n;'), /200 rows/);
  } finally { db.close(); }
});

test('missing query or malformed SQL produces an actionable error', () => {
  const db = createDatabase(SQL);
  try {
    assert.throws(() => executeQuery(db, ''), /Write a query/);
    assert.throws(() => executeQuery(db, 'SELECT ___ FROM ingredients;'), /no such column/);
  } finally { db.close(); }
});
