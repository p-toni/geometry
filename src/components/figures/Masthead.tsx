import { kindLabel } from '../../lib/glyph';
import type { Cluster, NodeKind } from '../../pool/types';
import { mono } from './styles';

type MastheadProps = {
  kind: NodeKind;
  title: string;
  date: string;
  cluster: Cluster;
  dek?: string;
};

export function Masthead({ kind, title, date, cluster, dek }: MastheadProps) {
  return (
    <header
      data-figure="FIG.01"
      style={{
        marginBottom: 28,
        paddingBottom: 22,
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div
        style={{
          ...mono,
          fontSize: 11,
          letterSpacing: '0.14em',
          color: 'var(--read-accent)',
        }}
      >
        {kindLabel(kind)}
      </div>
      <h1
        className="type-display"
        style={{
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: '-0.025em',
          lineHeight: 1.08,
          margin: '10px 0 0',
          color: 'var(--ink)',
        }}
      >
        {title}
      </h1>
      {dek ? (
        <p className="prose-lead" style={{ margin: '12px 0 0', maxWidth: '42em' }}>
          {dek}
        </p>
      ) : null}
      <div
        style={{
          ...mono,
          fontSize: 10,
          color: 'var(--kicker)',
          marginTop: 11,
        }}
      >
        {date} · {cluster}
      </div>
    </header>
  );
}