import {
  AlignCenter,
  Bot,
  Boxes,
  Check,
  Code2,
  FilePlus,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  ListFilter,
  Maximize2,
  MousePointerClick,
  Square,
  Pilcrow,
  Plus,
  Quote,
  RefreshCw,
  Save,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  ToggleLeft,
  Trash2,
  Type,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type FocusEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IS_OWNER } from '../constants';
import { markdownSources } from '../content/markdownRegistry';
import { createId } from '../lib/id';
import { slugToPath } from '../lib/paths';
import { canvasSlugOptions } from '../routes/canvasRegistry';
import { shaderSelectorOptions } from '../lib/shaderRegistry';
import { orderedCanvasForSave, useCanvasStore } from '../store/canvasStore';
import type { BlockType, Canvas, Control, Item } from '../types';

const blockIcons: Record<BlockType, typeof Heading1> = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  p: Pilcrow,
  quote: Quote,
  markdown: FilePlus,
  code: Code2,
  embed: MousePointerClick,
  image: ImageIcon,
  link: LinkIcon,
  shader: Sparkles,
  voxel: Boxes,
};

const blockGroups: { label: string; icon: typeof Heading1; types: BlockType[] }[] = [
  { label: 'text', icon: Type, types: ['h1', 'h2', 'h3', 'p', 'quote'] },
  { label: 'rich', icon: Shapes, types: ['markdown', 'code', 'embed', 'image'] },
  { label: 'generative', icon: Sparkles, types: ['shader', 'voxel'] },
  { label: 'navigation', icon: LinkIcon, types: ['link'] },
];

const controlSupport: Record<Control['kind'], BlockType[]> = {
  toggle: ['h1', 'h2', 'h3', 'p', 'quote', 'code', 'image', 'markdown'],
  slider: ['h1', 'h2', 'h3', 'p', 'image', 'shader', 'voxel'],
  selector: ['markdown', 'link', 'code', 'shader', 'voxel'],
  action: ['markdown', 'code', 'shader', 'voxel'],
  align: ['h1', 'h2', 'h3', 'p', 'quote', 'markdown'],
  fit: ['h1', 'h2', 'h3', 'p', 'quote'],
  border: [
    'h1',
    'h2',
    'h3',
    'p',
    'quote',
    'markdown',
    'code',
    'embed',
    'image',
    'link',
    'shader',
    'voxel',
  ],
};

function controlApplies(kind: Control['kind'], item: Item | undefined) {
  return Boolean(item && controlSupport[kind].includes(item.type));
}

function hasControl(kind: Control['kind'], item: Item | undefined) {
  return Boolean(item?.controls?.some((control) => control.kind === kind));
}

function canAttachControl(kind: Control['kind'], item: Item | undefined) {
  return controlApplies(kind, item) && !hasControl(kind, item);
}

function sliderForItem(item: Item): Control {
  if (item.type === 'h1' || item.type === 'h2' || item.type === 'h3') {
    return { id: createId('slider'), kind: 'slider', value: 1.0, min: 0.5, max: 2.0 };
  }
  if (item.type === 'shader') {
    return { id: createId('slider'), kind: 'slider', value: 0.5, min: 0, max: 1 };
  }
  if (item.type === 'voxel') {
    return { id: createId('slider'), kind: 'slider', value: 0, min: 0, max: 1 };
  }
  return { id: createId('slider'), kind: 'slider', value: 1.0, min: 0.1, max: 1.0 };
}

function selectorForItem(item: Item): Control {
  const withCurrentValue = (options: { label: string; value: string }[]) => {
    if (options.some((option) => option.value === item.content)) return options;
    return [{ label: 'current', value: item.content }, ...options];
  };

  if (item.type === 'link') {
    return {
      id: createId('selector'),
      kind: 'selector',
      value: item.content,
      options: withCurrentValue(canvasSlugOptions),
    };
  }

  if (item.type === 'code') {
    return {
      id: createId('selector'),
      kind: 'selector',
      value: 'typescript',
      affectsContent: false,
      options: [
        { label: 'TypeScript', value: 'typescript' },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Python', value: 'python' },
        { label: 'CSS', value: 'css' },
        { label: 'HTML', value: 'html' },
        { label: 'JSON', value: 'json' },
        { label: 'Shell', value: 'bash' },
      ],
    };
  }

  if (item.type === 'shader') {
    const value = shaderSelectorOptions.some((option) => option.value === item.content)
      ? item.content
      : (shaderSelectorOptions[0]?.value ?? item.content);
    return {
      id: createId('selector'),
      kind: 'selector',
      value,
      affectsContent: true,
      options: shaderSelectorOptions,
    };
  }

  if (item.type === 'voxel') {
    return {
      id: createId('selector'),
      kind: 'selector',
      value: 'isometric',
      affectsContent: false,
      options: [
        { label: 'Isometric', value: 'isometric' },
        { label: 'Oblique', value: 'oblique' },
        { label: 'Orthographic', value: 'orthographic' },
        { label: 'Perspective', value: 'perspective' },
      ],
    };
  }

  return {
    id: createId('selector'),
    kind: 'selector',
    value: item.content,
    options: withCurrentValue(markdownSources),
  };
}

function makeNewCanvas(slug: string, title: string): Canvas {
  return {
    version: 1,
    slug,
    title,
    background: 'paper',
    items: [],
  };
}

const toolbarButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent transition hover:border-accent/25 hover:bg-paper-2 active:scale-[0.97]';

const disabledToolbarButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent transition enabled:hover:border-accent/25 enabled:hover:bg-paper-2 enabled:active:scale-[0.97] disabled:opacity-35';

const revealTransition = { duration: 0.16, ease: [0.23, 1, 0.32, 1] as const };

function ExpandingGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Heading1;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const closeOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  return (
    <motion.div
      layout
      aria-label={label}
      className="flex h-9 items-center overflow-hidden rounded-full border border-line/70 bg-white/80 px-0.5 shadow-[0_10px_24px_rgba(11,28,48,0.08)] backdrop-blur-xl"
      transition={revealTransition}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={closeOnBlur}
    >
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent text-ink-2 transition hover:border-accent/25 hover:bg-paper-2 hover:text-ink active:scale-[0.97]"
        onClick={() => setOpen(true)}
      >
        <Icon size={15} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="items"
            className="flex items-center gap-0.5 pr-0.5"
            initial={{ opacity: 0, width: 0, x: -4 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: -4 }}
            transition={revealTransition}
          >
            <span className="mx-0.5 h-4 w-px bg-line" />
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function Toolbar({
  onSave,
  saveState,
}: {
  onSave: () => void;
  saveState: 'idle' | 'saving' | 'saved' | 'error';
}) {
  const navigate = useNavigate();
  const canvas = useCanvasStore((state) => state.canvas);
  const selectedId = useCanvasStore((state) => state.selectedId);
  const selectedItem = useCanvasStore((state) =>
    state.canvas.items.find((item) => item.id === state.selectedId),
  );
  const addItem = useCanvasStore((state) => state.addItem);
  const addControl = useCanvasStore((state) => state.addControl);
  const deleteItem = useCanvasStore((state) => state.deleteItem);

  const attachControl = (kind: Control['kind']) => {
    if (!selectedId || !selectedItem || !canAttachControl(kind, selectedItem)) return;
    const control: Control =
      kind === 'toggle'
        ? { id: createId('toggle'), kind: 'toggle', value: false }
        : kind === 'slider'
          ? sliderForItem(selectedItem)
          : kind === 'selector'
            ? selectorForItem(selectedItem)
            : kind === 'align'
              ? { id: createId('align'), kind: 'align', value: 'left' }
              : kind === 'fit'
                ? { id: createId('fit'), kind: 'fit', value: true }
                : kind === 'border'
                  ? { id: createId('border'), kind: 'border', value: true }
                  : { id: createId('action'), kind: 'action' };
    addControl(selectedId, control);
  };

  const createCanvas = async () => {
    if (!IS_OWNER) return;
    const slug = window.prompt('slug');
    if (!slug) return;
    const title = window.prompt('title') ?? slug;
    const nextCanvas = makeNewCanvas(slug, title);
    const response = await fetch(`/__save/${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderedCanvasForSave(nextCanvas), null, 2),
    });
    if (response.ok) navigate(slugToPath(slug));
  };

  return (
    <header className="flex h-[var(--header-h)] items-center gap-2 border-b border-line/80 bg-white/80 px-3 shadow-[0_8px_24px_rgba(11,28,48,0.06)] backdrop-blur-xl">
      <div className="mr-2 flex min-w-32 items-baseline gap-2">
        <span className="font-display text-[23px] leading-none">toni.ltd</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">
          {canvas.slug}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
        {blockGroups.map((group) => (
          <ExpandingGroup key={group.label} label={`${group.label} blocks`} icon={group.icon}>
            {group.types.map((type) => {
              const Icon = blockIcons[type];
              return (
                <button
                  key={type}
                  type="button"
                  title={`Add ${type}`}
                  aria-label={`Add ${type}`}
                  className={toolbarButtonClass}
                  onClick={() => addItem(type)}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </ExpandingGroup>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ExpandingGroup label="block controls" icon={SlidersHorizontal}>
          <button
            type="button"
            title="Toggle"
            aria-label="Add toggle"
            disabled={!canAttachControl('toggle', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('toggle')}
          >
            <ToggleLeft size={15} />
          </button>
          <button
            type="button"
            title="Slider"
            aria-label="Add slider"
            disabled={!canAttachControl('slider', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('slider')}
          >
            <SlidersHorizontal size={15} />
          </button>
          <button
            type="button"
            title="Selector"
            aria-label="Add selector"
            disabled={!canAttachControl('selector', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('selector')}
          >
            <ListFilter size={15} />
          </button>
          <button
            type="button"
            title="Action"
            aria-label="Add action"
            disabled={!canAttachControl('action', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('action')}
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            title="Align"
            aria-label="Add alignment"
            disabled={!canAttachControl('align', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('align')}
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            title="Fit text"
            aria-label="Add fit-text"
            disabled={!canAttachControl('fit', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('fit')}
          >
            <Maximize2 size={15} />
          </button>
          <button
            type="button"
            title="Border"
            aria-label="Add border toggle"
            disabled={!canAttachControl('border', selectedItem)}
            className={disabledToolbarButtonClass}
            onClick={() => attachControl('border')}
          >
            <Square size={15} />
          </button>
        </ExpandingGroup>
        <button
          type="button"
          title="Delete"
          aria-label="Delete selected"
          disabled={!selectedId}
          className={disabledToolbarButtonClass}
          onClick={() => selectedId && deleteItem(selectedId)}
        >
          <Trash2 size={15} />
        </button>
        {IS_OWNER ? (
          <>
            <button
              type="button"
              title="New canvas"
              aria-label="New canvas"
              className={toolbarButtonClass}
              onClick={() => void createCanvas()}
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              title="Save"
              aria-label="Save canvas"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent text-white transition hover:border-accent-ink"
              onClick={onSave}
            >
              {saveState === 'saved' ? <Check size={15} /> : <Save size={15} />}
            </button>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 lg:inline">
              {saveState === 'saving' ? 'saving' : saveState === 'error' ? 'error' : 'dev'}
            </span>
          </>
        ) : (
          <Bot size={15} className="text-ink-2" aria-label="Demo" />
        )}
      </div>
    </header>
  );
}
