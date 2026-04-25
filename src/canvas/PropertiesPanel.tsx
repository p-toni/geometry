import { useState, type ReactNode } from 'react';
import { WandSparkles, X } from 'lucide-react';
import { BLOCK_TYPES, CARD_SURFACES, COLORS, GRID_COLS, GRID_ROWS, IS_OWNER } from '../constants';
import { cn } from '../lib/cn';
import { LinkIcon, LINK_ICON_OPTIONS } from '../lib/linkIcons';
import { useCanvasStore } from '../store/canvasStore';
import type { BlockType, ColorToken, Item } from '../types';

function parseField(value: string) {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
      {label}
      {children}
    </label>
  );
}

function inputClass() {
  return 'rounded-[8px] border border-line bg-white/80 px-2 py-1.5 font-display text-[14px] normal-case tracking-normal text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';
}

export function PropertiesPanel() {
  const [prompt, setPrompt] = useState('');
  const [aiState, setAiState] = useState<'idle' | 'generating' | 'error'>('idle');
  const selectedId = useCanvasStore((state) => state.selectedId);
  const selectedItem = useCanvasStore((state) =>
    state.canvas.items.find((item) => item.id === state.selectedId),
  );
  const updateItem = useCanvasStore((state) => state.updateItem);
  const select = useCanvasStore((state) => state.select);
  const deleteItem = useCanvasStore((state) => state.deleteItem);

  if (!selectedId || !selectedItem) return null;

  const update = (patch: Partial<Item>) => updateItem(selectedId, patch);
  const updateField = (key: 'col' | 'row' | 'cols' | 'rows', raw: string) => {
    const next = parseField(raw);
    if (next === null) return;
    update({ [key]: next });
  };
  const panelSide = selectedItem.col + selectedItem.cols > GRID_COLS - 10 ? 'left-3' : 'right-3';
  const maxCol = Math.max(0, GRID_COLS - selectedItem.cols);
  const maxRow = Math.max(0, GRID_ROWS - selectedItem.rows);

  const generate = async () => {
    if (!IS_OWNER || selectedItem.type !== 'image' || !prompt.trim()) return;
    try {
      setAiState('generating');
      const { generateImage } = await import('../lib/ai/gemini');
      const dataUrl = await generateImage(prompt);
      update({ content: dataUrl });
      setAiState('idle');
    } catch {
      setAiState('error');
    }
  };

  return (
    <aside
      className={cn(
        'absolute top-3 z-50 grid w-[280px] gap-3 rounded-[16px] border border-line/80 bg-white/80 p-3 shadow-[0_24px_60px_rgba(11,28,48,0.16)] backdrop-blur-xl',
        panelSide,
      )}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
          {selectedItem.id}
        </span>
        <button
          type="button"
          aria-label="Close properties"
          title="Close"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-transparent hover:border-ink/10"
          onClick={() => select(null)}
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="type">
          <select
            className={inputClass()}
            value={selectedItem.type}
            onChange={(event) => update({ type: event.target.value as BlockType })}
          >
            {BLOCK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="label">
          <input
            className={inputClass()}
            value={selectedItem.label}
            onChange={(event) => update({ label: event.target.value })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Field label="x">
          <input
            className={inputClass()}
            type="number"
            min={0}
            max={maxCol}
            value={selectedItem.col}
            onChange={(event) => updateField('col', event.target.value)}
          />
        </Field>
        <Field label="y">
          <input
            className={inputClass()}
            type="number"
            min={0}
            max={maxRow}
            value={selectedItem.row}
            onChange={(event) => updateField('row', event.target.value)}
          />
        </Field>
        <Field label="w">
          <input
            className={inputClass()}
            type="number"
            min={1}
            max={GRID_COLS}
            value={selectedItem.cols}
            onChange={(event) => updateField('cols', event.target.value)}
          />
        </Field>
        <Field label="h">
          <input
            className={inputClass()}
            type="number"
            min={1}
            max={GRID_ROWS}
            value={selectedItem.rows}
            onChange={(event) => updateField('rows', event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-1">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
          <span>card color</span>
          <span>default: {CARD_SURFACES[selectedItem.type].name}</span>
        </div>
        <div className="flex gap-1">
          {COLORS.map((color) => (
            <button
              key={color.token}
              type="button"
              title={color.name}
              aria-label={color.name}
              className={cn(
                'h-7 flex-1 rounded-[6px] border border-ink/10 outline-offset-2 transition',
                selectedItem.color === color.token && 'ring-2 ring-accent ring-offset-1 ring-offset-white',
              )}
              style={{ backgroundColor: color.hex }}
              onClick={() => update({ color: color.token as ColorToken })}
            />
          ))}
        </div>
      </div>

      <Field label="content">
        <textarea
          className={`${inputClass()} min-h-32 resize-y font-mono text-[12px]`}
          value={selectedItem.content}
          onChange={(event) => update({ content: event.target.value })}
        />
      </Field>

      {selectedItem.type === 'link' ? (
        <div className="grid gap-2 border-t border-line pt-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2">
            icon
          </span>
          <div className="grid grid-cols-5 gap-1">
            {LINK_ICON_OPTIONS.map(({ name, label }) => {
              const selected = (selectedItem.linkIcon ?? 'link') === name;
              return (
                <button
                  key={name}
                  type="button"
                  title={label}
                  aria-label={`Use ${label} icon`}
                  className={cn(
                    'flex h-9 items-center justify-center rounded-[6px] border bg-paper transition hover:border-accent-ink',
                    selected ? 'border-accent-ink text-accent-ink' : 'border-ink/10 text-ink-2',
                  )}
                  onClick={() => update({ linkIcon: name })}
                >
                  <LinkIcon name={name} size={16} strokeWidth={1.9} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {IS_OWNER && selectedItem.type === 'image' ? (
        <div className="grid gap-2 border-t border-line pt-3">
          <Field label="ai prompt">
            <textarea
              className={`${inputClass()} min-h-20 resize-y text-[12px]`}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </Field>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-full border border-accent/50 bg-paper-2 px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition hover:border-accent-ink"
            onClick={() => void generate()}
          >
            <WandSparkles size={13} />
            {aiState === 'generating' ? 'generating' : aiState === 'error' ? 'error' : 'generate'}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="h-8 rounded-full border border-ink/10 font-mono text-[10px] uppercase tracking-[0.12em] transition hover:border-accent-ink"
        onClick={() => deleteItem(selectedId)}
      >
        delete
      </button>
    </aside>
  );
}
