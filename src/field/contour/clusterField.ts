import { pool } from '../../pool';
import type { Cluster } from '../../pool/types';
import { clusterTone } from '../clusterTone';

const CLUSTERS: Cluster[] = ['writing', 'work', 'play', 'you'];

const REGION_SIGMA: Record<Cluster, number> = {
  writing: 240,
  work: 200,
  play: 190,
  you: 150,
};

const NODE_SIGMA = 95;

function gaussian(x: number, y: number, cx: number, cy: number, sigma: number): number {
  const dx = x - cx;
  const dy = y - cy;
  return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
}

/** Soft cluster weights at a world coordinate — used for map tinting. */
export function clusterWeightsAt(x: number, y: number): Record<Cluster, number> {
  const w: Record<Cluster, number> = { writing: 0, work: 0, play: 0, you: 0 };

  for (const region of pool.layout.regions) {
    const sigma = REGION_SIGMA[region.label];
    w[region.label] += gaussian(x, y, region.x, region.y, sigma) * 1.4;
    w[region.label] += gaussian(x, y, region.x, region.y, sigma * 1.55) * 0.55;
  }

  for (const [id, node] of Object.entries(pool.nodes)) {
    const pos = pool.layout.positions[id];
    if (!pos) continue;
    w[node.cluster] += gaussian(x, y, pos[0], pos[1], NODE_SIGMA) * 0.45;
  }

  return w;
}

export function dominantClusterAt(x: number, y: number): Cluster {
  const w = clusterWeightsAt(x, y);
  let best: Cluster = 'writing';
  let peak = -1;
  for (const c of CLUSTERS) {
    if (w[c] > peak) {
      peak = w[c];
      best = c;
    }
  }
  return best;
}

function parseRgb(rgb: string): [number, number, number] {
  const m = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return [90, 104, 168];
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Valley→ridge RGB shared by volume fill and contour ink family. */
export function terrainRgb(
  mode: 'field' | 'lens' | 'now' | 'read',
  cluster: Cluster,
  t: number,
): [number, number, number] {
  const u = clamp01(t);
  if (mode === 'field') {
    const tone = clusterTone(cluster);
    const [vr, vg, vb] = parseRgb(tone.terrain.valley);
    const [rr, rg, rb] = parseRgb(tone.terrain.ridge);
    return [
      Math.round(vr + (rr - vr) * u),
      Math.round(vg + (rg - vg) * u),
      Math.round(vb + (rb - vb) * u),
    ];
  }
  if (mode === 'now') {
    return [
      Math.round(252 - u * 6),
      Math.round(210 - u * 112),
      Math.round(168 - u * 148),
    ];
  }
  return [
    Math.round(210 - u * 72),
    Math.round(224 - u * 48),
    Math.round(248 - u * 32),
  ];
}

/** Hypsometric volume — same palette as contour lines, transparent wash. */
export function volumeFillRgba(
  mode: 'field' | 'lens' | 'now' | 'read',
  cluster: Cluster,
  t: number,
  dimmed: boolean,
): [number, number, number, number] {
  const [r, g, b] = terrainRgb(mode, cluster, t);
  const modeBoost = mode === 'now' ? 1.35 : mode === 'lens' ? 1.2 : 1;
  const base = (dimmed ? 0.12 : 0.27) * modeBoost;
  const a = base * (0.35 + clamp01(t) * 0.65);
  return [r, g, b, a];
}

/** Faint hypsometric wash — readable geography without painting the field. */
export function hypsometricWhisper(cluster: Cluster, t: number, dimmed: boolean): string {
  const tone = clusterTone(cluster);
  const [vr, vg, vb] = parseRgb(tone.terrain.valley);
  const [rr, rg, rb] = parseRgb(tone.terrain.ridge);
  const u = Math.max(0, Math.min(1, t));
  const r = Math.round(vr + (rr - vr) * u);
  const g = Math.round(vg + (rg - vg) * u);
  const b = Math.round(vb + (rb - vb) * u);
  const base = dimmed ? 0.07 : 0.16;
  const a = base * (0.45 + u * 0.55);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export function contourStroke(
  cluster: Cluster,
  levelT: number,
  mode: 'field' | 'lens' | 'now' | 'read',
  dimmed: boolean,
): string {
  const u = clamp01(levelT);
  const [r, g, b] = terrainRgb(mode, cluster, u);
  const modeBoost = mode === 'now' ? 1.45 : mode === 'lens' ? 1.3 : mode === 'read' ? 0.9 : 1;
  const a = (0.15 + u * 0.2) * (dimmed ? 0.62 : 1) * modeBoost;
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}
