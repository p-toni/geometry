import type { Point, Segment } from './marchingSquares';

const CHAIN_TOL = 0.6;

function near(a: Point, b: Point): boolean {
  return Math.abs(a[0] - b[0]) < CHAIN_TOL && Math.abs(a[1] - b[1]) < CHAIN_TOL;
}

/** Join marching-square segments into continuous polylines for smoother strokes. */
export function chainSegments(segments: Segment[]): Point[][] {
  if (!segments.length) return [];
  const used = new Set<number>();
  const chains: Point[][] = [];

  for (let s = 0; s < segments.length; s++) {
    if (used.has(s)) continue;
    used.add(s);
    const chain: Point[] = [segments[s][0], segments[s][1]];
    let extended = true;

    while (extended) {
      extended = false;
      for (let i = 0; i < segments.length; i++) {
        if (used.has(i)) continue;
        const [a, b] = segments[i];
        const head = chain[0];
        const tail = chain[chain.length - 1];
        if (near(tail, a)) {
          chain.push(b);
          used.add(i);
          extended = true;
        } else if (near(tail, b)) {
          chain.push(a);
          used.add(i);
          extended = true;
        } else if (near(head, b)) {
          chain.unshift(a);
          used.add(i);
          extended = true;
        } else if (near(head, a)) {
          chain.unshift(b);
          used.add(i);
          extended = true;
        }
      }
    }
    chains.push(chain);
  }

  return chains;
}

function segmentKey(seg: Segment): string {
  const [[x1, y1], [x2, y2]] = seg;
  const a = `${x1.toFixed(1)},${y1.toFixed(1)}`;
  const b = `${x2.toFixed(1)},${y2.toFixed(1)}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Adjacent marching-square cells emit duplicate edge segments — drop repeats. */
export function dedupeSegments(segments: Segment[]): Segment[] {
  const seen = new Set<string>();
  const out: Segment[] = [];
  for (const seg of segments) {
    const key = segmentKey(seg);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(seg);
  }
  return out;
}