import { describe, expect, it } from 'vitest';
import { getDefaultGraph } from '../data/index.js';
import { resolveGraph } from './resolveGraph.js';

describe('resolveGraph', () => {
  it('resolves curated reference graph', () => {
    const resolved = resolveGraph(getDefaultGraph());
    expect(resolved.PEOPLE.length).toBeGreaterThan(0);
    expect(resolved.topics.length).toBeGreaterThan(0);
    expect(resolved.topicOrder[0].personIds.length).toBeGreaterThanOrEqual(
      resolved.topicOrder.at(-1).personIds.length,
    );
  });

  it('resolves generated essay graph shape', () => {
    const resolved = resolveGraph({
      people: [{ id: 'a', name: 'A', meta: 'm', topicIds: ['one', 'two'] }],
      topicLabels: { one: 'one', two: 'two' },
      extraEdges: [['one', 'two']],
    });
    expect(resolved.PEOPLE).toHaveLength(1);
    expect(resolved.topics).toHaveLength(2);
    expect(resolved.EXTRA_EDGES).toEqual([['one', 'two']]);
  });

  it('classifies lens and section inquiries from essay graphs', () => {
    const resolved = resolveGraph({
      people: [
        { id: 'x-lens', name: 'lens', meta: 'm', topicIds: ['one'] },
        { id: 'x-sec', name: 'move', meta: 'm', topicIds: ['two'], sectionSlug: 'thesis' },
      ],
      topicLabels: { one: 'one', two: 'two' },
      meta: { sectionSlugs: ['thesis'] },
    });
    expect(resolved.lens?.id).toBe('x-lens');
    expect(resolved.sectionInquiries).toHaveLength(1);
    expect(resolved.sectionSlugs).toEqual(['thesis']);
  });

  it('includes topic labels that only appear in concept mesh edges', () => {
    const resolved = resolveGraph({
      people: [{ id: 'field', name: 'Field', meta: 'intra', topicIds: ['alpha'] }],
      topicLabels: { alpha: 'alpha', beta: 'beta' },
      extraEdges: [['alpha', 'beta']],
    });
    expect(resolved.topics.map((topic) => topic.id).sort()).toEqual(['alpha', 'beta']);
  });
});