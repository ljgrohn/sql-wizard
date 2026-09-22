import { lessons, fixture, tableInfo } from './lessons.js';
import { practiceByLesson, practiceProblems, getPracticeProblem } from './practice.js';
import { createSqlEditor } from './sql-editor.js';

const storageKey = 'sql-wizard-workshop-v1';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const table = (columns, rows) => `<div class="table-scroll"><table><thead><tr>${columns.map(c => `<th scope="col">${escape(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell === null ? '<span class="null">NULL</span>' : escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

export function openPractice(root, lessonId, onExit, { resume = false } = {}) {
  let saved = {};
  try { saved = record(JSON.parse(localStorage.getItem(storageKey))); } catch { /* Session-only play works too. */ }
  const drafts = record(saved.drafts), crafted = record(saved.crafted), assisted = record(saved.assisted);
  let current = getPracticeProblem(saved.current);
  if (!current || !resume && current.lessonId !== lessonId) current = practiceByLesson[lessonId][0];
  let editor, worker, timer, hint = 0, running = false, awarded = false, storageAvailable = true;
  const $ = selector => root.querySelector(selector);
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ current: current.id, drafts, crafted, assisted })); }
    catch { storageAvailable = false; }
    if ($('#workshop-save')) $('#workshop-save').textContent = storageAvailable ? 'Crafts and drafts saved on this device' : 'Crafts last for this session only';
  }
  function stop() { clearTimeout(timer); worker?.terminate(); worker = undefined; running = false; }
  function leave() { stop(); editor?.destroy(); onExit(); }
  function select(problem) { stop(); current = problem; save(); render(); $('#craft-title').focus(); }
  function feedback(message, type) { $('#craft-feedback').className = `feedback ${type}`; $('#craft-feedback').textContent = message; }
  function menu() {
    stop(); editor?.destroy(); editor = undefined;
    root.innerHTML = `<div class="game-shell"><header class="masthead"><div class="brand">✦ PRACTICE<span class="edition">YOUR MAGIC WORKSHOP</span></div><button id="leave-workshop" class="quiet-button">Return to lessons →</button></header><main><h1 tabindex="-1" id="practice-title">Choose a chapter</h1><p class="craft-story">Practice a familiar spell or explore a new one. Each chapter has three more problems that craft spells, potions, and charms. Your lesson progress stays saved.</p><button id="resume-practice" class="quiet-button">Resume ${escape(current.title)} →</button><div class="practice-chapters">${lessons.map((l, i) => `<button class="frame practice-chapter" data-practice-chapter="${l.id}"><span class="speaker">CHAPTER ${String(i + 1).padStart(2, '0')}</span><strong>${escape(l.title)}</strong><span>${escape(l.topic)}</span><small>${practiceByLesson[l.id].filter(p => crafted[p.id]).length} of ${practiceByLesson[l.id].length} crafted · 3 practice problems</small></button>`).join('')}</div></main></div>`;
    $('#leave-workshop').onclick = leave;
    $('#resume-practice').onclick = () => select(current);
    root.querySelectorAll('[data-practice-chapter]').forEach(button => {
      button.onclick = () => select(practiceByLesson[button.dataset.practiceChapter][0]);
    });
    $('#practice-title').focus();
    window.scrollTo(0, 0);
  }
  function render() {
    editor?.destroy(); hint = 0; awarded = false;
    const group = practiceByLesson[current.lessonId];
    root.innerHTML = `<div class="game-shell workshop-shell">
      <header class="masthead"><div class="brand"><span class="brand-star">✦</span> THE WORKSHOP<span class="edition">PRACTICE MAKES MAGIC</span></div><div class="header-actions"><button id="practice-menu" class="quiet-button">Practice</button><button id="leave-workshop" class="quiet-button">Return to lessons →</button></div></header>
      <label class="chapter-jump">Practice a concept <select id="practice-select">${lessons.map(l => `<option value="${l.id}" ${l.id === current.lessonId ? 'selected' : ''}>${escape(l.title)}</option>`).join('')}</select></label>
      <nav class="lesson-nav" aria-label="Practice stages">${lessons.map((l, i) => `<button data-practice-stage="${l.id}" ${l.id === current.lessonId ? 'aria-current="step"' : ''}><span class="step-number">${String(i + 1).padStart(2, '0')}</span><span>${escape(l.topic)} · ${practiceByLesson[l.id].filter(p => crafted[p.id]).length}/3</span></button>`).join('')}</nav>
      <section class="workshop-banner frame"><img src="/art/practice-workbench.png" alt="The blue-cloaked apprentice and her younger sister practice together at a moonlit workbench with a cauldron, spellbook, and potion bottles."/><div><span class="speaker">IONA’S OPEN WORKSHOP</span><h1>Little spells. Lasting practice.</h1><p>The academy needs everyday magic, from reading lights to practice brews. Read the request, work out the SQL, and craft something useful. Every stage has three commissions. Revisit them whenever you like.</p></div></section>
      <div class="craft-choices" role="group" aria-label="Crafting problems">${group.map((p, i) => `<button data-problem="${p.id}" class="frame" aria-pressed="${p.id === current.id}"><span class="speaker">COMMISSION 0${i + 1} ${crafted[p.id] ? '✓' : '◇'}</span><strong>${escape(p.title)}</strong><small>${escape(p.reward.kind)} · ${crafted[p.id] ? crafted[p.id].independent ? 'Crafted independently' : 'Crafted with an example' : 'Not crafted yet'}</small></button>`).join('')}</div>
      <div class="workbench-grid"><section class="editor-panel frame"><span class="speaker">CRAFT A ${escape(current.reward.kind.toUpperCase())}</span><h2 id="craft-title" tabindex="-1">${escape(current.title)}</h2><p class="craft-story">${escape(current.story)}</p><p class="craft-request">${escape(current.instruction)}</p><div id="craft-query" class="code-wrap"></div><div class="editor-actions"><div class="secondary-actions"><button id="craft-hint" class="text-button">Need a hint?</button><button id="craft-reset" class="text-button">Start a fresh attempt</button></div><div class="cast-controls"><button id="craft-cast" class="cast-button">✦ CRAFT ${current.reward.kind.toUpperCase()}</button><button id="craft-next" class="next-button" hidden>${group.indexOf(current) === group.length - 1 ? 'Choose chapter →' : 'Next →'}</button></div></div><p class="keyboard-tip">Ctrl / ⌘ + Enter: craft · Escape then Tab: leave editor</p><div id="craft-hints" class="hint-content" hidden></div></section>
      <section class="result-panel frame"><div class="panel-heading"><h2>Your creation</h2><span class="small-label">${escape(current.reward.name)}</span></div><p class="craft-story">${escape(current.reward.description)}</p><div id="craft-feedback" class="feedback" role="status" aria-live="polite">Your workbench is ready. Solve the request to make this creation.</div><div id="craft-result"></div></section></div>
      <section class="database frame craft-archive"><div class="panel-heading"><h2>The archive</h2><span class="small-label">SOURCE TABLES</span></div><div class="table-tabs" role="group" aria-label="Crafting source tables">${current.tables.map((name, i) => `<button data-craft-table="${name}" aria-pressed="${i === 0}">${escape(name)}</button>`).join('')}</div><div id="craft-source"></div><p id="craft-schema" class="schema-note"></p></section>
      <section class="frame craft-inventory"><div class="panel-heading"><h2 class="satchel-title"><img src="/art/crafting-rewards.png" alt=""/>Your satchel</h2><span class="small-label">${practiceProblems.filter(p => crafted[p.id]).length} / ${practiceProblems.length} CREATIONS</span></div><p class="craft-story">Worked examples help you learn. Start a fresh attempt to earn an independent craft. Recasting the same answer keeps one creation in your collection.</p><div class="inventory-grid">${practiceProblems.filter(p => crafted[p.id]).map(p => `<div><span aria-hidden="true">${p.reward.kind === 'potion' ? '⚗' : '✧'}</span><strong>${escape(p.reward.name)}</strong><small>${crafted[p.id].independent ? 'Independent craft' : 'With a worked example'}</small></div>`).join('') || '<p class="craft-story">Your first creation will appear here.</p>'}</div></section>
      <footer><span>NO TIMERS. KEEP EXPERIMENTING.</span><span id="workshop-save"></span></footer></div>`;
    editor = createSqlEditor({ parent: $('#craft-query'), doc: typeof drafts[current.id] === 'string' ? drafts[current.id] : current.starter, slots: [], onChange: value => { $('#craft-next').hidden = true; drafts[current.id] = value; save(); }, onCast: cast });
    $('#leave-workshop').onclick = leave;
    $('#practice-menu').onclick = menu;
    $('#practice-select').onchange = event => select(practiceByLesson[event.target.value][0]);
    root.querySelectorAll('[data-practice-stage]').forEach(b => { b.onclick = () => select(practiceByLesson[b.dataset.practiceStage][0]); });
    root.querySelectorAll('[data-problem]').forEach(b => { b.onclick = () => select(getPracticeProblem(b.dataset.problem)); });
    function source(name) {
      $('#craft-source').innerHTML = table(tableInfo[name].columns, fixture()[name]);
      $('#craft-schema').textContent = tableInfo[name].description;
      root.querySelectorAll('[data-craft-table]').forEach(b => b.setAttribute('aria-pressed', b.dataset.craftTable === name));
    }
    root.querySelectorAll('[data-craft-table]').forEach(b => { b.onclick = () => source(b.dataset.craftTable); });
    source(current.tables[0]);
    $('#craft-cast').onclick = cast;
    $('#craft-hint').onclick = () => {
      hint = Math.min(hint + 1, current.hints.length);
      if (hint === current.hints.length) { assisted[current.id] = true; save(); }
      $('#craft-hints').hidden = false;
      $('#craft-hints').innerHTML = `<span class="speaker">${hint === current.hints.length ? 'WORKED EXAMPLE · ASSISTED ATTEMPT' : `HINT ${hint}`}</span><pre>${escape(current.hints[hint - 1])}</pre>`;
      $('#craft-hint').disabled = hint === current.hints.length;
    };
    $('#craft-reset').onclick = () => { stop(); drafts[current.id] = current.starter; delete assisted[current.id]; save(); render(); editor.focus(); };
    $('#craft-next').onclick = () => { const next = group[group.indexOf(current) + 1]; if (next) select(next); else menu(); };
    save();
  }
  function cast() {
    if (running) return;
    running = true; $('#craft-cast').disabled = true; $('#craft-next').hidden = true; $('#craft-result').innerHTML = '';
    feedback('Your ingredients are gathering…', 'pending');
    const finish = () => { stop(); $('#craft-cast').disabled = false; };
    try {
      worker = new Worker(new URL('./sql-worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        finish();
        if (data.error) { feedback(data.error, 'error'); return; }
        $('#craft-result').innerHTML = table(data.result.columns, data.result.values);
        feedback(data.message, data.correct ? 'success' : 'mismatch');
        if (!data.correct) return;
        const independent = !assisted[current.id];
        const previous = crafted[current.id];
        crafted[current.id] = { independent: Boolean(previous?.independent || independent) };
        save();
        $('#craft-next').hidden = false;
        if (!awarded) {
          const inventory = $('.inventory-grid');
          if (!previous) {
            inventory.querySelector('p')?.remove();
            inventory.insertAdjacentHTML('beforeend', `<div><span aria-hidden="true">${current.reward.kind === 'potion' ? '⚗' : '✧'}</span><strong>${escape(current.reward.name)}</strong><small>${independent ? 'Independent craft' : 'With a worked example'}</small></div>`);
          } else if (independent) {
            [...inventory.querySelectorAll('div')].find(el => el.querySelector('strong')?.textContent === current.reward.name)?.querySelector('small')?.replaceChildren(document.createTextNode('Independent craft'));
          }
          awarded = true;
        }
        $('.craft-inventory .small-label').textContent = `${practiceProblems.filter(p => crafted[p.id]).length} / ${practiceProblems.length} CREATIONS`;
        const choice = root.querySelector(`[data-problem="${current.id}"]`);
        choice.querySelector('.speaker').textContent = `COMMISSION 0${practiceByLesson[current.lessonId].indexOf(current) + 1} ✓`;
        choice.querySelector('small').textContent = `${current.reward.kind} · ${crafted[current.id].independent ? 'Crafted independently' : 'Crafted with an example'}`;
        root.querySelector(`[data-practice-stage="${current.lessonId}"] span:last-child`).textContent = `${lessons.find(l => l.id === current.lessonId).topic} · ${practiceByLesson[current.lessonId].filter(p => crafted[p.id]).length}/3`;
      };
      worker.onerror = event => { event.preventDefault(); finish(); feedback('The archive could not load. Try crafting again.', 'error'); };
      timer = setTimeout(() => { finish(); feedback('This query took too long. Check your joins and try again.', 'error'); }, 8000);
      worker.postMessage({ id: current.id, practiceId: current.id, sql: editor.value });
    } catch { finish(); feedback('The archive could not start. Please try again.', 'error'); }
  }
  menu();
}
