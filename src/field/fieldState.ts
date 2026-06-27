import type { SpinVerb } from '../lib/dotgrid';
import { uniqueEdges } from '../lib/graph';
import type { Pool } from '../pool';

export type FieldMode = 'field' | 'lens' | 'now' | 'read';

export function getFieldMode(args: {
  read: string | null;
  query: string;
  matched: string[] | null;
  now: boolean;
}): FieldMode {
  if (args.read && args.read.length > 0) return 'read';
  if (args.query && args.matched && args.matched.length > 0) return 'lens';
  if (args.now) return 'now';
  return 'field';
}

export function statusForMode(
  mode: FieldMode,
  pool: Pool,
  args: {
    read: string | null;
    full?: boolean;
    query: string;
    matched: string[] | null;
    composing: boolean;
    cascading?: boolean;
    readingAnim?: boolean;
  },
): { left: string; right: string; verb: SpinVerb; hint: string } {
  const total = Object.keys(pool.nodes).length;
  const edgeCount = uniqueEdges(pool).length;

  if (mode === 'read' && args.read) {
    const node = pool.nodes[args.read];
    return {
      left: `reading · ${node?.cluster ?? '—'} › neighborhood lit`,
      right: `${node?.links.length ?? 0} edges from here`,
      verb: args.readingAnim ? 'plot' : 'orbit',
      hint: args.full
        ? 'full essay open — in-essay links walk the field; collapse to return to excerpt'
        : 'the field holds — its neighbors are lit; click one to walk the edge',
    };
  }

  if (mode === 'lens' && args.query) {
    const n = args.matched?.length ?? 0;
    return {
      left: `lens · “${args.query}”`,
      right: `${n} of ${total} lit`,
      verb: args.composing ? 'index' : 'orbit',
      hint: n
        ? 'the field re-weighted around your question · clear to see it whole'
        : 'nothing matched — the field is unchanged',
    };
  }

  if (mode === 'now') {
    return {
      left: 'now · freshest lit',
      right: 'by recency',
      verb: args.cascading ? 'cascade' : 'orbit',
      hint: 'recent work glows · the rest recedes — same field, time as a lens',
    };
  }

  return {
    left: 'field · the whole shape',
    right: `${total} blocks · ${edgeCount} links`,
    verb: args.cascading ? 'cascade' : 'orbit',
    hint: 'drag to roam · scroll to zoom · click a block to read — the field stays',
  };
}