import type { NodeKind } from '../pool/types';

export const GLYPH: Record<NodeKind, string> = {
  essay: '▤',
  note: '▪',
  project: '◈',
  doc: '▦',
  shader: '◫',
  voxel: '⬢',
  sharp: '✦',
  link: '↗',
  about: '◉',
};

export function kindLabel(kind: NodeKind): string {
  return `${GLYPH[kind]}  ${kind}`;
}