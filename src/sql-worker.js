import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { evaluate } from './query-engine.js';

const engine = initSqlJs({ locateFile: () => wasmUrl });
self.onmessage = async ({ data }) => {
  try {
    const SQL = await engine;
    self.postMessage({ id: data.id, ...evaluate(SQL, data.lessonId, data.sql, data.exercise) });
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message || 'The spell could not be read. Try again.' });
  }
};
