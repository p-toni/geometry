export type ConstellationGraph = {
  people: Array<{
    id: string;
    name: string;
    meta: string;
    topicIds: string[];
  }>;
  topicLabels: Record<string, string>;
  extraEdges?: Array<[string, string]>;
  title?: string;
  method?: string;
  embeddingModel?: string | null;
  meta?: Record<string, unknown>;
};

export function mount(
  root: HTMLElement,
  options?: { graph?: ConstellationGraph; initialView?: 'A' | 'B' },
): {
  switchView: (view: string) => void;
  resize: () => void;
  setScale: (scale?: number) => void;
  destroy: () => void;
};