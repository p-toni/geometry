/** FIG.08 edge types — structural cool vs opposition warm. */
/** Operator glyphs on diagram edges (spec 04). */
export type RelOperator = '→' | '↔' | '≤' | '<' | '>' | '≥';

export type EdgeType =
  | 'causal'
  | 'constraint'
  | 'dependency'
  | 'leads-to'
  | 'cites'
  | 'theme'
  | 'tradeoff'
  | 'pairs'
  | 'analogy';

export type EdgeForce =
  | 'necessary'
  | 'likely'
  | 'working-bridge'
  | 'speculative'
  | 'section'
  | 'enter';

export type EdgeFamily = 'structural' | 'opposition';

export type FieldNodeKind =
  | 'lens'
  | 'section'
  | 'concept'
  | 'pole'
  | 'rung'
  | 'criterion'
  | 'claim'
  | 'external';

export type FieldNode = {
  id: string;
  kind: FieldNodeKind;
  label: string;
  owned?: boolean;
  grade?: number;
};

export type FieldEdge = {
  from: string;
  to: string;
  type: EdgeType;
  force: EdgeForce;
  label?: string;
  axis?: string[];
  /** Spec 04 — first directed edges (head-dot toward target). */
  directed?: boolean;
  cyclic?: boolean;
  rel?: RelOperator | string;
  /** Spec 05 — cites edge leaves the corpus. */
  crossesBoundary?: boolean;
};

export type FieldGraph = {
  nodes: FieldNode[];
  edges: FieldEdge[];
  /** section id → interior node ids (ladder rungs, etc.) */
  interiors: Record<string, string[]>;
  /** Spec 05 — dashed corpus box in constellation. */
  boundary?: { corpus: boolean };
};

const OPPOSITION_TYPES = new Set<EdgeType>(['tradeoff', 'pairs']);

export function edgeFamily(type: EdgeType): EdgeFamily {
  return OPPOSITION_TYPES.has(type) ? 'opposition' : 'structural';
}

export type EdgeStroke = {
  color: string;
  lineWidth: number;
  dash: number[];
  family: EdgeFamily;
};

/** Force + type → canvas stroke (spec 03 § schema). */
export function edgeStroke(edge: FieldEdge): EdgeStroke {
  if (edge.type === 'cites' || edge.crossesBoundary) {
    return {
      color: 'rgba(91,100,136,0.5)',
      lineWidth: 1,
      dash: [],
      family: 'structural',
    };
  }
  if (edge.rel === '≤' || edge.rel === '<' || edge.rel === '>') {
    return {
      color: 'rgba(217,130,74,0.65)',
      lineWidth: 1,
      dash: [5, 4],
      family: 'opposition',
    };
  }
  if (edgeFamily(edge.type) === 'opposition') {
    return {
      color: '#d9824a',
      lineWidth: 1.4,
      dash: [5, 4],
      family: 'opposition',
    };
  }
  switch (edge.force) {
    case 'necessary':
      return { color: 'rgba(91,100,136,0.55)', lineWidth: 1.2, dash: [], family: 'structural' };
    case 'likely':
      return { color: 'rgba(74,82,116,0.45)', lineWidth: 0.9, dash: [], family: 'structural' };
    case 'working-bridge':
      return { color: 'rgba(63,70,97,0.38)', lineWidth: 0.65, dash: [], family: 'structural' };
    case 'speculative':
      return { color: 'rgba(63,70,97,0.35)', lineWidth: 0.75, dash: [4, 3], family: 'structural' };
    case 'section':
      return { color: 'rgba(47,53,80,0.28)', lineWidth: 0.55, dash: [3, 4], family: 'structural' };
    case 'enter':
      return { color: 'rgba(90,100,136,0.32)', lineWidth: 0.6, dash: [3, 3], family: 'structural' };
    default:
      return { color: 'rgba(57,64,94,0.4)', lineWidth: 0.75, dash: [], family: 'structural' };
  }
}

/** Paper-field exterior strokes (depth 0 · light bg). */
export function fieldPaperStroke(force: EdgeForce): EdgeStroke {
  switch (force) {
    case 'necessary':
      return { color: 'rgba(144,151,168,0.85)', lineWidth: 1.1, dash: [], family: 'structural' };
    case 'likely':
      return { color: 'rgba(176,168,154,0.75)', lineWidth: 0.85, dash: [], family: 'structural' };
    case 'working-bridge':
      return { color: 'rgba(192,185,170,0.7)', lineWidth: 0.75, dash: [], family: 'structural' };
    case 'speculative':
      return { color: 'rgba(196,189,174,0.65)', lineWidth: 0.8, dash: [4, 3], family: 'structural' };
    default:
      return { color: 'rgba(176,168,154,0.7)', lineWidth: 0.8, dash: [], family: 'structural' };
  }
}

export function starRadius(node: FieldNode): number {
  switch (node.kind) {
    case 'lens':
      return 6;
    case 'section':
      return 3.4;
    case 'pole':
      return node.owned ? 5.5 : 4.2;
    case 'rung':
      return 2.4 + (node.grade ?? 0) * 0.55;
    case 'criterion':
      return 2.2;
    case 'claim':
      return 4.4;
    case 'external':
      return 3.6;
    default:
      return 2.2;
  }
}

export function isBoundaryEdge(edge: FieldEdge): boolean {
  return edge.crossesBoundary === true || edge.type === 'cites';
}