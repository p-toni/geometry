export interface ShaderEntry {
  name: string;
  label: string;
  source: string;
  sliderLabel?: string;
}

const gradient = `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_slider;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * 0.18;
  vec3 a = vec3(1.00, 0.44, 0.14);
  vec3 b = vec3(0.23, 0.28, 0.49);
  vec3 c = vec3(0.86, 0.73, 0.65);
  float wave = 0.5 + 0.5 * sin((uv.x + uv.y) * (1.4 + u_slider * 4.0) + t);
  vec3 col = mix(mix(a, b, uv.y), c, wave);
  gl_FragColor = vec4(col, 1.0);
}
`;

const plasma = `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_slider;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float t = u_time * 0.4;
  float scale = 2.0 + u_slider * 8.0;
  float v = sin(uv.x * scale + t) + sin((uv.y + uv.x) * scale * 0.7 - t * 1.3);
  v += sin(length(uv) * scale * 1.4 - t);
  v = 0.5 + 0.5 * sin(v * 1.5);
  vec3 col = mix(vec3(0.13, 0.13, 0.16), vec3(1.00, 0.44, 0.14), v);
  col = mix(col, vec3(0.23, 0.28, 0.49), 1.0 - v);
  gl_FragColor = vec4(col, 1.0);
}
`;

const grid = `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_slider;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 g = fract(uv * (6.0 + u_slider * 30.0));
  float line = smoothstep(0.02, 0.0, min(min(g.x, g.y), min(1.0 - g.x, 1.0 - g.y)));
  float pulse = 0.5 + 0.5 * sin(u_time * 0.8 + uv.x * 6.0 - uv.y * 4.0);
  vec3 paper = vec3(0.98, 0.97, 0.96);
  vec3 ink = mix(vec3(0.23, 0.28, 0.49), vec3(1.00, 0.44, 0.14), pulse);
  vec3 col = mix(paper, ink, line);
  gl_FragColor = vec4(col, 1.0);
}
`;

const swatches = `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_slider;

vec3 palette(int i) {
  if (i == 0) return vec3(0.91, 0.87, 0.84);
  if (i == 1) return vec3(0.86, 0.73, 0.65);
  if (i == 2) return vec3(1.00, 0.44, 0.14);
  if (i == 3) return vec3(0.23, 0.28, 0.49);
  if (i == 4) return vec3(0.15, 0.18, 0.31);
  return vec3(0.13, 0.13, 0.14);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float speed = 0.2 + u_slider * 1.4;
  float drift = sin(u_time * speed + uv.y * 6.0) * 0.5 + 0.5;
  int idx = int(mod(floor(uv.x * 6.0 + drift), 6.0));
  vec3 col = palette(idx);
  gl_FragColor = vec4(col, 1.0);
}
`;

// Ported from public/shaders/sequinWave (originally embedded in an HTML iframe).
// Slider drives wave speed; mouse interaction omitted for the canvas-block runtime.
const sequinWave = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_slider;

#define PI 3.14159265359
#define TAU 6.28318530718
#define SQRT3 1.7320508

float hash21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
  float n = hash21(p);
  return vec2(n, hash21(p + n * 47.0));
}

vec4 hexTile(vec2 p, float scale) {
  p *= scale;
  vec2 s = vec2(1.0, SQRT3);
  vec2 halfS = s * 0.5;
  vec2 aBase = floor(p / s);
  vec2 aLocal = mod(p, s) - halfS;
  vec2 pOff = p - halfS;
  vec2 bBase = floor(pOff / s);
  vec2 bLocal = mod(pOff, s) - halfS;
  float dA = dot(aLocal, aLocal);
  float dB = dot(bLocal, bLocal);
  float pick = step(dA, dB);
  vec2 localCoord = mix(bLocal, aLocal, pick);
  vec2 cellId = mix(bBase + vec2(0.5), aBase, pick);
  return vec4(localCoord, cellId);
}

float waveField(vec2 cellPos, float t) {
  float w = 0.0;
  w += sin(dot(cellPos, vec2(0.7, 0.5)) * 3.5 - t * 2.8) * 0.35;
  w += sin(cellPos.x * 4.2 + t * 1.9) * 0.25;
  float r1 = length(cellPos - vec2(-0.3, 0.2));
  w += sin(r1 * 6.0 - t * 3.2) * 0.2 * smoothstep(1.2, 0.0, r1);
  w += sin(dot(cellPos, vec2(-0.4, 0.8)) * 2.8 - t * 1.5) * 0.2;
  float r2 = length(cellPos - vec2(0.4, -0.3));
  w += sin(r2 * 5.0 - t * 2.4) * 0.15 * smoothstep(1.0, 0.0, r2);
  return w;
}

