import {
  Bot,
  Check,
  Code2,
  FilePlus,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  ListFilter,
  MousePointerClick,
  Pilcrow,
  Plus,
  Quote,
  RefreshCw,
  Save,
  SlidersHorizontal,
  ToggleLeft,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BLOCK_TYPES, IS_OWNER } from '../constants';
import { markdownSources } from '../content/markdownRegistry';
import { createId } from '../lib/id';
import { slugToPath } from '../lib/paths';
import { canvasSlugOptions } from '../routes/canvasRegistry';
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
};

const controlSupport: Record<Control['kind'], BlockType[]> = {
  toggle: ['h1', 'h2', 'h3', 'quote', 'code', 'image'],
  slider: ['p', 'image'],
  selector: ['markdown', 'link'],
  action: ['markdown', 'code'],
};

function controlApplies(kind: Control['kind'], item: Item | undefined) {
  return Boolean(item && controlSupport[kind].includes(item.type));
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
    if (!selectedId || !selectedItem || !controlApplies(kind, selectedItem)) return;
    const control: Control =
      kind === 'toggle'
        ? { id: createId('toggle'), kind: 'toggle', value: true }
        : kind === 'slider'
          ? { id: createId('slider'), kind: 'slider', value: 0.75, min: 0.2, max: 1 }
          : kind === 'selector'
            ? selectorForItem(selectedItem)
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
    <header className="flex h-[var(--header-h)] items-center gap-2 border-b border-line bg-paper/95 px-3">
      <div className="mr-2 flex min-w-32 items-baseline gap-2">
        <span className="font-display text-[23px] leading-none">Geometry</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-2">
          {canvas.slug}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {BLOCK_TYPES.map((type) => {
          const Icon = blockIcons[type];
          return (
            <button
              key={type}
              type="button"
              title={`Add ${type}`}
              aria-label={`Add ${type}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition hover:border-ink/15 hover:bg-paper-2"
              onClick={() => addItem(type)}
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          title="Toggle"
          aria-label="Add toggle"
          disabled={!controlApplies('toggle', selectedItem)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition enabled:hover:border-ink/15 enabled:hover:bg-paper-2 disabled:opacity-35"
          onClick={() => attachControl('toggle')}
        >
          <ToggleLeft size={15} />
        </button>
        <button
          type="button"
          title="Slider"
          aria-label="Add slider"
          disabled={!controlApplies('slider', selectedItem)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition enabled:hover:border-ink/15 enabled:hover:bg-paper-2 disabled:opacity-35"
          onClick={() => attachControl('slider')}
        >
          <SlidersHorizontal size={15} />
        </button>
        <button
          type="button"
          title="Selector"
          aria-label="Add selector"
          disabled={!controlApplies('selector', selectedItem)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition enabled:hover:border-ink/15 enabled:hover:bg-paper-2 disabled:opacity-35"
          onClick={() => attachControl('selector')}
        >
          <ListFilter size={15} />
        </button>
        <button
          type="button"
          title="Action"
          aria-label="Add action"
          disabled={!controlApplies('action', selectedItem)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition enabled:hover:border-ink/15 enabled:hover:bg-paper-2 disabled:opacity-35"
          onClick={() => attachControl('action')}
        >
          <RefreshCw size={15} />
        </button>
        <button
          type="button"
          title="Delete"
          aria-label="Delete selected"
          disabled={!selectedId}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition enabled:hover:border-ink/15 enabled:hover:bg-paper-2 disabled:opacity-35"
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent transition hover:border-ink/15 hover:bg-paper-2"
              onClick={() => void createCanvas()}
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              title="Save"
              aria-label="Save canvas"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-paper-2 transition hover:border-accent-ink"
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
