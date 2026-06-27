const BACKLINK_CAPTURE_RE = /\[\[backlink:([^|]+)\|([^|]+)\|([^\]]+)\]\]/g;
const BACKLINK_SHORT_RE = /\[\[([^|\]]+)\|([a-z][a-z0-9-]*)\]\]/g;
const BACKLINK_DETECT_RE =
  /\[\[backlink:[^|]+\|[^|]+\|[^\]]+\]\]|\[\[[^|\]]+\|[a-z][a-z0-9-]*\]\]/;

export type InlinePart =
  | { kind: 'text'; text: string }
  | { kind: 'backlink'; title: string; rel: string; targetId: string };

function* allBacklinkMatches(text: string) {
  for (const m of text.matchAll(BACKLINK_CAPTURE_RE)) {
    yield { index: m.index!, length: m[0].length, title: m[1]!, rel: m[2]!, targetId: m[3]! };
  }
  for (const m of text.matchAll(BACKLINK_SHORT_RE)) {
    if (m[0].startsWith('[[backlink:') || m[0].startsWith('[[sidenote:')) continue;
    yield { index: m.index!, length: m[0].length, title: m[1]!, rel: 'pairs', targetId: m[2]! };
  }
}

/** Split paragraph text into plain runs and inline backlink tokens. */
export function splitInlineBacklinks(text: string): InlinePart[] {
  const matches = [...allBacklinkMatches(text)].sort((a, b) => a.index - b.index);
  const parts: InlinePart[] = [];
  let lastIndex = 0;

  for (const m of matches) {
    if (m.index > lastIndex) {
      const run = text.slice(lastIndex, m.index);
      if (run) parts.push({ kind: 'text', text: run });
    }
    parts.push({
      kind: 'backlink',
      title: m.title.trim(),
      rel: m.rel.trim(),
      targetId: m.targetId.trim(),
    });
    lastIndex = m.index + m.length;
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