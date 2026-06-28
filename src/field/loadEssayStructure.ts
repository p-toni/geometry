import { structureFromExcerpt, type EssayStructure } from '../pool/essayStructure';
import type { PoolNode } from '../pool/types';

/** v2 single-spine: curated struct first, excerpt heuristic fallback (_genStruct). */
export function loadEssayStructure(node: PoolNode): EssayStructure {
  if (node.struct?.sections?.length) {
    return {
      lens: node.struct.lens,
      centerLabel: node.title,
      sections: node.struct.sections,
    };
  }
  return structureFromExcerpt(node.title, node.excerpt);
}