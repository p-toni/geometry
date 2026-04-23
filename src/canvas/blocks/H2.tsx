import type { BlockRendererProps } from './types';

export function H2({ item, toggled }: BlockRendererProps) {
  return (
    <h2
      className="font-display text-[42px] leading-[0.95] tracking-normal"
      style={{ fontVariationSettings: `'opsz' 96, 'SOFT' ${toggled ? 80 : 10}, 'WONK' 0` }}
    >
      {item.content}
    </h2>
  );
}
