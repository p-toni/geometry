import type { Block } from '../pool/types';

/** Essay section spine: prefer ##, fall back to ### when no h2 exist. */
export function sectionHeadingsFromBody(body: Block[]): Extract<Block, { t: 'h' }>[] {
  const h2 = body.filter((b): b is Extract<Block, { t: 'h' }> => b.t === 'h' && (b.level ?? 2) === 2);
  if (h2.length) return h2;
  return body.filter((b): b is Extract<Block, { t: 'h' }> => b.t === 'h' && b.level === 3);
}

export function isSectionHeading(block: Block): block is Extract<Block, { t: 'h' }> {
  if (block.t !== 'h') return false;
  const level = block.level ?? 2;
  return level === 2 || level === 3;
}
