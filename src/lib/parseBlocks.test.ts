import { describe, expect, it } from 'vitest';
import { parseBlocks } from './parseBlocks';

describe('parseBlocks', () => {
  it('parses paragraphs and headings', () => {
    const blocks = parseBlocks('## Preamble\n\nGood tools have edges.\n\nMore prose.');
    expect(blocks).toContainEqual({ t: 'h', x: 'Preamble' });
    expect(blocks).toContainEqual({ t: 'p', x: 'Good tools have edges.' });
  });

  it('parses thesis blockquotes with kicker', () => {
    const blocks = parseBlocks(
      '> [thesis|thesis]\n> Understanding is what remains after the right cuts.',
    );
    expect(blocks).toContainEqual({
      t: 'thesis',
      k: 'thesis',
      x: 'Understanding is what remains after the right cuts.',
    });
  });

  it('parses backlinks for field navigation', () => {
    const blocks = parseBlocks('[[backlink:bounded me|cites|bounded-me]]');
    expect(blocks).toContainEqual({
      t: 'backlink',
      title: 'bounded me',
      rel: 'cites',
      targetId: 'bounded-me',
    });
  });

  it('splits inline backlinks inside paragraphs', () => {
    const blocks = parseBlocks(
      '**Update:** [[backlink:Allowed Ignorance|cites|allowed-ignorance]] gives a sharper name.',
    );
    expect(blocks).toEqual([
      { t: 'p', x: '**Update:** ' },
      {
        t: 'backlink',
        title: 'Allowed Ignorance',
        rel: 'cites',
        targetId: 'allowed-ignorance',
      },
      { t: 'p', x: ' gives a sharper name.' },
    ]);
  });
});