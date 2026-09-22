import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { evaluatePractice } from './practice.js';
import { evaluate, createDatabase, executeQuery } from './query-engine.js';

const engine = initSqlJs({ locateFile: () => wasmUrl });
self.onmessage = async ({ data }) => {
  try {
    const SQL = await engine;
    if (data.previewQueries) {
      const db = createDatabase(SQL);
      try { self.postMessage({ id: data.id, previews: data.previewQueries.map(sql => executeQuery(db, sql)) }); }
      finally { db.close(); }
      return;
    }
    self.postMessage({ id: data.id, ...(data.practiceId ? evaluatePractice(SQL, data.practiceId, data.sql) : evaluate(SQL, data.lessonId, data.sql, data.exercise)) });
  } catch (error) {
    if (data.previewQueries) {
      const db = createDatabase(SQL);
      try { self.postMessage({ id: data.id, previews: data.previewQueries.map(sql => executeQuery(db, sql)) }); }
      finally { db.close(); }
      return;
    }
    self.postMessage({ id: data.id, error: error.message || 'The spell could not be read. Try again.' });
  }
};
