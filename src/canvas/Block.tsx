function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.179 ? 'var(--ink)' : '#ffffff';
}

import { motion, useReducedMotion } from 'framer-motion';
import { Grip, ListFilter, SlidersHorizontal } from 'lucide-react';
import {
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';
import { COLORS } from '../constants';
import { markdownSources } from '../content/markdownRegistry';
import { sharpSources } from '../content/sharpRegistry';
import { spring } from '../design/motion';
import { cn } from '../lib/cn';
import { useCanvasStore } from '../store/canvasStore';
import type { AlignControl, Control, Item } from '../types';
import { cellToPx } from './hooks/cellMath';
import { useDrag } from './hooks/useDrag';
import { useResize } from './hooks/useResize';
import { Action } from './controls/Action';
import { Align } from './controls/Align';
import { Border } from './controls/Border';
import { Fit } from './controls/Fit';
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
  Shader,
  ThreeSharp,
  Voxel,
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
  shader: Shader,
  voxel: Voxel,
  threeSharp: ThreeSharp,
} satisfies Record<Item['type'], (props: BlockRendererProps) => ReactElement>;

const CHROME_HEIGHT = 28;
const NAVIGABLE_TYPES: Item['type'][] = ['markdown', 'threeSharp'];
type SourceOption = { label: string; value: string };

