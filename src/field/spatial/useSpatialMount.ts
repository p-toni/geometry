import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { loadGraph } from '../../../constellation/src/graph/loadGraph.js';
import { mount } from '../../../constellation/src/mount.js';
import type { ConstellationGraph } from '../../../constellation/src/mount.d.ts';

export type SpatialView = 'A' | 'B';

export type SpatialGraphMeta = {
  title: string;
  metaLine: string;
};

function formatGeneratedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function metaFromGraph(graph: ConstellationGraph, path: string): SpatialGraphMeta {
  const model = graph.embeddingModel ? ` · ${graph.embeddingModel}` : '';
  const inquiries = graph.meta?.inquiryCount ?? graph.people.length;
  const concepts =
    graph.meta?.conceptCount ?? Object.keys(graph.topicLabels ?? {}).length;
  const scope = graph.scope ?? (graph.meta?.scope as string | undefined) ?? '';
  const method = graph.method ?? 'unknown';
  const generatedAt = graph.meta?.generatedAt;
  const generated =
    typeof generatedAt === 'string' ? formatGeneratedAt(generatedAt) : '';
  const generatedPart = generated ? ` · ${generated}` : '';
  return {
    title: graph.title ?? path,
    metaLine: `${inquiries} inquiries · ${concepts} concepts${scope ? ` · ${scope}` : ''} · ${method}${model}${generatedPart}`,
  };
}

export function useSpatialMount(graphPath: string | null, hostRef: RefObject<HTMLDivElement | null>) {
  const mountRef = useRef<ReturnType<typeof mount> | null>(null);
  const [meta, setMeta] = useState<SpatialGraphMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [currentView, setCurrentView] = useState<SpatialView>('A');

  const switchView = useCallback((view: SpatialView) => {
    mountRef.current?.switchView(view);
    setCurrentView(view);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !graphPath) return;

    let dead = false;
    setError(null);
    setMeta(null);
    setReady(false);
    setCurrentView('A');

    loadGraph(graphPath)
      .then((graph) => {
        if (dead || !hostRef.current) return;
        setMeta(metaFromGraph(graph, graphPath));
        mountRef.current?.destroy();
        mountRef.current = mount(hostRef.current, { graph });
        mountRef.current.resize();
        setCurrentView('A');
        setReady(true);
      })
      .catch((e: unknown) => {
        if (dead) return;
        setError(e instanceof Error ? e.message : 'Failed to load graph');
      });

    return () => {
      dead = true;
      mountRef.current?.destroy();
      mountRef.current = null;
      setReady(false);
    };
  }, [graphPath, hostRef]);

  useEffect(() => {
    const onResize = () => mountRef.current?.resize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return { meta, error, ready, currentView, switchView };
}