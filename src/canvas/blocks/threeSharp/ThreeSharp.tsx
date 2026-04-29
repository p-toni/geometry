import { useEffect, useMemo, useRef, useState } from 'react';
import type { BlockRendererProps } from '../types';
import { loadPointSet, type PointSet } from './pointSet';
import {
  colorGradeFragmentShader,
  colorGradeVertexShader,
  gpgpuParticlesShader,
  particlesFragmentShader,
  particlesVertexShader,
} from './shaders';
import { resolvePreset } from './presets';

interface ThreeSharpConfig {
  count?: number;
  size?: number;
  influence?: number;
  flowInfluenceIdle?: number;
  flowInfluenceFast?: number;
  flowSmoothing?: number;
  strength?: number;
  frequency?: number;
  decayRate?: number;
  timeScale?: number;
  returnStrength?: number;
  maxDrift?: number;
  boundsRadius?: number;
  cameraDistance?: number;
  cameraOrbitX?: number;
  cameraOrbitY?: number;
  cameraBreath?: number;
  roll?: number;
  cameraTarget?: [number, number, number];
  brightness?: number;
  lift?: number;
  contrast?: number;
  saturation?: number;
  tintStrength?: number;
  tintColor?: [number, number, number];
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  pointSizeHeight?: number;
  plyUrl?: string | null;
  fitRadius?: number;
}

function parseConfig(content: string): ThreeSharpConfig {
  try {
    return (JSON.parse(content) as ThreeSharpConfig) ?? {};
  } catch {
    return {};
  }
}

