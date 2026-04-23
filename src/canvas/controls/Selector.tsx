import { ListFilter } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import type { SelectorControl } from '../../types';

export function Selector({ itemId, control }: { itemId: string; control: SelectorControl }) {
  const updateControl = useCanvasStore((state) => state.updateControl);

  return (
    <label
      data-no-drag="true"
      className="inline-flex h-6 items-center gap-1 rounded-full border border-ink/15 bg-paper/85 pl-2 pr-1"
      onPointerDown={(event) => event.stopPropagation()}
      title="Selector"
    >
      <ListFilter size={12} />
      <select
        aria-label="Selector"
        value={control.value}
        className="max-w-28 bg-transparent font-mono text-[10px] outline-none"
        onChange={(event) => {
          updateControl(itemId, { ...control, value: event.target.value });
        }}
      >
        {control.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
