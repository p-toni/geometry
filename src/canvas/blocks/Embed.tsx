import type { BlockRendererProps } from './types';

export function Embed({ item }: BlockRendererProps) {
  return (
    <iframe
      title={item.label}
      sandbox="allow-scripts"
      srcDoc={item.content}
      className="h-full w-full rounded-[6px] border border-ink/10 bg-white"
    />
  );
}
