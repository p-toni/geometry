export type Point = [number, number];
export type Segment = [Point, Point];

type Corner = 0 | 1 | 2 | 3; // tl, tr, br, bl

function interp(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  ha: number,
  hb: number,
  level: number,
): Point {
  if (Math.abs(hb - ha) < 1e-9) return [ax, ay];
  const t = (level - ha) / (hb - ha);
  return [ax + (bx - ax) * t, ay + (by - ay) * t];
}

function cornerHigh(value: number, level: number): boolean {
  return value >= level;
}

/** Trace contour segments for one isoline threshold on a regular height grid. */
export function marchingSquares(
  grid: number[][],
  cellW: number,
  cellH: number,
  level: number,
): Segment[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows < 2 || cols < 2) return [];

  const segments: Segment[] = [];

  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const tl = grid[y][x];
      const tr = grid[y][x + 1];
      const br = grid[y + 1][x + 1];
      const bl = grid[y + 1][x];

      const c: Record<Corner, boolean> = {
        0: cornerHigh(tl, level),
        1: cornerHigh(tr, level),
        2: cornerHigh(br, level),
        3: cornerHigh(bl, level),
      };

      const idx = (c[0] ? 8 : 0) | (c[1] ? 4 : 0) | (c[2] ? 2 : 0) | (c[3] ? 1 : 0);
      if (idx === 0 || idx === 15) continue;

      const x0 = x * cellW;
      const y0 = y * cellH;
      const x1 = x0 + cellW;
      const y1 = y0 + cellH;

      const top = interp(x0, y0, x1, y0, tl, tr, level);
      const right = interp(x1, y0, x1, y1, tr, br, level);
      const bottom = interp(x0, y1, x1, y1, bl, br, level);
      const left = interp(x0, y0, x0, y1, tl, bl, level);

      const push = (a: Point, b: Point) => segments.push([a, b]);

      if (idx === 5 || idx === 10) {
        const center = (tl + tr + br + bl) * 0.25;
        const joinA = center >= level;
        if (idx === 5) {
          if (joinA) push(left, top), push(bottom, right);
          else push(left, bottom), push(top, right);
        } else {
          if (joinA) push(left, bottom), push(top, right);
          else push(left, top), push(bottom, right);
        }
        continue;
      }

      const edges: [Point, Point][] = [
        [top, right],
        [right, bottom],
        [bottom, left],
        [left, top],
      ];

      const table: Record<number, [number, number][]> = {
        1: [[3, 2]],
        2: [[2, 1]],
        3: [[3, 1]],
        4: [[1, 0]],
        6: [[2, 0]],
        7: [[3, 0]],
        8: [[0, 3]],
        9: [[0, 2]],
        11: [[0, 1]],
        12: [[1, 2]],
        13: [[1, 2]],
        14: [[3, 2]],
      };

      for (const [a, b] of table[idx] ?? []) push(edges[a][0], edges[b][0]);
    }
  }

  return segments;
}