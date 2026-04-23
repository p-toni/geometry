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
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink/15 bg-paper/85 transition hover:border-accent-ink"
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
