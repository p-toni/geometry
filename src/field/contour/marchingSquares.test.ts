import { describe, expect, it } from 'vitest';
import { marchingSquares } from './marchingSquares';

describe('marchingSquares', () => {
  it('traces a closed ring around a central peak', () => {
    const grid = [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ];
    const segments = marchingSquares(grid, 10, 10, 0.5);
    expect(segments.length).toBeGreaterThanOrEqual(4);
  });

  it('returns no segments when the field is flat below threshold', () => {
    const grid = [
      [0.1, 0.1],
      [0.1, 0.1],
    ];
    expect(marchingSquares(grid, 10, 10, 0.5)).toHaveLength(0);
  });
});