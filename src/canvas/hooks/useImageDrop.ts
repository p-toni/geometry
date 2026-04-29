import { useCallback, useEffect, useRef, useState } from 'react';
import { BLOCK_DEFAULTS, IS_OWNER } from '../../constants';
import { predictPointCloud } from '../../lib/ai/sharp';
import { useCanvasStore } from '../../store/canvasStore';
import type { Control } from '../../types';
import { PRESET_OPTIONS } from '../blocks/threeSharp/presets';

const PENDING_CONTENT = {
  count: 2000000,
  size: 0.02,
  flowInfluenceIdle: 0.1,
  flowInfluenceFast: 1.0,
  flowSmoothing: 1.9,
  strength: 0.6,
  frequency: 1.0,
  decayRate: 0.9,
  timeScale: 0.2,
  returnStrength: 0.65,
  maxDrift: 0.32,
  boundsRadius: 2.05,
  cameraDistance: 2.35,
  cameraOrbitX: 0.18,
  cameraOrbitY: 0.08,
  cameraBreath: 0.05,
  roll: 0.01,
  brightness: 0,
  lift: 0.035,
  contrast: 0.65,
  saturation: 1.2,
  tintStrength: 0.5,
  pointSizeHeight: 900,
  fitRadius: 1.9,
  plyUrl: null as string | null,
};

function controlsFor(id: string): Control[] {
  return [
    {
      id: `${id}-preset`,
      kind: 'selector',
      value: 'drift',
      options: PRESET_OPTIONS,
      affectsContent: false,
    },
    {
      id: `${id}-intensity`,
      kind: 'slider',
      value: 0,
      min: 0,
      max: 1,
    },
  ];
}

function isImageFile(file: File | undefined): file is File {
  return Boolean(file && file.type.startsWith('image/'));
}

function hasImageItem(dataTransfer: DataTransfer | null) {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.items ?? []).some(
    (item) => item.kind === 'file' && item.type.startsWith('image/'),
  );
}

function firstImageFile(dataTransfer: DataTransfer | null) {
  if (!dataTransfer) return null;
  return Array.from(dataTransfer.files).find(isImageFile) ?? null;
}

function targetInsideBlock(event: DragEvent) {
  return (
    event.target instanceof Element && Boolean(event.target.closest('[data-canvas-block]'))
  );
}

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : 'sharp prediction failed';
}

function pendingMessage(file: File, startedAt: number) {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  const name = file.name.trim() || 'image';
  return `sharp · generating ${name} · ${elapsedSeconds}s`;
}

function stringifyContent(content: typeof PENDING_CONTENT) {
  return JSON.stringify(content, null, 2);
}

export function useImageDrop() {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const blockDragRef = useRef(false);
  const addItem = useCanvasStore((state) => state.addItem);
  const updateItem = useCanvasStore((state) => state.updateItem);
  const setStatusMessage = useCanvasStore((state) => state.setStatusMessage);

  const pickFromFile = useCallback(
    async (file: File) => {
      if (!IS_OWNER || !isImageFile(file)) return;

      const id = addItem('threeSharp');
      const startedAt = Date.now();
      setStatusMessage(pendingMessage(file, startedAt));
      const pendingTimer = window.setInterval(() => {
        setStatusMessage(pendingMessage(file, startedAt));
      }, 1000);
      updateItem(id, {
        label: 'sharp · pending',
        content: stringifyContent(PENDING_CONTENT),
        controls: controlsFor(id),
      });

      try {
        const result = await predictPointCloud(file, {
          count: PENDING_CONTENT.count,
          radius: PENDING_CONTENT.fitRadius,
        });
        window.clearInterval(pendingTimer);
        updateItem(id, {
          label: BLOCK_DEFAULTS.threeSharp.label,
          content: stringifyContent({
            ...PENDING_CONTENT,
            count: result.count,
            fitRadius: result.fitRadius,
            plyUrl: result.url,
          }),
        });
        setStatusMessage(
          `sharp · ${result.id} · ${Math.round(result.bytes / 1024)} KB · cmd-s to save canvas`,
        );
      } catch (error) {
        window.clearInterval(pendingTimer);
        const message = messageFor(error);
        updateItem(id, { label: 'sharp · error' });
        setStatusMessage(message);
      }
    },
    [addItem, setStatusMessage, updateItem],
  );

  useEffect(() => {
    if (!IS_OWNER) return undefined;

    const onDragStart = (event: DragEvent) => {
      blockDragRef.current = targetInsideBlock(event);
    };

    const onDragEnter = (event: DragEvent) => {
      if (blockDragRef.current || !hasImageItem(event.dataTransfer)) return;
      setIsDraggingOver(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (blockDragRef.current || !hasImageItem(event.dataTransfer)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      setIsDraggingOver(true);
    };

    const onDrop = (event: DragEvent) => {
      const file = firstImageFile(event.dataTransfer);
      const startedInsideBlock = blockDragRef.current;
      setIsDraggingOver(false);
      blockDragRef.current = false;
      if (startedInsideBlock || !file) return;
      event.preventDefault();
      void pickFromFile(file);
    };

    const onDragEnd = () => {
      blockDragRef.current = false;
      setIsDraggingOver(false);
    };
    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) setIsDraggingOver(false);
    };

    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('drop', onDrop);
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('dragleave', onDragLeave);
    return () => {
      document.removeEventListener('dragenter', onDragEnter);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('drop', onDrop);
      document.removeEventListener('dragend', onDragEnd);
      document.removeEventListener('dragleave', onDragLeave);
    };
  }, [pickFromFile]);

  return { isDraggingOver, pickFromFile };
}
