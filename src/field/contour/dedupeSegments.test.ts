import { describe, expect, it } from 'vitest';
import type { Segment } from './marchingSquares';
import { dedupeSegments } from './segmentUtils';

describe('dedupeSegments', () => {
  it('drops exact duplicate edge segments', () => {
    const a: Segment = [[0, 0], [10, 0]];
    const b: Segment = [[0, 5], [10, 5]];
    const unique = dedupeSegments([a, a, b]);
    expect(unique).toHaveLength(2);
  });
});