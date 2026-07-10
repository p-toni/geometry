import { lazy, Suspense, useEffect, useRef } from 'react';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { FigureReader } from '../components/figures';
import { Masthead } from '../components/figures/Masthead';
import { neighbors } from '../lib/graph';
import { isWholePiece } from '../lib/readMode';
import type { Pool, PoolNode } from '../pool';
import { useSheetGesture } from './hooks/useSheetGesture';

const SeaShader = lazy(() =>
  import('./SeaShader').then((module) => ({ default: module.SeaShader })),
);
const SharpPointCloud = lazy(() =>
  import('./SharpPointCloud').then((module) => ({ default: module.SharpPointCloud })),
);

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

function MediaLoading({ label }: { label: string }) {
  return <div className="media-artifact__mark">{label}</div>;
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
  const isMediaNode = node.media === true;
  const wholePiece = isWholePiece(node);
  const hasFull = !isMediaNode && node.body.length > 0;
  const showFullBody = wholePiece ? hasFull : full && hasFull;
  const dek = node.excerpt[0];
  const excerptTail = dek ? node.excerpt.slice(1) : node.excerpt;
  const mediaSentence = node.body.find((block) => block.t === 'p')?.x ?? dek;
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerScrolled = useRef(false);

  const sheet = useSheetGesture({
    enabled: !descending,
    onDismiss: onClose,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    el.classList.remove('is-scrolled');
    headerScrolled.current = false;
  }, [node.id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolled = el.scrollTop > 4;
      if (scrolled === headerScrolled.current) return;
      headerScrolled.current = scrolled;
      el.classList.toggle('is-scrolled', scrolled);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
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
      ref={(el) => {
        sheet.sheetRef.current = el;
      }}
      className={[
        'field-read',
        'field-read-sheet',
        'edge-emphasis',
        showFullBody && !wholePiece ? 'field-read--full' : '',
        descending ? 'field-read--descending' : '',
        sheet.dragging ? 'field-read--dragging' : '',
        sheet.gestureActive ? 'field-read--sheet-gesture' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: 'var(--card)',
        boxShadow: '-18px 0 48px rgba(28,31,36,.16)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {sheet.gestureActive ? (
        <div
          className="field-read-handle"
          data-testid="read-sheet-handle"
          aria-label="Drag to dismiss"
          {...sheet.handleProps}
        >
          <span className="field-read-handle__pill" aria-hidden />
        </div>
      ) : null}

      <header
        className="field-read-header"
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '14px 22px',
        }}
      >
        <button
          type="button"
          className="pressable field-panel-action"
          aria-label="← back"
          onClick={onBack}
        >
          <span className="field-panel-action__icon" aria-hidden>←</span>
          back
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
            className="pressable field-panel-action"
            onClick={() => onToggleFull(false)}
          >
            <span className="field-panel-action__icon" aria-hidden>⤡</span>
            collapse
          </button>
        ) : null}
        <button
          type="button"
          className="pressable pressable--ghost field-icon-button field-close-button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <span className="field-icon-button__glyph" aria-hidden>×</span>
        </button>
      </header>

      <div
        ref={scrollRef}
        data-testid="read-panel-scroll"
        className="field-read-scroll"
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

        {isMediaNode ? (
          <div className="media-readout">
            {node.id === 'sea' ? (
              <figure className="media-artifact media-artifact--sea" aria-label="sea shader">
                <Suspense fallback={<MediaLoading label="loading sea" />}>
                  <SeaShader />
                </Suspense>
                <figcaption>Moonlit Ripple · WebGL study recovered from geometry v1</figcaption>
              </figure>
            ) : node.id === 'point-cloud' ? (
              <figure className="media-artifact media-artifact--sharp" aria-label="point-cloud sharp">
                <Suspense fallback={<MediaLoading label="loading sharp" />}>
                  <SharpPointCloud />
                </Suspense>
                <figcaption>sharp · SPLT point-cloud study recovered from geometry v1</figcaption>
              </figure>
            ) : (
              <figure className="media-artifact media-artifact--pending" aria-label={`${node.title} visual`}>
                <div className="media-artifact__mark">{node.kind}</div>
                <figcaption>{node.title} · visual study</figcaption>
              </figure>
            )}
            {mediaSentence ? <p className="media-readout__sentence">{mediaSentence}</p> : null}
          </div>
        ) : null}

        {!isMediaNode ? (
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
        ) : null}

        {canDescend ? (
          <button
            type="button"
            className="pressable"
            data-testid="constellation-descend"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onDescend({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
            }}
            style={{
              marginTop: showFullBody ? 28 : 12,
              scrollMarginBottom: 56,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: 0,
              border: 'none',
              background: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--read-accent-deep)',
              cursor: 'pointer',
            }}
          >
            ✦ see the argument →
          </button>
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
