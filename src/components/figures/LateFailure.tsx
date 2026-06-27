import { useCallback, useEffect, useRef, useState } from 'react';
import { mono } from './styles';

const LINES = 3;
const CRACK_AT = 0.72;

type LateFailureProps = {
  /** Essay embed — no specimen chrome (prototype §V crack). */
  inline?: boolean;
};

export function LateFailure({ inline = true }: LateFailureProps) {
  const [stress, setStress] = useState(0);
  const [holding, setHolding] = useState(false);
  const holdingRef = useRef(false);
  const raf = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!holdingRef.current) return;
    setStress((s) => Math.min(1, s + 0.018));
    raf.current = requestAnimationFrame(tick);
  }, []);

  const startHold = () => {
    holdingRef.current = true;
    setHolding(true);
    if (raf.current == null) raf.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    holdingRef.current = false;
    setHolding(false);
    if (raf.current != null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    setStress((s) => Math.max(0, s - 0.08));
  };

  useEffect(() => {
    if (stress > 0 && !holdingRef.current) {
      const id = window.setInterval(() => {
        setStress((s) => (s <= 0 ? 0 : s - 0.04));
      }, 40);
      return () => clearInterval(id);
    }
    return undefined;
  }, [stress]);

  const cracked = stress >= CRACK_AT;
  const strain = Math.min(1, stress / CRACK_AT);
  const [crackDrawn, setCrackDrawn] = useState(false);

  useEffect(() => {
    if (!cracked) {
      setCrackDrawn(false);
      return undefined;
    }
    setCrackDrawn(false);
    const id = requestAnimationFrame(() => setCrackDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [cracked]);

  if (inline) {
    return (
      <div
        data-figure="FIG.06"
        data-testid="late-failure"
        style={{ margin: '8px 0 20px', textAlign: 'center' }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Hold to stress the lines"
          className="pressable"
          style={{
            position: 'relative',
            maxWidth: 440,
            margin: '0 auto',
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startHold();
          }}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              color: '#3c434a',
              lineHeight: 1.9,
            }}
          >
            {Array.from({ length: LINES }, (_, i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  color: cracked && i === LINES - 1 ? '#c2410c' : '#3c434a',
                  transform: `translateX(${strain * (i - 1) * 2}px)`,
                  transition: holding
                    ? 'transform 0.08s linear'
                    : 'transform 180ms var(--ease-out-strong)',
                }}
              >
                the model holds.
              </span>
            ))}
          </div>
          {cracked ? (
            <svg
              viewBox="0 0 440 120"
              preserveAspectRatio="none"
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <path
                d="M40,8 L130,52 L96,66 L210,112"
                fill="none"
                stroke="#c2410c"
                strokeWidth={1.5}
                className={`crackdraw-path${crackDrawn ? ' is-drawn' : ''}`}
              />
            </svg>
          ) : null}
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: cracked ? '#c2410c' : 'var(--kicker)',
            margin: '6px 0 0',
          }}
        >
          {cracked
            ? "…then one small movement, and it cracks along a line I had called cosmetic."
            : holding
              ? 'Stress accumulating along parallel assumptions…'
              : '…then one small movement, and it cracks along a line I had called cosmetic.'}
        </p>
      </div>
    );
  }

  return (
    <figure
      data-figure="FIG.06"
      data-testid="late-failure"
      style={{
        margin: '22px 0',
        background: 'var(--card)',
        border: '1px solid var(--line-soft)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
      className={cracked ? 'depth-inset' : 'depth-raised'}
    >
      <div
        style={{
          ...mono,
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--kicker)',
          padding: '10px 14px',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        FIG.06 · late failure · hold to stress
      </div>
      <div style={{ padding: 14 }}>
        <svg
          viewBox="0 0 320 140"
          role="img"
          aria-label="Parallel lines under stress — hold to crack"
          style={{
            width: '100%',
            height: 140,
            display: 'block',
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startHold();
          }}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
        >
          <rect width="320" height="140" fill="var(--card)" />
          {Array.from({ length: 9 }, (_, i) => {
            const y = 18 + i * 12;
            const offset = strain * (i - 4.5) * 0.35;
            return (
              <line
                key={i}
                x1={24}
                y1={y + offset}
                x2={296}
                y2={y - offset}
                stroke={cracked ? '#8b5a2b' : 'var(--line)'}
                strokeWidth={cracked ? 1.2 : 1}
                opacity={0.45 + strain * 0.4}
              />
            );
          })}
          {cracked ? (
            <path
              d="M 48 118 Q 120 42 168 78 T 272 22"
              fill="none"
              stroke="var(--signal)"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.85}
            />
          ) : null}
        </svg>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            margin: '10px 0 0',
            color: 'var(--muted)',
          }}
        >
          {cracked
            ? 'Load-bearing difference returned — the cut held until it didn’t.'
            : holding
              ? 'Stress accumulating along parallel assumptions…'
              : 'Press and hold the lines. Failure arrives late.'}
        </p>
      </div>
    </figure>
  );
}