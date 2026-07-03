import type { DiagramData } from '../../lib/diagram';

type Props = DiagramData;

const TERM_COLORS: Record<string, string> = {
  D: 'var(--signal)',
  κ: 'var(--read-owned)',
  v: 'var(--muted)',
  θ: 'var(--signal)',
};

const termStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: 20,
  letterSpacing: '-0.015em',
  color: 'var(--ink)',
} as const;

/** Spec 04 · read skin — display line only; prose is authored around the block. */
export function Diagram({ mode, cyclic, nodes, expr, relation, rhs, terms }: Props) {
  if (mode === 'notation' && expr) {
    const parts = expr.split(/(≤|<|≥|>)/);
    const legendKeys = rhs ?? [];
    return (
      <div data-node="diagram" data-diagram-mode="notation" style={{ margin: '18px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'baseline',
            gap: 3,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 66,
            letterSpacing: '-0.02em',
            margin: '34px 0 20px',
            lineHeight: 1,
          }}
        >
          {parts.map((part, i) => {
            const isOp = part === relation || /^[≤<≥>]$/.test(part);
            return (
              <span
                key={i}
                style={{ color: isOp ? 'var(--read-owned)' : TERM_COLORS[part] ?? 'var(--ink)' }}
              >
                {part}
              </span>
            );
          })}
        </div>
        {legendKeys.length ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 18px',
              marginBottom: 4,
            }}
          >
            {legendKeys.map((sym) => (
              <span
                key={sym}
                style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--muted)' }}
              >
                <b
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: TERM_COLORS[sym] ?? 'var(--ink)',
                    fontWeight: 600,
                  }}
                >
                  {sym}
                </b>{' '}
                {terms?.[sym] ?? sym}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      data-node="diagram"
      data-diagram-mode={mode}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        flexWrap: 'wrap',
        margin: '18px 0',
        paddingLeft: 1,
      }}
    >
      {nodes.map((label, i) => (
        <span key={`${label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 13 }}>
          <span style={termStyle}>{label}</span>
          {i < nodes.length - 1 ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#B0A89A' }}>→</span>
          ) : null}
        </span>
      ))}
      {cyclic ? (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            color: 'var(--read-owned)',
            marginLeft: 3,
            lineHeight: 1,
          }}
          aria-hidden
        >
          ↺
        </span>
      ) : null}
    </div>
  );
}