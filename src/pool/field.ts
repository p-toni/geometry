import type { FieldLayout, LensChip } from './types';

export const FIELD_WIDTH = 1320;
export const FIELD_HEIGHT = 800;

/** Hand-placed coordinates — synced to v2 single-spine prototype `this.POS`. */
export const positions: Record<string, readonly [number, number]> = {
  ilya: [130, 300],
  'allowed-ignorance': [322, 288],
  'co-owning-the-loop': [512, 300],
  'increasing-returns': [218, 410],
  'geometry-retrieval': [420, 440],
  'me-plus-ai': [602, 430],
  'tools-need-edges': [188, 542],
  'weak-geometry': [390, 560],
  'bounded-me': [650, 560],
  geometry: [952, 208],
  'the-loom': [1124, 292],
  'spec-v1': [898, 352],
  sea: [1030, 560],
  xcom: [1202, 500],
  'lock-in': [1182, 662],
  'point-cloud': [1018, 692],
  about: [322, 722],
};

export const regions = [
  { label: 'writing', x: 268, y: 196, accent: true },
  { label: 'work', x: 1002, y: 138 },
  { label: 'play', x: 1086, y: 432 },
  { label: 'you', x: 280, y: 776 },
] as const;

/** Curated lenses — synced to v2 single-spine prototype `this.CHIPS`. */
export const lenses: LensChip[] = [
  {
    label: 'what are you building',
    query: 'what are you building',
    nodeIds: ['geometry', 'the-loom', 'spec-v1', 'geometry-retrieval'],
  },
  {
    label: 'thinking on AI',
    query: 'your thinking on AI',
    nodeIds: ['allowed-ignorance', 'me-plus-ai', 'bounded-me', 'ilya', 'co-owning-the-loop'],
  },
  {
    label: 'who are you',
    query: 'who are you',
    nodeIds: ['about', 'xcom', 'co-owning-the-loop', 'point-cloud'],
  },
];

export const layout: FieldLayout = {
  width: FIELD_WIDTH,
  height: FIELD_HEIGHT,
  positions,
  regions: [...regions],
  lenses,
};