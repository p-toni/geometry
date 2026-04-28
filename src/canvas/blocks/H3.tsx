import { useFitFontSize, useElementSize } from '../../lib/fitText';
import type { BlockRendererProps } from './types';

const FONT = "'Albert Sans Variable', 'Albert Sans', system-ui, sans-serif";

export function H3({ item, toggled, sliderValue, alignValue, fitEnabled }: BlockRendererProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const targetSize = 22 * sliderValue;
  const fitted = useFitFontSize({
    enabled: true,
    text: item.content,
    fontFamily: FONT,
    fontWeight: 650,
    width: size.width,
    height: size.height,
    lineHeightRatio: 1.2,
    maxLines: fitEnabled ? undefined : 3,
    maxSize: targetSize,
  });
  const fontSize = fitted ?? targetSize;

  return (
    <div ref={ref} className="h-full w-full">
      <h3
        className="font-display leading-tight tracking-normal"
        style={{ fontSize: `${fontSize}px`, fontWeight: 650, textAlign: alignValue }}
      >
        {item.content}
        {toggled ? <span className="text-accent-ink">.</span> : null}
      </h3>
    </div>
  );
}
