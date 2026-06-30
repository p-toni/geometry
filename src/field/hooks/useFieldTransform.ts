import { useCallback, useMemo, useRef, useState } from 'react';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../pool';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const NAV_OPEN_MS = 240;
export const NAV_HOP_MS = 180;
const FLY_MS = 220;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type Transform = {
  x: number;
  y: number;
  z: number;
};

export function useFieldTransform(initial?: Partial<Transform>) {
  const vpRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const miniVpRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);
  const transformRef = useRef<Transform>({
    x: initial?.x ?? 0,
    y: initial?.y ?? 0,
    z: initial?.z ?? 1,
  });

  const [transform, setTransform] = useState<Transform>(transformRef.current);
  const [ready, setReady] = useState(false);

  const applyDom = useCallback((t: Transform, animate: boolean, ms = FLY_MS) => {
    transformRef.current = t;
    const world = worldRef.current;
    const vp = vpRef.current;
    if (!world || !vp) return;
    const reduce = prefersReducedMotion();
    world.style.transition =
      animate && !reduce ? `transform ${ms}ms var(--ease-out-strong)` : 'none';
    world.style.transform = `translate(${t.x}px,${t.y}px) scale(${t.z})`;
    if (readoutRef.current) {
      const el = readoutRef.current;
      const next = `z ${Math.round(t.z * 100)}%`;
      if (el.textContent !== next) {
        el.classList.add('is-updating');
        el.textContent = next;
        window.setTimeout(() => el.classList.remove('is-updating'), 120);
      }
    }
    const miniVp = miniVpRef.current;
    if (miniVp) {
      const vr = vp.getBoundingClientRect();
      const L = clamp(-t.x / t.z / FIELD_WIDTH, 0, 1);
      const T = clamp(-t.y / t.z / FIELD_HEIGHT, 0, 1);
      const W = clamp(vr.width / t.z / FIELD_WIDTH, 0.04, 1 - L);
      const H = clamp(vr.height / t.z / FIELD_HEIGHT, 0.04, 1 - T);
      miniVp.style.transition =
        animate && !reduce ? `transform ${ms}ms var(--ease-out-strong)` : 'none';
      miniVp.style.transform = `translate(${L * 100}%, ${T * 100}%) scale(${W}, ${H})`;
    }
  }, []);

  const setT = useCallback(
    (next: Transform, animate = false, ms?: number, commit = true) => {
      if (commit) setTransform(next);
      applyDom(next, animate, ms ?? FLY_MS);
    },
    [applyDom],
  );

  const initField = useCallback(
    (animate = false) => {
      const vp = vpRef.current;
      if (!vp) return;
      const r = vp.getBoundingClientRect();
      const z = clamp(Math.min(r.width / FIELD_WIDTH, r.height / FIELD_HEIGHT) * 0.94, 0.5, 1.5);
      const x = (r.width - FIELD_WIDTH * z) / 2;
      const y = (r.height - FIELD_HEIGHT * z) / 2;
      setReady(true);
      setT({ x, y, z }, animate);
    },
    [setT],
  );

  const zoomAt = useCallback(
    (factor: number, px: number, py: number, animate = false) => {
      const prev = transformRef.current;
      const nz = clamp(prev.z * factor, 0.3, 2.6);
      const wx = (px - prev.x) / prev.z;
      const wy = (py - prev.y) / prev.z;
      setT({ x: px - wx * nz, y: py - wy * nz, z: nz }, animate);
    },
    [setT],
  );

  const transformForPoint = useCallback((pos: readonly [number, number]): Transform => {
    const vp = vpRef.current;
    const prev = transformRef.current;
    if (!vp) return prev;
    const r = vp.getBoundingClientRect();
    const [px, py] = pos;
    const z = clamp(Math.max(prev.z, 1), 0.8, 2.6);
    return {
      x: r.width * 0.42 - px * z,
      y: r.height * 0.46 - py * z,
      z,
    };
  }, []);

  const flyTo = useCallback(
    (pos: readonly [number, number], animate = true, ms?: number) => {
      setT(transformForPoint(pos), animate, ms);
    },
    [setT, transformForPoint],
  );

  const frameIds = useCallback(
    (ids: string[], positions: Record<string, readonly [number, number]>, animate = true) => {
      const vp = vpRef.current;
      if (!vp || !ids.length) return;
      const r = vp.getBoundingClientRect();
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const id of ids) {
        const p = positions[id];
        if (!p) continue;
        minX = Math.min(minX, p[0]);
        minY = Math.min(minY, p[1]);
        maxX = Math.max(maxX, p[0]);
        maxY = Math.max(maxY, p[1]);
      }
      const w = Math.max(maxX - minX, 200) + 320;
      const h = Math.max(maxY - minY, 200) + 260;
      const z = clamp(Math.min(r.width / w, r.height / h), 0.4, 1.6);
      setT(
        {
          x: r.width / 2 - ((minX + maxX) / 2) * z,
          y: r.height / 2 - ((minY + maxY) / 2) * z,
          z,
        },
        animate,
      );
    },
    [setT],
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    if (worldRef.current) worldRef.current.style.transition = 'none';
    if (vpRef.current) vpRef.current.style.cursor = 'grabbing';
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
      dragRef.current = { x: e.clientX, y: e.clientY };
      const prev = transformRef.current;
      setT({ x: prev.x + dx, y: prev.y + dy, z: prev.z }, false, undefined, false);
    },
    [setT],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setTransform(transformRef.current);
    if (vpRef.current) vpRef.current.style.cursor = 'grab';
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const r = vpRef.current?.getBoundingClientRect();
      if (!r) return;
      zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - r.left, e.clientY - r.top, false);
    },
    [zoomAt],
  );

  const onMiniClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const vp = vpRef.current;
      const mini = e.currentTarget;
      if (!vp) return;
      const r = mini.getBoundingClientRect();
      const vr = vp.getBoundingClientRect();
      const wx = clamp((e.clientX - r.left) / r.width, 0, 1) * FIELD_WIDTH;
      const wy = clamp((e.clientY - r.top) / r.height, 0, 1) * FIELD_HEIGHT;
      const prev = transformRef.current;
      setT(
        {
          x: vr.width / 2 - wx * prev.z,
          y: vr.height / 2 - wy * prev.z,
          z: prev.z,
        },
        true,
      );
    },
    [setT],
  );

  const wasDragged = useCallback(() => movedRef.current, []);

  const fitView = useCallback(() => initField(true), [initField]);

  const zoomIn = useCallback(() => {
    const r = vpRef.current?.getBoundingClientRect();
    if (r) zoomAt(1.35, r.width / 2, r.height / 2, true);
  }, [zoomAt]);

  const zoomOut = useCallback(() => {
    const r = vpRef.current?.getBoundingClientRect();
    if (r) zoomAt(0.74, r.width / 2, r.height / 2, true);
  }, [zoomAt]);

  return useMemo(
    () => ({
      vpRef,
      worldRef,
      miniVpRef,
      readoutRef,
      transformRef,
      transform,
      ready,
      initField,
      fitView,
      zoomIn,
      zoomOut,
      flyTo,
      transformForPoint,
      frameIds,
      setT,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onWheel,
      onMiniClick,
      wasDragged,
    }),
    [
      transform,
      ready,
      initField,
      fitView,
      zoomIn,
      zoomOut,
      flyTo,
      transformForPoint,
      frameIds,
      setT,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onWheel,
      onMiniClick,
      wasDragged,
    ],
  );
}
