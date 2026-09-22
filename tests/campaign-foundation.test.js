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

test('sanctuary and assessment fixtures expose missing relationships, duplicate names and fanout', () => {
  for (let variant = 0; variant < 3; variant++) {
    const db = createDatabase(SQL, variant);
    try {
      assert.ok(executeQuery(db, 'SELECT name FROM creatures GROUP BY name HAVING COUNT(*) > 1').values.length);
      assert.ok(executeQuery(db, 'SELECT h.id FROM habitats h LEFT JOIN creatures c ON c.habitat_id = h.id WHERE c.id IS NULL').values.length);
      assert.ok(executeQuery(db, 'SELECT e.id FROM expeditions e LEFT JOIN deliveries d ON d.expedition_id = e.id WHERE d.id IS NULL').values.length);
      assert.ok(executeQuery(db, 'SELECT creature_id FROM care WHERE creature_id IS NULL').values.length);
      const wrong = executeQuery(db, 'SELECT c.id, SUM(v.minutes) FROM creatures c JOIN care v ON v.creature_id=c.id JOIN traits t ON t.creature_id=c.id GROUP BY c.id');
      const correct = executeQuery(db, 'SELECT c.id, SUM(v.minutes) FROM creatures c JOIN care v ON v.creature_id=c.id WHERE EXISTS (SELECT 1 FROM traits t WHERE t.creature_id=c.id) GROUP BY c.id');
      assert.equal(sameResult(wrong, correct), false, 'independent child rows must expose double-counting');
    } finally { db.close(); }
  }
});
