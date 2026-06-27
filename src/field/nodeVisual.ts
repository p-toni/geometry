import { freshScore } from '../lib/freshness';
import { terrainHeight } from './terrainHeight';
import type { PoolNode, Rel } from '../pool/types';

export type NodeVisual = {
  dim: number;
  shadow: string;
  lift: number;
  bg: string;
  textColor: string;
  kickerColor: string;
  border: string;
  leftAccent: boolean;
  rightAccent: boolean;
  hot: boolean;
  showRel: boolean;
  rel: Rel | '';
};

export function nodeVisual(
  node: PoolNode,
  ctx: {
    mode: 'field' | 'lens' | 'now' | 'read';
    readId: string | null;
    neighborRels: Record<string, Rel>;
    matched: Set<string>;
  },
): NodeVisual {
  const isActive = ctx.mode === 'read' && ctx.readId === node.id;
  const isNbr = ctx.mode === 'read' && ctx.neighborRels[node.id] != null;
  const isMatch = ctx.mode === 'lens' && ctx.matched.has(node.id);
  const fs = freshScore(node);
  const isHot = ctx.mode === 'now' && fs >= 3;
  const isLink = node.kind === 'link';

  const { lit } = terrainHeight(node.id, node, ctx);

  let dim = 1;
  let shadow = 'var(--shadow-raised)';
  let lift = 0;

  if (ctx.mode === 'read') {
    dim = lit ? 1 : 0.26;
    if (isActive) {
      shadow = '0 18px 44px rgba(20,23,26,.26)';
      lift = -2;
    } else if (isNbr) shadow = 'var(--shadow-lifted)';
  } else if (ctx.mode === 'lens') {
    dim = lit ? 1 : 0.24;
    if (isMatch) shadow = 'var(--shadow-lifted)';
  } else if (ctx.mode === 'now') {
    dim = lit ? 1 : 0.32;
  }

  let bg = 'var(--card)';
  let textColor = 'var(--ink)';
  let kickerColor = 'var(--kicker)';
  let border = '1px solid #cfd4cf';

  if (isActive || isLink) {
    bg = 'var(--ink)';
    textColor = '#fff';
    kickerColor = isLink ? '#7f8a93' : 'var(--signal)';
    border = 'none';
  } else if (node.media) {
    bg =
      'repeating-linear-gradient(135deg,#dfe3df,#dfe3df 6px,#e9ece8 6px,#e9ece8 12px)';
  }

  const featured = node.rank === 0 && fs >= 2;
  const leftAccent =
    isActive ||
    isNbr ||
    isMatch ||
    isHot ||
    (featured && ctx.mode === 'field');
  const rightAccent = isLink;

  return {
    dim,
    shadow,
    lift,
    bg,
    textColor,
    kickerColor,
    border,
    leftAccent,
    rightAccent,
    hot: isHot,
    showRel: isNbr,
    rel: ctx.neighborRels[node.id] ?? '',
  };
}