const BACKLINK_CAPTURE_RE = /\[\[backlink:([^|]+)\|([^|]+)\|([^\]]+)\]\]/g;
const BACKLINK_DETECT_RE = /\[\[backlink:[^|]+\|[^|]+\|[^\]]+\]\]/;

export type InlinePart =
  | { kind: 'text'; text: string }
  | { kind: 'backlink'; title: string; rel: string; targetId: string };

/** Split paragraph text into plain runs and inline backlink tokens. */
export function splitInlineBacklinks(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let lastIndex = 0;

  for (const m of text.matchAll(BACKLINK_CAPTURE_RE)) {
    const idx = m.index!;
    if (idx > lastIndex) {
      const run = text.slice(lastIndex, idx);
      if (run) parts.push({ kind: 'text', text: run });
    }
    parts.push({
      kind: 'backlink',
      title: m[1]!.trim(),
      rel: m[2]!.trim(),
      targetId: m[3]!.trim(),
    });
    lastIndex = idx + m[0].length;
  }

  if (lastIndex < text.length) {
    const run = text.slice(lastIndex);
    if (run) parts.push({ kind: 'text', text: run });
  }

  if (!parts.length && text) parts.push({ kind: 'text', text });
  return parts;
}

export function hasInlineBacklink(text: string): boolean {
  return BACKLINK_DETECT_RE.test(text);
}