import type { EssayStructure } from '../pool/essayStructure';

export type DescentNode = {
  id: string;
  label: string;
  kind: 'lens' | 'section' | 'concept';
  x: number;
  y: number;
};

export type DescentLayout = {
  nodes: DescentNode[];
  edges: [string, string][];
  byId: Record<string, DescentNode>;
};

/** Radial layout from v2 single-spine _buildConstellation. */
export function buildConstellationLayout(structure: EssayStructure): DescentLayout {
  const nodes: DescentNode[] = [
    { id: 'c', label: structure.centerLabel, kind: 'lens', x: 0, y: 0 },
  ];
  const edges: [string, string][] = [];
  const N = structure.sections.length;

  structure.sections.forEach((sec, i) => {
    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
    const sx = Math.cos(a) * 0.3;
    const sy = Math.sin(a) * 0.3;
    const sid = `s${i}`;
    nodes.push({ id: sid, label: sec.label, kind: 'section', x: sx, y: sy });
    edges.push(['c', sid]);

    sec.concepts.forEach((cp, j) => {
      const ca = a + (j - (sec.concepts.length - 1) / 2) * 0.2;
      const cr = 0.46 + (j % 2) * 0.07;
      const kid = `${sid}k${j}`;
      nodes.push({
        id: kid,
        label: cp,
        kind: 'concept',
        x: Math.cos(ca) * cr,
        y: Math.sin(ca) * cr,
      });
      edges.push([sid, kid]);
    });
  });

  const byId: Record<string, DescentNode> = {};
  for (const n of nodes) byId[n.id] = n;
  return { nodes, edges, byId };
}