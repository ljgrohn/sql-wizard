import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { lessons } from '../src/lessons.js';
import { practiceByLesson } from '../src/practice.js';
const session = `sql-campaign-${Date.now()}`;
const browser = (...args) => execFileSync('npx', ['--yes', 'agent-browser', '--session', session, ...args], { encoding: 'utf8', timeout: 60000 }).trim();
const evaluate = expression => JSON.parse(browser('eval', expression));
const click = selector => browser('eval', `document.querySelector(${JSON.stringify(selector)}).click()`);
const query = sql => { browser('focus', '.cm-content'); browser('keyboard', 'inserttext', sql); browser('press', 'Control+Enter'); };
mkdirSync('artifacts/campaign', { recursive: true });
try {
  browser('open', process.argv[2] || 'http://127.0.0.1:4175');
  browser('wait', '#story-player[open]'); click('#story-skip'); click('#story-skip'); click('#skip-teaching');
  const added = lessons.filter(lesson => lesson.storyPages);
  for (const lesson of added) {
    const index = lessons.indexOf(lesson);
    browser('select', '#lesson-select', String(index));
    browser('wait', '#story-player[open]'); click('#story-skip');
    browser('wait', '#spell-lesson[open]');
    browser('wait', '[data-example-result="0"] table');
    assert.ok(evaluate('document.querySelector("[data-example-result] table").rows.length > 0'));
    click('#skip-teaching');
    query(lesson.exercises.independent.solution); browser('wait', '#feedback.success');
    click('#next'); query(lesson.exercises.mastery.solution); browser('wait', '#feedback.success');
    assert.match(browser('get', 'text', '.learning-status'), /mastered/);
    if (['grouped-orders', 'restoration-pipeline', 'expedition-restoration'].includes(lesson.id)) {
      browser('reload'); browser('wait', '#next:not([hidden])');
      assert.match(browser('get', 'text', '.learning-status'), /mastered/);
      browser('screenshot', `artifacts/campaign/${lesson.id}.png`, '--full');
    }
    click('#workshop');
    click(`[data-practice-chapter="${lesson.id}"]`);
    if (evaluate('Boolean(document.querySelector("#story-player[open]"))')) click('#story-skip');
    browser('wait', '#craft-query');
    query(practiceByLesson[lesson.id][0].solution); browser('wait', '#craft-feedback.success');
    click('#leave-workshop'); browser('wait', '#query');
    console.log(`PASS ${lesson.id}: story, live example, independent mastery, crafting, return`);
  }
  // An assisted attempt requires a fresh mastery exercise; reloading must preserve that fact.
  const recovery = added[0];
  evaluate(`(() => { const s=JSON.parse(localStorage.getItem('sql-wizard-progress-v5')); delete s.progress[${JSON.stringify(recovery.id)}]; s.learning[${JSON.stringify(recovery.id)}]={stage:'independent',learned:true,assisted:true}; s.index=${lessons.indexOf(recovery)};s.lessonId=${JSON.stringify(recovery.id)};s.drafts[${JSON.stringify(recovery.id + ':independent')}]='';localStorage.setItem('sql-wizard-progress-v5',JSON.stringify(s));return true; })()`);
  browser('reload'); browser('wait', '#query'); query(recovery.exercises.independent.solution); browser('wait', '#feedback.success');
  assert.doesNotMatch(browser('get', 'text', '.learning-status'), /mastered/);
  browser('reload'); browser('wait', '#next:not([hidden])'); click('#next'); query(recovery.exercises.mastery.solution); browser('wait', '#feedback.success');
  assert.match(browser('get', 'text', '.learning-status'), /mastered/);
  browser('set', 'viewport', '390', '844');
  assert.equal(evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  browser('screenshot', 'artifacts/campaign/mobile.png', '--full');
  assert.equal(evaluate('[...document.images].every(img=>img.complete && img.naturalWidth>0)'), true);
  assert.equal(browser('errors'), '');
  console.log(`PASS ${added.length} added campaign lessons; recovery persistence; mobile; no browser errors`);
} finally { browser('close'); }
