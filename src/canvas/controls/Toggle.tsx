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
      className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/10 hover:text-ink active:scale-[0.96]"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        updateControl(itemId, { ...control, value: !control.value });
      }}
    >
      <Power
        size={12}
        strokeWidth={2.2}
        className={control.value ? 'text-accent-ink' : 'text-ink-2'}
      />
    </button>
  );
}
