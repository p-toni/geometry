import type { Cluster } from '../../pool/types';
import { FIELD_HEIGHT, FIELD_WIDTH, pool } from '../../pool';
import type { TerrainCtx } from '../terrainHeight';
import { terrainHeight } from '../terrainHeight';
import { clusterTone } from '../clusterTone';
import { contourStroke, dominantClusterAt, volumeFillRgba } from './clusterField';
import { buildHeightmapRegion, contourLevels, type Heightmap } from './buildHeightmap';
import { marchingSquares, type Point, type Segment } from './marchingSquares';
import { chainSegments, dedupeSegments } from './segmentUtils';
import { heightT, sampleHeightBilinear } from './sampleHeightmap';

export type ContourFrame = {
  map: Heightmap;
  levels: number[];
  segmentsByLevel: Segment[][];
};

const CONTOUR_COUNT = 11;
const VOLUME_STRIDE = 2;

/** Soft fade near field boundary — keeps canvas transparent (no rectangle). */
export function fieldAlpha(worldX: number, worldY: number, pad: number): number {
  if (worldX < 0 || worldX > FIELD_WIDTH || worldY < 0 || worldY > FIELD_HEIGHT) return 0;
  const inset = Math.min(worldX, FIELD_WIDTH - worldX, worldY, FIELD_HEIGHT - worldY);
  if (inset >= pad) return 1;
  return inset / pad;
}

export function buildContourFrame(
  worldW: number,
  worldH: number,
  ctx: TerrainCtx,
  originX = 0,
  originY = 0,
): ContourFrame {
  const map = buildHeightmapRegion(originX, originY, worldW, worldH, ctx);
  const levels = contourLevels(map, CONTOUR_COUNT);
  const segmentsByLevel = levels.map((level) =>
    dedupeSegments(marchingSquares(map.grid, map.cellW, map.cellH, level)),
  );
  return { map, levels, segmentsByLevel };
}

function offsetSegment(seg: Segment, ox: number, oy: number): Segment {
  return [
    [seg[0][0] + ox, seg[0][1] + oy],
    [seg[1][0] + ox, seg[1][1] + oy],
  ];
}

function segmentCluster(seg: Segment): Cluster {
  const mx = (seg[0][0] + seg[1][0]) * 0.5;
  const my = (seg[0][1] + seg[1][1]) * 0.5;
  return dominantClusterAt(mx, my);
}

