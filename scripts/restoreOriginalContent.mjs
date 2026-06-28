/**
 * Restore writing from public/content/*.md (GitHub originals) into content/{cluster}/{id}.md.
 * Preserves prose — no widget tagging, no argument-grammar rewrite.
 *
 * Run: node scripts/restoreOriginalContent.mjs && pnpm pool:build
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'public/content');

const FILE_MAP = {
  '01-tools-need-edges.md': 'tools-need-edges',
  '02-increasing-returns.md': 'increasing-returns',
  '03-ilya.md': 'ilya',
  '04-co-owning-the-loop.md': 'co-owning-the-loop',
  '05-bounded-me.md': 'bounded-me',
  '06-me-plus-ai.md': 'me-plus-ai',
  '07-geometry-over-retrieval.md': 'geometry-retrieval',
  '08-weak-geometry.md': 'weak-geometry',
  '09-allowed-ignorance.md': 'allowed-ignorance',
  'about.md': 'about',
};

const NODES = {
  'tools-need-edges': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-01-04',
    rank: 3,
    title: 'tools need edges',
    links: [
      ['increasing-returns', 'theme'],
      ['ilya', 'echoes'],
    ],
  },
  'increasing-returns': {
    cluster: 'writing',
    kind: 'note',
    date: '2026-01-08',
    rank: 1,
    title: 'increasing returns',
    links: [
      ['allowed-ignorance', 'cites'],
      ['tools-need-edges', 'theme'],
      ['ilya', 'cites'],
    ],
  },
  ilya: {
    cluster: 'writing',
    kind: 'note',
    date: '2026-01-05',
    rank: 9,
    title: 'ilya',
    links: [
      ['increasing-returns', 'cites'],
      ['tools-need-edges', 'echoes'],
    ],
  },
  'co-owning-the-loop': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-01-15',
    rank: 6,
    title: 'co-owning the loop',
    links: [
      ['allowed-ignorance', 'theme'],
      ['me-plus-ai', 'leads to'],
    ],
  },
  'bounded-me': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-01-11',
    rank: 10,
    title: 'bounded me',
    links: [['me-plus-ai', 'cites']],
  },
  'me-plus-ai': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-01-18',
    rank: 7,
    title: 'me + ai',
    links: [
      ['co-owning-the-loop', 'cites'],
      ['bounded-me', 'leads to'],
    ],
  },
  'geometry-retrieval': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-02-14',
    rank: 5,
    title: 'geometry > retrieval',
    links: [
      ['allowed-ignorance', 'theme'],
      ['weak-geometry', 'pairs'],
      ['the-loom', 'leads to'],
    ],
  },
  'weak-geometry': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-03-01',
    rank: 8,
    title: 'weak geometry',
    links: [
      ['allowed-ignorance', 'leads to'],
      ['geometry-retrieval', 'pairs'],
    ],
  },
  'allowed-ignorance': {
    cluster: 'writing',
    kind: 'essay',
    date: '2026-04-11',
    rank: 0,
    title: 'allowed ignorance',
    links: [
      ['increasing-returns', 'cites'],
      ['geometry-retrieval', 'theme'],
      ['weak-geometry', 'leads to'],
    ],
  },
  about: {
    cluster: 'you',
    kind: 'about',
    date: '2026-01-01',
    rank: 4,
    title: 'about',
    links: [
      ['geometry', 'made'],
      ['xcom', 'find me'],
    ],
  },
};

function yamlEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function slugFromContentPath(href) {
  const m = href.match(/\/content\/(?:\d{2}-)?([^)]+)\.md/);
  return m?.[1] ?? null;
}

function convertLinks(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, href) => {
    const id = slugFromContentPath(href);
    if (id) return `[[${label}|${id}]]`;
    return full;
  });
}

function stripTitleBlock(raw) {
  let text = raw.replace(/\r\n/g, '\n').trim();
  const lines = text.split('\n');
  let i = 0;

  let title = '';
  if (lines[i]?.startsWith('# ')) {
    title = lines[i].slice(2).trim();
    i++;
  }

  while (i < lines.length && !lines[i]?.trim()) i++;

  let date = '';
  let moods = [];
  const meta = lines[i]?.trim() ?? '';
  if (/^\*\d{4}/.test(meta)) {
    const dateMatch = meta.match(/\*(\d{4}\.\d{2}\.\d{2})\*/);
    date = dateMatch?.[1]?.replace(/\./g, '-') ?? '';
    const moodMatch = meta.match(/_([^_]+)_/);
    if (moodMatch) moods = moodMatch[1].split('/').map((s) => s.trim());
    i++;
  }

  while (i < lines.length && !lines[i]?.trim()) i++;

  let dek = '';
  if (lines[i]?.trim().startsWith('>')) {
    dek = lines[i].trim().replace(/^>\s?/, '').trim();
    i++;
    while (i < lines.length && !lines[i]?.trim()) i++;
  }

  // Meta line is masthead metadata — not part of the essay body.
  const body = convertLinks(lines.slice(i).join('\n').trim());
  return { title, date, moods, dek, body };
}

function extractSections(body) {
  const labels = [...body.matchAll(/^## (.+)$/gm)].map((m) =>
    m[1]
      .replace(/^(I{1,3}|IV|V|VI{0,3})\.\s*/i, '')
      .replace(/^[0-9]+\)\s*/, '')
      .trim(),
  );
  return labels.map((label) => ({ label, concepts: [] }));
}

function excerptLines(dek, body) {
  if (dek) return [dek];
  const first = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('##') && !l.startsWith('>'));
  return first ? [first.slice(0, 160)] : [];
}

function lensFromDek(dek, title) {
  if (dek) return dek.replace(/\.$/, '');
  return title.toLowerCase();
}

function writeNode(id, node, parsed) {
  const dir = join(root, 'content', node.cluster);
  mkdirSync(dir, { recursive: true });
  const sections = extractSections(parsed.body);
  const struct =
    sections.length > 0
      ? {
          lens: lensFromDek(parsed.dek, parsed.title || node.title),
          sections,
        }
      : undefined;

  const excerpt = excerptLines(parsed.dek, parsed.body);
  const linksYaml = (node.links ?? [])
    .map(([target, rel]) => `  - target: ${target}\n    rel: ${rel}`)
    .join('\n');

  const structYaml = struct
    ? `struct:\n  lens: "${yamlEscape(struct.lens)}"\n  sections:\n${struct.sections
        .map((s) => `    - label: "${yamlEscape(s.label)}"\n      concepts: []`)
        .join('\n')}\n`
    : '';

  const excerptYaml = excerpt.map((p) => `  - "${yamlEscape(p)}"`).join('\n');

  const yaml = `---
id: ${id}
kind: ${node.kind}
cluster: ${node.cluster}
title: ${node.title}
date: ${parsed.date || node.date}
rank: ${node.rank}
excerpt:
${excerptYaml}
links:
${linksYaml}
${structYaml}---

${parsed.body}
`;

  const out = join(dir, `${id}.md`);
  writeFileSync(out, yaml);
  console.log('restored', out);
}

for (const file of readdirSync(sourceDir).filter((f) => FILE_MAP[f])) {
  const id = FILE_MAP[file];
  const node = NODES[id];
  if (!node) continue;
  const raw = readFileSync(join(sourceDir, file), 'utf8');
  const parsed = stripTitleBlock(raw);
  writeNode(id, node, parsed);
}

console.log('restore complete — run pnpm pool:build');