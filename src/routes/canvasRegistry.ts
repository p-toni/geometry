import nav from '../content/nav.json';
import { parseCanvas } from '../store/canvasSchema';
import type { Canvas } from '../types';

const modules = import.meta.glob('../content/canvases/**/*.json', {
  eager: true,
  import: 'default',
});

function pathToSlug(path: string) {
  return path.replace(/^.*\/canvases\//, '').replace(/\.json$/, '');
}

function readOrder(value: unknown) {
  if (
    typeof value === 'object' &&
    value !== null &&
    'order' in value &&
    Array.isArray((value as { order: unknown }).order)
  ) {
    return (value as { order: unknown[] }).order.filter(
      (entry): entry is string => typeof entry === 'string',
    );
  }
  return [];
}

const canvases = Object.entries(modules).map(([path, value]) => ({
  slug: pathToSlug(path),
  canvas: parseCanvas(value),
}));

export const canvasesBySlug = new Map<string, Canvas>(
  canvases.map(({ slug, canvas }) => [slug, canvas]),
);

const order = readOrder(nav);
const orderedSlugs = [
  ...order.filter((slug) => canvasesBySlug.has(slug)),
  ...canvases
    .map(({ slug }) => slug)
    .filter((slug) => !order.includes(slug))
    .sort((a, b) => a.localeCompare(b)),
];

export const canvasRoutes = orderedSlugs.map((slug) => ({
  slug,
  path: slug === 'home' ? '/' : slug,
}));

export function getCanvas(slug: string) {
  return canvasesBySlug.get(slug) ?? null;
}
