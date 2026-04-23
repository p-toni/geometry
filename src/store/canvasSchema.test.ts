import { describe, expect, it } from 'vitest';
import { parseCanvas } from './canvasSchema';

const validCanvas = {
  version: 1,
  slug: 'home',
  title: 'Home',
  background: 'paper',
  items: [
    {
      id: 'a',
      type: 'p',
      col: 0,
      row: 0,
      cols: 4,
      rows: 4,
      color: 0,
      label: 'copy',
      content: 'Hello',
      controls: [{ id: 't', kind: 'toggle', value: true }],
    },
  ],
};

describe('parseCanvas', () => {
  it('parses a valid canvas', () => {
    expect(parseCanvas(validCanvas).slug).toBe('home');
  });

  it('rejects an unsupported version', () => {
    expect(() => parseCanvas({ ...validCanvas, version: 2 })).toThrow(/version/);
  });

  it('rejects invalid block types', () => {
    expect(() =>
      parseCanvas({ ...validCanvas, items: [{ ...validCanvas.items[0], type: 'video' }] }),
    ).toThrow(/type/);
  });

  it('rejects invalid controls', () => {
    expect(() =>
      parseCanvas({
        ...validCanvas,
        items: [{ ...validCanvas.items[0], controls: [{ id: 'bad', kind: 'slider' }] }],
      }),
    ).toThrow(/slider/);
  });
});
