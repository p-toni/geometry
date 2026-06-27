import { structureFromExcerpt, type EssayStructure } from '../pool/essayStructure';
import type { PoolNode } from '../pool/types';

export function loadEssayStructure(node: PoolNode): EssayStructure {
  if (node.struct) {
    return {
      lens: node.struct.lens,
      centerLabel: node.title,
      sections: node.struct.sections,
    };
  }

  return structureFromExcerpt(node.title, node.excerpt);
}