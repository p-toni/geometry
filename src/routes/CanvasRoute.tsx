import { Canvas } from '../canvas/Canvas';
import { getCanvas } from './canvasRegistry';
import { NotFound } from './NotFound';

export function CanvasRoute({ slug }: { slug: string }) {
  const canvas = getCanvas(slug);
  if (!canvas) return <NotFound />;
  return <Canvas key={slug} initialCanvas={canvas} />;
}
