import test from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import lesson from '../src/trials/empty-shelves.js';
import { evaluate } from '../src/query-engine.js';

const SQL = await initSqlJs();
test(lesson.title + ': reference solution passes changed datasets', () => {
  assert.equal(evaluate(SQL, lesson.id, lesson.solution).correct, true);
});
