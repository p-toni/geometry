import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin } from '../components/Spin';
import { uniqueEdges } from '../lib/graph';
import { activeChipForQuery, resolveLens } from '../lib/search';
import {
  parseFieldState,
  shouldSyncViewportToUrl,
  viewportMatchesUrl,
  writeFieldState,
} from '../lib/fieldUrl';
import { kindLabel } from '../lib/glyph';

import { pool, FIELD_HEIGHT, FIELD_WIDTH } from '../pool';
import type { Rel } from '../pool/types';
import { ConstellationDescent } from './ConstellationDescent';
import { loadEssayStructure } from './loadEssayStructure';
import type { EssayStructure } from '../pool/essayStructure';
import { getFieldMode, statusForMode } from './fieldState';
import { useFieldTransform } from './hooks/useFieldTransform';
import { nodeVisual } from './nodeVisual';
import { ReadPanel } from './ReadPanel';
import { terrainHeight } from './terrainHeight';

export function FieldApp() {
  const [params, setParams] = useSearchParams();
  const urlState = parseFieldState(params);
  const [lensInput, setLensInput] = useState(urlState.query);
  const [matched, setMatched] = useState<string[] | null>(
    urlState.query ? resolveLens(pool, urlState.query, pool.layout.lenses) : null,
  );
  const [history, setHistory] = useState<string[]>([]);
  const navInitiated = useRef(false);
  const [descent, setDescent] = useState<EssayStructure | null>(null);
  const [composing, setComposing] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(
    activeChipForQuery(urlState.query, pool.layout.lenses),
  );
  const [readingAnim, setReadingAnim] = useState(false);
  const [cascading, setCascading] = useState(false);

  const triggerCascade = useCallback(() => {
    setCascading(true);
    window.setTimeout(() => setCascading(false), 460);
  }, []);

  const field = useFieldTransform({
    x: urlState.x ?? undefined,
    y: urlState.y ?? undefined,
    z: urlState.z ?? undefined,
  });

  const readId = urlState.read;
  const readFull =
    urlState.full && Boolean(readId && (pool.nodes[readId ?? '']?.body.length ?? 0) > 0);
  const nowOn = urlState.now && !readId && !matched?.length;
  const lensActive = !!(urlState.query && matched && matched.length > 0 && !readId);

  const mode = getFieldMode({
    read: readId,
    query: urlState.query,
    matched,
    now: nowOn,
  });

  const pushUrl = useCallback(
    (patch: Partial<ReturnType<typeof parseFieldState>>, replace = false) => {
      navInitiated.current = true;
      const next = writeFieldState(
        {
          ...urlState,
          x: field.transform.x,
          y: field.transform.y,
          z: field.transform.z,
        },
        patch,
      );
      setParams(next, { replace });
    },
    [field.transform, setParams, urlState],
  );

  const skipViewportSync = useRef(true);
  const modeKey = `${params.get('read') ?? ''}|${params.get('q') ?? ''}|${params.get('now') ?? ''}|${params.get('full') ?? ''}`;
  const viewportKey = `${params.get('x') ?? ''}|${params.get('y') ?? ''}|${params.get('z') ?? ''}`;

  useEffect(() => {
    if (field.ready) return;
    skipViewportSync.current = true;
    const id = requestAnimationFrame(() => {
      if (urlState.x == null) {
        field.initField(false);
        if (readId && pool.layout.positions[readId]) {
          requestAnimationFrame(() => field.flyTo(pool.layout.positions[readId]!, false));
        }
      } else {
        field.setT(
          { x: urlState.x!, y: urlState.y!, z: urlState.z ?? 1 },
          false,
        );
      }
      window.setTimeout(() => {
        skipViewportSync.current = false;
      }, 100);
    });
    return () => cancelAnimationFrame(id);
  }, [field, readId, urlState.x, urlState.y, urlState.z]);

  useEffect(() => {
    const state = parseFieldState(params);
    setLensInput(state.query);
    setMatched(
      state.query ? resolveLens(pool, state.query, pool.layout.lenses) : null,
    );
    setActiveChip(activeChipForQuery(state.query, pool.layout.lenses));

    if (navInitiated.current) {
      navInitiated.current = false;
      return;
    }
    if (!state.read) {
      setHistory([]);
      return;
    }
    setHistory((h) => {
      if (h.length && h.at(-1) === state.read) return h.slice(0, -1);
      return h;
    });
  }, [modeKey, params]);

  useEffect(() => {
    if (!field.ready || skipViewportSync.current) return;
    const state = parseFieldState(params);
    if (state.x != null && state.y != null && state.z != null) {
      field.setT({ x: state.x, y: state.y, z: state.z }, false);
    } else if (state.read && pool.layout.positions[state.read]) {
      field.flyTo(pool.layout.positions[state.read]!, false);
    }
  }, [viewportKey, modeKey, field, params]);

  useEffect(() => {
    if (!field.ready || skipViewportSync.current) return;
    if (!shouldSyncViewportToUrl(urlState)) return;
    if (viewportMatchesUrl(field.transform, urlState)) return;

    const timeout = window.setTimeout(() => {
      const { x, y, z } = field.transform;
      const next = writeFieldState(urlState, {
        x: Math.round(x),
        y: Math.round(y),
        z: Number(z.toFixed(2)),
      });
      setParams(next, { replace: true });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [
    field.ready,
    field.transform,
    setParams,
    urlState,
  ]);

  const openNode = useCallback(
    (id: string) => {
      if (readId) setHistory((h) => [...h, readId].slice(-16));
      setDescent(null);
      setReadingAnim(true);
      window.setTimeout(() => setReadingAnim(false), 600);
      pushUrl({ read: id, query: '', now: false, full: false });
      setLensInput('');
      setMatched(null);
      setActiveChip(null);
      const pos = pool.layout.positions[id];
      if (pos) field.flyTo(pos, true);
    },
    [field, pushUrl, readId],
  );

  const onNodeClick = useCallback(
    (id: string) => {
      if (field.wasDragged()) return;
      openNode(id);
    },
    [field, openNode],
  );

  const home = useCallback(() => {
    triggerCascade();
    setHistory([]);
    setDescent(null);
    setLensInput('');
    setMatched(null);
    setActiveChip(null);
    pushUrl({ read: null, query: '', now: false, full: false });
    field.fitView();
  }, [field, pushUrl, triggerCascade]);

  const back = useCallback(() => {
    setDescent(null);
    if (readFull) {
      pushUrl({ full: false });
      return;
    }
    const prev = history.at(-1);
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      pushUrl({ read: prev, full: false });
      const pos = pool.layout.positions[prev];
      if (pos) field.flyTo(pos, true);
    } else {
      pushUrl({ read: null, full: false });
      field.fitView();
    }
  }, [field, history, pushUrl, readFull]);

  const runLens = useCallback(
    (q: string) => {
      if (!q.trim()) {
        pushUrl({ query: '', now: false, read: null });
        setMatched(null);
        setActiveChip(null);
        return;
      }
      setComposing(true);
      window.setTimeout(() => setComposing(false), 900);
      const ids = resolveLens(pool, q, pool.layout.lenses);
      setMatched(ids);
      pushUrl({ query: q, now: false, read: null });
      requestAnimationFrame(() => field.frameIds(ids, pool.layout.positions, true));
    },
    [field, pushUrl],
  );

  const pickChip = useCallback(
    (label: string, query: string, nodeIds: string[]) => {
      setActiveChip(label);
      setLensInput(query);
      setComposing(true);
      window.setTimeout(() => setComposing(false), 900);
      setMatched(nodeIds);
      pushUrl({ query, now: false, read: null });
      requestAnimationFrame(() => field.frameIds(nodeIds, pool.layout.positions, true));
    },
    [field, pushUrl],
  );

  const toggleNow = useCallback(() => {
    triggerCascade();
    setDescent(null);
    const next = !nowOn;
    pushUrl({ now: next, read: null, query: '' });
    setLensInput('');
    setMatched(null);
    setActiveChip(null);
  }, [nowOn, pushUrl, triggerCascade]);

  const readNode = readId ? pool.nodes[readId] : null;
  const neighborRels = useMemo(() => {
    const m: Record<string, Rel> = {};
    if (readNode) {
      for (const [id, rel] of readNode.links) m[id] = rel;
    }
    return m;
  }, [readNode]);

  const matchedSet = useMemo(() => new Set(matched ?? []), [matched]);
  const edges = useMemo(() => uniqueEdges(pool), []);

  const status = statusForMode(mode, pool, {
    read: readId,
    full: readFull,
    query: urlState.query,
    matched,
    composing,
    cascading,
    readingAnim,
  });

  const composeVerb = composing
    ? matched?.length
      ? 'index'
      : 'scatter'
    : 'survey';
  const footerVerb =
    composing && !readId ? composeVerb : status.verb;
  return (
    <div
      className="field-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--paper)',
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '13px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--card)',
        }}
      >
        <button
          type="button"
          onClick={home}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            whiteSpace: 'nowrap',
          }}
        >
          toni.ltd <span style={{ color: 'var(--signal)', fontSize: 15 }}>◈</span>
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runLens(lensInput);
          }}
          style={{
            flex: 1,
            maxWidth: 560,
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            background: 'var(--field)',
            border: `1.5px solid ${lensActive ? 'var(--signal)' : '#cfd4cf'}`,
            borderRadius: 4,
            padding: '9px 14px',
            boxShadow: 'inset 0 2px 8px rgba(20,23,26,.09)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--signal)' }}>
            ?
          </span>
          <input
            value={lensInput}
            onChange={(e) => setLensInput(e.target.value)}
            placeholder="ask the field — it lights up, it doesn't leave…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              color: 'var(--ink)',
            }}
          />
          {lensActive ? (
            <button
              type="button"
              onClick={() => {
                triggerCascade();
                setDescent(null);
                setLensInput('');
                setMatched(null);
                setActiveChip(null);
                pushUrl({ query: '' });
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                background: 'var(--card)',
                border: '1px solid #cfd4cf',
                borderRadius: 3,
                padding: '5px 8px',
                cursor: 'pointer',
              }}
            >
              clear ✕
            </button>
          ) : null}
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'var(--ink)',
              border: 'none',
              borderRadius: 3,
              padding: '7px 11px',
              cursor: 'pointer',
            }}
          >
            <Spin verb={composeVerb} style={{ color: 'inherit' }} />
            {lensActive ? 'lit' : 'ask'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {pool.layout.lenses.map((chip) => {
            const on = activeChip === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => pickChip(chip.label, chip.query, chip.nodeIds)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: on ? '#fff' : 'var(--ink-2)',
                  background: on ? 'var(--ink)' : 'var(--card)',
                  border: `1px solid ${on ? 'var(--ink)' : '#cfd4cf'}`,
                  borderRadius: 999,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={toggleNow}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: nowOn ? '#fff' : 'var(--muted)',
            background: nowOn ? 'var(--ink)' : 'var(--card)',
            border: `1px solid ${nowOn ? 'var(--ink)' : '#cfd4cf'}`,
            borderRadius: 3,
            padding: '8px 12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 12, lineHeight: 1 }}>◷</span> now
        </button>
      </header>

      <div style={{ position: 'relative', flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          ref={field.vpRef}
          onPointerDown={field.onPointerDown}
          onPointerMove={field.onPointerMove}
          onPointerUp={field.onPointerUp}
          onPointerLeave={field.onPointerUp}
          onWheel={field.onWheel}
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
            cursor: 'grab',
            background: 'var(--field)',
            touchAction: 'none',
          }}
        >
          <div
            className="field-grid"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 'var(--grid-opacity)',
              backgroundImage:
                'linear-gradient(to right,rgba(20,23,26,.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(20,23,26,.05) 1px,transparent 1px)',
              backgroundSize: '34px 34px',
            }}
          />

          <div
            ref={field.worldRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: FIELD_WIDTH,
              height: FIELD_HEIGHT,
              transformOrigin: '0 0',
              willChange: 'transform',
            }}
          >
            <svg
              viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
              preserveAspectRatio="none"
              style={{
                position: 'absolute',
                inset: 0,
                width: FIELD_WIDTH,
                height: FIELD_HEIGHT,
                overflow: 'visible',
              }}
            >
              {edges.map(([a, b]) => {
                const pa = pool.layout.positions[a];
                const pb = pool.layout.positions[b];
                if (!pa || !pb) return null;
                const live =
                  (readId && (a === readId || b === readId)) ||
                  (lensActive && matchedSet.has(a) && matchedSet.has(b));
                const dimmed = (readId || lensActive) && !live;
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={pa[0]}
                    y1={pa[1]}
                    x2={pb[0]}
                    y2={pb[1]}
                    stroke={live ? 'var(--signal)' : '#bcc3bd'}
                    strokeWidth={live ? 2 : 1.3}
                    opacity={dimmed ? 0.18 : live ? 0.9 : 0.7}
                  />
                );
              })}
            </svg>

            {pool.layout.regions.map((r) => (
              <div
                key={r.label}
                style={{
                  position: 'absolute',
                  left: r.x,
                  top: r.y,
                  transform: 'translate(-50%,-50%)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: r.accent ? 'var(--signal)' : '#aab2ad',
                  opacity: readId || lensActive || nowOn ? 0.3 : 0.55,
                  fontWeight: 700,
                  pointerEvents: 'none',
                  transition: 'opacity 0.4s ease',
                }}
              >
                {r.label}
              </div>
            ))}

            {Object.entries(pool.nodes).map(([id, node]) => {
              const pos = pool.layout.positions[id];
              if (!pos) return null;
              const vis = nodeVisual(node, {
                mode: readId ? 'read' : lensActive ? 'lens' : nowOn ? 'now' : 'field',
                readId,
                neighborRels,
                matched: matchedSet,
              });
              const z =
                readId === id ? 5 : neighborRels[id] || matchedSet.has(id) ? 4 : 2;
              return (
                <div
                  key={id}
                  style={{
                    position: 'absolute',
                    left: pos[0],
                    top: pos[1],
                    transform: 'translate(-50%,-50%)',
                    zIndex: z,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onNodeClick(id)}
                    className={vis.hot ? 'field-node--hot field-node' : 'field-node'}
                    style={{
                      position: 'relative',
                      minWidth: 108,
                      maxWidth: 188,
                      padding: '10px 13px',
                      borderRadius: 3,
                      background: vis.bg,
                      border: vis.border,
                      borderLeft: vis.leftAccent
                        ? '3px solid var(--signal)'
                        : vis.border === 'none'
                          ? 'none'
                          : '1px solid #cfd4cf',
                      borderRight: vis.rightAccent ? '3px solid var(--signal)' : undefined,
                      boxShadow: vis.shadow,
                      cursor: 'pointer',
                      opacity: vis.dim,
                      transform: vis.lift ? `translateY(${vis.lift}px)` : undefined,
                      transition:
                        'opacity 0.4s ease, box-shadow 0.3s ease, transform 0.3s var(--ease-out-strong), border-color 0.3s ease',
                      textAlign: 'left',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: vis.kickerColor,
                        display: 'block',
                      }}
                    >
                      {kindLabel(node.kind)}
                    </span>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 13,
                        color: vis.textColor,
                        marginTop: 4,
                        lineHeight: 1.15,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {node.title}
                    </div>
                    {vis.showRel ? (
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 8,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--signal)',
                          marginTop: 5,
                        }}
                      >
                        {vis.rel} →
                      </div>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>

          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              border: '1px solid var(--line)',
              borderRadius: 4,
              overflow: 'hidden',
            background: 'var(--card)',
            boxShadow: '0 2px 8px rgba(20,23,26,.06)',
          }}
        >
          {(
              [
                { label: '+', onClick: field.zoomIn, size: 16 },
                { label: '−', onClick: field.zoomOut, size: 16 },
                { label: '⤢', onClick: field.fitView, size: 12 },
              ] as const
            ).map((btn, i) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.onClick}
                style={{
                  width: 32,
                  height: 32,
                  border: 'none',
                  borderTop: i ? '1px solid var(--line-soft)' : undefined,
                  background: 'var(--card)',
                  color: i === 2 ? 'var(--muted)' : 'var(--ink)',
                  fontSize: btn.size,
                  cursor: 'pointer',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <Minimap
            field={field}
            mode={mode}
            readId={readId}
            matchedSet={matchedSet}
            neighborRels={neighborRels}
            nowOn={nowOn}
          />

          <p
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 16,
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--kicker)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              margin: 0,
            }}
          >
            {status.hint}
          </p>
          <div
            ref={field.readoutRef}
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              color: 'var(--muted)',
              background: 'rgba(252,252,251,.82)',
              padding: '5px 9px',
              borderRadius: 3,
            }}
          >
            z 100%
          </div>

          {readFull ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(238,240,237,.58)',
                pointerEvents: 'none',
                zIndex: 8,
                transition: 'opacity 0.4s ease',
              }}
            />
          ) : null}
        </div>

        {readNode ? (
          <ReadPanel
            node={readNode}
            pool={pool}
            historyTitle={history.at(-1) ? pool.nodes[history.at(-1)!]?.title ?? null : null}
            reading={readingAnim}
            full={readFull}
            onBack={back}
            onOpen={openNode}
            onOpenNode={openNode}
            onToggleFull={(next) => pushUrl({ full: next })}
            onDescend={() => {
              if (!readNode) return;
              setDescent(loadEssayStructure(readNode));
            }}
            canDescend={
              !readNode.media &&
              readNode.kind !== 'link' &&
              (Boolean(readNode.struct) ||
                readNode.excerpt.length > 0 ||
                readNode.body.length > 0)
            }
          />
        ) : null}
      </div>

      {descent ? (
        <ConstellationDescent structure={descent} onClose={() => setDescent(null)} />
      ) : null}

      <footer
        style={{
          height: 'var(--status-h)',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderTop: '1px solid var(--line)',
          background: 'var(--card)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#8a938c',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Spin verb={footerVerb} />
          {status.left}
        </span>
        <span>{status.right}</span>
      </footer>
    </div>
  );
}

