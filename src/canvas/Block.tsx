import { motion } from 'framer-motion';
import { Grip } from 'lucide-react';
import type { ReactElement } from 'react';
import { COLORS } from '../constants';
import { spring } from '../design/motion';
import { cn } from '../lib/cn';
import { useCanvasStore } from '../store/canvasStore';
import type { Control, Item } from '../types';
import { cellToPx } from './hooks/cellMath';
import { useDrag } from './hooks/useDrag';
import { useResize } from './hooks/useResize';
import { Action } from './controls/Action';
import { Selector } from './controls/Selector';
import { Slider } from './controls/Slider';
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

function controlValues(controls: Control[] | undefined) {
  return {
    toggled: controls?.find((control) => control.kind === 'toggle')?.value ?? false,
    sliderValue: controls?.find((control) => control.kind === 'slider')?.value ?? 1,
    selectorValue: controls?.find((control) => control.kind === 'selector')?.value ?? null,
  };
}

function ControlChip({ itemId, control }: { itemId: string; control: Control }) {
  if (control.kind === 'toggle') return <Toggle itemId={itemId} control={control} />;
  if (control.kind === 'slider') return <Slider itemId={itemId} control={control} />;
  if (control.kind === 'selector') return <Selector itemId={itemId} control={control} />;
  return <Action itemId={itemId} control={control} />;
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
  const Renderer = renderers[item.type];
  const values = controlValues(item.controls);
  const renderCol = isDragging ? dragState.ghostCol : item.col;
  const renderRow = isDragging ? dragState.ghostRow : item.row;
  const renderCols = isResizing ? resizeState.ghostCols : item.cols;
  const renderRows = isResizing ? resizeState.ghostRows : item.rows;
  const onDragPointerDown = useDrag({ id: item.id, item, cell, enabled: !isMobile });
  const onResizePointerDown = useResize({ id: item.id, item, cell, enabled: !isMobile });
  const isActiveGesture = isDragging || isResizing;

  if (isMobile) {
    return (
      <article
        className="relative min-h-40 overflow-hidden rounded-[8px] border border-ink/10 p-4 shadow-sm"
        style={{ backgroundColor: color.hex }}
      >
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
          {item.label}
        </div>
        <Renderer item={item} cell={cell} {...values} />
      </article>
    );
  }

  return (
    <motion.article
      data-testid={`block-${item.type}`}
      className={cn(
        'absolute left-0 top-0 overflow-hidden rounded-[8px] border p-3 shadow-sm outline-none',
        'touch-none select-none',
        isSelected ? 'border-accent-ink ring-2 ring-accent/40' : 'border-ink/10',
      )}
      style={{
        backgroundColor: color.hex,
        zIndex: isSelected ? 40 : 1 + item.row,
        transformOrigin: 'center',
      }}
      animate={{
        x: cellToPx(renderCol, cell),
        y: cellToPx(renderRow, cell),
        width: cellToPx(renderCols, cell),
        height: cellToPx(renderRows, cell),
        scale: isSelected ? 1.01 : 1,
      }}
      transition={isActiveGesture ? { duration: 0 } : spring.drag}
      onPointerDown={onDragPointerDown}
      onClick={(event) => {
        event.stopPropagation();
        select(item.id);
      }}
    >
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100%-16px)] flex-wrap items-center gap-1">
        <span
          className="rounded-full border border-ink/10 bg-paper/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 shadow-sm"
          style={{
            fontVariationSettings: `'opsz' 9, 'SOFT' ${isDragging || isResizing ? 100 : 0}, 'WONK' 0`,
          }}
        >
          {item.label}
        </span>
        <span className="pointer-events-auto flex flex-wrap gap-1">
          {(item.controls ?? []).map((control) => (
            <ControlChip key={control.id} itemId={item.id} control={control} />
          ))}
        </span>
      </div>

      <div className="h-full overflow-hidden pt-8">
        <Renderer item={item} cell={cell} {...values} />
      </div>

      <button
        type="button"
        aria-label="Resize block"
        title="Resize"
        data-no-drag="true"
        className={cn(
          'absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 bg-paper/85 text-ink-2 opacity-0 transition',
          isSelected && 'opacity-100',
        )}
        onPointerDown={onResizePointerDown}
      >
        <Grip size={13} />
      </button>
    </motion.article>
  );
}
