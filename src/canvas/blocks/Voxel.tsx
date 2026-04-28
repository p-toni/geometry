import { useMemo } from 'react';
import { Heerich } from 'heerich';
import type { BlockRendererProps } from './types';

type ProjectionType = 'oblique' | 'perspective' | 'orthographic' | 'isometric';
type VoxelPreset = 'glyph' | 'plinth' | 'signal';

const FACE_KEYS = new Set(['default', 'top', 'bottom', 'left', 'right', 'front', 'back', 'content']);
const CURATED_PALETTE = {
  paper: '#efe5d3',
  green: '#c8d6cf',
  vermilion: '#d65a3a',
  steel: '#58717d',
  indigo: '#2b2d42',
  ink: '#171a1f',
};

interface ShapeOp {
  op?: 'add' | 'subtract' | 'intersect' | 'exclude';
  mode?: 'union' | 'subtract' | 'intersect' | 'exclude';
  type?: 'box' | 'sphere' | 'line' | 'fill';
  position?: [number, number, number];
  size?: [number, number, number];
  center?: [number, number, number];
  radius?: number;
  from?: [number, number, number];
  to?: [number, number, number];
  bounds?: [[number, number, number], [number, number, number]];
  rotate?: { axis: 'x' | 'y' | 'z'; turns: number; center?: [number, number, number] };
  scale?: [number, number, number];
  scaleOrigin?: [number, number, number];
  gap?: number;
  opaque?: boolean;
  content?: string;
  meta?: Record<string, string | number | boolean>;
  style?: Record<string, unknown>;
}

function normalizeStyle(style: Record<string, unknown> | undefined) {
  if (!style) return undefined;
  const isFaceMap = Object.keys(style).some((key) => FACE_KEYS.has(key));
  return isFaceMap ? style : { default: style };
}

interface SceneSpec {
  preset?: VoxelPreset;
  tile?: number;
  gap?: number;
  padding?: number;
  occlusion?: boolean;
  camera?: {
    type?: ProjectionType;
    angle?: number;
    pitch?: number;
    distance?: number;
  };
  decals?: Record<string, string | { content: string }>;
  shapes?: ShapeOp[];
}

function modeForShape(shape: ShapeOp) {
  if (shape.mode) return shape.mode;
  if (shape.op === 'subtract') return 'subtract';
  if (shape.op === 'intersect') return 'intersect';
  if (shape.op === 'exclude') return 'exclude';
  return 'union';
}

function box(
  position: [number, number, number],
  size: [number, number, number],
  style: Record<string, unknown>,
  extra?: Partial<ShapeOp>,
): ShapeOp {
  return { type: 'box', position, size, style, ...extra };
}

