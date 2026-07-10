import { useCallback, useEffect, useRef, useState } from 'react';
import {
  prefersReducedMotion,
  project,
  pushSample,
  rubberband,
  springSettled,
  springStep,
  SPRING,
  velocityFromSamples,
  type PointerSample,
} from '../../lib/spring';

const MOBILE_MQ = '(max-width: 700px)';
const DISMISS_PX = 110;
const DISMISS_V = 700;

type Options = {
  enabled: boolean;
  onDismiss: () => void;
};

/**
 * Mobile bottom-sheet gesture: 1:1 drag, rubber-band, velocity commit/cancel.
 * Desktop: no-op (CSS handles enter path).
 */
export function useSheetGesture({ enabled, onDismiss }: Options) {
  const sheetRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    base: number;
  } | null>(null);
  const samplesRef = useRef<PointerSample[]>([]);
  const animRef = useRef<number | null>(null);
  const yRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const stopAnim = useCallback(() => {
    if (animRef.current != null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  useEffect(() => () => stopAnim(), [stopAnim]);

  const paint = useCallback((y: number, animateCss = false) => {
    const el = sheetRef.current;
    if (!el) return;
    yRef.current = y;
    el.style.transition = animateCss
      ? `transform ${SPRING.sheet.response * 1000}ms var(--ease-drawer)`
      : 'none';
    el.style.transform = y === 0 ? '' : `translateY(${y}px)`;
  }, []);

  const springTo = useCallback(
    (target: number, velocity: number, then?: () => void) => {
      stopAnim();
      if (prefersReducedMotion()) {
        paint(target);
        then?.();
        return;
      }
      let v = velocity;
      let last = performance.now();
      const step = () => {
        const now = performance.now();
        const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
        last = now;
        const next = springStep(
          yRef.current,
          v,
          target,
          dt,
          SPRING.sheet.response,
          SPRING.sheet.damping,
        );
        v = next.velocity;
        paint(next.position);
        if (springSettled(next.position, v, target, 0.8, 20)) {
          paint(target);
          animRef.current = null;
          then?.();
          return;
        }
        animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    },
    [paint, stopAnim],
  );

  const onHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || !isMobile) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      stopAnim();
      const el = e.currentTarget as HTMLElement;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* optional */
      }
      dragRef.current = {
        pointerId: e.pointerId,
        startY: e.clientY,
        base: yRef.current,
      };
      samplesRef.current = [];
      pushSample(samplesRef.current, e.clientX, e.clientY, performance.now());
      setDragging(true);
    },
    [enabled, isMobile, stopAnim],
  );

  const onHandlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      pushSample(samplesRef.current, e.clientX, e.clientY, performance.now());
      const raw = drag.base + (e.clientY - drag.startY);
      // Only drag down; rubber-band upward resistance.
      let y: number;
      if (raw < 0) {
        y = -rubberband(-raw, 120, 0.45);
      } else {
        y = raw;
      }
      paint(y);
    },
    [paint],
  );

  const onHandlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const el = e.currentTarget as HTMLElement;
      if (el.hasPointerCapture?.(e.pointerId)) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
      dragRef.current = null;
      setDragging(false);
      pushSample(samplesRef.current, e.clientX, e.clientY, performance.now());
      const { vy } = velocityFromSamples(samplesRef.current);
      samplesRef.current = [];
      const y = yRef.current;
      const projected = y + project(vy);
      const shouldDismiss =
        projected > DISMISS_PX || (vy > DISMISS_V && y > 24);

      if (shouldDismiss) {
        const height = sheetRef.current?.offsetHeight ?? 480;
        springTo(height + 40, Math.max(vy, 400), onDismiss);
      } else {
        springTo(0, vy);
      }
    },
    [onDismiss, springTo],
  );

  // Reset offset when sheet remounts / node changes handled by consumer remount
  useEffect(() => {
    if (!enabled) {
      stopAnim();
      paint(0);
    }
  }, [enabled, paint, stopAnim]);

  return {
    sheetRef,
    dragging,
    isMobile,
    gestureActive: enabled && isMobile,
    handleProps: {
      onPointerDown: onHandlePointerDown,
      onPointerMove: onHandlePointerMove,
      onPointerUp: onHandlePointerUp,
      onPointerCancel: onHandlePointerUp,
    },
  };
}
