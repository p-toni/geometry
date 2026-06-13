import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { contentPathToSlug, slugToContentPath, slugToPath } from '../../lib/paths';
import { findDeepLinkReader } from '../../lib/reader';
import { getCanvas } from '../../routes/canvasRegistry';
import { useCanvasStore } from '../../store/canvasStore';

/**
 * Routing facts for the canvas's deep-linkable reader block. The URL is the
 * source of truth for which essay the reader shows: `<basePath>` for the
 * canvas default, `<basePath>/<essay-slug>` for everything else.
 */
export function useReaderRouting() {
  const canvas = useCanvasStore((state) => state.canvas);
  const reader = findDeepLinkReader(canvas.items);
  const original = getCanvas(canvas.slug);
  const defaultContent = original ? findDeepLinkReader(original.items)?.content : undefined;
  const basePath = slugToPath(canvas.slug);
  const enabled = basePath !== '/' && Boolean(reader && defaultContent);

  const hrefFor = (contentPath: string) => {
    if (!enabled) return null;
    const essaySlug = contentPathToSlug(contentPath);
    if (!essaySlug) return null;
    return contentPath === defaultContent ? basePath : `${basePath}/${essaySlug}`;
  };

  return { reader: enabled ? reader : null, defaultContent, basePath, enabled, hrefFor };
}

/** Syncs the `:essay` URL param into the reader block's content. */
export function useReaderDeepLink() {
  const { essay } = useParams();
  const { reader, defaultContent, enabled } = useReaderRouting();
  const navigateItemContent = useCanvasStore((state) => state.navigateItemContent);

  // The sync effect must read the reader's latest content without re-running
  // when it changes (only URL changes drive it), so the value lives in a ref.
  const readerRef = useRef(reader);
  useEffect(() => {
    readerRef.current = reader;
  });

  useEffect(() => {
    const current = readerRef.current;
    if (!enabled || !current || !defaultContent) return;
    const target = essay ? slugToContentPath(essay) : defaultContent;
    if (current.content !== target) navigateItemContent(current.id, target);
  }, [essay, enabled, defaultContent, navigateItemContent]);
}
