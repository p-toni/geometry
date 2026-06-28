import { useRef, useState, type PointerEvent } from 'react';
import { body, figureKicker, figureShell, mono } from './styles';

type Pt = { x: number; y: number };

type PointEdgeProps = {
  inline?: boolean;
};

export function PointEdge({ inline = true }: PointEdgeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [edge, setEdge] = useState<{ from: Pt; to: Pt } | null>(null);
  const [drag, setDrag] = useState<Pt | null>(null);
  const origin: Pt = { x: 72, y: 90 };

  const toLocal = (e: PointerEvent<SVGSVGElement>): Pt => {
    const box = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 320;
    const y = ((e.clientY - box.top) / box.height) * 160;
    return { x: Math.max(16, Math.min(304, x)), y: Math.max(16, Math.min(144, y)) };
  };

  const svg = (
    <svg
      ref={svgRef}
      viewBox="0 0 320 160"
      role="img"
      aria-label="Drag from the point to extend an edge"
      style={{
        width: '100%',
        height: 160,
        display: 'block',
        cursor: 'crosshair',
        touchAction: 'none',
        background: 'var(--card)',
        border: '1px solid var(--line-soft)',
        borderRadius: 3,
      }}
      onPointerDown={(e) => {
        const p = toLocal(e);
        const near =
          Math.hypot(p.x - origin.x, p.y - origin.y) < 28 ||
          Math.hypot(p.x - (edge?.to.x ?? -999), p.y - (edge?.to.y ?? -999)) < 28;
        if (!near && !edge) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDrag(p);
      }}
      onPointerMove={(e) => {
        if (drag) setDrag(toLocal(e));
      }}
      onPointerUp={(e) => {
        if (drag) setEdge({ from: origin, to: toLocal(e) });
        setDrag(null);
      }}
      onPointerCancel={() => setDrag(null)}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`g${i}`}
          x1={40 + i * 36}
          y1={12}
          x2={40 + i * 36}
          y2={148}
          stroke="var(--line-soft)"
          strokeWidth={0.5}
          opacity={0.6}
        />
      ))}
      {(edge || drag) && (
        <line
          x1={origin.x}
          y1={origin.y}
          x2={(drag ?? edge!.to).x}
          y2={(drag ?? edge!.to).y}
          stroke="var(--read-accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
      <circle cx={origin.x} cy={origin.y} r={7} fill="var(--read-accent)" />
      <circle
        cx={(drag ?? edge?.to ?? origin).x}
        cy={(drag ?? edge?.to ?? origin).y}
        r={5}
        fill="var(--card)"
        stroke="var(--read-accent)"
        strokeWidth={2}
      />
    </svg>
  );

  const caption = (
    <p style={{ ...body, fontSize: 13, margin: '10px 0 0', color: 'var(--muted)' }}>
      {edge
        ? 'Edge extended — a relation now has direction and length.'
        : 'Drag from the filled point. A point alone is inert; an edge carries force.'}
    </p>
  );

  if (inline) {
    return (
      <div data-figure="FIG.10" data-testid="point-edge" style={{ margin: '8px 0 20px' }}>
        {svg}
        {caption}
        {edge ? (
          <button
            type="button"
            onClick={() => setEdge(null)}
            style={{
              ...mono,
              fontSize: 9,
              marginTop: 8,
              padding: '5px 10px',
              background: 'var(--card)',
              border: '1px solid var(--line-soft)',
              borderRadius: 3,
              color: 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            reset
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <figure
      data-figure="FIG.10"
      data-testid="point-edge"
      style={figureShell}
      className="depth-raised"
    >
      <div style={figureKicker}>FIG.10 · point → edge</div>
      <div style={{ padding: 14 }}>
        {svg}
        {caption}
      </div>
    </figure>
  );
}