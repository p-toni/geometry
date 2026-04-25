import { useEffect } from 'react';
import { IS_OWNER } from '../../constants';
import { clampItemPosition } from './cellMath';
import { useCanvasStore } from '../../store/canvasStore';

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function useKeyboard(onSave: () => void) {
  const selectedId = useCanvasStore((state) => state.selectedId);
  const selectedItem = useCanvasStore((state) =>
    state.canvas.items.find((item) => item.id === state.selectedId),
  );
  const select = useCanvasStore((state) => state.select);
  const updateItem = useCanvasStore((state) => state.updateItem);
  const deleteItem = useCanvasStore((state) => state.deleteItem);
  const reset = useCanvasStore((state) => state.reset);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        if (IS_OWNER) {
          event.preventDefault();
          onSave();
        }
        return;
      }

      if (typing) return;

      if (event.key === 'Escape') {
        select(null);
        return;
      }

      if (!selectedId || !selectedItem) {
        if (!IS_OWNER && event.key.toLowerCase() === 'r') {
          reset();
        }
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteItem(selectedId);
        return;
      }

      const delta =
        event.key === 'ArrowLeft'
          ? { col: -1, row: 0 }
          : event.key === 'ArrowRight'
            ? { col: 1, row: 0 }
            : event.key === 'ArrowUp'
              ? { col: 0, row: -1 }
              : event.key === 'ArrowDown'
                ? { col: 0, row: 1 }
                : null;

      if (delta) {
        event.preventDefault();
        const next = clampItemPosition(
          selectedItem.col + delta.col,
          selectedItem.row + delta.row,
        );
        updateItem(selectedId, next);
        return;
      }

      if (!IS_OWNER && event.key.toLowerCase() === 'r') {
        reset();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteItem, onSave, reset, select, selectedId, selectedItem, updateItem]);
}
