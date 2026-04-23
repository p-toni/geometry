import type { BlockRendererProps } from './types';

export function P({ item, sliderValue }: BlockRendererProps) {
  return (
    <p className="text-[17px] leading-[1.45] text-ink" style={{ opacity: sliderValue }}>
      {item.content}
    </p>
  );
}
