import { GRID_COLS, GRID_ROWS } from '../constants';
import { useCanvasStore } from '../store/canvasStore';

export function StatusBar({ cell }: { cell: number }) {
  const selectedItem = useCanvasStore((state) =>
    state.canvas.items.find((item) => item.id === state.selectedId),
  );
  const count = useCanvasStore((state) => state.canvas.items.length);
  const statusMessage = useCanvasStore((state) => state.statusMessage);
  const details =
    statusMessage ??
    (selectedItem
      ? `${selectedItem.id} · x${selectedItem.col} y${selectedItem.row} · ${selectedItem.cols}x${selectedItem.rows}`
      : 'none selected');

  return (
    <footer className="flex h-[var(--footer-h)] items-center justify-between gap-3 border-t border-line/80 bg-white/80 px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 shadow-[0_-8px_24px_rgba(11,28,48,0.04)] backdrop-blur-xl">
      <span>
        {GRID_COLS}x{GRID_ROWS} · {Math.round(cell)}px
      </span>
      <span>{count} blocks</span>
      <span className="min-w-0 truncate">{details}</span>
    </footer>
  );
}
