import type { BlockRendererProps } from './types';

export function H1({ item, toggled, sliderValue, alignValue }: BlockRendererProps) {
  return (
    <h1
      className="font-display font-extrabold leading-[0.9] tracking-normal"
      style={{ fontSize: `${72 * sliderValue}px`, textAlign: alignValue }}
    >
      {item.content}
      {toggled ? <span className="text-accent-ink">.</span> : null}
    </h1>
  );
}
