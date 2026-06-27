import { describe, expect, it } from 'vitest';
import { sectionRailMeta } from './argumentGrammar';

describe('sectionRailMeta', () => {
  it('maps core argument-grammar headings', () => {
    expect(sectionRailMeta('Frame')).toMatchObject({
      letter: 'A',
      role: 'frame',
      tier: 'grammar',
    });
    expect(sectionRailMeta('Claim')).toMatchObject({ letter: 'B', role: 'claim' });
    expect(sectionRailMeta('Operator 1: memory as geometry, not storage')).toMatchObject({
      letter: 'C',
      role: 'operator',
      display: 'Operator 1: memory as geometry, not storage',
    });
    expect(sectionRailMeta('Seam')).toMatchObject({ letter: 'D', role: 'seam' });
    expect(sectionRailMeta('Test')).toMatchObject({ letter: 'E', role: 'test' });
    expect(sectionRailMeta('Closing')).toMatchObject({ letter: 'F', role: 'consequence' });
  });

  it('strips roman prefixes for beat sections', () => {
    expect(sectionRailMeta('V. Crack')).toMatchObject({
      display: 'Crack',
      tier: 'beat',
      tagline: 'late failure along a line called cosmetic',
    });
  });

  it('returns null for h3', () => {
    expect(sectionRailMeta('Subsection', 3)).toBeNull();
  });
});