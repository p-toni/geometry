import type { BlockRendererProps } from './types';

export function Image({ item, toggled, sliderValue }: BlockRendererProps) {
  return (
    <img
      key={item.content}
      src={item.content}
      alt={item.label}
      className="h-full w-full"
      style={{
        opacity: sliderValue,
        objectFit: toggled ? 'contain' : 'cover',
      }}
    />
  );
}
