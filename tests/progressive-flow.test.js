import test from 'node:test';
import assert from 'node:assert/strict';
import { completeLesson, migrateLearning } from '../src/learning-progress.js';
test('both assisted and unassisted learners advance through three problems', () => {
  for (const assisted of [false, true]) {
    let state = completeLesson({ stage: 'guided', assisted, learned: true });
    assert.equal(state.guidedDone, true);
    assert.equal(state.stage, 'guided');
    state = completeLesson({ ...state, stage: 'independent' });
    assert.equal(state.independentDone, true);
    assert.equal(state.stage, 'independent');
    assert.equal(completeLesson({ ...state, stage: 'mastery' }).stage, 'done');
  }
});
test('previously earned mastery remains earned after the progression change', () => {
  const saved = {version:5, lessonId:'first-spark', progress:{'first-spark':'complete'}, learning:{'first-spark':{stage:'done', completedExercise:'independent', learned:true}}};
  assert.equal(migrateLearning(saved).learning['first-spark'].stage, 'done');
});
