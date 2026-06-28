import type { EssayStructure } from '../pool/essayStructure';
import type { FieldEdge, FieldGraph, FieldNode } from './fieldSchema';

export type PositionedFieldNode = FieldNode & { x: number; y: number };

export type InteriorBounds = { x: number; y: number; w: number; h: number };

export type FieldLayout = {
  nodes: PositionedFieldNode[];
  edges: FieldEdge[];
  interiors: Record<string, InteriorBounds>;
  edgeLabels: { x: number; y: number; text: string; warm: boolean }[];
  boundary?: { corpus: boolean };
};

function placeSpine(structure: EssayStructure, graph: FieldGraph): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  pos.set('c', { x: 0, y: 0 });

  const N = structure.sections.length;
  structure.sections.forEach((sec, i) => {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
    const sid = `s${i}`;
    pos.set(sid, { x: Math.cos(a) * 0.3, y: Math.sin(a) * 0.3 });

    sec.concepts.forEach((_, j) => {
      const ca = a + (j - (sec.concepts.length - 1) / 2) * 0.2;
      const cr = 0.46 + (j % 2) * 0.07;
      pos.set(`${sid}k${j}`, { x: Math.cos(ca) * cr, y: Math.sin(ca) * cr });
    });
  });

  for (const n of graph.nodes) {
    if (n.id.startsWith('geo:')) {
      if (n.id === 'geo:hub') pos.set(n.id, { x: 0, y: -0.55 });
      if (n.id === 'geo:point') pos.set(n.id, { x: -0.38, y: -0.12 });
      if (n.id === 'geo:edge') pos.set(n.id, { x: 0, y: 0.08 });
      if (n.id === 'geo:curvature') pos.set(n.id, { x: 0.42, y: -0.05 });
      if (n.id === 'geo:tests') pos.set(n.id, { x: 0.18, y: 0.48 });
    }
  }

  return pos;
}

function placeContrast(graph: FieldGraph, pos: Map<string, { x: number; y: number }>) {
  const poles = graph.nodes.filter((n) => n.kind === 'pole');
  if (poles.length < 2) return;

  const prefix = poles[0]!.id.split(':pole')[0];
  const a = poles.find((p) => p.id.endsWith('pole-a'));
  const b = poles.find((p) => p.id.endsWith('pole-b'));
  if (!a || !b) return;

  pos.set(a.id, { x: -0.38, y: 0.35 });
  pos.set(b.id, { x: 0.38, y: 0.35 });

  const criteria = graph.nodes.filter((n) => n.kind === 'criterion' && n.id.startsWith(prefix));
  criteria.forEach((c, i) => {
    const t = criteria.length > 1 ? i / (criteria.length - 1) : 0.5;
    const x = -0.38 + t * 0.76;
    const y = 0.35 + (i % 2 === 0 ? -0.14 : 0.14);
    pos.set(c.id, { x, y });
  });
}

function placeLadderInteriors(
  graph: FieldGraph,
  pos: Map<string, { x: number; y: number }>,
  interiors: Record<string, InteriorBounds>,
) {
  for (const [sectionId, rungIds] of Object.entries(graph.interiors)) {
    if (!rungIds.length) continue;
    const anchor = pos.get(sectionId) ?? { x: 0, y: -0.35 };
    const bounds: InteriorBounds = {
      x: anchor.x - 0.22,
      y: anchor.y + 0.08,
      w: 0.44,
      h: 0.42,
    };
    interiors[sectionId] = bounds;

    rungIds.forEach((rid, i) => {
      const t = rungIds.length > 1 ? i / (rungIds.length - 1) : 0;
      pos.set(rid, {
        x: bounds.x + 0.06 + t * (bounds.w - 0.12),
        y: bounds.y + 0.1 + t * (bounds.h - 0.14),
      });
    });
  }
}

function collectEdgeLabels(
  graph: FieldGraph,
  pos: Map<string, { x: number; y: number }>,
): FieldLayout['edgeLabels'] {
  const labels: FieldLayout['edgeLabels'] = [];
  for (const edge of graph.edges) {
    if (!edge.label) continue;
    const a = pos.get(edge.from);
    const b = pos.get(edge.to);
    if (!a || !b) continue;
    labels.push({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2 - 0.06,
      text: edge.label,
      warm: edge.type === 'tradeoff',
    });
  }
  return labels;
}

/** Place citation / diagram enrichment nodes (spec 04–05). */
export function placeEnrichment(graph: FieldGraph, pos: Map<string, { x: number; y: number }>) {
  graph.nodes
    .filter((n) => n.kind === 'external')
    .forEach((n, i) => pos.set(n.id, { x: 0.62, y: -0.18 + i * 0.2 }));

  graph.nodes
    .filter((n) => n.kind === 'claim')
    .forEach((n, i) => pos.set(n.id, { x: -0.12 + i * 0.08, y: 0.42 }));

  const concepts = graph.nodes.filter((n) => n.kind === 'concept' && !pos.has(n.id));
  concepts.forEach((n, i) => {
    const t = concepts.length > 1 ? i / (concepts.length - 1) : 0.5;
    pos.set(n.id, { x: -0.28 + t * 0.56, y: 0.62 });
  });
}

/** Merge full field graph nodes/edges into an essay layout projection. */
export function mergeFieldGraphIntoLayout(layout: FieldLayout, graph: FieldGraph): FieldLayout {
  const pos = new Map(layout.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
  placeEnrichment(graph, pos);

  const nodes = [...layout.nodes];
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const n of graph.nodes) {
    const p = pos.get(n.id);
    if (!p) continue;
    if (!nodeIds.has(n.id)) {
      nodes.push({ ...n, x: p.x, y: p.y });
      nodeIds.add(n.id);
    }
  }

  const edgeKeys = new Set(layout.edges.map((e) => `${e.from}:${e.to}:${e.type}`));
  const edges = [...layout.edges];
  for (const e of graph.edges) {
    const key = `${e.from}:${e.to}:${e.type}`;
    if (!edgeKeys.has(key)) {
      edges.push(e);
      edgeKeys.add(key);
    }
  }

  return {
    ...layout,
    nodes,
    edges,
    boundary: graph.boundary ?? layout.boundary,
  };
}

/** Assign normalized x/y for constellation canvas. */
export function layoutFieldGraph(structure: EssayStructure, graph: FieldGraph): FieldLayout {
  const pos = placeSpine(structure, graph);
  placeContrast(graph, pos);
  const interiors: Record<string, InteriorBounds> = {};
  placeLadderInteriors(graph, pos, interiors);

  placeEnrichment(graph, pos);

  const allNodes: PositionedFieldNode[] = graph.nodes
    .map((n) => {
      const p = pos.get(n.id);
      if (!p) return null;
      return { ...n, x: p.x, y: p.y };
    })
    .filter((n): n is PositionedFieldNode => n !== null);

  return {
    nodes: allNodes,
    edges: graph.edges,
    interiors,
    edgeLabels: collectEdgeLabels(graph, pos),
    boundary: graph.boundary,
  };
}