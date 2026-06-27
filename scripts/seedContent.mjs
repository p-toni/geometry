import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Prototype pool from toni.ltd - v2 single-spine.dc.html */
const nodes = {
  'allowed-ignorance': {
    cluster: 'writing',
    kind: 'essay',
    date: 'today',
    rank: 0,
    title: 'allowed ignorance',
    excerpt: [
      'What do you let yourself stop knowing once a model holds the detail for you?',
      'The skill stops being recall and becomes judgment — choosing what is safe to forget.',
    ],
    links: [
      ['increasing-returns', 'cites'],
      ['geometry-retrieval', 'theme'],
      ['weak-geometry', 'leads to'],
    ],
    struct: {
      lens: 'understanding after the right omissions',
      sections: [
        { label: 'Preamble', concepts: ['detail', 'the model holds it'] },
        { label: 'Thesis', concepts: ['allowed cuts', 'omission'] },
        { label: 'Turn', concepts: ['recall → judgment'] },
        { label: 'Closing', concepts: ['what is safe to forget'] },
      ],
    },
    body: `Bounded Me gave the pressure; Geometry Over Retrieval gave the test; Weak Geometry gave the warning. This piece keeps the same arc, but looks at it from the side. Maps are not made only of sentences. They are also made of cuts.

> [thesis|thesis]
> A usable map is not the whole object made smaller. It is the object after material has been removed.

## Block

The world does not arrive at the resolution I can keep. Before I ever say I understand, something harsher has already happened: I have removed material. Not because I am certain — because I am bounded.

A cut is not merely omission. It is equivalence-making — it declares that several visible differences can now be treated as one usable thing. That is the primitive act underneath compression.

## Face

After the first cut I usually have a face: a visible side, a stable angle. From inside, a face and a form feel almost the same. The difference only shows up when I move — and I may not move for a long time.

> [aside|aside]
> A clean explanation can just be a well-lit face. A framework can feel complete because it hides the seam from where I happen to be standing.

## Rotation

What I wanted from geometry was never elegance. I wanted something that survives rotation. I do not understand a thing when I can repeat the same face — I understand it when I can turn it and keep contact.

## Crack

<!-- block:motif -->

Failure often looks less like chaos than like the return of a difference I stopped paying for. That is why the dangerous map is not always the loose one. It is often the elegant one — the one that failed late.

> [thesis|closing]
> Understanding is a disciplined right to leave things out.`,
  },
  'increasing-returns': {
    cluster: 'writing',
    kind: 'essay',
    date: '3 days',
    rank: 1,
    title: 'increasing returns',
    excerpt: [
      'Compounding beats intensity. The systems that get cheaper the more you use them win slowly, then all at once.',
      'Most of building is staying in the game until the curve bends.',
    ],
    links: [
      ['allowed-ignorance', 'cites'],
      ['tools-need-edges', 'theme'],
      ['ilya', 'cites'],
    ],
  },
  'tools-need-edges': {
    cluster: 'writing',
    kind: 'essay',
    date: '1 week',
    rank: 3,
    title: 'tools need edges',
    excerpt: [
      'A tool without edges is a toy. Constraints are what make a thing graspable.',
      'Edges are also what make tools composable — you can only stack what has a shape.',
    ],
    links: [
      ['increasing-returns', 'theme'],
      ['ilya', 'echoes'],
    ],
  },
  'geometry-retrieval': {
    cluster: 'writing',
    kind: 'essay',
    date: '2 weeks',
    rank: 5,
    title: 'geometry > retrieval',
    excerpt: [
      'Spatial structure beats search for thinking. You navigate a shape; you query a pile.',
      'Once knowledge has a geometry, recall becomes movement instead of lookup.',
    ],
    links: [
      ['allowed-ignorance', 'theme'],
      ['weak-geometry', 'pairs'],
      ['the-loom', 'leads to'],
    ],
    struct: {
      lens: 'why structure is prior to information',
      sections: [
        { label: 'Preamble', concepts: ['fluency', 'recall'] },
        { label: 'Thesis', concepts: ['structure', 'prior'] },
        { label: 'I · fluency ≠ understanding', concepts: ['lookup', 'the pile'] },
        { label: 'II · points vs edges', concepts: ['relations', 'shape'] },
        { label: 'III · curvature', concepts: ['curvature', 'distance'] },
        { label: 'IV · what geometry feels like', concepts: ['movement', 'navigate'] },
        { label: 'Closing', concepts: ['geometry'] },
      ],
    },
    body: `Bounded Me defined the goal — memory as geometry, not storage. Me + AI defined the guardrails. This piece defines the test: what geometry is, how to detect it, and how to build it without confusing fluency for understanding.

> [thesis|the standard]
> If I can rebuild the structure of an idea with the source closed, I have geometry. If I can only recall what I read, I have retrieval.

## Fluency is not understanding

There is a failure mode that matters more now than it did pre-LLM: I feel like I understand something until I try to explain its mechanism. Rozenblit & Keil named this the illusion of explanatory depth — confidence collapses when you attempt a detailed explanation.

LLMs amplify it. They generate mechanism-shaped language with high fluency on demand. The danger is not only error; it is accurate prose I do not own.

## Points versus edges

A fact by itself is a point: isolated, repeatable, inert. Two points are still not a structure — proximity is not relationship. Understanding begins when I can draw an edge and defend it.

Cache misses increased database load, which increased tail latency; the hit-rate drop is upstream of the spike. Edges unlock navigational powers — predict, debug, teach.

## The missing dimension: curvature

Curvature is structured wrongness — the pattern of failure that tells me my map's global shape is wrong, even if local edges look fine. In a coupled system, clarity can increase drift if it displaces reconstruction.

> [honesty|honesty clause]
> I use "curvature" as a cognitive concept, not a claim of equivalence between mathematical and mental objects. The point is navigational power, not category purity.

## The tests

These are the checks I run when I suspect I am holding borrowed coherence. They work because they force reconstruction, not recognition.

<!-- block:table -->

## How to build geometry

<!-- block:steps -->

> [thesis|standard going forward]
> Use models to expand the search space. Use reconstruction to build the map.

> [update|update · 2026-04-12]
> Allowed Ignorance sharpens the "source closed" test: understanding is reconstruction after faithful collapse of variation.`,
  },
  'weak-geometry': {
    cluster: 'writing',
    kind: 'essay',
    date: '1 month',
    rank: 8,
    title: 'weak geometry',
    excerpt: [
      'Loose structure that still holds. Enough grid to align to, enough slack to stay playful.',
      'Strong geometry is a cage. Weak geometry is a trellis.',
    ],
    links: [
      ['allowed-ignorance', 'leads to'],
      ['geometry-retrieval', 'pairs'],
    ],
    struct: {
      lens: 'structure loose enough to stay playful',
      sections: [
        { label: 'Preamble', concepts: ['the grid', 'the cage'] },
        { label: 'Thesis', concepts: ['weak geometry', 'a trellis'] },
        { label: 'Turn', concepts: ['align', 'slack'] },
        { label: 'Closing', concepts: ['hold without trapping'] },
      ],
    },
    body: `Loose structure that still holds. Enough grid to align to, enough slack to stay playful. A map can be owned and still harden too early.

> [thesis|the figure]
> Strong geometry is a cage. Weak geometry is a trellis.

## The discipline

Leave some seams visible. Leave some cuts provisional. Do not merge faster than reality has licensed. Not because I want vagueness — because I want contact.

> [aside|pairs with]
> Allowed Ignorance: be careful what you allow yourself to treat as the same. The deeper warning was never just "stay humble."`,
  },
  ilya: {
    cluster: 'writing',
    kind: 'note',
    date: '1 month',
    rank: 9,
    title: 'ilya',
    excerpt: ['Notes after listening. Scale is a position you take, not a result you wait for.'],
    links: [
      ['increasing-returns', 'cites'],
      ['tools-need-edges', 'echoes'],
    ],
  },
  'co-owning-the-loop': {
    cluster: 'writing',
    kind: 'essay',
    date: '2 weeks',
    rank: 6,
    title: 'co-owning the loop',
    excerpt: [
      'When you and the model both hold the pen, who owns the draft?',
      'Co-authorship needs new manners — and a way to see who changed what.',
    ],
    links: [
      ['allowed-ignorance', 'theme'],
      ['me-plus-ai', 'leads to'],
    ],
  },
  'me-plus-ai': {
    cluster: 'writing',
    kind: 'note',
    date: '3 weeks',
    rank: 7,
    title: 'me + ai',
    excerpt: [
      'A working theory of the augmented self: where I end and the assistant begins.',
      'The boundary moves daily. Mapping it is most of the work.',
    ],
    links: [
      ['co-owning-the-loop', 'cites'],
      ['bounded-me', 'leads to'],
    ],
  },
  'bounded-me': {
    cluster: 'writing',
    kind: 'note',
    date: '6 weeks',
    rank: 10,
    title: 'bounded me',
    excerpt: [
      'There is a version of me that fits in a context window.',
      "Smaller than I'd like; sharper than I expect.",
    ],
    links: [['me-plus-ai', 'cites']],
  },
  geometry: {
    cluster: 'work',
    kind: 'project',
    date: 'today',
    rank: 0,
    title: 'geometry',
    excerpt: [
      'A grid-aligned canvas for loose thoughts — this very site.',
      'Now being rethought: one living field instead of a static grid.',
    ],
    links: [
      ['the-loom', 'contains'],
      ['geometry-retrieval', 'idea'],
      ['spec-v1', 'specced in'],
    ],
  },
  'the-loom': {
    cluster: 'work',
    kind: 'project',
    date: '5 days',
    rank: 2,
    title: 'the loom',
    excerpt: [
      'A layout engine that tends itself. Blocks carry weight and freshness; the page re-weaves on every visit.',
      'You stop placing things and start gardening them.',
    ],
    links: [
      ['geometry', 'part of'],
      ['geometry-retrieval', 'idea'],
      ['xcom', 'shipped on'],
    ],
  },
  'spec-v1': {
    cluster: 'work',
    kind: 'doc',
    date: '1 week',
    rank: 4,
    title: 'spec v1',
    excerpt: [
      'The v1 Geometry spec: 100vh canvases of draggable, grid-aligned blocks.',
      'Canvases live as JSON, bundled at build time, editable locally.',
    ],
    links: [['geometry', 'specs']],
  },
  sea: {
    cluster: 'play',
    kind: 'shader',
    date: '2 weeks',
    rank: 6,
    title: 'sea',
    media: true,
    excerpt: [],
    links: [['lock-in', 'sibling']],
  },
  'lock-in': {
    cluster: 'play',
    kind: 'voxel',
    date: '1 month',
    rank: 9,
    title: 'lock in',
    media: true,
    excerpt: [],
    links: [
      ['sea', 'sibling'],
      ['point-cloud', 'sibling'],
    ],
  },
  'point-cloud': {
    cluster: 'play',
    kind: 'sharp',
    date: '1 month',
    rank: 9,
    title: 'point cloud',
    media: true,
    excerpt: [],
    links: [['lock-in', 'sibling']],
  },
  xcom: {
    cluster: 'play',
    kind: 'link',
    date: 'live',
    rank: 1,
    title: 'x.com',
    href: 'https://x.com/ape_toni',
    excerpt: ['The running feed — half-built things, in public.'],
    links: [['the-loom', 'shipped on']],
  },
  about: {
    cluster: 'you',
    kind: 'about',
    date: '—',
    rank: 4,
    title: 'about',
    excerpt: [
      'Builds small tools with edges. Writes to think.',
      'Lived on a warm grid; now moving to a cooler, single-field one.',
    ],
    links: [
      ['geometry', 'made'],
      ['xcom', 'find me'],
    ],
  },
};

