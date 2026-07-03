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
      className="figure-registry"
    >
      <div className="figure-registry__kicker">FIG.09 · source-closed protocol</div>
      <div className="figure-registry__body protocol-stepper">
      {STEPS.map((s) => (
        <div
          key={s.n}
          className="protocol-stepper__card"
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--read-accent)',
            }}
          >
            {s.n}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: '-0.01em',
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
              color: 'var(--muted)',
              margin: 0,
            }}
          >
            {s.body}
          </p>
        </div>
      ))}
      </div>
    </div>
  );
}
