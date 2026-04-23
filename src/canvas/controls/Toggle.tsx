import { Power } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import type { ToggleControl } from '../../types';

export function Toggle({ itemId, control }: { itemId: string; control: ToggleControl }) {
  const updateControl = useCanvasStore((state) => state.updateControl);

  return (
    <button
      type="button"
      aria-label="Toggle"
      title="Toggle"
      data-no-drag="true"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink/15 bg-paper/85 transition hover:border-accent-ink"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        updateControl(itemId, { ...control, value: !control.value });
      }}
    >
      <Power size={12} strokeWidth={2.2} className={control.value ? 'text-accent-ink' : 'text-ink-2'} />
    </button>
  );
}
