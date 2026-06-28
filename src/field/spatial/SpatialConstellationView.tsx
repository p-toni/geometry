import { useRef } from 'react';
import { useSpatialMount, type SpatialView } from './useSpatialMount';
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

function viewToggleLabel(view: SpatialView): string {
  return view === 'A' ? 'Inquiries + Concepts' : 'Concepts';
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
  const { meta, error, ready, currentView, switchView } = useSpatialMount(graphPath, hostRef);
  const title = meta?.title ?? fallbackTitle ?? 'Loading…';
  const titleLoading = !ready && !error;

  const rootClass = [
    'spatial-view-root',
    variant === 'embedded' ? 'spatial-view-root--embedded' : '',
    variant === 'handoff' ? 'spatial-view-root--handoff' : '',
    variant === 'panel' ? 'spatial-view-root--panel' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const toggleView = () => switchView(currentView === 'A' ? 'B' : 'A');

  return (
    <div className={rootClass} data-testid={testId}>
      <div className="view-chrome spatial-view-chrome">
        <div className="spatial-view-chrome-start">
          {onBack ? (
            <button type="button" className="spatial-view-back view-back" onClick={onBack}>
              {backLabel}
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
        <button
          type="button"
          className="spatial-view-toggle"
          onClick={toggleView}
          disabled={!ready}
          aria-label={`Switch view. Currently showing ${viewToggleLabel(currentView)}.`}
        >
          {viewToggleLabel(currentView)}
        </button>
        <div className="view-heading spatial-view-heading">
          <p className={`view-title spatial-view-title${titleLoading ? ' spatial-view-title--loading' : ''}`}>
            {title}
          </p>
          <p className="view-meta spatial-view-meta">{meta?.metaLine ?? ''}</p>
        </div>
      </div>
      <div className={`spatial-view-stage${ready ? '' : ' spatial-view-stage--loading'}`}>
        <div ref={hostRef} data-testid="spatial-constellation-host" style={{ width: '100%', height: '100%' }} />
      </div>
      {error ? <p className="view-error">{error}</p> : null}
    </div>
  );
}