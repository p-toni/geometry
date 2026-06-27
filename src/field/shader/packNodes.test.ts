import { describe, expect, it } from 'vitest';
import { packNodeUniforms, MAX_TERRAIN_NODES } from './packNodes';
import type { TerrainCtx } from '../terrainHeight';

const baseCtx: TerrainCtx = {
  mode: 'field',
  readId: null,
  neighborRels: {},
  matched: new Set(),
};

describe('packNodeUniforms', () => {
  it('packs every pool node with positive weights', () => {
    const { count, positions, weights } = packNodeUniforms(baseCtx);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(MAX_TERRAIN_NODES);
    for (let i = 0; i < count; i++) {
      expect(positions[i * 2]).toBeGreaterThan(0);
      expect(positions[i * 2 + 1]).toBeGreaterThan(0);
      expect(weights[i]).toBeGreaterThan(0);
    }
  });

  it('raises matched nodes in lens mode', () => {
    const lensCtx: TerrainCtx = {
      ...baseCtx,
      mode: 'lens',
      matched: new Set(['geometry']),
    };
    const field = packNodeUniforms(baseCtx);
    const lens = packNodeUniforms(lensCtx);
    const geometryIdx = [...Array(field.count)].findIndex((_, i) => {
      const x = field.positions[i * 2];
      const y = field.positions[i * 2 + 1];
      return Math.abs(x - 952) < 2 && Math.abs(y - 208) < 2;
    });
    expect(geometryIdx).toBeGreaterThanOrEqual(0);
    expect(lens.weights[geometryIdx]).toBeGreaterThan(field.weights[geometryIdx]);
  });
});