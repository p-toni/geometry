/** FIG.07 — geometry vs retrieval diagnostic grid (prototype-hardcoded). */
export function DiagnosticTable() {
  const cols = ['test', 'geometry', 'retrieval'];
  const rows = [
    ['Rephrase', 'invariant survives', 'surface breaks'],
    ['Rebuild', 'structure regenerates', 'fragments only'],
    ['Predict', 'specific expectations', 'no expectations'],
    ['Break', 'damage localizes to an edge', 'whole picture destabilizes'],
  ];

  return (
    <div
      data-figure="FIG.07"
      data-testid="diagnostic-table"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        border: '1px solid #E8E2D8',
        borderRadius: 4,
        overflow: 'hidden',
        margin: '8px 0 20px',
      }}
    >
      {cols.map((h, i) => (
        <div
          key={h}
          style={{
            padding: '11px 14px',
            background: i === 1 ? '#eef2fd' : '#F4F1EA',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: i === 1 ? 'var(--signal)' : i === 0 ? 'var(--muted)' : 'var(--kicker)',
            borderLeft: i ? '1px solid #E8E2D8' : undefined,
          }}
        >
          {h}
        </div>
      ))}
      {rows.flatMap((row, ri) =>
        row.map((cell, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid #F2EDE6',
              borderLeft: ci ? '1px solid #E8E2D8' : undefined,
              fontFamily: ci === 0 ? 'var(--font-ui)' : 'var(--font-body)',
              fontWeight: ci === 0 ? 600 : 400,
              fontSize: 13,
              color: ci === 1 ? '#1C1F24' : ci === 2 ? '#9aa39c' : '#1C1F24',
              background: ci === 1 ? '#FAF8F4' : undefined,
            }}
          >
            {cell}
          </div>
        )),
      )}
    </div>
  );
}