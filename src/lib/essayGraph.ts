import type { LadderMode, LadderRung } from './ladder';
import type { EdgeForce, EdgeType, FieldEdge, FieldGraph, FieldNode } from './fieldSchema';
import type { Block, Pool, PoolNode, Rel } from '../pool/types';
import { FIELD_HEIGHT, FIELD_WIDTH, positions } from '../pool/field';

export type ExteriorNeighbor = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: EdgeType;
  force: EdgeForce;
  elabel: string;
};

export type GraphRung = LadderRung & {
  id: string;
  x: number;
  y: number;
};

export type EssayGraphSection = {
  id: string;
  title: string;
  kind: 'ladder';
  mode: LadderMode;
  star: { x: number; y: number };
  rungs: GraphRung[];
  edges: [string, string, EdgeForce][];
};

export type EssayGraphCrossEdge = {
  from: string;
  to: string;
  type: EdgeType;
  force: EdgeForce;
  label: string;
};

/** One graph object — field.point / read.skin / interior.subgraph project from this. */
export type EssayGraph = {
  id: string;
  title: string;
  exterior: ExteriorNeighbor[];
  sections: EssayGraphSection[];
  crossEdges: EssayGraphCrossEdge[];
};

const REL_FORCE: Partial<Record<Rel, EdgeForce>> = {
  'leads to': 'necessary',
  cites: 'likely',
  theme: 'likely',
  pairs: 'working-bridge',
  echoes: 'speculative',
};

const REL_ELABEL: Partial<Record<Rel, string>> = {
  'leads to': 'leads-to',
  cites: 'cites',
  theme: 'theme',
  pairs: 'pairs',
  echoes: 'echoes',
  contains: 'depends',
};

const REL_TYPE: Partial<Record<Rel, EdgeType>> = {
  'leads to': 'leads-to',
  cites: 'cites',
  theme: 'theme',
  pairs: 'dependency',
  echoes: 'theme',
  contains: 'dependency',
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sectionTitle(raw: string): string {
  return raw
    .replace(/^\d+\)\s*/, '')
    .replace(/:\s*\*\*[^*]+\*\*.*$/, '')
    .replace(/\*\*/g, '')
    .trim();
}

function neighborPos(
  targetId: string,
  centerId: string,
): { x: number; y: number } {
  const [nx, ny] = positions[targetId] ?? [0, 0];
  const [cx, cy] = positions[centerId] ?? [FIELD_WIDTH / 2, FIELD_HEIGHT / 2];
  const scale = 0.085;
  const aspect = FIELD_HEIGHT / FIELD_WIDTH;
  return {
    x: Math.max(8, Math.min(92, 50 + (nx - cx) * scale)),
    y: Math.max(10, Math.min(90, 50 + (ny - cy) * scale * aspect)),
  };
}

function buildExterior(node: PoolNode, pool: Pool): ExteriorNeighbor[] {
  const seen = new Set<string>();
  const neighbors: ExteriorNeighbor[] = [];

  const push = (targetId: string, rel: Rel, invert = false) => {
    if (targetId === node.id || seen.has(targetId)) return;
    const target = pool.nodes[targetId];
    if (!target) return;
    seen.add(targetId);
    const pos = neighborPos(targetId, node.id);
    const type = REL_TYPE[rel] ?? 'leads-to';
    const force = REL_FORCE[rel] ?? 'likely';
    let elabel = REL_ELABEL[rel] ?? rel;
    if (invert && rel === 'leads to') elabel = 'theme';
    neighbors.push({
      id: targetId,
      label: target.title,
      x: pos.x,
      y: pos.y,
      type,
      force: invert && rel === 'cites' ? 'working-bridge' : force,
      elabel,
    });
  };

  for (const [targetId, rel] of node.links) push(targetId, rel);
  for (const other of Object.values(pool.nodes)) {
    for (const [targetId, rel] of other.links) {
      if (targetId === node.id) push(other.id, rel, true);
    }
  }

  return neighbors.slice(0, 6);
}

function ladderEdges(mode: LadderMode, rungs: GraphRung[]): [string, string, EdgeForce][] {
  if (mode === 'gate') {
    const core = rungs.filter((r) => r.role !== 'addon');
    const addons = rungs.filter((r) => r.role === 'addon');
    const edges: [string, string, EdgeForce][] = [];
    for (let i = 0; i < core.length - 1; i++) {
      edges.push([core[i]!.id, core[i + 1]!.id, 'necessary']);
    }
    const r3 = core.find((r) => r.marker === 'R3');
    if (r3) {
      for (const addon of addons) {
        edges.push([r3.id, addon.id, 'speculative']);
      }
    }
    return edges;
  }

  const chain = mode === 'level' ? rungs : rungs.filter((r) => r.role !== 'addon');
  const edges: [string, string, EdgeForce][] = [];
  for (let i = 0; i < chain.length - 1; i++) {
    edges.push([
      chain[i]!.id,
      chain[i + 1]!.id,
      i === chain.length - 2 ? 'working-bridge' : 'likely',
    ]);
  }
  return edges;
}

