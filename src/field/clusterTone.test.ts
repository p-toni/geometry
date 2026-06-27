import { describe, expect, it } from 'vitest';
import { clusterTone } from './clusterTone';

describe('clusterTone', () => {
  it('assigns ochre writing and cobalt-family work on warmed base', () => {
    const writing = clusterTone('writing');
    const work = clusterTone('work');
    expect(writing.card).not.toBe(work.card);
    expect(writing.label).toBe('#9a7344');
    expect(work.label).toBe('#4a68a8');
    expect(writing.terrain.ink).toContain('154');
    expect(work.terrain.ink).toContain('104');
  });
});