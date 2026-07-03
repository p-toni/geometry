import type { PoolNode, Rel } from '../pool/types';

export type TerrainCtx = {
  mode: 'field' | 'lens' | 'read';
  readId: string | null;
  neighborRels: Record<string, Rel>;
  matched: Set<string>;
};

/** Shared elevation/lit rules for field nodes and minimap terrain. */
export function terrainHeight(
  id: string,
  node: PoolNode,
  ctx: TerrainCtx,
): { h: number; lit: boolean } {
  let h = 1 + (10 - node.rank) * 0.05;
  let lit = true;

  if (ctx.mode === 'read' && ctx.readId) {
    h = id === ctx.readId ? 2.4 : ctx.neighborRels[id] ? 1.6 : 0.42;
    lit = id === ctx.readId || !!ctx.neighborRels[id];
  } else if (ctx.mode === 'lens') {
    h = ctx.matched.has(id) ? 1.95 : 0.42;
    lit = ctx.matched.has(id);
  }

  return { h, lit };
}