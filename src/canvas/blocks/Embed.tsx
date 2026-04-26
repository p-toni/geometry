import { resolveShader } from '../../shaders';
import type { BlockRendererProps } from './types';

export function Embed({ item }: BlockRendererProps) {
  const shader = resolveShader(item.content);
  const srcDoc = shader ?? item.content;
  return (
    <iframe
      title={item.label}
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      className="block h-full w-full"
    />
  );
}
