import { useCallback, useState, type CSSProperties } from 'react';
import { IS_OWNER } from '../constants';
import { orderedCanvasForSave, useCanvasStore, CanvasStoreProvider } from '../store/canvasStore';
import type { Canvas as CanvasModel } from '../types';
import { Block } from './Block';
import { DemoChip } from './DemoChip';
import { ErrorBoundary } from './ErrorBoundary';
import { useCell } from './hooks/useCell';
import { useKeyboard } from './hooks/useKeyboard';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { Toolbar } from './Toolbar';

function CanvasSurface() {
  const metrics = useCell();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const canvas = useCanvasStore((state) => state.canvas);
  const select = useCanvasStore((state) => state.select);
  const sortedItems = [...canvas.items].sort((a, b) => a.row - b.row || a.col - b.col);

  const save = useCallback(async () => {
    if (!IS_OWNER) return;
    setSaveState('saving');
    try {
      const response = await fetch(`/__save/${encodeURIComponent(canvas.slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderedCanvasForSave(canvas), null, 2),
      });
      if (!response.ok) throw new Error(await response.text());
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    } catch {
      setSaveState('error');
    }
  }, [canvas]);

  useKeyboard(save);

  return (
    <div
      className={
        canvas.background === 'ink'
          ? 'h-screen overflow-hidden bg-ink text-paper'
          : 'h-screen overflow-hidden bg-paper text-ink'
      }
    >
      <Toolbar onSave={save} saveState={saveState} />
      <main
        className="relative overflow-hidden"
        style={{ height: metrics.canvasHeight }}
        onClick={() => select(null)}
      >
        {metrics.isMobile ? (
          <div className="h-full overflow-auto px-4 py-4">
            <div className="grid gap-4">
              {sortedItems.map((item) => (
                <Block key={item.id} item={item} cell={metrics.cell} isMobile />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="canvas-grid relative h-full w-full"
            style={{ '--cell': `${metrics.cell}px` } as CSSProperties}
          >
            {canvas.items.map((item) => (
              <Block key={item.id} item={item} cell={metrics.cell} isMobile={false} />
            ))}
            <PropertiesPanel />
          </div>
        )}
        {!IS_OWNER ? <DemoChip /> : null}
      </main>
      <StatusBar cell={metrics.cell} />
    </div>
  );
}

export function Canvas({ initialCanvas }: { initialCanvas: CanvasModel }) {
  return (
    <CanvasStoreProvider initialCanvas={initialCanvas}>
      <ErrorBoundary>
        <CanvasSurface />
      </ErrorBoundary>
    </CanvasStoreProvider>
  );
}
