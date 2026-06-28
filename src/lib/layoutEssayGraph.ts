import type { EssayGraph } from './essayGraph';
import type { FieldEdge } from './fieldSchema';
import type { PositionedFieldNode, FieldLayout, InteriorBounds } from './layoutFieldGraph';

/** EssayGraph → positioned layout (interior trace, explicit star/rung coords). */
export function layoutEssayGraph(graph: EssayGraph): FieldLayout {
  const nodes: PositionedFieldNode[] = [
    { id: 'c', kind: 'lens', label: graph.title, x: 0, y: -0.55 },
  ];
  const edges: FieldEdge[] = [];
  const interiors: Record<string, InteriorBounds> = {};
  const edgeLabels: FieldLayout['edgeLabels'] = [];

  for (const sec of graph.sections) {
    nodes.push({
      id: sec.id,
      kind: 'section',
      label: sec.title,
      x: (sec.star.x - 50) / 50,
      y: (sec.star.y - 50) / 50,
    });

    const rungXs: number[] = [];
    const rungYs: number[] = [];
    for (const r of sec.rungs) {
      const nx = (r.x - 50) / 50;
      const ny = (r.y - 50) / 50;
      rungXs.push(nx);
      rungYs.push(ny);
      nodes.push({
        id: `${sec.id}:${r.id}`,
        kind: 'rung',
        label: r.term,
        grade: sec.mode === 'level' ? sec.rungs.indexOf(r) : undefined,
        owned: r.id === 'L3',
        x: nx,
        y: ny,
      });
    }

    if (rungXs.length) {
      interiors[sec.id] = {
        x: Math.min(...rungXs) - 0.08,
        y: Math.min(...rungYs) - 0.06,
        w: Math.max(...rungXs) - Math.min(...rungXs) + 0.16,
        h: Math.max(...rungYs) - Math.min(...rungYs) + 0.12,
      };
    }

    const first = sec.rungs[0];
    if (first) {
      edges.push({
        from: sec.id,
        to: `${sec.id}:${first.id}`,
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
    const a = nodes.find((n) => n.id === ce.from);
    const b = nodes.find((n) => n.id === ce.to);
    if (a && b) {
      edgeLabels.push({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2 - 0.04,
        text: ce.label,
        warm: false,
      });
    }
  }

  return { nodes, edges, interiors, edgeLabels };
}