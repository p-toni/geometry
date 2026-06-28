import { useEffect, useRef } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FigureReader } from '../components/figures';
import { Masthead } from '../components/figures/Masthead';
import { neighbors } from '../lib/graph';
import { isWholePiece } from '../lib/readMode';
import type { Pool, PoolNode } from '../pool';

type ReadPanelProps = {
  node: PoolNode;
  pool: Pool;
  historyTitle: string | null;
  full: boolean;
  onBack: () => void;
  /** Dismiss read panel and return to the whole field. */
  onClose: () => void;
  onOpen: (id: string) => void;
  onOpenNode: (id: string) => void;
  onToggleFull: (full: boolean) => void;
  onDescend: (origin: { x: number; y: number }) => void;
  canDescend: boolean;
  descending?: boolean;
  scrollToSection?: string | null;
  onScrolledToSection?: () => void;
};

function neighborDot(kind: PoolNode['kind']) {
  const color =
    kind === 'project' || kind === 'doc'
      ? 'var(--read-accent)'
      : kind === 'link' || kind === 'about'
        ? '#5b6b73'
        : 'var(--ink)';
  return { width: 6, height: 6, borderRadius: '50%', background: color, flex: 'none' as const };
}

export function ReadPanel({
  node,
  pool,
  historyTitle,
  full,
  onBack,
  onClose,
  onOpen,
  onOpenNode,
  onToggleFull,
  onDescend,
  canDescend,
  descending = false,
  scrollToSection,
  onScrolledToSection,
}: ReadPanelProps) {
  const next = neighbors(pool, node.id);
  const wholePiece = isWholePiece(node);
  const hasFull = node.body.length > 0;
  const showFullBody = wholePiece ? hasFull : full && hasFull;
  const dek = node.excerpt[0];
  const excerptTail = dek ? node.excerpt.slice(1) : node.excerpt;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
  }, [node.id]);

  useEffect(() => {
    if (!scrollToSection || !showFullBody) return;
    const root = scrollRef.current;
    if (!root) return;
    const target = root.querySelector(`[data-section="${scrollToSection}"]`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onScrolledToSection?.();
    }
  }, [scrollToSection, showFullBody, onScrolledToSection, node.id]);

  return (
    <aside
      className={`field-read field-read-sheet edge-emphasis${showFullBody && !wholePiece ? ' field-read--full' : ''}${descending ? ' field-read--descending' : ''}`}
      style={{
        background: 'var(--card)',
        boxShadow: '-18px 0 48px rgba(28,31,36,.16)',
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
            border: '1px solid var(--line)',
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
          {historyTitle ? `${historyTitle} · ` : null}
          {node.title}
        </span>
        <div style={{ flex: 1 }} />
        {full && !wholePiece ? (
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
              border: '1px solid var(--line)',
              borderRadius: 3,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            ⤡ collapse
          </button>
        ) : null}
        <button
          type="button"
          className="pressable pressable--ghost"
          onClick={onClose}
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
        ref={scrollRef}
        data-testid="read-panel-scroll"
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
          dek={showFullBody && !wholePiece ? undefined : dek}
        />

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

        <div className={showFullBody ? undefined : 'field-prose'} style={{ marginTop: 22 }}>
          {!showFullBody && excerptTail.length > 0
            ? excerptTail.map((p) => (
                <p key={p}>{p}</p>
              ))
            : null}

          {hasFull && !showFullBody ? (
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
                color: 'var(--read-accent-deep)',
                background: 'var(--read-accent-tint)',
                border: '1px solid var(--read-accent-border)',
                borderRadius: 3,
                padding: '10px 15px',
                cursor: 'pointer',
              }}
            >
              ▤ read full →
            </button>
          ) : null}

          {showFullBody ? (
            <div data-testid="read-full-body">
              <ErrorBoundary>
                <FigureReader blocks={node.body} onOpenNode={onOpenNode} />
              </ErrorBoundary>
            </div>
          ) : null}
        </div>

        {canDescend ? (
          <>
            <button
              type="button"
              className="pressable"
              data-testid="constellation-descend"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                onDescend({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
              style={{
                marginTop: 28,
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
          </>
        ) : null}

        {next.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: canDescend ? 20 : 26 }}>
              {next.map(({ id }) => {
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
                          fontFamily: 'var(--font-body)',
                          fontWeight: 500,
                          fontSize: 14,
                          color: 'var(--ink)',
                        }}
                      >
                        {n.title}
                      </span>
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