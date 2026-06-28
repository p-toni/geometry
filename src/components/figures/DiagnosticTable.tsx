import { Contrast } from './Contrast';

/** FIG.07 — geometry vs retrieval diagnostic grid (contrast table mode). */
export function DiagnosticTable() {
  return (
    <Contrast
      mode="table"
      poles={['geometry', 'retrieval']}
      ownedPole={0}
      axisLabel="test"
      rows={[
        { label: 'Rephrase', a: 'invariant survives', b: 'surface breaks' },
        { label: 'Rebuild', a: 'structure regenerates', b: 'fragments only' },
        { label: 'Predict', a: 'specific expectations', b: 'no expectations' },
        { label: 'Break', a: 'damage localizes to an edge', b: 'whole picture destabilizes' },
      ]}
    />
  );
}