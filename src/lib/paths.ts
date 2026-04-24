export function slugToPath(slug: string) {
  return slug === 'home' ? '/' : `/${slug.replace(/^\/+/, '')}`;
}
