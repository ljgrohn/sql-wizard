import '@fontsource/vt323/latin-400.css';
import './style.css';
import { createSqlEditor, initialSlots } from './sql-editor.js';
import { lessons, fixture, tableInfo } from './lessons.js';
import { matchesFilter, describeFilter, filterExplanation } from './row-filters.js';
import { stories, storyEpisode, restoreStory } from './stories.js';
import { createStoryPlayer } from './story-player.js';
import { sceneForLesson } from './scenes.js';
import { keywords } from './query-engine.js';
import { migrateLearning, completeLesson, progressVersion } from './learning-progress.js';

const storageKey = `sql-wizard-progress-v${progressVersion}`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('sql-wizard-progress-v3') || localStorage.getItem('sql-wizard-progress-v2') || localStorage.getItem('sql-wizard-progress-v1')) || {}; } catch { /* A fresh game also works without storage. */ }
if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
const validRecords = input => input && typeof input === 'object' && !Array.isArray(input) ? input : {};
saved = migrateLearning(saved);
const learning = saved.learning;
const story = restoreStory(saved.story);
let storyPlayer;
const progress = validRecords(saved.progress);
const drafts = validRecords(saved.drafts);
const editorSlots = validRecords(saved.editorSlots);
let editor;
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
const hasTeaching = () => Boolean(lessons[index]?.tutorial);
const learningState = () => learning[lessons[index]?.id];
const exercise = () => ['learn', 'done'].includes(learningState().stage) ? (learningState().stage === 'done' ? (learningState().completedExercise || 'independent') : 'guided') : learningState().stage;
const lesson = () => hasTeaching() ? { ...lessons[index], ...lessons[index].exercises[exercise()], slots: lessons[index].exercises[exercise()].slots || [] } : lessons[index];
const draftKey = () => hasTeaching() ? `${lesson().id}:${exercise()}` : lesson().id;
const learningStatus = (current = lessons[index]) => {
  const state = learning[current.id];
  return state.stage === 'done' ? `${current.topic} mastered` : progress[current.id] === 'guided' ? 'Guided completion · fresh challenge available' : state.learned ? `${current.topic} reviewed · practice in progress` : `Learn ${current.topic}`;
};

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ version: progressVersion, index, lessonId: lesson().id, progress, drafts, learning, editorSlots, story })); }
  catch { storageAvailable = false; }
  const notice = $('#save-state');
  if (notice) notice.textContent = storageAvailable ? 'Progress saved on this device' : 'Progress lasts for this session only';
}

function tableMarkup(columns, rows, caption) {
  return `<div class="table-scroll"><table><caption class="sr-only">${escape(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell === null ? '<span class="null">NULL</span>' : escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>${!rows.length ? '<p class="empty-table">No rows returned.</p>' : ''}</div>`;
}

