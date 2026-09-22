import { lessons } from './lessons.js';
const page = (scene, title, speaker, text) => ({ scene, title, speaker, text });

export const stories = {
  prologue: {
    title: 'The Academy of the Returning Moon',
    pages: [
      page('arrival', 'A light missing from the sky', 'YOUR FIRST NIGHT', 'The academy appears across the water, its towers tucked beneath a trembling dome of light. Beyond the gate, the ferry waits for a beacon that has almost gone out. You came to learn magic, with your little sister beside you. She lifts her amber lantern as you straighten your blue hat. Tonight, someone needs your magic to find the way home.'),
      page('arrival', 'An unusual apprenticeship', 'PROFESSOR QUILL', '“The ward is fading,” says the owl on the gatepost. “Our knowledge is still here, but scattered across catalogs and ledgers. We need someone who can ask the right questions.” He offers you a spellbook with seven empty tabs. “I kept these records. I should have noticed sooner. Help me read them properly, and we can give the beacon its light back.”'),
      page('arrival', 'A place at the workbench', 'IONA', 'A potion tutor in a flour-dusted apron pushes the gate open with her boot. “Iona. Potions, mostly. Quill does the speeches.” She hands you a pencil. “Keep it. A spell that works once is a lucky evening. A spell you understand is something we can count on tomorrow.”'),
    ],
  },
  'first-spark': {
    title: 'The archive wakes',
    pages: [page('archive', 'First, learn what is here', 'PROFESSOR QUILL', 'Inside, the archive smells of old paper and rain. Your little sister holds her lantern over the desk while you open your spellbook. Quill opens the ingredient catalog. “No guessing which jar is which. Read the names first.” Your first spell will ask the catalog a question; you will use its answer to choose what happens next.'),
      page('archive', 'The first page of your spellbook', 'PROFESSOR QUILL', 'On the lowest shelf lies a bundle of old student spellbooks. Each begins with the same simple question: what do we have? “Mine is the blue one,” Quill admits. “The first page has three corrections. You may make as many as you need.”')],
    after: page('archive', 'Names in the dark', 'PROFESSOR QUILL', 'The catalog begins to make sense: one record for each ingredient, with its own name and ID. You fill the first tab of your spellbook. Outside, the ferry lantern swings again. Quill taps the unlit ward-lamp. “Now we know how to read. Let us find something that carries its own light.”'),
  },
  'light-the-ward': {
    title: 'A borrowed glow',
    pages: [page('archive', 'Not every ingredient shines', 'PROFESSOR QUILL', 'A lamp by the archive door has gone dark. Some ingredients glow; others are quite ordinary. “The catalog records the difference,” says Quill. “Ask it for the glowing ones, and I will tend the lamp.”'),
      page('archive', 'A signal across the water', 'YOUR FIRST NIGHT', 'Through the high window, a ferry lantern swings twice. Someone is still waiting across the lake. The little lamp at your elbow seems a very small beginning, but its brass foot carries the same moon-shaped seal as the great beacon.')],
    after: page('herbarium', 'Beyond the archive door', 'PROFESSOR QUILL', 'Quill tends the lamp with a glowing ingredient from your results. Light returns to the archive door, and the ferry answers with a bell. But a little light is not enough to sustain the ward. Through the next doorway, moonlit plants crowd around a testing bench. “Strength next,” he says.'),
  },
  'potent-ingredients': {
    title: 'The testing bench',
    pages: [page('herbarium', 'Strong is not the same as glowing', 'PROFESSOR QUILL', 'Glass instruments hum among the plants. Each ingredient has a recorded potency: a measure of strength. Quill sets the requirement at seven. “An ingredient exactly on the boundary counts. Find everything strong enough before we ask anything else of it.”'),
      page('herbarium', 'Iona’s penciled line', 'IONA', 'Iona has marked a line on the testing chart. “Seven or more. The boundary matters.” Beside it is an older note in her handwriting: bright does not always mean strong. “That one cost me a whole evening of brewing. Keep your mistakes somewhere useful.”')],
    after: page('herbarium', 'One question remains', 'PROFESSOR QUILL', 'Crystal and Emberroot meet the strength requirement. Quill holds a tray under the moonlight. “A strong ingredient may still be dark. The ward needs both qualities in the same ingredient. Let us put the two questions together.”'),
  },
  'steady-flame': {
    title: 'Two tests, one ingredient',
    pages: [page('herbarium', 'The ward asks for both', 'PROFESSOR QUILL', 'The strength tray can hold Crystal and Emberroot, but only one also glows. Quill turns the ward-lamp toward you. “Do not choose strength from one row and light from another. Find the ingredient that satisfies both.”'),
      page('herbarium', 'The patient kind of magic', 'PROFESSOR QUILL', 'Quill folds his wings around the lamp to shelter its wick. “I used to rush when people were waiting. Ask one question, assume the rest.” He looks toward the ferry. “Being needed is a reason to be careful. Check both qualities before we carry anything away.”')],
    after: page('workshop', 'An invitation from Iona', 'IONA', 'With the two properties understood, Quill can choose a strong glowing ingredient for the lamp. A warmer light spills from the workshop. “Good timing,” says Iona, the potion maker. “The next part is a tonic. My jars have names, but my ledgers keep referring to numbers.”'),
  },
  'ingredient-ledger': {
    title: 'The numbers on the jars',
    pages: [page('workshop', 'Two books, one ingredient', 'IONA', 'Iona puts a stock ledger beside the ingredient catalog. One records an ingredient’s ID and quantity; the other pairs that ID with its name. “These are two accounts of the same supplies. Help me read them together before we open the recipe book.”'),
      page('workshop', 'Two labels for one jar', 'IONA', 'One jar has two labels: an old number underneath a newer name. “We can rename things,” Iona says, “but these IDs are how the books keep track of the same ingredient.” She clears a second place at the bench. For the first time tonight, the work feels like something you are doing together.')],
    after: page('workshop', 'The ledger has names again', 'IONA', 'Matching IDs makes the stock records readable without confusing a jar’s name with its identity. Iona opens a thicker book. “Now for Moonlight tonic. A recipe has its own record, and its ingredient entries form another list. We will connect those next.”'),
  },
  'moonlight-tonic': {
    title: 'The moonlight recipe',
    pages: [page('workshop', 'A recipe in three places', 'IONA', 'The recipe book names the tonic. Its entries list ingredient IDs and amounts. The catalog supplies the ingredient names. “No mystery ingredients,” Iona says, setting down her ladle. “Reconnect these records so we can read exactly what the recipe asks for.”'),
      page('workshop', 'A tonic for the long watch', 'IONA', 'The beacon keeper has been tending the failing light alone. Iona sets a clean flask beside the recipe. “Moonlight tonic is part of the ward’s upkeep. But knowing its name is not knowing how to make it.” She leaves the flame unlit. “First we read the whole recipe.”')],
    after: page('storeroom', 'Before the first measure', 'IONA', 'The recipe can be read, but a recipe is not a promise that the shelves are full. Iona leaves the cauldron alone and takes you to the storeroom. “Before we use anything, we check what is recorded—and what is missing.”'),
  },
  'empty-shelves': {
    title: 'The quiet shelf',
    pages: [page('storeroom', 'Empty and unknown are different', 'IONA', 'Some shelves have counted stock. One has a recorded zero. Another ingredient has no stock entry at all. Iona frowns at the ledger. “A missing record must not make the ingredient disappear. Show me every ingredient, even when its stock is unknown.”'),
      page('storeroom', 'The record nobody made', 'PROFESSOR QUILL', 'Quill recognizes the blank in the stock ledger. “I meant to count that shelf yesterday.” No storm stole the entry; nobody wrote it down. Iona gives him the pencil. “Then we leave it unknown until we check. An honest blank is something we can work with.”')],
    after: page('storeroom', 'A careful beginning', 'PROFESSOR QUILL', 'Your stock check separates empty shelves from uncounted ones. Quill takes the ledger to finish the count; Iona sets out clean flasks. The archive lamp shines across the water, though the great ward still needs work. “You have earned a place at this bench,” she says. “Come back to practice. We have spells to prepare and potions to make.”'),
  },
  practice: {
    title: 'The apprentice’s workbench',
    pages: [
      page('workshop', 'Small spells, steady hands', 'IONA', 'Your little sister sets her lantern on the workbench. Iona has left a corner of the workshop ready for you both: clean bottles, blank spell slips, and a stack of work orders. “Pick something to make. Every order asks you to read the records and find what it needs. There is no rush here. This bench is for getting better.”'),
      page('workshop', 'A ritual worth repeating', 'PROFESSOR QUILL', 'Quill opens your spellbook beside the cauldron. “Read the request. Ask your question. Check the answer.” He nudges a fresh spell slip toward you. “When the answer is wrong, change the question and try again. The useful magic is learning why it works.”'),
    ],
  },
};

