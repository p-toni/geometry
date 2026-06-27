import { useEffect, useMemo, useRef, useState } from 'react';
import { FIELD_HEIGHT, FIELD_WIDTH, pool } from '../pool';
import { clusterTone } from './clusterTone';
import {
  buildMinimapClusterMass,
  buildMinimapEdges,
  buildMinimapSummits,
  MINIMAP_FIELD,
  terrainStateKey,
} from './minimapVisual';
import { packNodeUniforms } from './shader/packNodes';
import { WebglTerrainRenderer } from './shader/webglTerrain';
import type { TerrainCtx } from './terrainHeight';
import type { useFieldTransform } from './hooks/useFieldTransform';

type MinimapProps = {
  field: ReturnType<typeof useFieldTransform>;
  terrainCtx: TerrainCtx;
};

export function Minimap({ field, terrainCtx }: MinimapProps) {
  const terrainCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const terrainKey = useMemo(() => terrainStateKey(terrainCtx), [terrainCtx]);
  const packed = useMemo(() => packNodeUniforms(terrainCtx), [terrainKey]);
  const clusterMass = useMemo(() => buildMinimapClusterMass(), []);
  const edges = useMemo(() => buildMinimapEdges(terrainCtx), [terrainKey]);
  const summits = useMemo(() => buildMinimapSummits(terrainCtx), [terrainKey]);
  const dimmed = terrainCtx.mode !== 'field';

  useEffect(() => {
    const canvas = terrainCanvasRef.current;
    if (!canvas) return;

    let renderer: WebglTerrainRenderer;
    try {
      renderer = new WebglTerrainRenderer(canvas);
    } catch {
      return;
    }

    renderer.resize(MINIMAP_FIELD.width, MINIMAP_FIELD.height);
    renderer.render({
      width: MINIMAP_FIELD.width,
      height: MINIMAP_FIELD.height,
      time: 0,
      dimmed: dimmed ? 1 : 0,
      cam: [0, 0],
      scale: 1,
      nodeCount: packed.count,
      nodePositions: packed.positions,
      nodeWeights: packed.weights,
    });
    renderer.destroy();
  }, [terrainKey, dimmed, packed]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * FIELD_WIDTH;
    const y = ((e.clientY - r.top) / r.height) * FIELD_HEIGHT;
    setHover({ x, y });
  };

  return (
    <div
      onClick={field.onMiniClick}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      title="survey map · click to fly there"
      className="field-minimap"
    >
      <div className="field-minimap-grid" aria-hidden />
      <canvas
        ref={terrainCanvasRef}
        className="field-minimap-terrain"
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        aria-hidden
      />
      <svg
        viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
        preserveAspectRatio="none"
        className="field-minimap-overlay"
        aria-hidden
      >
        <g style={{ mixBlendMode: 'multiply' }}>
          {clusterMass.map((m, i) => (
            <circle key={`mass-${i}`} cx={m.cx} cy={m.cy} r={m.r} fill={m.fill} opacity={m.op} />
          ))}
        </g>
        {edges.map((e, i) => (
          <line
            key={`edge-${i}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={e.stroke}
            strokeWidth={e.sw}
            vectorEffect="non-scaling-stroke"
            opacity={e.op}
          />
        ))}
        {summits.map((s, i) => (
          <circle key={`summit-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} opacity={s.op} />
        ))}
        {hover ? (
          <g pointerEvents="none" opacity={0.55}>
            <line
              x1={hover.x}
              y1={0}
              x2={hover.x}
              y2={FIELD_HEIGHT}
              stroke="var(--signal)"
              strokeWidth={0.75}
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={0}
              y1={hover.y}
              x2={FIELD_WIDTH}
              y2={hover.y}
              stroke="var(--signal)"
              strokeWidth={0.75}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ) : null}
      </svg>
      {pool.layout.regions.map((r) => {
        const tone = clusterTone(r.label);
        return (
          <div
            key={r.label}
            className="field-minimap-region"
            style={{
              left: `${(r.x / FIELD_WIDTH) * 100}%`,
              top: `${(r.y / FIELD_HEIGHT) * 100}%`,
              color: tone.label,
            }}
          >
            {r.label[0]?.toUpperCase()}
          </div>
        );
      })}
      <div ref={field.miniVpRef} className="field-minimap-vp">
        <span className="field-minimap-vp-tick field-minimap-vp-tick--tl" />
        <span className="field-minimap-vp-tick field-minimap-vp-tick--tr" />
        <span className="field-minimap-vp-tick field-minimap-vp-tick--bl" />
        <span className="field-minimap-vp-tick field-minimap-vp-tick--br" />
      </div>
    </div>
  );
}