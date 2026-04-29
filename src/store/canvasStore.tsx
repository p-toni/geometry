import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { BLOCK_DEFAULT_COLORS, BLOCK_DEFAULTS, GRID_COLS, GRID_ROWS } from '../constants';
import { clampItemPosition, clampItemSize } from '../canvas/hooks/cellMath';
import { createId } from '../lib/id';
import type { BlockType, Canvas, Control, Item } from '../types';

export interface CanvasState {
  canvas: Canvas;
  selectedId: string | null;
  dragState: null | { id: string; ghostCol: number; ghostRow: number };
  resizeState: null | { id: string; ghostCols: number; ghostRows: number };
  hasDiverged: boolean;
  statusMessage: string | null;
  select: (id: string | null) => void;
  addItem: (type: BlockType) => string;
  updateItem: (id: string, patch: Partial<Item>) => void;
  setStatusMessage: (message: string | null) => void;
  openMarkdownSource: (fromItemId: string, source: string) => void;
  deleteItem: (id: string) => void;
  addControl: (id: string, control: Control) => void;
  updateControl: (itemId: string, control: Control) => void;
  removeControl: (itemId: string, controlId: string) => void;
  triggerAction: (itemId: string) => void;
  startDrag: (id: string) => void;
  setDragGhost: (col: number, row: number) => void;
  endDrag: (commit: boolean) => void;
  startResize: (id: string) => void;
  setResizeGhost: (cols: number, rows: number) => void;
  endResize: (commit: boolean) => void;
  reset: () => void;
}

export type CanvasStoreApi = StoreApi<CanvasState>;

function cloneCanvas(canvas: Canvas): Canvas {
  return JSON.parse(JSON.stringify(canvas)) as Canvas;
}

function normalizeItem(item: Item): Item {
  const size = clampItemSize(item.cols, item.rows);
  const position = clampItemPosition(item.col, item.row);
  return {
    ...item,
    ...size,
    ...position,
  };
}

function nextPosition(count: number, cols: number, rows: number) {
  const col = (count * 3) % Math.max(1, GRID_COLS - cols);
  const row = (count * 2) % Math.max(1, GRID_ROWS - rows);
  return clampItemPosition(col, row);
}

export function createCanvasStore(initialCanvas: Canvas): CanvasStoreApi {
  const original = cloneCanvas(initialCanvas);

  return createStore<CanvasState>((set, get) => ({
    canvas: cloneCanvas(original),
    selectedId: null,
    dragState: null,
    resizeState: null,
    hasDiverged: false,
    statusMessage: null,
    select: (id) => set({ selectedId: id }),
    addItem: (type) => {
      const state = get();
      const defaults = BLOCK_DEFAULTS[type];
      const position = nextPosition(state.canvas.items.length, defaults.cols, defaults.rows);
      const item: Item = normalizeItem({
        id: createId(type),
        type,
        col: position.col,
        row: position.row,
        cols: defaults.cols,
        rows: defaults.rows,
        color: BLOCK_DEFAULT_COLORS[type],
        label: defaults.label,
        content: defaults.content,
        linkIcon: type === 'link' ? 'link' : undefined,
      });
      set({
        canvas: { ...state.canvas, items: [...state.canvas.items, item] },
        selectedId: item.id,
        hasDiverged: true,
      });
      return item.id;
    },
    updateItem: (id, patch) =>
      set((state) => ({
        canvas: {
          ...state.canvas,
          items: state.canvas.items.map((item) =>
            item.id === id ? normalizeItem({ ...item, ...patch }) : item,
          ),
        },
        hasDiverged: true,
      })),
    setStatusMessage: (message) => set({ statusMessage: message }),
    openMarkdownSource: (fromItemId, source) =>
      set((state) => {
        const fromItem = state.canvas.items.find((item) => item.id === fromItemId);
        const markdownItems = state.canvas.items.filter((item) => item.type === 'markdown');
        const preferred =
          markdownItems.find((item) => item.id.includes('reader')) ??
          [...markdownItems].sort((a, b) => b.cols * b.rows - a.cols * a.rows)[0] ??
          fromItem;
        if (!preferred || preferred.type !== 'markdown') return state;
        const targetId = preferred.id;
        return {
          canvas: {
            ...state.canvas,
            items: state.canvas.items.map((item) => {
              if (item.id !== targetId) return item;
              const controls = item.controls?.map((control) =>
                control.kind === 'selector' ? { ...control, value: source } : control,
              );
              return { ...item, content: source, controls };
            }),
          },
          hasDiverged: true,
        };
      }),
    deleteItem: (id) =>
      set((state) => ({
        canvas: { ...state.canvas, items: state.canvas.items.filter((item) => item.id !== id) },
        selectedId: state.selectedId === id ? null : state.selectedId,
        hasDiverged: true,
      })),
    addControl: (id, control) =>
      set((state) => {
        let added = false;
        const items = state.canvas.items.map((item) => {
          if (item.id !== id) return item;
          const controls = item.controls ?? [];
          if (controls.some((existing) => existing.kind === control.kind)) return item;
          added = true;
          return { ...item, controls: [...controls, control] };
        });
        if (!added) return state;
        return {
          canvas: {
            ...state.canvas,
            items,
          },
          hasDiverged: true,
        };
      }),
    updateControl: (itemId, control) =>
      set((state) => ({
        canvas: {
          ...state.canvas,
          items: state.canvas.items.map((item) => {
            if (item.id !== itemId) return item;
            const controls = (item.controls ?? []).map((existing) =>
              existing.id === control.id ? control : existing,
            );
            const content =
              control.kind === 'selector' && control.affectsContent !== false
                ? control.value
                : item.content;
            return { ...item, controls, content };
          }),
        },
        hasDiverged: true,
      })),
    removeControl: (itemId, controlId) =>
      set((state) => ({
        canvas: {
          ...state.canvas,
          items: state.canvas.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  controls: (item.controls ?? []).filter((control) => control.id !== controlId),
                }
              : item,
          ),
        },
        hasDiverged: true,
      })),
    triggerAction: (itemId) =>
      set((state) => ({
        canvas: {
          ...state.canvas,
          items: state.canvas.items.map((item) =>
            item.id === itemId ? { ...item, refreshKey: (item.refreshKey ?? 0) + 1 } : item,
          ),
        },
        hasDiverged: true,
      })),
    startDrag: (id) => {
      const item = get().canvas.items.find((candidate) => candidate.id === id);
      if (!item) return;
      set({ dragState: { id, ghostCol: item.col, ghostRow: item.row } });
    },
    setDragGhost: (col, row) =>
      set((state) =>
        state.dragState
          ? { dragState: { ...state.dragState, ghostCol: col, ghostRow: row } }
          : state,
      ),
    endDrag: (commit) =>
      set((state) => {
        if (!state.dragState) return { dragState: null };
        const { id, ghostCol, ghostRow } = state.dragState;
        return {
          canvas: commit
            ? {
                ...state.canvas,
                items: state.canvas.items.map((item) =>
                  item.id === id
                    ? normalizeItem({ ...item, col: ghostCol, row: ghostRow })
                    : item,
                ),
              }
            : state.canvas,
          dragState: null,
          hasDiverged: commit ? true : state.hasDiverged,
        };
      }),
    startResize: (id) => {
      const item = get().canvas.items.find((candidate) => candidate.id === id);
      if (!item) return;
      set({ resizeState: { id, ghostCols: item.cols, ghostRows: item.rows } });
    },
    setResizeGhost: (cols, rows) =>
      set((state) =>
        state.resizeState
          ? { resizeState: { ...state.resizeState, ghostCols: cols, ghostRows: rows } }
          : state,
      ),
    endResize: (commit) =>
      set((state) => {
        if (!state.resizeState) return { resizeState: null };
        const { id, ghostCols, ghostRows } = state.resizeState;
        return {
          canvas: commit
            ? {
                ...state.canvas,
                items: state.canvas.items.map((item) =>
                  item.id === id
                    ? normalizeItem({ ...item, cols: ghostCols, rows: ghostRows })
                    : item,
                ),
              }
            : state.canvas,
          resizeState: null,
          hasDiverged: commit ? true : state.hasDiverged,
        };
      }),
    reset: () =>
      set({
        canvas: cloneCanvas(original),
        selectedId: null,
        dragState: null,
        resizeState: null,
        hasDiverged: false,
      }),
  }));
}

