type Grid = boolean[][];

const DOT = [
  [1, 8],
  [2, 16],
  [4, 32],
  [64, 128],
] as const;

function mk(h: number, w: number): Grid {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => false));
}

export function gridToBraille(grid: Grid): string {
  const cols = grid[0]?.length ?? 0;
  const gl = Math.ceil(cols / 2);
  let out = '';
  for (let gi = 0; gi < gl; gi++) {
    let b = 0;
    for (let r = 0; r < 4; r++) {
      for (let d = 0; d < 2; d++) {
        const c = gi * 2 + d;
        if (r < grid.length && grid[r]?.[c]) b |= DOT[r][d];
      }
    }
    out += String.fromCodePoint(0x2800 + b);
  }
  return out;
}

function radar(w: number, h: number, tail: number): string[] {
  const path: [number, number][] = [];
  for (let x = 0; x < w; x++) path.push([0, x]);
  for (let y = 1; y < h; y++) path.push([y, w - 1]);
  for (let x = w - 2; x >= 0; x--) path.push([h - 1, x]);
  for (let y = h - 2; y >= 1; y--) path.push([y, 0]);
  return path.map((_, i) => {
    const g = mk(h, w);
    for (let t = 0; t < tail; t++) {
      const p = path[(i - t + path.length) % path.length];
      g[p[0]][p[1]] = true;
    }
    return gridToBraille(g);
  });
}

function scan(w: number, h: number): string[] {
  const frames: string[] = [];
  for (let pos = -1; pos < w + 1; pos++) {
    const g = mk(h, w);
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (c === pos || c === pos - 1) g[r][c] = true;
      }
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function scanline(w: number, h: number): string[] {
  const frames: string[] = [];
  for (let row = 0; row < h; row++) {
    const g = mk(h, w);
    for (let y = 0; y <= row; y++) {
      for (let x = 0; x < w; x++) g[y][x] = true;
    }
    frames.push(gridToBraille(g));
  }
  for (let row = 0; row < h; row++) {
    const g = mk(h, w);
    for (let y = row + 1; y < h; y++) {
      for (let x = 0; x < w; x++) g[y][x] = true;
    }
    frames.push(gridToBraille(g));
  }
  frames.push(gridToBraille(mk(h, w)));
  return frames;
}

function cascade(w: number, h: number): string[] {
  const frames: string[] = [];
  const md = w + h;
  for (let o = -1; o < md; o++) {
    const g = mk(h, w);
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const d = c + r;
        if (d === o || d === o - 1) g[r][c] = true;
      }
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function pulse(w: number, h: number): string[] {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const frames: string[] = [];
  for (const radius of [0.3, 1.0, 1.8, 2.6, 3.4]) {
    const g = mk(h, w);
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (Math.abs(Math.hypot(c - cx, r - cy) - radius) < 0.85) g[r][c] = true;
      }
    }
    frames.push(gridToBraille(g));
  }
  frames.push(gridToBraille(mk(h, w)));
  return frames;
}

function converge(w: number, h: number): string[] {
  const frames = pulse(w, h).slice(0, -1).reverse();
  const cx = Math.floor((w - 1) / 2);
  const cy = Math.floor((h - 1) / 2);
  const center = mk(h, w);
  center[cy][cx] = true;
  if (cx + 1 < w) center[cy][cx + 1] = true;
  return [...frames, gridToBraille(center), gridToBraille(center)];
}

function bridge(w: number, h: number): string[] {
  const frames: string[] = [];
  const row = Math.floor(h / 2);
  for (let c = 0; c < w; c++) {
    const g = mk(h, w);
    g[0][0] = true;
    g[h - 1][w - 1] = true;
    for (let t = 0; t < 2; t++) {
      const cc = c - t;
      if (cc >= 0 && cc < w) g[row][cc] = true;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

function scatter(w: number, h: number): string[] {
  const cells: [number, number][] = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) cells.push([r, c]);
  }
  let s = 7;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const frames: string[] = [];
  const steps = 8;
  for (let k = 0; k <= steps; k++) {
    const g = mk(h, w);
    const keep = Math.round(cells.length * (1 - k / steps));
    for (let i = 0; i < keep; i++) {
      const [r, c] = cells[i];
      g[r][c] = true;
    }
    frames.push(gridToBraille(g));
  }
  return frames;
}

export type SpinVerb =
  | 'orbit'
  | 'survey'
  | 'index'
  | 'plot'
  | 'cascade'
  | 'scatter'
  | 'stack'
  | 'settle'
  | 'ripple'
  | 'bridge';

export const SPIN: Record<SpinVerb, { frames: string[]; intervalMs: number }> = {
  orbit: { frames: radar(2, 4, 1), intervalMs: 140 },
  survey: { frames: radar(6, 4, 3), intervalMs: 90 },
  index: { frames: scan(6, 4), intervalMs: 70 },
  plot: { frames: scanline(6, 4), intervalMs: 95 },
  cascade: { frames: cascade(6, 4), intervalMs: 60 },
  scatter: { frames: scatter(6, 4), intervalMs: 85 },
  stack: { frames: cascade(6, 4), intervalMs: 80 },
  settle: { frames: converge(6, 4), intervalMs: 75 },
  ripple: { frames: pulse(6, 4), intervalMs: 150 },
  bridge: { frames: bridge(6, 4), intervalMs: 110 },
};
