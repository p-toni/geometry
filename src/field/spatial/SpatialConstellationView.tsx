import { useMemo, useRef, useState } from 'react';
import { useSpatialMount, type SpatialView } from './useSpatialMount';
import type {
  ConstellationGraph,
  ConstellationSelection,
} from '../../../constellation/src/mount.d.ts';
import './spatialShell.css';

type Props = {
  graphPath: string | null;
  fallbackTitle?: string;
  variant?: 'embedded' | 'handoff' | 'panel';
  onBack?: () => void;
  backLabel?: string;
  className?: string;
  testId?: string;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function lensSelection(graph: ConstellationGraph | null, view: SpatialView): NonNullable<ConstellationSelection> | null {
  const lens = lensPerson(graph);
  if (!lens) return null;
  return {
    id: lens.id,
    name: lens.name,
    meta: lens.meta,
    type: 'person',
    kind: 'lens',
    view,
    topicIds: lens.topicIds,
  };
}

function lensPerson(graph: ConstellationGraph | null) {
  return graph?.people.find((person) => person.id.endsWith('-lens')) ?? null;
}

function cleanArgumentCopy(meta?: string): string {
  const copy = meta?.replace(/^\s*lens\s*[·—:-]\s*/i, '').trim();
  if (!copy) return '';
  const parts = copy
    .split(/\s+[·—]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(' · ') : copy;
}

function sectionInquiries(graph: ConstellationGraph | null) {
  if (!graph) return [];
  const order = isStringArray(graph.meta?.sectionSlugs) ? graph.meta.sectionSlugs : [];
  const orderIndex = new Map(order.map((slug, index) => [slug, index]));
  return graph.people
    .map((person, graphIndex) => ({ person, graphIndex }))
    .filter(({ person }) => person.sectionSlug)
    .sort((a, b) => {
      const aIndex = orderIndex.get(a.person.sectionSlug ?? '') ?? Number.MAX_SAFE_INTEGER;
      const bIndex = orderIndex.get(b.person.sectionSlug ?? '') ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex || a.graphIndex - b.graphIndex;
    })
    .map(({ person }) => person);
}

function selectionKind(selection: NonNullable<ConstellationSelection>): string {
  if (selection.type === 'topic') return 'concept';
  if (selection.kind === 'lens') return 'lens';
  if (selection.kind === 'linkInquiry') return 'link';
  return 'section';
}

function inquiryCount(graph: ConstellationGraph): number {
  return typeof graph.meta?.inquiryCount === 'number'
    ? graph.meta.inquiryCount
    : graph.people.length;
}

export function SpatialConstellationView({
  graphPath,
  fallbackTitle,
  variant = 'embedded',
  onBack,
  backLabel = '← back',
  className,
  testId = 'spatial-constellation-view',
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [contextVisible, setContextVisible] = useState(false);
  const labelSafeInset = useMemo(
    () => (contextVisible ? { left: 300, right: 360, top: 76, bottom: 58 } : undefined),
    [contextVisible],
  );
  const {
    graph,
    selectedNode,
    meta,
    error,
    ready,
    currentView,
    switchView,
    selectNode,
  } = useSpatialMount(graphPath, hostRef, labelSafeInset);
  const viewLabel = meta?.title ?? fallbackTitle ?? 'spatial reading';
  const titleLoading = !ready && !error;
  const activeSelection = selectedNode ?? lensSelection(graph, currentView);
  const mainArgument = cleanArgumentCopy(lensPerson(graph)?.meta);
  const sections = sectionInquiries(graph);
  const activeTopicIds = activeSelection?.topicIds ?? [];
  const topicLabels = activeTopicIds
    .map((id) => graph?.topicLabels?.[id] ?? id)
    .slice(0, 8);

  const rootClass = [
    'spatial-view-root',
    variant === 'embedded' ? 'spatial-view-root--embedded' : '',
    variant === 'handoff' ? 'spatial-view-root--handoff' : '',
    variant === 'panel' ? 'spatial-view-root--panel' : '',
    !contextVisible ? 'spatial-view-root--context-hidden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cleanBackLabel = backLabel.replace(/^←\s*/, '');

  return (
    <div className={rootClass} data-testid={testId} aria-label={`${viewLabel} constellation`}>
      <div className="spatial-topbar">
        <div className="spatial-topbar-start">
          {onBack ? (
            <button type="button" className="spatial-back-button" onClick={onBack} aria-label={cleanBackLabel}>
              <span aria-hidden="true">←</span>
              <span>{cleanBackLabel}</span>
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
        <div className="spatial-topbar-heading" aria-hidden="true">
          <p className={`view-title spatial-view-title${titleLoading ? ' spatial-view-title--loading' : ''}`}>
            {viewLabel}
          </p>
        </div>
        <div className="spatial-topbar-actions">
          <div className="spatial-mode-switch" aria-label="Constellation view mode">
            <button
              type="button"
              className={currentView === 'A' ? 'is-active' : ''}
              onClick={() => switchView('A')}
              disabled={!ready}
              aria-pressed={currentView === 'A'}
            >
              Argument
            </button>
            <button
              type="button"
              className={currentView === 'B' ? 'is-active' : ''}
              onClick={() => switchView('B')}
              disabled={!ready}
              aria-pressed={currentView === 'B'}
            >
              Mesh
            </button>
          </div>
          <button
            type="button"
            className={`spatial-context-toggle${contextVisible ? ' is-active' : ''}`}
            onClick={() => setContextVisible((visible) => !visible)}
            aria-pressed={contextVisible}
            disabled={!ready}
          >
            Context
          </button>
        </div>
      </div>
      <div className={`spatial-view-stage${ready ? '' : ' spatial-view-stage--loading'}`}>
        <div ref={hostRef} data-testid="spatial-constellation-host" style={{ width: '100%', height: '100%' }} />
      </div>
      {ready && !contextVisible && currentView === 'A' && mainArgument ? (
        <div className="spatial-argument-plate" aria-label="Main argument">
          <span>Main argument</span>
          <p>{mainArgument}</p>
        </div>
      ) : null}
      <div className="spatial-view-overlay-grid" aria-hidden={!ready || !contextVisible}>
        <aside className="spatial-side spatial-side--spine">
          <div className="spatial-side-kicker">Argument Spine</div>
          {graph ? (
            <button
              type="button"
              className={`spatial-spine-lens${activeSelection?.id.endsWith('-lens') ? ' is-active' : ''}`}
              onClick={() => selectNode(lensSelection(graph, currentView)?.id ?? null)}
            >
              <span className="spatial-spine-title">{mainArgument || 'main argument'}</span>
              <span className="spatial-spine-meta">{inquiryCount(graph)} inquiries</span>
            </button>
          ) : null}
          <ol className="spatial-spine-list">
            {sections.map((section, index) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`spatial-spine-item${activeSelection?.id === section.id ? ' is-active' : ''}`}
                  onClick={() => selectNode(section.id)}
                >
                  <span className="spatial-spine-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="spatial-spine-copy">
                    <span className="spatial-spine-name">{section.name}</span>
                    <span className="spatial-spine-note">{section.meta}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
        <div className="spatial-view-relation-key" aria-hidden="true">
          <span><i className="spatial-key-line spatial-key-line--structural" /> structural</span>
          <span><i className="spatial-key-line spatial-key-line--tension" /> tension</span>
          <span><i className="spatial-key-dot" /> concept</span>
        </div>
        <aside className="spatial-side spatial-side--inspect">
          <div className="spatial-side-kicker">Selected</div>
          {activeSelection ? (
            <>
              <div className="spatial-inspect-kind">{selectionKind(activeSelection)}</div>
              <h2 className="spatial-inspect-title">{activeSelection.name}</h2>
              {activeSelection.meta ? <p className="spatial-inspect-meta">{activeSelection.meta}</p> : null}
              {topicLabels.length ? (
                <div className="spatial-topic-cluster">
                  {topicLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="spatial-inspect-meta">No node selected.</p>
          )}
        </aside>
      </div>
      {error ? <p className="view-error">{error}</p> : null}
    </div>
  );
}
