import { useFitFontSize, useElementSize } from '../../lib/fitText';
import type { BlockRendererProps } from './types';

const FONT = "'Fraunces Variable', 'Fraunces', Georgia, serif";

export function H1({ item, toggled, sliderValue, alignValue, fitEnabled }: BlockRendererProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const targetSize = 64 * sliderValue;
  const fitted = useFitFontSize({
    enabled: true,
    text: item.content,
    fontFamily: FONT,
    fontWeight: 650,
    width: size.width,
    height: size.height,
    lineHeightRatio: 0.95,
    maxLines: fitEnabled ? undefined : 2,
    maxSize: targetSize,
  });
  const fontSize = fitted ?? targetSize;

  return (
    <div ref={ref} className="h-full w-full">
      <h1
        className="leading-[0.95] tracking-normal"
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: `${fontSize}px`,
          fontWeight: 650,
          textAlign: alignValue,
        }}
      >
        {item.content}
        {toggled ? <span className="text-accent-ink">.</span> : null}
      </h1>
    </div>
  );
}
