import { lazy, Suspense, useEffect, useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { BlockRendererProps } from './types';

const MarkdownRuntime = lazy(() => import('./MarkdownRuntime'));

export function Markdown({ item, selectorValue, toggled, alignValue }: BlockRendererProps) {
  const source = selectorValue ?? item.content;
  const [markdown, setMarkdown] = useState('');
  const openMarkdownSource = useCanvasStore((state) => state.openMarkdownSource);
  const isRemote = source.startsWith('/');

  useEffect(() => {
    let active = true;

    if (isRemote) {
      fetch(source)
        .then((response) => {
          if (!response.ok) throw new Error(`Unable to fetch ${source}`);
          return response.text();
        })
        .then((text) => {
          if (active) setMarkdown(text);
        })
        .catch((error: unknown) => {
          if (active) setMarkdown(error instanceof Error ? error.message : String(error));
        });
    }

    return () => {
      active = false;
    };
  }, [isRemote, item.refreshKey, source]);

  if (toggled) {
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
        {isRemote ? markdown : source}
      </pre>
    );
  }

  return (
    <div className="markdown-body h-full overflow-auto pr-2" style={{ textAlign: alignValue }}>
      <Suspense fallback={<p>Loading...</p>}>
        <MarkdownRuntime
          markdown={isRemote ? markdown : source}
          onOpenContent={(href) => openMarkdownSource(item.id, href)}
        />
      </Suspense>
    </div>
  );
}
