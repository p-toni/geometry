import { freshScore } from '../lib/freshness';
import { clusterTone } from './clusterTone';
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
  accentEdge: 'signal' | 'fresh';
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
      shadow = '0 18px 44px rgba(28,31,36,.26)';
      lift = -2;
    } else if (isNbr) shadow = 'var(--shadow-lifted)';
  } else if (ctx.mode === 'lens') {
    dim = lit ? 1 : 0.24;
    if (isMatch) shadow = 'var(--shadow-lifted)';
  } else if (ctx.mode === 'now') {
    dim = lit ? 1 : 0.32;
  }

  const tone = clusterTone(node.cluster);
  let bg = tone.card;
  let textColor = 'var(--ink)';
  let kickerColor = 'var(--kicker)';
  let border = `1px solid ${tone.border}`;
  const featured = ctx.mode === 'field' && !isLink && node.rank <= 1;
  const primary = ctx.mode === 'field' && !isLink && node.rank === 0;

  if (primary) {
    shadow = '0 14px 32px rgba(28,31,36,.16), 0 0 0 1px rgba(212,165,58,.18)';
    lift = -1;
  } else if (featured) {
    shadow = '0 8px 22px rgba(28,31,36,.11)';
  }

  if (isActive || isLink) {
    bg = 'var(--ink)';
    textColor = '#fff';
    kickerColor = isLink ? '#7f8a93' : 'var(--signal)';
    border = 'none';
  } else if (node.media) {
    bg =
      'repeating-linear-gradient(135deg,#e5dfd6,#e5dfd6 6px,#f0ebe3 6px,#f0ebe3 12px)';
  }

  const isNowLit = ctx.mode === 'now' && fs >= 1;
  const leftAccent = isLink
    ? false
    : isActive ||
      isNbr ||
      isMatch ||
      isHot ||
      isNowLit ||
      featured;
  const rightAccent = false;
  const accentEdge: 'signal' | 'fresh' =
    isHot || isNowLit || primary ? 'fresh' : 'signal';

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
    accentEdge,
    showRel: isNbr,
    rel: ctx.neighborRels[node.id] ?? '',
  };
}
