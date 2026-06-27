import { describe, expect, it } from 'vitest';
import type { PoolNode } from '../pool/types';
import { nodeLayout } from './nodeLayout';

function stub(partial: Partial<PoolNode> & Pick<PoolNode, 'kind' | 'rank'>): PoolNode {
  return {
    id: 'x',
    cluster: 'writing',
    title: 'test',
    date: 'today',
    weight: 1,
    links: [],
    excerpt: [],
    body: [],
    sourcePath: '/content/writing/x.md',
    ...partial,
  };
}

describe('nodeLayout', () => {
  it('sizes essays larger than notes', () => {
    const essay = nodeLayout(stub({ kind: 'essay', rank: 0 }));
    const note = nodeLayout(stub({ kind: 'note', rank: 0 }));
    expect(essay.minWidth).toBeGreaterThan(note.minWidth);
    expect(essay.titleSize).toBeGreaterThan(note.titleSize);
  });

  it('grows featured rank-0 essays vs rank-8', () => {
    const fresh = nodeLayout(stub({ kind: 'essay', rank: 0 }));
    const older = nodeLayout(stub({ kind: 'essay', rank: 8 }));
    expect(fresh.maxWidth).toBeGreaterThan(older.maxWidth);
  });

  it('renders links as horizontal pills', () => {
    const link = nodeLayout(stub({ kind: 'link', rank: 1 }));
    expect(link.variant).toBe('pill');
    expect(link.borderRadius).toBe(999);
    expect(link.minWidth).toBe(0);
  });
});