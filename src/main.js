import '@fontsource/vt323/latin-400.css';
import './style.css';
import { lessons, fixture, tableInfo } from './lessons.js';

const storageKey = 'sql-wizard-progress-v1';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* A fresh game also works without storage. */ }
if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
const validRecords = input => input && typeof input === 'object' && !Array.isArray(input) ? input : {};
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
const lesson = () => lessons[index];

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ index, progress, drafts })); }
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
            <section class="mission frame"><div class="eyebrow">TRIAL 0${index + 1} <span>${escape(current.topic)}</span></div><h1>${escape(current.title)}</h1><p>${escape(current.instruction)}</p></section>
            <section class="database frame" aria-labelledby="database-title">
              <div class="panel-heading"><h2 id="database-title">The archive</h2><span class="small-label">SOURCE TABLES</span></div>
              <div class="table-tabs" role="group" aria-label="Source tables">${current.tables.map(t => `<button data-table="${t}" aria-pressed="${t === selectedTable}">${t}</button>`).join('')}</div>
              <div id="source-table"></div><p id="table-description" class="schema-note"></p>
            </section>
          </aside>
        </div>
        <div class="workbench-grid">
          <section class="editor-panel frame" aria-labelledby="editor-title">
            <div class="panel-heading"><h2 id="editor-title"><span class="cyan" aria-hidden="true">&gt;_</span> Your incantation</h2><span class="small-label">SQL QUERY</span></div>
            <label class="sr-only" for="query">SQL query</label><div class="code-wrap"><span class="code-prompt" aria-hidden="true">&gt;</span><textarea id="query" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="keyboard-tip" placeholder="SELECT name FROM ingredients;">${escape(typeof drafts[current.id] === 'string' ? drafts[current.id] : current.starter)}</textarea></div>
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
    <dialog id="spellbook" class="spellbook"><div class="panel-heading"><h2>Your spellbook</h2><button id="close-book" class="quiet-button" aria-label="Close spellbook">Close ×</button></div><p class="book-intro">Restore the ward, one query at a time.</p><div class="book-lessons">${lessons.map((l, i) => `<button data-book-lesson="${i}"><span>${progress[l.id] ? '✦' : '◇'} ${escape(l.title)}</span><small>${progress[l.id] ? progress[l.id] === 'guided' ? 'Completed with a worked example' : l.reward : l.topic}</small></button>`).join('')}</div><h3>Beyond the first trial</h3><p class="roadmap-copy">These chapters are planned next.</p><ul class="roadmap"><li><span>Herbarium</span> Patterns, sorting & missing values</li><li><span>Potion workshop</span> Calculations, grouping & HAVING</li><li><span>Creature sanctuary</span> Traits, pairings & missing relationships</li><li><span>Alchemy observatory</span> Subqueries & multi-step CTE rituals</li></ul><p class="book-footnote">Your progress stays in this browser. This first playable build contains five trials.</p></dialog>`;
  renderSource();
  bind();
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
  drafts[lesson().id] = $('#query').value;
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
  const sql = $('#query').value;
  drafts[lesson().id] = sql;
  save();
  running = true;
  solved = false;
  $('#next').hidden = true;
  $('#result-table').innerHTML = '';
  $('#summons').classList.remove('active');
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
        progress[lesson().id] = progress[lesson().id] === 'complete' ? 'complete' : hintLevel === 3 ? 'guided' : 'complete';
        save();
        $('#summons').classList.add('active');
        $('#dialogue-text').textContent = data.message;
        $('#next').hidden = false;
        const nav = document.querySelector(`[data-lesson="${index}"] .step-number`);
        nav.textContent = '✓';
        $('.rank span').textContent = `${lessons.filter(l => progress[l.id]).length}/${lessons.length}`;
      }
    };
    worker.onerror = event => { event.preventDefault(); fail('The archive could not load. Try casting again, or refresh the page.'); };
    timer = setTimeout(() => fail('This query took too long. Simplify it and check that your joins have matching keys.'), 8000);
    worker.postMessage({ id, lessonId: lesson().id, sql });
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
  $('#query').addEventListener('input', () => { drafts[lesson().id] = $('#query').value; save(); });
  $('#query').addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); cast(); } });
  $('#cast').addEventListener('click', cast);
  $('#hint').addEventListener('click', () => {
    hintLevel = Math.min(hintLevel + 1, 3);
    $('#hint-content').hidden = false;
    $('#hint-content').innerHTML = `<span class="speaker">QUILL’S HINT ${hintLevel}/3${hintLevel === 3 ? ' · WORKED EXAMPLE' : ''}</span><pre>${escape(lesson().hints[hintLevel - 1])}</pre>`;
    $('#hint').textContent = hintLevel < 3 ? 'Another hint?' : 'All hints shown';
    $('#hint').disabled = hintLevel === 3;
  });
  $('#reset').addEventListener('click', () => { cancelCast(); drafts[lesson().id] = lesson().starter; render(); $('#query').focus(); });
  $('#next').addEventListener('click', () => {
    if (!solved) return;
    if (index < lessons.length - 1) goToLesson(index + 1);
    else openBook();
  });
  $('#journey').addEventListener('click', openBook);
  $('#close-book').addEventListener('click', () => $('#spellbook').close());
  document.querySelectorAll('[data-book-lesson]').forEach(button => button.addEventListener('click', () => goToLesson(Number(button.dataset.bookLesson))));
}

function openBook() {
  document.querySelectorAll('[data-book-lesson]').forEach(button => {
    const l = lessons[Number(button.dataset.bookLesson)];
    button.innerHTML = `<span>${progress[l.id] ? '✦' : '◇'} ${escape(l.title)}</span><small>${progress[l.id] ? progress[l.id] === 'guided' ? 'Completed with a worked example' : l.reward : l.topic}</small>`;
  });
  $('#spellbook').showModal();
}

render();
