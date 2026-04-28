import { useEffect, useState } from 'react';
import type { BlockRendererProps } from './types';

// Code blocks always render on their own paper surface so Shiki's syntax
// colours stay legible regardless of the cushion colour.
const CODE_SURFACE =
  'h-full overflow-auto rounded-[10px] bg-paper p-3 font-mono text-[12px] leading-relaxed text-ink';

export function Code({ item, toggled, selectorValue }: BlockRendererProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let active = true;
    import('../../lib/highlight')
      .then(({ highlight }) => highlight(item.content, selectorValue ?? 'typescript'))
      .then((value) => {
        if (active) setHtml(value);
      })
      .catch(() => {
        if (active) setHtml('');
      });

    return () => {
      active = false;
    };
  }, [item.content, item.refreshKey, selectorValue]);

  if (toggled || !html) {
    return (
      <pre className={`${CODE_SURFACE} whitespace-pre-wrap`}>
        <code>{item.content}</code>
      </pre>
    );
  }

  return (
    <div
      className={`${CODE_SURFACE} [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
