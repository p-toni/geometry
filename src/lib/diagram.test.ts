import { describe, expect, it } from 'vitest';
import { collectDiagramFence, diagramToFieldGraph, parseDiagramLine } from './diagram';
import { parseBlocks } from './parseBlocks';

describe('parseDiagramLine', () => {
  it('detects cyclic loop mode', () => {
    const data = parseDiagramLine('me ↔ model ↔ environment ↔ me');
    expect(data?.mode).toBe('loop');
    expect(data?.cyclic).toBe(true);
    expect(data?.nodes).toEqual(['me', 'model', 'environment']);
    expect(data?.edges).toHaveLength(3);
  });

  it('detects notation mode', () => {
    const data = parseDiagramLine('D ≤ κvθ');
    expect(data?.mode).toBe('notation');
    expect(data?.relation).toBe('≤');
    expect(data?.lhs).toBe('D');
    expect(data?.rhs).toContain('κ');
  });

  it('detects open flow mode', () => {
    const data = parseDiagramLine('point → edge → curvature → test');
    expect(data?.mode).toBe('flow');
    expect(data?.cyclic).toBe(false);
    expect(data?.edges.every((e) => e.rel === '→')).toBe(true);
  });
});

describe('diagramToFieldGraph', () => {
  it('emits directed edges with operators', () => {
    const data = parseDiagramLine('point → edge → test')!;
    const graph = diagramToFieldGraph(data);
    expect(graph.edges.every((e) => e.directed)).toBe(true);
    expect(graph.edges[0]?.rel).toBe('→');
  });
});

describe('parseBlocks diagram', () => {
  it('parses standalone diagram lines and fences', () => {
    const blocks = parseBlocks('me ↔ model ↔ environment ↔ me\n\n:::diagram notation\nD ≤ κvθ\n:::');
    expect(blocks.some((b) => b.t === 'diagram' && b.mode === 'loop')).toBe(true);
    expect(blocks.some((b) => b.t === 'diagram' && b.mode === 'notation')).toBe(true);
  });
});

describe('collectDiagramFence', () => {
  it('collects legend terms from fenced diagram', () => {
    const lines = [':::diagram notation', 'D ≤ κvθ', 'κ speed ceiling', 'θ integration window', ':::'];
    const fence = collectDiagramFence(lines, 0);
    expect(fence?.data.terms?.κ).toBe('speed ceiling');
  });

  it('parses author lead: and follow: keys', () => {
    const lines = [
      ':::diagram loop',
      'lead: Ownership circulates —',
      'me ↔ model ↔ environment ↔ me',
      'follow: Each pass changes who is steering.',
      ':::',
    ];
    const fence = collectDiagramFence(lines, 0);
    expect(fence?.data.lead).toMatch(/circulates/);
    expect(fence?.data.follow).toMatch(/steering/);
    expect(fence?.data.mode).toBe('loop');
  });
});