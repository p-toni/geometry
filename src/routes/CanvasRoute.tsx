import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '../canvas/Canvas';
import { markdownSources } from '../content/markdownRegistry';
import { slugToContentPath } from '../lib/paths';
import { getCanvas } from './canvasRegistry';
import { NotFound } from './NotFound';

export function CanvasRoute({ slug }: { slug: string }) {
  const canvas = getCanvas(slug);
  const { essay } = useParams();
  const essayExists =
    !essay || markdownSources.some((source) => source.value === slugToContentPath(essay));

  useEffect(() => {
    document.title =
      canvas && essayExists
        ? [essay, canvas.title === 'toni.ltd' ? null : canvas.title, 'toni.ltd']
            .filter(Boolean)
            .join(' · ')
        : '404 · toni.ltd';
  }, [canvas, essay, essayExists]);

  if (!canvas || !essayExists) return <NotFound />;
  return <Canvas key={slug} initialCanvas={canvas} />;
}
