import type { Block, LensChip, Pool, PoolNode } from '../pool/types';

const STOP = new Set([
  'the', 'a', 'an', 'of', 'and', 'or', 'to', 'in', 'on', 'is', 'are', 'what', 'who',
  'your', 'you', 'me', 'i', 'do', 'does', 'for', 'about', 'how', 'show', 'tell',
  'give', 'with', 'this', 'that', 'have', 'has', 'all', 'any', 'right', 'now', 'am',
]);

function blockText(block: Block): string {
  switch (block.t) {
    case 'p':
    case 'h':
    case 'thesis':
      return block.x;
    case 'callout':
    case 'sidenote':
      return block.x;
    case 'plate':
      return block.cap;
    case 'table':
      return [...block.headers, ...block.rows.flat()].join(' ');
    case 'edge-taxonomy':
      return block.rows.map((r) => `${r.type} ${r.force}`).join(' ');
    case 'steps':
      return block.items.join(' ');
    case 'backlink':
      return `${block.title} ${block.rel}`;
    default:
      return '';
  }
}

function haystack(node: PoolNode): string {
  return [
    node.title,
    node.kind,
    node.cluster,
    ...node.excerpt,
    ...node.body.map(blockText),
  ]
    .join(' ')
    .toLowerCase();
}

export function searchPool(pool: Pool, query: string, max = 6): string[] {
  const tokens = (query.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (t) => !STOP.has(t) && t.length > 1,
  );
  if (!tokens.length) return [];

  const scored = Object.values(pool.nodes)
    .map((node) => {
      const title = node.title.toLowerCase();
      const hay = haystack(node);
      let score = 0;
      for (const k of tokens) {
        if (title.includes(k)) score += 5;
        else if (hay.includes(k)) score += 2;
        if (node.cluster === k || node.kind === k) score += 3;
      }
      return { id: node.id, score };
    })
    .filter((x) => x.score > 0.6)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map((x) => x.id);
}

export function resolveLens(pool: Pool, query: string, lenses: LensChip[]): string[] {
  const chip = lenses.find(
    (l) =>
      l.query.toLowerCase() === query.toLowerCase() ||
      l.label.toLowerCase() === query.toLowerCase(),
  );
  if (chip) return chip.nodeIds.filter((id) => pool.nodes[id]);
  return searchPool(pool, query);
}

export function activeChipForQuery(query: string, lenses: LensChip[]): string | null {
  if (!query) return null;
  const chip = lenses.find(
    (l) =>
      l.query.toLowerCase() === query.toLowerCase() ||
      l.label.toLowerCase() === query.toLowerCase(),
  );
  return chip?.label ?? null;
}