import { describe, expect, it } from 'vitest';
import { pool } from '../pool';
import { loadEssayStructure } from './loadEssayStructure';
import { buildConstellationLayout } from './buildConstellationLayout';

describe('buildConstellationLayout', () => {
  it('matches v2 radial topology for allowed ignorance', () => {
    const node = pool.nodes['allowed-ignorance']!;
    const layout = buildConstellationLayout(loadEssayStructure(node));
    expect(layout.nodes.find((n) => n.id === 'c')?.kind).toBe('lens');
    expect(layout.nodes.filter((n) => n.kind === 'section')).toHaveLength(4);
    expect(layout.edges.some(([a, b]) => a === 'c' && b === 's0')).toBe(true);
    expect(layout.edges.some(([a, b]) => a === 's0' && b.startsWith('s0k'))).toBe(true);
  });
});