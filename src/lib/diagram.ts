import type { EdgeForce, FieldGraph } from './fieldSchema';

export type DiagramMode = 'loop' | 'notation' | 'flow';

export type DiagramEdge = {
  from: string;
  to: string;
  rel: string;
  force: EdgeForce;
};

export type DiagramData = {
  mode: DiagramMode;
  cyclic: boolean;
  nodes: string[];
  edges: DiagramEdge[];
  expr?: string;
  relation?: string;
  lhs?: string;
  rhs?: string[];
  terms?: Record<string, string>;
  /** Author-authored via `lead:` / `follow:` fence keys only. */
  lead?: string;
  follow?: string;
};

const FENCE_OPEN = /^:::diagram(?:\s+(loop|notation|flow))?\s*$/i;
const FENCE_CLOSE = /^:::\s*$/;
const NOTATION = /^(.+?)\s*(≤|<|≥|>)\s*(.+)$/;
const CHAIN_SEP = /\s*(?:↔|→|←)\s*/;

function slug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'node';
}

function splitRhs(rhs: string): string[] {
  const cleaned = rhs.replace(/[·\s*]+/g, '');
  if (cleaned.length <= 4) return [...cleaned];
  return cleaned.match(/[κθΔA-Za-z]+|\d+/g) ?? [cleaned];
}

function buildChainEdges(
  nodes: string[],
  rel: string,
  cyclic: boolean,
): DiagramEdge[] {
  const edges: DiagramEdge[] = [];
  const forces: EdgeForce[] = ['necessary', 'likely', 'working-bridge', 'speculative'];
  for (let i = 0; i < nodes.length; i++) {
    const next = cyclic && i === nodes.length - 1 ? 0 : i + 1;
    if (next >= nodes.length) break;
    edges.push({
      from: nodes[i]!,
      to: nodes[next]!,
      rel,
      force: forces[Math.min(i, forces.length - 1)]!,
    });
  }
  return edges;
}

/** Parse a single diagram line (loop / flow / notation). */
export function parseDiagramLine(line: string): DiagramData | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 120) return null;

  const notation = trimmed.match(NOTATION);
  if (notation) {
    const lhs = notation[1]!.trim();
    const relation = notation[2]!;
    const rhsParts = splitRhs(notation[3]!.trim());
    const nodes = [lhs, ...rhsParts];
    const edges = rhsParts.map((term) => ({
      from: lhs,
      to: term,
      rel: relation,
      force: 'likely' as EdgeForce,
    }));
    return {
      mode: 'notation',
      cyclic: false,
      nodes,
      edges,
      expr: trimmed,
      relation,
      lhs,
      rhs: rhsParts,
    };
  }

  if (!CHAIN_SEP.test(trimmed)) return null;
  const rel = trimmed.includes('↔') ? '↔' : '→';
  const parts = trimmed.split(CHAIN_SEP).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const cyclic =
    rel === '↔' &&
    parts.length > 2 &&
    parts[0]!.toLowerCase() === parts[parts.length - 1]!.toLowerCase();
  const nodes = cyclic ? parts.slice(0, -1) : parts;
  const mode: DiagramMode = rel === '↔' && cyclic ? 'loop' : 'flow';

  return {
    mode,
    cyclic,
    nodes,
    edges: buildChainEdges(nodes, rel, cyclic),
  };
}

/** Author-marked diagram: `:::diagram` … `:::`. */
export function collectDiagramFence(
  lines: string[],
  start: number,
): { data: DiagramData; end: number } | null {
  const open = lines[start]?.trim().match(FENCE_OPEN);
  if (!open) return null;

  const hint = open[1] as DiagramMode | undefined;
  const body: string[] = [];
  const terms: Record<string, string> = {};
  let i = start + 1;

  let lead: string | undefined;
  let follow: string | undefined;

  while (i < lines.length) {
    const trimmed = lines[i]!.trim();
    if (FENCE_CLOSE.test(trimmed)) break;
    const leadLine = trimmed.match(/^lead:\s*(.+)$/i);
    const followLine = trimmed.match(/^follow:\s*(.+)$/i);
    if (leadLine) {
      lead = leadLine[1]!.trim();
    } else if (followLine) {
      follow = followLine[1]!.trim();
    } else {
      const termLine = trimmed.match(/^([A-Za-zκθΔ]+)\s+(.+)$/);
      if (termLine && body.length > 0) {
        terms[termLine[1]!] = termLine[2]!.trim();
      } else if (trimmed) {
        body.push(trimmed);
      }
    }
    i++;
  }
  if (i >= lines.length) return null;

  const main = body[0] ?? '';
  let data = parseDiagramLine(main);
  if (!data && body.length) {
    data = {
      mode: hint ?? 'flow',
      cyclic: false,
      nodes: body.map((l) => l.split(CHAIN_SEP)[0]!.trim()),
      edges: [],
    };
  }
  if (!data) return null;
  if (hint) data = { ...data, mode: hint };
  if (Object.keys(terms).length) data = { ...data, terms };
  if (lead) data = { ...data, lead };
  if (follow) data = { ...data, follow };

  return { data, end: i + 1 };
}

export function diagramToFieldGraph(data: DiagramData): FieldGraph {
  const nodes = data.nodes.map((label) => ({
    id: slug(label),
    kind: 'concept' as const,
    label,
    owned: label === data.lhs || label === data.nodes[0],
  }));
  const edges = data.edges.map((e) => ({
    from: slug(e.from),
    to: slug(e.to),
    type: 'leads-to' as const,
    force: e.force,
    rel: e.rel,
    directed: true,
    cyclic: data.cyclic,
    label: e.rel !== '→' && e.rel !== '↔' ? e.rel : undefined,
  }));
  return { nodes, edges, interiors: {} };
}