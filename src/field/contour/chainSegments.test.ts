import { describe, expect, it } from 'vitest';
import type { Segment } from './marchingSquares';
import { chainSegments } from './segmentUtils';

describe('chainSegments', () => {
  it('joins segments that share endpoints', () => {
    const a: Segment = [[0, 0], [10, 0]];
    const b: Segment = [[10, 0], [10, 8]];
    const chains = chainSegments([a, b]);
    expect(chains).toHaveLength(1);
    expect(chains[0]).toHaveLength(3);
  });
});