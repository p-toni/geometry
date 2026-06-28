import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SpatialConstellationView } from './SpatialConstellationView';

export type DescentOrigin = { x: number; y: number };

type Props = {
  graphPath: string;
  fallbackTitle?: string;
  origin?: DescentOrigin;
  onClose: () => void;
};

export function SpatialConstellationHandoff({ graphPath, fallbackTitle, origin, onClose }: Props) {
  const motionRef = useRef<HTMLDivElement>(null);
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(false);
  const [mountReady, setMountReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!entered || exiting) return;
    const el = motionRef.current;
    if (!el) return;

    const enableMount = () => setMountReady(true);
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== el || event.propertyName !== 'transform') return;
      enableMount();
    };

    el.addEventListener('transitionend', onTransitionEnd);
    const fallback = window.setTimeout(enableMount, 420);

    return () => {
      el.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [entered, exiting]);

  const requestClose = useCallback(() => {
    setMountReady(false);
    setExiting(true);
    window.setTimeout(() => onClose(), 260);
  }, [onClose]);

  const motionClass = [
    'spatial-handoff-motion',
    !entered && !exiting ? 'spatial-handoff-motion--enter' : '',
    exiting ? 'spatial-handoff-motion--exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div data-testid="spatial-constellation-handoff" className="spatial-handoff-shell">
      <div
        ref={motionRef}
        className={motionClass}
        style={{
          transformOrigin: origin
            ? `${origin.x}px ${origin.y}px`
            : '50% 72%',
        }}
      >
        <SpatialConstellationView
          graphPath={mountReady ? graphPath : null}
          fallbackTitle={fallbackTitle}
          variant="handoff"
          onBack={requestClose}
          backLabel="← back to essay"
        />
      </div>
    </div>,
    document.body,
  );
}