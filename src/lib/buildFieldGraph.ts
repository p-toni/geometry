import type { EssayStructure } from '../pool/essayStructure';
import type { Block, Pool, PoolNode } from '../pool/types';
import type { FieldEdge, FieldGraph, FieldNode } from './fieldSchema';
import { buildCitationFieldGraph, citationsFromBlocks } from './citation';
import { diagramToFieldGraph } from './diagram';
import { buildEssayGraph, essayGraphToFieldGraph } from './essayGraph';
import { projectContrast, projectLadder } from './projectBlock';
import { loadEssayStructure } from '../field/loadEssayStructure';

function mergeGraph(target: FieldGraph, part: FieldGraph) {
  const nodeIds = new Set(target.nodes.map((n) => n.id));
  for (const n of part.nodes) {
    if (!nodeIds.has(n.id)) {
      target.nodes.push(n);
      nodeIds.add(n.id);
    }
  }
  target.edges.push(...part.edges);
  for (const [sid, ids] of Object.entries(part.interiors)) {
    target.interiors[sid] = [...(target.interiors[sid] ?? []), ...ids];
  }
}

function blocksBySection(body: Block[]): Block[][] {
  const hasH2 = body.some((b) => b.t === 'h' && (b.level ?? 2) === 2);
  const sections: Block[][] = [];
  let current: Block[] | undefined;

  for (const block of body) {
    const isSection =
      block.t === 'h' && (hasH2 ? (block.level ?? 2) === 2 : block.level === 3);
    if (isSection) {
      current = [];
      sections.push(current);
      continue;
    }
    current?.push(block);
  }
  return sections;
}

/** geometry-retrieval §VII demo — cool structural edges between argument moves. */
function geometryStructuralEnrichment(): FieldGraph {
  const hub = 'geo:hub';
  const nodes: FieldNode[] = [
    { id: hub, kind: 'section', label: 'geometry over retrieval' },
    { id: 'geo:point', kind: 'concept', label: 'point' },
    { id: 'geo:edge', kind: 'concept', label: 'edge' },
    { id: 'geo:curvature', kind: 'concept', label: 'curvature' },
    { id: 'geo:tests', kind: 'concept', label: 'the tests' },
  ];
  const edges: FieldEdge[] = [
    { from: hub, to: 'geo:edge', type: 'leads-to', force: 'section' },
    { from: 'geo:point', to: 'geo:edge', type: 'causal', force: 'necessary', label: 'causal' },
    { from: 'geo:edge', to: 'geo:tests', type: 'dependency', force: 'likely', label: 'dependency' },
    {
      from: 'geo:edge',
      to: 'geo:curvature',
      type: 'constraint',
      force: 'working-bridge',
      label: 'constraint',
    },
    {
      from: 'geo:curvature',
      to: 'geo:tests',
      type: 'leads-to',
      force: 'speculative',
      label: 'leads-to',
    },
  ];
  return { nodes, edges, interiors: {} };
}

function spineFromStructure(structure: EssayStructure): FieldGraph {
  const nodes: FieldNode[] = [
    { id: 'c', kind: 'lens', label: structure.centerLabel },
  ];
  const edges: FieldEdge[] = [];

  structure.sections.forEach((sec, i) => {
    const sid = `s${i}`;
    nodes.push({ id: sid, kind: 'section', label: sec.label });
    edges.push({ from: 'c', to: sid, type: 'leads-to', force: 'section' });

    sec.concepts.forEach((concept, j) => {
      const kid = `${sid}k${j}`;
      nodes.push({ id: kid, kind: 'concept', label: concept });
      edges.push({ from: sid, to: kid, type: 'dependency', force: 'likely' });
    });
  });

  return { nodes, edges, interiors: {} };
}

function projectBodyBlocks(node: PoolNode, structure: EssayStructure): FieldGraph {
  const graph: FieldGraph = { nodes: [], edges: [], interiors: {} };
  const sectionBlocks = blocksBySection(node.body);

  structure.sections.forEach((_, i) => {
    const sid = `s${i}`;
    const blocks = sectionBlocks[i];
    if (!blocks) return;

    for (const block of blocks) {
      if (block.t === 'ladder' && block.mode === 'level') {
        mergeGraph(graph, projectLadder(block, sid));
      }
      if (block.t === 'contrast') {
        mergeGraph(graph, projectContrast(block, `contrast:s${i}`));
      }
    }
  });

  if (!Object.keys(graph.interiors).length) {
    for (const block of node.body) {
      if (block.t === 'ladder' && block.mode === 'level') {
        mergeGraph(graph, projectLadder(block, structure.sections[0] ? 's0' : 'c'));
        break;
      }
    }
  }

  if (!graph.nodes.some((n) => n.kind === 'pole')) {
    for (const block of node.body) {
      if (block.t === 'contrast') {
        mergeGraph(graph, projectContrast(block));
        break;
      }
    }
  }

  return graph;
}

function enrichFromBlocks(node: PoolNode, graph: FieldGraph): FieldGraph {
  for (const block of node.body) {
    if (block.t === 'diagram') {
      mergeGraph(graph, diagramToFieldGraph(block));
    }
  }

  const citations = citationsFromBlocks(node.body);
  const citeGraph = buildCitationFieldGraph(node.id, citations);
  if (citeGraph) {
    mergeGraph(graph, citeGraph);
    graph.boundary = { corpus: true };
  }

  return graph;
}

/** Consume parsed blocks + struct → typed field.pool sub-graph. */
export function buildFieldGraph(node: PoolNode, pool?: Pool): FieldGraph {
  if (pool) {
    const essay = buildEssayGraph(node, pool);
    if (essay) return enrichFromBlocks(node, essayGraphToFieldGraph(essay));
  }

  const structure = loadEssayStructure(node);
  const graph = spineFromStructure(structure);
  mergeGraph(graph, projectBodyBlocks(node, structure));

  if (node.id === 'geometry-retrieval') {
    mergeGraph(graph, geometryStructuralEnrichment());
  }

  return enrichFromBlocks(node, graph);
}