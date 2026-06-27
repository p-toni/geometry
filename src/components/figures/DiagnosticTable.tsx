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
        border: '1px solid #e4e7e3',
        borderRadius: 4,
        overflow: 'hidden',
        margin: '8px 0 20px',
      }}
    >
      {cols.map((h, i) => (
        <div
          key={h}
          style={{
            padding: '9px 12px',
            background: i === 1 ? '#eef2fd' : '#f6f7f4',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: i === 1 ? 'var(--signal)' : i === 0 ? 'var(--muted)' : 'var(--kicker)',
            borderLeft: i ? '1px solid #e4e7e3' : undefined,
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
              padding: '10px 12px',
              borderTop: '1px solid #eef0ec',
              borderLeft: ci ? '1px solid #e4e7e3' : undefined,
              fontFamily: 'var(--font-body)',
              fontWeight: ci === 0 ? 600 : 400,
              fontSize: 12,
              color: ci === 1 ? 'var(--ink)' : ci === 2 ? 'var(--kicker)' : 'var(--ink)',
              background: ci === 1 ? '#fbfcff' : undefined,
            }}
          >
            {cell}
          </div>
        )),
      )}
    </div>
  );
}