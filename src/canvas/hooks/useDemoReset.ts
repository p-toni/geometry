import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { slugToPath } from '../../lib/paths';
import { useCanvasStore } from '../../store/canvasStore';

/** Resets the demo canvas and returns the URL to the canvas's base path. */
export function useDemoReset() {
  const reset = useCanvasStore((state) => state.reset);
  const slug = useCanvasStore((state) => state.canvas.slug);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(() => {
    reset();
    const basePath = slugToPath(slug);
    if (pathname !== basePath) navigate(basePath);
  }, [reset, slug, pathname, navigate]);
}
