import { describe, expect, it } from 'vitest';
import {
  inertiaSettled,
  inertiaStep,
  project,
  rubberband,
  springSettled,
  springStep,
  velocityFromSamples,
} from './spring';

describe('spring helpers', () => {
  it('projects further for higher velocity', () => {
    expect(project(1000)).toBeGreaterThan(project(200));
    expect(project(0)).toBe(0);
  });

  it('rubberbands less than raw overshoot', () => {
    const raw = 120;
    const soft = rubberband(raw, 400);
    expect(soft).toBeGreaterThan(0);
    expect(soft).toBeLessThan(raw);
  });

  it('critically damped spring settles near target', () => {
    let p = 0;
    let v = 0;
    const target = 100;
    for (let i = 0; i < 120; i++) {
      const step = springStep(p, v, target, 1 / 60, 0.35, 1);
      p = step.position;
      v = step.velocity;
    }
    expect(Math.abs(p - target)).toBeLessThan(1);
    expect(Math.abs(v)).toBeLessThan(15);
    expect(springSettled(p, v, target, 1, 20)).toBe(true);
  });

  it('inertia decays velocity', () => {
    let p = 0;
    let v = 800;
    for (let i = 0; i < 90; i++) {
      const step = inertiaStep(p, v, 1 / 60);
      p = step.position;
      v = step.velocity;
    }
    expect(Math.abs(v)).toBeLessThan(Math.abs(800));
    expect(inertiaSettled(v, 40)).toBe(true);
  });

  it('estimates velocity from samples', () => {
    const { vx, vy } = velocityFromSamples([
      { x: 0, y: 0, t: 0 },
      { x: 50, y: -20, t: 50 },
    ]);
    expect(vx).toBeCloseTo(1000, 0);
    expect(vy).toBeCloseTo(-400, 0);
  });
});
