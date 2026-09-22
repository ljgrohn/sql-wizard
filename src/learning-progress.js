import { migrateProgress, completeFirstSpark } from './first-spark-progress.js';

import { lessons } from './lessons.js';
export const progressVersion = 4;

const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
function migratePrevious(saved = {}) {
  if (saved.version >= 3) {
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

export function migrateLearning(saved = {}) {
  const migrated = migratePrevious(saved);
  const progress = { ...migrated.progress };
  const learning = { ...migrated.learning };
  for (const lesson of lessons.filter(item => item.tutorial)) {
    if (!learning[lesson.id]) {
      learning[lesson.id] = { stage: 'learn', assisted: false, learned: false, migrated: Boolean(progress[lesson.id] || migrated.drafts[lesson.id]) };
      delete progress[lesson.id];
    }
  }
  // Older saves addressed the five-trial prototype by position. Preserve the
  // current trial's identity when inserting new trials before it.
  const oldOrder = ['first-spark', 'light-the-ward', 'steady-flame', 'moonlight-tonic', 'empty-shelves'];
  const currentId = saved.lessonId || (saved.version < 4 || !saved.version ? oldOrder[saved.index] : lessons[saved.index]?.id);
  const index = Math.max(0, lessons.findIndex(lesson => lesson.id === currentId));
  return { ...migrated, version: progressVersion, index, lessonId: lessons[index].id, progress, learning };
}
