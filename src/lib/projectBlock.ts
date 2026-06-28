import type { ContrastRow } from './contrast';
import type { FieldEdge, FieldGraph, FieldNode } from './fieldSchema';
import type { Block } from '../pool/types';

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Ladder → graded rung chain inside a section (nested trace). */
export function projectLadder(
  block: Extract<Block, { t: 'ladder' }>,
  sectionId: string,
): FieldGraph {
  const rungs = block.rungs;
  const nodes: FieldNode[] = rungs.map((rung, i) => ({
    id: `${sectionId}:rung:${slug(rung.marker || String(i))}`,
    kind: 'rung',
    label: rung.term,
    grade: block.mode === 'level' ? i : undefined,
    owned: block.mode === 'level' && i === rungs.length - 1,
  }));

  const edges: FieldEdge[] = [];
  const first = nodes[0];
  if (first) {
    edges.push({
      from: sectionId,
      to: first.id,
      type: 'leads-to',
      force: 'enter',
      label: 'enter ↓',
    });
  }

  if (block.mode === 'gate') {
    const core = nodes.filter((_, i) => rungs[i]?.role !== 'addon');
    const addons = nodes.filter((_, i) => rungs[i]?.role === 'addon');
    for (let i = 0; i < core.length - 1; i++) {
      edges.push({
        from: core[i]!.id,
        to: core[i + 1]!.id,
        type: 'leads-to',
        force: 'necessary',
        directed: true,
        rel: '→',
      });
    }
    const r3 = core.find((n) => n.id.includes('r3') || n.label === 'Next Action');
    if (r3) {
      for (const addon of addons) {
        edges.push({
          from: r3.id,
          to: addon.id,
          type: 'leads-to',
          force: 'speculative',
          directed: true,
          rel: '→',
        });
      }
    }
  } else {
    const chain =
      block.mode === 'level' ? nodes : nodes.filter((_, i) => rungs[i]?.role !== 'addon');
    for (let i = 0; i < chain.length - 1; i++) {
      edges.push({
        from: chain[i]!.id,
        to: chain[i + 1]!.id,
        type: 'leads-to',
        force: i === chain.length - 2 ? 'working-bridge' : 'likely',
        directed: true,
        rel: '→',
      });
    }
  }

  return {
    nodes,
    edges,
    interiors: { [sectionId]: nodes.map((n) => n.id) },
  };
}

function projectContrastRows(
  block: Extract<Block, { t: 'contrast' }>,
  poleA: string,
  poleB: string,
  prefix: string,
): { nodes: FieldNode[]; edges: FieldEdge[] } {
  const nodes: FieldNode[] = [];
  const edges: FieldEdge[] = [];

  if (block.mode === 'pair') {
    for (const row of block.rows) {
      const aid = `${prefix}:row-a:${slug(row.a)}`;
      const bid = `${prefix}:row-b:${slug(row.b)}`;
      nodes.push({ id: aid, kind: 'criterion', label: row.a });
      nodes.push({ id: bid, kind: 'criterion', label: row.b });
      edges.push({ from: poleA, to: aid, type: 'dependency', force: 'likely' });
      edges.push({ from: poleB, to: bid, type: 'dependency', force: 'likely' });
    }
  } else if (block.mode === 'table') {
    for (const row of block.rows) {
      if (!row.label) continue;
      const cid = `${prefix}:crit:${slug(row.label)}`;
      nodes.push({ id: cid, kind: 'criterion', label: row.label });
    }
  }

  return { nodes, edges };
}

/** Contrast → poles held apart by one tradeoff edge (tension trace). */
export function projectContrast(
  block: Extract<Block, { t: 'contrast' }>,
  prefix = 'contrast',
): FieldGraph {
  const poleA = `${prefix}:pole-a`;
  const poleB = `${prefix}:pole-b`;
  const nodes: FieldNode[] = [
    {
      id: poleA,
      kind: 'pole',
      label: block.poles[0],
      owned: block.ownedPole === 0,
    },
    {
      id: poleB,
      kind: 'pole',
      label: block.poles[1],
      owned: block.ownedPole === 1,
    },
  ];

  const axis =
    block.mode === 'table'
      ? block.rows.map((r: ContrastRow) => r.label ?? '').filter(Boolean)
      : [];

  const rowGraph = projectContrastRows(block, poleA, poleB, prefix);

  const edges: FieldEdge[] = [
    {
      from: poleA,
      to: poleB,
      type: 'tradeoff',
      force: 'necessary',
      axis,
      label: block.axisLabel ? `tradeoff · axis = ${block.axisLabel}` : 'tradeoff',
    },
    ...rowGraph.edges,
  ];

  return {
    nodes: [...nodes, ...rowGraph.nodes],
    edges,
    interiors: {},
  };
}