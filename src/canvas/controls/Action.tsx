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
      className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/10 hover:text-ink active:scale-[0.96]"
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
