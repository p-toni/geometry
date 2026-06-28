type EdgeTaxonomyProps = {
  rows?: { type: string; force: string }[];
};

const DEFAULT_TYPES = [
  'causal · A drives B',
  'constraint · A limits B',
  'tradeoff · more A, less B',
  'dependency · B needs A',
];

const DEFAULT_FORCES: { label: string; tier: 'necessary' | 'likely' | 'bridge' | 'speculative' }[] = [
  { label: 'necessary', tier: 'necessary' },
  { label: 'likely', tier: 'likely' },
  { label: 'working bridge', tier: 'bridge' },
  { label: 'speculative', tier: 'speculative' },
];

function forceStyle(tier: (typeof DEFAULT_FORCES)[number]['tier']) {
  switch (tier) {
    case 'necessary':
      return {
        color: '#fff',
        background: 'var(--read-accent)',
        border: 'none',
      };
    case 'likely':
      return {
        color: 'var(--read-accent-deep)',
        background: 'var(--read-accent-tint)',
        border: '1px solid var(--read-accent-border)',
      };
    case 'bridge':
      return {
        color: '#6B7280',
        background: '#F4F1EA',
        border: '1px solid #D5CEC3',
      };
    case 'speculative':
      return {
        color: '#9aa39c',
        background: '#fff',
        border: '1px dashed #b9c0c6',
      };
  }
}

/** FIG.08 — registry SoT edge type + force chips. */
export function EdgeTaxonomy({ rows }: EdgeTaxonomyProps) {
  const types = rows?.map((r) => `${r.type} · ${r.force}`) ?? DEFAULT_TYPES;

  return (
    <figure data-figure="FIG.08" style={{ margin: '18px 0 22px' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#6B7280',
          marginBottom: 11,
        }}
      >
        edge type
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 20 }}>
        {types.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: '#1C1F24',
              background: '#fff',
              border: '1px solid #D5CEC3',
              borderRadius: 4,
              padding: '7px 13px',
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#6B7280',
          marginBottom: 11,
        }}
      >
        edge force
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center' }}>
        {DEFAULT_FORCES.map((f) => (
          <span
            key={f.label}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              borderRadius: 999,
              padding: '6px 13px',
              ...forceStyle(f.tier),
            }}
          >
            {f.label}
          </span>
        ))}
      </div>
    </figure>
  );
}