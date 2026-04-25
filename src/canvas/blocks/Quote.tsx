import { cn } from '../../lib/cn';
import type { BlockRendererProps } from './types';

export function Quote({ item, toggled, alignValue }: BlockRendererProps) {
  return (
    <blockquote
      className={cn(
        'text-[20px] font-medium leading-snug',
        alignValue === 'left'
          ? 'border-l-4 border-accent pl-4'
          : 'border-t-2 border-accent pt-3',
      )}
      style={{ textAlign: alignValue }}
    >
      {item.content}
      {toggled ? <span className="text-accent-ink"> /</span> : null}
    </blockquote>
  );
}
