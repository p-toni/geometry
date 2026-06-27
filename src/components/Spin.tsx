import { useEffect, useRef } from 'react';
import { SPIN, type SpinVerb } from '../lib/dotgrid';

type SpinProps = {
  verb: SpinVerb;
  className?: string;
  style?: React.CSSProperties;
};

export function Spin({ verb, className, style }: SpinProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spec = SPIN[verb] ?? SPIN.orbit;
    const t0 = performance.now();

    const id = window.setInterval(() => {
      const t = performance.now() - t0;
      const frame = reduce
        ? spec.frames[Math.floor(spec.frames.length / 2)]!
        : spec.frames[Math.floor(t / spec.intervalMs) % spec.frames.length]!;
      if (el.textContent !== frame) el.textContent = frame;
    }, 33);

    return () => clearInterval(id);
  }, [verb]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={className}
      style={{
        display: 'inline-block',
        width: 22,
        fontSize: 12,
        lineHeight: 1,
        letterSpacing: -1,
        textAlign: 'center',
        color: 'var(--signal)',
        ...style,
      }}
    >
      ⠿
    </span>
  );
}