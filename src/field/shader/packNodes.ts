import { pool } from '../../pool';
import { terrainHeight, type TerrainCtx } from '../terrainHeight';

export const MAX_TERRAIN_NODES = 24;

export type PackedNodes = {
  count: number;
  positions: Float32Array;
  weights: Float32Array;
};

/** Pack node positions + elevation weights for the terrain shader. */
export function packNodeUniforms(ctx: TerrainCtx): PackedNodes {
  const positions = new Float32Array(MAX_TERRAIN_NODES * 2);
  const weights = new Float32Array(MAX_TERRAIN_NODES);
  let count = 0;

  for (const [id, node] of Object.entries(pool.nodes)) {
    if (count >= MAX_TERRAIN_NODES) break;
    const pos = pool.layout.positions[id];
    if (!pos) continue;
    const { h, lit } = terrainHeight(id, node, ctx);
    const lift = lit ? Math.max(h * 0.22, 0.35) : Math.max(h * 0.08, 0.12);
    positions[count * 2] = pos[0];
    positions[count * 2 + 1] = pos[1];
    weights[count] = lift;
    count += 1;
  }

  return { count, positions, weights };
}

export function terrainModeUniform(_ctx: TerrainCtx): number {
  return 0;
}

/** Cobalt ink — matches --signal / prototype accent. */
export const TERRAIN_INK: readonly [number, number, number] = [
  31 / 255,
  77 / 255,
  184 / 255,
];