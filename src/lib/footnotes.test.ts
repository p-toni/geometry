import { describe, expect, it } from 'vitest';
import { createFootnoteRegistry } from './footnotes';
import { splitCitationTokens } from './citation';

describe('createFootnoteRegistry', () => {
  it('reuses numbers for the same source in a section', () => {
    const reg = createFootnoteRegistry();
    const parts = splitCitationTokens(
      '[Rozenblit & Keil 1998] and again [Rozenblit & Keil 1998].',
      reg,
    );
    const notes = parts.filter((p) => p.kind === 'footnote');
    expect(notes).toHaveLength(2);
    expect(notes[0]?.kind === 'footnote' && notes[1]?.kind === 'footnote' && notes[0].n === notes[1].n).toBe(true);
    expect(reg.entries()).toHaveLength(1);
  });
});