export type ConstellationGraph = {
  people: Array<{
    id: string;
    name: string;
    meta: string;
    topicIds: string[];
    sectionSlug?: string;
  }>;
  topicLabels: Record<string, string>;
  extraEdges?: Array<[string, string]>;
  title?: string;
  method?: string;
  scope?: string;
  embeddingModel?: string | null;
  meta?: Record<string, unknown>;
};

export type ConstellationSelection = {
  id: string;
  name: string;
  meta?: string;
  type: 'person' | 'topic';
  kind?: string;
  view: 'A' | 'B';
  topicIds?: string[];
  personIds?: string[];
  sectionSlug?: string;
} | null;

export function mount(
  root: HTMLElement,
  options?: {
    graph?: ConstellationGraph;
    initialView?: 'A' | 'B';
    suppressLensLabel?: boolean;
    labelSafeInset?: { left?: number; right?: number; top?: number; bottom?: number };
    onSelectionChange?: (selection: ConstellationSelection) => void;
    onViewChange?: (view: 'A' | 'B') => void;
  },
): {
  switchView: (view: string) => void;
  selectNode: (id: string | null) => void;
  resize: () => void;
  setScale: (scale?: number) => void;
  setLabelSafeInset: (inset?: { left?: number; right?: number; top?: number; bottom?: number }) => void;
  destroy: () => void;
};
