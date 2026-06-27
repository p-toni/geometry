import { describe, expect, it } from 'vitest';
import { pool } from '../pool';
import { effectiveReadFull, isWholePiece } from './readMode';

describe('isWholePiece', () => {
  it('treats notes as whole pieces', () => {
    expect(isWholePiece(pool.nodes.ilya!)).toBe(true);
    expect(isWholePiece(pool.nodes['increasing-returns']!)).toBe(true);
  });

  it('does not treat essays as whole pieces', () => {
    expect(isWholePiece(pool.nodes['allowed-ignorance']!)).toBe(false);
    expect(isWholePiece(pool.nodes['bounded-me']!)).toBe(false);
    expect(isWholePiece(pool.nodes['me-plus-ai']!)).toBe(false);
  });
});

describe('effectiveReadFull', () => {
  it('ignores full flag for notes', () => {
    expect(effectiveReadFull(pool.nodes.ilya, true)).toBe(false);
  });

  it('honors full flag for essays with body', () => {
    expect(effectiveReadFull(pool.nodes['allowed-ignorance'], true)).toBe(true);
  });
});