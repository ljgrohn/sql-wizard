const page = (scene, title, speaker, text) => ({ scene, title, speaker, text });

export const stories = {
  prologue: {
    title: 'The Academy of the Returning Moon',
    pages: [
      page('arrival', 'A light missing from the sky', 'YOUR FIRST NIGHT', 'The academy appears across the water, its towers tucked beneath a trembling dome of light. You came to learn magic. You had not expected the magic to need your help.'),
      page('arrival', 'An unusual apprenticeship', 'PROFESSOR QUILL', '“The ward is fading,” says the owl on the gatepost. “Our knowledge is still here, but scattered across catalogs and ledgers. We need someone who can ask the right questions.” He offers you a spellbook. “Come along. We begin with a single spark.”'),
    ],
  },
  'first-spark': {
    title: 'The archive wakes',
    pages: [page('archive', 'First, learn what is here', 'PROFESSOR QUILL', 'Inside, the archive smells of old paper and rain. Quill opens the ingredient catalog. “No guessing which jar is which. Read the names first.” Your first spell will ask the catalog a question; you will use its answer to choose what happens next.')],
    after: page('archive', 'Names in the dark', 'PROFESSOR QUILL', 'The catalog begins to make sense: one record for each ingredient, with its own name and ID. Quill taps the unlit ward-lamp. “Now we know how to read. Let us find something that carries its own light.”'),
  },
  'light-the-ward': {
    title: 'A borrowed glow',
    pages: [page('archive', 'Not every ingredient shines', 'PROFESSOR QUILL', 'A lamp by the archive door has gone dark. Some ingredients glow; others are quite ordinary. “The catalog records the difference,” says Quill. “Ask it for the glowing ones, and I will tend the lamp.”')],
    after: page('herbarium', 'Beyond the archive door', 'PROFESSOR QUILL', 'Knowing how to separate glowing ingredients from ordinary ones gives Quill a place to start. But a little light is not enough to sustain the ward. Through the next doorway, moonlit plants crowd around a testing bench. “Strength next,” he says.'),
  },
  'potent-ingredients': {
    title: 'The testing bench',
    pages: [page('herbarium', 'Strong is not the same as glowing', 'PROFESSOR QUILL', 'Glass instruments hum among the plants. Each ingredient has a recorded potency: a measure of strength. Quill sets the requirement at seven. “An ingredient exactly on the boundary counts. Find everything strong enough before we ask anything else of it.”')],
    after: page('herbarium', 'One question remains', 'PROFESSOR QUILL', 'Crystal and Emberroot meet the strength requirement. Quill holds a tray under the moonlight. “A strong ingredient may still be dark. The ward needs both qualities in the same ingredient. Let us put the two questions together.”'),
  },
  'steady-flame': {
    title: 'Two tests, one ingredient',
    pages: [page('herbarium', 'The ward asks for both', 'PROFESSOR QUILL', 'The strength tray can hold Crystal and Emberroot, but only one also glows. Quill turns the ward-lamp toward you. “Do not choose strength from one row and light from another. Find the ingredient that satisfies both.”')],
    after: page('workshop', 'An invitation from Iona', 'IONA', 'With the two properties understood, Quill can choose a strong glowing ingredient for the lamp. A warmer light spills from the workshop. “Good timing,” says Iona, the potion maker. “The next part is a tonic. My jars have names, but my ledgers keep referring to numbers.”'),
  },
  'ingredient-ledger': {
    title: 'The numbers on the jars',
    pages: [page('workshop', 'Two books, one ingredient', 'IONA', 'Iona puts a stock ledger beside the ingredient catalog. One records an ingredient’s ID and quantity; the other pairs that ID with its name. “These are two accounts of the same supplies. Help me read them together before we open the recipe book.”')],
    after: page('workshop', 'The ledger has names again', 'IONA', 'Matching IDs makes the stock records readable without confusing a jar’s name with its identity. Iona opens a thicker book. “Now for Moonlight tonic. A recipe has its own record, and its ingredient entries form another list. We will connect those next.”'),
  },
  'moonlight-tonic': {
    title: 'The moonlight recipe',
    pages: [page('workshop', 'A recipe in three places', 'IONA', 'The recipe book names the tonic. Its entries list ingredient IDs and amounts. The catalog supplies the ingredient names. “No mystery ingredients,” Iona says, setting down her ladle. “Reconnect these records so we can read exactly what the recipe asks for.”')],
    after: page('storeroom', 'Before the first measure', 'IONA', 'The recipe can be read, but a recipe is not a promise that the shelves are full. Iona leaves the cauldron alone and takes you to the storeroom. “Before we use anything, we check what is recorded—and what is missing.”'),
  },
  'empty-shelves': {
    title: 'The quiet shelf',
    pages: [page('storeroom', 'Empty and unknown are different', 'IONA', 'Some shelves have counted stock. One has a recorded zero. Another ingredient has no stock entry at all. Iona frowns at the ledger. “A missing record must not make the ingredient disappear. Show me every ingredient, even when its stock is unknown.”')],
    after: page('storeroom', 'A careful beginning', 'PROFESSOR QUILL', 'The stock check can now distinguish a recorded zero from an unknown quantity. Iona knows which records need attention before brewing. Quill closes your spellbook for the evening. “The academy is not restored yet. But you are learning to ask questions it can answer.”'),
  },
};

export function storyEpisode(id) {
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
