import '@fontsource/vt323/latin-400.css';
import './style.css';
import { lessons, fixture, tableInfo } from './lessons.js';
import { migrateProgress, completeFirstSpark } from './first-spark-progress.js';

const storageKey = 'sql-wizard-progress-v2';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('sql-wizard-progress-v1')) || {}; } catch { /* A fresh game also works without storage. */ }
if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
const validRecords = input => input && typeof input === 'object' && !Array.isArray(input) ? input : {};
saved = migrateProgress(saved);
let firstSpark = saved.firstSpark;
const progress = validRecords(saved.progress);
const drafts = validRecords(saved.drafts);
let index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < lessons.length ? saved.index : 0;
let selectedTable = 'ingredients';
let hintLevel = 0;
let worker;
let timer;
let running = false;
let storageAvailable = true;
let castId = 0;
let solved = false;
const $ = selector => document.querySelector(selector);
const isFirst = () => lessons[index]?.id === 'first-spark';
const exercise = () => ['learn', 'done'].includes(firstSpark.stage) ? (firstSpark.stage === 'done' ? (firstSpark.completedExercise || 'independent') : 'guided') : firstSpark.stage;
const lesson = () => isFirst() ? { ...lessons[index], ...lessons[index].exercises[exercise()] } : lessons[index];
const draftKey = () => isFirst() ? `first-spark:${exercise()}` : lesson().id;
const firstStatus = () => firstSpark.stage === 'done' ? 'SELECT / FROM mastered' : progress['first-spark'] === 'guided' ? 'Guided completion · fresh challenge available' : firstSpark.learned ? 'SELECT / FROM reviewed · practice in progress' : 'Learn SELECT / FROM';

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ version: 2, index, progress, drafts, firstSpark })); }
  catch { storageAvailable = false; }
  const notice = $('#save-state');
  if (notice) notice.textContent = storageAvailable ? 'Progress saved on this device' : 'Progress lasts for this session only';
}

function tableMarkup(columns, rows, caption) {
  return `<div class="table-scroll"><table><caption class="sr-only">${escape(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell === null ? '<span class="null">NULL</span>' : escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>${!rows.length ? '<p class="empty-table">No rows returned.</p>' : ''}</div>`;
}

