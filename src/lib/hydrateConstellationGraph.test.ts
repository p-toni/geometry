import { describe, expect, it } from 'vitest';
import { generatedPool } from '../pool/generated';
import { buildConstellationDigest } from './constellationDigest';
import {
  authoredLayoutReady,
  hydrateConstellationGraph,
  isLinkInquiry,
} from './hydrateConstellationGraph';

describe('hydrateConstellationGraph', () => {
  it('anchors bounded-me agent source to essay sections', () => {
    const node = generatedPool.nodes['bounded-me'];
    const digest = buildConstellationDigest(node)!;
    const raw = {
      people: [
        {
          id: 'bounded-me-lens',
          name: 'bounded me',
          meta: 'extracting · structure',
          topicIds: ['finite-loop'],
        },
        {
          id: 'bounded-me-memory-geometry',
          name: 'memory as geometry',
          meta: 'navigating · shape',
          topicIds: ['geometry-not-storage'],
        },
        {
          id: 'bounded-me-me-plus-ai',
          name: 'coupling ahead',
          meta: 'cites · exchange',
          topicIds: ['coupling-problem'],
        },
      ],
      topicLabels: { 'finite-loop': 'finite loop', 'geometry-not-storage': 'geometry not storage', 'coupling-problem': 'coupling' },
    };

    const hydrated = hydrateConstellationGraph(raw, digest);
    expect(hydrated.people.find((p) => p.id === 'bounded-me-memory-geometry')?.sectionSlug).toBeTruthy();
    expect(isLinkInquiry(hydrated.people.find((p) => p.id === 'bounded-me-me-plus-ai')!)).toBe(true);
    expect(
      authoredLayoutReady(hydrated, digest.sections.map((s) => s.slug)),
    ).toBe(true);
  });

  it('preserves existing sectionSlug', () => {
    const digest = buildConstellationDigest(generatedPool.nodes['me-plus-ai'])!;
    const hydrated = hydrateConstellationGraph(
      {
        people: [
          {
            id: 'me-plus-ai-lens',
            name: 'lens',
            meta: 'm',
            topicIds: ['a'],
          },
          {
            id: 'me-plus-ai-coupling-gradient',
            name: 'coupling gradient',
            meta: 'm',
            topicIds: ['b'],
            sectionSlug: 'the-coupling-gradient-where-am-i-right-now',
          },
        ],
        topicLabels: { a: 'A', b: 'B' },
      },
      digest,
    );
    expect(hydrated.people[1]?.sectionSlug).toBe('the-coupling-gradient-where-am-i-right-now');
  });
});