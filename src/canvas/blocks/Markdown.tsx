import { lazy, Suspense, useEffect, useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import type { BlockRendererProps } from './types';

const MarkdownRuntime = lazy(() => import('./MarkdownRuntime'));

export function Markdown({ item, selectorValue, toggled, alignValue }: BlockRendererProps) {
  const source = selectorValue ?? item.content;
  const isRemote = source.startsWith('/');
  const [markdown, setMarkdown] = useState<{ source: string; text: string }>({
    source: isRemote ? '' : source,
    text: isRemote ? '' : source,
  });
  const openMarkdownSource = useCanvasStore((state) => state.openMarkdownSource);

  useEffect(() => {
    if (!isRemote) return;
    let active = true;
    fetch(source)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to fetch ${source}`);
        return response.text();
      })
      .then((text) => {
        if (active) setMarkdown({ source, text });
      })
      .catch((error: unknown) => {
        if (active)
          setMarkdown({ source, text: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      active = false;
    };
  }, [source, isRemote, item.refreshKey]);

  const text = isRemote ? (markdown.source === source ? markdown.text : '') : source;

  if (toggled) {
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
        {text}
      </pre>
    );
  }

  return (
    <div className="markdown-body h-full overflow-auto pr-2" style={{ textAlign: alignValue }}>
      <Suspense fallback={<p>Loading...</p>}>
        <MarkdownRuntime
          markdown={text}
          onOpenContent={(href) => openMarkdownSource(item.id, href)}
        />
      </Suspense>
    </div>
  );
}
