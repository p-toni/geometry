import { motion } from 'framer-motion';
import { Grip, ListFilter, SlidersHorizontal } from 'lucide-react';
import { useState, type PointerEvent as ReactPointerEvent, type ReactElement } from 'react';
import { CARD_SURFACES, COLORS } from '../constants';
import { spring } from '../design/motion';
import { cn } from '../lib/cn';
import { useCanvasStore } from '../store/canvasStore';
import type { Control, Item } from '../types';
import { cellToPx } from './hooks/cellMath';
import { useDrag } from './hooks/useDrag';
import { useResize } from './hooks/useResize';
import { Action } from './controls/Action';
import { Toggle } from './controls/Toggle';
import {
  Code,
  Embed,
  H1,
  H2,
  H3,
  Image,
  Link,
  Markdown,
  P,
  Quote,
  type BlockRendererProps,
} from './blocks';

const renderers = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  quote: Quote,
  markdown: Markdown,
  code: Code,
  embed: Embed,
  image: Image,
  link: Link,
} satisfies Record<Item['type'], (props: BlockRendererProps) => ReactElement>;

const CHROME_HEIGHT = 25;

function controlValues(controls: Control[] | undefined) {
  return {
    toggled: controls?.find((control) => control.kind === 'toggle')?.value ?? false,
    sliderValue: controls?.find((control) => control.kind === 'slider')?.value ?? 1,
    selectorValue: controls?.find((control) => control.kind === 'selector')?.value ?? null,
  };
}

