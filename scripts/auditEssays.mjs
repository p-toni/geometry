import { readFileSync } from 'node:fs';
import { parseBlocks } from '../src/lib/parseBlocks.ts';

const ids = ['bounded-me', 'me-plus-ai', 'geometry-retrieval', 'weak-geometry', 'allowed-ignorance'];

for (const id of ids) {
  const raw = readFileSync(`content/writing/${id}.md`, 'utf8');
  const body = raw.slice(raw.indexOf('\n---\n', 4) + 5);
  const blocks = parseBlocks(body);
  const issues = [];
  const h3 = blocks.filter((b) => b.t === 'p' && b.x.startsWith('###'));
  if (h3.length) issues.push(`${h3.length} unparsed h3`);
  const emptyAside = blocks.filter((b) => b.t === 'callout' && b.v === 'aside' && !b.x);
  if (emptyAside.length) issues.push(`${emptyAside.length} label-only aside`);
  const numbered = blocks.filter((b) => b.t === 'p' && /^\d+\.\s/.test(b.x));
  if (numbered.length) issues.push(`${numbered.length} numbered paragraphs`);
  const figs = [...new Set(blocks.filter((b) => !['p', 'h'].includes(b.t)).map((b) => b.t))];
  console.log(`${id}: ${blocks.length} blocks | ${figs.join(', ')} | ${issues.join('; ') || 'ok'}`);
}