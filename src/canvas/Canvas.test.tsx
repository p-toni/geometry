import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CanvasStoreProvider, useCanvasStore } from '../store/canvasStore';
import type { Canvas as CanvasModel } from '../types';
import { Canvas } from './Canvas';
import { DemoChip } from './DemoChip';

function allTypesCanvas(): CanvasModel {
  return {
    version: 1,
    slug: 'home',
    title: 'Home',
    background: 'paper',
    items: [
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
    ].map((type, index) => ({
      id: `${type}-${index}`,
      type: type as CanvasModel['items'][number]['type'],
      col: index % 10,
      row: index,
      cols: 3,
      rows: 2,
      color: (index % 6) as CanvasModel['items'][number]['color'],
      label: type,
      content:
        type === 'image'
          ? 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
          : type === 'link'
            ? 'home'
            : type === 'embed'
              ? '<strong>Embed</strong>'
              : type === 'markdown'
                ? 'Markdown'
                : 'Text',
    })),
  };
}

function MutateButton() {
  const addItem = useCanvasStore((state) => state.addItem);
  return <button onClick={() => addItem('p')}>mutate</button>;
}

describe('Canvas', () => {
  it('renders every block type from JSON', () => {
    render(
      <MemoryRouter>
        <Canvas initialCanvas={allTypesCanvas()} />
      </MemoryRouter>,
    );

    expect(screen.getAllByTestId(/block-/)).toHaveLength(10);
  });

  it('shows the demo chip after the first mutation', async () => {
    render(
      <CanvasStoreProvider initialCanvas={allTypesCanvas()}>
        <MutateButton />
        <DemoChip />
      </CanvasStoreProvider>,
    );

    screen.getByText('mutate').click();
    expect(await screen.findByText(/changes won't save/)).toBeInTheDocument();
  });
});