// Authored campaign scenes travel with their lesson content.
for (const lesson of lessons.filter(item => item.storyPages)) {
  stories[lesson.id] = {
    title: lesson.title,
    pages: lesson.storyPages.map(page => ({ scene: lesson.scene, ...page })),
    after: { scene: lesson.scene, ...lesson.ending },
  };
}

export function storyEpisode(id) {
  if (typeof id !== 'string' || !Object.hasOwn(stories, id.replace(/^after:/, ''))) return undefined;
  if (id.startsWith('after:')) {
    const chapter = stories[id.slice(6)];
    return chapter?.after ? { title: chapter.after.title, pages: [chapter.after] } : undefined;
  }
  return stories[id];
}

export function restoreStory(saved) {
  const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const state = record(saved);
  const seen = Object.fromEntries(Object.entries(record(state.seen)).filter(([id, value]) => value === true && storyEpisode(id)));
  const pending = state.pending;
  return { seen, pending: pending && storyEpisode(pending.id) && ['entry', 'transition', 'replay'].includes(pending.mode) ? {
    id: pending.id, mode: pending.mode, target: typeof pending.target === 'string' ? pending.target : null,
    page: Math.max(0, Math.min(Number.isInteger(pending.page) ? pending.page : 0, storyEpisode(pending.id).pages.length - 1)),
  } : null };
}
