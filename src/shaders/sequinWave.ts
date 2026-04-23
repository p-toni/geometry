export const sequinWave = `
float sequinWave(vec2 uv, float time) {
  return sin((uv.x + uv.y) * 24.0 + time * 1.8) * 0.5 + 0.5;
}
`;