function render() {
  editor?.destroy();
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
        <div class="header-actions"><span class="rank">APPRENTICE <span>${completed}/${lessons.length}</span></span><button id="story-journal" class="quiet-button">Story</button><button id="journey" class="quiet-button">Spellbook <span aria-hidden="true">☷</span></button></div>
      </header>
      <nav class="lesson-nav" aria-label="Apprentice trials">${lessons.map((l, i) => `<button data-lesson="${i}" ${i === index ? 'aria-current="step"' : ''}><span class="step-number">${progress[l.id] ? '✓' : `0${i + 1}`}</span><span>${escape(l.title)}</span></button>`).join('')}</nav>
      <main>
        <div class="world-grid">
          <section class="scene frame" aria-label="${escape(current.place)}">
            <img class="scene-art" src="${sceneForLesson(current).src}" alt="${escape(sceneForLesson(current).alt)}" />
            <div class="scene-location"><span class="live-dot" aria-hidden="true"></span> ${escape(current.place)} <span> / NIGHT 01</span></div>
            <div id="summons" class="summons" aria-hidden="true"><span>✧</span><span>◇</span><span>✧</span></div>
            <div class="dialogue"><span class="speaker">✦ ${escape(current.speaker || 'PROFESSOR QUILL')}</span><p id="dialogue-text">${escape(current.story)}</p><span class="dialogue-caret" aria-hidden="true">▼</span></div>
          </section>
          <aside class="side-panels">
            <section class="mission frame"><div class="eyebrow">TRIAL 0${index + 1} <span>${escape(current.topic)}</span></div><h1>${escape(current.title)}</h1><p>${escape(current.instruction)}</p>${hasTeaching() ? `<p class="learning-status">${escape(learningStatus())}</p>` : ''}</section>
            <section class="database frame" aria-labelledby="database-title">
              <div class="panel-heading"><h2 id="database-title">The archive</h2><span class="small-label">SOURCE TABLES</span></div>
              <div class="table-tabs" role="group" aria-label="Source tables">${current.tables.map(t => `<button data-table="${t}" aria-pressed="${t === selectedTable}">${t}</button>`).join('')}</div>
              <div id="source-table"></div><p id="table-description" class="schema-note"></p>
            </section>
          </aside>
        </div>
        ${hasTeaching() ? `<section class="learning-strip frame" aria-label="Learning steps"><span>${learningState().stage === 'done' ? `✓ ${lesson().topic} mastered` : learningState().stage === 'guided' || learningState().stage === 'learn' ? '1. Learn → 2. Try together' : '3. Try yourself → 4. Understand'}</span><button id="review-spell" class="quiet-button">Review this spell</button></section>` : ''}
        <div class="workbench-grid">
          <section class="editor-panel frame" aria-labelledby="editor-title">
            <div class="panel-heading"><h2 id="editor-title"><span class="cyan" aria-hidden="true">&gt;_</span> Your incantation</h2><span class="small-label">SQL QUERY</span></div>
            <p id="slot-guide" class="scaffold-note">${current.slots?.length ? current.slots.map(slot => escape(slot.label)).join(' · ') + ': type at the insertion point.' : 'Write your query below.'}</p>
            <div id="query" class="code-wrap"></div>
            ${current.slots?.length > 1 ? '<button id="next-slot" class="text-button">Next guided slot</button>' : ''}
            <div class="editor-actions"><div class="secondary-actions"><button id="hint" class="text-button">Need a hint?</button><button id="reset" class="text-button">Reset query</button></div><button id="cast" class="cast-button"><span aria-hidden="true">✦</span> CAST SPELL</button></div>
            <span id="keyboard-tip" class="keyboard-tip">Tab: two spaces / indent selection · Shift+Tab: outdent · Escape then Tab: leave editor · Ctrl / ⌘ + Enter: cast</span>
            <div id="hint-content" class="hint-content" hidden></div>
          </section>
          <section class="result-panel frame" aria-labelledby="result-title">
            <div class="panel-heading"><h2 id="result-title">Spell result</h2><span id="row-count" class="small-label">AWAITING QUERY</span></div>
            <div id="feedback" class="feedback" role="status" aria-live="polite"><span class="waiting-rune" aria-hidden="true">◇</span><p>The circle is quiet.<br><span>Write a query and cast your first spell.</span></p></div>
            <div id="result-table"></div><button id="next" class="next-button" hidden>${index === lessons.length - 1 ? 'Finish the chapter →' : 'Continue the story →'}</button>
          </section>
        </div>
        <details class="field-note"><summary><span>✧ FIELD NOTES</span> ${escape(current.topic)} <span class="note-open">Read the lesson +</span></summary><p>${escape(current.teaching)}</p>${current.tables.length > 1 ? '<p class="relationship">recipes.id → recipe_items.recipe_id<br>recipe_items.ingredient_id → ingredients.id<br>ingredients.id → stock.ingredient_id</p>' : ''}</details>
      </main>
      <footer><span>NO TIMERS. JUST A LITTLE MAGIC.</span><span id="save-state">Progress saved on this device</span></footer>
    </div>
    <dialog id="spellbook" class="spellbook"><div class="panel-heading"><h2>Your spellbook</h2><button id="close-book" class="quiet-button" aria-label="Close spellbook">Close ×</button></div><p class="book-intro">Restore the ward, one query at a time.</p><div class="book-lessons">${lessons.map((l, i) => `<button data-book-lesson="${i}"><span>${progress[l.id] ? '✦' : '◇'} ${escape(l.title)}</span><small>${l.tutorial ? learningStatus(l) : progress[l.id] ? progress[l.id] === 'guided' ? 'Completed with a worked example' : l.reward : l.topic}</small></button>`).join('')}</div><h3>Beyond the first trial</h3><p class="roadmap-copy">These chapters are planned next.</p><ul class="roadmap"><li><span>Herbarium</span> Patterns, sorting & missing values</li><li><span>Potion workshop</span> Calculations, grouping & HAVING</li><li><span>Creature sanctuary</span> Traits, pairings & missing relationships</li><li><span>Alchemy observatory</span> Subqueries & multi-step CTE rituals</li></ul><p class="book-footnote">Your progress stays in this browser. This build contains ${lessons.length} trials.</p></dialog>`;
  let doc = typeof drafts[draftKey()] === 'string' ? drafts[draftKey()] : current.starter;
  if (doc === current.legacyStarter) doc = current.starter;
  const slots = initialSlots(current, doc, editorSlots[draftKey()]);
  editor = createSqlEditor({ parent: $('#query'), doc, slots,
    onChange: (value, ranges) => { drafts[draftKey()] = value; editorSlots[draftKey()] = ranges; save(); },
    onCast: cast,
  });
  $('#next-slot')?.addEventListener('click', () => editor.nextSlot());
  renderSource();
  bind();
  if (hasTeaching()) {
    $('#app').insertAdjacentHTML('beforeend', tutorialMarkup());
    $('#review-spell').addEventListener('click', openTutorial);
    $('#start-practice').addEventListener('click', () => closeTutorial(false));
    $('#skip-teaching').addEventListener('click', () => closeTutorial(true));
    $('#spell-lesson').addEventListener('cancel', event => {
      if (learningState().stage === 'learn') event.preventDefault();
    });

    if (learningState().stage === 'done' || learningState().guidedDone && exercise() === 'guided' || learningState().independentDone && exercise() === 'independent') {
      solved = true;
      $('#next').hidden = false;
    }
    $('#next').textContent = learningState().stage === 'done' ? 'Continue the story →' : exercise() === 'guided' ? 'Try it yourself →' : 'Try a fresh challenge →';
  }
  if (hasTeaching()) renderLearnedScene();
  storyPlayer = createStoryPlayer($('#app'), { onPage: page => { story.pending.page = page; save(); }, onFinish: finishStory });
  save();
  offerStory();
}

function renderSource() {
  const info = tableInfo[selectedTable];
  const last = hasTeaching() && learningState().lastSuccess;
  const filter = last && lessons[index].exercises[last.exercise]?.rowFilter;
  const rows = fixture()[selectedTable];
  $('#source-table').innerHTML = filter && selectedTable === 'ingredients'
    ? `<p class="schema-note">Last successful filter: ${escape(describeFilter(filter, info.columns))}. All source records remain here.</p>` + tableMarkup([...info.columns, 'Filter check (annotation)'], rows.map(row => [...row, `${matchesFilter(row, filter) ? 'Included' : 'Excluded'}: ${filterExplanation(row, filter, info.columns)}`]), selectedTable)
    : tableMarkup(info.columns, rows, selectedTable);
  if (filter && selectedTable === 'ingredients') document.querySelectorAll('#source-table tbody tr').forEach((tr, i) => { tr.className = matchesFilter(rows[i], filter) ? 'matched-row' : 'excluded-row'; });
  $('#table-description').textContent = info.description;
  document.querySelectorAll('[data-table]').forEach(button => button.setAttribute('aria-pressed', button.dataset.table === selectedTable));
}

function renderLearnedScene() {
  const last = learningState().lastSuccess;
  if (!last) {
    const preview = lesson().scenePreview;
    if (!preview) return;
    const candidates = fixture().ingredients.filter(row => matchesFilter(row, preview.filter));
    $('#summons').classList.add('catalog-labels', 'active');
    $('#summons').innerHTML = `<small class="scene-filter-caption">${escape(preview.caption)}</small>${candidates.map(row => `<span>${escape(row[1])}</span>`).join('')}`;
    return;
  }
  $('#summons').classList.add('catalog-labels', 'active');
  $('#summons').innerHTML = last.result.values.map(row => `<span>${row.map(escape).join(' · ')}</span>`).join('');
  $('#dialogue-text').textContent = last.message;
  renderSource();
}

function cancelCast() {
  clearTimeout(timer);
  worker?.terminate();
  worker = undefined;
  running = false;
  castId++;
}

function goToLesson(nextIndex) {
  drafts[draftKey()] = editor.value;
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
  if (hasTeaching() && learningState().stage === 'learn') { openTutorial(); return; }
  const sql = editor.value;
  if (keywords(sql).includes('___')) {
    setFeedback('This earlier draft contains an empty placeholder (___). Replace it with SQL, or reset to use the guided insertion point.', 'mismatch');
    focusQuery();
    return;
  }
  const missing = editor.missingSlot();
  if (missing) {
    setFeedback(`Fill in the guided slot: ${missing.label}, then cast again.`, 'mismatch');
    focusQuery();
    return;
  }
  drafts[draftKey()] = sql;
  save();
  running = true;
  solved = false;
  $('#next').hidden = true;
  $('#result-table').innerHTML = '';
  if (!hasTeaching()) $('#summons').classList.remove('active');
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
        if (hasTeaching()) {
          learningState().lastSuccess = { exercise: exercise(), result: data.result, message: data.message };
          learning[lesson().id] = completeLesson(learningState());
          if (learningState().stage === 'done') progress[lesson().id] = 'complete';
          else if (learningState().stage === 'independent') progress[lesson().id] = 'guided';
          $('#next').textContent = learningState().stage === 'done' ? 'Continue the story →' : exercise() === 'guided' ? 'Try it yourself →' : 'Try a fresh challenge →';
          $('.learning-status').textContent = learningStatus();
          if (learningState().stage === 'done') $('.learning-strip > span').textContent = `✓ ${lesson().topic} mastered`;
        } else {
          progress[lesson().id] = progress[lesson().id] === 'complete' ? 'complete' : hintLevel === 3 ? 'guided' : 'complete';
        }
        save();
        if (hasTeaching()) renderLearnedScene();
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
    worker.postMessage({ id, lessonId: lesson().id, sql, exercise: hasTeaching() ? exercise() : undefined });
  } catch { fail('The archive could not start in this browser. Try refreshing the page.'); }
}

function explainError(message) {
  if (message.includes('no such column')) return `${message}. Check the column names in the source table.`;
  if (message.includes('syntax error')) return `${message}. Check the query structure and punctuation. The field notes can help.`;
  if (message.includes('no such table')) return `${message}. Use a table name shown in the archive.`;
  return message;
}

function bind() {
  $('.brand').addEventListener('click', event => { event.preventDefault(); goToLesson(0); });
  document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => goToLesson(Number(button.dataset.lesson))));
  document.querySelectorAll('[data-table]').forEach(button => button.addEventListener('click', () => { selectedTable = button.dataset.table; renderSource(); }));
  $('#cast').addEventListener('click', cast);
  $('#hint').addEventListener('click', () => {
    hintLevel = Math.min(hintLevel + 1, lesson().hints.length);
    if (hasTeaching() && exercise() === 'independent' && hintLevel === 3) { learningState().assisted = true; save(); }
    $('#hint-content').hidden = false;
    $('#hint-content').innerHTML = `<span class="speaker">QUILL’S HINT ${hintLevel}/${lesson().hints.length}${hintLevel === 3 ? ' · WORKED EXAMPLE' : ''}</span><pre>${escape(lesson().hints[hintLevel - 1])}</pre>`;
    $('#hint').textContent = hintLevel < lesson().hints.length ? 'Another hint?' : 'All hints shown';
    $('#hint').disabled = hintLevel === lesson().hints.length;
  });
  $('#reset').addEventListener('click', () => { cancelCast(); drafts[draftKey()] = lesson().starter; delete editorSlots[draftKey()]; render(); focusQuery(); });
  $('#next').addEventListener('click', () => {
    if (!solved) return;
    if (hasTeaching() && learningState().stage !== 'done') {
      learningState().stage = exercise() === 'guided' ? 'independent' : 'mastery';
      save(); render(); focusQuery(); return;
    }
    beginStory(`after:${lesson().id}`, 'transition', lessons[index + 1]?.id || null);
  });
  $('#journey').addEventListener('click', openBook);
  $('#story-journal').addEventListener('click', openStoryJournal);
  $('#close-book').addEventListener('click', () => $('#spellbook').close());
  document.querySelectorAll('[data-book-lesson]').forEach(button => button.addEventListener('click', () => goToLesson(Number(button.dataset.bookLesson))));
}

function focusQuery() {
  editor.focus();
}

function tutorialMarkup() {
  const tutorial = lessons[index].tutorial;
  return `<dialog id="spell-lesson" class="spellbook teaching-page" aria-labelledby="teaching-title">
    <span class="speaker">YOUR SPELLBOOK · ${escape(lesson().title)}</span>
    <h2 id="teaching-title" tabindex="-1">${escape(tutorial.title || 'Read the archive with SELECT and FROM')}</h2>
    ${learningState().migrated ? '<p class="migration-note">This lesson now includes independent practice. Your other trial progress and earlier draft are preserved; revisit this spell to earn mastery.</p>' : ''}
    ${learningState().migrated && typeof drafts[lesson().id] === 'string' ? `<details><summary>Your earlier draft</summary><pre>${escape(drafts[lesson().id])}</pre></details>` : ''}
    <h3>Learn the spell</h3>${tutorial.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}
    <h3>See it work</h3><p>${escape(tutorial.question || 'Quill asks: what strength is recorded for every ingredient?')}</p>
    <pre>${escape(tutorial.example)}</pre><p>${escape(tutorial.annotation)}</p>
    ${tableMarkup(tutorial.columns, fixture().ingredients.filter(row => matchesFilter(row, tutorial.rowFilter)).map(row => tutorial.sourceIndices.map(i => row[i])), 'Result of the example query')}
    <p>${escape(tutorial.next || 'Next, you will choose a different column together, then read the archive on your own.')}</p>
    <button id="start-practice" class="next-button">${learningState().stage === 'learn' ? 'Try together →' : 'Return to practice'}</button>
    ${learningState().stage === 'learn' ? '<button id="skip-teaching" class="text-button">Skip explanation — try independent practice</button>' : '<button id="skip-teaching" class="text-button" hidden>Skip</button>'}
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
  learningState().learned = true;
  if (learningState().stage === 'learn') learningState().stage = skip ? 'independent' : 'guided';
  save(); render(); focusQuery();
}

