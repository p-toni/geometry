import { describe, expect, it } from 'vitest';
import { parseInlineMarkdown } from './inlineMarkdown';

describe('parseInlineMarkdown', () => {
  it('parses bold and italic', () => {
    const segs = parseInlineMarkdown('**bold** and *italic*');
    expect(segs).toEqual([
      { kind: 'strong', value: 'bold' },
      { kind: 'text', value: ' and ' },
      { kind: 'em', value: 'italic' },
    ]);
  });

  it('normalizes simple latex', () => {
    const segs = parseInlineMarkdown('window $\\theta$ bound');
    expect(segs.some((s) => s.value.includes('θ'))).toBe(true);
  });
});