for (const [id, n] of Object.entries(nodes)) {
  const dir = join(root, 'content', n.cluster);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, `${id}.md`);

  const linksYaml = (n.links ?? [])
    .map(([target, rel]) => `  - target: ${target}\n    rel: ${rel}`)
    .join('\n');

  const structYaml = n.struct
    ? `struct:\n  lens: "${n.struct.lens}"\n  sections:\n${n.struct.sections
        .map(
          (s) =>
            `    - label: "${s.label}"\n      concepts: [${s.concepts.map((c) => `"${c}"`).join(', ')}]`,
        )
        .join('\n')}\n`
    : '';

  const excerptYaml = (n.excerpt ?? []).length
    ? `excerpt:\n${n.excerpt.map((p) => `  - "${p.replace(/"/g, '\\"')}"`).join('\n')}\n`
    : '';

  const yaml = `---
id: ${id}
kind: ${n.kind}
cluster: ${n.cluster}
title: ${n.title}
date: ${n.date}
rank: ${n.rank}
${n.href ? `href: ${n.href}\n` : ''}${n.media ? 'media: true\n' : ''}${excerptYaml}links:
${linksYaml}
${structYaml}---

${n.body ?? ''}
`;

  writeFileSync(out, yaml);
  console.log('wrote', out);
}