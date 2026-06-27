import type { ReactNode } from 'react';

type Segment = { kind: 'text' | 'strong' | 'em'; value: string };

function normalizeLatex(text: string): string {
  return text
    .replace(/\$([^$]+)\$/g, (_, inner) =>
      inner
        .replace(/\\le/g, '≤')
        .replace(/\\theta/g, 'θ')
        .replace(/\\kappa/g, 'κ')
        .replace(/\\longleftrightarrow/g, '↔')
        .replace(/\\rightarrow/g, '→')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .trim(),
    );
}

/** Lightweight inline markdown: **bold**, *italic*. */
export function parseInlineMarkdown(text: string): Segment[] {
  const segments: Segment[] = [];
  const normalized = normalizeLatex(text);
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|([^*]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized)) !== null) {
    if (m[1]) segments.push({ kind: 'strong', value: m[1] });
    else if (m[2]) segments.push({ kind: 'em', value: m[2] });
    else if (m[3]) segments.push({ kind: 'text', value: m[3] });
  }
  return segments.length ? segments : [{ kind: 'text', value: normalized }];
}

export function renderInlineMarkdown(text: string): ReactNode {
  return parseInlineMarkdown(text).map((seg, i) => {
    if (seg.kind === 'strong') return <strong key={i}>{seg.value}</strong>;
    if (seg.kind === 'em') return <em key={i}>{seg.value}</em>;
    return <span key={i}>{seg.value}</span>;
  });
}