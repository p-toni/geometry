import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CanvasStoreProvider, useCanvasStore } from '../store/canvasStore';
import type { BlockType, Canvas as CanvasModel, Control } from '../types';
import { Canvas } from './Canvas';
import { DemoChip } from './DemoChip';

const blockTypes = [
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
] as const satisfies BlockType[];

const controlSupport: Record<Control['kind'], readonly BlockType[]> = {
  toggle: ['h1', 'h2', 'h3', 'p', 'quote', 'code', 'image', 'markdown'],
  slider: ['h1', 'h2', 'h3', 'p', 'image', 'shader', 'voxel'],
  selector: ['markdown', 'link', 'code', 'shader', 'voxel'],
  action: ['markdown', 'code', 'shader', 'voxel'],
  align: ['h1', 'h2', 'h3', 'p', 'quote', 'markdown'],
  fit: ['h1', 'h2', 'h3', 'p', 'quote'],
  border: blockTypes,
};

function allTypesCanvas(): CanvasModel {
  return {
    version: 1,
    slug: 'home',
    title: 'Home',
    background: 'paper',
    items: blockTypes.map((type, index) => ({
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
                : type === 'shader'
                  ? '@gradient'
                  : type === 'voxel'
                    ? '{"shapes":[]}'
                    : 'Text',
    })),
  };
}

function contentFor(type: BlockType) {
  if (type === 'image') return 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  if (type === 'link') return 'home';
  if (type === 'embed') return '<strong>Embed</strong>';
  if (type === 'markdown') return '# Markdown\n\nBody';
  if (type === 'shader') return '@gradient';
  if (type === 'voxel') return '{"preset":"glyph"}';
  if (type === 'code') return 'const label = "geometry";';
  return 'Text';
}

function controlFor(kind: Control['kind'], type: BlockType): Control {
  if (kind === 'toggle') return { id: `${type}-toggle`, kind, value: false };
  if (kind === 'slider') {
    return { id: `${type}-slider`, kind, value: type === 'shader' ? 0.5 : 1, min: 0, max: 1 };
  }
  if (kind === 'selector') {
    if (type === 'code') {
      return {
        id: `${type}-selector`,
        kind,
        value: 'typescript',
        affectsContent: false,
        options: [
          { label: 'TypeScript', value: 'typescript' },
          { label: 'Python', value: 'python' },
        ],
      };
    }

    if (type === 'shader') {
      return {
        id: `${type}-selector`,
        kind,
        value: '@gradient',
        options: [
          { label: 'Gradient', value: '@gradient' },
          { label: 'Grid', value: '@grid' },
        ],
      };
    }

    if (type === 'voxel') {
      return {
        id: `${type}-selector`,
        kind,
        value: 'isometric',
        affectsContent: false,
        options: [
          { label: 'Isometric', value: 'isometric' },
          { label: 'Oblique', value: 'oblique' },
        ],
      };
    }

    return {
      id: `${type}-selector`,
      kind,
      value: type === 'link' ? 'home' : 'Inline markdown',
      options: [
        { label: 'Home', value: 'home' },
        { label: 'Writing', value: 'writing' },
        { label: 'Inline markdown', value: 'Inline markdown' },
      ],
    };
  }
  if (kind === 'action') return { id: `${type}-action`, kind };
  if (kind === 'align') return { id: `${type}-align`, kind, value: 'left' };
  if (kind === 'fit') return { id: `${type}-fit`, kind, value: false };
  return { id: `${type}-border`, kind, value: false };
}

function canvasWithControl(type: BlockType, control: Control): CanvasModel {
  return {
    version: 1,
    slug: 'control-test',
    title: 'Control test',
    background: 'paper',
    items: [
      {
        id: `${type}-item`,
        type,
        col: 1,
        row: 1,
        cols: 6,
        rows: 4,
        color: 0,
        label: type,
        content: contentFor(type),
        controls: [control],
      },
    ],
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

    expect(screen.getAllByTestId(/block-/)).toHaveLength(12);
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

  it.each(
    Object.entries(controlSupport).flatMap(([kind, types]) =>
      types.map((type) => [kind as Control['kind'], type] as const),
    ),
  )('exercises the %s control on %s blocks', (kind, type) => {
    render(
      <MemoryRouter>
        <Canvas initialCanvas={canvasWithControl(type, controlFor(kind, type))} />
      </MemoryRouter>,
    );

    const block = screen.getByTestId(`block-${type}`);
    expect(block).toBeInTheDocument();

    if (kind === 'toggle') {
      fireEvent.click(within(block).getByLabelText('Toggle'));
    } else if (kind === 'slider') {
      fireEvent.click(within(block).getByLabelText('Open slider'));
      fireEvent.change(within(block).getByLabelText('Slider'), { target: { value: '0.75' } });
    } else if (kind === 'selector') {
      fireEvent.click(within(block).getByLabelText('Open selector'));
      fireEvent.click(within(block).getByText(/Writing|Python|Grid|Oblique/));
    } else if (kind === 'action') {
      fireEvent.click(within(block).getByLabelText('Refresh block'));
    } else if (kind === 'align') {
      fireEvent.click(within(block).getByLabelText('Text align: left'));
      expect(within(block).getByLabelText('Text align: center')).toBeInTheDocument();
    } else if (kind === 'fit') {
      fireEvent.click(within(block).getByLabelText('Fit text to block'));
    } else {
      fireEvent.click(within(block).getByLabelText('Show border'));
      expect(within(block).getByLabelText('Hide border')).toBeInTheDocument();
    }

    expect(screen.getByTestId(`block-${type}`)).toBeInTheDocument();
  });
});
