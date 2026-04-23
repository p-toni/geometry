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

      const originX = event.clientX;
      const originY = event.clientY;
      const originCols = item.cols;
      const originRows = item.rows;

      const onMove = (moveEvent: PointerEvent) => {
        const next = clampItemSize(
          originCols + (moveEvent.clientX - originX) / cell,
          originRows + (moveEvent.clientY - originY) / cell,
          item.col,
          item.row,
        );
        setResizeGhost(next.cols, next.rows);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        endResize(true);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [
      cell,
      enabled,
      endResize,
      id,
      item.col,
      item.cols,
      item.row,
      item.rows,
      select,
      setResizeGhost,
      startResize,
    ],
  );
}
