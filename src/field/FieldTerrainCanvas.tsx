import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { packNodeUniforms } from './shader/packNodes';
import { prefersReducedMotion, WebglTerrainRenderer } from './shader/webglTerrain';
import type { TerrainCtx } from './terrainHeight';
import type { Transform } from './hooks/useFieldTransform';

type FieldTerrainCanvasProps = {
  vpRef: RefObject<HTMLDivElement | null>;
  terrainCtx: TerrainCtx;
  dimmed: boolean;
  transform: Transform;
};

function terrainStateKey(ctx: TerrainCtx, dimmed: boolean): string {
  return [
    ctx.mode,
    ctx.readId ?? '',
    [...ctx.matched].sort().join(','),
    Object.keys(ctx.neighborRels).sort().join(','),
    dimmed ? '1' : '0',
  ].join('|');
}

export function FieldTerrainCanvas({
  vpRef,
  terrainCtx,
  dimmed,
  transform,
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

  const dimmedRef = useRef(dimmed);
  dimmedRef.current = dimmed;
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const packedRef = useRef(packed);
  packedRef.current = packed;

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
    const tr = transformRef.current;
    renderer.render({
      width: w,
      height: h,
      time: t,
      dimmed: dimmedRef.current ? 1 : 0,
      cam: [tr.x, tr.y],
      scale: tr.z,
      nodeCount: packedRef.current.count,
      nodePositions: packedRef.current.positions,
      nodeWeights: packedRef.current.weights,
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

  useEffect(() => {
    draw(performance.now());
  }, [terrainKey, dimmed, packed, transform.x, transform.y, transform.z]);

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