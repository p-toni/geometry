import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { packNodeUniforms, type PackedNodes } from './shader/packNodes';
import { prefersReducedMotion, WebglTerrainRenderer } from './shader/webglTerrain';
import type { TerrainCtx } from './terrainHeight';
import type { Transform } from './hooks/useFieldTransform';

type FieldTerrainCanvasProps = {
  vpRef: RefObject<HTMLDivElement | null>;
  terrainCtx: TerrainCtx;
  dimmed: boolean;
  transform: Transform;
  transformRef?: RefObject<Transform>;
};

const WEIGHT_LERP = 0.26;

function terrainStateKey(ctx: TerrainCtx, dimmed: boolean): string {
  return [
    ctx.mode,
    ctx.readId ?? '',
    [...ctx.matched].sort().join(','),
    Object.keys(ctx.neighborRels).sort().join(','),
    dimmed ? '1' : '0',
  ].join('|');
}

function clonePacked(p: PackedNodes): PackedNodes {
  return {
    count: p.count,
    positions: new Float32Array(p.positions),
    weights: new Float32Array(p.weights),
  };
}

function lerpPacked(shown: PackedNodes, target: PackedNodes, t: number): PackedNodes {
  const next = clonePacked(shown);
  const n = Math.min(shown.count, target.count);
  next.count = n;
  for (let i = 0; i < n; i++) {
    next.weights[i] = shown.weights[i]! + (target.weights[i]! - shown.weights[i]!) * t;
    next.positions[i * 2] = target.positions[i * 2]!;
    next.positions[i * 2 + 1] = target.positions[i * 2 + 1]!;
  }
  return next;
}

export function FieldTerrainCanvas({
  vpRef,
  terrainCtx,
  dimmed,
  transform,
  transformRef,
}: FieldTerrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebglTerrainRenderer | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(performance.now());
  const sizeRef = useRef({ w: 0, h: 0 });

  const terrainKey = useMemo(
    () => terrainStateKey(terrainCtx, dimmed),
    [terrainCtx, dimmed],
  );
  const packed = useMemo(() => packNodeUniforms(terrainCtx), [terrainKey]);

  const packedTargetRef = useRef(packed);
  packedTargetRef.current = packed;
  const packedShownRef = useRef<PackedNodes | null>(null);

  const dimTargetRef = useRef(dimmed ? 1 : 0);
  const dimShownRef = useRef(dimmed ? 1 : 0);
  dimTargetRef.current = dimmed ? 1 : 0;

  const draw = (now: number) => {
    const renderer = rendererRef.current;
    const vp = vpRef.current;
    if (!renderer || !vp) return;

    const w = Math.max(1, vp.clientWidth);
    const h = Math.max(1, vp.clientHeight);
    if (sizeRef.current.w !== w || sizeRef.current.h !== h) {
      sizeRef.current = { w, h };
      renderer.resize(w, h);
    }

    const reduce = prefersReducedMotion();
    const t = reduce ? 0 : (now - startRef.current) * 0.001;
    const tr = transformRef?.current ?? transform;
    const target = dimTargetRef.current;
    if (reduce) {
      dimShownRef.current = target;
    } else {
      const delta = target - dimShownRef.current;
      if (Math.abs(delta) > 0.004) {
        dimShownRef.current += delta * 0.24;
      } else {
        dimShownRef.current = target;
      }
    }

    const packedTarget = packedTargetRef.current;
    if (!packedShownRef.current) {
      packedShownRef.current = clonePacked(packedTarget);
    } else if (reduce) {
      packedShownRef.current = clonePacked(packedTarget);
    } else {
      packedShownRef.current = lerpPacked(packedShownRef.current, packedTarget, WEIGHT_LERP);
    }

    renderer.render({
      width: w,
      height: h,
      time: t,
      dimmed: dimShownRef.current,
      cam: [tr.x, tr.y],
      scale: tr.z,
      nodeCount: packedShownRef.current.count,
      nodePositions: packedShownRef.current.positions,
      nodeWeights: packedShownRef.current.weights,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebglTerrainRenderer;
    try {
      renderer = new WebglTerrainRenderer(canvas);
    } catch {
      return;
    }
    rendererRef.current = renderer;

    const loop = (now: number) => {
      draw(now);
      if (!prefersReducedMotion()) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    loop(performance.now());

    const vp = vpRef.current;
    let ro: ResizeObserver | null = null;
    if (vp && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => draw(performance.now()));
      ro.observe(vp);
    }

    return () => {
      ro?.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [vpRef]);

  return (
    <canvas
      ref={canvasRef}
      className="field-terrain"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
