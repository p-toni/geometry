import { renderInlineMarkdown } from '../../lib/inlineMarkdown';

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
        padding: '4px 0 4px 22px',
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
            marginBottom: 10,
          }}
        >
          {k}
        </div>
      ) : null}
      <p
        className="type-display"
        style={{
          fontWeight: 600,
          fontSize: 26,
          lineHeight: 1.22,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {renderInlineMarkdown(x)}
      </p>
    </div>
  );
}