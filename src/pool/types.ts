/** Canonical link relations — directed, machine-traversable. */
export type Rel =
  | 'cites'
  | 'theme'
  | 'leads to'
  | 'pairs'
  | 'part of'
  | 'sibling'
  | 'echoes'
  | 'idea'
  | 'contains'
  | 'shipped on'
  | 'made'
  | 'find me'
  | 'specs'
  | 'specced in';

export type NodeKind =
  | 'essay'
  | 'note'
  | 'project'
  | 'doc'
  | 'shader'
  | 'voxel'
  | 'sharp'
  | 'link'
  | 'about';

export type Cluster = 'writing' | 'work' | 'play' | 'you';

export type Link = readonly [targetId: string, rel: Rel];

/** Essay body primitives — maps 1:1 to Figures registry (FIG.01–12). */
export type Block =
  | { t: 'p'; x: string }
  | { t: 'h'; x: string; level?: 2 | 3 }
  | { t: 'thesis'; x: string; k?: string }
  | { t: 'callout'; v: 'aside' | 'honesty' | 'update'; x: string; label?: string }
  | { t: 'sidenote'; anchor: string; x: string; body?: string }
  | { t: 'plate'; cap: string; src?: string }
  | { t: 'table'; headers: string[]; rows: string[][] }
  | { t: 'edge-taxonomy'; rows: { type: string; force: string }[] }
  | { t: 'steps'; items: string[] }
  | { t: 'motif' }
  | { t: 'point-edge' }
  | { t: 'curvature' }
  | { t: 'backlink'; title: string; rel: string; targetId: string };

/** Intra-essay shape for constellation descent (authored in frontmatter). */
export type EssayStruct = {
  lens: string;
  sections: { label: string; concepts: string[] }[];
};

export type PoolNode = {
  id: string;
  kind: NodeKind;
  cluster: Cluster;
  title: string;
  date: string;
  weight: number;
  rank: number;
  links: Link[];
  excerpt: string[];
  body: Block[];
  struct?: EssayStruct;
  href?: string;
  media?: boolean;
  sourcePath: string;
};

export type FieldRegion = {
  label: Cluster;
  x: number;
  y: number;
  accent?: boolean;
};

export type LensChip = {
  label: string;
  query: string;
  nodeIds: string[];
};

export type FieldLayout = {
  width: number;
  height: number;
  positions: Record<string, readonly [number, number]>;
  regions: FieldRegion[];
  lenses: LensChip[];
};

export type Pool = {
  nodes: Record<string, PoolNode>;
  layout: FieldLayout;
};