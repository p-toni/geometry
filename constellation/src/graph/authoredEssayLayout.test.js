import { describe, expect, it } from 'vitest';
import {
  authoredIntroOrder,
  canUseAuthoredLayout,
  classifyInquiries,
  layoutAuthoredEssay,
  sectionSlugOrder,
} from './authoredEssayLayout.js';
import { resolveGraph } from './resolveGraph.js';

const sampleGraph = {
  people: [
    { id: 'essay-lens', name: 'lens', meta: 'm', topicIds: ['a'] },
    { id: 'essay-s1', name: 'first move', meta: 'm', topicIds: ['a', 'b'], sectionSlug: 'preamble' },
    { id: 'essay-s2', name: 'second move', meta: 'm', topicIds: ['b', 'c'], sectionSlug: 'thesis' },
    { id: 'essay-link', name: 'exterior', meta: 'cites · x', topicIds: ['c'] },
  ],
  topicLabels: { a: 'A', b: 'B', c: 'C' },
  extraEdges: [['b', 'c']],
  meta: { sectionSlugs: ['preamble', 'thesis'] },
};

describe('authoredEssayLayout', () => {
  it('classifies lens, section, and link inquiries', () => {
    const { lens, sectionInquiries, linkInquiries } = classifyInquiries(sampleGraph.people);
    expect(lens?.id).toBe('essay-lens');
    expect(sectionInquiries).toHaveLength(2);
    expect(linkInquiries).toHaveLength(1);
  });

  it('uses meta sectionSlugs for essay order', () => {
    expect(sectionSlugOrder(sampleGraph.people.filter((p) => p.sectionSlug), ['preamble', 'thesis'])).toEqual([
      'preamble',
      'thesis',
    ]);
  });

  it('places lens at center and sections in slug order', () => {
    const resolved = resolveGraph(sampleGraph);
    const { nodes } = layoutAuthoredEssay({
      cx: 400,
      cy: 300,
      graphRadius: (f) => 200 * f,
      lens: resolved.lens,
      sectionInquiries: resolved.sectionInquiries,
      linkInquiries: resolved.linkInquiries,
      topics: resolved.topics,
      slugOrder: resolved.sectionSlugs,
    });

    expect(nodes['essay-lens'].x).toBe(400);
    expect(nodes['essay-lens'].y).toBe(300);
    expect(nodes['essay-lens'].kind).toBe('lens');

    const preamble = nodes['essay-s1'];
    const thesis = nodes['essay-s2'];
    expect(preamble.angle).toBeLessThan(thesis.angle);
  });

  it('clusters concepts near their primary section', () => {
    const resolved = resolveGraph(sampleGraph);
    const { nodes } = layoutAuthoredEssay({
      cx: 400,
      cy: 300,
      graphRadius: (f) => 200 * f,
      lens: resolved.lens,
      sectionInquiries: resolved.sectionInquiries,
      linkInquiries: resolved.linkInquiries,
      topics: resolved.topics,
      slugOrder: resolved.sectionSlugs,
    });

    expect(Math.abs(nodes.a.angle - nodes['essay-s1'].angle)).toBeLessThan(0.5);
    // b is shared — primary section is earliest in essay order (preamble)
    expect(Math.abs(nodes.b.angle - nodes['essay-s1'].angle)).toBeLessThan(Math.abs(nodes.b.angle - nodes['essay-s2'].angle));
    expect(Math.abs(nodes.c.angle - nodes['essay-s2'].angle)).toBeLessThan(0.5);
  });

  it('orders intro lens → sections → concepts → links', () => {
    const resolved = resolveGraph(sampleGraph);
    const { nodes } = layoutAuthoredEssay({
      cx: 0,
      cy: 0,
      graphRadius: (f) => f,
      lens: resolved.lens,
      sectionInquiries: resolved.sectionInquiries,
      linkInquiries: resolved.linkInquiries,
      topics: resolved.topics,
      slugOrder: resolved.sectionSlugs,
    });
    const order = authoredIntroOrder(nodes, resolved.sectionSlugs, resolved.PEOPLE, resolved.topics);
    expect(order[0]).toBe('essay-lens');
    expect(order.indexOf('essay-s1')).toBeLessThan(order.indexOf('essay-s2'));
    expect(order.indexOf('essay-s2')).toBeLessThan(order.indexOf('a'));
    expect(order.at(-1)).toBe('essay-link');
  });

  it('places link inquiries on the section ring, not a middle orbit', () => {
    const resolved = resolveGraph(sampleGraph);
    const { nodes } = layoutAuthoredEssay({
      cx: 400,
      cy: 300,
      graphRadius: (f) => 200 * f,
      lens: resolved.lens,
      sectionInquiries: resolved.sectionInquiries,
      linkInquiries: resolved.linkInquiries,
      topics: resolved.topics,
      slugOrder: resolved.sectionSlugs,
    });

    const sectionDist = Math.hypot(nodes['essay-s1'].x - 400, nodes['essay-s1'].y - 300);
    const linkDist = Math.hypot(nodes['essay-link'].x - 400, nodes['essay-link'].y - 300);
    const conceptDist = Math.hypot(nodes.a.x - 400, nodes.a.y - 300);

    expect(linkDist).toBeCloseTo(sectionDist, 5);
    expect(conceptDist).toBeGreaterThan(sectionDist);
  });

  it('detects authored layout eligibility', () => {
    const resolved = resolveGraph(sampleGraph);
    expect(canUseAuthoredLayout(resolved)).toBe(true);
    expect(canUseAuthoredLayout(resolveGraph({ people: [{ id: 'x', name: 'x', meta: 'm', topicIds: [] }], topicLabels: {} }))).toBe(false);
  });
});