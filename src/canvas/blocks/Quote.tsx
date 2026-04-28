import { cn } from '../../lib/cn';
import { useFitFontSize, useElementSize } from '../../lib/fitText';
import type { BlockRendererProps } from './types';

const FONT = "'Albert Sans Variable', 'Albert Sans', system-ui, sans-serif";

export function Quote({ item, toggled, alignValue, fitEnabled }: BlockRendererProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const fitted = useFitFontSize({
    enabled: fitEnabled,
    text: item.content,
    fontFamily: FONT,
    fontWeight: 500,
    width: size.width,
    height: size.height,
    lineHeightRatio: 1.375,
    maxSize: 20,
    whiteSpace: 'pre-wrap',
  });

  return (
    <div ref={ref} className="h-full w-full">
      <blockquote
        className={cn(
          'font-medium leading-snug',
          alignValue === 'left'
            ? 'border-l-4 border-accent pl-4'
            : alignValue === 'right'
              ? 'border-r-4 border-accent pr-4'
              : 'border-t-2 border-accent pt-3',
        )}
        style={{ textAlign: alignValue, fontSize: `${fitted ?? 20}px` }}
      >
        {item.content}
        {toggled ? <span className="text-accent-ink"> /</span> : null}
      </blockquote>
    </div>
  );
}
