/**
 * Viewport-fixed terrain — ported from v2 single-spine.dc.html `_initGL`.
 * Samples in world coords via camera uniforms; opaque warm paper + cobalt relief.
 */
export const TERRAIN_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_dim;
uniform vec2 u_cam;
uniform float u_scale;
uniform float u_overview;
uniform vec2 u_world_size;
uniform int u_node_count;
uniform vec2 u_nodes[24];
uniform float u_node_weights[24];
uniform vec3 u_ink;

const int MAX_NODES = 24;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 world = u_overview > 0.5
    ? screen / u_res * u_world_size
    : (screen - u_cam) / max(u_scale, 0.0001);
  vec2 p = world * 0.0042;

  float elev = 0.0;
  for (int i = 0; i < MAX_NODES; i++) {
    if (i >= u_node_count) break;
    float d = distance(world, u_nodes[i]);
    elev += exp(-d * d / (2.0 * 135.0 * 135.0)) * u_node_weights[i];
  }

  vec2 q = vec2(
    fbm(p + vec2(0.0, u_time * 0.018)),
    fbm(p + vec2(5.2, 1.3) - u_time * 0.015)
  );
  float h = fbm(p + q * 1.4) * 0.62 + elev * 0.5;

  float bands = abs(fract(h * 5.5) - 0.5);
  float line = smoothstep(0.0, 0.07, bands);
  float relief = smoothstep(0.12, 0.85, h);

  vec3 col = vec3(0.945, 0.933, 0.910);
  col = mix(col, u_ink, (1.0 - line) * 0.09 * relief);
  col = mix(col, u_ink, h * 0.025);
  col = mix(col, vec3(0.945, 0.933, 0.910), u_dim * 0.32);

  gl_FragColor = vec4(col, 1.0);
}
`;