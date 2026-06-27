import type { NodeKind, PoolNode } from '../pool/types';

export type NodeLayout = {
  variant: 'card' | 'pill';
  minWidth: number;
  maxWidth: number;
  padding: string;
  titleSize: number;
  kickerSize: number;
  borderRadius: number;
};

const KIND_BASE: Record<NodeKind, Omit<NodeLayout, never>> = {
  essay: {
    variant: 'card',
    minWidth: 118,
    maxWidth: 200,
    padding: '11px 14px',
    titleSize: 14,
    kickerSize: 8.5,
    borderRadius: 3,
  },
  project: {
    variant: 'card',
    minWidth: 112,
    maxWidth: 188,
    padding: '10px 13px',
    titleSize: 13.5,
    kickerSize: 8.5,
    borderRadius: 3,
  },
  doc: {
    variant: 'card',
    minWidth: 100,
    maxWidth: 164,
    padding: '9px 12px',
    titleSize: 12.5,
    kickerSize: 8,
    borderRadius: 3,
  },
  note: {
    variant: 'card',
    minWidth: 84,
    maxWidth: 136,
    padding: '8px 10px',
    titleSize: 12,
    kickerSize: 7.5,
    borderRadius: 3,
  },
  about: {
    variant: 'card',
    minWidth: 90,
    maxWidth: 132,
    padding: '8px 11px',
    titleSize: 12,
    kickerSize: 7.5,
    borderRadius: 3,
  },
  link: {
    variant: 'pill',
    minWidth: 0,
    maxWidth: 196,
    padding: '5px 6px 5px 13px',
    titleSize: 12,
    kickerSize: 7.5,
    borderRadius: 999,
  },
  shader: {
    variant: 'card',
    minWidth: 78,
    maxWidth: 104,
    padding: '8px 9px',
    titleSize: 11,
    kickerSize: 7,
    borderRadius: 3,
  },
  voxel: {
    variant: 'card',
    minWidth: 78,
    maxWidth: 104,
    padding: '8px 9px',
    titleSize: 11,
    kickerSize: 7,
    borderRadius: 3,
  },
  sharp: {
    variant: 'card',
    minWidth: 78,
    maxWidth: 104,
    padding: '8px 9px',
    titleSize: 11,
    kickerSize: 7,
    borderRadius: 3,
  },
};

/** Rank 0 = largest; kind sets the baseline footprint. */
export function nodeLayout(node: PoolNode): NodeLayout {
  const base = KIND_BASE[node.kind];
  const prominence =
    node.kind === 'note' || node.kind === 'link'
      ? Math.max(0, (4 - node.rank) / 4) * 0.06
      : Math.max(0, (10 - node.rank) / 10) * 0.14;
  const scale = 1 + prominence;

  return {
    variant: base.variant,
    minWidth:
      base.variant === 'pill' ? 0 : Math.round(base.minWidth * scale),
    maxWidth: Math.round(base.maxWidth * scale),
    padding: base.padding,
    titleSize: base.titleSize + (prominence > 0.08 ? 0.5 : 0),
    kickerSize: base.kickerSize,
    borderRadius: base.borderRadius,
  };
}