import type { MouseEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function transformUrl(url: string) {
  if (
    url.startsWith('/content/') ||
    url.startsWith('/images/') ||
    url.startsWith('https://') ||
    url.startsWith('http://') ||
    url.startsWith('mailto:')
  ) {
    return url;
  }
  return '';
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export default function MarkdownRuntime({
  markdown,
  onOpenContent,
  resolveContentHref,
}: {
  markdown: string;
  onOpenContent?: (href: string) => void;
  resolveContentHref?: (href: string) => string | null;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      urlTransform={transformUrl}
      components={{
        a({ href, children }) {
          if (href?.startsWith('/content/')) {
            const route = resolveContentHref?.(href) ?? null;
            if (route) {
              return (
                <a
                  href={route}
                  data-no-drag="true"
                  className="markdown-content-link"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isModifiedClick(event)) return;
                    event.preventDefault();
                    onOpenContent?.(href);
                  }}
                >
                  {children}
                </a>
              );
            }
            return (
              <button
                type="button"
                data-no-drag="true"
                className="markdown-content-link"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenContent?.(href);
                }}
              >
                {children}
              </button>
            );
          }
          return (
            <a
              href={href}
              data-no-drag="true"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noreferrer' : undefined}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