export function ThreeSharp({ item, sliderValue, selectorValue }: BlockRendererProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef(sliderValue);
  const selectorRef = useRef(selectorValue);
  const [renderState, setRenderState] = useState<'pending' | 'loading' | 'ready' | 'error'>(
    'pending',
  );
  const cfg = useMemo(() => parseConfig(item.content), [item.content]);
  const hasPointSet = typeof cfg.plyUrl === 'string' && cfg.plyUrl.trim() !== '';

  useEffect(() => {
    sliderRef.current = sliderValue;
  }, [sliderValue]);
  useEffect(() => {
    selectorRef.current = selectorValue;
  }, [selectorValue]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!hasPointSet) return undefined;
    if (!mount) return undefined;

    let renderer: import('three').WebGLRenderer | null = null;
    let scene: import('three').Scene | null = null;
    let camera: import('three').PerspectiveCamera | null = null;
    let composer:
      | import('three/examples/jsm/postprocessing/EffectComposer.js').EffectComposer
      | null = null;
    let points:
      | import('three').Points<import('three').BufferGeometry, import('three').ShaderMaterial>
      | null = null;
    let gpgpu:
      | import('three/examples/jsm/misc/GPUComputationRenderer.js').GPUComputationRenderer
      | null = null;
    let particlesVariable:
      | import('three/examples/jsm/misc/GPUComputationRenderer.js').Variable
      | null = null;
    let material: import('three').ShaderMaterial | null = null;
    let animationFrame = 0;
    let observer: ResizeObserver | null = null;
    let disposed = false;
    let elapsed = 0;
    let previous = performance.now();
    let pointerX = 0;
    let pointerY = 0;
    let cameraX = 0;
    let cameraY = 0;
    const init = async () => {
      try {
        await Promise.resolve();
        if (disposed) return;
        setRenderState('loading');
        const THREE = await import('three');
        const { GPUComputationRenderer } =
          await import('three/examples/jsm/misc/GPUComputationRenderer.js');
        const { EffectComposer } =
          await import('three/examples/jsm/postprocessing/EffectComposer.js');
        const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
        const { UnrealBloomPass } =
          await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
        const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');
        const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x020202, 1);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        mount.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 40, 45);

        const cameraTargetInput = Array.isArray(cfg.cameraTarget)
          ? cfg.cameraTarget
          : [0, 0, 0];
        const cameraTarget = new THREE.Vector3(
          clampNumber(cameraTargetInput[0] ?? 0, -4, 4),
          clampNumber(cameraTargetInput[1] ?? 0, -4, 4),
          clampNumber(cameraTargetInput[2] ?? 0, -4, 4),
        );
        const cameraDistance = clampNumber(cfg.cameraDistance ?? 2.35, 1.2, 8);
        cameraX = cameraTarget.x;
        cameraY = cameraTarget.y;
        camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
        camera.position.set(cameraX, cameraY, cameraTarget.z + cameraDistance);
        camera.lookAt(cameraTarget);

        const requestedCount = clampNumber(Math.round(cfg.count ?? 12288), 2048, 2_000_000);
        const fitRadius =
          typeof cfg.fitRadius === 'number' && Number.isFinite(cfg.fitRadius)
            ? Math.max(0.4, Math.min(4, cfg.fitRadius))
            : undefined;
        const pointSet: PointSet = await loadPointSet(
          cfg.plyUrl as string,
          requestedCount,
          fitRadius,
        );
        const count = pointSet.count;
        const baseSize = Math.max(0.02, Math.min(0.2, cfg.size ?? 0.07));
        const textureSize = Math.ceil(Math.sqrt(count));
        const total = textureSize * textureSize;

        gpgpu = new GPUComputationRenderer(textureSize, textureSize, renderer);
        const baseTexture = gpgpu.createTexture();
        const particlesTexture = gpgpu.createTexture();
        const baseData = baseTexture.image.data as Float32Array;
        const particlesData = particlesTexture.image.data as Float32Array;
        const colors = pointSet.colors;
        const particlesUv = new Float32Array(count * 2);
        const sizes = new Float32Array(count);
        const positions = pointSet.positions;

        for (let i = 0; i < total; i += 1) {
          const i4 = i * 4;
          if (i < count) {
            const i3 = i * 3;
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            const life = Math.random();

            baseData[i4] = x;
            baseData[i4 + 1] = y;
            baseData[i4 + 2] = z;
            baseData[i4 + 3] = life;
            particlesData[i4] = x;
            particlesData[i4 + 1] = y;
            particlesData[i4 + 2] = z;
            particlesData[i4 + 3] = life;

            const yIndex = Math.floor(i / textureSize);
            const xIndex = i % textureSize;
            particlesUv[i * 2] = (xIndex + 0.5) / textureSize;
            particlesUv[i * 2 + 1] = (yIndex + 0.5) / textureSize;
            sizes[i] = 0.45 + Math.random() * 0.55;
          } else {
            baseData[i4] = 0;
            baseData[i4 + 1] = 0;
            baseData[i4 + 2] = 0;
            baseData[i4 + 3] = 1;
            particlesData[i4] = 0;
            particlesData[i4 + 1] = 0;
            particlesData[i4 + 2] = 0;
            particlesData[i4 + 3] = 1;
          }
        }

        const initialPresetValue = selectorRef.current;
        const initialPreset = resolvePreset(initialPresetValue);
        const initialPresetControlled = hasPresetControl(initialPresetValue);
        const initialInfluence = clampNumber(
          initialPresetControlled
            ? initialPreset.influence
            : (cfg.flowInfluenceIdle ?? cfg.influence ?? initialPreset.influence),
          0,
          1,
        );
        particlesVariable = gpgpu.addVariable(
          'uParticles',
          gpgpuParticlesShader,
          particlesTexture,
        );
        gpgpu.setVariableDependencies(particlesVariable, [particlesVariable]);
        particlesVariable.material.uniforms.uTime = { value: 0 };
        particlesVariable.material.uniforms.uDeltaTime = { value: 0 };
        particlesVariable.material.uniforms.uBase = { value: baseTexture };
        particlesVariable.material.uniforms.uFlowFieldInfluence = {
          value: initialInfluence,
        };
        particlesVariable.material.uniforms.uFlowFieldStrength = {
          value: initialPresetControlled
            ? initialPreset.strength
            : (cfg.strength ?? initialPreset.strength),
        };
        particlesVariable.material.uniforms.uFlowFieldFrequency = {
          value: initialPresetControlled
            ? initialPreset.frequency
            : (cfg.frequency ?? initialPreset.frequency),
        };
        particlesVariable.material.uniforms.uDecayRate = {
          value: clampNumber(cfg.decayRate ?? 0.9, 0.05, 3),
        };
        particlesVariable.material.uniforms.uTimeScale = {
          value: clampNumber(cfg.timeScale ?? 0.2, 0.01, 2),
        };
        particlesVariable.material.uniforms.uReturnStrength = {
          value: clampNumber(cfg.returnStrength ?? 0.65, 0, 8),
        };
        particlesVariable.material.uniforms.uMaxDrift = {
          value: clampNumber(cfg.maxDrift ?? 0.32, 0.02, 4),
        };
        particlesVariable.material.uniforms.uBoundsRadius = {
          value: clampNumber(cfg.boundsRadius ?? (fitRadius ?? 1.6) * 1.08, 0.4, 8),
        };
        const gpuError = gpgpu.init();
        if (gpuError) throw new Error(gpuError);

        const geometry = new THREE.BufferGeometry();
        geometry.setDrawRange(0, count);
        geometry.setAttribute('aParticlesUv', new THREE.BufferAttribute(particlesUv, 2));
        geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

        material = new THREE.ShaderMaterial({
          vertexShader: particlesVertexShader,
          fragmentShader: particlesFragmentShader,
          uniforms: {
            ...THREE.UniformsLib.fog,
            uSize: { value: baseSize },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uParticlesTexture: {
              value: gpgpu.getCurrentRenderTarget(particlesVariable).texture,
            },
          },
          transparent: true,
          depthWrite: true,
          side: THREE.DoubleSide,
          fog: true,
        });

        points = new THREE.Points(geometry, material);
        points.frustumCulled = false;
        points.rotation.x = Math.PI;
        scene.add(points);

        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(1, 1),
          clampNumber(cfg.bloomStrength ?? 0.4, 0, 2),
          clampNumber(cfg.bloomRadius ?? 0.1, 0, 2),
          clampNumber(cfg.bloomThreshold ?? 0.5, 0, 1),
        );
        composer.addPass(bloomPass);
        const tintColor = Array.isArray(cfg.tintColor) ? cfg.tintColor : [1.06, 1.0, 0.86];
        const colorPass = new ShaderPass({
          uniforms: {
            tDiffuse: { value: null },
            uBrightness: { value: clampNumber(cfg.brightness ?? 0.0, -1, 1) },
            uLift: { value: clampNumber(cfg.lift ?? 0.035, 0, 0.35) },
            uContrast: { value: clampNumber(cfg.contrast ?? 0.65, 0.1, 2) },
            uSaturation: { value: clampNumber(cfg.saturation ?? 1.2, 0, 3) },
            uTintStrength: { value: clampNumber(cfg.tintStrength ?? 0.5, 0, 1) },
            uTintColor: {
              value: new THREE.Vector3(
                clampNumber(tintColor[0] ?? 1.06, 0, 2),
                clampNumber(tintColor[1] ?? 1.0, 0, 2),
                clampNumber(tintColor[2] ?? 0.86, 0, 2),
              ),
            },
          },
          vertexShader: colorGradeVertexShader,
          fragmentShader: colorGradeFragmentShader,
        });
        composer.addPass(colorPass);
        composer.addPass(new OutputPass());

        const onPointerMove = (event: PointerEvent) => {
          const rect = mount.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointerY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        };
        const onPointerLeave = () => {
          pointerX = 0;
          pointerY = 0;
        };
        mount.addEventListener('pointermove', onPointerMove);
        mount.addEventListener('pointerleave', onPointerLeave);

        const resize = () => {
          if (!renderer || !camera || !material || !composer) return;
          const width = Math.max(1, mount.clientWidth);
          const height = Math.max(1, mount.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          composer.setSize(width, height);
          material.uniforms.uResolution.value.set(
            width * Math.min(window.devicePixelRatio || 1, 2),
            Math.max(
              height * Math.min(window.devicePixelRatio || 1, 2),
              clampNumber(cfg.pointSizeHeight ?? 900, 240, 2400),
            ),
          );
        };
        observer = new ResizeObserver(resize);
        observer.observe(mount);
        resize();

        const tick = () => {
          if (
            disposed ||
            !renderer ||
            !scene ||
            !camera ||
            !points ||
            !composer ||
            !gpgpu ||
            !particlesVariable ||
            !material
          ) {
            return;
          }
          const now = performance.now();
          const delta = Math.min(0.05, (now - previous) / 1000);
          previous = now;

          const presetValue = selectorRef.current;
          const preset = resolvePreset(presetValue);
          const presetControlled = hasPresetControl(presetValue);
          const drive = clampNumber(sliderRef.current, 0, 1);
          elapsed += delta;

          const uniforms = particlesVariable.material.uniforms;
          const idleInfluence = clampNumber(
            presetControlled
              ? preset.influence
              : (cfg.flowInfluenceIdle ?? cfg.influence ?? preset.influence),
            0,
            1,
          );
          const fastInfluence = clampNumber(cfg.flowInfluenceFast ?? 1, 0, 1);
          const targetInfluence = idleInfluence + (fastInfluence - idleInfluence) * drive;
          const targetStrength = presetControlled
            ? preset.strength
            : (cfg.strength ?? preset.strength);
          const targetFrequency = presetControlled
            ? preset.frequency
            : (cfg.frequency ?? preset.frequency);
          uniforms.uTime.value = elapsed;
          uniforms.uDeltaTime.value = delta;
          uniforms.uDecayRate.value = clampNumber(cfg.decayRate ?? 0.9, 0.05, 3);
          uniforms.uTimeScale.value = clampNumber(
            (cfg.timeScale ?? 0.2) * (presetControlled ? preset.speed : 1),
            0.01,
            2,
          );
          uniforms.uReturnStrength.value = clampNumber(cfg.returnStrength ?? 0.65, 0, 8);
          uniforms.uMaxDrift.value = clampNumber(cfg.maxDrift ?? 0.32, 0.02, 4);
          uniforms.uBoundsRadius.value = clampNumber(
            cfg.boundsRadius ?? (fitRadius ?? 1.6) * 1.08,
            0.4,
            8,
          );
          // Smooth ramp instead of jumpy preset switches.
          const smoothing = clampNumber(cfg.flowSmoothing ?? 1.9, 0.2, 8);
          uniforms.uFlowFieldInfluence.value = damp(
            uniforms.uFlowFieldInfluence.value,
            targetInfluence,
            smoothing,
            delta,
          );
          uniforms.uFlowFieldStrength.value = damp(
            uniforms.uFlowFieldStrength.value,
            targetStrength,
            smoothing,
            delta,
          );
          uniforms.uFlowFieldFrequency.value = damp(
            uniforms.uFlowFieldFrequency.value,
            targetFrequency,
            smoothing,
            delta,
          );

          gpgpu.compute();
          material.uniforms.uParticlesTexture.value =
            gpgpu.getCurrentRenderTarget(particlesVariable).texture;

          const orbitX = clampNumber(cfg.cameraOrbitX ?? 0.18, 0, 4);
          const orbitY = clampNumber(cfg.cameraOrbitY ?? 0.08, 0, 4);
          const breath = clampNumber(cfg.cameraBreath ?? 0.05, 0, 1);
          const desiredX = cameraTarget.x + pointerX * orbitX;
          const desiredY = cameraTarget.y + pointerY * orbitY;
          cameraX = THREE.MathUtils.damp(cameraX, desiredX, 2.0, delta);
          cameraY = THREE.MathUtils.damp(cameraY, desiredY, 2.0, delta);
          camera.position.set(
            cameraX,
            cameraY,
            cameraTarget.z + cameraDistance + Math.sin(elapsed * 0.5) * breath,
          );
          camera.lookAt(cameraTarget);
          camera.rotation.z = Math.sin(elapsed * 0.5) * clampNumber(cfg.roll ?? 0.01, 0, 0.2);
          composer.render();
          animationFrame = requestAnimationFrame(tick);
        };
        setRenderState('ready');
        tick();

        const localMount = mount as HTMLDivElement & { __threePointerCleanup?: () => void };
        localMount.__threePointerCleanup = () => {
          mount.removeEventListener('pointermove', onPointerMove);
          mount.removeEventListener('pointerleave', onPointerLeave);
        };
      } catch (error) {
        console.warn('threeSharp: renderer init failed.', error);
        if (!disposed) setRenderState('error');
      }
    };

    void init();

    return () => {
      disposed = true;
      const localMount = mount as HTMLDivElement & { __threePointerCleanup?: () => void };
      localMount.__threePointerCleanup?.();
      localMount.__threePointerCleanup = undefined;
      observer?.disconnect();
      cancelAnimationFrame(animationFrame);
      if (points) {
        points.geometry.dispose();
        points.material.dispose();
      }
      material?.dispose();
      composer?.dispose();
      gpgpu?.dispose();
      renderer?.dispose();
      if (renderer?.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [cfg, hasPointSet]);

  if (!hasPointSet) return <PendingBadge label={item.label} />;
  return (
    <div className="relative h-full w-full bg-black" aria-label={item.label}>
      <div ref={mountRef} className="h-full w-full" />
      {renderState === 'pending' || renderState === 'loading' ? (
        <PendingBadge label="loading splat" overlay />
      ) : null}
      {renderState === 'error' ? <PendingBadge label="splat load failed" overlay /> : null}
    </div>
  );
}

function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function hasPresetControl(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function PendingBadge({ label, overlay = false }: { label: string; overlay?: boolean }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-black font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 ${
        overlay ? 'pointer-events-none absolute inset-0 z-10' : ''
      }`}
      aria-label={label}
    >
      {label}
    </div>
  );
}