function Minimap({
  field,
  mode,
  readId,
  matchedSet,
  neighborRels,
  nowOn,
}: {
  field: ReturnType<typeof useFieldTransform>;
  mode: string;
  readId: string | null;
  matchedSet: Set<string>;
  neighborRels: Record<string, Rel>;
  nowOn: boolean;
}) {
  const terrain = useMemo(() => {
    const items: {
      cx: number;
      cy: number;
      r: number;
      fill: string;
      stroke: string;
      sw: number;
      op: number;
    }[] = [];
    const accent = 'var(--signal)';
    const terrainMode =
      readId ? 'read' : mode === 'lens' ? 'lens' : nowOn ? 'now' : 'field';
    for (const [id, node] of Object.entries(pool.nodes)) {
      const pos = pool.layout.positions[id];
      if (!pos) continue;
      const [x, y] = pos;
      const { h, lit } = terrainHeight(id, node, {
        mode: terrainMode,
        readId,
        neighborRels,
        matched: matchedSet,
      });
      const R = 15 + h * 13;
      const col = lit ? accent : '#93a1ad';
      items.push({
        cx: x,
        cy: y,
        r: Math.round(R * 1.18),
        fill: col,
        stroke: 'none',
        sw: 0,
        op: Math.min(0.5, 0.045 * h),
      });
      items.push({
        cx: x,
        cy: y,
        r: Math.round(R * 0.72),
        fill: col,
        stroke: 'none',
        sw: 0,
        op: Math.min(0.6, 0.06 * h),
      });
      items.push({
        cx: x,
        cy: y,
        r: Math.round(R),
        fill: 'none',
        stroke: col,
        sw: 1,
        op: Math.min(0.7, 0.16 + 0.1 * h),
      });
      items.push({
        cx: x,
        cy: y,
        r: Math.round(R * 0.6),
        fill: 'none',
        stroke: col,
        sw: 1,
        op: Math.min(0.7, 0.13 + 0.09 * h),
      });
      items.push({
        cx: x,
        cy: y,
        r: readId === id ? 8 : lit ? 8 : 5,
        fill: readId === id ? '#14171a' : col,
        stroke: 'none',
        sw: 0,
        op: lit ? 0.95 : 0.5,
      });
    }
    return items;
  }, [readId, neighborRels, matchedSet, mode, nowOn]);

  return (
    <div
      onClick={field.onMiniClick}
      title="survey map · click to fly there"
      style={{
        position: 'absolute',
        left: 14,
        bottom: 14,
        width: 138,
        height: 84,
        background: '#f6f7f4',
        border: '1px solid var(--line)',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(20,23,26,.06)',
        overflow: 'hidden',
        cursor: 'crosshair',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.45,
          backgroundImage:
            'linear-gradient(to right,rgba(20,23,26,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(20,23,26,.04) 1px,transparent 1px)',
          backgroundSize: '11.5px 11.5px',
        }}
      />
      <svg
        viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {terrain.map((t, i) => (
          <circle
            key={i}
            cx={t.cx}
            cy={t.cy}
            r={t.r}
            fill={t.fill}
            stroke={t.stroke}
            strokeWidth={t.sw}
            vectorEffect="non-scaling-stroke"
            opacity={t.op}
          />
        ))}
      </svg>
      {pool.layout.regions.map((r) => (
        <div
          key={r.label}
          style={{
            position: 'absolute',
            left: `${(r.x / FIELD_WIDTH) * 100}%`,
            top: `${(r.y / FIELD_HEIGHT) * 100}%`,
            transform: 'translate(-50%,-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: r.accent ? 'var(--signal)' : '#7e8a93',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        >
          {r.label[0]?.toUpperCase()}
        </div>
      ))}
      <div
        ref={field.miniVpRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '40%',
          height: '40%',
          border: '1px solid var(--signal)',
          borderRadius: 1,
          pointerEvents: 'none',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,.6), 0 0 0 1px rgba(40,58,195,.15)',
        }}
      />
    </div>
  );
}