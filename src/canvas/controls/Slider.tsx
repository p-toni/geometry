import { SlidersHorizontal } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import type { SliderControl } from '../../types';

export function Slider({ itemId, control }: { itemId: string; control: SliderControl }) {
  const updateControl = useCanvasStore((state) => state.updateControl);

  return (
    <label
      data-no-drag="true"
      className="inline-flex h-6 items-center gap-1 rounded-full border border-ink/15 bg-paper/85 px-2"
      onPointerDown={(event) => event.stopPropagation()}
      title="Slider"
    >
      <SlidersHorizontal size={12} />
      <input
        aria-label="Slider"
        type="range"
        min={control.min}
        max={control.max}
        step={Math.max((control.max - control.min) / 100, Number.EPSILON)}
        value={control.value}
        className="h-4 w-16 accent-[var(--accent-ink)]"
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          updateControl(itemId, { ...control, value: next });
        }}
      />
    </label>
  );
}
