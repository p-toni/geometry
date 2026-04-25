import { useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { clampItemSize } from './cellMath';
import { useCanvasStore } from '../../store/canvasStore';
import type { Item } from '../../types';

export function useResize({
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
  const startResize = useCanvasStore((state) => state.startResize);
  const setResizeGhost = useCanvasStore((state) => state.setResizeGhost);
  const endResize = useCanvasStore((state) => state.endResize);

  return useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!enabled || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      select(id);
      startResize(id);

      const target = event.currentTarget;
      const pointerId = event.pointerId;
      const originX = event.clientX;
      const originY = event.clientY;
      const originCols = item.cols;
      const originRows = item.rows;
      let dirty = false;

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        const next = clampItemSize(
          originCols + (moveEvent.clientX - originX) / cell,
          originRows + (moveEvent.clientY - originY) / cell,
        );
        if (next.cols !== originCols || next.rows !== originRows) dirty = true;
        setResizeGhost(next.cols, next.rows);
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
        endResize(dirty);
      }

      function onCancel(cancelEvent: PointerEvent) {
        if (cancelEvent.pointerId !== pointerId) return;
        cleanup();
        endResize(false);
      }

      function onKey(keyEvent: KeyboardEvent) {
        if (keyEvent.key === 'Escape') {
          cleanup();
          endResize(false);
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
    [
      cell,
      enabled,
      endResize,
      id,
      item.cols,
      item.rows,
      select,
      setResizeGhost,
      startResize,
    ],
  );
}