/** Place rungs in a graded chain below the section star (mock layout). */
function layoutRungs(
  rungs: LadderRung[],
  star: { x: number; y: number },
  _mode: LadderMode,
  sectionIndex: number,
): GraphRung[] {
  const baseX = sectionIndex === 0 ? 0.12 : -0.1;
  const baseY = 0.22;
  return rungs.map((rung, i) => {
    const addon = rung.role === 'addon';
    const t = rungs.length > 1 ? i / Math.max(1, rungs.length - 1) : 0;
    const id =
      rung.marker.startsWith('L') || rung.marker.startsWith('R') || rung.marker.startsWith('+')
        ? rung.marker
        : `r${i}`;
    return {
      ...rung,
      id,
      x: star.x + baseX + t * 0.14 + (addon ? 0.06 : 0),
      y: star.y + baseY + t * 0.38 + (addon ? 0.12 : 0),
    };
  });
}

const SECTION_STARS: { x: number; y: number }[] = [
  { x: 28, y: 28 },
  { x: 73, y: 26 },
];

function extractLadderSections(body: Block[]): { title: string; ladder: Extract<Block, { t: 'ladder' }> }[] {
  const out: { title: string; ladder: Extract<Block, { t: 'ladder' }> }[] = [];
  let title = '';
  for (const block of body) {
    if (block.t === 'h') {
      title = sectionTitle(block.x);
    }
    if (block.t === 'ladder' && (block.mode === 'level' || block.mode === 'gate')) {
      out.push({
        title: title || (block.mode === 'level' ? 'Coupling gradient' : 'Verification gate'),
        ladder: block,
      });
    }
  }
  return out;
}

function crossEdgesFor(nodeId: string, sections: EssayGraphSection[]): EssayGraphCrossEdge[] {
  if (nodeId !== 'me-plus-ai' || sections.length < 2) return [];
  const coupling = sections.find((s) => s.id === 'coupling' || s.mode === 'level');
  const gate = sections.find((s) => s.id === 'gate' || s.mode === 'gate');
  if (!coupling || !gate) return [];
  return [
    {
      from: coupling.id,
      to: gate.id,
      type: 'leads-to',
      force: 'likely',
      label: 'gate guards L3',
    },
  ];
}

/** Build the one graph for an essay node (pool-sourced, no parallel spine). */
export function buildEssayGraph(node: PoolNode, pool: Pool): EssayGraph | null {
  const ladderSections = extractLadderSections(node.body);
  if (!ladderSections.length) return null;

  const sections: EssayGraphSection[] = ladderSections.map((entry, i) => {
    const id =
      entry.ladder.mode === 'level'
        ? 'coupling'
        : entry.ladder.mode === 'gate'
          ? 'gate'
          : slug(entry.title) || `sec-${i}`;
    const star = SECTION_STARS[i] ?? { x: 50, y: 20 + i * 18 };
    const rungs = layoutRungs(entry.ladder.rungs, star, entry.ladder.mode, i);
    return {
      id,
      title: entry.title,
      kind: 'ladder',
      mode: entry.ladder.mode,
      star,
      rungs,
      edges: ladderEdges(entry.ladder.mode, rungs),
    };
  });

  return {
    id: node.id,
    title: node.title,
    exterior: buildExterior(node, pool),
    sections,
    crossEdges: crossEdgesFor(node.id, sections),
  };
}

/** Project essay graph → field.pool interior subgraph. */
export function essayGraphToFieldGraph(graph: EssayGraph): FieldGraph {
  const nodes: FieldNode[] = [{ id: 'c', kind: 'lens', label: graph.title }];
  const edges: FieldEdge[] = [];
  const interiors: Record<string, string[]> = {};

  for (const sec of graph.sections) {
    nodes.push({ id: sec.id, kind: 'section', label: sec.title });
    edges.push({ from: 'c', to: sec.id, type: 'leads-to', force: 'section' });

    const rungIds: string[] = [];
    for (const r of sec.rungs) {
      const rid = `${sec.id}:${r.id}`;
      rungIds.push(rid);
      nodes.push({
        id: rid,
        kind: 'rung',
        label: r.term,
        grade: sec.mode === 'level' ? sec.rungs.indexOf(r) : undefined,
        owned: r.id === 'L3',
      });
    }
    interiors[sec.id] = rungIds;

    if (rungIds[0]) {
      edges.push({
        from: sec.id,
        to: rungIds[0],
        type: 'leads-to',
        force: 'enter',
        label: 'enter ↓',
      });
    }
    for (const [a, b, force] of sec.edges) {
      edges.push({
        from: `${sec.id}:${a}`,
        to: `${sec.id}:${b}`,
        type: 'leads-to',
        force,
        directed: true,
        rel: '→',
      });
    }
  }

  for (const ce of graph.crossEdges) {
    edges.push({
      from: ce.from,
      to: ce.to,
      type: ce.type,
      force: ce.force,
      label: ce.label,
    });
  }

  return { nodes, edges, interiors };
}

export function rungById(graph: EssayGraph, rungId: string): GraphRung | undefined {
  for (const sec of graph.sections) {
    const r = sec.rungs.find((x) => x.id === rungId);
    if (r) return r;
  }
  return undefined;
}
