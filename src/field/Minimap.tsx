import { useMemo } from 'react';
import { FIELD_HEIGHT, FIELD_WIDTH, pool } from '../pool';
import { clusterTone } from './clusterTone';
import { terrainHeight } from './terrainHeight';
import type { TerrainCtx } from './terrainHeight';
import type { useFieldTransform } from './hooks/useFieldTransform';

type MinimapProps = {
  field: ReturnType<typeof useFieldTransform>;
  terrainCtx: TerrainCtx;
};

const MINIMAP_TERRAIN_COL: Record<string, string> = {
  writing: '#9a7344',
  work: '#4a68a8',
  play: '#657963',
  you: '#8a7578',
};

function terrainStateKey(ctx: TerrainCtx): string {
  return [
    ctx.mode,
    ctx.readId ?? '',
    [...ctx.matched].sort().join(','),
    Object.keys(ctx.neighborRels).sort().join(','),
  ].join('|');
}

/** SVG hypsometric rings — matches v2 single-spine minimap terrain. */
function buildMinimapTerrain(ctx: TerrainCtx) {
  const readId = ctx.readId;
  const circles: {
    cx: number;
    cy: number;
    r: number;
    fill: string;
    stroke: string;
    sw: number;
    op: number;
  }[] = [];

  for (const [id, node] of Object.entries(pool.nodes)) {
    const pos = pool.layout.positions[id];
    if (!pos) continue;
    const col = MINIMAP_TERRAIN_COL[node.cluster] ?? '#4a68a8';
    const { h, lit } = terrainHeight(id, node, ctx);
    const [x, y] = pos;
    const R = 28 + h * 18;

    circles.push({
      cx: x,
      cy: y,
      r: Math.round(R * 1.18),
      fill: col,
      stroke: 'none',
      sw: 0,
      op: Math.min(0.5, 0.045 * h),
    });
    circles.push({
      cx: x,
      cy: y,
      r: Math.round(R * 0.72),
      fill: col,
      stroke: 'none',
      sw: 0,
      op: Math.min(0.6, 0.06 * h),
    });
    circles.push({
      cx: x,
      cy: y,
      r: Math.round(R),
      fill: 'none',
      stroke: col,
      sw: 1,
      op: Math.min(0.7, 0.16 + 0.1 * h),
    });
    circles.push({
      cx: x,
      cy: y,
      r: Math.round(R * 0.6),
      fill: 'none',
      stroke: col,
      sw: 1,
      op: Math.min(0.7, 0.13 + 0.09 * h),
    });
    circles.push({
      cx: x,
      cy: y,
      r: readId === id ? 8 : lit ? 6 : 5,
      fill: readId === id ? '#1c1f24' : col,
      stroke: 'none',
      sw: 0,
      op: lit ? 0.95 : 0.5,
    });
  }

  return circles;
}

export function Minimap({ field, terrainCtx }: MinimapProps) {
  const terrainKey = useMemo(() => terrainStateKey(terrainCtx), [terrainCtx]);
  const terrain = useMemo(() => buildMinimapTerrain(terrainCtx), [terrainKey]);

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
        background: '#f4f1ea',
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
            'linear-gradient(to right,rgba(28,31,36,.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(28,31,36,.04) 1px,transparent 1px)',
          backgroundSize: '11.5px 11.5px',
        }}
      />
      <svg
        viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden
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
      {pool.layout.regions.map((r) => {
        const tone = clusterTone(r.label);
        return (
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
              color: tone.label,
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          >
            {r.label[0]?.toUpperCase()}
          </div>
        );
      })}
      <div
        ref={field.miniVpRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          transformOrigin: '0 0',
          border: '1px solid var(--signal)',
          borderRadius: 1,
          pointerEvents: 'none',
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,.6), 0 0 0 1px rgba(31,77,184,.15)',
        }}
      />
    </div>
  );
}