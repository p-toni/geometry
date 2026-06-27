import { hasInlineBacklink, splitInlineBacklinks } from './inlineBacklink';
import type { Block } from '../pool/types';

/** Parse markdown body (no frontmatter) into typed Blocks for Figures. */
export function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(' ').trim();
    if (!text) {
      buf.length = 0;
      return;
    }
    if (hasInlineBacklink(text)) {
      for (const part of splitInlineBacklinks(text)) {
        if (part.kind === 'text') blocks.push({ t: 'p', x: part.text });
        else
          blocks.push({
            t: 'backlink',
            title: part.title,
            rel: part.rel,
            targetId: part.targetId,
          });
      }
    } else {
      blocks.push({ t: 'p', x: text });
    }
    buf.length = 0;
  };

  let paraBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paraBuf);
      i++;
      continue;
    }

    const figMatch = trimmed.match(/^<!--\s*block:(\w[\w-]*)\s*-->$/);
    if (figMatch) {
      flushParagraph(paraBuf);
      const kind = figMatch[1]!;
      if (kind === 'motif') blocks.push({ t: 'motif' });
      else if (kind === 'point-edge') blocks.push({ t: 'point-edge' });
      else if (kind === 'curvature') blocks.push({ t: 'curvature' });
      else if (kind === 'table') blocks.push({ t: 'table', headers: [], rows: [] });
      else if (kind === 'steps') blocks.push({ t: 'steps', items: [] });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph(paraBuf);
      blocks.push({ t: 'h', x: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph(paraBuf);
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith('> ')) {
        quoteLines.push(lines[i]!.trim().slice(2));
        i++;
      }
      const text = quoteLines.join('\n').trim();
      const thesisTag = text.match(/^\[thesis\|([^\]]+)\]\s*\n?(.*)$/is);
      if (thesisTag) {
        blocks.push({
          t: 'thesis',
          k: thesisTag[1]!.trim(),
          x: thesisTag[2]!.trim().replace(/\n/g, ' '),
        });
      } else {
      const callout = text.match(/^\[(aside|honesty|update)(?:\|([^\]]+))?\]\s*\n?(.*)$/is);
      if (callout) {
        blocks.push({
          t: 'callout',
          v: callout[1]!.toLowerCase() as 'aside' | 'honesty' | 'update',
          label: callout[2]?.trim(),
          x: callout[3]!.trim().replace(/\n/g, ' '),
        });
      } else if (/^thesis[:\s]/i.test(text) || quoteLines[0]?.startsWith('**')) {
        blocks.push({ t: 'thesis', x: text.replace(/^thesis:\s*/i, '').replace(/\n/g, ' ') });
      } else {
        blocks.push({ t: 'callout', v: 'aside', x: text.replace(/\n/g, ' ') });
      }
      }
      continue;
    }

    if (trimmed.startsWith('|')) {
      flushParagraph(paraBuf);
      const tableLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith('|')) {
        tableLines.push(lines[i]!.trim());
        i++;
      }
      const rows = tableLines
        .filter((l) => !/^\|[\s:-]+\|$/.test(l))
        .map((l) =>
          l
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim()),
        );
      if (rows.length) {
        const [headers, ...body] = rows;
        if (headers?.every((c) => c === 'type' || c === 'force' || c.length < 24)) {
          const taxRows = body
            .filter((r) => r.length >= 2)
            .map((r) => ({ type: r[0]!, force: r[1]! }));
          if (taxRows.length) blocks.push({ t: 'edge-taxonomy', rows: taxRows });
        } else if (headers) {
          blocks.push({ t: 'table', headers, rows: body });
        }
      }
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph(paraBuf);
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i]!.trim())) {
        items.push(lines[i]!.trim().replace(/^\d+\.\s*/, ''));
        i++;
      }
      blocks.push({ t: 'steps', items });
      continue;
    }

    if (trimmed.startsWith('![')) {
      flushParagraph(paraBuf);
      const capMatch = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      blocks.push({
        t: 'plate',
        cap: capMatch?.[1] || 'figure',
        src: capMatch?.[2],
      });
      i++;
      continue;
    }

    if (trimmed.startsWith('[[backlink:')) {
      flushParagraph(paraBuf);
      const m = trimmed.match(/\[\[backlink:([^|]+)\|([^|]+)\|([^\]]+)\]\]/);
      if (m) {
        blocks.push({
          t: 'backlink',
          title: m[1]!.trim(),
          rel: m[2]!.trim(),
          targetId: m[3]!.trim(),
        });
      }
      i++;
      continue;
    }

    if (trimmed.startsWith('[[sidenote:')) {
      flushParagraph(paraBuf);
      const m = trimmed.match(/\[\[sidenote:([^|]+)\|([^\]]+)\]\]/);
      if (m) {
        blocks.push({ t: 'sidenote', anchor: m[1]!.trim(), x: m[2]!.trim() });
      }
      i++;
      continue;
    }

    paraBuf.push(trimmed);
    i++;
  }

  flushParagraph(paraBuf);
  return blocks;
}

export function excerptFromBlocks(blocks: Block[], max = 2): string[] {
  return blocks
    .filter((b): b is Extract<Block, { t: 'p' }> => b.t === 'p')
    .slice(0, max)
    .map((b) => b.x);
}