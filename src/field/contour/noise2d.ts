/** Compact 2D value noise — deterministic, no dependencies. */
export function createNoise2D(seed = 42) {
  const perm = new Uint8Array(512);
  const src = new Uint8Array(256);
  for (let i = 0; i < 256; i++) src[i] = i;
  let s = seed >>> 0;
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = src[i];
    src[i] = src[j];
    src[j] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = src[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return function noise2D(x: number, y: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[xi] + yi;
    const ab = perm[xi + 1] + yi;
    return lerp(
      lerp(grad(perm[aa], xf, yf), grad(perm[ab], xf - 1, yf), u),
      lerp(grad(perm[aa + 1], xf, yf - 1), grad(perm[ab + 1], xf - 1, yf - 1), u),
      v,
    );
  };
}

const defaultNoise = createNoise2D(geometrySeed());

function geometrySeed() {
  let h = 0x6a61726b;
  for (const ch of 'toni.ltd/geometry') h = Math.imul(31, h) + ch.charCodeAt(0);
  return h >>> 0;
}

/** Fractal Brownian motion in roughly 0–1 range. */
export function fbm(x: number, y: number, octaves = 4): number {
  let value = 0;
  let amp = 0.55;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += (defaultNoise(x * freq, y * freq) * 0.5 + 0.5) * amp;
    amp *= 0.48;
    freq *= 2.05;
  }
  return value;
}