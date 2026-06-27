import { TERRAIN_FRAGMENT_SHADER } from './terrain.frag.glsl';
import { TERRAIN_VERTEX_SHADER } from './terrain.vert.glsl';
import { MAX_TERRAIN_NODES, TERRAIN_INK } from './packNodes';

export type TerrainUniforms = {
  width: number;
  height: number;
  time: number;
  dimmed: number;
  cam: readonly [number, number];
  scale: number;
  nodeCount: number;
  nodePositions: Float32Array;
  nodeWeights: Float32Array;
  ink?: readonly [number, number, number];
};

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown';
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown';
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log}`);
  }
  return program;
}

export class WebglTerrainRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private locRes: WebGLUniformLocation | null;
  private locTime: WebGLUniformLocation | null;
  private locDim: WebGLUniformLocation | null;
  private locCam: WebGLUniformLocation | null;
  private locScale: WebGLUniformLocation | null;
  private locNodeCount: WebGLUniformLocation | null;
  private locNodes: WebGLUniformLocation | null;
  private locWeights: WebGLUniformLocation | null;
  private locInk: WebGLUniformLocation | null;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL not available');

    const vs = compileShader(gl, gl.VERTEX_SHADER, TERRAIN_VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, TERRAIN_FRAGMENT_SHADER);
    const program = linkProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.gl = gl;
    this.program = program;
    this.buffer = buffer;
    this.locRes = gl.getUniformLocation(program, 'u_res');
    this.locTime = gl.getUniformLocation(program, 'u_time');
    this.locDim = gl.getUniformLocation(program, 'u_dim');
    this.locCam = gl.getUniformLocation(program, 'u_cam');
    this.locScale = gl.getUniformLocation(program, 'u_scale');
    this.locNodeCount = gl.getUniformLocation(program, 'u_node_count');
    this.locNodes = gl.getUniformLocation(program, 'u_nodes[0]');
    this.locWeights = gl.getUniformLocation(program, 'u_node_weights[0]');
    this.locInk = gl.getUniformLocation(program, 'u_ink');
  }

  resize(width: number, height: number): void {
    const { gl } = this;
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    if (gl.canvas.width !== w || gl.canvas.height !== h) {
      gl.canvas.width = w;
      gl.canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  render(uniforms: TerrainUniforms): void {
    const { gl, program } = this;
    gl.useProgram(program);

    const ink = uniforms.ink ?? TERRAIN_INK;
    if (this.locRes) gl.uniform2f(this.locRes, uniforms.width, uniforms.height);
    if (this.locTime) gl.uniform1f(this.locTime, uniforms.time);
    if (this.locDim) gl.uniform1f(this.locDim, uniforms.dimmed);
    if (this.locCam) gl.uniform2f(this.locCam, uniforms.cam[0], uniforms.cam[1]);
    if (this.locScale) gl.uniform1f(this.locScale, uniforms.scale);
    if (this.locNodeCount) gl.uniform1i(this.locNodeCount, uniforms.nodeCount);
    if (this.locNodes) {
      gl.uniform2fv(this.locNodes, uniforms.nodePositions.subarray(0, uniforms.nodeCount * 2));
    }
    if (this.locWeights) {
      gl.uniform1fv(this.locWeights, uniforms.nodeWeights.subarray(0, uniforms.nodeCount));
    }
    if (this.locInk) gl.uniform3f(this.locInk, ink[0], ink[1], ink[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy(): void {
    const { gl } = this;
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { MAX_TERRAIN_NODES };