import { ordersSchema } from './orders-data.js';
import { fixture, lessons } from './lessons.js';

const schema = `
CREATE TABLE ingredients (id INTEGER PRIMARY KEY, name TEXT, glowing INTEGER, potency INTEGER);
CREATE TABLE recipes (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE recipe_items (recipe_id INTEGER, ingredient_id INTEGER, quantity INTEGER);
CREATE TABLE stock (ingredient_id INTEGER PRIMARY KEY, quantity INTEGER);`;

// Recognize SQL keywords outside quoted strings, identifiers and comments.
// Execution is additionally guarded by SQLite query_only and one-statement parsing.
export function keywords(sql) {
  return (sql.replace(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|\[[^\]]*\]/g, ' ').match(/[a-z_]+/gi) || []).map(x => x.toUpperCase());
}

export function createDatabase(SQL, variant = 0) {
  const db = new SQL.Database();
  try {
    db.run(schema + ordersSchema);
    for (const [table, rows] of Object.entries(fixture(variant))) {
      if (!rows.length) continue;
      const statement = db.prepare(`INSERT INTO ${table} VALUES (${rows[0].map(() => '?').join(',')})`);
      try { for (const row of rows) statement.run(row); } finally { statement.free(); }
    }
    db.run('PRAGMA query_only = ON');
    return db;
  } catch (error) { db.close(); throw error; }
}

export function executeQuery(db, sql) {
  if (!sql.trim()) throw new Error('Write a query first. Start with SELECT.');
  if (sql.length > 8000) throw new Error('This spell is too long. Keep your query under 8,000 characters.');
  if (!['SELECT', 'WITH'].includes(keywords(sql)[0])) throw new Error('Use a SELECT or WITH query. These lessons read the archive.');
  let count = 0;
  // iterateStatements uses SQLite's parser, so a semicolon inside a string is valid.
  for (const statement of db.iterateStatements(sql)) { count++; statement.free(); }
  if (count !== 1) throw new Error('Cast one query at a time. Remove any extra statements.');
  const statement = db.prepare(sql);
  try {
    const columns = statement.getColumnNames();
    const values = [];
    while (statement.step()) {
      if (values.length >= 200) throw new Error('More than 200 rows returned. Narrow your spell with WHERE or LIMIT.');
      const row = statement.get();
      if (row.some(value => typeof value === 'string' && value.length > 10000)) throw new Error('A result is too large for the spellbook.');
      values.push(row);
    }
    return { columns, values };
  } finally { statement.free(); }
}

export function sameResult(actual, expected, options = {}) {
  if (options.expectedColumns && JSON.stringify(actual.columns) !== JSON.stringify(options.expectedColumns)) return false;
  if (actual.columns.length !== expected.columns.length || actual.values.length !== expected.values.length) return false;
  if (options.ordered) return JSON.stringify(actual.values) === JSON.stringify(expected.values);
  // Compare multisets: order is not required by these lessons, but duplicates count.
  const rows = result => result.values.map(row => JSON.stringify(row)).sort();
  return JSON.stringify(rows(actual)) === JSON.stringify(rows(expected));
}

export function evaluate(SQL, lessonId, sql, exercise) {
  const baseLesson = lessons.find(item => item.id === lessonId);
  if (exercise && !baseLesson?.exercises?.[exercise]) throw new Error('This exercise could not be found.');
  const lesson = baseLesson && { ...baseLesson, ...baseLesson.exercises?.[exercise] };
  if (!lesson) throw new Error('This lesson could not be found.');
  let actual;
  let correct = true;
  let visibleMatch = false;
  for (let variant = 0; variant < 3; variant++) {
    const db = createDatabase(SQL, variant);
    try {
      const result = executeQuery(db, sql);
      const expected = executeQuery(db, lesson.solution);
      const match = sameResult(result, expected, lesson);
      if (!variant) { actual = result; visibleMatch = match; }
      correct &&= match;
    } finally { db.close(); }
  }
  const usesConcept = usesRequiredConcepts(sql, lesson.requires);
  let message = 'Your query runs, but its result does not match the request yet. Check the requested columns and conditions.';
  if (visibleMatch && !correct) message = 'This matches the current shelves, but not a changed catalog. Use the table relationships and conditions rather than fixed names or IDs.';
  if (correct && !usesConcept) message = `Your result is right. For this lesson, practice using ${[].concat(lesson.requires || []).map(word => word === 'LEFT' ? 'LEFT JOIN' : word).join(', ')} as requested.`;
  if (correct && usesConcept) message = lesson.success;
  return { result: actual, correct: correct && usesConcept, message };
}

export function usesRequiredConcepts(sql, required) {
  const words = keywords(sql);
  return !required || [].concat(required).every(word => words.includes(word));
}
