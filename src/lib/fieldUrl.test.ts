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
        spatial: false,
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

  it('round-trips spatial flag in the URL', () => {
    const params = writeFieldState(
      {
        read: 'allowed-ignorance',
        full: false,
        trail: [],
        query: '',
        spatial: false,
        x: null,
        y: null,
        z: null,
      },
      { spatial: true },
    );
    expect(params.get('spatial')).toBe('1');
    expect(parseFieldState(params).spatial).toBe(true);
    const cleared = writeFieldState(parseFieldState(params), { spatial: false });
    expect(cleared.get('spatial')).toBeNull();
  });

  it('clears trail when patched to empty', () => {
    const base = parseFieldState(
      new URLSearchParams('read=bounded-me&trail=allowed-ignorance'),
    );
    const next = writeFieldState(base, { trail: [] });
    expect(next.get('trail')).toBeNull();
  });
});