float sequinSpecular(float tiltAngle, float tiltDir) {
  float ct = cos(tiltAngle);
  float st = sin(tiltAngle);
  float cd = cos(tiltDir);
  float sd = sin(tiltDir);
  vec3 N = vec3(st * cd, st * sd, ct);
  vec3 L = normalize(vec3(0.4, 0.6, 0.9));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 R = reflect(-L, N);
  float spec = max(dot(R, V), 0.0);
  spec = pow(spec, 48.0);
  float sheen = pow(max(dot(R, V), 0.0), 8.0) * 0.15;
  return spec + sheen;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
  float waveSpeed = 0.2 + u_slider * 1.6;
  float t = u_time * waveSpeed;
  float sequinScale = 38.0;
  vec4 hex = hexTile(uv, sequinScale);
  vec2 localPos = hex.xy;
  vec2 cellId = hex.zw;
  vec2 rnd = hash22(cellId);
  float sizeVar = 0.85 + rnd.x * 0.3;
  float baseTilt = (rnd.y - 0.5) * 0.15;
  float reflVar = 0.7 + rnd.x * 0.3;
  float phaseOff = rnd.y * TAU;
  float discRadius = 0.42 * sizeVar;
  float dist = length(localPos);
  float disc = smoothstep(discRadius, discRadius - 0.06, dist);
  float bevel = smoothstep(discRadius, discRadius - 0.04, dist)
              - smoothstep(discRadius - 0.04, discRadius - 0.08, dist);
  vec2 worldPos = cellId / sequinScale;
  float wave = waveField(worldPos, t);
  float shimmer = sin(t * 3.0 + phaseOff) * 0.04;
  float tiltAngle = wave * 0.85 + baseTilt + shimmer;
  float waveH = waveField(worldPos + vec2(0.01, 0.0), t);
  float waveV = waveField(worldPos + vec2(0.0, 0.01), t);
  float tiltDir = atan(waveV - wave, waveH - wave);
  float spec = sequinSpecular(tiltAngle, tiltDir) * reflVar;
  vec3 darkSequin = vec3(0.02, 0.015, 0.01);
  vec3 copperMid = vec3(0.78, 0.58, 0.42);
  vec3 amberFlash = vec3(1.0, 0.82, 0.55);
  vec3 hotGold = vec3(1.0, 0.92, 0.72);
  float facing = clamp(cos(tiltAngle) * 0.5 + 0.5, 0.0, 1.0);
  vec3 ambient = mix(darkSequin, vec3(0.05, 0.035, 0.02), facing * 0.6);
  vec3 sequinColor = ambient;
  float sheenAmount = pow(max(facing, 0.0), 3.0) * 0.2 * reflVar;
  sequinColor += copperMid * sheenAmount;
  float flashLow = smoothstep(0.0, 0.3, spec);
  float flashHigh = smoothstep(0.3, 0.8, spec);
  float flashPeak = smoothstep(0.7, 1.0, spec);
  sequinColor += copperMid * flashLow * 0.5;
  sequinColor += amberFlash * flashHigh * 0.8;
  sequinColor += hotGold * flashPeak * 1.2;
  sequinColor += copperMid * bevel * facing * 0.3;
  vec3 bgColor = vec3(0.012, 0.008, 0.005);
  vec3 col = mix(bgColor, sequinColor, disc);
  vec2 uvSafe = uv + vec2(0.0001);
  float globalLight = 0.85 + 0.15 * dot(normalize(uvSafe), vec2(0.4, 0.6));
  col *= globalLight;
  float vig = 1.0 - smoothstep(0.4, 1.3, length(uv));
  col *= 0.6 + 0.4 * vig;
  col = pow(max(col, vec3(0.0)), vec3(0.93, 0.97, 1.04));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export const SHADERS: ShaderEntry[] = [
  { name: 'sequinWave', label: 'Sequin Wave', source: sequinWave, sliderLabel: 'speed' },
  { name: 'gradient', label: 'Gradient', source: gradient, sliderLabel: 'frequency' },
  { name: 'plasma', label: 'Plasma', source: plasma, sliderLabel: 'scale' },
  { name: 'grid', label: 'Grid', source: grid, sliderLabel: 'density' },
  { name: 'swatches', label: 'Swatches', source: swatches, sliderLabel: 'speed' },
];

const SHADER_PREFIX = '@';

// Back-compat: existing canvases may store an @name reference instead of inline source.
// New blocks ship with full source so the user can edit it from the properties panel.
export function resolveShaderSource(content: string): string {
  if (!content.startsWith(SHADER_PREFIX)) return content;
  const name = content.slice(SHADER_PREFIX.length);
  return SHADERS.find((entry) => entry.name === name)?.source ?? content;
}

export const shaderSelectorOptions = SHADERS.map((entry) => ({
  label: entry.label,
  value: entry.source,
}));

export const DEFAULT_SHADER_SOURCE = SHADERS[0]?.source ?? gradient;
