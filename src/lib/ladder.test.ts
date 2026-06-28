import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseBlocks } from './parseBlocks';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('ladder', () => {
  it('parses L0–L3 coupling gradient from me-plus-ai', () => {
    const md = readFileSync(join(root, '../public/content/06-me-plus-ai.md'), 'utf8');
    const body = md.slice(md.indexOf('\n---\n', 4) + 5);
    const ladder = parseBlocks(body).find((b) => b.t === 'ladder' && b.mode === 'level');
    expect(ladder?.t).toBe('ladder');
    if (ladder?.t !== 'ladder') return;
    expect(ladder.rungs).toHaveLength(4);
    expect(ladder.rungs[0]?.marker).toBe('L0');
    expect(ladder.rungs[3]?.term).toBe('Integrated');
    expect(ladder.rungs[2]?.tag).toContain('default');
  });

  it('parses R3+2+1 gate from me-plus-ai', () => {
    const md = readFileSync(join(root, '../public/content/06-me-plus-ai.md'), 'utf8');
    const body = md.slice(md.indexOf('\n---\n', 4) + 5);
    const gates = parseBlocks(body).filter((b) => b.t === 'ladder' && b.mode === 'gate');
    expect(gates.length).toBeGreaterThanOrEqual(1);
    const gate = gates[0]!;
    if (gate.t !== 'ladder') return;
    expect(gate.rungs.some((r) => r.marker === 'R3')).toBe(true);
    expect(gate.rungs.some((r) => r.marker === '+2')).toBe(true);
  });

  it('parses reconstruction loop as step ladder from geometry-retrieval', () => {
    const md = readFileSync(join(root, '../public/content/07-geometry-over-retrieval.md'), 'utf8');
    const body = md.slice(md.indexOf('\n---\n', 4) + 5);
    const step = parseBlocks(body).find(
      (b) => b.t === 'ladder' && b.mode === 'step' && b.rungs.some((r) => r.term === 'Scout'),
    );
    expect(step?.t).toBe('ladder');
    if (step?.t !== 'ladder') return;
    expect(step.rungs).toHaveLength(4);
  });
});