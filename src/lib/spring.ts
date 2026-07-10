/**
 * Apple-style spring / gesture helpers (WWDC Designing Fluid Interfaces).
 * Response is approximate settle time in seconds; damping 1.0 = critical.
 */

export const SPRING = {
  /**
   * Default UI reposition (fly, fit, hop).
   * Slightly overdamped (ζ > 1) so semi-implicit Euler does not overshoot
   * then hard-snap to target — that read as a second kick at the end of fit.
   */
  move: { damping: 1.12, response: 0.38 },
  /** Snappier hop between nearby nodes. */
  hop: { damping: 1.1, response: 0.3 },
  /** Sheet / drawer with light bounce after momentum. */
  sheet: { damping: 0.82, response: 0.32 },
  /** Press micro-feedback (CSS still preferred). */
  pressMs: 100,
} as const;

/** Exponential-decay projection (Apple sample, not v²/2a). */
export function project(
  initialVelocity: number,
  decelerationRate = 0.998,
): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Soft boundary resistance. */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55,
): number {
  if (dimension <= 0) return 0;
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

/** Convert response + damping ratio → stiffness / damping (unit mass). */
export function springCoeffs(response: number, dampingRatio: number) {
  const r = Math.max(0.05, response);
  const omega = (2 * Math.PI) / r;
  const stiffness = omega * omega;
  const damping = 2 * dampingRatio * omega;
  return { stiffness, damping };
}

export type SpringSample = {
  position: number;
  velocity: number;
};

/** One semi-implicit Euler step toward target. */
export function springStep(
  position: number,
  velocity: number,
  target: number,
  dt: number,
  response: number,
  dampingRatio: number,
): SpringSample {
  const { stiffness, damping } = springCoeffs(response, dampingRatio);
  const acc = -stiffness * (position - target) - damping * velocity;
  const nextVelocity = velocity + acc * dt;
  const nextPosition = position + nextVelocity * dt;
  return { position: nextPosition, velocity: nextVelocity };
}

export function springSettled(
  position: number,
  velocity: number,
  target: number,
  posEps = 0.15,
  velEps = 8,
): boolean {
  return (
    Math.abs(position - target) < posEps && Math.abs(velocity) < velEps
  );
}

export type PointerSample = { x: number; y: number; t: number };

/** px/s from the last few pointer samples. */
export function velocityFromSamples(
  samples: readonly PointerSample[],
  lookbackMs = 80,
): { vx: number; vy: number } {
  if (samples.length < 2) return { vx: 0, vy: 0 };
  const last = samples[samples.length - 1]!;
  let first = samples[0]!;
  for (let i = samples.length - 2; i >= 0; i--) {
    const s = samples[i]!;
    if (last.t - s.t > lookbackMs) break;
    first = s;
  }
  const dt = (last.t - first.t) / 1000;
  if (dt <= 0) return { vx: 0, vy: 0 };
  return {
    vx: (last.x - first.x) / dt,
    vy: (last.y - first.y) / dt,
  };
}

/** Push sample; keep a short ring (mutates array). */
export function pushSample(
  samples: PointerSample[],
  x: number,
  y: number,
  t: number,
  max = 6,
): void {
  samples.push({ x, y, t });
  if (samples.length > max) samples.shift();
}

/**
 * Free-motion decay step (pan inertia). Uses Apple-ish exponential friction.
 * decelerationRate is per-millisecond factor ≈ 0.998 for scroll feel.
 */
export function inertiaStep(
  position: number,
  velocity: number,
  dt: number,
  decelerationRate = 0.998,
): SpringSample {
  const ms = Math.max(0, dt * 1000);
  const nextVelocity = velocity * decelerationRate ** ms;
  const nextPosition = position + nextVelocity * dt;
  return { position: nextPosition, velocity: nextVelocity };
}

export function inertiaSettled(velocity: number, velEps = 12): boolean {
  return Math.abs(velocity) < velEps;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
