import { cn } from '../../lib/cn';
import type { BlockRendererProps } from './types';

export function P({ item, sliderValue, toggled, alignValue }: BlockRendererProps) {
  return (
    <p
      className={cn('leading-[1.45]', toggled ? 'font-mono text-[13px]' : 'text-[17px]')}
      style={{ opacity: sliderValue, textAlign: alignValue }}
    >
      {item.content}
    </p>
  );
}
