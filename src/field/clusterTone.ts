import type { Cluster } from '../pool/types';

export type ClusterTerrain = {
  /** Hypsometric valley fill (rgb triplet) */
  valley: string;
  /** Hypsometric ridge fill (rgb triplet) */
  ridge: string;
  /** Contour ink (rgb triplet) */
  ink: string;
};

export type ClusterTone = {
  /** Card surface — subtle shift from --card */
  card: string;
  border: string;
  /** @deprecated Terrain canvas replaces radial washes on the field */
  wash: string;
  accent: string;
  minimap: string;
  label: string;
  terrain: ClusterTerrain;
};

/**
 * Cluster temperature on the v2 palette.
 * - Writing: warm ochre (paper family) — not --fresh gold (reserved for Now)
 * - Work: desaturated cobalt (--signal family)
 * - Play / you: neutral sage and dusty mauve on warmed neutrals
 */
const TONES: Record<Cluster, ClusterTone> = {
  writing: {
    card: '#faf5ee',
    border: '#e8ded0',
    wash: 'rgba(154, 115, 68, 0.08)',
    accent: '#9a7344',
    minimap: '#b8956a',
    label: '#9a7344',
    terrain: { valley: '248, 241, 230', ridge: '196, 158, 108', ink: '154, 115, 68' },
  },
  work: {
    card: '#f7f8fb',
    border: '#d4dce8',
    wash: 'rgba(31, 77, 184, 0.07)',
    accent: '#4a68a8',
    minimap: '#5a7ab8',
    label: '#4a68a8',
    terrain: { valley: '236, 240, 248', ridge: '122, 148, 196', ink: '74, 104, 168' },
  },
  play: {
    card: '#f7f9f6',
    border: '#dde5d8',
    wash: 'rgba(101, 121, 99, 0.07)',
    accent: '#657963',
    minimap: '#7f947c',
    label: '#657963',
    terrain: { valley: '238, 244, 236', ridge: '148, 172, 142', ink: '101, 121, 99' },
  },
  you: {
    card: '#faf7f7',
    border: '#e5dcdd',
    wash: 'rgba(138, 117, 120, 0.06)',
    accent: '#8a7578',
    minimap: '#a08b8e',
    label: '#8a7578',
    terrain: { valley: '246, 240, 240', ridge: '186, 162, 166', ink: '138, 117, 120' },
  },
};

export function clusterTone(cluster: Cluster): ClusterTone {
  return TONES[cluster];
}