function presetShapes(preset: VoxelPreset | undefined): ShapeOp[] {
  if (preset === 'plinth') {
    return [
      box([0, 0, 0], [7, 1, 5], {
        default: { fill: CURATED_PALETTE.green, stroke: CURATED_PALETTE.ink, strokeWidth: 0.6 },
        top: { fill: '#dae4de' },
      }),
      box([1, -1, 1], [5, 1, 3], {
        default: { fill: CURATED_PALETTE.paper, stroke: CURATED_PALETTE.ink, strokeWidth: 0.6 },
        top: { fill: '#f8f0de' },
      }),
      box([2, -3, 2], [1, 2, 1], {
        default: { fill: CURATED_PALETTE.vermilion, stroke: CURATED_PALETTE.ink, strokeWidth: 0.6 },
      }),
      box([4, -2, 2], [1, 1, 1], {
        default: { fill: CURATED_PALETTE.steel, stroke: CURATED_PALETTE.ink, strokeWidth: 0.6 },
      }),
    ];
  }

  if (preset === 'signal') {
    return [
      box([0, 0, 0], [8, 1, 2], {
        default: { fill: CURATED_PALETTE.indigo, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
        top: { fill: '#373a55' },
      }),
      box([1, -1, 0], [1, 1, 2], {
        default: { fill: CURATED_PALETTE.vermilion, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
      box([3, -2, 0], [1, 2, 2], {
        default: { fill: CURATED_PALETTE.green, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
      box([5, -4, 0], [1, 4, 2], {
        default: { fill: CURATED_PALETTE.paper, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
    ];
  }

  if (preset === 'glyph') {
    return [
      box([0, 0, 0], [7, 1, 7], {
        default: { fill: CURATED_PALETTE.paper, stroke: CURATED_PALETTE.ink, strokeWidth: 0.45 },
        top: { fill: '#f8edd7' },
      }),
      box([1, -1, 3], [5, 1, 1], {
        default: { fill: CURATED_PALETTE.indigo, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
      box([3, -5, 3], [1, 4, 1], {
        default: { fill: CURATED_PALETTE.indigo, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
      box([2, -2, 2], [1, 1, 1], {
        default: { fill: CURATED_PALETTE.vermilion, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
      box([4, -3, 4], [1, 1, 1], {
        default: { fill: CURATED_PALETTE.steel, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
      }),
      box([5, -2, 2], [1, 1, 1], {
        default: { fill: CURATED_PALETTE.green, stroke: CURATED_PALETTE.ink, strokeWidth: 0.5 },
        top: { fill: CURATED_PALETTE.green, decal: 'cut' },
      }),
    ];
  }

  return [];
}

function buildSvg(spec: SceneSpec, sliderValue: number, projectionOverride?: string): string {
  const tile = typeof spec.tile === 'number' ? spec.tile : 12;
  const cameraType = (projectionOverride as ProjectionType) ?? spec.camera?.type ?? 'isometric';
  const baseAngle = spec.camera?.angle ?? 30;
  const angle = baseAngle + sliderValue * 360;
  const options = {
    tile,
    gap: spec.gap,
    camera: {
      type: cameraType,
      angle,
      pitch: spec.camera?.pitch,
      distance: spec.camera?.distance,
    },
  } as ConstructorParameters<typeof Heerich>[0] & { gap?: number };
  const heerich = new Heerich({
    ...options,
  });

  for (const [name, decal] of Object.entries(spec.decals ?? {})) {
    heerich.defineDecal(name, decal);
  }
  if (!spec.decals?.cut) {
    heerich.defineDecal(
      'cut',
      '<path d="M0.18 0.82 C0.38 0.34 0.62 0.22 0.82 0.18" fill="none" stroke="#d65a3a" stroke-width="0.09" stroke-linecap="round"/>',
    );
  }

  heerich.batch(() => {
    for (const shape of [...presetShapes(spec.preset), ...(spec.shapes ?? [])]) {
      const { op: _op, mode: _mode, type = 'box', style, ...rest } = shape;
      void _op;
      void _mode;
      if (type === 'fill') return;
      const opts = {
        type,
        mode: modeForShape(shape),
        style: normalizeStyle(style),
        ...rest,
      } as Parameters<typeof heerich.applyGeometry>[0];
      heerich.applyGeometry(opts);
    }
  });

  return heerich.toSVG({
    padding: spec.padding ?? 10,
    occlusion: spec.occlusion ?? true,
    faceAttributes: (face) => ({
      'data-face': face.type,
      'data-depth': Number(face.depth.toFixed(3)),
    }),
  });
}

export function Voxel({ item, sliderValue, selectorValue }: BlockRendererProps) {
  const result = useMemo(() => {
    try {
      const parsed = JSON.parse(item.content) as SceneSpec;
      const svg = buildSvg(parsed, sliderValue, selectorValue ?? undefined);
      return { svg, error: null as string | null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { svg: '', error: message };
    }
  }, [item.content, sliderValue, selectorValue]);

  if (result.error) {
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap font-mono text-[11px] text-ink-2">
        {result.error}
      </pre>
    );
  }

  return (
    <div
      role="img"
      aria-label={item.label}
      className="grid h-full w-full place-items-center [&_polygon]:transition-opacity [&_svg]:max-h-full [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: result.svg }}
    />
  );
}
