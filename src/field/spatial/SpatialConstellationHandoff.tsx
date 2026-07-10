import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { SpatialConstellationView } from './SpatialConstellationView';
import type { Block } from '../../pool/types';

export type DescentOrigin = { x: number; y: number };

const EXIT_MS = 240;
const MOUNT_FALLBACK_MS = 280;

type Props = {
  graphPath: string;
  fallbackTitle?: string;
  body?: Block[];
  origin?: DescentOrigin;
  /** Browser back removed spatial=1 — play exit before unmounting. */
  exitRequested?: boolean;
  onClose: () => void;
};

export function SpatialConstellationHandoff({
  graphPath,
  fallbackTitle,
  body,
  origin,
  exitRequested = false,
  onClose,
}: Props) {
  const motionRef = useRef<HTMLDivElement>(null);
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(false);
  const [mountReady, setMountReady] = useState(false);
  /** Enter from descend CTA; exit re-anchors to back control when available. */
  const [motionOrigin, setMotionOrigin] = useState<DescentOrigin | undefined>(origin);

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
    const fallback = window.setTimeout(enableMount, MOUNT_FALLBACK_MS);

    return () => {
      el.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [entered, exiting]);

  const beginExit = useCallback(
    (from?: DescentOrigin) => {
      if (from) setMotionOrigin(from);
      setMountReady(false);
      setExiting(true);
      window.setTimeout(() => onClose(), EXIT_MS);
    },
    [onClose],
  );

  const requestClose = useCallback(
    (from?: DescentOrigin) => {
      beginExit(from);
    },
    [beginExit],
  );

  useEffect(() => {
    if (!exitRequested || exiting) return;
    beginExit();
  }, [exitRequested, exiting, beginExit]);

  const originX = motionOrigin ? `${motionOrigin.x}px` : '50%';
  const originY = motionOrigin ? `${motionOrigin.y}px` : '72%';

  const motionClass = [
    'spatial-handoff-motion',
    !entered && !exiting ? 'spatial-handoff-motion--enter' : '',
    exiting ? 'spatial-handoff-motion--exit' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const shellClass = [
    'spatial-handoff-shell',
    entered && !exiting ? 'spatial-handoff-shell--entered' : '',
    exiting ? 'spatial-handoff-shell--exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <div data-testid="spatial-constellation-handoff" className={shellClass}>
      <div
        className="spatial-paper-threshold"
        aria-hidden="true"
        style={
          {
            '--spatial-origin-x': originX,
            '--spatial-origin-y': originY,
          } as CSSProperties
        }
      >
        <div className="spatial-paper-threshold__grain" />
      </div>
      <div
        ref={motionRef}
        className={motionClass}
        style={{
          transformOrigin: `${originX} ${originY}`,
        }}
      >
        <SpatialConstellationView
          graphPath={mountReady ? graphPath : null}
          fallbackTitle={fallbackTitle}
          body={body}
          variant="handoff"
          onBack={requestClose}
          backLabel="← back to essay"
        />
      </div>
    </div>,
    document.body,
  );
}
