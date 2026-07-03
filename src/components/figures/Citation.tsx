import type { CitationData } from '../../lib/citation';
import type { FootnoteEntry } from '../../lib/footnotes';

type Props = CitationData & { claim?: string };

/** Warm superscript at the claim — distinct from blue backlinks. */
export function FootnoteMarker({ n }: { n: number }) {
  return (
    <sup
      data-node="citation"
      data-citation-placement="inline"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--read-owned)',
        verticalAlign: 'super',
        lineHeight: 0,
        marginLeft: 1,
      }}
    >
      {n}
    </sup>
  );
}

/** Section footnotes collected from [Author Year] tokens in prose. */
export function SectionFootnotes({ entries }: { entries: FootnoteEntry[] }) {
  if (!entries.length) return null;
  return (
    <div
      data-node="citation"
      data-citation-placement="footnotes"
      style={{ marginTop: 26, paddingTop: 13, borderTop: '1px solid #EFEBE2' }}
    >
      {entries.map(({ n, source }) => (
        <div
          key={`${n}-${source.id}`}
          style={{ display: 'flex', gap: 11, alignItems: 'baseline', marginBottom: 10 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--read-owned)',
              flex: 'none',
            }}
          >
            {n}
          </span>
          <span className="prose-sm">
            <b style={{ color: 'var(--prose-color)', fontWeight: 600 }}>{source.author}</b>
            {source.year ? ` (${source.year}).` : '.'}{' '}
            <i>{source.title}</i>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Edge placement — cites relation to warm external node (spec demo / rare in essays). */
export function Citation({ placement, source, claim }: Props) {
  if (placement !== 'edge') return null;

  const label = `${source.author}${source.year ? ` ${source.year}` : ''}`;

  return (
    <div
      data-node="citation"
      data-citation-placement="edge"
      style={{ margin: '18px 0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          fontSize: 15,
          color: 'var(--ink)',
          background: '#fff',
          border: '1px solid #D6CFC2',
          borderRadius: 6,
          padding: '11px 15px',
        }}
      >
        &ldquo;{claim ?? 'the claim'}&rdquo;
      </span>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0 7px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: '#8A8275',
          }}
        >
          cites
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#8A8275' }}>→</span>
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 15,
          color: '#7a5a48',
          border: '1px dashed #c98a5e',
          borderRadius: 6,
          padding: '11px 15px',
        }}
      >
        {label}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8.5,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#b08a6e',
            verticalAlign: 'super',
            marginLeft: 5,
          }}
        >
          ext
        </span>
      </span>
    </div>
  );
}

type LedgerProps = { items: CitationData[] };

/** Sources bibliography (spec 05 · ledger). */
export function SourcesLedger({ items }: LedgerProps) {
  return (
    <div data-node="citation" data-citation-placement="ledger" style={{ margin: '22px 0 26px' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          marginBottom: 6,
        }}
      >
        Sources
      </div>
      {items.map((item, i) => (
        <div
          key={item.sourceId}
          style={{
            display: 'grid',
            gridTemplateColumns: '20px 1fr',
            gap: 11,
            alignItems: 'baseline',
            padding: '11px 0',
            borderTop: '1px solid #EFEBE2',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--read-owned)' }}>
            {i + 1}
          </span>
          <div className="prose-inset">
            <b style={{ color: 'var(--prose-color)', fontWeight: 600 }}>{item.source.author}</b>
            {item.source.year ? ` (${item.source.year}).` : '.'} {item.source.title}.
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: '#A39B8C',
                marginLeft: 9,
              }}
            >
              {item.source.kind}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}