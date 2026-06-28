import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pool } from '../pool';
import { buildEssayGraph, rungById } from '../lib/essayGraph';
import { buildFieldGraph } from '../lib/buildFieldGraph';
import { drawFieldEdge } from '../lib/fieldDraw';
import { isBoundaryEdge, starRadius } from '../lib/fieldSchema';
import { layoutEssayGraph } from '../lib/layoutEssayGraph';
import { layoutFieldGraph, mergeFieldGraphIntoLayout } from '../lib/layoutFieldGraph';
import { loadEssayStructure } from './loadEssayStructure';
import type { PoolNode } from '../pool/types';

export type DescentOrigin = { x: number; y: number };

type Props = {
  node: PoolNode;
  origin?: DescentOrigin;
  onClose: () => void;
};

type Particle = { from: string; to: string; t: number };

const INTRO_S = 1.1;

export function ConstellationDescent({ node, origin, onClose }: Props) {
  const [exiting, setExiting] = useState(false);
  const [entered, setEntered] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  const essayGraph = useMemo(() => buildEssayGraph(node, pool), [node]);
  const fieldGraph = useMemo(() => buildFieldGraph(node, pool), [node]);
  const structure = useMemo(() => loadEssayStructure(node), [node]);
  const layoutRef = useRef(
    mergeFieldGraphIntoLayout(
      essayGraph
        ? layoutEssayGraph(essayGraph)
        : layoutFieldGraph(structure, fieldGraph),
      fieldGraph,
    ),
  );
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const layout = mergeFieldGraphIntoLayout(
      essayGraph
        ? layoutEssayGraph(essayGraph)
        : layoutFieldGraph(structure, fieldGraph),
      fieldGraph,
    );
    layoutRef.current = layout;
    const parts: Particle[] = [];
    for (const e of layout.edges) {
      if (e.type === 'tradeoff') continue;
      parts.push({ from: e.from, to: e.to, t: Math.random() });
    }
    particlesRef.current = parts;
    startRef.current = performance.now();
    setSel(null);
  }, [node, essayGraph, fieldGraph, structure]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rootStyle = getComputedStyle(document.documentElement);
    const accent = rootStyle.getPropertyValue('--signal').trim() || '#1F4DB8';

    const draw = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth || 800;
      const h = cv.clientHeight || 500;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { nodes, edges, interiors, edgeLabels, boundary } = layoutRef.current;
      const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
      const t = reduce ? INTRO_S : (performance.now() - startRef.current) / 1000;
      const intro = Math.min(1, t / INTRO_S);
      const cx = w / 2;
      const cy = h / 2;
      const S = Math.min(w, h) * 0.82;
      const P = (n: { x: number; y: number }) => ({ x: cx + n.x * S, y: cy + n.y * S });

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      for (let i = 1; i <= 4; i++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.028)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, S * 0.13 * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (boundary?.corpus && intro > 0.35) {
        const bx = cx - S * 0.42;
        const by = cy - S * 0.38;
        const bw = S * 0.58;
        const bh = S * 0.76;
        ctx.strokeStyle = 'rgba(58,66,96,0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(90,100,136,0.75)';
        ctx.font = "9px 'Space Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText('the corpus', bx + 8, by + 14);
        ctx.fillStyle = 'rgba(217,130,74,0.75)';
        ctx.textAlign = 'right';
        ctx.fillText('external sources', bx + bw - 8, by + 14);
      }

      for (const bounds of Object.values(interiors)) {
        if (intro < 0.4) continue;
        const x = cx + bounds.x * S;
        const y = cy + bounds.y * S;
        ctx.strokeStyle = 'rgba(58,66,96,0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x, y, bounds.w * S, bounds.h * S);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(90,100,136,0.75)';
        ctx.font = "9px 'Space Mono', monospace";
        ctx.textAlign = 'left';
        ctx.fillText('interior', x + 6, y + 12);
      }

      for (const edge of edges) {
        const na = byId[edge.from];
        const nb = byId[edge.to];
        if (!na || !nb) continue;
        const pa = P(na);
        const pb = P(nb);
        drawFieldEdge(ctx, pa, pb, edge, intro);
        if (isBoundaryEdge(edge) && intro > 0.55) {
          const mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 - 8 };
          ctx.fillStyle = '#7d86a8';
          ctx.font = "9px 'Space Mono', monospace";
          ctx.textAlign = 'center';
          ctx.fillText(edge.label ?? 'cites', mid.x, mid.y);
        }
      }

      if (!reduce) {
        for (const p of particlesRef.current) {
          p.t += 0.0045;
          if (p.t > 1) p.t -= 1;
          const na = byId[p.from];
          const nb = byId[p.to];
          if (!na || !nb) continue;
          const pa = P(na);
          const pb = P(nb);
          ctx.fillStyle = `rgba(205,210,220,${0.5 * Math.sin(p.t * Math.PI) * intro})`;
          ctx.beginPath();
          ctx.arc(pa.x + (pb.x - pa.x) * p.t, pa.y + (pb.y - pa.y) * p.t, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      nodes.forEach((n, i) => {
        const pp = P(n);
        const appear = Math.min(1, Math.max(0, intro * nodes.length - i));
        const selected = sel !== null && n.id.endsWith(`:${sel}`);
        const r = starRadius(n) * (selected ? 1.15 : 1);
        const owned = n.owned || (n.grade !== undefined && n.grade >= 3);
        const external = n.kind === 'external';
        const col = selected
          ? accent
          : n.kind === 'lens'
            ? accent
            : external
              ? '#d9824a'
              : owned
                ? accent
                : n.kind === 'section'
                  ? '#ffffff'
                  : n.kind === 'claim'
                    ? '#cdd4f5'
                    : '#9aa0aa';

        ctx.fillStyle = col;
        ctx.globalAlpha = appear;
        if (external) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = '#6f8cff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, r + 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (appear > 0.5 && n.label && n.kind !== 'criterion') {
          ctx.fillStyle = external
            ? 'rgba(217,130,74,0.92)'
            : selected || owned
              ? 'rgba(223,229,255,0.92)'
              : 'rgba(245,247,250,0.92)';
          ctx.font = `${selected || owned || external ? 600 : 400} ${n.kind === 'lens' ? 14 : 11}px 'Space Grotesk', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(n.label, pp.x, pp.y + (n.kind === 'lens' ? 24 : 16));
        }
      });

      for (const label of edgeLabels) {
        if (intro < 0.55) continue;
        const lp = P({ x: label.x, y: label.y });
        ctx.font = "9px 'Space Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = label.warm ? '#d9824a' : '#7d86a8';
        ctx.fillText(label.text, lp.x, lp.y + 2);
      }

      const vg = ctx.createRadialGradient(cx, cy, S * 0.3, cx, cy, S * 0.95);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      if (!reduce) rafRef.current = requestAnimationFrame(draw);
    };

    cancelAnimationFrame(rafRef.current);
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [node, sel, essayGraph, structure]);

  const hitTest = useCallback(
    (clientX: number, clientY: number) => {
      const cv = canvasRef.current;
      if (!cv || !essayGraph) return;
      const rect = cv.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((clientY - rect.top) / rect.height) * 2 - 1;
      const S = 0.82;
      let best: string | null = null;
      let bestD = 0.08;
      for (const sec of essayGraph.sections) {
        for (const r of sec.rungs) {
          const nx = (r.x - 50) / 50;
          const ny = (r.y - 50) / 50;
          const d = Math.hypot(x - nx * S, y - ny * S);
          if (d < bestD) {
            bestD = d;
            best = r.id;
          }
        }
      }
      setSel((s) => (best ? (s === best ? null : best) : s));
    },
    [essayGraph],
  );

  const requestClose = useCallback(() => {
    setExiting(true);
    window.setTimeout(() => onClose(), 160);
  }, [onClose]);

  const selectedRung = sel && essayGraph ? rungById(essayGraph, sel) : undefined;

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
        transformOrigin: origin ? `${origin.x}px ${origin.y}px` : '50% 72%',
      }}
    >
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <canvas
          ref={canvasRef}
          data-testid="constellation-canvas"
          onClick={(e) => hitTest(e.clientX, e.clientY)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', cursor: essayGraph ? 'pointer' : 'default' }}
        />
        <Header lens={structure.lens} onClose={requestClose} />
        <Footer />
      </div>
      {essayGraph ? (
        <aside
          style={{
            width: 280,
            flex: 'none',
            borderLeft: '1px solid rgba(255,255,255,.08)',
            padding: '22px 20px',
            display: 'flex',
            flexDirection: 'column',
            color: '#aab2ad',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6f8cff' }}>
            depth 2 · interior
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: '10px 0 0' }}>
            Click a rung star to tie it back to its read row.
          </p>
          {selectedRung ? (
            <div style={{ marginTop: 14, background: 'rgba(255,255,255,.06)', borderRadius: 5, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#6f8cff' }}>{selectedRung.marker}</span>
                <span className="type-display" style={{ fontWeight: 600, fontSize: 15, color: '#f3f4f6' }}>{selectedRung.term}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: '#cdd4f5', margin: '7px 0 0' }}>{selectedRung.body}</p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7d867f', marginTop: 9 }}>
                same rung · read row ⇄ interior star
              </div>
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}

function Header({ lens, onClose }: { lens: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 26px',
        pointerEvents: 'none',
      }}
    >
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6a6f78' }}>
          inside the argument
        </div>
        <div className="type-display" style={{ fontWeight: 600, fontSize: 19, color: '#f3f4f6', marginTop: 4 }}>
          {lens}
        </div>
      </div>
      <button
        type="button"
        className="pressable"
        onClick={onClose}
        style={{
          pointerEvents: 'auto',
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
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 20,
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#5a5f68',
      }}
    >
      ◉ lens · ● sections · · rungs · — tradeoff
    </div>
  );
}