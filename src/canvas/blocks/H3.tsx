import type { BlockRendererProps } from './types';

export function H3({ item, toggled, sliderValue, alignValue }: BlockRendererProps) {
  return (
    <h3
      className="font-display font-semibold leading-tight tracking-normal"
      style={{ fontSize: `${24 * sliderValue}px`, textAlign: alignValue }}
    >
      {item.content}
      {toggled ? <span className="text-accent-ink">.</span> : null}
    </h3>
  );
}
