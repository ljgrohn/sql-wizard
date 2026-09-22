import test from 'node:test';
import assert from 'node:assert/strict';
import { initialSlots } from '../src/sql-editor.js';
import { lessons } from '../src/lessons.js';

test('every guided starter has a usable insertion point without executable markers', () => {
  const guided = lessons.flatMap(lesson => lesson.exercises ? Object.values(lesson.exercises) : [lesson]).filter(lesson => lesson.slots?.length);
  assert.equal(guided.length, 4);
  for (const lesson of guided) {
    assert.ok(!lesson.starter.includes('___'));
    const slots = initialSlots(lesson, lesson.starter);
    assert.equal(slots.length, lesson.slots.length);
    for (const [i, slot] of slots.entries()) {
      assert.equal(lesson.starter.slice(0, slot.from).endsWith(lesson.slots[i].after), true);
      assert.equal(slot.from, slot.to);
    }
  }
});

test('restored guided ranges preserve whitespace and typed content', () => {
  const lesson = { starter: 'SELECT \nFROM ingredients;', slots: [{ after: 'SELECT ', label: 'Column' }] };
  const doc = 'SELECT   name\nFROM ingredients;';
  const stored = [{ from: 7, to: 13, label: 'Column' }];
  assert.deepEqual(initialSlots(lesson, doc, JSON.parse(JSON.stringify(stored))), stored);
  assert.deepEqual(initialSlots(lesson, doc, [{ from: -1, to: 999 }]), []);
});
