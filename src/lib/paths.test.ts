import { describe, expect, it } from 'vitest';
import { contentPathToSlug, slugToContentPath, slugToPath } from './paths';

describe('paths', () => {
  it('maps slugs to routes', () => {
    expect(slugToPath('home')).toBe('/');
    expect(slugToPath('writing')).toBe('/writing');
  });

  it('round-trips content paths and essay slugs', () => {
    expect(contentPathToSlug('/content/04-co-owning-the-loop.md')).toBe(
      '04-co-owning-the-loop',
    );
    expect(slugToContentPath('04-co-owning-the-loop')).toBe(
      '/content/04-co-owning-the-loop.md',
    );
  });

  it('rejects non-content and traversal-like paths', () => {
    expect(contentPathToSlug('/images/photo.png')).toBeNull();
    expect(contentPathToSlug('/content/nested/file.md')).toBeNull();
    expect(contentPathToSlug('/content/../secret.md')).toBeNull();
    expect(contentPathToSlug('https://example.com/content/x.md')).toBeNull();
  });
});
