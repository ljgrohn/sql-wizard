export const scenes = {
  sanctuary: { src: '/art/sanctuary.png', alt: 'Keeper Bramble tends an ember fox, moonmoths and a cloud drake in a sheltered moonlit sanctuary.' },
  observatory: { src: '/art/observatory.png', alt: 'Sable studies star charts and alchemy instruments beside a telescope beneath the observatory dome.' },
  restoration: { src: '/art/restoration.png', alt: 'The academy beacon shines across the lake beneath a restored magical ward as the ferry arrives safely.' },
  arrival: { src: '/art/academy-arrival.png', alt: 'An apprentice and owl approach the moonlit academy beneath a cracked cyan magical ward.' },
  archive: { src: '/art/archive.png', alt: 'An apprentice wizard and owl in a cyan and magenta library beside a summoning circle.' },
  herbarium: { src: '/art/herbarium.png', alt: 'A moonlit greenhouse with ingredient trays, a balance, and a potency-testing bench.' },
  workshop: { src: '/art/potion-workshop.png', alt: 'Iona, an apprentice, and an owl examine a recipe ledger beside jars, measuring tools, and a cauldron.' },
  storeroom: { src: '/art/storeroom.png', alt: 'Iona checks the academy shelves with an apprentice and owl; some containers are full and some trays are empty.' },
};
export const sceneForLesson = lesson => scenes[lesson.scene || 'archive'];
