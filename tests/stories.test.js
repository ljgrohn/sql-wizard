import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { stories, storyEpisode, restoreStory } from '../src/stories.js';
import { lessons } from '../src/lessons.js';
import { scenes, sceneForLesson } from '../src/scenes.js';
import { migrateLearning } from '../src/learning-progress.js';

test('every playable lesson has an illustrated entry and an ending scene', () => {
  for (const lesson of lessons) {
    assert.ok(storyEpisode(lesson.id)?.pages.length);
    assert.equal(storyEpisode(`after:${lesson.id}`).pages.length, 1);
    assert.ok(existsSync(new URL(`../public${sceneForLesson(lesson).src}`, import.meta.url)));
  }
  for (const chapter of Object.values(stories)) {
    for (const page of [...chapter.pages, ...(chapter.after ? [chapter.after] : [])]) {
      assert.ok(page.text.length > 20);
      assert.ok(existsSync(new URL(`../public${scenes[page.scene].src}`, import.meta.url)));
      assert.ok(scenes[page.scene].alt);
    }
  }
});

test('reload preserves the prologue page and the destination of an unfinished transition', () => {
  const story = { seen: { prologue: true, 'first-spark': true }, pending: { id: 'after:first-spark', mode: 'transition', page: 0, target: 'light-the-ward' } };
  assert.deepEqual(restoreStory(JSON.parse(JSON.stringify(story))), story);
  assert.equal(restoreStory({pending:{id:'prologue',mode:'entry',page:1}}).pending.page, 1);
  assert.equal(restoreStory({pending:{id:'prologue',mode:'entry',page:999}}).pending.page, 1);
  assert.equal(restoreStory({pending:{id:'unknown',mode:'entry'}}).pending, null);
});

test('story migration and replay do not grant or reset learning progress', () => {
  const original = { version:4, lessonId:'potent-ingredients', progress:{'first-spark':'complete'}, learning:{'first-spark':{stage:'done',learned:true}}, drafts:{'potent-ingredients:guided':'SELECT name\nFROM ingredients;'}, story:{seen:{prologue:true},pending:{id:'prologue',mode:'replay',page:1,target:null}} };
  const migrated = migrateLearning(original);
  assert.deepEqual(migrated.story, original.story);
  assert.equal(migrated.progress['first-spark'], 'complete');
  assert.equal(migrated.progress['potent-ingredients'], undefined);
  assert.deepEqual(migrated.drafts, original.drafts);
  assert.deepEqual(restoreStory(null), {seen:{},pending:null});
});