const CanvasStoreContext = createContext<CanvasStoreApi | null>(null);

export function CanvasStoreProvider({
  initialCanvas,
  children,
}: {
  initialCanvas: Canvas;
  children: ReactNode;
}) {
  const [store] = useState(() => createCanvasStore(initialCanvas));

  return <CanvasStoreContext.Provider value={store}>{children}</CanvasStoreContext.Provider>;
}

export function useCanvasStore<T>(selector: (state: CanvasState) => T): T {
  const store = useContext(CanvasStoreContext);
  if (!store) throw new Error('useCanvasStore must be used inside CanvasStoreProvider');
  return useStore(store, selector);
}

function orderedControl(control: Control): Control {
  if (control.kind === 'toggle')
    return { id: control.id, kind: 'toggle', value: control.value };
  if (control.kind === 'slider') {
    return {
      id: control.id,
      kind: 'slider',
      value: control.value,
      min: control.min,
      max: control.max,
    };
  }
  if (control.kind === 'selector') {
    return {
      id: control.id,
      kind: 'selector',
      value: control.value,
      options: control.options.map((option) => ({ label: option.label, value: option.value })),
      ...(control.affectsContent === false ? { affectsContent: false as const } : {}),
    };
  }
  if (control.kind === 'align') {
    return { id: control.id, kind: 'align', value: control.value };
  }
  if (control.kind === 'fit') {
    return { id: control.id, kind: 'fit', value: control.value };
  }
  if (control.kind === 'border') {
    return { id: control.id, kind: 'border', value: control.value };
  }
  return { id: control.id, kind: 'action' };
}

function orderedItem(item: Item): Item {
  return {
    id: item.id,
    type: item.type,
    col: item.col,
    row: item.row,
    cols: item.cols,
    rows: item.rows,
    color: item.color,
    label: item.label,
    content: item.content,
    linkIcon: item.linkIcon,
    controls: item.controls?.map(orderedControl),
    refreshKey: item.refreshKey,
  };
}

export function orderedCanvasForSave(canvas: Canvas): Canvas {
  return {
    version: 1,
    slug: canvas.slug,
    title: canvas.title,
    background: canvas.background,
    items: [...canvas.items]
      .sort((a, b) => a.row - b.row || a.col - b.col || a.id.localeCompare(b.id))
      .map(orderedItem),
  };
}
