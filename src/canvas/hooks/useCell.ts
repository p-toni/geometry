import { useEffect, useState } from 'react';
import { FOOTER_HEIGHT, HEADER_HEIGHT, MOBILE_BREAKPOINT } from '../../constants';
import { deriveCanvasHeight, deriveCell } from './cellMath';

interface ViewportMetrics {
  width: number;
  height: number;
  canvasHeight: number;
  cell: number;
  isMobile: boolean;
}

function readMetrics(): ViewportMetrics {
  const width = typeof window === 'undefined' ? 1200 : window.innerWidth;
  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  return {
    width,
    height,
    canvasHeight: deriveCanvasHeight(height),
    cell: deriveCell(width, height),
    isMobile: width < MOBILE_BREAKPOINT,
  };
}

export function useCell() {
  const [metrics, setMetrics] = useState(readMetrics);

  useEffect(() => {
    const onResize = () => setMetrics(readMetrics());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    ...metrics,
    headerHeight: HEADER_HEIGHT,
    footerHeight: FOOTER_HEIGHT,
  };
}
