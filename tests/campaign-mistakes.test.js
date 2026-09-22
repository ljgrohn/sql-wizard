import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { lessons } from '../src/lessons.js';
import { evaluate } from '../src/query-engine.js';
const SQL = await initSqlJs();
const answer = (id, stage = 'independent') => lessons.find(l => l.id === id).exercises[stage].solution;
const reject = (id, sql, stage = 'independent') => assert.equal(evaluate(SQL, id, sql, stage).correct, false, id);

test('campaign rejects wrong headings, wrong sort direction and reversed creature pairs', () => {
  reject('named-columns', answer('named-columns').replace('AS jar_number', 'AS incorrect_heading'));
  reject('ordered-shelves', answer('ordered-shelves').replace('name ASC', 'name DESC'));
  reject('sanctuary-pairs', answer('sanctuary-pairs').replace('a.id < b.id', 'a.id != b.id'));
});
test('empty habitats survive ON filtering and require counting the matched ID', () => {
  reject('habitat-census', answer('habitat-census').replace('COUNT(c.id)', 'COUNT(*)'));
  reject('habitat-census', answer('habitat-census').replace('AND c.ready = 1 GROUP BY', 'WHERE c.ready = 1 GROUP BY'));
});
test('raw one-to-many joins cannot replace independently summarized child tables', () => {
  reject('tangled-ledgers', 'SELECT c.id, c.name, COALESCE(SUM(v.minutes), 0) AS total_minutes, COUNT(t.id) AS trait_count FROM creatures c LEFT JOIN care v ON c.id=v.creature_id LEFT JOIN traits t ON c.id=t.creature_id GROUP BY c.id, c.name HAVING COUNT(t.id) >= 2;');
});
test('existence checks need a correlation and UNION ALL must preserve repeated events', () => {
  reject('missing-care', answer('missing-care').replace('v.creature_id = c.id', '1 = 1'));
  reject('combined-signals', answer('combined-signals').replace('UNION ALL', 'UNION'));
});
test('final transfer assessment distinguishes a zero delivery from an absent record', () => {
  reject('expedition-gaps', answer('expedition-gaps').replace('d.id IS NULL', 'd.units = 0'));
  reject('expedition-restoration', answer('expedition-restoration').replace('MAX(risk)', 'MIN(risk)'));
});
