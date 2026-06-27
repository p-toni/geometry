const STEPS = [
  {
    n: '01',
    title: 'Scout',
    body: 'model allowed — ask for framings, counterexamples, failure modes.',
  },
  { n: '02', title: 'Close', body: 'no model, no notes. the source is shut.' },
  { n: '03', title: 'Rebuild', body: 'redraw the graph from scratch, from inside your own head.' },
  { n: '04', title: 'Test', body: 'rephrase + predict + break + relax. did it survive?' },
];

/** FIG.09 — 2×2 protocol grid from the v2 prototype. */
export function ProtocolStepper() {
  return (
    <div
      data-figure="FIG.09"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 12,
        margin: '8px 0 20px',
      }}
    >
      {STEPS.map((s) => (
        <div
          key={s.n}
          style={{
            background: 'var(--card)',
            border: '1px solid #E8E2D8',
            borderTop: '3px solid var(--signal)',
            borderRadius: 3,
            padding: '15px 14px',
            boxShadow: '0 2px 8px rgba(28,31,36,.06)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--signal)',
            }}
          >
            {s.n}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              margin: '7px 0 4px',
            }}
          >
            {s.title}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12.5,
              lineHeight: 1.45,
              color: '#6B7280',
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