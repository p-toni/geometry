export function slugToPath(slug: string) {
  return slug === 'home' ? '/' : `/${slug.replace(/^\/+/, '')}`;
}

export function contentPathToSlug(path: string) {
  const match = /^\/content\/([\w-]+)\.md$/.exec(path);
  return match?.[1] ?? null;
}

export function slugToContentPath(slug: string) {
  return `/content/${slug}.md`;
}
