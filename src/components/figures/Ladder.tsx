import type { CSSProperties } from 'react';
import type { LadderMode, LadderRung } from '../../lib/ladder';

type Props = {
  mode: LadderMode;
  rungs: LadderRung[];
};

const LEVEL_MARKER = [
  { bg: 'var(--card)', border: '1px solid #D5CEC3', color: 'var(--muted)' },
  { bg: 'var(--read-accent-tint)', border: '1px solid var(--read-accent-border)', color: 'var(--read-accent)' },
  { bg: '#fff', border: '1px solid var(--read-accent)', color: 'var(--read-accent-deep)' },
  { bg: 'var(--read-accent)', border: '1px solid var(--read-accent)', color: '#fff' },
];

function markerStyle(mode: LadderMode, rung: LadderRung, index: number): CSSProperties {
  const base: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.02em',
    padding: '4px 8px',
    borderRadius: 3,
    whiteSpace: 'nowrap',
    position: 'relative',
    zIndex: 1,
    alignSelf: 'start',
  };
  if (mode === 'level') {
    const s = LEVEL_MARKER[Math.min(index, LEVEL_MARKER.length - 1)]!;
    return { ...base, background: s.bg, border: s.border, color: s.color };
  }
  if (mode === 'gate') {
    if (rung.role === 'addon') {
      return {
        ...base,
        background: 'var(--card)',
        border: '1px dashed #b9c0c6',
        color: 'var(--muted)',
      };
    }
    return {
      ...base,
      background: 'var(--read-owned)',
      border: '1px solid var(--read-owned)',
      color: '#fff',
    };
  }
  return {
    ...base,
    background: '#fff',
    border: '1px solid var(--read-accent)',
    color: 'var(--read-accent-deep)',
  };
}

/** Node spec 01 — graded ladder rail (level / step / gate). */
export function Ladder({ mode, rungs }: Props) {
  const railBg =
    mode === 'gate'
      ? 'var(--read-owned)'
      : 'linear-gradient(to bottom, var(--read-accent), rgba(163,155,140,.3))';

  return (
    <div
      data-node="ladder"
      data-ladder-mode={mode}
      style={{
        position: 'relative',
        margin: '8px 0 20px',
        padding: '4px 0',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 27,
          top: 20,
          bottom: 20,
          width: 2,
          borderRadius: 2,
          background: railBg,
          opacity: mode === 'gate' ? 0.5 : 1,
        }}
      />
      {rungs.map((rung, index) => {
        const addon = rung.role === 'addon';
        return (
          <div
            key={`${rung.marker}-${rung.term}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr',
              gap: 16,
              alignItems: 'start',
              padding: '14px 0',
              marginLeft: addon ? 30 : 0,
              opacity: addon ? 0.86 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={markerStyle(mode, rung, index)}>{rung.marker}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span
                  className="type-display"
                  style={{
                    fontWeight: 600,
                    fontSize: 17,
                    letterSpacing: '-0.01em',
                    color: 'var(--ink)',
                  }}
                >
                  {rung.term}
                </span>
                {rung.tag ? (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--read-accent-deep)',
                      background: 'var(--read-accent-tint)',
                      border: '1px solid var(--read-accent-border)',
                      borderRadius: 999,
                      padding: '3px 8px',
                    }}
                  >
                    {rung.tag}
                  </span>
                ) : null}
              </div>
              {rung.body ? (
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: '#3C434A',
                    margin: '5px 0 0',
                  }}
                >
                  {rung.body}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}