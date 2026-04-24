import { describe, expect, it } from 'vitest';
import { createCanvasStore, orderedCanvasForSave } from './canvasStore';
import type { Canvas } from '../types';

function seedCanvas(): Canvas {
  return {
    version: 1,
    slug: 'home',
    title: 'Home',
    background: 'paper',
    items: [
      {
        id: 'a',
        type: 'p',
        col: 1,
        row: 2,
        cols: 5,
        rows: 4,
        color: 0,
        label: 'copy',
        content: 'Hello',
      },
    ],
  };
}

describe('createCanvasStore', () => {
  it('hydrates from the provided canvas', () => {
    const store = createCanvasStore(seedCanvas());
    expect(store.getState().canvas.items).toHaveLength(1);
  });

  it('selects without divergence', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().select('a');
    expect(store.getState().selectedId).toBe('a');
    expect(store.getState().hasDiverged).toBe(false);
  });

  it('adds items and marks divergence', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().addItem('h1');
    expect(store.getState().canvas.items).toHaveLength(2);
    expect(store.getState().hasDiverged).toBe(true);
  });

  it('updates items and clamps grid values', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().updateItem('a', { col: 99, row: 99, cols: 8, rows: 8 });
    expect(store.getState().canvas.items[0]).toMatchObject({ col: 39, row: 19 });
  });

  it('allows items to resize to the full canvas regardless of position', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().updateItem('a', { col: 39, row: 19, cols: 99, rows: 99 });
    expect(store.getState().canvas.items[0]).toMatchObject({
      col: 39,
      row: 19,
      cols: 40,
      rows: 20,
    });
  });

  it('deletes selected items', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().select('a');
    store.getState().deleteItem('a');
    expect(store.getState().canvas.items).toHaveLength(0);
    expect(store.getState().selectedId).toBeNull();
  });

  it('commits drag ghosts on drag end', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().startDrag('a');
    store.getState().setDragGhost(6, 7);
    store.getState().endDrag(true);
    expect(store.getState().canvas.items[0]).toMatchObject({ col: 6, row: 7 });
  });

  it('can cancel drag ghosts', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().startDrag('a');
    store.getState().setDragGhost(6, 7);
    store.getState().endDrag(false);
    expect(store.getState().canvas.items[0]).toMatchObject({ col: 1, row: 2 });
  });

  it('commits resize ghosts on resize end', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().startResize('a');
    store.getState().setResizeGhost(7, 8);
    store.getState().endResize(true);
    expect(store.getState().canvas.items[0]).toMatchObject({ cols: 7, rows: 8 });
  });

  it('updates controls and selector content', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().addControl('a', { id: 's', kind: 'selector', value: 'one', options: [] });
    store.getState().updateControl('a', { id: 's', kind: 'selector', value: 'two', options: [] });
    expect(store.getState().canvas.items[0].content).toBe('two');
  });

  it('ignores duplicate controls of the same kind on an item', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().addControl('a', { id: 's1', kind: 'selector', value: 'one', options: [] });
    store.getState().addControl('a', { id: 's2', kind: 'selector', value: 'two', options: [] });
    expect(store.getState().canvas.items[0].controls).toEqual([
      { id: 's1', kind: 'selector', value: 'one', options: [] },
    ]);
  });

  it('bumps refresh keys for action controls', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().triggerAction('a');
    expect(store.getState().canvas.items[0].refreshKey).toBe(1);
  });

  it('resets to the original canvas', () => {
    const store = createCanvasStore(seedCanvas());
    store.getState().updateItem('a', { content: 'Changed' });
    store.getState().reset();
    expect(store.getState().canvas.items[0].content).toBe('Hello');
    expect(store.getState().hasDiverged).toBe(false);
  });

  it('orders items for clean save diffs', () => {
    const canvas = seedCanvas();
    canvas.items.push({ ...canvas.items[0], id: 'b', row: 0, col: 0 });
    expect(orderedCanvasForSave(canvas).items.map((item) => item.id)).toEqual(['b', 'a']);
  });
});
