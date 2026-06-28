import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin } from '../components/Spin';
import { uniqueEdges } from '../lib/graph';
import { activeChipForQuery, resolveLens } from '../lib/search';
import {
  parseFieldState,
  viewportMatchesUrl,
  writeFieldState,
} from '../lib/fieldUrl';
import { effectiveReadFull } from '../lib/readMode';
import { kindLabel } from '../lib/glyph';

import { pool, FIELD_HEIGHT, FIELD_WIDTH } from '../pool';
import type { PoolNode, Rel } from '../pool/types';
import { ConstellationDescent, type DescentOrigin } from './ConstellationDescent';

import { getFieldMode, statusForMode } from './fieldState';
import { NAV_HOP_MS, NAV_OPEN_MS, useFieldTransform } from './hooks/useFieldTransform';
import { clusterTone } from './clusterTone';
import { nodeLayout } from './nodeLayout';
import { nodeVisual } from './nodeVisual';
import { FieldTerrainCanvas } from './FieldTerrainCanvas';
import { ReadPanel } from './ReadPanel';
import { Minimap } from './Minimap';
import type { TerrainCtx } from './terrainHeight';
import toniLtdLogo from '../assets/toni-ltd.svg';

export function FieldApp() {
  const [params, setParams] = useSearchParams();
  const urlState = parseFieldState(params);
  const [lensInput, setLensInput] = useState(urlState.query);
  const [matched, setMatched] = useState<string[] | null>(
    urlState.query ? resolveLens(pool, urlState.query, pool.layout.lenses) : null,
  );
  const mainRef = useRef<HTMLDivElement>(null);
  const suppressViewportSync = useRef(0);
  const [descent, setDescent] = useState<PoolNode | null>(null);
  const [descentOrigin, setDescentOrigin] = useState<DescentOrigin | null>(null);
  const [composing, setComposing] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(
    activeChipForQuery(urlState.query, pool.layout.lenses),
  );
  const [cascading, setCascading] = useState(false);
  /** Snap field highlights during read-to-read hops — avoids opacity crossfade blink. */
  const hopNavRef = useRef(false);
  const [, bumpHopNav] = useState(0);
  const hopTimerRef = useRef<number | null>(null);
  /** Immediate read/trail — keeps the read panel in sync with field card clicks. */
  const [readTarget, setReadTarget] = useState<string | null>(urlState.read);
  const [trailTarget, setTrailTarget] = useState<string[]>(urlState.trail);

  const triggerCascade = useCallback(() => {
    setCascading(true);
    window.setTimeout(() => setCascading(false), 460);
  }, []);

  const field = useFieldTransform({
    x: urlState.x ?? undefined,
    y: urlState.y ?? undefined,
    z: urlState.z ?? undefined,
  });
  const {
    ready: fieldReady,
    initField,
    flyTo,
    setT: setFieldT,
    transformForPoint,
    frameIds,
  } = field;
  const readKey = params.get('read') ?? '';

  const readId = readTarget;
  const locationState = parseFieldState(new URLSearchParams(window.location.search));
  const fullOn =
    urlState.full ||
    (locationState.read === readId && locationState.full);
  const readFull = effectiveReadFull(readId ? pool.nodes[readId] : undefined, fullOn);
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
      const navIntent = patch.read !== undefined || patch.trail !== undefined;
      if (navIntent) {
        suppressViewportSync.current = Date.now() + 1200;
        if (patch.read !== undefined) setReadTarget(patch.read);
        if (patch.trail !== undefined) setTrailTarget(patch.trail);
      }
      const base = parseFieldState(new URLSearchParams(window.location.search));
      const next = writeFieldState(
        {
          ...base,
          x: field.transform.x,
          y: field.transform.y,
          z: field.transform.z,
        },
        patch,
      );
      setParams(next, { replace });
    },
    [field.transform, setParams],
  );

  const skipViewportSync = useRef(true);
  const modeKey = `${params.get('read') ?? ''}|${params.get('trail') ?? ''}|${params.get('q') ?? ''}|${params.get('now') ?? ''}|${params.get('full') ?? ''}`;
  const viewportKey = `${params.get('x') ?? ''}|${params.get('y') ?? ''}|${params.get('z') ?? ''}`;

  useEffect(() => {
    if (fieldReady) return;
    skipViewportSync.current = true;
    const id = requestAnimationFrame(() => {
      if (urlState.x == null) {
        initField(false);
        if (readId && pool.layout.positions[readId]) {
          requestAnimationFrame(() => flyTo(pool.layout.positions[readId]!, false));
        }
      } else {
        setFieldT({ x: urlState.x!, y: urlState.y!, z: urlState.z ?? 1 }, false);
      }
      window.setTimeout(() => {
        skipViewportSync.current = false;
      }, 100);
    });
    return () => cancelAnimationFrame(id);
  }, [fieldReady, readId, urlState.x, urlState.y, urlState.z, initField, flyTo, setFieldT]);

  useEffect(() => {
    const state = parseFieldState(params);
    if (Date.now() >= suppressViewportSync.current) {
      setReadTarget(state.read);
      setTrailTarget(state.trail);
    }
    setLensInput(state.query);
    setMatched(
      state.query ? resolveLens(pool, state.query, pool.layout.lenses) : null,
    );
    setActiveChip(activeChipForQuery(state.query, pool.layout.lenses));
  }, [modeKey, params]);

  useEffect(() => {
    if (!fieldReady || skipViewportSync.current) return;
    if (Date.now() < suppressViewportSync.current) return;
    const state = parseFieldState(params);
    if (state.x != null && state.y != null && state.z != null) {
      setFieldT({ x: state.x, y: state.y, z: state.z }, false);
    } else if (state.read && pool.layout.positions[state.read]) {
      flyTo(pool.layout.positions[state.read]!, false);
    }
  }, [viewportKey, readKey, fieldReady, setFieldT, flyTo, params]);

  useEffect(() => {
    if (!fieldReady || skipViewportSync.current) return;
    if (Date.now() < suppressViewportSync.current) return;

    const timeout = window.setTimeout(() => {
      if (Date.now() < suppressViewportSync.current) return;
      const state = parseFieldState(new URLSearchParams(window.location.search));
      if (viewportMatchesUrl(field.transform, state)) return;
      const { x, y, z } = field.transform;
      const next = writeFieldState(state, {
        x: Math.round(x),
        y: Math.round(y),
        z: Number(z.toFixed(2)),
      });
      setParams(next, { replace: true });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [fieldReady, field.transform, params, setParams]);

  const focusNode = useCallback(
    (id: string, animate = true, hop = false) => {
      const pos = pool.layout.positions[id];
      if (!pos) return;
      suppressViewportSync.current = Date.now() + 1200;
      const view = transformForPoint(pos);
      flyTo(pos, animate, hop ? NAV_HOP_MS : NAV_OPEN_MS);
      return view;
    },
    [flyTo, transformForPoint],
  );

  const openNode = useCallback(
    (id: string) => {
      const trail = readTarget ? [...trailTarget, readTarget].slice(-16) : trailTarget;
      const wasReading = Boolean(readTarget);
      if (hopTimerRef.current != null) window.clearTimeout(hopTimerRef.current);
      hopNavRef.current = wasReading;
      if (wasReading) {
        hopTimerRef.current = window.setTimeout(() => {
          hopNavRef.current = false;
          hopTimerRef.current = null;
          bumpHopNav((n) => n + 1);
        }, NAV_HOP_MS);
      }
      const view = focusNode(id, true, wasReading);
      setDescent(null);
      setDescentOrigin(null);
      pushUrl({
        read: id,
        query: '',
        now: false,
        full: false,
        trail,
        ...(view ?? {}),
      });
      setLensInput('');
      setMatched(null);
      setActiveChip(null);
    },
    [focusNode, pushUrl, readTarget, trailTarget],
  );

  const onNodeClick = useCallback(
    (id: string) => {
      openNode(id);
    },
    [openNode],
  );

  const home = useCallback(() => {
    if (hopTimerRef.current != null) window.clearTimeout(hopTimerRef.current);
    hopNavRef.current = false;
    triggerCascade();
    setDescent(null);
    setDescentOrigin(null);
    setLensInput('');
    setMatched(null);
    setActiveChip(null);
    pushUrl({ read: null, query: '', now: false, full: false, trail: [] });
    field.fitView();
  }, [field, pushUrl, triggerCascade]);

  const back = useCallback(() => {
    setDescent(null);
    setDescentOrigin(null);
    const state = parseFieldState(new URLSearchParams(window.location.search));
    const fullNow =
      state.full &&
      Boolean(state.read && (pool.nodes[state.read]?.body.length ?? 0) > 0);
    if (fullNow) {
      pushUrl({ full: false });
      return;
    }
    const prev = trailTarget.at(-1);
    const nextTrail = trailTarget.slice(0, -1);
    if (prev) {
      if (hopTimerRef.current != null) window.clearTimeout(hopTimerRef.current);
      hopNavRef.current = true;
      hopTimerRef.current = window.setTimeout(() => {
        hopNavRef.current = false;
        hopTimerRef.current = null;
        bumpHopNav((n) => n + 1);
      }, NAV_HOP_MS);
      const view = focusNode(prev, true, true);
      pushUrl({
        read: prev,
        full: false,
        trail: nextTrail,
        ...(view ?? {}),
      });
    } else {
      pushUrl({ read: null, full: false, trail: [] });
      field.fitView();
    }
  }, [field, focusNode, pushUrl, trailTarget]);

  const runLens = useCallback(
    (q: string) => {
      if (!q.trim()) {
        pushUrl({ query: '', now: false, read: null, trail: [] });
        setMatched(null);
        setActiveChip(null);
        return;
      }
      setComposing(true);
      const ids = resolveLens(pool, q, pool.layout.lenses);
      setMatched(ids);
      pushUrl({ query: q, now: false, read: null, trail: [] });
      requestAnimationFrame(() => {
        frameIds(ids, pool.layout.positions, false);
        requestAnimationFrame(() => setComposing(false));
      });
    },
    [frameIds, pushUrl],
  );

  const pickChip = useCallback(
    (label: string, query: string, nodeIds: string[]) => {
      setActiveChip(label);
      setLensInput(query);
      setComposing(true);
      setMatched(nodeIds);
      pushUrl({ query, now: false, read: null, trail: [] });
      requestAnimationFrame(() => {
        frameIds(nodeIds, pool.layout.positions, true);
        requestAnimationFrame(() => setComposing(false));
      });
    },
    [frameIds, pushUrl],
  );

  const toggleNow = useCallback(() => {
    triggerCascade();
    setDescent(null);
    setDescentOrigin(null);
    const next = !nowOn;
    pushUrl({ now: next, read: null, query: '', trail: [] });
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
  const terrainCtx = useMemo<TerrainCtx>(
    () => ({
      mode: readId ? 'read' : lensActive ? 'lens' : nowOn ? 'now' : 'field',
      readId,
      neighborRels,
      matched: matchedSet,
    }),
    [readId, lensActive, nowOn, neighborRels, matchedSet],
  );
  const edges = useMemo(() => uniqueEdges(pool), []);
  const fieldFocused = Boolean(readId || lensActive || nowOn);

  const status = statusForMode(mode, pool, {
    read: readId,
    full: readFull,
    query: urlState.query,
    matched,
    composing,
    cascading,
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
          className="pressable pressable--ghost"
          aria-label="toni.ltd"
          onClick={home}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <img
            src={toniLtdLogo}
            alt=""
            width={132}
            height={33}
            style={{ display: 'block', height: 20, width: 'auto' }}
          />
        </button>

        <form
          className="lens-form"
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
            border: `1.5px solid ${lensActive ? 'var(--signal)' : 'var(--line)'}`,
            borderRadius: 4,
            padding: '9px 14px',
            boxShadow: 'var(--shadow-inset)',
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
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--ink)',
            }}
          />
          {lensActive ? (
            <button
              type="button"
              className="pressable"
              onClick={() => {
                triggerCascade();
                setDescent(null);
                setDescentOrigin(null);
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
                border: '1px solid var(--line)',
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
            className="pressable"
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
                className="pressable"
                onClick={() => pickChip(chip.label, chip.query, chip.nodeIds)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: on ? '#fff' : 'var(--ink-2)',
                  background: on ? 'var(--ink)' : 'var(--card)',
                  border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
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
          className="pressable"
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
            background: nowOn ? 'var(--fresh)' : 'var(--card)',
            border: `1px solid ${nowOn ? 'var(--fresh)' : 'var(--line)'}`,
            borderRadius: 3,
            padding: '8px 12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 12, lineHeight: 1 }}>◷</span> now
        </button>
      </header>

      <div
        ref={mainRef}
        style={{ position: 'relative', flex: 1, display: 'flex', overflow: 'hidden' }}
      >
        <div
          ref={field.vpRef}
          className={[
            fieldFocused ? 'field-viewport field-viewport--focus' : 'field-viewport',
            descent ? 'field-viewport--descending' : '',
          ]
            .filter(Boolean)
            .join(' ')}
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
          <FieldTerrainCanvas
            vpRef={field.vpRef}
            terrainCtx={terrainCtx}
            dimmed={Boolean(readId)}
            transform={field.transform}
          />
          <div className="field-grain" aria-hidden />
          <div className="field-grid" aria-hidden />

          <div
            ref={field.worldRef}
            className={`field-world${fieldFocused ? ' field-world--focus' : ''}${hopNavRef.current ? ' field-world--hop' : ''}`}
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
                    className="field-edge"
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

            {pool.layout.regions.map((r) => {
              const tone = clusterTone(r.label);
              return (
                <div
                  key={r.label}
                  className="field-region-label"
                  style={{
                    position: 'absolute',
                    left: r.x,
                    top: r.y,
                    transform: 'translate(-50%,-50%)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: tone.label,
                    opacity: readId || lensActive || nowOn ? 0.32 : 0.62,
                    fontWeight: 700,
                    pointerEvents: 'none',
                  }}
                >
                  {r.label}
                </div>
              );
            })}

            {Object.entries(pool.nodes).map(([id, node]) => {
              const pos = pool.layout.positions[id];
              if (!pos) return null;
              const vis = nodeVisual(node, {
                mode: readId ? 'read' : lensActive ? 'lens' : nowOn ? 'now' : 'field',
                readId,
                neighborRels,
                matched: matchedSet,
              });
              const layout = nodeLayout(node);
              const isPill = layout.variant === 'pill';
              const isLinkLit = isPill && lensActive && matchedSet.has(id);
              const fieldMode = !readId && !lensActive && !nowOn;
              const rankLift = fieldMode && node.rank <= 1 ? 1 : 0;
              const z =
                readId === id
                  ? 5
                  : neighborRels[id] || matchedSet.has(id)
                    ? 4
                    : 2 + rankLift;
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
                    data-testid={`field-node-${id}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onNodeClick(id)}
                    className={`pressable field-node${vis.hot ? ' field-node--hot' : ''}${isPill ? ' field-node--link' : ''}${isLinkLit ? ' field-node--link-lit' : ''}`}
                    style={{
                      position: 'relative',
                      minWidth: isPill ? undefined : layout.minWidth,
                      maxWidth: layout.maxWidth,
                      padding: layout.padding,
                      borderRadius: layout.borderRadius,
                      background: vis.bg,
                      border: vis.border,
                      borderLeft: isPill
                        ? 'none'
                        : vis.leftAccent
                          ? `3px solid ${vis.accentEdge === 'fresh' ? 'var(--fresh)' : 'var(--signal)'}`
                          : vis.border === 'none'
                            ? 'none'
                            : vis.border,
                      boxShadow: vis.shadow,
                      cursor: 'pointer',
                      opacity: vis.dim,
                      transform: vis.lift ? `translateY(${vis.lift}px)` : undefined,
                      textAlign: 'left',
                    }}
                  >
                    {isPill ? (
                      <>
                        <span className="field-node--link-kicker">link</span>
                        <span className="field-node--link-title">{node.title}</span>
                        <span className="field-node--link-badge" aria-hidden>
                          ↗
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: layout.kickerSize,
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
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            fontSize: layout.titleSize,
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
                      </>
                    )}
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
            boxShadow: 'var(--shadow-raised)',
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
                className="pressable"
                onPointerDown={(e) => e.stopPropagation()}
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

          <Minimap field={field} terrainCtx={terrainCtx} />

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
            className="field-zoom-readout"
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

          {readFull || descent ? (
            <div
              className={`field-read-scrim${descent ? ' field-read-scrim--descent' : ''}`}
              aria-hidden
            />
          ) : null}
        </div>

        {readNode ? (
          <ReadPanel
            node={readNode}
            pool={pool}
            historyTitle={
              trailTarget.at(-1)
                ? (pool.nodes[trailTarget.at(-1)!]?.title ?? null)
                : null
            }
            full={readFull}
            descending={Boolean(descent)}
            onBack={back}
            onClose={home}
            onOpen={openNode}
            onOpenNode={openNode}
            onToggleFull={(next) => pushUrl({ full: next })}
            onDescend={(origin) => {
              if (!readNode) return;
              const container = mainRef.current;
              if (container) {
                const r = container.getBoundingClientRect();
                setDescentOrigin({ x: origin.x - r.left, y: origin.y - r.top });
              } else {
                setDescentOrigin(origin);
              }
              setDescent(readNode);
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

        {descent ? (
          <ConstellationDescent
            node={descent}
            origin={descentOrigin ?? undefined}
            onClose={() => {
              setDescent(null);
              setDescentOrigin(null);
            }}
          />
        ) : null}
      </div>

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