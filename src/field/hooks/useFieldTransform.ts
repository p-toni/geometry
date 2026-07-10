import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FIELD_HEIGHT, FIELD_WIDTH } from '../../pool';
import {
  inertiaSettled,
  inertiaStep,
  prefersReducedMotion,
  pushSample,
  springSettled,
  springStep,
  SPRING,
  velocityFromSamples,
  type PointerSample,
} from '../../lib/spring';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Hop UI timing (CSS hop class); fly uses spring response. */
export const NAV_OPEN_MS = Math.round(SPRING.move.response * 1000);
export const NAV_HOP_MS = Math.round(SPRING.hop.response * 1000);

export type Transform = {
  x: number;
  y: number;
  z: number;
};

type AnimMode = 'spring' | 'inertia';

type AnimState = {
  mode: AnimMode;
  raf: number;
  lastT: number;
  vx: number;
  vy: number;
  vz: number;
  tx: number;
  ty: number;
  tz: number;
  response: number;
  damping: number;
};

function responseFromMs(ms?: number, hop = false): number {
  if (ms != null && ms > 0) return Math.max(0.12, ms / 1000);
  return hop ? SPRING.hop.response : SPRING.move.response;
}

export function useFieldTransform(initial?: Partial<Transform>) {
  const vpRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const miniVpRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; pointerId: number } | null>(
    null,
  );
  const samplesRef = useRef<PointerSample[]>([]);
  const movedRef = useRef(false);
  const animRef = useRef<AnimState | null>(null);
  const transformRef = useRef<Transform>({
    x: initial?.x ?? 0,
    y: initial?.y ?? 0,
    z: initial?.z ?? 1,
  });

  const [transform, setTransform] = useState<Transform>(transformRef.current);
  const [ready, setReady] = useState(false);

  const stopAnim = useCallback(() => {
    const anim = animRef.current;
    if (anim) {
      cancelAnimationFrame(anim.raf);
      animRef.current = null;
    }
  }, []);

  useEffect(() => () => stopAnim(), [stopAnim]);

  const paintDom = useCallback((t: Transform) => {
    const world = worldRef.current;
    const vp = vpRef.current;
    if (!world || !vp) return;
    world.style.transition = 'none';
    world.style.transform = `translate(${t.x}px,${t.y}px) scale(${t.z})`;
    if (readoutRef.current) {
      const el = readoutRef.current;
      const next = `z ${Math.round(t.z * 100)}%`;
      if (el.textContent !== next) {
        el.classList.add('is-updating');
        el.textContent = next;
        window.setTimeout(() => el.classList.remove('is-updating'), 100);
      }
    }
    const miniVp = miniVpRef.current;
    if (miniVp) {
      const vr = vp.getBoundingClientRect();
      const L = clamp(-t.x / t.z / FIELD_WIDTH, 0, 1);
      const T = clamp(-t.y / t.z / FIELD_HEIGHT, 0, 1);
      const W = clamp(vr.width / t.z / FIELD_WIDTH, 0.04, 1 - L);
      const H = clamp(vr.height / t.z / FIELD_HEIGHT, 0.04, 1 - T);
      miniVp.style.transition = 'none';
      miniVp.style.transform = `translate(${L * 100}%, ${T * 100}%) scale(${W}, ${H})`;
    }
  }, []);

  const commitTransform = useCallback((t: Transform) => {
    transformRef.current = t;
    paintDom(t);
    setTransform(t);
  }, [paintDom]);

  const applyLive = useCallback((t: Transform) => {
    transformRef.current = t;
    paintDom(t);
  }, [paintDom]);

  const tickSpring = useCallback(() => {
    const anim = animRef.current;
    if (!anim || anim.mode !== 'spring') return;
    const now = performance.now();
    const dt = Math.min(0.032, Math.max(0.001, (now - anim.lastT) / 1000));
    anim.lastT = now;

    const cur = transformRef.current;
    const sx = springStep(
      cur.x,
      anim.vx,
      anim.tx,
      dt,
      anim.response,
      anim.damping,
    );
    const sy = springStep(
      cur.y,
      anim.vy,
      anim.ty,
      dt,
      anim.response,
      anim.damping,
    );
    const sz = springStep(
      cur.z,
      anim.vz,
      anim.tz,
      dt,
      anim.response,
      anim.damping,
    );
    anim.vx = sx.velocity;
    anim.vy = sy.velocity;
    anim.vz = sz.velocity;

    const next: Transform = {
      x: sx.position,
      y: sy.position,
      z: clamp(sz.position, 0.3, 2.6),
    };

    // Settle when close enough — commit *current* sample, not a hard snap to
    // target (a snap after Euler overshoot reads as a second end-kick).
    const done =
      springSettled(next.x, anim.vx, anim.tx, 0.4, 12) &&
      springSettled(next.y, anim.vy, anim.ty, 0.4, 12) &&
      springSettled(next.z, anim.vz, anim.tz, 0.004, 0.08);

    if (done) {
      animRef.current = null;
      commitTransform({
        x: next.x,
        y: next.y,
        z: clamp(next.z, 0.3, 2.6),
      });
      return;
    }

    applyLive(next);
    anim.raf = requestAnimationFrame(tickSpring);
  }, [applyLive, commitTransform]);

  const tickInertia = useCallback(() => {
    const anim = animRef.current;
    if (!anim || anim.mode !== 'inertia') return;
    const now = performance.now();
    const dt = Math.min(0.032, Math.max(0.001, (now - anim.lastT) / 1000));
    anim.lastT = now;

    const cur = transformRef.current;
    const ix = inertiaStep(cur.x, anim.vx, dt);
    const iy = inertiaStep(cur.y, anim.vy, dt);
    anim.vx = ix.velocity;
    anim.vy = iy.velocity;

    const next: Transform = { x: ix.position, y: iy.position, z: cur.z };

    if (inertiaSettled(anim.vx) && inertiaSettled(anim.vy)) {
      animRef.current = null;
      commitTransform(next);
      return;
    }

    applyLive(next);
    anim.raf = requestAnimationFrame(tickInertia);
  }, [applyLive, commitTransform]);

  const startSpringTo = useCallback(
    (
      target: Transform,
      opts?: {
        response?: number;
        damping?: number;
        velocity?: { vx: number; vy: number; vz: number };
      },
    ) => {
      stopAnim();
      if (prefersReducedMotion()) {
        commitTransform(target);
        return;
      }
      const cur = transformRef.current;
      const anim: AnimState = {
        mode: 'spring',
        raf: 0,
        lastT: performance.now(),
        vx: opts?.velocity?.vx ?? 0,
        vy: opts?.velocity?.vy ?? 0,
        vz: opts?.velocity?.vz ?? 0,
        tx: target.x,
        ty: target.y,
        tz: clamp(target.z, 0.3, 2.6),
        response: opts?.response ?? SPRING.move.response,
        damping: opts?.damping ?? SPRING.move.damping,
      };
      // Already there
      if (
        springSettled(cur.x, 0, anim.tx) &&
        springSettled(cur.y, 0, anim.ty) &&
        springSettled(cur.z, 0, anim.tz, 0.002, 0.05)
      ) {
        commitTransform({ x: anim.tx, y: anim.ty, z: anim.tz });
        return;
      }
      animRef.current = anim;
      anim.raf = requestAnimationFrame(tickSpring);
    },
    [commitTransform, stopAnim, tickSpring],
  );

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      stopAnim();
      if (prefersReducedMotion() || (Math.abs(vx) < 40 && Math.abs(vy) < 40)) {
        commitTransform(transformRef.current);
        return;
      }
      const anim: AnimState = {
        mode: 'inertia',
        raf: 0,
        lastT: performance.now(),
        vx,
        vy,
        vz: 0,
        tx: transformRef.current.x,
        ty: transformRef.current.y,
        tz: transformRef.current.z,
        response: SPRING.move.response,
        damping: SPRING.move.damping,
      };
      animRef.current = anim;
      anim.raf = requestAnimationFrame(tickInertia);
    },
    [commitTransform, stopAnim, tickInertia],
  );

  const setT = useCallback(
    (next: Transform, animate = false, ms?: number, commit = true) => {
      if (!animate || prefersReducedMotion()) {
        stopAnim();
        if (commit) commitTransform(next);
        else applyLive(next);
        return;
      }
      startSpringTo(next, { response: responseFromMs(ms) });
    },
    [applyLive, commitTransform, startSpringTo, stopAnim],
  );

  const initField = useCallback(
    (animate = false) => {
      const vp = vpRef.current;
      if (!vp) return;
      const r = vp.getBoundingClientRect();
      const z = clamp(
        Math.min(r.width / FIELD_WIDTH, r.height / FIELD_HEIGHT) * 0.94,
        0.5,
        1.5,
      );
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

  const transformForPoint = useCallback(
    (pos: readonly [number, number]): Transform => {
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
    },
    [],
  );

  const flyTo = useCallback(
    (pos: readonly [number, number], animate = true, ms?: number) => {
      setT(transformForPoint(pos), animate, ms);
    },
    [setT, transformForPoint],
  );

  const frameIds = useCallback(
    (
      ids: string[],
      positions: Record<string, readonly [number, number]>,
      animate = true,
    ) => {
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

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      stopAnim();
      const el = e.currentTarget as HTMLElement;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* capture optional */
      }
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId,
      };
      samplesRef.current = [];
      pushSample(samplesRef.current, e.clientX, e.clientY, performance.now());
      movedRef.current = false;
      if (vpRef.current) vpRef.current.style.cursor = 'grabbing';
    },
    [stopAnim],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
    };
    pushSample(samplesRef.current, e.clientX, e.clientY, performance.now());
    const prev = transformRef.current;
    applyLive({ x: prev.x + dx, y: prev.y + dy, z: prev.z });
  }, [applyLive]);

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      const el = e.currentTarget as HTMLElement;
      if (el.hasPointerCapture?.(e.pointerId)) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      dragRef.current = null;
      if (vpRef.current) vpRef.current.style.cursor = 'grab';

      pushSample(samplesRef.current, e.clientX, e.clientY, performance.now());
      const { vx, vy } = velocityFromSamples(samplesRef.current);
      samplesRef.current = [];

      if (movedRef.current && !prefersReducedMotion()) {
        startInertia(vx, vy);
      } else {
        commitTransform(transformRef.current);
      }
    },
    [commitTransform, startInertia],
  );

  const onPointerUp = endDrag;
  const onPointerCancel = endDrag;

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      stopAnim();
      const r = vpRef.current?.getBoundingClientRect();
      if (!r) return;
      zoomAt(
        e.deltaY < 0 ? 1.12 : 0.89,
        e.clientX - r.left,
        e.clientY - r.top,
        false,
      );
      commitTransform(transformRef.current);
    },
    [commitTransform, stopAnim, zoomAt],
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

  const fitLayoutRaf = useRef(0);

  const fitView = useCallback(
    (opts?: { afterLayout?: boolean }) => {
      const run = () => initField(true);
      if (!opts?.afterLayout) {
        run();
        return;
      }
      // Wait for panel unmount / flex reflow so fit uses the full viewport.
      if (fitLayoutRaf.current) cancelAnimationFrame(fitLayoutRaf.current);
      fitLayoutRaf.current = requestAnimationFrame(() => {
        fitLayoutRaf.current = requestAnimationFrame(() => {
          fitLayoutRaf.current = 0;
          run();
        });
      });
    },
    [initField],
  );

  useEffect(
    () => () => {
      if (fitLayoutRaf.current) cancelAnimationFrame(fitLayoutRaf.current);
    },
    [],
  );

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
      onPointerCancel,
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
      onPointerCancel,
      onWheel,
      onMiniClick,
      wasDragged,
    ],
  );
}
