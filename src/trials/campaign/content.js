// Campaign content stays independent of the query engine so it can be validated
// against every catalog variant by both the lesson and practice runners.
export const task = (instruction, solution, hints, options = {}) => {
  const requires = [...new Set([
    ...[].concat(options.requires || []),
    ...(options.ordered ? ['ORDER'] : []),
    ...(options.ordered && /\bLIMIT\b/.test(solution) ? ['LIMIT'] : []),
  ])];
  return { instruction, solution, starter: '', hints, ...options, ...(requires.length ? { requires } : {}) };
};
const learningNotes = {
  'named-columns': 'AS changes the output headings while leaving the stored catalog unchanged.',
  'either-or': 'Each returned ingredient satisfies the complete condition, including its grouped alternatives and exceptions.',
  'pattern-matching': 'The selected records match the requested membership list, inclusive range, or text pattern.',
  'unknown-values': 'The result keeps the distinction between a measured zero and a missing stock record.',
  'ordered-shelves': 'The explicit sort keys make the selection repeatable, including when the first key ties.',
  'distinct-values': 'Each requested output combination appears once; distinctness applies to the whole selected row.',
  'measured-brews': 'The calculation uses the requested order of operations and preserves the required fractional precision.',
  'conditional-labels': 'CASE chooses the first true branch for each ingredient and keeps the other ingredients in the output.',
  'field-functions': 'The functions calculate new text or date values without modifying the recorded orders.',
  'aggregate-ledger': 'The aggregate row summarizes the selected orders; counts distinguish all rows from recorded values.',
  'grouped-orders': 'Each result row summarizes one combination of the grouping keys.',
  'busy-destinations': 'Individual row conditions are applied before grouping; group conditions are applied to the resulting totals.',
};
export function chapter(config) {
  const [guided, independent, mastery] = config.tasks.map(exercise => ({ ...exercise, success: learningNotes[config.id] }));
  const targetClause = {
    'either-or': ['WHERE ', 'Alternative conditions'],
    'pattern-matching': ['WHERE ', 'Membership condition'],
    'unknown-values': ['WHERE ', 'Missing-record condition'],
    'ordered-shelves': ['ORDER BY ', 'Sort columns and directions'],
    'grouped-orders': ['GROUP BY ', 'Grouping key'],
    'busy-destinations': ['HAVING ', 'Group total condition'],
  }[config.id];
  const split = guided.solution.indexOf(' FROM ');
  const starter = targetClause
    ? `${guided.solution.slice(0, guided.solution.indexOf(targetClause[0]) + targetClause[0].length)};`
    : `SELECT \n${guided.solution.slice(split + 1)}`;
  const guidedExercise = { ...guided, starter, slots: [{ after: targetClause?.[0] || 'SELECT ', label: targetClause?.[1] || 'Requested columns or expressions' }], hints: [...guided.hints, guided.solution] };
  const exercises = { guided: guidedExercise, independent: { ...independent, hints: [...independent.hints, independent.solution] }, mastery };
  const { tasks, crafts, ...rest } = config;
  return {
    ...rest, ...guidedExercise, exercises,
    tutorial: {
      title: config.topic,
      question: `Worked example: ${config.brief}`,
      next: 'Next, complete a guided query, write a different query independently, then solve a fresh challenge.',
      ...config.tutorial,
    },
    teaching: config.tutorial.paragraphs.join(' '),
    story: config.storyPages[0].text,
    reward: `${config.title} · mastered`,
    resultCaption: `${config.title} · returned records`,
    sceneTokens: result => result.values.map(row => ({
      label: row.map((value, index) => `${result.columns[index]}: ${value === null ? 'unknown' : value}`).join(' · '),
      kind: row.includes(null) ? 'unknown' : '',
    })),
    practice: crafts.map(([slug, title, kind, story, exercise]) => ({
      ...exercise, id: `${config.id}-${slug}`, lessonId: config.id, title, story,
      tables: config.tables, expectedSql: exercise.solution,
      hints: [...exercise.hints, exercise.solution],
      success: `${title} crafted. ${learningNotes[config.id]}`,
      reward: { id: `${config.id}-${slug}`, name: title, kind, description: story },
    })),
  };
}
export const tutorial = (paragraphs, example, annotation, intermediates = []) => ({ paragraphs, example, annotation, intermediates });
export const page = (title, speaker, text) => ({ title, speaker, text });
