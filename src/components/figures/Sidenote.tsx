import { renderInlineMarkdown } from '../../lib/inlineMarkdown';

type SidenoteProps = {
  anchor: string;
  x: string;
  /** Main paragraph shown beside the marginalia (registry two-column layout). */
  body?: string;
};

export function Sidenote({ anchor, x, body }: SidenoteProps) {
  return (
    <aside
      data-figure="FIG.03"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 210px',
        gap: 24,
        margin: '18px 0',
        alignItems: 'start',
      }}
    >
      {body ? (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            lineHeight: 1.62,
            color: '#2c333a',
            margin: 0,
          }}
        >
          {renderInlineMarkdown(body)}
          <sup
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--signal)',
              marginLeft: 2,
            }}
          >
            {anchor}
          </sup>
        </p>
      ) : (
        <div aria-hidden style={{ minHeight: 1 }} />
      )}
      <div
        style={{
          borderLeft: '2px solid #D5CEC3',
          padding: '2px 0 2px 13px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.1em',
            color: 'var(--signal)',
            marginBottom: 6,
          }}
        >
          {anchor}
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12.5,
            lineHeight: 1.5,
            margin: 0,
            color: '#6B7280',
          }}
        >
          {renderInlineMarkdown(x)}
        </p>
      </div>
    </aside>
  );
}