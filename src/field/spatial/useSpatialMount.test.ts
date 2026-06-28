import { describe, expect, it } from 'vitest';
import { metaFromGraph } from './useSpatialMount';
import type { ConstellationGraph } from '../../../constellation/src/mount.d.ts';

const sampleGraph: ConstellationGraph = {
  title: 'Allowed Ignorance',
  method: 'agent',
  scope: 'intra',
  people: [{ id: 'a', name: 'a', meta: 'x · y', topicIds: ['t1'] }],
  topicLabels: { t1: 'one', t2: 'two' },
  meta: {
    inquiryCount: 13,
    conceptCount: 42,
    generatedAt: '2026-06-28T16:58:56.425Z',
  },
};

describe('metaFromGraph', () => {
  it('includes method and generated date in meta line', () => {
    const { title, metaLine } = metaFromGraph(sampleGraph, 'essays/09-allowed-ignorance');
    expect(title).toBe('Allowed Ignorance');
    expect(metaLine).toContain('13 inquiries · 42 concepts · intra · agent');
    expect(metaLine).toContain('Jun 28, 2026');
  });

  it('falls back to counts from graph body when meta counts are missing', () => {
    const graph: ConstellationGraph = {
      people: [
        { id: 'a', name: 'a', meta: 'x · y', topicIds: ['t1'] },
        { id: 'b', name: 'b', meta: 'x · y', topicIds: ['t2'] },
      ],
      topicLabels: { t1: 'one' },
      method: 'agent',
    };
    const { metaLine } = metaFromGraph(graph, 'path');
    expect(metaLine).toContain('2 inquiries · 1 concepts · agent');
  });
});