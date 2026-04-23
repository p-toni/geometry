import { lazy, Suspense, useEffect, useState } from 'react';
import type { BlockRendererProps } from './types';

const MarkdownRuntime = lazy(() => import('./MarkdownRuntime'));

export function Markdown({ item, selectorValue }: BlockRendererProps) {
  const source = selectorValue ?? item.content;
  const [markdown, setMarkdown] = useState('');
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

  return (
    <div className="markdown-body h-full overflow-auto pr-1 text-[15px] leading-relaxed">
      <Suspense fallback={<p>Loading...</p>}>
        <MarkdownRuntime markdown={isRemote ? markdown : source} />
      </Suspense>
    </div>
  );
}
