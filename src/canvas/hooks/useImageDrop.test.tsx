import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useImageDrop } from './useImageDrop';
import { CanvasStoreProvider, useCanvasStore } from '../../store/canvasStore';
import { predictPointCloud } from '../../lib/ai/sharp';
import type { Canvas } from '../../types';

vi.mock('../../lib/ai/sharp', () => ({
  predictPointCloud: vi.fn(),
}));

const predictPointCloudMock = vi.mocked(predictPointCloud);

function seedCanvas(): Canvas {
  return {
    version: 1,
    slug: 'home',
    title: 'Home',
    background: 'paper',
    items: [],
  };
}

function imageFile() {
  return new File(['image'], 'photo.png', { type: 'image/png' });
}

function dragEvent(type: string, file: File) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      dropEffect: 'none',
      files: [file],
      items: [{ kind: 'file', type: file.type }],
    },
  });
  return event;
}

function HookProbe() {
  const { isDraggingOver } = useImageDrop();
  const items = useCanvasStore((state) => state.canvas.items);
  const statusMessage = useCanvasStore((state) => state.statusMessage);

  return (
    <div>
      <div data-testid="dragging">{String(isDraggingOver)}</div>
      <div data-testid="status">{statusMessage ?? ''}</div>
      <div data-testid="items">{JSON.stringify(items)}</div>
      <div data-testid="block-origin" data-canvas-block="true" />
    </div>
  );
}

function renderHookProbe() {
  render(
    <CanvasStoreProvider initialCanvas={seedCanvas()}>
      <HookProbe />
    </CanvasStoreProvider>,
  );
}

describe('useImageDrop', () => {
  beforeEach(() => {
    predictPointCloudMock.mockReset();
  });

  it('creates a pending threeSharp block and resolves it with the predicted splt URL', async () => {
    let resolvePrediction:
      | ((value: {
          url: string;
          id: string;
          count: number;
          fitRadius: number;
          bytes: number;
        }) => void)
      | null = null;
    predictPointCloudMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePrediction = resolve;
      }),
    );
    renderHookProbe();

    act(() => {
      document.dispatchEvent(dragEvent('dragenter', imageFile()));
      document.dispatchEvent(dragEvent('drop', imageFile()));
    });

    await waitFor(() =>
      expect(screen.getByTestId('items')).toHaveTextContent('sharp · pending'),
    );
    expect(screen.getByTestId('items')).toHaveTextContent('plyUrl');
    expect(screen.getByTestId('items')).toHaveTextContent('null');
    expect(screen.getByTestId('status')).toHaveTextContent('sharp · generating photo.png');

    act(() => {
      resolvePrediction?.({
        url: '/sharp/abc123.splt',
        id: 'abc123',
        count: 64000,
        fitRadius: 1.4,
        bytes: 4096,
      });
    });

    await waitFor(() =>
      expect(screen.getByTestId('items')).toHaveTextContent('/sharp/abc123.splt'),
    );
    expect(screen.getByTestId('items')).toHaveTextContent('three sharp');
    expect(screen.getByTestId('status')).toHaveTextContent(
      'sharp · abc123 · 4 KB · cmd-s to save canvas',
    );
  });

  it('ignores non-image drops', async () => {
    renderHookProbe();

    act(() => {
      document.dispatchEvent(
        dragEvent('drop', new File(['text'], 'note.txt', { type: 'text/plain' })),
      );
    });

    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('[]'));
    expect(predictPointCloudMock).not.toHaveBeenCalled();
  });

  it('ignores drags that started inside an existing block', async () => {
    renderHookProbe();

    act(() => {
      screen.getByTestId('block-origin').dispatchEvent(dragEvent('dragstart', imageFile()));
      document.dispatchEvent(dragEvent('drop', imageFile()));
    });

    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('[]'));
    expect(predictPointCloudMock).not.toHaveBeenCalled();
  });

  it('marks the pending block as an error when prediction fails', async () => {
    predictPointCloudMock.mockRejectedValue(new Error('sharp failed'));
    renderHookProbe();

    act(() => {
      document.dispatchEvent(dragEvent('drop', imageFile()));
    });

    await waitFor(() => expect(screen.getByTestId('items')).toHaveTextContent('sharp · error'));
    expect(screen.getByTestId('status')).toHaveTextContent('sharp failed');
  });
});
