import { migrateProgress, completeFirstSpark } from './first-spark-progress.js';

const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
export function migrateLearning(saved = {}) {
  if (saved.version === 3) {
    const learning = { ...record(saved.learning) };
    for (const id of ['first-spark', 'light-the-ward']) {
      const state = record(learning[id]);
      learning[id] = { ...state, stage: ['learn', 'guided', 'independent', 'mastery', 'done'].includes(state.stage) ? state.stage : 'learn', assisted: state.assisted === true, learned: state.learned === true };
    }
    return { ...saved, progress: record(saved.progress), drafts: record(saved.drafts), editorSlots: record(saved.editorSlots), learning };
  }
  const migrated = migrateProgress(saved);
  const ward = { stage: 'learn', assisted: false, learned: false, migrated: Boolean(migrated.progress['light-the-ward'] || migrated.drafts['light-the-ward']) };
  delete migrated.progress['light-the-ward'];
  return { ...migrated, version: 3, learning: { 'first-spark': migrated.firstSpark, 'light-the-ward': ward } };
}

export const completeLesson = completeFirstSpark;
