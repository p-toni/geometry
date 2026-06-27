import { describe, expect, it } from 'vitest';
import { graphToStructure, structureFromExcerpt } from './essayStructure';

describe('essayStructure', () => {
  it('derives fallback sections from excerpt', () => {
    const s = structureFromExcerpt('allowed ignorance', [
      'What do you let yourself stop knowing once a model holds the detail for you?',
      'The skill stops being recall and becomes judgment.',
    ]);
    expect(s.centerLabel).toBe('allowed ignorance');
    expect(s.sections.length).toBeGreaterThan(0);
    expect(s.sections[0]?.concepts.length).toBeGreaterThan(0);
  });

  it('builds from generated graph json', () => {
    const s = graphToStructure(
      {
        people: [
          { id: 'x-lens', name: 'test', meta: 'A thesis lens — detail', topicIds: ['a'] },
          {
            id: 'x-section-0',
            name: 'preamble',
            meta: 'section · argument move',
            topicIds: ['preamble', 'structure'],
          },
        ],
        topicLabels: { preamble: 'Preamble', structure: 'structure' },
      },
      'test essay',
    );
    expect(s?.lens).toBe('A thesis lens');
    expect(s?.sections[0]?.concepts).toContain('structure');
  });
});