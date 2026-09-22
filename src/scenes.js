export const scenes = {
  sanctuary: { src: '/art/sanctuary.png', alt: 'The apprentice and her younger sister help Keeper Bramble tend an ember fox, moonmoths and a cloud drake.' },
  observatory: { src: '/art/observatory.png', alt: 'The two sisters study star charts with Sable beside the observatory telescope.' },
  restoration: { src: '/art/restoration.png', alt: 'The older sister raises her wand and the younger her lantern beneath the restored academy ward as the ferry arrives.' },
  arrival: { src: '/art/academy-arrival.png', alt: 'A blue-cloaked girl and her younger sister with an amber lantern arrive with Quill at the moonlit academy beneath a cracked ward.' },
  archive: { src: '/art/archive.png', alt: 'The blue-cloaked apprentice casts a spark beside her younger sister and Quill in the academy library.' },
  herbarium: { src: '/art/herbarium.png', alt: 'The blue-cloaked apprentice examines an ingredient while her younger sister lights the greenhouse testing bench.' },
  workshop: { src: '/art/potion-workshop.png', alt: 'Iona and Quill watch the two sisters examine a recipe ledger and potion beside the cauldron.' },
  storeroom: { src: '/art/storeroom.png', alt: 'The older sister checks a stock ledger while her younger sister lights the shelves beside Iona and Quill.' },
};
export const sceneForLesson = lesson => scenes[lesson.scene || 'archive'];
