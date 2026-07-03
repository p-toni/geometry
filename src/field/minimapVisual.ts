import { uniqueEdges } from '../lib/graph';
import { FIELD_HEIGHT, FIELD_WIDTH, pool } from '../pool';
import { terrainHeight, type TerrainCtx } from './terrainHeight';

const SIGNAL = '#1f4db8';
const MUTED = '#a39b8c';
const EDGE_IDLE = '#bcc3bd';

export type MinimapEdge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  sw: number;
  op: number;
};

export type MinimapSummit = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  op: number;
};

/** Display size in CSS px — matches .field-minimap */
export const MINIMAP_DISPLAY = { width: 138, height: 84 } as const;
/** Internal render resolution (2× display for crisp downscale). ~100× fewer pixels than full field. */
export const MINIMAP_DPR = 2;
export const MINIMAP_RENDER = {
  width: MINIMAP_DISPLAY.width * MINIMAP_DPR,
  height: MINIMAP_DISPLAY.height * MINIMAP_DPR,
} as const;

export function terrainStateKey(ctx: TerrainCtx): string {
  return [
    ctx.mode,
    ctx.readId ?? '',
    [...ctx.matched].sort().join(','),
    Object.keys(ctx.neighborRels).sort().join(','),
  ].join('|');
}

export function buildMinimapEdges(ctx: TerrainCtx): MinimapEdge[] {
  const readId = ctx.readId;
  const lensActive = ctx.mode === 'lens';

  return uniqueEdges(pool).flatMap(([a, b]) => {
    const pa = pool.layout.positions[a];
    const pb = pool.layout.positions[b];
    if (!pa || !pb) return [];
    const live =
      Boolean(readId && (a === readId || b === readId)) ||
      (lensActive && ctx.matched.has(a) && ctx.matched.has(b));
    const dimmed = Boolean((readId || lensActive) && !live);
    return [
      {
        x1: pa[0],
        y1: pa[1],
        x2: pb[0],
        y2: pb[1],
        stroke: live ? SIGNAL : EDGE_IDLE,
        sw: live ? 1.6 : 1,
        op: dimmed ? 0.25 : live ? 0.95 : 0.55,
      },
    ];
  });
}

export function buildMinimapSummits(ctx: TerrainCtx): MinimapSummit[] {
  const readId = ctx.readId;
  const summits: MinimapSummit[] = [];

  for (const [id, node] of Object.entries(pool.nodes)) {
    const pos = pool.layout.positions[id];
    if (!pos) continue;
    const { lit } = terrainHeight(id, node, ctx);

    let fill = MUTED;
    let r = 5;
    let op = 0.5;

    if (readId === id) {
      fill = '#1c1f24';
      r = 8;
      op = 0.95;
    } else if (lit) {
      fill = SIGNAL;
      r = 6;
      op = 0.95;
    }

    summits.push({ cx: pos[0], cy: pos[1], r, fill, op });
  }

  return summits;
}

export const MINIMAP_FIELD = { width: FIELD_WIDTH, height: FIELD_HEIGHT } as const;

/** Pixel count ratio vs rendering the full field canvas. */
export const MINIMAP_PIXEL_RATIO =
  (MINIMAP_RENDER.width * MINIMAP_RENDER.height) / (FIELD_WIDTH * FIELD_HEIGHT);