import { useEffect } from 'react';
import { Canvas } from '../canvas/Canvas';
import { getCanvas } from './canvasRegistry';
import { NotFound } from './NotFound';

export function CanvasRoute({ slug }: { slug: string }) {
  const canvas = getCanvas(slug);
  useEffect(() => {
    document.title = canvas
      ? canvas.title === 'toni.ltd'
        ? 'toni.ltd'
        : `${canvas.title} · toni.ltd`
      : '404 · toni.ltd';
  }, [canvas]);

  if (!canvas) return <NotFound />;
  return <Canvas key={slug} initialCanvas={canvas} />;
}
