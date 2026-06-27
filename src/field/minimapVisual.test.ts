import { describe, expect, it } from 'vitest';
import {
  buildMinimapEdges,
  buildMinimapSummits,
  terrainStateKey,
} from './minimapVisual';
import type { TerrainCtx } from './terrainHeight';

const baseCtx: TerrainCtx = {
  mode: 'field',
  readId: null,
  neighborRels: {},
  matched: new Set(),
};

describe('buildMinimapSummits', () => {
  it('dims unmatched nodes in lens mode', () => {
    const lensCtx: TerrainCtx = {
      ...baseCtx,
      mode: 'lens',
      matched: new Set(['geometry']),
    };
    const summits = buildMinimapSummits(lensCtx);
    const geometry = summits.find((s) => Math.abs(s.cx - 952) < 2 && Math.abs(s.cy - 208) < 2);
    const other = summits.find((s) => Math.abs(s.cx - 130) < 2 && Math.abs(s.cy - 300) < 2);
    expect(geometry?.fill).toBe('#1f4db8');
    expect(other?.fill).toBe('#a39b8c');
  });

  it('uses gold ink for fresh nodes in now mode', () => {
    const nowCtx: TerrainCtx = { ...baseCtx, mode: 'now' };
    const summits = buildMinimapSummits(nowCtx);
    const fresh = summits.find((s) => Math.abs(s.cx - 952) < 2 && Math.abs(s.cy - 208) < 2);
    expect(fresh?.fill).toBe('#d4a53a');
  });
});

describe('buildMinimapEdges', () => {
  it('brightens edges touching the open piece', () => {
    const readCtx: TerrainCtx = {
      ...baseCtx,
      mode: 'read',
      readId: 'geometry',
      neighborRels: { 'the-loom': 'contains' },
    };
    const edges = buildMinimapEdges(readCtx);
    const live = edges.find(
      (e) =>
        (e.x1 === 952 && e.y1 === 208 && e.x2 === 1124) ||
        (e.x2 === 952 && e.y2 === 208 && e.x1 === 1124),
    );
    expect(live?.op).toBeGreaterThan(0.9);
  });
});

describe('terrainStateKey', () => {
  it('changes when matched set changes', () => {
    const a = terrainStateKey({ ...baseCtx, matched: new Set(['a']) });
    const b = terrainStateKey({ ...baseCtx, matched: new Set(['b']) });
    expect(a).not.toBe(b);
  });
});