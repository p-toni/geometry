import { describe, expect, it } from 'vitest';
import { parseBlocks } from './parseBlocks';

describe('parseBlocks', () => {
  it('parses paragraphs and headings', () => {
    const blocks = parseBlocks('## Preamble\n\nGood tools have edges.\n\nMore prose.');
    expect(blocks).toContainEqual({ t: 'h', x: 'Preamble', level: 2 });
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

  it('skips empty blockquote continuation lines after callouts', () => {
    const blocks = parseBlocks(
      '> [aside|A safety manual for keeping control in the human-AI loop.]\n>\n\nI am not "using AI."',
    );
    expect(blocks).toEqual([
      {
        t: 'callout',
        v: 'aside',
        label: 'A safety manual for keeping control in the human-AI loop.',
        x: '',
      },
      { t: 'p', x: 'I am not "using AI."' },
    ]);
  });

  it('parses h3 subheadings and numbered lists as separate blocks', () => {
    const blocks = parseBlocks('### Signals\n\n1. First item\n2. Second item');
    expect(blocks).toContainEqual({ t: 'h', x: 'Signals', level: 3 });
    expect(blocks).toContainEqual({ t: 'p', x: '1. First item' });
    expect(blocks).toContainEqual({ t: 'p', x: '2. Second item' });
  });

  it('parses registry figure and plate tags', () => {
    const blocks = parseBlocks(
      '[fig|late-failure-motif]\n\n[plate|PLATE I]\n*caption* `/img.svg`',
    );
    expect(blocks).toContainEqual({ t: 'motif' });
    expect(blocks).toContainEqual({ t: 'plate', cap: 'PLATE I — caption', src: '/img.svg' });
  });

  it('keeps shorthand backlinks inside one paragraph block', () => {
    const blocks = parseBlocks('See [[Allowed Ignorance|allowed-ignorance]] for more.');
    expect(blocks).toEqual([
      { t: 'p', x: 'See [[Allowed Ignorance|allowed-ignorance]] for more.' },
    ]);
  });

  it('keeps inline backlinks inside one paragraph block', () => {
    const blocks = parseBlocks(
      '**Update:** [[backlink:Allowed Ignorance|cites|allowed-ignorance]] gives a sharper name.',
    );
    expect(blocks).toEqual([
      {
        t: 'p',
        x: '**Update:** [[backlink:Allowed Ignorance|cites|allowed-ignorance]] gives a sharper name.',
      },
    ]);
  });
});