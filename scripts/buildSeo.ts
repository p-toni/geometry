import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Pool, PoolNode } from '../src/pool/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const siteUrl = 'https://toni.ltd';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function descriptionFor(node: PoolNode): string {
  return (node.excerpt[0] ?? `A ${node.kind} from toni.ltd.`).replace(/\s+/g, ' ').trim();
}

function canonicalFor(node: PoolNode, full = false): string {
  return `${siteUrl}/read/${node.id}/${full ? 'full/' : ''}`;
}

function replaceTag(html: string, pattern: RegExp, replacement: string): string {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function withMeta(baseHtml: string, node: PoolNode, full = false): string {
  const title = `${node.title} · toni.ltd`;
  const description = descriptionFor(node);
  const canonical = canonicalFor(node, full);

  let html = baseHtml;
  html = replaceTag(html, /<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceTag(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  html = replaceTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  );
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  );
  return html;
}

function writeHtml(pathParts: string[], html: string) {
  const dir = join(distDir, ...pathParts);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

function xml(value: string): string {
  return escapeHtml(value);
}

function rfcDate(date: string, fallbackRank: number): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Date(`${date}T12:00:00Z`).toUTCString();
  const fallback = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
  fallback.setUTCDate(fallback.getUTCDate() - fallbackRank);
  return fallback.toUTCString();
}

const pool = JSON.parse(readFileSync(join(root, 'public/pool.json'), 'utf8')) as Pool;
const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
const nodes = Object.values(pool.nodes).sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));

for (const node of nodes) {
  writeHtml(['read', node.id], withMeta(baseHtml, node));
  if (node.body.length > 0 && node.kind !== 'link') {
    writeHtml(['read', node.id, 'full'], withMeta(baseHtml, node, true));
  }
}

const urls = [
  `${siteUrl}/`,
  ...nodes.flatMap((node) => [
    canonicalFor(node),
    ...(node.body.length > 0 && node.kind !== 'link' ? [canonicalFor(node, true)] : []),
  ]),
];

writeFileSync(
  join(distDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${xml(url)}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);

const feedItems = nodes
  .filter((node) => node.cluster === 'writing' && (node.kind === 'essay' || node.kind === 'note'))
  .map(
    (node) => `    <item>
      <title>${xml(node.title)}</title>
      <link>${xml(canonicalFor(node, true))}</link>
      <guid>${xml(canonicalFor(node, true))}</guid>
      <description>${xml(descriptionFor(node))}</description>
      <pubDate>${rfcDate(node.date, node.rank)}</pubDate>
    </item>`,
  )
  .join('\n');

writeFileSync(
  join(distDir, 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>toni.ltd</title>\n    <link>${siteUrl}/</link>\n    <description>One living field for writing, work, and play.</description>\n${feedItems}\n  </channel>\n</rss>\n`,
);

writeFileSync(
  join(distDir, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

console.log(`seo: ${nodes.length} nodes → dist/read, sitemap.xml, rss.xml, robots.txt`);
