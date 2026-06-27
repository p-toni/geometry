import { ErrorBoundary } from '../components/ErrorBoundary';
import { FigureReader } from '../components/figures';
import { Masthead } from '../components/figures/Masthead';
import { neighbors } from '../lib/graph';
import type { Cluster, Pool, PoolNode } from '../pool';
import { Spin } from '../components/Spin';

type ReadPanelProps = {
  node: PoolNode;
  pool: Pool;
  historyTitle: string | null;
  reading: boolean;
  full: boolean;
  onBack: () => void;
  onOpen: (id: string) => void;
  onOpenNode: (id: string) => void;
  onToggleFull: (full: boolean) => void;
  onDescend: () => void;
  canDescend: boolean;
};

function neighborDot(kind: PoolNode['kind']) {
  const color =
    kind === 'project' || kind === 'doc'
      ? 'var(--signal)'
      : kind === 'link' || kind === 'about'
        ? '#5b6b73'
        : 'var(--ink)';
  return { width: 6, height: 6, borderRadius: '50%', background: color, flex: 'none' as const };
}

function SourceLine({ cluster, id }: { cluster: Cluster; id: string }) {
  return (
    <div
      data-testid="read-source-line"
      style={{
        marginTop: 18,
        paddingTop: 13,
        borderTop: '2px solid var(--line-soft)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.04em',
        color: 'var(--kicker)',
      }}
    >
      ⌁ source · content/{cluster}/{id}.md
    </div>
  );
}

export function ReadPanel({
  node,
  pool,
  historyTitle,
  reading,
  full,
  onBack,
  onOpen,
  onOpenNode,
  onToggleFull,
  onDescend,
  canDescend,
}: ReadPanelProps) {
  const next = neighbors(pool, node.id);
  const hasFull = node.body.length > 0;
  const dek = node.excerpt[0];
  const excerptTail = dek ? node.excerpt.slice(1) : node.excerpt;

  return (
    <aside
      className={`field-read edge-emphasis${full ? ' field-read--full' : ''}${reading ? ' field-read--enter' : ''}`}
      style={{
        background: 'var(--card)',
        boxShadow: '-18px 0 48px rgba(20,23,26,.16)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '14px 22px',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <button
          type="button"
          className="pressable"
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            background: 'var(--card)',
            border: '1px solid #cfd4cf',
            borderRadius: 3,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          ← back
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--kicker)',
          }}
        >
          {historyTitle ? `⟵ ${historyTitle} › ` : 'field › '}
          {node.title}
        </span>
        <div style={{ flex: 1 }} />
        {full ? (
          <button
            type="button"
            className="pressable"
            onClick={() => onToggleFull(false)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              background: 'var(--card)',
              border: '1px solid #cfd4cf',
              borderRadius: 3,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            ⤡ collapse
          </button>
        ) : null}
        {reading ? <Spin verb="plot" /> : null}
        <button
          type="button"
          className="pressable pressable--ghost"
          onClick={onBack}
          aria-label="Close"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            color: 'var(--kicker)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </header>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '26px 28px calc(36px + var(--status-h))',
        }}
      >
        <Masthead
          kind={node.kind}
          title={node.title}
          date={node.date}
          cluster={node.cluster}
          dek={full ? undefined : dek}
        />

        {node.media ? (
          <div
            style={{
              marginTop: 22,
              height: 220,
              border: '1px solid #cfd4cf',
              borderRadius: 3,
              background:
                'repeating-linear-gradient(135deg,#dfe3df,#dfe3df 8px,#e9ece8 8px,#e9ece8 16px)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 13,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#7d867f',
              }}
            >
              {node.kind} block · drop a render here
            </span>
          </div>
        ) : null}

        {node.kind === 'link' && node.href ? (
          <a
            href={node.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              marginTop: 22,
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'var(--ink)',
              borderRadius: 3,
              padding: '11px 16px',
              textDecoration: 'none',
            }}
          >
            visit {node.title} ↗
          </a>
        ) : null}

        <div style={{ marginTop: 22 }}>
          {!full && excerptTail.length > 0
            ? excerptTail.map((p) => (
                <p
                  key={p}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 16,
                    lineHeight: 1.62,
                    color: '#2c333a',
                    margin: '0 0 16px',
                  }}
                >
                  {p}
                </p>
              ))
            : null}

          {hasFull && !full ? (
            <button
              type="button"
              className="pressable"
              onClick={() => onToggleFull(true)}
              style={{
                marginTop: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--signal)',
                background: '#f4f6fd',
                border: '1px solid #d4dbf2',
                borderRadius: 3,
                padding: '10px 15px',
                cursor: 'pointer',
              }}
            >
              ▤ read full →
            </button>
          ) : null}

          {hasFull && full ? (
            <div data-testid="read-full-body">
              <ErrorBoundary>
                <FigureReader blocks={node.body} onOpenNode={onOpenNode} />
              </ErrorBoundary>
            </div>
          ) : null}
        </div>

        <SourceLine cluster={node.cluster} id={node.id} />

        {canDescend ? (
          <>
            <button
              type="button"
              className="pressable"
              data-testid="constellation-descend"
              onClick={onDescend}
              style={{
                marginTop: 16,
                width: '100%',
                scrollMarginBottom: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#fff',
                background: 'var(--ink)',
                border: 'none',
                borderRadius: 3,
                padding: '13px 16px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 13 }}>✦</span> enter its constellation →
            </button>
            <p
              style={{
                marginTop: 7,
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--kicker)',
                textAlign: 'center',
              }}
            >
              descend into the argument&apos;s internal shape
            </p>
          </>
        ) : null}

        {next.length > 0 ? (
          <>
            <div
              style={{
                marginTop: 26,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              walk the edges
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 11 }}>
              {next.map(({ id, rel }) => {
                const n = pool.nodes[id];
                if (!n) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpen(id)}
                    className="pressable edge-continues"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '12px 13px',
                      background: 'var(--card)',
                      border: '1px solid var(--line-soft)',
                      borderRadius: 3,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={neighborDot(n.kind)} />
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 500,
                          fontSize: 14,
                          color: 'var(--ink)',
                        }}
                      >
                        {n.title}
                      </span>
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--kicker)',
                      }}
                    >
                      {rel} →
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}