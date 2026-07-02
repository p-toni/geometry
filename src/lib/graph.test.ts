import { describe, expect, it } from 'vitest';
import { pool } from '../pool';
import { linkedNeighborRels } from './graph';

describe('linkedNeighborRels', () => {
  it('includes inbound links so edge-lit nodes are also highlighted', () => {
    const rels = linkedNeighborRels(pool, 'allowed-ignorance');
    expect(rels['the-world-answers']).toBe('leads to');
    expect(rels['geometry-retrieval']).toBe('theme');
  });
});