type ThesisProps = {
  x: string;
  k?: string;
};

export function Thesis({ x, k }: ThesisProps) {
  return (
    <div
      data-figure="FIG.04"
      style={{
        borderLeft: '3px solid var(--signal)',
        padding: '2px 0 2px 20px',
        margin: '8px 0 20px',
      }}
    >
      {k ? (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--signal)',
            marginBottom: 9,
          }}
        >
          {k}
        </div>
      ) : null}
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 21,
          lineHeight: 1.28,
          letterSpacing: '-0.015em',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {x}
      </p>
    </div>
  );
}