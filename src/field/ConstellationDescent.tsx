import { useEffect, useRef } from 'react';
import { buildConstellationLayout } from './buildConstellationLayout';
import type { EssayStructure } from '../pool/essayStructure';

type Props = {
  structure: EssayStructure;
  onClose: () => void;
};

type Particle = { e: [string, string]; t: number };

export function ConstellationDescent({ structure, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(performance.now());
  const rafRef = useRef<number>(0);
  const layoutRef = useRef(buildConstellationLayout(structure));
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    layoutRef.current = buildConstellationLayout(structure);
    const parts: Particle[] = [];
    for (const e of layoutRef.current.edges) {
      parts.push({ e, t: Math.random() });
      parts.push({ e, t: Math.random() });
    }
    particlesRef.current = parts;
    startRef.current = performance.now();
  }, [structure]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--signal')
      .trim() || '#283ac3';

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

      const { nodes, edges, byId } = layoutRef.current;
      const t = reduce ? 1.1 : (performance.now() - startRef.current) / 1000;
      const intro = Math.min(1, t / 1.1);
      const cx = w / 2;
      const cy = h / 2;
      const S = Math.min(w, h) * 0.82;
      const P = (n: { x: number; y: number }) => ({ x: cx + n.x * S, y: cy + n.y * S });

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.028)';
        ctx.beginPath();
        ctx.arc(cx, cy, S * 0.13 * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const [a, b] of edges) {
        const na = byId[a];
        const nb = byId[b];
        if (!na || !nb) continue;
        const pa = P(na);
        const pb = P(nb);
        ctx.strokeStyle = 'rgba(170,170,180,0.13)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(
          pb.x * intro + pa.x * (1 - intro),
          pb.y * intro + pa.y * (1 - intro),
        );
        ctx.stroke();
      }

      if (!reduce) {
        for (const p of particlesRef.current) {
          p.t += 0.0045;
          if (p.t > 1) p.t -= 1;
          const [a, b] = p.e;
          const na = byId[a];
          const nb = byId[b];
          if (!na || !nb) continue;
          const pa = P(na);
          const pb = P(nb);
          const x = pa.x + (pb.x - pa.x) * p.t;
          const y = pa.y + (pb.y - pa.y) * p.t;
          const fade = Math.sin(p.t * Math.PI);
          ctx.fillStyle = `rgba(205,210,220,${0.5 * fade * intro})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      nodes.forEach((n, i) => {
        const pp = P(n);
        const appear = Math.min(1, Math.max(0, intro * nodes.length - i));
        const r = n.kind === 'lens' ? 6 : n.kind === 'section' ? 3.4 : 2.2;
        const col =
          n.kind === 'lens' ? accent : n.kind === 'section' ? '#ffffff' : '#9aa0aa';
        const glowR = n.kind === 'lens' ? 30 : n.kind === 'section' ? 16 : 9;
        const g = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, glowR);
        const gc =
          n.kind === 'lens'
            ? '40,58,195'
            : n.kind === 'section'
              ? '255,255,255'
              : '150,160,170';
        g.addColorStop(0, `rgba(${gc},${0.5 * appear})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = col;
        ctx.globalAlpha = appear;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (appear > 0.5) {
          ctx.fillStyle =
            n.kind === 'concept'
              ? 'rgba(150,160,170,0.75)'
              : 'rgba(245,247,250,0.92)';
          const family =
            n.kind === 'concept' ? "'Space Mono', monospace" : "'Space Grotesk', sans-serif";
          ctx.font = `${n.kind === 'lens' ? 600 : 400} ${n.kind === 'lens' ? 14 : n.kind === 'section' ? 11 : 9.5}px ${family}`;
          ctx.textAlign = 'center';
          ctx.fillText(
            n.label,
            pp.x,
            pp.y + (n.kind === 'lens' ? 24 : n.kind === 'section' ? 16 : 13),
          );
        }
      });

      const vg = ctx.createRadialGradient(cx, cy, S * 0.3, cx, cy, S * 0.95);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      if (!reduce) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    cancelAnimationFrame(rafRef.current);
    draw();

    return () => cancelAnimationFrame(rafRef.current);
  }, [structure]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: '#050505',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      <header
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
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#6a6f78',
            }}
          >
            inside the argument
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 19,
              letterSpacing: '-0.01em',
              color: '#f3f4f6',
              marginTop: 4,
            }}
          >
            {structure.lens}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
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
        ◉ lens · ● argument moves · · concepts
      </div>
    </div>
  );
}