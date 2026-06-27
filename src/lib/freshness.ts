import type { PoolNode } from '../pool/types';

/** Recency score for Now lens — matches v2 prototype `_freshScore`. */
export function freshScore(node: PoolNode): number {
  const f = node.date.toLowerCase();
  if (f === 'today' || f === 'live') return 3;
  if (f.includes('day')) return 2;
  if (f.includes('1 week') || f === 'week') return 1;
  return 0;
}

export function freshLabel(node: PoolNode): string {
  return node.date;
}