function render() {
  if (!lessons.length) {
    $('#app').innerHTML = '<main class="game-shell"><h1>SQL Wizard</h1><p>The archive is being prepared. Your trials will appear here.</p></main>';
    return;
  }
  const current = lesson();
  selectedTable = current.tables.includes(selectedTable) ? selectedTable : current.tables[0];
  solved = false;
  hintLevel = 0;
  const completed = lessons.filter(l => progress[l.id]).length;
  $('#app').innerHTML = `
    <div class="game-shell">
      <header class="masthead">
        <a class="brand" href="#" aria-label="SQL Wizard home"><span class="brand-star" aria-hidden="true">✦</span> SQL WIZARD<span class="edition">THE FIRST SPARK</span></a>
        <div class="header-actions"><span class="rank">APPRENTICE <span>${completed}/${lessons.length}</span></span><button id="journey" class="quiet-button">Spellbook <span aria-hidden="true">☷</span></button></div>
      </header>
      <nav class="lesson-nav" aria-label="Apprentice trials">${lessons.map((l, i) => `<button data-lesson="${i}" ${i === index ? 'aria-current="step"' : ''}><span class="step-number">${progress[l.id] ? '✓' : `0${i + 1}`}</span><span>${escape(l.title)}</span></button>`).join('')}</nav>
      <main>
        <div class="world-grid">
          <section class="scene frame" aria-label="The academy archive">
            <img class="scene-art" src="/art/archive.png" alt="An apprentice wizard and owl in a cyan and magenta pixel-art library, beside a summoning circle." />
            <div class="scene-location"><span class="live-dot" aria-hidden="true"></span> ${escape(current.place)} <span> / NIGHT 01</span></div>
            <div id="summons" class="summons" aria-hidden="true"><span>✧</span><span>◇</span><span>✧</span></div>
            <div class="dialogue"><span class="speaker">✦ PROFESSOR QUILL</span><p id="dialogue-text">${escape(current.story)}</p><span class="dialogue-caret" aria-hidden="true">▼</span></div>
          </section>
          <aside class="side-panels">
            <section class="mission frame"><div class="eyebrow">TRIAL 0${index + 1} <span>${escape(current.topic)}</span></div><h1>${escape(current.title)}</h1><p>${escape(current.instruction)}</p>${isFirst() ? `<p class="learning-status">${escape(firstStatus())}</p>` : ''}</section>
            <section class="database frame" aria-labelledby="database-title">
              <div class="panel-heading"><h2 id="database-title">The archive</h2><span class="small-label">SOURCE TABLES</span></div>
              <div class="table-tabs" role="group" aria-label="Source tables">${current.tables.map(t => `<button data-table="${t}" aria-pressed="${t === selectedTable}">${t}</button>`).join('')}</div>
              <div id="source-table"></div><p id="table-description" class="schema-note"></p>
            </section>
          </aside>
        </div>
        ${isFirst() ? `<section class="learning-strip frame" aria-label="Learning steps"><span>${firstSpark.stage === 'done' ? '✓ SELECT / FROM mastered' : firstSpark.stage === 'guided' || firstSpark.stage === 'learn' ? '1. Learn → 2. Try together' : '3. Try yourself → 4. Understand'}</span><button id="review-spell" class="quiet-button">Review this spell</button></section>` : ''}
        <div class="workbench-grid">
          <section class="editor-panel frame" aria-labelledby="editor-title">
            <div class="panel-heading"><h2 id="editor-title"><span class="cyan" aria-hidden="true">&gt;_</span> Your incantation</h2><span class="small-label">SQL QUERY</span></div>
            ${isFirst() && exercise() === 'guided' ? '<p id="slot-guide" class="scaffold-note">Insert the column name after SELECT. The table name is already in place.</p>' : ''}
            <label class="sr-only" for="query">SQL query</label><div class="code-wrap"><span class="code-prompt" aria-hidden="true">&gt;</span><textarea id="query" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="keyboard-tip" placeholder="${isFirst() ? 'Write your query here' : 'SELECT name FROM ingredients;'}">${escape(typeof drafts[draftKey()] === 'string' ? drafts[draftKey()] : current.starter)}</textarea></div>
            <div class="editor-actions"><div class="secondary-actions"><button id="hint" class="text-button">Need a hint?</button><button id="reset" class="text-button">Reset query</button></div><button id="cast" class="cast-button"><span aria-hidden="true">✦</span> CAST SPELL</button></div>
            <span id="keyboard-tip" class="keyboard-tip">Ctrl / ⌘ + Enter to cast</span>
            <div id="hint-content" class="hint-content" hidden></div>
          </section>
          <section class="result-panel frame" aria-labelledby="result-title">
            <div class="panel-heading"><h2 id="result-title">Spell result</h2><span id="row-count" class="small-label">AWAITING QUERY</span></div>
            <div id="feedback" class="feedback" role="status" aria-live="polite"><span class="waiting-rune" aria-hidden="true">◇</span><p>The circle is quiet.<br><span>Write a query and cast your first spell.</span></p></div>
            <div id="result-table"></div><button id="next" class="next-button" hidden>${index === lessons.length - 1 ? 'View your spellbook' : 'Continue your training →'}</button>
          </section>
        </div>
        <details class="field-note"><summary><span>✧ FIELD NOTES</span> ${escape(current.topic)} <span class="note-open">Read the lesson +</span></summary><p>${escape(current.teaching)}</p>${current.tables.length > 1 ? '<p class="relationship">recipes.id → recipe_items.recipe_id<br>recipe_items.ingredient_id → ingredients.id<br>ingredients.id → stock.ingredient_id</p>' : ''}</details>
      </main>
      <footer><span>NO TIMERS. JUST A LITTLE MAGIC.</span><span id="save-state">Progress saved on this device</span></footer>
    </div>
    <dialog id="spellbook" class="spellbook"><div class="panel-heading"><h2>Your spellbook</h2><button id="close-book" class="quiet-button" aria-label="Close spellbook">Close ×</button></div><p class="book-intro">Restore the ward, one query at a time.</p><div class="book-lessons">${lessons.map((l, i) => `<button data-book-lesson="${i}"><span>${progress[l.id] ? '✦' : '◇'} ${escape(l.title)}</span><small>${l.id === 'first-spark' ? firstStatus() : progress[l.id] ? progress[l.id] === 'guided' ? 'Completed with a worked example' : l.reward : l.topic}</small></button>`).join('')}</div><h3>Beyond the first trial</h3><p class="roadmap-copy">These chapters are planned next.</p><ul class="roadmap"><li><span>Herbarium</span> Patterns, sorting & missing values</li><li><span>Potion workshop</span> Calculations, grouping & HAVING</li><li><span>Creature sanctuary</span> Traits, pairings & missing relationships</li><li><span>Alchemy observatory</span> Subqueries & multi-step CTE rituals</li></ul><p class="book-footnote">Your progress stays in this browser. This first playable build contains five trials.</p></dialog>`;
  renderSource();
  bind();
  if (isFirst()) {
    $('#app').insertAdjacentHTML('beforeend', tutorialMarkup());
    $('#review-spell').addEventListener('click', openTutorial);
    $('#start-practice').addEventListener('click', () => closeTutorial(false));
    $('#skip-teaching').addEventListener('click', () => closeTutorial(true));
    $('#spell-lesson').addEventListener('cancel', event => {
      if (firstSpark.stage === 'learn') event.preventDefault();
    });
    if (firstSpark.stage === 'learn') openTutorial();
    if (firstSpark.stage === 'done' || firstSpark.guidedDone && exercise() === 'guided' || firstSpark.independentDone && exercise() === 'independent') {
      solved = true;
      $('#next').hidden = false;
    }
    $('#next').textContent = firstSpark.stage === 'done' ? 'Continue your training →' : exercise() === 'guided' ? 'Try it yourself →' : 'Try a fresh challenge →';
  }
  save();
}

