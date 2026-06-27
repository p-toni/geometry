import type { Cluster } from '../pool/types';

/** Canonical on-disk source path shown in the read panel (v2 handoff). */
export function poolSourcePath(cluster: Cluster, id: string): string {
  return `/content/${cluster}/${id}.md`;
}

export function poolSourceHref(cluster: Cluster, id: string): string {
  return poolSourcePath(cluster, id);
}