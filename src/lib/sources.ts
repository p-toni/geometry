import { SOURCES_DATA } from './sources.data';

export type SourceKind = 'paper' | 'preprint' | 'product' | 'internal';

export type SourceRecord = {
  id: string;
  author: string;
  year?: number;
  title: string;
  kind: SourceKind;
  href?: string;
  external: true;
};

let cache: Record<string, SourceRecord> | undefined;

export function loadSources(): Record<string, SourceRecord> {
  const loaded: Record<string, SourceRecord> = cache ?? { ...SOURCES_DATA };
  cache = loaded;
  return loaded;
}

/** Match `[Author 1998]` token to a sources.yml id. */
export function resolveCitationToken(token: string): SourceRecord | null {
  const sources = loadSources();
  const yearMatch = token.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : undefined;
  const authorPart = token.replace(/\(\d{4}\)|\d{4}/, '').trim().toLowerCase();

  for (const rec of Object.values(sources)) {
    const recAuthor = rec.author.toLowerCase();
    if (authorPart && recAuthor.includes(authorPart.split(/\s+/)[0]!)) {
      if (!year || rec.year === year) return rec;
    }
    if (token.toLowerCase().includes(rec.id.replace(/-/g, ' '))) return rec;
  }

  for (const rec of Object.values(sources)) {
    if (year && rec.year === year && recAuthorMatch(rec.author, authorPart)) return rec;
  }
  return null;
}

function recAuthorMatch(author: string, part: string): boolean {
  const a = author.toLowerCase();
  const p = part.toLowerCase();
  return a.includes(p) || p.includes(a.split(/\s+/)[0]!);
}

export function allSources(): SourceRecord[] {
  return Object.values(loadSources());
}
