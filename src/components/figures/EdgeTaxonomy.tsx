type EdgeTaxonomyProps = {
  rows?: { type: string; force: string }[];
};

const DEFAULT_TYPES = [
  { label: 'causal', def: 'A drives B' },
  { label: 'enabling', def: 'A makes B possible' },
  { label: 'constraining', def: 'A limits B' },
];

const DEFAULT_FORCES = [
  { label: 'necessary', solid: true },
  { label: 'typical', solid: true },
  { label: 'speculative', solid: false },
];

/** FIG.08 — two-tier edge type + force chips from the widget registry. */
export function EdgeTaxonomy({ rows }: EdgeTaxonomyProps) {
  const types =
    rows?.map((r) => ({ label: r.type, def: r.force })) ?? DEFAULT_TYPES;
  const forces = DEFAULT_FORCES;

  return (
    <figure data-figure="FIG.08" style={{ margin: '18px 0 22px' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--kicker)',
          marginBottom: 10,
        }}
      >
        edge type
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {types.map((t) => (
          <span
            key={t.label}
            title={t.def}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.04em',
              color: 'var(--ink)',
              background: 'var(--paper-2)',
              border: '1px solid var(--line-soft)',
              borderRadius: 3,
              padding: '5px 10px',
            }}
          >
            {t.label} · {t.def}
          </span>
        ))}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--kicker)',
          marginBottom: 10,
        }}
      >
        edge force
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {forces.map((f) => (
          <span
            key={f.label}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: f.solid ? '#fff' : 'var(--signal)',
              background: f.solid ? 'var(--signal)' : 'transparent',
              border: f.solid ? 'none' : '1px dashed var(--signal)',
              borderRadius: 999,
              padding: '4px 11px',
            }}
          >
            {f.label}
          </span>
        ))}
      </div>
    </figure>
  );
}