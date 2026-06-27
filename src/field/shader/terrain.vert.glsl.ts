/** Full-screen triangle — matches v2 single-spine prototype. */
export const TERRAIN_VERTEX_SHADER = /* glsl */ `
attribute vec2 p;

void main() {
  gl_Position = vec4(p, 0.0, 1.0);
}
`;