import { RefreshCw } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';
import { hasDemoDiverged } from '../store/divergence';
import { useDemoReset } from './hooks/useDemoReset';

export function DemoStatus() {
  const diverged = useCanvasStore(hasDemoDiverged);
  const reset = useDemoReset();

  return (
    <>
      <span className="min-w-0 truncate">
        {diverged ? "demo mode · changes won't save" : 'demo mode · drag, resize, rearrange'}
      </span>
      {diverged ? (
        <button
          type="button"
          title="Reset canvas (R)"
          aria-label="Reset canvas"
          className="flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-ink/10 px-2 transition-[border-color,transform] duration-150 ease-out hover:border-accent-ink active:scale-[0.96]"
          onClick={reset}
        >
          <RefreshCw size={11} />
          <span>reset</span>
        </button>
      ) : null}
    </>
  );
}