function controlValues(controls: Control[] | undefined) {
  return {
    toggled: controls?.find((control) => control.kind === 'toggle')?.value ?? false,
    sliderValue: controls?.find((control) => control.kind === 'slider')?.value ?? 1,
    selectorValue: controls?.find((control) => control.kind === 'selector')?.value ?? null,
    alignValue:
      controls?.find((c): c is AlignControl => c.kind === 'align')?.value ?? ('left' as const),
    fitEnabled: controls?.find((control) => control.kind === 'fit')?.value ?? false,
    borderEnabled: controls?.find((control) => control.kind === 'border')?.value ?? false,
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
  const iconClass =
    'inline-flex h-5 w-5 items-center justify-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/10 hover:text-ink active:scale-[0.96]';

  if (control.kind === 'toggle') return <Toggle itemId={itemId} control={control} />;
  if (control.kind === 'action') return <Action itemId={itemId} control={control} />;
  if (control.kind === 'align') return <Align itemId={itemId} control={control} />;
  if (control.kind === 'fit') return <Fit itemId={itemId} control={control} />;
  if (control.kind === 'border') return <Border itemId={itemId} control={control} />;

  return (
    <span
      className="relative inline-flex"
      data-no-drag="true"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label={control.kind === 'slider' ? 'Open slider' : 'Open selector'}
        title={control.kind === 'slider' ? 'Slider' : 'Selector'}
        className={cn(iconClass, isOpen && 'bg-accent/10 text-accent-ink')}
        onClick={(event) => {
          event.stopPropagation();
          setOpenControlId(isOpen ? null : control.id);
        }}
      >
        {control.kind === 'slider' ? <SlidersHorizontal size={12} /> : <ListFilter size={12} />}
      </button>
      {isOpen && (
        <span
          className="absolute right-0 top-full z-50 mt-1 rounded-[6px] border border-ink/10 bg-paper p-2 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          {control.kind === 'slider' ? (
            <label className="inline-flex h-6 items-center gap-2" title="Slider">
              <span className="font-mono text-[10px] text-ink-2">
                {control.value.toFixed(2)}
              </span>
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
                    'rounded-[4px] px-2 py-1 text-left font-mono text-[10px] transition-colors duration-150 ease-out hover:bg-paper-2',
                    option.value === control.value
                      ? 'bg-paper-2 text-accent-ink'
                      : 'text-ink-2',
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

function uniqueSources(sources: SourceOption[]): SourceOption[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (!source.value || seen.has(source.value)) return false;
    seen.add(source.value);
    return true;
  });
}

function optionsWithCurrent(options: SourceOption[], current: string | null): SourceOption[] {
  if (!current) return uniqueSources(options);
  const unique = uniqueSources(options);
  if (unique.some((source) => source.value === current)) return unique;
  return [...unique, { label: 'current', value: current }];
}

function currentSharpUrl(item: Item): string | null {
  try {
    const parsed = JSON.parse(item.content) as { plyUrl?: unknown };
    return typeof parsed.plyUrl === 'string' && parsed.plyUrl.trim() ? parsed.plyUrl : null;
  } catch {
    return null;
  }
}

function isIndexMarkdown(item: Item): boolean {
  if (item.type !== 'markdown') return false;
  const label = item.label.trim().toLowerCase();
  const id = item.id.trim().toLowerCase();
  return label === 'index' || id.endsWith('-index') || id.includes('index');
}

function patchSharpUrl(item: Item, url: string): string {
  try {
    const parsed = JSON.parse(item.content) as Record<string, unknown>;
    return JSON.stringify({ ...parsed, plyUrl: url }, null, 2);
  } catch {
    return JSON.stringify({ plyUrl: url }, null, 2);
  }
}

function sourceOptionsFor(
  item: Item,
  sharpSourceOptions: SourceOption[],
): { current: string | null; options: SourceOption[] } {
  if (item.type === 'markdown') {
    return {
      current: item.content,
      options: optionsWithCurrent(
        [
          ...(item.controls ?? [])
            .filter((control) => control.kind === 'selector')
            .flatMap((control) => control.options),
          ...markdownSources,
        ],
        item.content,
      ),
    };
  }

  if (item.type === 'threeSharp') {
    const current = currentSharpUrl(item);
    return {
      current,
      options: optionsWithCurrent(sharpSourceOptions, current),
    };
  }

  return { current: null, options: [] };
}

function controlsWithContentSelectorValue(item: Item, value: string): Control[] | undefined {
  const controls = item.controls;
  if (!controls) return undefined;
  return controls.map((control) =>
    control.kind === 'selector' && control.affectsContent !== false
      ? { ...control, value }
      : control,
  );
}

function BlockNavigator({
  item,
  setOpenControlId,
}: {
  item: Item;
  setOpenControlId: (id: string | null) => void;
}) {
  const updateItem = useCanvasStore((state) => state.updateItem);
  const [runtimeSharpSources, setRuntimeSharpSources] = useState<SourceOption[]>(sharpSources);

  useEffect(() => {
    if (item.type !== 'threeSharp' || !import.meta.env.DEV) return undefined;
    let active = true;
    fetch('/__sharp/list')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!active || !Array.isArray(payload)) return;
        const sources = payload.filter((source): source is SourceOption => {
          if (typeof source !== 'object' || source === null) return false;
          const candidate = source as Partial<SourceOption>;
          return (
            typeof candidate.label === 'string' &&
            typeof candidate.value === 'string' &&
            candidate.value.endsWith('.splt')
          );
        });
        setRuntimeSharpSources(uniqueSources([...sharpSources, ...sources]));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [item.type]);

  if (!NAVIGABLE_TYPES.includes(item.type)) return null;
  if (isIndexMarkdown(item)) return null;

  const { current, options } = sourceOptionsFor(item, runtimeSharpSources);
  if (!current || options.length < 2) return null;

  const index = options.findIndex((option) => option.value === current);
  if (index < 0) return null;

  const go = (direction: -1 | 1) => {
    const next = options.at((index + direction + options.length) % options.length);
    if (!next) return;
    setOpenControlId(null);
    if (item.type === 'markdown') {
      updateItem(item.id, {
        content: next.value,
        controls: controlsWithContentSelectorValue(item, next.value),
      });
      return;
    }
    if (item.type === 'threeSharp') {
      updateItem(item.id, { content: patchSharpUrl(item, next.value) });
    }
  };

  const buttonClass =
    'inline-flex h-5 w-5 items-center justify-center rounded-sm font-mono text-[11px] text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/10 hover:text-ink active:scale-[0.96]';

  return (
    <>
      <span className="my-1 w-px shrink-0 bg-ink/15" />
      <div className="flex items-center px-1" data-no-drag="true">
        <button
          type="button"
          aria-label="Previous artifact"
          title="Previous artifact"
          className={buttonClass}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            go(-1);
          }}
        >
          &lt;
        </button>
        <span className="px-0.5 font-mono text-[10px] text-ink-2/40">|</span>
        <button
          type="button"
          aria-label="Next artifact"
          title="Next artifact"
          className={buttonClass}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            go(1);
          }}
        >
          &gt;
        </button>
      </div>
    </>
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
  const hasControls = (item.controls ?? []).length > 0;

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 z-30 flex max-w-full items-end',
        liftInside ? 'top-1' : 'top-0',
      )}
    >
      <div
        className={cn(
          'pointer-events-auto flex h-6 min-w-0 max-w-[min(320px,100%)] items-stretch overflow-visible rounded-lg border bg-paper/95 shadow-sm backdrop-blur-sm transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100',
          isSelected
            ? 'border-accent-ink opacity-100'
            : 'border-ink/15 opacity-50 hover:opacity-100',
        )}
      >
        {/* Label + drag handle */}
        <div
          className={cn(
            'flex min-w-0 cursor-grab items-center gap-2 px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] active:cursor-grabbing',
            isSelected ? 'text-ink' : 'text-ink-2',
          )}
          onPointerDown={onDragPointerDown}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
        >
          <span className="min-w-0 truncate font-semibold" title={item.label}>
            {item.label}
          </span>
          <span className="shrink-0 opacity-40">
            {item.cols}×{item.rows}
          </span>
        </div>

        <BlockNavigator item={item} setOpenControlId={setOpenControlId} />

        {/* Divider + controls */}
        {hasControls && (
          <>
            <span className="my-1 w-px shrink-0 bg-ink/15" />
            <div className="flex items-center gap-0.5 px-1">
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
          </>
        )}
      </div>
    </div>
  );
}

