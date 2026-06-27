import type { Block } from '../pool/types';

const FIG_BLOCKS: Record<string, Block> = {
  'late-failure-motif': { t: 'motif' },
  motif: { t: 'motif' },
  'point-to-edge': { t: 'point-edge' },
  'point-edge': { t: 'point-edge' },
  'curvature-test': { t: 'curvature' },
  curvature: { t: 'curvature' },
  table: { t: 'table', headers: [], rows: [] },
  steps: { t: 'steps', items: [] },
  'edge-taxonomy': { t: 'edge-taxonomy', rows: [] },
};

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
    // Keep [[Title|id]] inside the paragraph — renderBlock inlines the pill.
    blocks.push({ t: 'p', x: text });
    buf.length = 0;
  };

  let paraBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed || trimmed === '---' || trimmed === '***') {
      flushParagraph(paraBuf);
      i++;
      continue;
    }

    const figMatch = trimmed.match(/^<!--\s*block:(\w[\w-]*)\s*-->$/);
    if (figMatch) {
      flushParagraph(paraBuf);
      const kind = figMatch[1]!;
      const block = FIG_BLOCKS[kind];
      if (block) blocks.push({ ...block });
      i++;
      continue;
    }

    const registryFig = trimmed.match(/^\[fig\|([\w-]+)\]$/);
    if (registryFig) {
      flushParagraph(paraBuf);
      const block = FIG_BLOCKS[registryFig[1]!];
      if (block) blocks.push({ ...block });
      i++;
      continue;
    }

    const plateTag = trimmed.match(/^\[plate\|([^\]]+)\]$/);
    if (plateTag) {
      flushParagraph(paraBuf);
      i++;
      let cap = plateTag[1]!.trim();
      let src: string | undefined;
      if (i < lines.length) {
        const next = lines[i]!.trim();
        const pathMatch = next.match(/`([^`]+)`/);
        const textMatch = next.match(/^\*(.+?)\*/);
        if (textMatch) cap = `${cap} — ${textMatch[1]!.trim()}`;
        if (pathMatch) src = pathMatch[1];
        if (pathMatch || textMatch) i++;
      }
      blocks.push({ t: 'plate', cap, src });
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph(paraBuf);
      blocks.push({ t: 'h', x: trimmed.slice(4).trim(), level: 3 });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph(paraBuf);
      blocks.push({ t: 'h', x: trimmed.slice(3).trim(), level: 2 });
      i++;
      continue;
    }

    if (/^>\s*$/.test(trimmed)) {
      flushParagraph(paraBuf);
      i++;
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushParagraph(paraBuf);
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith('>')) {
        const quoteText = lines[i]!.trim().replace(/^>\s?/, '');
        if (quoteText) quoteLines.push(quoteText);
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
            label: callout[2]?.trim().replace(/^[◇⚖✚]\s*/, ''),
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
        const isEdgeTaxonomy =
          headers?.length === 2 &&
          headers[0]?.toLowerCase() === 'type' &&
          headers[1]?.toLowerCase() === 'force';
        if (isEdgeTaxonomy) {
          const taxRows = body
            .filter((r) => r.length >= 2)
            .map((r) => ({ type: r[0]!, force: r[1]! }));
          if (taxRows.length) blocks.push({ t: 'edge-taxonomy', rows: taxRows });
        } else if (headers) {
          const dataRows = body.filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));
          blocks.push({ t: 'table', headers, rows: dataRows });
        }
      }
      continue;
    }

    const numbered = trimmed.match(/^\d+\.\s+/);
    if (numbered) {
      flushParagraph(paraBuf);
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!.trim())) {
        blocks.push({ t: 'p', x: lines[i]!.trim() });
        i++;
      }
      continue;
    }

    const bullet = trimmed.match(/^[*-]\s+(.+)$/);
    if (bullet) {
      flushParagraph(paraBuf);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i]!.trim().match(/^[*-]\s+(.+)$/);
        if (!m) break;
        items.push(m[1]!.trim());
        i++;
      }
      for (const item of items) {
        blocks.push({ t: 'p', x: `• ${item}` });
      }
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
      const m = trimmed.match(/\[\[sidenote:([^|]+)\|([^|\]]+)(?:\|([^\]]+))?\]\]/);
      if (m) {
        blocks.push({
          t: 'sidenote',
          anchor: m[1]!.trim(),
          x: m[2]!.trim(),
          body: m[3]?.trim(),
        });
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