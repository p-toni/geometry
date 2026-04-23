import type { BlockRendererProps } from './types';

export function Quote({ item, toggled }: BlockRendererProps) {
  return (
    <blockquote
      className="border-l-4 border-accent pl-4 text-[20px] leading-snug text-ink"
      style={{ fontVariationSettings: `'opsz' 72, 'SOFT' ${toggled ? 90 : 20}, 'WONK' 1` }}
    >
      {item.content}
    </blockquote>
  );
}
