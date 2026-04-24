import { useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { clampItemPosition } from './cellMath';
import { useCanvasStore } from '../../store/canvasStore';
import type { Item } from '../../types';

function isNoDragTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('[data-no-drag="true"]'));
}

export function useDrag({
  id,
  item,
  cell,
  enabled,
}: {
  id: string;
  item: Item;
  cell: number;
  enabled: boolean;
}) {
  const select = useCanvasStore((state) => state.select);
  const startDrag = useCanvasStore((state) => state.startDrag);
  const setDragGhost = useCanvasStore((state) => state.setDragGhost);
  const endDrag = useCanvasStore((state) => state.endDrag);

  return useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0 || isNoDragTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();

      select(id);
      startDrag(id);

      const originX = event.clientX;
      const originY = event.clientY;
      const originCol = item.col;
      const originRow = item.row;

      const onMove = (moveEvent: PointerEvent) => {
        const next = clampItemPosition(
          originCol + (moveEvent.clientX - originX) / cell,
          originRow + (moveEvent.clientY - originY) / cell,
        );
        setDragGhost(next.col, next.row);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        endDrag(true);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [cell, enabled, endDrag, id, item.col, item.row, select, setDragGhost, startDrag],
  );
}
