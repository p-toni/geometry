import { cn } from '../../lib/cn';
import { useFitFontSize, useElementSize } from '../../lib/fitText';
import type { BlockRendererProps } from './types';

const FONT = "'Albert Sans Variable', 'Albert Sans', system-ui, sans-serif";
const MONO = "'JetBrains Mono Variable', 'SF Mono', monospace";

export function P({ item, sliderValue, toggled, alignValue, fitEnabled }: BlockRendererProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const fitted = useFitFontSize({
    enabled: fitEnabled,
    text: item.content,
    fontFamily: toggled ? MONO : FONT,
    fontWeight: 400,
    width: size.width,
    height: size.height,
    lineHeightRatio: 1.45,
    maxSize: toggled ? 13 : 17,
    whiteSpace: 'pre-wrap',
  });

  return (
    <div ref={ref} className="h-full w-full">
      <p
        className={cn('leading-[1.45]', toggled && !fitted ? 'font-mono' : null)}
        style={{
          opacity: sliderValue,
          textAlign: alignValue,
          fontSize: fitted ? `${fitted}px` : toggled ? '13px' : '17px',
          fontFamily: toggled ? MONO : undefined,
        }}
      >
        {item.content}
      </p>
    </div>
  );
}
