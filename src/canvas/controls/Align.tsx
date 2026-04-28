import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import type { AlignControl } from '../../types';

const CYCLE: AlignControl['value'][] = ['left', 'center', 'right'];
const ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight };

export function Align({ itemId, control }: { itemId: string; control: AlignControl }) {
  const updateControl = useCanvasStore((state) => state.updateControl);
  const Icon = ICONS[control.value];

  return (
    <button
      type="button"
      aria-label={`Text align: ${control.value}`}
      title={`Text align: ${control.value}`}
      data-no-drag="true"
      className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/10 hover:text-ink active:scale-[0.96]"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        const next = CYCLE[(CYCLE.indexOf(control.value) + 1) % CYCLE.length];
        updateControl(itemId, { ...control, value: next });
      }}
    >
      <Icon size={12} />
    </button>
  );
}
