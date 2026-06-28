import { describe, expect, it } from 'vitest';
import { pool } from '../pool';
import { buildEssayGraph, essayGraphToFieldGraph, rungById } from './essayGraph';

describe('essayGraph', () => {
  it('builds one graph for me-plus-ai with two ladder sections', () => {
    const node = pool.nodes['me-plus-ai']!;
    const graph = buildEssayGraph(node, pool);
    expect(graph?.id).toBe('me-plus-ai');
    expect(graph?.sections).toHaveLength(2);
    expect(graph?.sections[0]?.mode).toBe('level');
    expect(graph?.sections[1]?.mode).toBe('gate');
    expect(graph?.sections[0]?.rungs).toHaveLength(4);
    expect(graph?.sections[1]?.rungs.some((r) => r.marker === '+2')).toBe(true);
  });

  it('includes cross-edge gate guards L3', () => {
    const graph = buildEssayGraph(pool.nodes['me-plus-ai']!, pool);
    expect(graph?.crossEdges[0]?.label).toBe('gate guards L3');
  });

  it('projects to field graph without parallel spine', () => {
    const essay = buildEssayGraph(pool.nodes['me-plus-ai']!, pool)!;
    const field = essayGraphToFieldGraph(essay);
    expect(field.nodes.some((n) => n.kind === 'rung' && n.label === 'Integrated')).toBe(true);
    expect(field.edges.some((e) => e.label === 'gate guards L3')).toBe(true);
  });

  it('resolves rung by id for rail tie-back', () => {
    const essay = buildEssayGraph(pool.nodes['me-plus-ai']!, pool)!;
    expect(rungById(essay, 'L3')?.term).toBe('Integrated');
  });
});