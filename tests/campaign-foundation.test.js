import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { createDatabase, executeQuery, sameResult, usesRequiredConcepts } from '../src/query-engine.js';
const SQL = await initSqlJs();
test('ordered objectives reject a reversed answer while unordered objectives retain multiplicity', () => {
  const expected = { columns: ['name'], values: [['a'], ['a'], ['b']] };
  const reverse = { columns: ['label'], values: [['b'], ['a'], ['a']] };
  assert.equal(sameResult(reverse, expected), true);
  assert.equal(sameResult(reverse, expected, { ordered: true }), false);
  assert.equal(sameResult(expected, expected, { expectedColumns: ['label'] }), false);
  assert.equal(sameResult({ ...expected, values: [['a'], ['b']] }, expected), false);
});
test('multi-construct requirements cannot be supplied in comments or strings', () => {
  assert.equal(usesRequiredConcepts('SELECT name FROM ingredients ORDER BY name LIMIT 2;', ['ORDER', 'LIMIT']), true);
  assert.equal(usesRequiredConcepts("SELECT 'ORDER LIMIT' FROM ingredients; -- ORDER LIMIT", ['ORDER', 'LIMIT']), false);
});
test('order fixtures contain date boundaries, missing deliveries and zero denominators', () => {
  for (let variant = 0; variant < 3; variant++) {
    const db = createDatabase(SQL, variant);
    try {
      assert.ok(executeQuery(db, 'SELECT id FROM orders WHERE batches = 0').values.length);
      assert.ok(executeQuery(db, 'SELECT id FROM orders WHERE delivered_on IS NULL').values.length);
      assert.ok(executeQuery(db, "SELECT id FROM orders WHERE ordered_on = '2026-09-01'").values.length);
      assert.ok(executeQuery(db, "SELECT id FROM orders WHERE ordered_on = '2026-10-01'").values.length);
    } finally { db.close(); }
  }
});
