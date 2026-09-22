import { scenes } from './scenes.js';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function createStoryPlayer(parent, { onPage, onFinish }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'story-player';
  dialog.id = 'story-player';
  dialog.setAttribute('aria-labelledby', 'story-title');
  parent.append(dialog);
  let episode;
  let position = 0;
  let finishLabel;
  function renderPage() {
    const page = episode.pages[position];
    const scene = scenes[page.scene];
    dialog.innerHTML = `<img class="story-art" src="${scene.src}" alt="${escape(scene.alt)}">
      <div class="story-copy"><p class="story-overline">${escape(episode.title)} · ${position + 1} / ${episode.pages.length}</p>
      <h2 id="story-title" tabindex="-1">${escape(page.title)}</h2><p class="speaker">${escape(page.speaker)}</p>
      <p class="story-prose">${escape(page.text)}</p></div>
      <div class="story-controls"><button id="story-skip" class="text-button">Skip story</button><div>
      <button id="story-back" class="quiet-button" ${position === 0 ? 'disabled' : ''}>Back</button>
      <button id="story-next" class="cast-button">${position < episode.pages.length - 1 ? 'Continue →' : escape(finishLabel)}</button></div></div>`;
    dialog.querySelector('#story-skip').onclick = finish;
    dialog.querySelector('#story-back').onclick = () => { position--; onPage(position); renderPage(); };
    dialog.querySelector('#story-next').onclick = () => {
      if (position === episode.pages.length - 1) finish();
      else { position++; onPage(position); renderPage(); }
    };
    dialog.querySelector('#story-title').focus();
    dialog.scrollTop = 0;
  }
  function finish() { dialog.close(); onFinish(); }
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  return { open(value, page = 0, label = 'Open the spellbook →') {
    episode = value; position = page; finishLabel = label;
    renderPage(); dialog.showModal(); dialog.querySelector('#story-title').focus();
  } };
}
