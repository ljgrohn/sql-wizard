// Run against an already-running Vite dev or production preview server.
// Uses a fresh agent-browser session; never alters an existing browser save.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:4173';
const session = `sql-journey-${Date.now()}`;
const browser = (...args) => execFileSync('npx', ['--yes', 'agent-browser', '--session', session, ...args], { encoding: 'utf8', timeout: 60000 }).trim();
const evaluate = expression => JSON.parse(browser('eval', expression));
const click = selector => { browser('scrollintoview', selector); browser('click', selector); };
const typeQuery = sql => { browser('focus', '.cm-content'); browser('keyboard', 'inserttext', sql); browser('press', 'Control+Enter'); };
const trials = [
  ['The first spark', 'SELECT id FROM ingredients;', ['1','2','3','4']],
  ['Light the ward', 'SELECT name FROM ingredients WHERE glowing = 0;', ['Mushroom','Emberroot']],
  ['Potent ingredients', 'SELECT name FROM ingredients WHERE potency < 7;', ['Moonstone','Mushroom']],
  ['A steadier flame', 'SELECT name FROM ingredients WHERE potency >= 7 AND glowing = 0;', ['Emberroot']],
  ['The ingredient ledger', 'SELECT i.name, s.quantity FROM ingredients i JOIN stock s ON i.id = s.ingredient_id WHERE s.quantity > 0;', ['Crystal','8','Mushroom','12']],
  ['The moonlight recipe', "SELECT i.name, ri.quantity FROM recipes r JOIN recipe_items ri ON r.id = ri.recipe_id JOIN ingredients i ON i.id = ri.ingredient_id WHERE r.name = 'Ember draught';", ['Mushroom','3','Emberroot','1']],
  ['The empty shelf', 'SELECT i.name, s.quantity FROM ingredients i LEFT JOIN stock s ON i.id = s.ingredient_id WHERE s.ingredient_id IS NULL;', ['Emberroot','NULL']],
];
mkdirSync('artifacts/journey', { recursive: true });
try {
  browser('open', url);
  browser('wait', '#story-player[open]');
  click('#story-next'); browser('reload'); browser('wait', '#story-player[open]');
  assert.equal(browser('get','text','#story-title'), 'An unusual apprenticeship');
  click('#story-skip'); click('#story-skip');
  for (let i = 0; i < trials.length; i++) {
    const [title, sql, cells] = trials[i];
    browser('wait', '#spell-lesson[open]');
    assert.equal(browser('get','text','h1'),title);
    click('#skip-teaching');
    if (i === 0) {
      typeQuery('SELECT 123;'); browser('wait', '#feedback.mismatch');
      assert.equal(evaluate('document.querySelector("#next").hidden'),true);
      click('#reset');
    }
    typeQuery(sql); browser('wait', '#feedback.success');
    assert.deepEqual(evaluate('[...document.querySelectorAll("#result-table td")].map(cell=>cell.textContent)'),cells);
    assert.match(browser('get','text','.learning-status'), /mastered/);
    browser('reload'); browser('wait', '#next:not([hidden])');
    assert.match(browser('get','text','.learning-status'), /mastered/);
    if (i === 6) {
      browser('set','viewport','390','844');
      assert.equal(evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
      assert.equal(evaluate('document.querySelector("#summons").getBoundingClientRect().bottom <= document.querySelector(".dialogue").getBoundingClientRect().top'),true);
      browser('screenshot','artifacts/journey/final-mobile.png');
    }
    click('#next'); browser('wait','#story-player[open]');
    click('#story-next');
    if (i < trials.length - 1) { browser('wait','#story-player[open]'); click('#story-skip'); }
    console.log(`PASS ${title}: result, saved mastery, and story transition`);
  }
  browser('wait','#spellbook[open]');
  assert.equal(evaluate('[...document.querySelectorAll(".book-lessons small")].filter(node=>node.textContent.includes("mastered")).length'),7);
  const errors = browser('errors');
  assert.equal(errors,'',`Browser errors: ${errors}`);
  console.log('PASS production journey: 7/7 mastered, no browser errors');
} finally { browser('close'); }