function openBook() {
  document.querySelectorAll('[data-book-lesson]').forEach(button => {
    const l = lessons[Number(button.dataset.bookLesson)];
    button.innerHTML = `<span>${progress[l.id] ? '✦' : '◇'} ${escape(l.title)}</span><small>${l.tutorial ? learningStatus(l) : progress[l.id] ? progress[l.id] === 'guided' ? 'Completed with a worked example' : l.reward : l.topic}</small>`;
  });
  $('#spellbook').showModal();
}


function offerStory() {
  if (story.pending) { showPendingStory(); return; }
  if (!story.seen.prologue) { beginStory('prologue', 'entry'); return; }
  if (!story.seen[lesson().id]) { beginStory(lesson().id, 'entry'); return; }
  if (hasTeaching() && learningState().stage === 'learn') openTutorial();
}

function beginStory(id, mode, target = null) {
  if (!storyEpisode(id)) return;
  cancelCast();
  $('#cast').disabled = false;
  $('#cast').innerHTML = '<span aria-hidden="true">✦</span> CAST SPELL';
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  story.pending = { id, mode, target, page: 0 };
  save(); showPendingStory();
}

function showPendingStory() {
  const pending = story.pending;
  const label = pending.mode === 'replay' ? 'Return to your lesson' : pending.mode === 'transition' ? (pending.target ? 'Follow the story →' : 'View your spellbook') : pending.id === 'prologue' ? 'Enter the academy →' : hasTeaching() ? 'Learn this spell →' : 'Begin the trial →';
  storyPlayer.open(storyEpisode(pending.id), pending.page, label);
}

