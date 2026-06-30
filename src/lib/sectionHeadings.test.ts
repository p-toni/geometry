import { describe, expect, it } from 'vitest';
import { generatedPool } from '../pool/generated';
import { buildConstellationDigest } from './constellationDigest';
import { sectionHeadingsFromBody } from './sectionHeadings';
import { sectionSlug } from './sectionSlug';

describe('sectionHeadingsFromBody', () => {
  it('uses h3 sections when essay has no h2 (me-plus-ai)', () => {
    const node = generatedPool.nodes['me-plus-ai'];
    const headings = sectionHeadingsFromBody(node.body);
    expect(headings.length).toBe(10);
    expect(sectionSlug(headings[0]!.x)).toBe('the-coupling-gradient-where-am-i-right-now');
  });

  it('builds constellation digest for me-plus-ai', () => {
    const digest = buildConstellationDigest(generatedPool.nodes['me-plus-ai']);
    expect(digest?.sections).toHaveLength(10);
    expect(digest?.sections[0]?.slug).toBe('the-coupling-gradient-where-am-i-right-now');
  });
});