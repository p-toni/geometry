import { useEffect, useRef } from 'react';

const SPLT_MAGIC = 0x544c5053;
const DEFAULT_URL = '/sharp/74dfc8811bee766e.splt';

const VERT = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_pointSize;
varying vec3 v_color;
varying float v_depth;

mat3 rotX(float a) {
  float s = sin(a), c = cos(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotY(float a) {
  float s = sin(a), c = cos(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

void main() {
  float orbit = u_time * 0.08 + u_pointer.x * 0.28;
  vec3 p = a_position;
  p = rotX(3.14159265 + 0.16 + u_pointer.y * 0.12) * p;
  p = rotY(orbit) * p;
  p.z -= 3.55;

  float f = 2.2 / max(0.1, -p.z);
  vec2 xy = p.xy * f;
  xy.x *= u_resolution.y / u_resolution.x;
  gl_Position = vec4(xy, 0.0, 1.0);

  float nearFade = smoothstep(-7.0, -3.0, p.z);
  gl_PointSize = u_pointSize * nearFade * (1.0 / max(0.18, -p.z)) * u_resolution.y;
  v_color = a_color;
  v_depth = nearFade;
}
`;

const FRAG = `
precision mediump float;
varying vec3 v_color;
varying float v_depth;

void main() {
  vec2 d = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(d, d);
  if (r2 > 1.0) discard;
  float bead = pow(1.0 - r2, 1.7);
  vec3 warm = vec3(1.08, 1.00, 0.86);
  vec3 col = mix(v_color * 0.72, v_color * warm + vec3(0.04), bead);
  col = pow(max(col, vec3(0.0)), vec3(0.82));
  float alpha = smoothstep(1.0, 0.05, r2) * v_depth;
  gl_FragColor = vec4(col, alpha);
}
`;

type DecodedSplt = {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create point-cloud shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown point-cloud shader error';
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create point-cloud program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown point-cloud link error';
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

function centerAndScale(positions: Float32Array, colors: Float32Array, targetRadius: number) {
  const count = Math.floor(positions.length / 3);
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const j = i * 3;
    const x = positions[j]!;
    const y = positions[j + 1]!;
    const z = positions[j + 2]!;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  let wx = 0;
  let wy = 0;
  let wz = 0;
  let wt = 0;
  for (let i = 0; i < count; i += 1) {
    const j = i * 3;
    const lum = 0.2126 * colors[j]! + 0.7152 * colors[j + 1]! + 0.0722 * colors[j + 2]!;
    const w = Math.max(0, lum - 0.02) ** 2;
    wx += positions[j]! * w;
    wy += positions[j + 1]! * w;
    wz += positions[j + 2]! * w;
    wt += w;
  }

  const cx = wt > 1e-5 ? wx / wt : (minX + maxX) * 0.5;
  const cy = wt > 1e-5 ? wy / wt : (minY + maxY) * 0.5;
  const cz = wt > 1e-5 ? wz / wt : (minZ + maxZ) * 0.5;
  const distances = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const j = i * 3;
    positions[j] -= cx;
    positions[j + 1] -= cy;
    positions[j + 2] -= cz;
    distances[i] = Math.hypot(positions[j]!, positions[j + 1]!, positions[j + 2]!);
  }
  distances.sort();
  const fitDist = distances[Math.floor(count * 0.965)] ?? distances[count - 1] ?? 1;
  const scale = targetRadius / Math.max(fitDist, 1e-5);
  for (let i = 0; i < positions.length; i += 1) positions[i] *= scale;
}

function decodeSplt(buffer: ArrayBuffer, preferredCount: number): DecodedSplt {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== SPLT_MAGIC) throw new Error('Not an SPLT file.');
  const version = view.getUint8(4);
  if (version !== 1 && version !== 2) throw new Error(`Unsupported SPLT version ${version}.`);
  const total = view.getUint32(8, true);
  const scale = view.getFloat32(12, true);
  const headerBytes = version === 2 ? 32 : 16;
  const cx = version === 2 ? view.getFloat32(16, true) : 0;
  const cy = version === 2 ? view.getFloat32(20, true) : 0;
  const cz = version === 2 ? view.getFloat32(24, true) : 0;
  const count = Math.max(1, Math.min(total, preferredCount));
  const step = Math.max(1, Math.floor(total / count));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const inv = scale / 32767;

  for (let i = 0; i < count; i += 1) {
    const src = Math.min(total - 1, i * step);
    const offset = headerBytes + src * 9;
    const j = i * 3;
    positions[j] = cx + view.getInt16(offset, true) * inv;
    positions[j + 1] = cy + view.getInt16(offset + 2, true) * inv;
    positions[j + 2] = cz + view.getInt16(offset + 4, true) * inv;
    colors[j] = view.getUint8(offset + 6) / 255;
    colors[j + 1] = view.getUint8(offset + 7) / 255;
    colors[j + 2] = view.getUint8(offset + 8) / 255;
  }
  centerAndScale(positions, colors, 3.35);
  return { positions, colors, count };
}

export function SharpPointCloud({ url = DEFAULT_URL }: { url?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const program = createProgram(gl);
    const posBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aColor = gl.getAttribLocation(program, 'a_color');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    const uPointSize = gl.getUniformLocation(program, 'u_pointSize');

    let raf = 0;
    let cancelled = false;
    let pointCount = 0;
    let pointerX = 0;
    let pointerY = 0;
    const start = performance.now();
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointerY = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
    };
    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    resize();

    const renderFrame = (time: number) => {
      resize();
      gl.useProgram(program);
      gl.clearColor(0.01, 0.009, 0.007, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.disable(gl.DEPTH_TEST);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, prefersReduced ? 0 : time);
      gl.uniform2f(uPointer, pointerX, pointerY);
      gl.uniform1f(uPointSize, 0.023);

      if (pointCount > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, pointCount);
      }
    };

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`sharp fetch failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((buffer) => decodeSplt(buffer, 280_000))
      .then((cloud) => {
        if (cancelled) return;
        pointCount = cloud.count;
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cloud.positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cloud.colors, gl.STATIC_DRAW);
        if (prefersReduced) renderFrame(0);
      })
      .catch(() => {
        pointCount = 0;
      });

    const tick = () => {
      if (cancelled) return;
      renderFrame((performance.now() - start) / 1000);
      if (!prefersReduced) raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      gl.deleteBuffer(posBuffer);
      gl.deleteBuffer(colorBuffer);
      gl.deleteProgram(program);
    };
  }, [url]);

  return <canvas ref={canvasRef} className="sharp-point-cloud" aria-label="SPLT point cloud" />;
}
