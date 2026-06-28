import type { EssaySection, EssayStructure } from '../pool/essayStructure';
import type { Block, PoolNode } from '../pool/types';
function stripHeading(label: string): string {
  return label
    .replace(/^(I{1,3}|IV|V|VI{0,3})\.\s+/i, '')
    .replace(/^[0-9]+\)\s*/, '')
    .trim();
}

function truncate(text: string, max: number): string {
  const plain = text.replace(/\*\*/g, '').replace(/\[\[([^|]+)\|[^\]]+\]\]/g, '$1').trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}

function beatLabel(block: Block): string | null {
  switch (block.t) {
    case 'thesis':
      return truncate(block.x, 42);
    case 'plate': {
      const label = block.cap.split(' — ')[0]?.trim();
      return label || 'plate';
    }
    case 'motif':
      return 'late-failure';
    case 'callout':
      return block.label?.trim() || block.v;
    case 'pull':
      return truncate(block.x, 36);
    default:
      return null;
  }
}

/** Build constellation structure from parsed essay body — single source of truth. */
export function structureFromBody(node: PoolNode): EssayStructure | null {
  const headings = node.body.filter(
    (b): b is Extract<Block, { t: 'h' }> => b.t === 'h' && (b.level ?? 2) === 2,
  );
  if (!headings.length) return null;

  const lens = node.struct?.lens ?? node.excerpt[0] ?? node.title;
  const sections: EssaySection[] = [];
  let current: EssaySection | undefined;

  const pushSection = (label: string) => {
    current = { label: stripHeading(label), concepts: [] };
    sections.push(current);
  };

  for (const block of node.body) {
    if (block.t === 'h' && (block.level ?? 2) === 2) {
      pushSection(block.x);
      continue;
    }
    if (!current) continue;
    const beat = beatLabel(block);
    if (beat && !current.concepts.includes(beat)) current.concepts.push(beat);
  }

  return { lens, centerLabel: node.title, sections };
}

export function hasBodyStructure(node: PoolNode): boolean {
  return node.body.some((b) => b.t === 'h' && (b.level ?? 2) === 2);
}