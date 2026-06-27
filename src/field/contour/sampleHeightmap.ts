import type { Heightmap } from './buildHeightmap';

function clampIndex(v: number, max: number): number {
  return Math.max(0, Math.min(max, v));
}

/** Bilinear height sample — avoids cell-block banding from nearest-neighbor fills. */
export function sampleHeightBilinear(map: Heightmap, worldX: number, worldY: number): number {
  const { grid, cols, rows, cellW, cellH, originX, originY } = map;
  const gx = (worldX - originX) / cellW;
  const gy = (worldY - originY) / cellH;

  const x0 = clampIndex(Math.floor(gx), cols - 1);
  const y0 = clampIndex(Math.floor(gy), rows - 1);
  const x1 = clampIndex(x0 + 1, cols - 1);
  const y1 = clampIndex(y0 + 1, rows - 1);
  const fx = gx - Math.floor(gx);
  const fy = gy - Math.floor(gy);

  const h00 = grid[y0][x0];
  const h10 = grid[y0][x1];
  const h01 = grid[y1][x0];
  const h11 = grid[y1][x1];

  const top = h00 + (h10 - h00) * fx;
  const bottom = h01 + (h11 - h01) * fx;
  return top + (bottom - top) * fy;
}

export function heightT(map: Heightmap, h: number): number {
  const span = map.max - map.min || 1;
  return Math.max(0, Math.min(1, (h - map.min) / span));
}