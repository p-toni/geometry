import { describe, expect, it } from 'vitest';
import { parseFieldState, writeFieldState } from './fieldUrl';

describe('fieldUrl trail', () => {
  it('round-trips essay trail in the URL', () => {
    const params = writeFieldState(
      {
        read: 'bounded-me',
        full: false,
        trail: ['allowed-ignorance', 'increasing-returns'],
        query: '',
        now: false,
        x: null,
        y: null,
        z: null,
      },
      {},
    );
    expect(params.get('trail')).toBe('allowed-ignorance,increasing-returns');
    expect(parseFieldState(params).trail).toEqual([
      'allowed-ignorance',
      'increasing-returns',
    ]);
  });

  it('clears trail when patched to empty', () => {
    const base = parseFieldState(
      new URLSearchParams('read=bounded-me&trail=allowed-ignorance'),
    );
    const next = writeFieldState(base, { trail: [] });
    expect(next.get('trail')).toBeNull();
  });
});