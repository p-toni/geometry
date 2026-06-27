import { pool } from '../../pool';
import type { Cluster } from '../../pool/types';
import { terrainHeight, type TerrainCtx } from '../terrainHeight';
import { clusterWeightsAt, dominantClusterAt } from './clusterField';
import { fbm } from './noise2d';

export const CONTOUR_CELL = 28;

export type Heightmap = {
  grid: number[][];
  clusterGrid: Cluster[][];
  cellW: number;
  cellH: number;
  cols: number;
  rows: number;
  min: number;
  max: number;
  /** World-space origin of grid cell (0,0). */
  originX: number;
  originY: number;
};

function gaussian(x: number, y: number, cx: number, cy: number, sigma: number): number {
  const dx = x - cx;
  const dy = y - cy;
  return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
}

const REGION_LIFT: Record<Cluster, number> = {
  writing: 0.24,
  work: 0.2,
  play: 0.17,
  you: 0.13,
};

const NODE_SIGMA = 72;

function sampleHeightAt(x: number, y: number, ctx: TerrainCtx): number {
  const weights = clusterWeightsAt(x, y);
  let h = fbm(x * 0.0028, y * 0.0028, 3) * 0.07;

  for (const region of pool.layout.regions) {
    h += weights[region.label] * REGION_LIFT[region.label];
  }

  for (const [id, node] of Object.entries(pool.nodes)) {
    const pos = pool.layout.positions[id];
    if (!pos) continue;
    const { h: peak, lit } = terrainHeight(id, node, ctx);
    const lift = lit ? peak * 0.11 : peak * 0.035;
    h += gaussian(x, y, pos[0], pos[1], NODE_SIGMA) * lift;
    if (lit && peak > 1.8) {
      h += gaussian(x, y, pos[0], pos[1], NODE_SIGMA * 0.55) * lift * 0.45;
    }
  }

  return h;
}

/** Build a height grid for any world-space rectangle (extends past the field bounds). */
export function buildHeightmapRegion(
  originX: number,
  originY: number,
  worldW: number,
  worldH: number,
  ctx: TerrainCtx,
): Heightmap {
  const cols = Math.ceil(worldW / CONTOUR_CELL) + 1;
  const rows = Math.ceil(worldH / CONTOUR_CELL) + 1;
  const grid: number[][] = [];
  const clusterGrid: Cluster[][] = [];
  let min = Infinity;
  let max = -Infinity;

  for (let gy = 0; gy < rows; gy++) {
    const row: number[] = [];
    const clusterRow: Cluster[] = [];
    for (let gx = 0; gx < cols; gx++) {
      const x = originX + gx * CONTOUR_CELL;
      const y = originY + gy * CONTOUR_CELL;
      const h = sampleHeightAt(x, y, ctx);
      row.push(h);
      clusterRow.push(dominantClusterAt(x, y));
      min = Math.min(min, h);
      max = Math.max(max, h);
    }
    grid.push(row);
    clusterGrid.push(clusterRow);
  }

  const smoothed = smoothHeightGrid(grid);
  let sMin = Infinity;
  let sMax = -Infinity;
  for (const row of smoothed) {
    for (const v of row) {
      sMin = Math.min(sMin, v);
      sMax = Math.max(sMax, v);
    }
  }

  return {
    grid: smoothed,
    clusterGrid,
    cellW: CONTOUR_CELL,
    cellH: CONTOUR_CELL,
    cols,
    rows,
    min: sMin,
    max: sMax,
    originX,
    originY,
  };
}

/** Light box blur — removes grid chatter before marching squares. */
function smoothHeightGrid(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const out: number[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: number[] = [];
    for (let x = 0; x < cols; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || nx < 0 || ny >= rows || nx >= cols) continue;
          sum += grid[ny][nx];
          n++;
        }
      }
      row.push(sum / n);
    }
    out.push(row);
  }
  return out;
}

export function buildHeightmap(width: number, height: number, ctx: TerrainCtx): Heightmap {
  return buildHeightmapRegion(0, 0, width, height, ctx);
}

export function contourLevels(map: Heightmap, count = 11): number[] {
  const span = map.max - map.min || 1;
  const step = span / (count + 1);
  const levels: number[] = [];
  for (let i = 1; i <= count; i++) levels.push(map.min + step * i);
  return levels;
}