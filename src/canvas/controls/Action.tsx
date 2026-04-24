import { RefreshCw } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import type { ActionControl } from '../../types';

export function Action({ itemId, control }: { itemId: string; control: ActionControl }) {
  const triggerAction = useCanvasStore((state) => state.triggerAction);

  return (
    <button
      type="button"
      aria-label="Refresh block"
      title={`Refresh ${control.id}`}
      data-no-drag="true"
      className="inline-flex h-6 w-6 items-center justify-center rounded-t-[4px] rounded-b-none border border-ink/10 bg-paper/95 text-ink-2 shadow-sm transition hover:border-accent-ink hover:text-ink"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        triggerAction(itemId);
      }}
    >
      <RefreshCw size={12} />
    </button>
  );
}
