// Lesson metadata explains a validated query's result; SQLite remains the grader.
export function matchesFilter(row, filter) {
  if (!filter) return true;
  if (filter.all) return filter.all.every(condition => matchesFilter(row, condition));
  const value = row[filter.column];
  if (value === null) return false;
  const expected = filter.value ?? filter.equals;
  switch (filter.operator || '=') {
    case '=': return value === expected;
    case '>=': return value >= expected;
    case '>': return value > expected;
    case '<=': return value <= expected;
    case '<': return value < expected;
    default: throw new Error('Unknown lesson comparison');
  }
}

export function describeFilter(filter, columns) {
  if (filter.all) return filter.all.map(condition => describeFilter(condition, columns)).join(' AND ');
  return `${columns[filter.column]} ${filter.operator || '='} ${filter.value ?? filter.equals}`;
}

export function filterExplanation(row, filter, columns) {
  const conditions = filter.all || [filter];
  return conditions.map(condition => `${describeFilter(condition, columns)}: ${matchesFilter(row, condition) ? 'yes' : 'no'}`).join('; ');
}
