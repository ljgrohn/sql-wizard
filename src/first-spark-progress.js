// Only the revised first trial changes meaning; retain other progress and drafts.
export function migrateProgress(saved = {}) {
  const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const progress = { ...record(saved.progress) };
  const drafts = { ...record(saved.drafts) };
  const previous = record(saved.firstSpark);
  const firstSpark = saved.version === 2 ? {
    ...previous,
    stage: ['learn', 'guided', 'independent', 'mastery', 'done'].includes(previous.stage) ? previous.stage : 'learn',
    assisted: previous.assisted === true,
    learned: previous.learned === true,
  } : { stage: 'learn', assisted: false, learned: false, migrated: Boolean(progress['first-spark'] || drafts['first-spark']) };
  if (saved.version !== 2) delete progress['first-spark'];
  return { version: 2, index: saved.index, progress, drafts, firstSpark };
}

export function completeFirstSpark(state) {
  if (state.stage === 'guided') return { ...state, guidedDone: true };
  if (state.stage === 'independent' && state.assisted) return { ...state, independentDone: true };
  return { ...state, completedExercise: state.stage === 'done' ? state.completedExercise : state.stage, stage: 'done', learned: true };
}