function renderSource() {
  const info = tableInfo[selectedTable];
  $('#source-table').innerHTML = tableMarkup(info.columns, fixture()[selectedTable], selectedTable);
  $('#table-description').textContent = info.description;
  document.querySelectorAll('[data-table]').forEach(button => button.setAttribute('aria-pressed', button.dataset.table === selectedTable));
}

function cancelCast() {
  clearTimeout(timer);
  worker?.terminate();
  worker = undefined;
  running = false;
  castId++;
}

function goToLesson(nextIndex) {
  drafts[draftKey()] = $('#query').value;
  cancelCast();
  index = nextIndex;
  save();
  render();
}

function setFeedback(message, type) {
  $('#feedback').className = `feedback ${type}`;
  $('#feedback').innerHTML = `<span class="feedback-icon" aria-hidden="true">${type === 'success' ? '✦' : type === 'error' ? '!' : '◇'}</span><p>${escape(message)}</p>`;
}

function cast() {
  if (running) return;
  if (isFirst() && firstSpark.stage === 'learn') { openTutorial(); return; }
  const sql = $('#query').value;
  if (isFirst() && exercise() === 'guided' && /^\s*SELECT\s+FROM\b/i.test(sql)) {
    setFeedback('Fill in the column name after SELECT before casting. Try name.', 'mismatch');
    focusQuery();
    return;
  }
  drafts[draftKey()] = sql;
  save();
  running = true;
  solved = false;
  $('#next').hidden = true;
  $('#result-table').innerHTML = '';
  if (!isFirst()) $('#summons').classList.remove('active');
  $('#cast').disabled = true;
  $('#cast').textContent = 'READING THE ARCHIVE…';
  $('#row-count').textContent = 'CASTING';
  setFeedback('Your incantation is taking shape…', 'pending');
  const id = ++castId;
  const finish = () => {
    clearTimeout(timer);
    worker?.terminate();
    worker = undefined;
    running = false;
    $('#cast').disabled = false;
    $('#cast').innerHTML = '<span aria-hidden="true">✦</span> CAST SPELL';
  };
  const fail = message => { finish(); $('#row-count').textContent = 'TRY AGAIN'; setFeedback(message, 'error'); };
  try {
    worker = new Worker(new URL('./sql-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.id !== castId) return;
      finish();
      if (data.error) { $('#row-count').textContent = 'TRY AGAIN'; setFeedback(explainError(data.error), 'error'); return; }
      $('#row-count').textContent = `${data.result.values.length} ROW${data.result.values.length === 1 ? '' : 'S'} RETURNED`;
      $('#result-table').innerHTML = tableMarkup(data.result.columns, data.result.values, 'Your query result');
      setFeedback(data.message, data.correct ? 'success' : 'mismatch');
      if (data.correct) {
        solved = true;
        if (isFirst()) {
          firstSpark = completeFirstSpark(firstSpark);
          if (firstSpark.stage === 'done') progress['first-spark'] = 'complete';
          else if (firstSpark.stage === 'independent') progress['first-spark'] = 'guided';
          $('#next').textContent = firstSpark.stage === 'done' ? 'Continue your training →' : exercise() === 'guided' ? 'Try it yourself →' : 'Try a fresh challenge →';
          $('.learning-status').textContent = firstStatus();
          if (firstSpark.stage === 'done') $('.learning-strip > span').textContent = '✓ SELECT / FROM mastered';
        } else {
          progress[lesson().id] = progress[lesson().id] === 'complete' ? 'complete' : hintLevel === 3 ? 'guided' : 'complete';
        }
        save();
        if (isFirst()) {
          $('#summons').classList.add('catalog-labels');
          $('#summons').innerHTML = data.result.values.map(row => `<span>${row.map(escape).join(' · ')}</span>`).join('');
        }
        $('#summons').classList.add('active');
        $('#dialogue-text').textContent = data.message;
        $('#next').hidden = false;
        const nav = document.querySelector(`[data-lesson="${index}"] .step-number`);
        nav.textContent = progress[lesson().id] ? '✓' : `0${index + 1}`;
        $('.rank span').textContent = `${lessons.filter(l => progress[l.id]).length}/${lessons.length}`;
      }
    };
    worker.onerror = event => { event.preventDefault(); fail('The archive could not load. Try casting again, or refresh the page.'); };
    timer = setTimeout(() => fail('This query took too long. Simplify it and check that your joins have matching keys.'), 8000);
    worker.postMessage({ id, lessonId: lesson().id, sql, exercise: isFirst() ? exercise() : undefined });
  } catch { fail('The archive could not start in this browser. Try refreshing the page.'); }
}

function explainError(message) {
  if (message.includes('no such column')) return `${message}. Check the column names in the source table. If you see ___, replace it with your answer.`;
  if (message.includes('syntax error')) return `${message}. Check the query structure and punctuation. The field notes can help.`;
  if (message.includes('no such table')) return `${message}. Use a table name shown in the archive.`;
  return message;
}

function bind() {
  $('.brand').addEventListener('click', event => { event.preventDefault(); goToLesson(0); });
  document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => goToLesson(Number(button.dataset.lesson))));
  document.querySelectorAll('[data-table]').forEach(button => button.addEventListener('click', () => { selectedTable = button.dataset.table; renderSource(); }));
  $('#query').addEventListener('input', () => { drafts[draftKey()] = $('#query').value; save(); });
  $('#query').addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); cast(); } });
  $('#cast').addEventListener('click', cast);
  $('#hint').addEventListener('click', () => {
    hintLevel = Math.min(hintLevel + 1, lesson().hints.length);
    if (isFirst() && exercise() === 'independent' && hintLevel === 3) { firstSpark.assisted = true; save(); }
    $('#hint-content').hidden = false;
    $('#hint-content').innerHTML = `<span class="speaker">QUILL’S HINT ${hintLevel}/${lesson().hints.length}${hintLevel === 3 ? ' · WORKED EXAMPLE' : ''}</span><pre>${escape(lesson().hints[hintLevel - 1])}</pre>`;
    $('#hint').textContent = hintLevel < lesson().hints.length ? 'Another hint?' : 'All hints shown';
    $('#hint').disabled = hintLevel === lesson().hints.length;
  });
  $('#reset').addEventListener('click', () => { cancelCast(); drafts[draftKey()] = lesson().starter; render(); focusQuery(); });
  $('#next').addEventListener('click', () => {
    if (!solved) return;
    if (isFirst() && firstSpark.stage !== 'done') {
      firstSpark.stage = exercise() === 'guided' ? 'independent' : 'mastery';
      save(); render(); focusQuery(); return;
    }
    if (index < lessons.length - 1) goToLesson(index + 1);
    else openBook();
  });
  $('#journey').addEventListener('click', openBook);
  $('#close-book').addEventListener('click', () => $('#spellbook').close());
  document.querySelectorAll('[data-book-lesson]').forEach(button => button.addEventListener('click', () => goToLesson(Number(button.dataset.bookLesson))));
}