function ControlChip({
  itemId,
  control,
  isOpen,
  setOpenControlId,
}: {
  itemId: string;
  control: Control;
  isOpen: boolean;
  setOpenControlId: (id: string | null) => void;
}) {
  const updateControl = useCanvasStore((state) => state.updateControl);
  const iconClass = 'h-6 w-6 rounded-t-[4px] rounded-b-none border border-ink/10 bg-paper/95';

  if (control.kind === 'toggle') return <Toggle itemId={itemId} control={control} />;
  if (control.kind === 'action') return <Action itemId={itemId} control={control} />;

  return (
    <span className="relative inline-flex" data-no-drag="true" onPointerDown={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={control.kind === 'slider' ? 'Open slider' : 'Open selector'}
        title={control.kind === 'slider' ? 'Slider' : 'Selector'}
        className={cn(
          'inline-flex items-center justify-center text-ink-2 shadow-sm transition hover:border-accent-ink hover:text-ink',
          iconClass,
          isOpen && 'border-accent-ink text-accent-ink',
        )}
        onClick={(event) => {
          event.stopPropagation();
          setOpenControlId(isOpen ? null : control.id);
        }}
      >
        {control.kind === 'slider' ? <SlidersHorizontal size={12} /> : <ListFilter size={12} />}
      </button>
      {isOpen && (
        <span className="absolute left-0 top-full z-50 mt-1 rounded-[6px] border border-ink/10 bg-paper p-2 shadow-lg">
          {control.kind === 'slider' ? (
            <label className="inline-flex h-6 items-center gap-2" title="Slider">
              <span className="font-mono text-[10px] text-ink-2">{control.value.toFixed(2)}</span>
              <input
                aria-label="Slider"
                type="range"
                min={control.min}
                max={control.max}
                step={Math.max((control.max - control.min) / 100, Number.EPSILON)}
                value={control.value}
                className="h-4 w-24 accent-[var(--accent-ink)]"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (!Number.isFinite(next)) return;
                  updateControl(itemId, { ...control, value: next });
                }}
              />
            </label>
          ) : (
            <span aria-label="Selector" className="flex min-w-36 flex-col gap-1">
              {control.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'rounded-[4px] px-2 py-1 text-left font-mono text-[10px] transition hover:bg-paper-2',
                    option.value === control.value ? 'bg-paper-2 text-accent-ink' : 'text-ink-2',
                  )}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    updateControl(itemId, { ...control, value: option.value });
                    setOpenControlId(null);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

function BlockChrome({
  item,
  isSelected,
  openControlId,
  setOpenControlId,
  onDragPointerDown,
  onSelect,
}: {
  item: Item;
  isSelected: boolean;
  openControlId: string | null;
  setOpenControlId: (id: string | null) => void;
  onDragPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onSelect: () => void;
}) {
  const liftInside = item.row === 0;

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 z-30 flex max-w-full items-end gap-1',
        liftInside ? 'top-1' : 'top-0',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex h-6 min-w-0 max-w-[min(280px,100%)] cursor-grab items-center gap-2 rounded-t-[4px] rounded-b-none border border-ink/10 bg-paper/95 px-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-2 shadow-sm active:cursor-grabbing',
          isSelected && 'border-accent-ink bg-paper text-ink',
        )}
        onPointerDown={onDragPointerDown}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <span className="truncate font-semibold">{item.label}</span>
        <span className="shrink-0 text-ink-2/80">
          {item.cols}&times;{item.rows}
        </span>
      </div>
      {(item.controls ?? []).length > 0 && (
        <div className="pointer-events-auto flex h-6 shrink-0 items-center gap-0.5 rounded-t-[4px] rounded-b-none border border-ink/10 bg-paper/90 px-1 shadow-sm">
          {(item.controls ?? []).map((control) => (
            <ControlChip
              key={control.id}
              itemId={item.id}
              control={control}
              isOpen={openControlId === control.id}
              setOpenControlId={setOpenControlId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Block({ item, cell, isMobile }: { item: Item; cell: number; isMobile: boolean }) {
  const selectedId = useCanvasStore((state) => state.selectedId);
  const dragState = useCanvasStore((state) => state.dragState);
  const resizeState = useCanvasStore((state) => state.resizeState);
  const select = useCanvasStore((state) => state.select);
  const isSelected = selectedId === item.id;
  const isDragging = dragState?.id === item.id;
  const isResizing = resizeState?.id === item.id;
  const color = COLORS.find((entry) => entry.token === item.color) ?? COLORS[0];
  const surface = CARD_SURFACES[item.type];
  const cardBackground = `color-mix(in srgb, ${color.hex} 62%, ${surface.background})`;
  const Renderer = renderers[item.type];
  const values = controlValues(item.controls);
  const renderCol = isDragging ? dragState.ghostCol : item.col;
  const renderRow = isDragging ? dragState.ghostRow : item.row;
  const renderCols = isResizing ? resizeState.ghostCols : item.cols;
  const renderRows = isResizing ? resizeState.ghostRows : item.rows;
  const chromeOffset = renderRow === 0 ? 0 : CHROME_HEIGHT;
  const onDragPointerDown = useDrag({ id: item.id, item, cell, enabled: !isMobile });
  const onResizePointerDown = useResize({ id: item.id, item, cell, enabled: !isMobile });
  const isActiveGesture = isDragging || isResizing;
  const [openControlId, setOpenControlId] = useState<string | null>(null);

  if (isMobile) {
    return (
      <article
        className="relative flex min-h-20 flex-col overflow-hidden rounded-[16px] border border-ink/10 p-3 shadow-[0_4px_16px_rgba(11,28,48,0.05)]"
        style={{
          background: cardBackground,
          aspectRatio: `${item.cols} / ${item.rows}`,
          maxHeight: '60vh',
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
            <span className="truncate font-semibold">{item.label}</span>
            <span className="shrink-0 text-ink-2/70">
              {item.cols}&times;{item.rows}
            </span>
          </div>
          {(item.controls ?? []).length > 0 ? (
            <div className="flex shrink-0 items-center gap-0.5">
              {(item.controls ?? []).map((control) => (
                <ControlChip
                  key={control.id}
                  itemId={item.id}
                  control={control}
                  isOpen={openControlId === control.id}
                  setOpenControlId={setOpenControlId}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <Renderer item={item} cell={cell} {...values} />
        </div>
      </article>
    );
  }

  return (
    <motion.article
      data-testid={`block-${item.type}`}
      className={cn(
        'group absolute left-0 top-0 overflow-visible outline-none',
        'touch-none select-none',
      )}
      style={{
        zIndex: isSelected ? 50 : 1 + item.row,
        transformOrigin: 'center',
      }}
      animate={{
        x: cellToPx(renderCol, cell),
        y: cellToPx(renderRow, cell) - chromeOffset,
        width: cellToPx(renderCols, cell),
        height: cellToPx(renderRows, cell) + chromeOffset,
        scale: isSelected ? 1.01 : 1,
      }}
      transition={isActiveGesture ? { duration: 0 } : spring.drag}
      onPointerDown={onDragPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        setOpenControlId(null);
        select(item.id);
      }}
    >
      <BlockChrome
        item={item}
        isSelected={isSelected}
        openControlId={openControlId}
        setOpenControlId={setOpenControlId}
        onDragPointerDown={onDragPointerDown}
        onSelect={() => {
          setOpenControlId(null);
          select(item.id);
        }}
      />

      <div
        className={cn(
          'absolute left-0 right-0 overflow-hidden rounded-[16px] border p-3 shadow-[0_4px_16px_rgba(11,28,48,0.05)]',
          item.type === 'link' && 'p-2',
          isSelected
            ? 'border-accent-ink ring-2 ring-accent/70 ring-offset-1 ring-offset-paper'
            : 'border-ink/10',
        )}
        style={{
          top: chromeOffset,
          height: cellToPx(renderRows, cell),
          background: cardBackground,
        }}
      >
        <Renderer item={item} cell={cell} {...values} />

        <button
          type="button"
          aria-label="Resize block"
          title="Resize diagonally"
          data-no-drag="true"
          className={cn(
            'absolute bottom-1 right-1 z-20 flex h-8 w-8 cursor-nwse-resize items-center justify-center rounded-full border border-ink/10 bg-paper/90 text-ink-2 opacity-0 shadow-sm transition hover:border-accent-ink group-hover:opacity-70 focus-visible:opacity-100',
            isSelected && 'opacity-100 group-hover:opacity-100',
          )}
          onPointerDown={onResizePointerDown}
        >
          <Grip size={13} />
        </button>
      </div>
    </motion.article>
  );
}
