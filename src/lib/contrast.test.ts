import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { collectContrastFence, contrastFromTable } from './contrast';
import { parseBlocks } from './parseBlocks';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('contrast fence', () => {
  it('parses pair mode from author marker', () => {
    const md = `:::contrast face | form
- a visible, stable side | the whole object
- coherent from where I stand | keeps contact when turned
- a well-lit explanation | generates consequences
:::`;
    const lines = md.split('\n');
    const result = collectContrastFence(lines, 0);
    expect(result?.data.mode).toBe('pair');
    expect(result?.data.poles).toEqual(['face', 'form']);
    expect(result?.data.ownedPole).toBe(1);
    expect(result?.data.rows).toHaveLength(3);
  });

  it('parses line mode from a single row', () => {
    const md = `:::contrast retrieval | geometry
reaching | standing somewhere
:::`;
    const result = collectContrastFence(md.split('\n'), 0);
    expect(result?.data.mode).toBe('line');
    expect(result?.data.rows[0]).toEqual({ a: 'reaching', b: 'standing somewhere' });
  });

  it('honors explicit line hint with multiple rows', () => {
    const md = `:::contrast retrieval | geometry | line
reaching | standing somewhere
:::`;
    const result = collectContrastFence(md.split('\n'), 0);
    expect(result?.data.mode).toBe('line');
  });
});

describe('contrast table', () => {
  it('absorbs three-column GFM diagnostic table', () => {
    const headers = ['Test', 'Geometry', 'Retrieval'];
    const body = [
      ['**Rephrase** — same question', 'invariant survives', 'surface breaks'],
      ['**Break** — wrong fact', 'damage localizes', 'whole picture destabilizes'],
    ];
    const data = contrastFromTable(headers, body);
    expect(data?.mode).toBe('table');
    expect(data?.poles).toEqual(['Geometry', 'Retrieval']);
    expect(data?.axisLabel).toBe('test');
    expect(data?.rows[0]?.label).toBe('Rephrase');
  });
});

describe('contrast via parseBlocks', () => {
  it('emits contrast table from geometry-retrieval essay', () => {
    const md = readFileSync(join(root, '../public/content/07-geometry-over-retrieval.md'), 'utf8');
    const body = md.slice(md.indexOf('\n---\n', 4) + 5);
    const table = parseBlocks(body).find((b) => b.t === 'contrast' && b.mode === 'table');
    expect(table?.t).toBe('contrast');
    if (table?.t !== 'contrast') return;
    expect(table.poles).toEqual(['Geometry', 'Retrieval']);
    expect(table.rows.length).toBeGreaterThanOrEqual(4);
    expect(table.rows.some((r) => r.label === 'Rephrase')).toBe(true);
  });

  it('emits contrast fence from inline marker', () => {
    const blocks = parseBlocks(`:::contrast face | form
- left stance | right stance
- another row | other side
:::`);
    expect(blocks).toContainEqual(
      expect.objectContaining({
        t: 'contrast',
        mode: 'pair',
        poles: ['face', 'form'],
      }),
    );
  });
});