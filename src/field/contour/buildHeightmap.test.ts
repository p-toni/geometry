import { describe, expect, it } from 'vitest';
import { buildHeightmap, contourLevels } from './buildHeightmap';

describe('buildHeightmap', () => {
  it('builds a grid sized to the field with elevation range', () => {
    const map = buildHeightmap(1320, 800, {
      mode: 'field',
      readId: null,
      neighborRels: {},
      matched: new Set(),
    });
    expect(map.cols).toBeGreaterThan(40);
    expect(map.rows).toBeGreaterThan(25);
    expect(map.max).toBeGreaterThan(map.min);
    expect(map.grid[0][0]).toBeGreaterThan(0);
    expect(map.clusterGrid.length).toBe(map.rows);
    expect(map.clusterGrid[0]?.length).toBe(map.cols);
    expect(map.originX).toBe(0);
    expect(map.originY).toBe(0);
  });

  it('re-weights peaks in read mode', () => {
    const field = buildHeightmap(1320, 800, {
      mode: 'field',
      readId: null,
      neighborRels: {},
      matched: new Set(),
    });
    const reading = buildHeightmap(1320, 800, {
      mode: 'read',
      readId: 'allowed-ignorance',
      neighborRels: {},
      matched: new Set(),
    });
    expect(reading.max - reading.min).not.toBeCloseTo(field.max - field.min, 1);
  });

  it('emits evenly spaced contour levels', () => {
    const map = buildHeightmap(400, 300, {
      mode: 'field',
      readId: null,
      neighborRels: {},
      matched: new Set(),
    });
    const levels = contourLevels(map, 8);
    expect(levels).toHaveLength(8);
    expect(levels[0]).toBeGreaterThan(map.min);
    expect(levels.at(-1)).toBeLessThan(map.max);
  });
});