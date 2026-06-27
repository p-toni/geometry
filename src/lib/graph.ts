import type { Pool, Rel } from '../pool/types';

export function uniqueEdges(pool: Pool): [string, string][] {
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  for (const [fromId, node] of Object.entries(pool.nodes)) {
    for (const [toId] of node.links) {
      if (!pool.nodes[toId]) continue;
      const key = [fromId, toId].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([fromId, toId]);
    }
  }
  return edges;
}

export function neighbors(pool: Pool, id: string): { id: string; rel: Rel }[] {
  const node = pool.nodes[id];
  if (!node) return [];
  return node.links
    .filter(([target]) => pool.nodes[target])
    .map(([target, rel]) => ({ id: target, rel }));
}

export function inboundLinks(pool: Pool, id: string): { fromId: string; rel: Rel }[] {
  const out: { fromId: string; rel: Rel }[] = [];
  for (const [fromId, node] of Object.entries(pool.nodes)) {
    for (const [toId, rel] of node.links) {
      if (toId === id) out.push({ fromId, rel });
    }
  }
  return out;
}