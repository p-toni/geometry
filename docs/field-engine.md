# Field engine — terrain & camera

Handoff reference for the living field canvas (`FieldApp`).

**Source of truth:** `toni.ltd - v2 single-spine.dc.html` — `_initGL()` / `_drawGL()` (WebGL terrain) and `renderVals()` terrain array (minimap). The React port lives in `src/field/shader/`.

## Layer stack (viewport)

Inside `vpRef` (the pannable viewport):

| z | Layer | Implementation |
|---|--------|----------------|
| 0 | **Terrain** | `FieldTerrainCanvas` — viewport-fixed WebGL canvas |
| 1 | Grid | `.field-grid` CSS gradients |
| 2 | Grain | `.field-grain` SVG noise |
| 3 | World | `worldRef` — nodes, edges, labels (CSS transform pan/zoom) |
| 4 | Vignette | _(prototype has radial edge fade — not yet ported)_ |
| 5 | Chrome | zoom controls, minimap, status |

The terrain canvas is **not** inside `worldRef`. It fills the viewport (`inset: 0; width/height: 100%`) and uses camera uniforms to sample world coordinates — so relief pans and zooms with the field without being a screen-fixed overlay.

## Terrain shader

**Files:** `src/field/shader/`, `src/field/FieldTerrainCanvas.tsx`

A GLSL fragment shader on a viewport-sized `<canvas>`. Not SVG isolines, not CSS glow, not marching-squares.

### Height field (from v2 prototype)

```
screen = gl_FragCoord (Y-flipped)
world  = (screen - u_cam) / u_scale
p      = world * 0.0042

elev   = Σ exp(-d² / 2σ²) * weight   per node (σ = 135)
q      = domain warp via two fbm passes drifting on u_time
h      = fbm(p + q * 1.4) * 0.62 + elev * 0.5
```

- **Organic relief:** domain-warped fbm (5 octaves). Warp drifts slowly on `u_time` — alive but quiet.
- **Node density:** Gaussian bumps at pool node positions. Weights from `terrainHeight()` so read/lens/now modes reshape elevation meaningfully (enhancement over prototype's flat count).

### Visual language

- Opaque warm paper base: `vec3(0.945, 0.933, 0.910)`
- Cobalt ink (`u_ink` = `#1F4DB8`) on contour bands and relief
- Hair-fine contour banding: `fract(h * 5.5)` + `smoothstep(0.0, 0.07, …)`
- Read mode: `u_dim` softens contrast

### Uniforms

| Uniform | Source |
|---------|--------|
| `u_res` | Viewport `clientWidth` × `clientHeight` |
| `u_time` | rAF elapsed seconds; **frozen at 0** when `prefers-reduced-motion: reduce` |
| `u_cam` | `[transform.x, transform.y]` |
| `u_scale` | `transform.z` |
| `u_dim` | 1 in read mode, 0 otherwise |
| `u_nodes[i]` | `packNodeUniforms()` → world `vec2` per node (max 24) |
| `u_node_weights[i]` | Elevation weight from `terrainHeight()` |
| `u_ink` | Cobalt accent `rgb(31, 77, 184)` |

### Camera attachment

The shader converts **screen pixels → world coords** via `u_cam` + `u_scale`. This matches the prototype's `ax/ay/az` model. The canvas stays viewport-fixed; the relief scrolls correctly as you drag and zoom.

## Minimap

SVG hypsometric rings per node — matches v2 `terrain` array in `renderVals()`. Not WebGL. Re-weights on mode change via `terrainHeight()`.

## Shared elevation rules

`src/field/terrainHeight.ts` is the single source of truth for node lit/height across:

- Terrain shader node weights
- Minimap rings
- Node visual dimming (`nodeVisual.ts`)

## Retired approaches

| Approach | Status |
|----------|--------|
| SVG elliptical topo rings (field layer) | Removed |
| Marching-squares contour canvas (`FieldTopoCanvas`, `src/field/contour/`) | Retired from render path; code kept for reference/tests |
| Flow-field vector overlay | Never shipped — v2 prototype uses cluster bloom + edge particles instead; not yet ported |
| Transparent alpha terrain overlay | Replaced by opaque prototype shader |

## Tuning knobs

All in `src/field/shader/terrain.frag.glsl.ts`:

- Drift: `u_time * 0.018` / `u_time * 0.015` warp coefficients
- Contour density: `h * 5.5` band multiplier
- Node sigma: `135.0` (prototype default)
- Ink strength: `0.09 * relief` on bands, `h * 0.025` on height
- Paper base: `vec3(0.945, 0.933, 0.910)`

## Porting checklist (prototype → React)

- [x] Viewport-fixed WebGL canvas with camera uniforms
- [x] Domain-warped fbm + node-density elevation
- [x] Reduced-motion freeze
- [x] Minimap SVG terrain rings
- [ ] Viewport vignette (`radial-gradient` at z-index 4)
- [ ] Cluster bloom atmosphere (SVG radial washes)
- [ ] Living edge particles (SMIL on link graph)