/** Hypsometric volume from the same heightmap + palette as the isolines. */
function paintVolume(
  ctx2d: CanvasRenderingContext2D,
  map: Heightmap,
  terrainCtx: TerrainCtx,
  dimmed: boolean,
  worldW: number,
  worldH: number,
  originX: number,
  originY: number,
  pad: number,
): void {
  const w = Math.ceil(worldW);
  const h = Math.ceil(worldH);
  const image = ctx2d.createImageData(w, h);
  const data = image.data;

  for (let py = 0; py < h; py += VOLUME_STRIDE) {
    for (let px = 0; px < w; px += VOLUME_STRIDE) {
      const wx = originX + px + 0.5;
      const wy = originY + py + 0.5;
      const height = sampleHeightBilinear(map, wx, wy);
      const t = heightT(map, height);
      const cluster = dominantClusterAt(wx, wy);
      const [r, g, b, a] = volumeFillRgba(terrainCtx.mode, cluster, t, dimmed);
      const alpha = a * fieldAlpha(wx, wy, pad);
      const alphaByte = Math.round(alpha * 255);
      if (alphaByte === 0) continue;

      for (let dy = 0; dy < VOLUME_STRIDE && py + dy < h; dy++) {
        for (let dx = 0; dx < VOLUME_STRIDE && px + dx < w; dx++) {
          const i = ((py + dy) * w + (px + dx)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = alphaByte;
        }
      }
    }
  }

  ctx2d.putImageData(image, 0, 0);
}

function strokeChains(
  ctx2d: CanvasRenderingContext2D,
  chains: Point[][],
  style: string,
  lineWidth: number,
  ox: number,
  oy: number,
): void {
  if (!chains.length) return;
  ctx2d.beginPath();
  ctx2d.strokeStyle = style;
  ctx2d.lineWidth = lineWidth;
  ctx2d.lineJoin = 'round';
  ctx2d.lineCap = 'round';
  for (const chain of chains) {
    if (chain.length < 2) continue;
    ctx2d.moveTo(chain[0][0] + ox, chain[0][1] + oy);
    for (let i = 1; i < chain.length; i++) {
      ctx2d.lineTo(chain[i][0] + ox, chain[i][1] + oy);
    }
  }
  ctx2d.stroke();
}

function paintIsolines(
  ctx2d: CanvasRenderingContext2D,
  frame: ContourFrame,
  terrainCtx: TerrainCtx,
  dimmed: boolean,
  lineWidth: number,
): void {
  const { map, segmentsByLevel } = frame;
  const levelSpan = Math.max(segmentsByLevel.length - 1, 1);
  const ox = map.originX;
  const oy = map.originY;

  segmentsByLevel.forEach((segments, i) => {
    if (!segments.length) return;
    const levelT = i / levelSpan;
    const offset = segments.map((s) => offsetSegment(s, ox, oy));

    if (terrainCtx.mode === 'field') {
      const byCluster = new Map<Cluster, Segment[]>();
      for (const seg of offset) {
        const c = segmentCluster(seg);
        const list = byCluster.get(c) ?? [];
        list.push(seg);
        byCluster.set(c, list);
      }
      for (const [cluster, segs] of byCluster) {
        strokeChains(
          ctx2d,
          chainSegments(segs),
          contourStroke(cluster, levelT, 'field', dimmed),
          lineWidth,
          0,
          0,
        );
      }
      return;
    }

    strokeChains(
      ctx2d,
      chainSegments(offset),
      contourStroke('writing', levelT, terrainCtx.mode, dimmed),
      lineWidth,
      0,
      0,
    );
  });
}

/**
 * Single terrain pass: heightmap → hypsometric volume → marching-squares isolines.
 * Volume and lines share cluster palette + scalar field.
 */
export function paintContourLines(
  ctx2d: CanvasRenderingContext2D,
  worldW: number,
  worldH: number,
  terrainCtx: TerrainCtx,
  dimmed: boolean,
  lineWidth = 0.95,
  originX = 0,
  originY = 0,
  pad = 56,
): void {
  const frame = buildContourFrame(worldW, worldH, terrainCtx, originX, originY);
  ctx2d.clearRect(0, 0, ctx2d.canvas.width, ctx2d.canvas.height);

  paintVolume(
    ctx2d,
    frame.map,
    terrainCtx,
    dimmed,
    worldW,
    worldH,
    originX,
    originY,
    pad,
  );
  const lw =
    terrainCtx.mode === 'field' ? lineWidth : lineWidth * 1.12;
  paintIsolines(ctx2d, frame, terrainCtx, dimmed, lw);
}

/** Summit marks for the survey minimap — peaks only. */
export function paintMinimapPeaks(
  ctx2d: CanvasRenderingContext2D,
  terrainCtx: TerrainCtx,
): void {
  const interactive = terrainCtx.mode === 'read' || terrainCtx.mode === 'lens';

  for (const [id, node] of Object.entries(pool.nodes)) {
    const pos = pool.layout.positions[id];
    if (!pos) continue;
    const [x, y] = pos;
    const { lit } = terrainHeight(id, node, terrainCtx);
    const tone = clusterTone(node.cluster);

    let fill: string;
    if (terrainCtx.readId === id) fill = '#1c1f24';
    else if (lit && interactive) fill = '#1f4db8';
    else if (lit) fill = tone.minimap;
    else fill = '#b8c0ba';

    const r = terrainCtx.readId === id ? 7 : lit ? 5.5 : 3.5;
    const alpha = lit ? 0.88 : 0.42;

    ctx2d.beginPath();
    ctx2d.fillStyle = fill;
    ctx2d.globalAlpha = alpha;
    ctx2d.arc(x, y, r, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.globalAlpha = 1;
  }
}

/** @deprecated alias */
export function paintContours(
  ctx2d: CanvasRenderingContext2D,
  width: number,
  height: number,
  terrainCtx: TerrainCtx,
  dimmed: boolean,
): void {
  paintContourLines(ctx2d, width, height, terrainCtx, dimmed);
}