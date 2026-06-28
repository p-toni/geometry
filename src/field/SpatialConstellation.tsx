import { useCallback, useEffect, useRef, useState } from 'react';
import { loadGraph } from '../../constellation/src/graph/loadGraph.js';
import { mount } from '../../constellation/src/mount.js';
export type DescentOrigin = { x: number; y: number };
import { graphPathForNode } from './spatialConstellationMap';

import '../../constellation/src/embed.css';

type Props = {
  nodeId: string;
  title: string;
  origin?: DescentOrigin;
  onClose: () => void;
};

export function SpatialConstellation({ nodeId, title, origin, onClose }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<ReturnType<typeof mount> | null>(null);
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const path = graphPathForNode(nodeId);
    if (!host || !path) return;

    let dead = false;
    setError(null);

    loadGraph(path)
      .then((graph) => {
        if (dead || !hostRef.current) return;
        mountRef.current?.destroy();
        mountRef.current = mount(hostRef.current, { graph });
        mountRef.current.resize();
      })
      .catch((e: unknown) => {
        if (dead) return;
        setError(e instanceof Error ? e.message : 'Failed to load constellation');
      });

    return () => {
      dead = true;
      mountRef.current?.destroy();
      mountRef.current = null;
    };
  }, [nodeId]);

  useEffect(() => {
    const onResize = () => mountRef.current?.resize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const requestClose = useCallback(() => {
    setExiting(true);
    window.setTimeout(() => onClose(), 260);
  }, [onClose]);

  const overlayClass = [
    'constellation-overlay',
    !entered && !exiting ? 'constellation-overlay--enter' : '',
    exiting ? 'constellation-overlay--exit' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={overlayClass}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        transformOrigin: origin ? `${origin.x}px ${origin.y}px` : '50% 72%',
      }}
    >
      <header
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6a6f78',
            }}
          >
            spatial reading
          </div>
          <div
            className="type-display"
            style={{ fontWeight: 600, fontSize: 18, color: '#f3f4f6', marginTop: 4 }}
          >
            {title}
          </div>
        </div>
        <button
          type="button"
          className="pressable"
          onClick={requestClose}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#cfd2d8',
            background: 'rgba(255,255,255,.06)',
            border: '1px solid rgba(255,255,255,.16)',
            borderRadius: 3,
            padding: '9px 13px',
            cursor: 'pointer',
          }}
        >
          ✕ back to the field
        </button>
      </header>

      <div ref={hostRef} data-testid="spatial-constellation-host" style={{ flex: 1, minHeight: 0 }} />

      {error ? (
        <p
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#d9824a',
          }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}