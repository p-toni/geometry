import type { BlockRendererProps } from './types';

export function H3({ item, toggled }: BlockRendererProps) {
  return (
    <h3
      className="font-display text-[24px] leading-tight tracking-normal"
      style={{ fontVariationSettings: `'opsz' 72, 'SOFT' ${toggled ? 80 : 10}, 'WONK' 0` }}
    >
      {item.content}
    </h3>
  );
}
