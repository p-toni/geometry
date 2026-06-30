import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import manifest from '../constellation/generated/manifest.json';
import { splitInlineBacklinks } from '../src/lib/inlineBacklink.ts';
import { excerptFromBlocks, parseBlocks } from '../src/lib/parseBlocks.ts';
import { sectionHeadingsFromBody } from '../src/lib/sectionHeadings.ts';
import { layout, positions } from '../src/pool/field.ts';
import type { Block, Cluster, EssayStruct, Link, NodeKind, PoolNode, Rel } from '../src/pool/types.ts';

const MANIFEST_POOL_ID_ALIASES: Record<string, string> = {
  'geometry-over-retrieval': 'geometry-retrieval',
};

const CONSTELLATION_ESSAY_IDS = new Set(
  manifest.graphs
    .filter((g) => g.kind === 'essay')
    .map((g) => {
      const id = g.id.replace(/^\d+-/, '');
      return MANIFEST_POOL_ID_ALIASES[id] ?? id;
    }),
);

const VALID_RELS = new Set<string>([
  'cites', 'theme', 'leads to', 'pairs', 'part of', 'sibling', 'echoes', 'idea',
  'contains', 'shipped on', 'made', 'find me', 'specs', 'specced in',
]);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');

type Frontmatter = {
  id: string;
  kind: NodeKind;
  cluster: Cluster;
  title: string;
  date: string;
  rank: number;
  weight?: number;
  links?: { target: string; rel: Rel }[];
  excerpt?: string[];
  href?: string;
  media?: boolean;
  struct?: EssayStruct;
};

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  if (!raw.startsWith('---\n')) throw new Error('Missing frontmatter');
  const end = raw.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('Unclosed frontmatter');
  const yaml = raw.slice(4, end);
  const body = raw.slice(end + 5);
  const meta: Record<string, unknown> = {};
  let currentKey = '';
  let listKey = '';
  const links: { target: string; rel: string }[] = [];
  let struct: EssayStruct | undefined;
  let structMode: 'none' | 'sections' | 'section' = 'none';
  let currentSection: { label: string; concepts: string[] } | undefined;

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed === 'struct:') {
      struct = { lens: '', sections: [] };
      structMode = 'none';
      listKey = '';
      continue;
    }
    if (struct) {
      if (trimmed.startsWith('lens:')) {
        struct.lens = trimmed
          .slice(5)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        continue;
      }
      if (trimmed === 'sections:') {
        structMode = 'sections';
        continue;
      }
      if (
        (structMode === 'sections' || structMode === 'section') &&
        trimmed.startsWith('- label:')
      ) {
        currentSection = {
          label: trimmed
            .slice(8)
            .trim()
            .replace(/^['"]|['"]$/g, ''),
          concepts: [],
        };
        struct.sections.push(currentSection);
        structMode = 'section';
        continue;
      }
      if (structMode === 'section' && trimmed.startsWith('concepts:')) {
        const val = trimmed.slice(9).trim();
        if (val.startsWith('[') && currentSection) {
          currentSection.concepts = val
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        }
        continue;
      }
    }

    if (trimmed.startsWith('- target:')) {
      const target = trimmed.replace('- target:', '').trim();
      listKey = 'link-pending';
      links.push({ target, rel: '' });
      continue;
    }
    if (listKey === 'link-pending' && trimmed.startsWith('rel:')) {
      links[links.length - 1]!.rel = trimmed.replace('rel:', '').trim();
      continue;
    }
    if (listKey === 'excerpt' && trimmed.startsWith('- ')) {
      if (!meta.excerpt) meta.excerpt = [];
      (meta.excerpt as string[]).push(
        trimmed.slice(2).trim().replace(/^['"]|['"]$/g, ''),
      );
      continue;
    }

    const m = trimmed.match(/^([\w-]+):\s*(.*)$/);
    if (m) {
      currentKey = m[1]!;
      const val = m[2]!.trim();
      if (currentKey === 'links') {
        listKey = 'links';
        continue;
      }
      listKey = '';
      if (currentKey === 'excerpt') {
        listKey = 'excerpt';
        if (!meta.excerpt) meta.excerpt = [];
        continue;
      }
      if (val.startsWith('[') && val.endsWith(']')) {
        meta[currentKey] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      } else if (val === 'true' || val === 'false') {
        meta[currentKey] = val === 'true';
      } else if (/^\d+(\.\d+)?$/.test(val)) {
        meta[currentKey] = Number(val);
      } else {
        meta[currentKey] = val.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  if (links.length) meta.links = links;
  if (struct?.sections.length) meta.struct = struct;

  return { meta: meta as unknown as Frontmatter, body };
}

function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkMd(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const nodes: Record<string, PoolNode> = {};

function textFields(block: Block): string[] {
  switch (block.t) {
    case 'p':
    case 'thesis':
    case 'pull':
      return [block.x];
    case 'callout':
      return [block.x, block.label ?? ''];
    case 'sidenote':
      return [block.anchor, block.x, block.body ?? ''];
    case 'plate':
      return [block.cap];
    case 'ladder':
      return block.rungs.flatMap((rung) => [rung.term, rung.body, rung.tag ?? '']);
    case 'contrast':
      return [
        ...block.poles,
        block.axisLabel ?? '',
        ...block.rows.flatMap((row) => [row.label ?? '', row.a, row.b]),
      ];
    case 'table':
      return [...block.headers, ...block.rows.flat()];
    case 'edge-taxonomy':
      return block.rows.flatMap((row) => [row.type, row.force]);
    case 'diagram':
      return [
        ...block.nodes,
        block.expr ?? '',
        block.lead ?? '',
        block.follow ?? '',
        ...Object.values(block.terms ?? {}),
      ];
    case 'citation':
      return [
        block.sourceId,
        block.source.author,
        block.source.title,
        block.source.url ?? '',
        block.anchor ?? '',
      ];
    case 'sources-ledger':
      return block.items.flatMap((item) => [
        item.sourceId,
        item.source.author,
        item.source.title,
        item.source.url ?? '',
        item.anchor ?? '',
      ]);
    case 'backlink':
      return [block.targetId, block.rel, block.title];
    case 'h':
    case 'motif':
    case 'point-edge':
    case 'curvature':
      return block.t === 'h' ? [block.x] : [];
    case 'steps':
      return block.items;
  }
}

for (const file of walkMd(contentDir)) {
  const raw = readFileSync(file, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const blocks = parseBlocks(body);
  const pos = positions[meta.id];
  if (!pos) {
    console.warn(`skip ${meta.id}: no hand-placed pos in field.ts`);
    continue;
  }

  const links: Link[] = [];
  for (const l of meta.links ?? []) {
    if (!positions[l.target]) {
      console.warn(`skip link ${meta.id} → ${l.target}: unknown target`);
      continue;
    }
    if (!VALID_RELS.has(l.rel)) {
      console.warn(`skip link ${meta.id} → ${l.target}: invalid rel "${l.rel}"`);
      continue;
    }
    links.push([l.target, l.rel as Rel]);
  }

  nodes[meta.id] = {
    id: meta.id,
    kind: meta.kind,
    cluster: meta.cluster,
    title: meta.title,
    date: meta.date,
    rank: meta.rank,
    weight: meta.weight ?? 1 - meta.rank * 0.05,
    links,
    excerpt: meta.excerpt?.length ? meta.excerpt : excerptFromBlocks(blocks),
    body: blocks,
    struct: meta.struct,
    href: meta.href,
    media: meta.media,
    sourcePath: `/${relative(root, file).replace(/\\/g, '/')}`,
  };
}

const sectionSpineErrors: string[] = [];
for (const node of Object.values(nodes)) {
  if (node.cluster !== 'writing' || node.kind !== 'essay') continue;
  if (!CONSTELLATION_ESSAY_IDS.has(node.id)) continue;
  if (!sectionHeadingsFromBody(node.body).length) {
    sectionSpineErrors.push(
      `${node.id}: missing ## or ### section headings (required for constellation descent)`,
    );
  }
}

const inlineBacklinkErrors: string[] = [];
for (const node of Object.values(nodes)) {
  for (const block of node.body) {
    if (block.t === 'backlink') {
      if (!nodes[block.targetId]) {
        inlineBacklinkErrors.push(
          `${node.id}: unknown backlink target "${block.targetId}" in ${node.sourcePath}`,
        );
      }
      if (!VALID_RELS.has(block.rel)) {
        inlineBacklinkErrors.push(
          `${node.id}: invalid backlink rel "${block.rel}" for "${block.targetId}" in ${node.sourcePath}`,
        );
      }
    }
    for (const text of textFields(block)) {
      if (!text.includes('[[')) continue;
      for (const part of splitInlineBacklinks(text)) {
        if (part.kind !== 'backlink') continue;
        if (!nodes[part.targetId]) {
          inlineBacklinkErrors.push(
            `${node.id}: unknown inline backlink target "${part.targetId}" in ${node.sourcePath}`,
          );
        }
        if (!VALID_RELS.has(part.rel)) {
          inlineBacklinkErrors.push(
            `${node.id}: invalid inline backlink rel "${part.rel}" for "${part.targetId}" in ${node.sourcePath}`,
          );
        }
      }
    }
  }
}

if (inlineBacklinkErrors.length) {
  for (const msg of inlineBacklinkErrors) console.error(`error [inline-backlink] ${msg}`);
  throw new Error(`pool:build: ${inlineBacklinkErrors.length} inline backlink error(s)`);
}

if (sectionSpineErrors.length) {
  for (const msg of sectionSpineErrors) console.error(`error [section-spine] ${msg}`);
  throw new Error(`pool:build: ${sectionSpineErrors.length} constellation essay(s) lack a section spine`);
}

const pool = { nodes, layout };
const outJson = join(root, 'public/pool.json');
const outTs = join(root, 'src/pool/generated.ts');

writeFileSync(outJson, JSON.stringify(pool, null, 2));
writeFileSync(
  outTs,
  `/** Generated by scripts/buildPool.ts — do not edit. */\nimport type { Pool } from './types';\n\nexport const generatedPool: Pool = ${JSON.stringify(pool, null, 2)} as Pool;\n`,
);

console.log(`pool: ${Object.keys(nodes).length} nodes → public/pool.json`);
