import { useState } from 'react';
import { body, figureKicker, figureShell, mono } from './styles';

type Mode = 'converge' | 'diverge';

const COPY: Record<Mode, string> = {
  converge:
    'Paths converge — hidden coupling. Surprise localizes because the map was missing a joint.',
  diverge:
    'Paths diverge — missing dimension. Consistency breaks because the frame was too flat.',
};

function pathData(mode: Mode) {
  const spread = mode === 'diverge' ? 1 : 0;
  const leftEnd = 80 + spread * 40;
  const rightEnd = 240 - spread * 40;
  const midY = mode === 'converge' ? 118 : 48;
  return {
    left: `M 48 28 Q 120 ${midY} ${leftEnd} 112`,
    right: `M 272 28 Q 200 ${midY} ${rightEnd} 112`,
    hubY: mode === 'converge' ? 112 : 28,
  };
}

type CurvatureProps = {
  inline?: boolean;
};

export function Curvature({ inline = true }: CurvatureProps) {
  const [mode, setMode] = useState<Mode>('converge');
  const converge = pathData('converge');
  const diverge = pathData('diverge');

  const controls = (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {(['converge', 'diverge'] as const).map((m) => (
        <button
          key={m}
          type="button"
          className="pressable"
          onClick={() => setMode(m)}
          style={{
            ...mono,
            fontSize: 9,
            padding: '5px 11px',
            borderRadius: 3,
            border: '1px solid var(--line-soft)',
            cursor: 'pointer',
            background: mode === m ? 'var(--ink)' : 'var(--card)',
            color: mode === m ? 'var(--card)' : 'var(--muted)',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );

  const renderPaths = (data: ReturnType<typeof pathData>) => (
    <>
      <path
        d={data.left}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={data.right}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.7}
      />
      <circle cx={48} cy={28} r={4} fill="var(--signal)" opacity={0.5} />
      <circle cx={272} cy={28} r={4} fill="var(--signal)" opacity={0.5} />
      <circle
        cx={160}
        cy={data.hubY}
        r={5}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
    </>
  );

  const svg = (
    <div
      className="curvature-svg"
      style={{
        position: 'relative',
        height: 140,
        border: '1px solid var(--line-soft)',
        borderRadius: 3,
        background: 'var(--card)',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 320 140"
        role="img"
        aria-label={`Curvature paths ${mode}`}
        className={`curvature-path-layer${mode === 'converge' ? '' : ' is-hidden'}`}
        style={{ width: '100%', height: 140, display: 'block' }}
      >
        {renderPaths(converge)}
      </svg>
      <svg
        viewBox="0 0 320 140"
        aria-hidden
        className={`curvature-path-layer${mode === 'diverge' ? '' : ' is-hidden'}`}
        style={{ width: '100%', height: 140, display: 'block' }}
      >
        {renderPaths(diverge)}
      </svg>
    </div>
  );

  const caption = (
    <p style={{ ...body, fontSize: 13, margin: '10px 0 0', color: 'var(--muted)' }}>
      {COPY[mode]}
    </p>
  );

  if (inline) {
    return (
      <div data-figure="FIG.11" data-testid="curvature" style={{ margin: '8px 0 20px' }}>
        {controls}
        {svg}
        {caption}
      </div>
    );
  }

  return (
    <figure data-figure="FIG.11" style={figureShell} className="depth-raised">
      <div style={figureKicker}>FIG.11 · curvature</div>
      <div style={{ padding: 14 }}>
        {controls}
        {svg}
        {caption}
      </div>
    </figure>
  );
}