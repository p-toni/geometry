import type { ConstellationGraph } from '../mount.d.ts';

export function graphUrl(path: string): string;
export function loadGraph(path: string): Promise<ConstellationGraph>;
export function loadManifest(): Promise<{
  generatedAt: string;
  graphs: Array<{
    id: string;
    title: string;
    path: string;
    kind: string;
  }>;
}>;