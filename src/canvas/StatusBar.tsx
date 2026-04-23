import { GRID_COLS, GRID_ROWS } from '../constants';
import { useCanvasStore } from '../store/canvasStore';

export function StatusBar({ cell }: { cell: number }) {
  const selectedId = useCanvasStore((state) => state.selectedId);
  const count = useCanvasStore((state) => state.canvas.items.length);

  return (
    <footer className="flex h-[var(--footer-h)] items-center justify-between border-t border-line bg-paper/95 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
      <span>
        {GRID_COLS}x{GRID_ROWS} · {Math.round(cell)}px
      </span>
      <span>{count} blocks</span>
      <span>{selectedId ? selectedId : 'none selected'}</span>
    </footer>
  );
}