function focusQuery() {
  const query = $('#query');
  query.focus();
  if (isFirst() && exercise() === 'guided' && query.value === lesson().starter) query.setSelectionRange(7, 7);
}

function tutorialMarkup() {
  const tutorial = lessons[index].tutorial;
  return `<dialog id="spell-lesson" class="spellbook teaching-page" aria-labelledby="teaching-title">
    <span class="speaker">YOUR SPELLBOOK · FIRST SPARK</span>
    <h2 id="teaching-title" tabindex="-1">Read the archive with SELECT and FROM</h2>
    ${firstSpark.migrated ? '<p class="migration-note">This lesson now includes independent practice. Your other trial progress and earlier draft are preserved; revisit this spell to earn mastery.</p>' : ''}
    ${firstSpark.migrated && typeof drafts['first-spark'] === 'string' ? `<details><summary>Your earlier draft</summary><pre>${escape(drafts['first-spark'])}</pre></details>` : ''}
    <h3>Learn the spell</h3>${tutorial.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}
    <h3>See it work</h3><p>Quill asks: what strength is recorded for every ingredient?</p>
    <pre>${escape(tutorial.example)}</pre><p>${escape(tutorial.annotation)}</p>
    ${tableMarkup(tutorial.columns, fixture().ingredients.map(row => tutorial.sourceIndices.map(i => row[i])), 'Result of the example query')}
    <p>Next, you will choose a different column together, then read the archive on your own.</p>
    <button id="start-practice" class="next-button">${firstSpark.stage === 'learn' ? 'Try together →' : 'Return to practice'}</button>
    ${firstSpark.stage === 'learn' ? '<button id="skip-teaching" class="text-button">I know SELECT / FROM — skip to independent practice</button>' : '<button id="skip-teaching" class="text-button" hidden>Skip</button>'}
  </dialog>`;
}

function openTutorial() {
  if (running) cancelCast();
  $('#cast').disabled = false;
  $('#cast').innerHTML = '<span aria-hidden="true">✦</span> CAST SPELL';
  $('#spell-lesson').showModal();
  $('#teaching-title').focus();
}

function closeTutorial(skip) {
  $('#spell-lesson').close();
  firstSpark.learned = true;
  if (firstSpark.stage === 'learn') firstSpark.stage = skip ? 'independent' : 'guided';
  save(); render(); focusQuery();
}

function openBook() {
  document.querySelectorAll('[data-book-lesson]').forEach(button => {
    const l = lessons[Number(button.dataset.bookLesson)];
    button.innerHTML = `<span>${progress[l.id] ? '✦' : '◇'} ${escape(l.title)}</span><small>${l.id === 'first-spark' ? firstStatus() : progress[l.id] ? progress[l.id] === 'guided' ? 'Completed with a worked example' : l.reward : l.topic}</small>`;
  });
  $('#spellbook').showModal();
}

render();
