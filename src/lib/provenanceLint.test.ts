import { describe, expect, it } from 'vitest';
import { buildCitationFieldGraph, extractCitationsFromText } from './citation';
import { provenanceWarnings } from './provenanceLint';
import type { FieldGraph } from './fieldSchema';

describe('provenanceWarnings', () => {
  it('warns when a necessary claim has no cites edge', () => {
    const graph: FieldGraph = {
      nodes: [
        { id: 'claim:0', kind: 'claim', label: 'ungrounded claim' },
        { id: 'other', kind: 'concept', label: 'support' },
      ],
      edges: [
        { from: 'other', to: 'claim:0', type: 'causal', force: 'necessary' },
      ],
      interiors: {},
      boundary: { corpus: true },
    };
    const warnings = provenanceWarnings(graph);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.claimId).toBe('claim:0');
  });

  it('is silent when claim has cites edge', () => {
    const cites = extractCitationsFromText('[Rozenblit & Keil 1998]');
    const graph = buildCitationFieldGraph('essay', cites)!;
    expect(provenanceWarnings(graph)).toHaveLength(0);
  });
});