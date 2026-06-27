const STEPS = [
  { n: '01', title: 'Scout', body: 'model allowed — framings, counterexamples, failure modes.' },
  { n: '02', title: 'Close', body: 'no model, no notes. the source is shut.' },
  { n: '03', title: 'Rebuild', body: 'redraw the graph from inside your own head.' },
  { n: '04', title: 'Test', body: 'rephrase + predict + break + relax.' },
];

/** FIG.09 — 2×2 protocol grid from the v2 prototype. */
export function ProtocolStepper() {
  return (
    <div
      data-figure="FIG.09"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        margin: '8px 0 20px',
      }}
    >
      {STEPS.map((s) => (
        <div
          key={s.n}
          style={{
            background: '#fcfcfb',
            border: '1px solid #e4e7e3',
            borderTop: '3px solid var(--signal)',
            borderRadius: 3,
            padding: 13,
            boxShadow: '0 2px 8px rgba(20,23,26,.06)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--signal)',
            }}
          >
            {s.n}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              margin: '5px 0 3px',
            }}
          >
            {s.title}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              lineHeight: 1.45,
              color: '#6f7872',
              margin: 0,
            }}
          >
            {s.body}
          </p>
        </div>
      ))}
    </div>
  );
}