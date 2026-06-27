import { describe, expect, it } from 'vitest';
import { dominantClusterAt, hypsometricWhisper } from './clusterField';

describe('clusterField', () => {
  it('maps writing coordinates to the writing landmass', () => {
    expect(dominantClusterAt(268, 196)).toBe('writing');
  });

  it('maps work coordinates to the work landmass', () => {
    expect(dominantClusterAt(1002, 138)).toBe('work');
  });

  it('whispers ridges warmer than valleys without heavy fill', () => {
    const low = hypsometricWhisper('writing', 0.1, false);
    const high = hypsometricWhisper('writing', 0.9, false);
    expect(low).not.toBe(high);
    expect(low).toMatch(/^rgba\(/);
    const alpha = Number(low.split(',')[3]?.replace(')', '') ?? 1);
    expect(alpha).toBeLessThan(0.2);
    expect(alpha).toBeGreaterThan(0.04);
  });
});