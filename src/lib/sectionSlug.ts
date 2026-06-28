/** Stable anchor for ## headings — shared by read panel and constellation. */
export function sectionSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/^(i{1,3}|iv|v|vi{0,3})\.\s+/i, '')
    .replace(/^[0-9]+\)\s*/, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}