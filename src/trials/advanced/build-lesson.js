// Content helpers keep every new stage's teaching, blank-page challenges and
// workshop commissions in the same native format as the original campaign.
export const task = (instruction, solution, hints, options = {}) => ({
  instruction, starter: '', solution, expectedSql: solution,
  ordered: false, expectedColumns: undefined, requires: [],
  hints: hints.slice(0, 2), success: 'The records agree across changed catalogs. Your spell preserves the facts the keeper needs.',
  ...options,
  ...(options.ordered ? { requires: [...new Set([...(Array.isArray(options.requires) ? options.requires : options.requires ? [options.requires] : []), 'ORDER'])] } : {}),
});

export function stage(config) {
  const { guided, independent, mastery, commissions, pages, paragraphs, example, columns, intermediates, ...metadata } = config;
  const marker = guided.gap || 'SELECT';
  const gapIndex = guided.solution.indexOf(marker);
  const guidedExercise = {
    ...guided,
    instruction: `${guided.instruction} Fill the missing ${marker} keyword${marker.includes(' ') ? 's' : ''}.`,
    starter: guided.solution.slice(0, gapIndex) + guided.solution.slice(gapIndex + marker.length),
    slots: [{ after: guided.solution.slice(0, gapIndex), label: `Missing ${marker} keyword` }],
    hints: [...guided.hints, guided.solution],
  };
  const practice = commissions.map((commission, index) => ({
    ...commission,
    hints: [...commission.hints, commission.solution],
    id: `${config.id}-${commission.slug}`, lessonId: config.id,
    tables: commission.tables || metadata.tables,
    story: commission.story,
    title: commission.title,
    success: `${commission.title} crafted. Your results hold when identities, counts, and missing records change.`,
    reward: { id: `${config.id}-${commission.slug}`, name: commission.title, kind: ['spell', 'potion', 'charm'][index], description: commission.story },
  }));
  return {
    ...metadata,
    teaching: paragraphs.join(' '),
    story: pages[0].text,
    storyPages: pages,
    reward: `${metadata.title} · mastered`,
    resultCaption: metadata.resultCaption || 'Field notes · the query determines what the keeper can conclude',
    ...guidedExercise,
    exercises: { guided: guidedExercise, independent: { ...independent, starter: '', hints: [...independent.hints, independent.solution] }, mastery: { ...mastery, starter: '' } },
    tutorial: {
      title: metadata.topic, question: metadata.brief,
      paragraphs, example, columns, intermediates,
      annotation: metadata.annotation || 'Run the example and compare its rows with the source tables. IDs identify records even when names repeat.',
      next: 'Complete the guided query, then write two new queries from a blank page. The workshop offers three more commissions.',
    },
    practice,
  };
}

export const commission = (slug, title, story, exercise) => ({ slug, title, story, ...exercise });
