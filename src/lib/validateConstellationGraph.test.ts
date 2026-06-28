import { describe, expect, it } from 'vitest';
import { validateConstellationGraph } from './validateConstellationGraph';

describe('validateConstellationGraph', () => {
  it('passes a minimal valid graph', () => {
    const issues = validateConstellationGraph(
      {
        people: [
          { id: 'a', name: 'a', meta: 'm · g', topicIds: ['one', 'two'] },
          { id: 'b', name: 'b', meta: 'm · g', topicIds: ['three'] },
          { id: 'c', name: 'c', meta: 'm · g', topicIds: ['four'] },
          { id: 'd', name: 'd', meta: 'm · g', topicIds: ['five'] },
        ],
        topicLabels: { one: 'one', two: 'two', three: 'three', four: 'four', five: 'five' },
        extraEdges: [['one', 'two']],
      },
      null,
      'test',
    );
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('errors on unknown topic reference', () => {
    const issues = validateConstellationGraph(
      {
        people: [{ id: 'a', name: 'a', meta: 'm · g', topicIds: ['missing'] }],
        topicLabels: { other: 'other' },
      },
      null,
      'test',
    );
    expect(issues.some((i) => i.code === 'unknown-topic')).toBe(true);
  });
});