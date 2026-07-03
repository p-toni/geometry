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
  /** Cluster-toned place marker shown before the kicker */
  markerColor: string;
  /** True when the node earns an ink chip (active read node, link pill) */
  plate: boolean;
  leftAccent: boolean;
  rightAccent: boolean;
  accentEdge: 'signal' | 'fresh';
  showRel: boolean;
  rel: Rel | '';
};

export function nodeVisual(
  node: PoolNode,
  ctx: {
    mode: 'field' | 'lens' | 'read';
    readId: string | null;
    neighborRels: Record<string, Rel>;
    matched: Set<string>;
  },
): NodeVisual {
  const isActive = ctx.mode === 'read' && ctx.readId === node.id;
  const isNbr = ctx.mode === 'read' && ctx.neighborRels[node.id] != null;
  const isMatch = ctx.mode === 'lens' && ctx.matched.has(node.id);
  const isFresh = freshScore(node) >= 3;
  const isLink = node.kind === 'link';

  const { lit } = terrainHeight(node.id, node, ctx);

  let dim = 1;
  let lift = 0;

  if (ctx.mode === 'read') {
    dim = lit ? 1 : 0.26;
    if (isActive) lift = -2;
  } else if (ctx.mode === 'lens') {
    dim = lit ? 1 : 0.24;
  }

  const tone = clusterTone(node.cluster);
  const featured = ctx.mode === 'field' && !isLink && node.rank <= 1;
  const primary = ctx.mode === 'field' && !isLink && node.rank === 0;

  // Everything rests on the terrain as a surveyed place-name; only the node
  // being read (and external link pills) earns an ink chip.
  const plate = isActive || isLink;

  const shadow = isActive ? '0 18px 44px rgba(28,31,36,.26)' : 'none';
  if (primary) lift = -1;

  let bg = 'transparent';
  let textColor = 'var(--ink)';
  let kickerColor = 'var(--kicker)';
  let border = 'none';

  if (isActive || isLink) {
    bg = 'var(--ink)';
    textColor = '#fff';
    kickerColor = isLink ? '#7f8a93' : 'var(--signal)';
  }

  const leftAccent = isLink ? false : isActive || isNbr || isMatch || featured;
  const rightAccent = false;
  const accentEdge: 'signal' | 'fresh' = primary ? 'fresh' : 'signal';

  // Marks stay cluster-toned at rest; state accents override — gold for
  // fresh work and the primary node, signal for read-neighbors and matches.
  const markerColor =
    isNbr || isMatch
      ? 'var(--signal)'
      : primary || isFresh
        ? 'var(--fresh)'
        : tone.accent;

  return {
    dim,
    shadow,
    lift,
    bg,
    textColor,
    kickerColor,
    border,
    markerColor,
    plate,
    leftAccent,
    rightAccent,
    accentEdge,
    showRel: isNbr,
    rel: ctx.neighborRels[node.id] ?? '',
  };
}
