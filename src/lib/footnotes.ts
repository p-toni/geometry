import type { SourceRecord } from './sources';

export type FootnoteEntry = {
  n: number;
  source: SourceRecord;
};

export type FootnoteRegistry = {
  /** Assign or reuse a section footnote number for a source. */
  cite: (source: SourceRecord) => number;
  entries: () => FootnoteEntry[];
};

export function createFootnoteRegistry(): FootnoteRegistry {
  const byId = new Map<string, number>();
  const order: FootnoteEntry[] = [];

  return {
    cite(source) {
      const existing = byId.get(source.id);
      if (existing !== undefined) return existing;
      const n = order.length + 1;
      byId.set(source.id, n);
      order.push({ n, source });
      return n;
    },
    entries: () => order,
  };
}