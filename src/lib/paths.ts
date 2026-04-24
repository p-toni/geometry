export function slugToPath(slug: string) {
  return slug === 'home' ? '/' : `/${slug.replace(/^\/+/, '')}`;
}

export function slugToRoutePath(slug: string) {
  return slugToPath(slug);
}
