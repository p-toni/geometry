import type { PoolNode } from '../pool/types';

/** Short kinds shown whole — no excerpt → read full progression. */
export function isWholePiece(node: PoolNode): boolean {
  return node.kind === 'note';
}

export function effectiveReadFull(
  node: PoolNode | undefined,
  fullOn: boolean,
): boolean {
  if (!node || isWholePiece(node)) return false;
  return fullOn && node.body.length > 0;
}