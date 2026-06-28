import type { FieldGraph } from './fieldSchema';

export type ProvenanceWarning = {
  claimId: string;
  message: string;
};

/** A necessary claim-node with no cites edge → lint warning (spec 05). */
export function provenanceWarnings(graph: FieldGraph): ProvenanceWarning[] {
  const claims = graph.nodes.filter((n) => n.kind === 'claim');
  const citesFrom = new Set(
    graph.edges.filter((e) => e.type === 'cites').map((e) => e.from),
  );

  const warnings: ProvenanceWarning[] = [];
  for (const claim of claims) {
    const incoming = graph.edges.filter((e) => e.to === claim.id);
    const isNecessary =
      incoming.some((e) => e.force === 'necessary') ||
      graph.edges.some((e) => e.from === claim.id && e.force === 'necessary');
    if (isNecessary && !citesFrom.has(claim.id) && !graph.edges.some((e) => e.from === claim.id && e.type === 'cites')) {
      warnings.push({
        claimId: claim.id,
        message: `necessary claim "${claim.label}" has no cites edge`,
      });
    }
  }
  return warnings;
}