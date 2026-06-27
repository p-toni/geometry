import { describe, expect, it } from 'vitest';
import { FIELD_WIDTH } from '../../pool';
import { buildHeightmap } from './buildHeightmap';
import { fieldAlpha } from './drawContours';
import { heightT, sampleHeightBilinear } from './sampleHeightmap';
import type { TerrainCtx } from '../terrainHeight';

const fieldCtx: TerrainCtx = {
  mode: 'field',
  readId: null,
  neighborRels: {},
  matched: new Set(),
};

describe('sampleHeightmap', () => {
  it('interpolates smoothly between grid corners', () => {
    const map = buildHeightmap(280, 200, fieldCtx);
    const h00 = sampleHeightBilinear(map, map.originX, map.originY);
    const h11 = sampleHeightBilinear(
      map,
      map.originX + map.cellW,
      map.originY + map.cellH,
    );
    const mid = sampleHeightBilinear(
      map,
      map.originX + map.cellW * 0.5,
      map.originY + map.cellH * 0.5,
    );
    expect(mid).toBeGreaterThanOrEqual(Math.min(h00, h11) - 1e-6);
    expect(mid).toBeLessThanOrEqual(Math.max(h00, h11) + 1e-6);
  });

  it('normalizes height into 0..1', () => {
    const map = buildHeightmap(280, 200, fieldCtx);
    expect(heightT(map, map.min)).toBe(0);
    expect(heightT(map, map.max)).toBe(1);
  });
});

describe('fieldAlpha', () => {
  it('is zero outside the field bounds', () => {
    expect(fieldAlpha(-1, 100, 56)).toBe(0);
    expect(fieldAlpha(FIELD_WIDTH + 1, 100, 56)).toBe(0);
  });

  it('ramps up from the field edge', () => {
    expect(fieldAlpha(0, 0, 56)).toBe(0);
    expect(fieldAlpha(400, 400, 56)).toBe(1);
    expect(fieldAlpha(28, 28, 56)).toBeCloseTo(0.5);
  });
});