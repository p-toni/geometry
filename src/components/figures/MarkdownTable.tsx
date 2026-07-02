import { renderInlineMarkdown } from '../../lib/inlineMarkdown';
import { registry } from './styles';

type Props = {
  headers: string[];
  rows: string[][];
};

/** Generic markdown table — registry grid styling. */
export function MarkdownTable({ headers, rows }: Props) {
  const cols = headers.length || Math.max(0, ...rows.map((r) => r.length));
  const gridCols = `repeat(${cols}, 1fr)`;

  return (
    <div
      data-figure="table"
      data-testid="markdown-table"
      className="figure-registry markdown-table-wrap"
    >
      <div className="figure-registry__kicker">Table · diagnostic grid</div>
      <div
        className="markdown-table-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
        }}
      >
      {headers.map((h, i) => (
        <div
          key={`h-${i}`}
          style={{
            padding: '11px 14px',
            background: i === 0 ? registry.paper2 : registry.paper2,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: i === 0 ? 'var(--muted)' : 'var(--kicker)',
            borderLeft: i ? `1px solid ${registry.lineSoft}` : undefined,
          }}
        >
          {renderInlineMarkdown(h)}
        </div>
      ))}
      {rows.flatMap((row, ri) =>
        row.map((cell, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{
              padding: '12px 14px',
              borderTop: `1px solid ${registry.lineHair}`,
              borderLeft: ci ? `1px solid ${registry.lineSoft}` : undefined,
              fontFamily: ci === 0 ? 'var(--font-ui)' : 'var(--font-body)',
              fontWeight: ci === 0 ? 600 : 400,
              fontSize: 13,
              color: registry.ink,
              background: ci === 0 ? registry.paper : undefined,
            }}
          >
            {renderInlineMarkdown(cell)}
          </div>
        )),
      )}
      </div>
    </div>
  );
}
