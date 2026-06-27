import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { excerptFromBlocks, parseBlocks } from '../src/lib/parseBlocks.ts';
import { layout, positions } from '../src/pool/field.ts';
import type { Cluster, EssayStruct, Link, NodeKind, PoolNode, Rel } from '../src/pool/types.ts';

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

const pool = { nodes, layout };
const outJson = join(root, 'public/pool.json');
const outTs = join(root, 'src/pool/generated.ts');

writeFileSync(outJson, JSON.stringify(pool, null, 2));
writeFileSync(
  outTs,
  `/** Generated by scripts/buildPool.ts — do not edit. */\nimport type { Pool } from './types';\n\nexport const generatedPool: Pool = ${JSON.stringify(pool, null, 2)} as Pool;\n`,
);

console.log(`pool: ${Object.keys(nodes).length} nodes → public/pool.json`);