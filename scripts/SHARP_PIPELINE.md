# SHARP particle field — image → web pipeline

End-to-end recipe to produce assets for the `threeSharp` block.

## 1. Image → 3D Gaussian splat (`.ply`)

Apple's [SHARP](https://github.com/apple/ml-sharp) converts a single 2D image
into a metric Gaussian point cloud in under a second.

```bash
# one-time
git clone https://github.com/apple/ml-sharp.git
cd ml-sharp
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# run on your image
sharp predict -i path/to/photo.jpg -o ./out
```

This drops a binary little-endian `.ply` (positions + spherical-harmonic
coefficients in `f_dc_*`, plus opacity/scales/rotations we ignore here) into
`./out`. Works on architecture, ruins, landscapes — anything with a clear
focal subject.

## 2. `.ply` → compact `.splt` (web asset)

The runtime loader prefers `.splt`, our packed format: `~9 bytes` per point
versus `~24 bytes` for the float32 PLY (and that's before we pay for SH
coefficients). Tokyo went from 27 MB to 703 KB at 80k points (~40× smaller).

```bash
node scripts/ply-to-splt.mjs out/photo.ply public/photo.splt \
  --count=80000 \
  --radius=1.6
```

Flags:

- `--count` — target point count. The script samples uniformly through the
  source. 60–120k is a good range for a single block; 80k is the default.
- `--radius` — bounding radius after centering. `1.6` matches the demo block
  geometry; tweak if your camera frames the cloud differently.

Format spec (`SPLT v1`):

| bytes | field | type |
| --- | --- | --- |
| 0–3 | magic `SPLT` | ascii |
| 4 | version (1) | u8 |
| 5 | flags (bit 0 = sRGB) | u8 |
| 6–7 | reserved | — |
| 8–11 | count | u32 LE |
| 12–15 | scale (decode = `i / 32767 * scale`) | f32 LE |
| 16+ | per point: `x y z` int16 LE × 3, `r g b` u8 × 3 | 9 bytes |

## 3. Drop into a canvas

Add a `threeSharp` block to a canvas JSON, point `plyUrl` at the asset, and
optionally seed the preset selector.

```json
{
  "id": "ruins-cloud",
  "type": "threeSharp",
  "col": 32, "row": 9, "cols": 7, "rows": 8,
  "color": 5,
  "label": "ruins",
  "content": "{\n  \"plyUrl\": \"/photo.splt\",\n  \"count\": 80000,\n  \"size\": 0.05,\n  \"fitRadius\": 1.6\n}",
  "controls": [
    {
      "id": "selector-ruins",
      "kind": "selector",
      "value": "drift",
      "options": [
        { "label": "calm",  "value": "calm"  },
        { "label": "drift", "value": "drift" },
        { "label": "swirl", "value": "swirl" },
        { "label": "storm", "value": "storm" }
      ]
    },
    { "id": "slider-ruins", "kind": "slider", "value": 0.55, "min": 0, "max": 1 }
  ]
}
```

Content keys:

| key | default | notes |
| --- | --- | --- |
| `plyUrl` | — | `.splt` (preferred) or `.ply` |
| `count` | 12288 | capped at 262144; final count is `min(file, count)` |
| `size` | 0.07 | base point size |
| `fitRadius` | source-derived | re-centers + rescales positions |
| `influence` / `strength` / `frequency` | from preset | hard override the live preset |

Controls:

- The first **selector** picks a flow preset (`calm` / `drift` / `swirl` /
  `storm`). Switching presets ramps uniforms with damping — no jumps.
- The first **slider** acts as a global intensity multiplier (0..1 → 0.5..2)
  applied to the preset's `speed` and `strength`.

## 4. Verify locally

```bash
npm run dev
# block lives bottom-right on the home canvas; or add to any other canvas JSON.
```

Quick sanity checks: build (`npm run build`), tests (`npm test -- --run`).
