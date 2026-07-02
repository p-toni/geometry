import { renderInlineMarkdown } from '../../lib/inlineMarkdown';
import { body as proseBody } from './styles';

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
      className="sidenote-figure"
    >
      {body ? (
        <p style={{ ...proseBody, margin: 0 }}>
          {renderInlineMarkdown(body)}
          <sup
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--read-accent)',
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
        className="sidenote-figure__note"
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
            color: 'var(--read-accent)',
            marginBottom: 6,
          }}
        >
          {anchor}
        </div>
        <p className="prose-sm" style={{ margin: 0 }}>
          {renderInlineMarkdown(x)}
        </p>
      </div>
    </aside>
  );
}
