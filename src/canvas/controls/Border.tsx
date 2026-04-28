import { Square, SquareDashed } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import type { BorderControl } from '../../types';

export function Border({ itemId, control }: { itemId: string; control: BorderControl }) {
  const updateControl = useCanvasStore((state) => state.updateControl);
  const Icon = control.value ? Square : SquareDashed;

  return (
    <button
      type="button"
      aria-label={control.value ? 'Hide border' : 'Show border'}
      title="Border"
      data-no-drag="true"
      className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/10 hover:text-ink active:scale-[0.96]"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        updateControl(itemId, { ...control, value: !control.value });
      }}
    >
      <Icon
        size={12}
        strokeWidth={2.2}
        className={control.value ? 'text-ink' : 'text-ink-2'}
      />
    </button>
  );
}
