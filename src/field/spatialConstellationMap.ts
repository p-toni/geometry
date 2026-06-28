import manifest from '../../constellation/generated/manifest.json';

/** Pool node id → spatial graph path under /generated/ */
const POOL_TO_GRAPH = new Map<string, string>();

/** Manifest slug after stripping numeric prefix can differ from pool id. */
const POOL_ID_ALIASES: Record<string, string> = {
  'geometry-retrieval': 'geometry-over-retrieval',
};

for (const entry of manifest.graphs) {
  if (entry.kind !== 'essay' || !entry.path) continue;
  const slug = entry.id.replace(/^\d+-/, '');
  POOL_TO_GRAPH.set(slug, entry.path);
}

for (const [poolId, slug] of Object.entries(POOL_ID_ALIASES)) {
  const path = POOL_TO_GRAPH.get(slug);
  if (path) POOL_TO_GRAPH.set(poolId, path);
}

export function graphPathForNode(poolId: string): string | null {
  return POOL_TO_GRAPH.get(poolId) ?? null;
}

export function hasSpatialGraph(poolId: string): boolean {
  return POOL_TO_GRAPH.has(poolId);
}