export function Block({
  item,
  cell,
  isMobile,
}: {
  item: Item;
  cell: number;
  isMobile: boolean;
}) {
  const selectedId = useCanvasStore((state) => state.selectedId);
  const dragState = useCanvasStore((state) => state.dragState);
  const resizeState = useCanvasStore((state) => state.resizeState);
  const select = useCanvasStore((state) => state.select);
  const isSelected = selectedId === item.id;
  const isDragging = dragState?.id === item.id;
  const isResizing = resizeState?.id === item.id;
  const reduceMotion = useReducedMotion();
  const color = COLORS.find((entry) => entry.token === item.color) ?? COLORS[0];
  const cardBackground = color.hex;
  const textColor = getContrastColor(color.hex);
  const Renderer = renderers[item.type];
  const allValues = controlValues(item.controls);
  const { borderEnabled: _, ...values } = allValues;
  void _;
  const showInnerFrame = allValues.borderEnabled;
  const FULL_BLEED_TYPES: Item['type'][] = ['shader', 'embed', 'image', 'voxel', 'threeSharp'];
  const isFullBleed = FULL_BLEED_TYPES.includes(item.type);
  const innerFramePadding = isFullBleed ? '' : 'p-3';
  const innerFrameSurface = isFullBleed
    ? 'border-0 bg-transparent'
    : 'border border-ink/15 bg-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]';
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
        data-canvas-block="true"
        className="relative flex min-h-20 flex-col overflow-hidden rounded-[8px] border border-line/70 p-4 shadow-[0_10px_30px_rgba(23,26,31,0.06)]"
        style={{
          background: cardBackground,
          color: textColor,
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
          {(item.controls ?? []).filter(
            (c) =>
              c.kind === 'toggle' ||
              c.kind === 'align' ||
              c.kind === 'action' ||
              c.kind === 'fit' ||
              c.kind === 'border',
          ).length > 0 ? (
            <div className="flex shrink-0 items-center gap-0.5">
              {(item.controls ?? [])
                .filter(
                  (c) =>
                    c.kind === 'toggle' ||
                    c.kind === 'align' ||
                    c.kind === 'action' ||
                    c.kind === 'fit' ||
                    c.kind === 'border',
                )
                .map((control) => (
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
          {showInnerFrame ? (
            <div
              className={cn(
                'h-full w-full overflow-hidden rounded-[12px]',
                innerFrameSurface,
                innerFramePadding,
              )}
              style={{ color: 'var(--ink)' }}
            >
              <Renderer item={item} cell={cell} {...values} />
            </div>
          ) : (
            <Renderer item={item} cell={cell} {...values} />
          )}
        </div>
      </article>
    );
  }

  return (
    <motion.article
      data-canvas-block="true"
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
        scale: reduceMotion ? 1 : isSelected ? 1.01 : 1,
      }}
      transition={isActiveGesture || reduceMotion ? { duration: 0 } : spring.drag}
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
          'absolute left-0 right-0 overflow-hidden rounded-[8px] border border-line/70 shadow-[0_10px_30px_rgba(23,26,31,0.06)]',
          showInnerFrame ? 'p-2' : 'p-4',
          isSelected
            ? 'border border-accent-ink ring-2 ring-accent/70 ring-offset-1 ring-offset-paper'
            : null,
        )}
        style={{
          top: chromeOffset,
          height: cellToPx(renderRows, cell),
          background: cardBackground,
          color: textColor,
        }}
      >
        {showInnerFrame ? (
          <div
            className={cn(
              'h-full w-full overflow-hidden rounded-[12px]',
              innerFrameSurface,
              innerFramePadding,
            )}
            style={{ color: 'var(--ink)' }}
          >
            <Renderer item={item} cell={cell} {...values} />
          </div>
        ) : (
          <Renderer item={item} cell={cell} {...values} />
        )}

        <button
          type="button"
          aria-label="Resize block"
          title="Resize diagonally"
          data-no-drag="true"
          className={cn(
            'absolute bottom-1 right-1 z-20 flex h-8 w-8 cursor-nwse-resize items-center justify-center rounded-full border border-ink/10 bg-paper/90 text-ink-2 opacity-0 shadow-sm transition-[opacity,border-color] duration-150 ease-out hover:border-accent-ink group-hover:opacity-70 focus-visible:opacity-100',
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
