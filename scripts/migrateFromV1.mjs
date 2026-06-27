/**
 * One-time migration: geometry v1 MDX → geometry-v2 content/*.md
 * Run: node scripts/migrateFromV1.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const v1Root = join(dirname(root), 'geometry');

const MDX_MAP = {
  'tools-need-edges': '01-tools-need-edges.mdx',
  'increasing-returns': '02-increasing-returns.mdx',
  ilya: '03-ilya.mdx',
  'co-owning-the-loop': '04-co-owning-the-loop.mdx',
  'bounded-me': '05-bounded-me.mdx',
  'me-plus-ai': '06-me-plus-ai.mdx',
  'geometry-retrieval': '07-geometry-over-retrieval.mdx',
  'weak-geometry': '08-weak-geometry.mdx',
  'allowed-ignorance': '09-allowed-ignorance.mdx',
};

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
    useSeedBody: true,
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
    useSeedBody: true,
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
    useSeedBody: true,
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
    struct: {
      lens: 'compounding inside an ecology',
      sections: [
        { label: 'Preamble', concepts: ['ecology', 'network'] },
        { label: 'Thesis', concepts: ['compounding', 'feedback'] },
        { label: 'Turn', concepts: ['peripheral', 'weak ties'] },
        { label: 'Closing', concepts: ['stay in the game'] },
      ],
    },
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
    struct: {
      lens: 'agency inside abundance',
      sections: [
        { label: 'Preamble', concepts: ['possibility space', 'orientation'] },
        { label: 'Thesis', concepts: ['edges', 'constraints'] },
        { label: 'Turn', concepts: ['AI', 'generative'] },
        { label: 'Closing', concepts: ['holdable', 'humans'] },
      ],
    },
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
    struct: {
      lens: 'intelligence is not the only virtue',
      sections: [
        { label: 'Preamble', concepts: ['listening', 'scale'] },
        { label: 'Thesis', concepts: ['intelligence', 'human qualities'] },
      ],
    },
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
    struct: {
      lens: 'repos that advocate for themselves',
      sections: [
        { label: 'Preamble', concepts: ['pairing', 'responsibility'] },
        { label: 'Thesis', concepts: ['co-ownership', 'hooks'] },
        { label: 'Turn', concepts: ['culture', 'trust'] },
        { label: 'Closing', concepts: ['repeatability', 'empathy'] },
      ],
    },
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
    struct: {
      lens: 'a safety manual for the coupled loop',
      sections: [
        { label: 'Preamble', concepts: ['coupling', 'velocity'] },
        { label: 'Thesis', concepts: ['feedback control', 'exchange'] },
        { label: 'Turn', concepts: ['verification', 'drift'] },
        { label: 'Closing', concepts: ['geometry', 'stabilizer'] },
      ],
    },
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
    struct: {
      lens: 'extractable structure under constraints',
      sections: [
        { label: 'Bounded me', concepts: ['constraints', 'extract'] },
        { label: 'Memory as geometry', concepts: ['shape', 'movement'] },
        { label: 'Fractal edge', concepts: ['convergent', 'divergent'] },
        { label: 'Flow through the loop', concepts: ['leakage', 'transitions'] },
        { label: 'Private metric', concepts: ['structure', 're-entry'] },
        { label: 'Thesis', concepts: ['bounded learner', 'geometry'] },
      ],
    },
  },
  geometry: {
    cluster: 'work',
    kind: 'project',
    date: 'today',
    rank: 0,
    title: 'geometry',
    excerpt: [
      'A single living field for loose thoughts — toni.ltd v2.',
      'Hand-placed nodes, typed essay blocks, constellation descent.',
    ],
    links: [
      ['the-loom', 'contains'],
      ['geometry-retrieval', 'idea'],
      ['spec-v1', 'specced in'],
    ],
    body: `This is the site you are on: a cooler, single-field geometry instead of the warm grid canvas.

Hand-placed nodes carry weight and freshness. Essays compile from markdown with typed blocks that map to twelve figures. Reading moves from excerpt to full essay to constellation descent.

> [thesis|the figure]
> One route, one field, one spine — the map stays put while you move through it.`,
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
    body: `The loom is the self-tending layout idea behind this field: blocks with weight, freshness, and neighborhood instead of a fixed grid.

> [aside|idea]
> Geometry v2 borrows the loom's gardening instinct — nodes stay placed, but lenses and reading modes re-weight what glows.

Each visit can re-weave emphasis without erasing the underlying shape.`,
  },
  'spec-v1': {
    cluster: 'work',
    kind: 'doc',
    date: '1 week',
    rank: 4,
    title: 'spec v1',
    excerpt: [
      'The retired v1 Geometry spec: 100vh canvases of draggable, grid-aligned blocks.',
      'Canvases lived as JSON, bundled at build time, editable locally.',
    ],
    links: [['geometry', 'specs']],
    body: `v1 Geometry was a warm grid: draggable blocks on 100vh canvases, JSON-authored at build time, MDX widgets in the read path.

v2 replaces that stack with a single field route, markdown + YAML frontmatter, and typed Block[] figures. This doc remains as historical reference for the grid era.`,
  },
  sea: {
    cluster: 'play',
    kind: 'shader',
    date: '2 weeks',
    rank: 6,
    title: 'sea',
    media: true,
    excerpt: ['A sequin-wave shader study — motion without narrative.'],
    links: [['lock-in', 'sibling']],
    body: `Shader sketch: slow horizontal interference, like light on water. Drop a WebGL capture into the media slot when ready.`,
  },
  'lock-in': {
    cluster: 'play',
    kind: 'voxel',
    date: '1 month',
    rank: 9,
    title: 'lock in',
    media: true,
    excerpt: ['Voxel study — constraint as composition.'],
    links: [
      ['sea', 'sibling'],
      ['point-cloud', 'sibling'],
    ],
    body: `Voxel block built under tight grid rules. The render placeholder marks where the capture lands.`,
  },
  'point-cloud': {
    cluster: 'play',
    kind: 'sharp',
    date: '1 month',
    rank: 9,
    title: 'point cloud',
    media: true,
    excerpt: ['Three.js point set — depth without mesh.'],
    links: [['lock-in', 'sibling']],
    body: `Point-cloud sharp preset: sparse depth, no surface. Media slot awaits the export.`,
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
      'Now on a cooler, single-field geometry — v2 is the site.',
    ],
    links: [
      ['geometry', 'made'],
      ['xcom', 'find me'],
    ],
    body: `Builds small tools with edges. Writes to think.

This field is the current shape of toni.ltd: one spine, hand-placed nodes, essays as typed blocks, lenses that light neighborhoods without leaving the map.

> [aside|find me]
> The feed stays on x.com; the long thinking lives here.`,
  },
};

const SEED_BODIES = {
  'allowed-ignorance': `Bounded Me gave the pressure; Geometry Over Retrieval gave the test; Weak Geometry gave the warning. This piece keeps the same arc, but looks at it from the side. Maps are not made only of sentences. They are also made of cuts.

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
  'geometry-retrieval': `Bounded Me defined the goal — memory as geometry, not storage. Me + AI defined the guardrails. This piece defines the test: what geometry is, how to detect it, and how to build it without confusing fluency for understanding.

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
  'weak-geometry': `Loose structure that still holds. Enough grid to align to, enough slack to stay playful. A map can be owned and still harden too early.

> [thesis|the figure]
> Strong geometry is a cage. Weak geometry is a trellis.

## The discipline

Leave some seams visible. Leave some cuts provisional. Do not merge faster than reality has licensed. Not because I want vagueness — because I want contact.

> [aside|pairs with]
> Allowed Ignorance: be careful what you allow yourself to treat as the same. The deeper warning was never just "stay humble."`,
};

function mdxToBody(raw) {
  let text = raw.replace(/export const meta =[\s\S]*?;\s*/m, '');
  text = text.replace(/^#\s+.+\n+/m, '');
  text = text.replace(/^###\s+/gm, '## ');
  text = text.replace(/\r\n/g, '\n');

  const out = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const joined = quote.join('\n').trim();
      if (/^\*\*Update \([^)]+\):\*\*/.test(joined)) {
        const m = joined.match(/^\*\*Update \(([^)]+)\):\*\*\s*(.*)$/s);
        out.push(`> [update|update · ${m[1]}]`);
        out.push(`> ${m[2].trim()}`);
      } else if (quote.length === 1 && !quote[0].includes('\n') && quote[0].length < 80 && !quote[0].startsWith('"')) {
        out.push(`> [aside|${quote[0]}]`);
        out.push('>');
      } else if (quote[0]?.startsWith('**') || joined.length < 220) {
        out.push(`> ${joined.replace(/\n/g, ' ')}`);
      } else {
        out.push(`> ${joined.replace(/\n/g, ' ')}`);
      }
      out.push('');
      continue;
    }

    if (trimmed.startsWith('## ')) {
      out.push(trimmed);
      out.push('');
      i++;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        out.push(lines[i].trim().slice(2));
        out.push('');
        i++;
      }
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        out.push(lines[i].trim());
        i++;
      }
      out.push('');
      continue;
    }

    if (trimmed === '---') {
      out.push('');
      i++;
      continue;
    }

    let para = trimmed;
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (!next || next.startsWith('>') || next.startsWith('##') || next.startsWith('- ') || /^\d+\.\s/.test(next) || next === '---') break;
      para += ` ${next}`;
      i++;
    }
    para = para
      .replace(/\[([^\]]+)\]\(\/content\/writing\/([^)]+)\.md\)/g, '[[backlink:$1|cites|$2]]')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1 ($2)');
    out.push(para);
    out.push('');
  }

  return out.join('\n').trim();
}

function yamlEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function writeNode(id, n, body) {
  const dir = join(root, 'content', n.cluster);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, `${id}.md`);

  const linksYaml = (n.links ?? [])
    .map(([target, rel]) => `  - target: ${target}\n    rel: ${rel}`)
    .join('\n');

  const structYaml = n.struct
    ? `struct:\n  lens: "${yamlEscape(n.struct.lens)}"\n  sections:\n${n.struct.sections
        .map(
          (s) =>
            `    - label: "${yamlEscape(s.label)}"\n      concepts: [${s.concepts.map((c) => `"${yamlEscape(c)}"`).join(', ')}]`,
        )
        .join('\n')}\n`
    : '';

  const excerptYaml = (n.excerpt ?? []).length
    ? `excerpt:\n${n.excerpt.map((p) => `  - "${yamlEscape(p)}"`).join('\n')}\n`
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

${body}
`;

  writeFileSync(out, yaml);
  console.log('wrote', out);
}

for (const [id, n] of Object.entries(nodes)) {
  let body = n.body ?? '';

  if (n.useSeedBody && SEED_BODIES[id]) {
    body = SEED_BODIES[id];
  } else if (MDX_MAP[id]) {
    const mdxPath = join(v1Root, 'src/content/essays', MDX_MAP[id]);
    const existing = join(root, 'content', n.cluster, `${id}.md`);
    if (existsSync(mdxPath)) {
      body = mdxToBody(readFileSync(mdxPath, 'utf8'));
    } else if (existsSync(existing)) {
      const raw = readFileSync(existing, 'utf8');
      const end = raw.indexOf('\n---\n', 4);
      body = end >= 0 ? raw.slice(end + 5).trim() : '';
      console.warn('v1 mdx gone — kept existing body for', id);
    } else {
      console.warn('missing mdx', mdxPath);
    }
  }

  writeNode(id, n, body);
}

console.log('migration complete');