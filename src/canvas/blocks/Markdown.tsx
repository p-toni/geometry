import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../../store/canvasStore';
import { useReaderRouting } from '../hooks/useReaderRoute';
import type { BlockRendererProps } from './types';

const MarkdownRuntime = lazy(() => import('./MarkdownRuntime'));

function useHasMoreBelow(text: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const update = () => setHasMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [text]);

  return { scrollRef, hasMore };
}

export function Markdown({ item, selectorValue, toggled, alignValue }: BlockRendererProps) {
  const source = selectorValue ?? item.content;
  const isRemote = source.startsWith('/');
  const [markdown, setMarkdown] = useState<{ source: string; text: string }>({
    source: isRemote ? '' : source,
    text: isRemote ? '' : source,
  });
  const openMarkdownSource = useCanvasStore((state) => state.openMarkdownSource);
  const { hrefFor } = useReaderRouting();
  const navigate = useNavigate();

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
  const { scrollRef, hasMore } = useHasMoreBelow(text);

  const openContent = (href: string) => {
    const route = hrefFor(href);
    if (route) {
      navigate(route);
      return;
    }
    openMarkdownSource(item.id, href);
  };

  if (toggled) {
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
        {text}
      </pre>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        className="markdown-body h-full overflow-auto pr-2"
        style={{ textAlign: alignValue }}
      >
        <Suspense fallback={<p>Loading...</p>}>
          <MarkdownRuntime
            markdown={text}
            onOpenContent={openContent}
            resolveContentHref={hrefFor}
          />
        </Suspense>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 transition-opacity duration-200 ease-out"
        style={{
          opacity: hasMore ? 1 : 0,
          background: 'linear-gradient(to top, var(--md-fade, transparent), transparent)',
        }}
      />
    </div>
  );
}
