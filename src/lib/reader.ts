import type { Item } from '../types';

/**
 * The canvas's primary long-form block: the markdown item whose id contains
 * "reader", or failing that the largest markdown item. Essay deep links and
 * in-content navigation target this block.
 */
export function findReaderItem(items: Item[]): Item | null {
  const markdownItems = items.filter((item) => item.type === 'markdown');
  return (
    markdownItems.find((item) => item.id.includes('reader')) ??
    [...markdownItems].sort((a, b) => b.cols * b.rows - a.cols * a.rows)[0] ??
    null
  );
}

/**
 * Reader eligible for essay deep links (`/:slug/:essay`). Stricter than
 * findReaderItem: the block must be explicitly named "reader" and show a
 * `/content/*.md` file, so canvases without one never grab URL segments.
 */
export function findDeepLinkReader(items: Item[]): Item | null {
  const reader = items.find((item) => item.type === 'markdown' && item.id.includes('reader'));
  return reader?.content.startsWith('/content/') ? reader : null;
}
