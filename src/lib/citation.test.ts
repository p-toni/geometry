import { describe, expect, it } from 'vitest';
import {
  buildCitationFieldGraph,
  citationsFromBlocks,
  extractCitationsFromText,
  splitCitationTokens,
} from './citation';
import { createFootnoteRegistry } from './footnotes';
import { parseBlocks } from './parseBlocks';

describe('extractCitationsFromText', () => {
  it('resolves bracket tokens from sources.yml', () => {
    const cites = extractCitationsFromText(
      'People overrate understanding [Rozenblit & Keil 1998].',
    );
    expect(cites).toHaveLength(1);
    expect(cites[0]?.sourceId).toBe('rozenblit-keil-1998');
    expect(cites[0]?.placement).toBe('inline');
  });

  it('resolves Bennett (2026) prose token', () => {
    const cites = extractCitationsFromText('Bennett (2026) formalizes a ceiling.');
    expect(cites[0]?.sourceId).toBe('bennett-2026');
    expect(cites[0]?.force).toBe('speculative');
  });
});

describe('buildCitationFieldGraph', () => {
  it('places external nodes outside corpus with cites edges', () => {
    const cites = extractCitationsFromText('[Rozenblit & Keil 1998]');
    const graph = buildCitationFieldGraph('geometry-retrieval', cites)!;
    expect(graph.boundary?.corpus).toBe(true);
    expect(graph.nodes.some((n) => n.kind === 'external')).toBe(true);
    expect(graph.edges[0]?.type).toBe('cites');
    expect(graph.edges[0]?.crossesBoundary).toBe(true);
    expect(graph.edges[0]?.directed).toBe(true);
  });
});

describe('splitCitationTokens', () => {
  it('splits prose into text and footnote markers', () => {
    const reg = createFootnoteRegistry();
    const parts = splitCitationTokens('Named by [Rozenblit & Keil 1998] here.', reg);
    expect(parts.filter((p) => p.kind === 'footnote')).toHaveLength(1);
    expect(parts[0]?.kind).toBe('text');
    expect(reg.entries()[0]?.source.id).toBe('rozenblit-keil-1998');
  });
});

describe('parseBlocks citation', () => {
  it('emits sources ledger on ## Sources heading', () => {
    const blocks = parseBlocks('## Sources\n');
    expect(blocks.some((b) => b.t === 'sources-ledger')).toBe(true);
  });

  it('collects citations from paragraph blocks', () => {
    const blocks = parseBlocks('[Rozenblit & Keil 1998] named the illusion.');
    const cites = citationsFromBlocks(blocks);
    expect(cites.some((c) => c.sourceId === 'rozenblit-keil-1998')).toBe(true);
  });
});