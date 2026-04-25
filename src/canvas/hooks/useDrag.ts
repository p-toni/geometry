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

      const target = event.currentTarget;
      const pointerId = event.pointerId;
      const originX = event.clientX;
      const originY = event.clientY;
      const originCol = item.col;
      const originRow = item.row;
      let dirty = false;

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        const next = clampItemPosition(
          originCol + (moveEvent.clientX - originX) / cell,
          originRow + (moveEvent.clientY - originY) / cell,
        );
        if (next.col !== originCol || next.row !== originRow) dirty = true;
        setDragGhost(next.col, next.row);
      };

      const cleanup = () => {
        target.removeEventListener('pointermove', onMove);
        target.removeEventListener('pointerup', onUp);
        target.removeEventListener('pointercancel', onCancel);
        window.removeEventListener('keydown', onKey);
        if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
      };

      function onUp(upEvent: PointerEvent) {
        if (upEvent.pointerId !== pointerId) return;
        cleanup();
        endDrag(dirty);
      }

      function onCancel(cancelEvent: PointerEvent) {
        if (cancelEvent.pointerId !== pointerId) return;
        cleanup();
        endDrag(false);
      }

      function onKey(keyEvent: KeyboardEvent) {
        if (keyEvent.key === 'Escape') {
          cleanup();
          endDrag(false);
        }
      }

      try {
        target.setPointerCapture(pointerId);
      } catch {
        // pointer capture can fail in tests or if the pointer was already released
      }
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', onUp);
      target.addEventListener('pointercancel', onCancel);
      window.addEventListener('keydown', onKey);
    },
    [cell, enabled, endDrag, id, item.col, item.row, select, setDragGhost, startDrag],
  );
}
