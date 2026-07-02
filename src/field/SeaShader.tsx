import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform float u_rippleSpeed;
uniform float u_moonGlow;
uniform vec2 u_mouse;
uniform float u_tilt;
uniform float u_waves;

#define WAVE_LAYERS 7

vec4 sea(vec2 p, float t) {
  float h = 0.0;
  vec2 dh = vec2(0.0);
  float freq = 1.0;
  float amp = 0.2 * u_waves;
  float decay = mix(0.55, 0.38, clamp(u_waves / 3.0, 0.0, 1.0));
  float angle = 0.0;
  for (int i = 0; i < WAVE_LAYERS; i++) {
    float c = cos(angle);
    float s = sin(angle);
    vec2 pp = vec2(c * p.x + s * p.y, -s * p.x + c * p.y);
    float fi = float(i);
    float spd = sqrt(freq) * 0.8;
    float phase = (pp.y + fi) * freq - t * spd;
    float sn = sin(phase);
    float cn = cos(phase);
    h += sn * amp;
    float dy = freq * amp * cn;
    dh += vec2(-s * dy, c * dy);
    angle += fi + 1.2;
    freq *= 1.3;
    amp *= decay;
  }
  vec3 n = normalize(vec3(-dh.x, 1.0, -dh.y));
  return vec4(h, n);
}

vec3 moonDir() {
  return normalize(vec3(0.15, 0.35, 1.0));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec3 skyColor(vec3 rd) {
  vec3 md = moonDir();
  vec3 skyDark = vec3(0.06, 0.03, 0.02);
  vec3 skyHoriz = vec3(0.09, 0.05, 0.04);
  vec3 sky = mix(skyHoriz, skyDark, max(rd.y, 0.0));
  vec3 moonCol = vec3(0.98, 0.92, 0.85);
  float moonDot = max(dot(rd, md), 0.0);
  float moonAngle = acos(clamp(moonDot, 0.0, 1.0));
  float moonRadius = 0.04;
  float disc = smoothstep(moonRadius, moonRadius * 0.7, moonAngle);
  if (disc > 0.0) {
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, md));
    vec3 mup = cross(md, right);
    vec2 muv = vec2(dot(rd - md, right), dot(rd - md, mup)) * 25.0;
    float crater = hash(floor(muv * 2.0)) * 0.25;
    crater += hash(floor(muv * 4.0)) * 0.15;
    float darkening = 1.0 - crater * smoothstep(moonRadius * 0.9, moonRadius * 0.4, moonAngle);
    float limb = smoothstep(0.0, moonRadius, moonAngle);
    darkening *= mix(1.0, 0.7, limb * limb);
    sky += moonCol * disc * 0.85 * darkening;
  }
  sky += moonCol * 0.25 * pow(moonDot, 40.0) * u_moonGlow;
  sky += moonCol * 1.2 * pow(moonDot, 400.0) * u_moonGlow;
  return sky;
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 uv = -1.0 + 2.0 * gl_FragCoord.xy / u_res;
  uv.x *= aspect;
  float t = u_time * u_rippleSpeed;
  float tiltRad = u_tilt * 0.7;
  vec3 ro = vec3(0.0, 8.0, 0.0);
  vec3 ww = normalize(vec3(0.0, -sin(tiltRad), cos(tiltRad)));
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = normalize(cross(ww, uu));
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 2.5 * ww);
  vec3 md = moonDir();
  vec3 moonCol = vec3(0.98, 0.92, 0.85);
  vec3 sky = skyColor(rd);
  vec3 col = sky;
  float dsea = -ro.y / rd.y;

  if (dsea > 0.0) {
    vec3 wp = ro + dsea * rd;
    vec4 s = sea(wp.xz, t);
    float h = s.x;
    vec3 nor = s.yzw;
    if (u_mouse.x > 0.0) {
      vec2 mUV = -1.0 + 2.0 * u_mouse / u_res;
      mUV.x *= aspect;
      vec3 mrd = normalize(mUV.x * uu + mUV.y * vv + 2.5 * ww);
      float mdsea = -ro.y / mrd.y;
      if (mdsea > 0.0) {
        vec3 mwp = ro + mdsea * mrd;
        vec2 mdelta = wp.xz - mwp.xz;
        float md2 = length(mdelta);
        float mphase = md2 * 4.0 - t * 5.0;
        float mamp = exp(-md2 * 0.15) * 0.4 * u_waves;
        h += sin(mphase) * mamp;
        float mcos = cos(mphase) * mamp * 4.0;
        vec2 mgrad = md2 > 0.01 ? (mdelta / md2) * mcos : vec2(0.0);
        nor = normalize(nor + vec3(-mgrad.x, 0.0, -mgrad.y) * 2.0);
      }
    }
    nor = mix(nor, vec3(0.0, 1.0, 0.0), smoothstep(0.0, 300.0, dsea));
    float fre = pow(clamp(1.0 - dot(-nor, rd), 0.0, 1.0), 3.0);
    float dif = mix(0.25, 1.0, max(dot(nor, md), 0.0));
    vec3 refl = skyColor(reflect(rd, nor));
    vec3 seaCol1 = vec3(0.05, 0.02, 0.01);
    vec3 seaCol2 = vec3(0.10, 0.06, 0.04);
    vec3 refr = seaCol1 + dif * moonCol * seaCol2 * 0.15 * u_moonGlow;
    col = mix(refr, 0.9 * refl, fre);
    float atten = max(1.0 - dsea * dsea * 0.0005, 0.0);
    col += seaCol2 * (wp.y - h) * 1.5 * atten;
    col = mix(col, sky, 1.0 - exp(-0.008 * dsea));
  }

  col = pow(max(col, vec3(0.0)), vec3(0.85));
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create sea shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown sea shader error';
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create sea shader program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'unknown sea shader link error';
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

export function SeaShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const program = createProgram(gl);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uRippleSpeed = gl.getUniformLocation(program, 'u_rippleSpeed');
    const uMoonGlow = gl.getUniformLocation(program, 'u_moonGlow');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTilt = gl.getUniformLocation(program, 'u_tilt');
    const uWaves = gl.getUniformLocation(program, 'u_waves');

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let cancelled = false;
    let mouseX = -1;
    let mouseY = -1;
    let dpr = 1;
    const start = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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
      mouseX = (event.clientX - rect.left) * dpr;
      mouseY = (rect.height - (event.clientY - rect.top)) * dpr;
    };
    const onPointerLeave = () => {
      mouseX = -1;
      mouseY = -1;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    resize();

    const tick = () => {
      if (cancelled) return;
      gl.uniform1f(uTime, prefersReduced ? 0 : (performance.now() - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uRippleSpeed, 0.5);
      gl.uniform1f(uMoonGlow, 1.0);
      gl.uniform1f(uTilt, 0.15);
      gl.uniform1f(uWaves, 1.0);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!prefersReduced) raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="sea-shader" aria-label="Moonlit Ripple shader" />;
}
