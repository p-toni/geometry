import type { BlockRendererProps } from './types';

export function H2({ item, toggled, sliderValue, alignValue }: BlockRendererProps) {
  return (
    <h2
      className="font-display font-bold leading-[1.05] tracking-normal"
      style={{ fontSize: `${42 * sliderValue}px`, textAlign: alignValue }}
    >
      {item.content}
      {toggled ? <span className="text-accent-ink">.</span> : null}
    </h2>
  );
}
