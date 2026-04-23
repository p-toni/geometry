import { useEffect, useState } from 'react';
import type { BlockRendererProps } from './types';

export function Code({ item, toggled }: BlockRendererProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let active = true;
    import('../../lib/highlight')
      .then(({ highlightTypeScript }) => highlightTypeScript(item.content))
      .then((value) => {
        if (active) setHtml(value);
      })
      .catch(() => {
        if (active) setHtml('');
      });

    return () => {
      active = false;
    };
  }, [item.content, item.refreshKey]);

  if (toggled || !html) {
    return (
      <pre className="h-full overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed">
        <code>{item.content}</code>
      </pre>
    );
  }

  return (
    <div
      className="h-full overflow-auto text-[12px] [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
