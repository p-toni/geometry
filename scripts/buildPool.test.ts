import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Mirror of buildPool parseFrontmatter — import via dynamic eval of built pool instead. */
function parseStructFromFile(rel: string) {
  const raw = readFileSync(join(root, rel), 'utf8');
  const end = raw.indexOf('\n---\n', 4);
  const yaml = raw.slice(4, end);
  const sections: { label: string; concepts: string[] }[] = [];
  let structMode: 'none' | 'sections' | 'section' = 'none';
  let current: { label: string; concepts: string[] } | undefined;

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === 'sections:') {
      structMode = 'sections';
      continue;
    }
    if ((structMode === 'sections' || structMode === 'section') && trimmed.startsWith('- label:')) {
      current = {
        label: trimmed.slice(8).trim().replace(/^['"]|['"]$/g, ''),
        concepts: [],
      };
      sections.push(current);
      structMode = 'section';
      continue;
    }
    if (structMode === 'section' && trimmed.startsWith('concepts:')) {
      const val = trimmed.slice(9).trim();
      if (val.startsWith('[') && current) {
        current.concepts = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      }
      continue;
    }
  }
  return sections;
}

describe('buildPool struct round-trip', () => {
  it('allowed-ignorance uses argument-grammar sections in content', () => {
    const sections = parseStructFromFile('content/writing/allowed-ignorance.md');
    expect(sections.length).toBeGreaterThanOrEqual(5);
    expect(sections.map((s) => s.label)).toEqual([
      'Frame',
      'Claim',
      'Block',
      'Face',
      'Rotation',
      'IV. Void',
      'V. Crack',
      'Workshop',
      'Closing',
    ]);
  });

  it('generated pool preserves all struct sections', async () => {
    const { generatedPool } = await import('../src/pool/generated.ts');
    const node = generatedPool.nodes['allowed-ignorance']!;
    expect(node.struct?.sections).toHaveLength(9);
    expect(node.struct?.sections[0]?.label).toBe('Frame');
    expect(node.struct?.sections.at(-1)?.label).toBe('Closing');
  });
});