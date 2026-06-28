import type { Block } from '../pool/types';
import type { FieldEdge, FieldGraph, FieldNode } from './fieldSchema';
import type { FootnoteRegistry } from './footnotes';
import { allSources, resolveCitationToken, type SourceRecord } from './sources';

export type CitationPlacement = 'inline' | 'ledger' | 'edge';

export type CitationData = {
  placement: CitationPlacement;
  sourceId: string;
  source: SourceRecord;
  anchor?: string;
  force: 'necessary' | 'likely' | 'working-bridge' | 'speculative';
};

const CITE_TOKEN = /\[([^\]]*\d{4}[^\]]*)\]/g;
const BENNETT_TOKEN = /Bennett\s*\((\d{4})\)/g;

export function extractCitationsFromText(
  text: string,
  anchor?: string,
): CitationData[] {
  const out: CitationData[] = [];
  const seen = new Set<string>();

  for (const re of [CITE_TOKEN, BENNETT_TOKEN]) {
    const copy = new RegExp(re.source, re.flags);
    let m: RegExpExecArray | null;
    while ((m = copy.exec(text)) !== null) {
      const token = m[0]!.includes('Bennett') ? `Bennett ${m[1]}` : m[1]!;
      const source = resolveCitationToken(token);
      if (!source || seen.has(source.id)) continue;
      seen.add(source.id);
      out.push({
        placement: 'inline',
        sourceId: source.id,
        source,
        anchor,
        force: source.kind === 'preprint' ? 'speculative' : 'necessary',
      });
    }
  }
  return out;
}

export function citationsFromBlocks(blocks: Block[]): CitationData[] {
  const out: CitationData[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    if (block.t === 'citation') {
      if (!seen.has(block.sourceId)) {
        seen.add(block.sourceId);
        out.push({
          placement: block.placement,
          sourceId: block.sourceId,
          source: block.source,
          anchor: block.anchor,
          force: block.force,
        });
      }
      continue;
    }
    if (block.t === 'p' || block.t === 'pull') {
      for (const cite of extractCitationsFromText(block.x)) {
        if (!seen.has(cite.sourceId)) {
          seen.add(cite.sourceId);
          out.push(cite);
        }
      }
    }
  }
  return out;
}

/** Claims inside corpus + external sources outside (spec 05). */
export function buildCitationFieldGraph(
  essayId: string,
  citations: CitationData[],
): FieldGraph | null {
  if (!citations.length) return null;

  const nodes: FieldNode[] = [
    { id: `${essayId}:corpus`, kind: 'lens', label: 'the corpus' },
  ];
  const edges: FieldEdge[] = [];

  citations.forEach((cite, i) => {
    const claimId = cite.anchor ?? `claim:${i}`;
    nodes.push({
      id: claimId,
      kind: 'claim',
      label: cite.anchor?.replace('claim:', '') ?? `claim ${i + 1}`,
    });
    const extId = `ext:${cite.sourceId}`;
    if (!nodes.some((n) => n.id === extId)) {
      nodes.push({
        id: extId,
        kind: 'external',
        label: `${cite.source.author}${cite.source.year ? ` ${cite.source.year}` : ''}`,
      });
    }
    edges.push({
      from: claimId,
      to: extId,
      type: 'cites',
      force: cite.force,
      directed: true,
      crossesBoundary: true,
      label: 'cites',
    });
  });

  return {
    nodes,
    edges,
    interiors: {},
    boundary: { corpus: true },
  };
}

export type TextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'footnote'; n: number; source: SourceRecord };

/** Split prose into text runs and section footnote markers (spec 05 · inline). */
export function splitCitationTokens(text: string, footnotes: FootnoteRegistry): TextSegment[] {
  const re = new RegExp(
    `${CITE_TOKEN.source}|${BENNETT_TOKEN.source}`,
    'g',
  );
  const out: TextSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
    const token = m[0]!.includes('Bennett') ? `Bennett ${m[1]}` : m[1]!;
    const source = resolveCitationToken(token);
    if (source) {
      out.push({ kind: 'footnote', n: footnotes.cite(source), source });
    } else {
      out.push({ kind: 'text', text: m[0]! });
    }
    last = m.index + m[0]!.length;
  }

  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out.length ? out : [{ kind: 'text', text }];
}

export function ledgerCitations(): CitationData[] {
  return allSources().map((source) => ({
    placement: 'ledger' as const,
    sourceId: source.id,
    source,
    force:
      source.kind === 'preprint'
        ? 'speculative'
        : source.kind === 'product'
          ? 'working-bridge'
          : 'likely',
  }));
}