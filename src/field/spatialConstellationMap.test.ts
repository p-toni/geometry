import { describe, expect, it } from 'vitest';
import { graphPathForNode, hasSpatialGraph } from './spatialConstellationMap';

describe('spatialConstellationMap', () => {
  it('maps pool ids to generated essay graph paths', () => {
    expect(graphPathForNode('allowed-ignorance')).toBe('essays/09-allowed-ignorance');
    expect(graphPathForNode('bounded-me')).toBe('essays/05-bounded-me');
    expect(graphPathForNode('geometry-retrieval')).toBe('essays/07-geometry-over-retrieval');
  });

  it('returns null for nodes without spatial graphs', () => {
    expect(graphPathForNode('about')).toBeNull();
    expect(hasSpatialGraph('sea')).toBe(false);
  });
});