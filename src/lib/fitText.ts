import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  measureLineStats,
  prepareWithSegments,
  type PrepareOptions,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';

const MIN = 8;
const MAX = 320;
const ITERATIONS = 10;
const DEFAULT_LINE_HEIGHT_RATIO = 1.1;
const PREPARED_CACHE_LIMIT = 500;

const preparedCache = new Map<string, PreparedTextWithSegments>();

interface FitOptions {
  fontFamily: string;
  fontWeight?: string | number;
  width: number;
  height: number;
  text: string;
  enabled: boolean;
  lineHeightRatio?: number;
  maxSize?: number;
  minSize?: number;
  maxLines?: number;
  whiteSpace?: PrepareOptions['whiteSpace'];
  wordBreak?: PrepareOptions['wordBreak'];
  letterSpacing?: number;
}

function fontForSize(fontFamily: string, fontWeight: string | number | undefined, size: number) {
  const weightSegment = fontWeight !== undefined ? `${fontWeight} ` : '';
  return `${weightSegment}${size}px ${fontFamily}`;
}

function preparedFor(text: string, font: string, options: PrepareOptions) {
  const cacheKey = JSON.stringify([text, font, options]);
  const cached = preparedCache.get(cacheKey);
  if (cached) return cached;

  const prepared = prepareWithSegments(text, font, options);
  preparedCache.set(cacheKey, prepared);
  if (preparedCache.size > PREPARED_CACHE_LIMIT) {
    const oldest = preparedCache.keys().next().value;
    if (oldest) preparedCache.delete(oldest);
  }
  return prepared;
}

function findFitSize({
  text,
  fontFamily,
  fontWeight,
  width,
  height,
  lineHeightRatio = DEFAULT_LINE_HEIGHT_RATIO,
  maxSize = MAX,
  minSize = MIN,
  maxLines,
  whiteSpace = 'normal',
  wordBreak = 'normal',
  letterSpacing,
}: Omit<FitOptions, 'enabled'>) {
  if (width <= 0 || height <= 0 || !text) return null;
  let lo = minSize;
  let hi = maxSize;
  const prepareOptions: PrepareOptions = { whiteSpace, wordBreak, letterSpacing };

  for (let i = 0; i < ITERATIONS; i += 1) {
    const mid = (lo + hi) / 2;
    const font = fontForSize(fontFamily, fontWeight, mid);
    try {
      const prepared = preparedFor(text, font, prepareOptions);
      const stats = measureLineStats(prepared, width);
      const lineCount = Math.max(1, stats.lineCount);
      const measuredHeight = lineCount * mid * lineHeightRatio;
      if (measuredHeight <= height && (!maxLines || lineCount <= maxLines)) lo = mid;
      else hi = mid;
    } catch {
      hi = mid;
    }
  }
  return Math.floor(lo);
}

export function useFitFontSize(options: FitOptions): number | null {
  const {
    enabled,
    text,
    fontFamily,
    fontWeight,
    width,
    height,
    lineHeightRatio,
    maxSize,
    minSize,
    maxLines,
    whiteSpace,
    wordBreak,
    letterSpacing,
  } = options;
  return useMemo(() => {
    if (!enabled) return null;
    return findFitSize({
      text,
      fontFamily,
      fontWeight,
      width,
      height,
      lineHeightRatio,
      maxSize,
      minSize,
      maxLines,
      whiteSpace,
      wordBreak,
      letterSpacing,
    });
  }, [
    enabled,
    text,
    fontFamily,
    fontWeight,
    width,
    height,
    lineHeightRatio,
    maxSize,
    minSize,
    maxLines,
    whiteSpace,
    wordBreak,
    letterSpacing,
  ]);
}

export function useElementSize<T extends HTMLElement>(): [
  RefObject<T | null>,
  { width: number; height: number },
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}