function finishStory() {
  const pending = story.pending;
  story.seen[pending.id] = true;
  story.pending = null;
  save();
  if (pending.mode === 'transition') {
    const nextIndex = lessons.findIndex(item => item.id === pending.target);
    if (nextIndex >= 0) goToLesson(nextIndex);
    else openBook();
  } else if (pending.mode === 'entry') offerStory();
  else $('#story-journal').focus();
}

function openStoryJournal() {
  let journal = $('#story-journal-dialog');
  if (!journal) {
    journal = document.createElement('dialog'); journal.id = 'story-journal-dialog'; journal.className = 'spellbook';
    journal.setAttribute('aria-labelledby', 'journal-title'); $('#app').append(journal);
  }
  const ids = ['prologue', ...lessons.flatMap(item => [item.id, `after:${item.id}`])].filter(id => id === 'prologue' || story.seen[id]);
  journal.innerHTML = `<div class="panel-heading"><h2 id="journal-title">Your story so far</h2><button id="close-story-journal" class="quiet-button">Close ×</button></div><p class="book-intro">Revisit the scenes you have reached. Replaying a story does not change your lesson progress.</p><div class="book-lessons">${ids.map(id => `<button data-story="${id}">${escape(storyEpisode(id).title)}</button>`).join('')}</div>`;
  journal.querySelector('#close-story-journal').onclick = () => journal.close();
  journal.querySelectorAll('[data-story]').forEach(button => { button.onclick = () => beginStory(button.dataset.story, 'replay'); });
  journal.showModal();
}

render();
