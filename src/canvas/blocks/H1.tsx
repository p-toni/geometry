import type { BlockRendererProps } from './types';

export function H1({ item, toggled }: BlockRendererProps) {
  return (
    <h1
      className="font-display text-[72px] leading-[0.86] tracking-normal"
      style={{ fontVariationSettings: `'opsz' 144, 'SOFT' ${toggled ? 80 : 20}, 'WONK' 0` }}
    >
      {item.content}
    </h1>
  );
}
