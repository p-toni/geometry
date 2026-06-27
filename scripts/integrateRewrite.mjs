import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rewriteDir = '/tmp/geometry-rewrite/public/content';

const FILES = [
  { src: '01-tools-need-edges.md', dest: 'content/writing/tools-need-edges.md', skipThesisTag: false },
  { src: '02-increasing-returns.md', dest: 'content/writing/increasing-returns.md', skipThesisTag: false },
  { src: '03-ilya.md', dest: 'content/writing/ilya.md', skipThesisTag: false },
  { src: '04-co-owning-the-loop.md', dest: 'content/writing/co-owning-the-loop.md', skipThesisTag: false },
  { src: '05-bounded-me.md', dest: 'content/writing/bounded-me.md', skipThesisTag: false },
  { src: '06-me-plus-ai.md', dest: 'content/writing/me-plus-ai.md', skipThesisTag: false },
  { src: '07-geometry-over-retrieval.md', dest: 'content/writing/geometry-retrieval.md', skipThesisTag: false },
  { src: '08-weak-geometry.md', dest: 'content/writing/weak-geometry.md', skipThesisTag: false },
  { src: '09-allowed-ignorance.md', dest: 'content/writing/allowed-ignorance.md', skipThesisTag: false },
  { src: 'about.md', dest: 'content/you/about.md', skipThesisTag: true },
];

function slugFromPath(href) {
  const m = href.match(/\/content\/(?:\d+-)?([^.]+)\.md/);
  if (!m) return null;
  const slug = m[1];
  if (slug === 'geometry-over-retrieval') return 'geometry-retrieval';
  return slug;
}

function convertLinks(text) {
  return text.replace(/\[([^\]]+)\]\((\/content\/[^)]+)\)/g, (_match, label, href) => {
    const id = slugFromPath(href);
    if (!id) return _match;
    const title = label.trim() || id;
    return `[[${title}|${id}]]`;
  });
}

function stripPreamble(raw) {
  let body = raw.replace(/\r\n/g, '\n');
  body = body.replace(/^# [^\n]+\n+/, '');
  body = body.replace(/^\*[^*\n]+\*\s*·\s*_[^_\n]+_\s*\n+/, '');
  return body;
}

function normalizeImages(text) {
  return text.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    '![$1]($2)',
  );
}

function tagOpeningThesis(text) {
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i >= lines.length || !lines[i].trim().startsWith('>')) return text;

  const quote = [];
  while (i < lines.length && lines[i].trim().startsWith('>')) {
    quote.push(lines[i].trim().replace(/^>\s?/, ''));
    i++;
  }
  const inner = quote.join('\n').trim();
  if (!inner || inner.startsWith('[thesis|') || inner.startsWith('**')) {
    return text;
  }
  const before = lines.slice(0, i - quote.length).join('\n');
  const after = lines.slice(i).join('\n');
  const tagged = `> [thesis|thesis]\n${quote.map((l) => `> ${l}`).join('\n')}`;
  return [before.trimEnd(), tagged, after.trimStart()].filter(Boolean).join('\n\n');
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) throw new Error('Missing frontmatter');
  const end = raw.indexOf('\n---\n', 4);
  const yaml = raw.slice(4, end);
  return yaml;
}

function extractThesis(body) {
  const m = body.match(/^>\s*(?:\[thesis\|[^\]]+\]\s*\n)?>\s*(.+)$/m);
  return m ? m[1].replace(/\*\*/g, '').trim() : null;
}

function conceptsForSection(label) {
  const normalized = label.replace(/^(I+\.|VI+\.)\s*/, '').toLowerCase();
  const hints = {
    frame: ['pressure', 'situation'],
    claim: ['thesis', 'durable'],
    operator: ['protocol', 'reuse'],
    seam: ['uncertain', 'provisional'],
    test: ['verification', 'signal'],
    consequence: ['design', 'change'],
    block: ['subtraction', 'equivalence'],
    face: ['projection', 'coherence'],
    rotation: ['invariance', 'rebuild'],
    void: ['omission', 'relief'],
    crack: ['failure', 'return'],
    workshop: ['rebuild', 'authorship'],
    closing: ['discipline', 'limits'],
    source: ['citation', 'anchor'],
  };
  for (const [key, concepts] of Object.entries(hints)) {
    if (normalized.includes(key)) return concepts;
  }
  const words = normalized.split(/\W+/).filter((w) => w.length > 3).slice(0, 2);
  return words.length ? words : [normalized.slice(0, 16) || 'section'];
}

function extractSections(body) {
  return [...body.matchAll(/^## (.+)$/gm)].map((m) => {
    const label = m[1].replace(/^(I+\.|VI+\.)\s*/, '').trim();
    return { label, concepts: conceptsForSection(label) };
  });
}

function extractLens(yaml) {
  const m = yaml.match(/^  lens:\s*"?([^"\n]+)"?\s*$/m);
  return m ? m[1].trim() : '';
}

function extractDateLine(raw) {
  const m = raw.match(/^\*([^*\n]+)\*\s*·/m);
  return m ? m[1].trim().replace(/\./g, '-') : null;
}

function patchYaml(yaml, { thesis, sections, dateLine }) {
  const lines = yaml.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('date:') && dateLine) {
      out.push(`date: ${dateLine}`);
      i++;
      continue;
    }

    if (line === 'excerpt:') {
      i++;
      while (i < lines.length && lines[i].match(/^\s+-/)) i++;
      out.push('excerpt:');
      if (thesis) out.push(`  - "${thesis.replace(/"/g, '\\"')}"`);
      continue;
    }

    if (line === 'struct:') {
      const lens = extractLens(yaml);
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) i++;
      out.push('struct:');
      if (lens) out.push(`  lens: "${lens.replace(/"/g, '\\"')}"`);
      out.push('  sections:');
      for (const s of sections) {
        out.push(`    - label: "${s.label.replace(/"/g, '\\"')}"`);
        const concepts = s.concepts.map((c) => `"${c.replace(/"/g, '\\"')}"`).join(', ');
        out.push(`      concepts: [${concepts}]`);
      }
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join('\n');
}

for (const { src, dest, skipThesisTag } of FILES) {
  const rewriteRaw = readFileSync(join(rewriteDir, src), 'utf8');
  const existingRaw = readFileSync(join(root, dest), 'utf8');
  const yaml = parseFrontmatter(existingRaw);

  let body = stripPreamble(rewriteRaw);
  body = convertLinks(body);
  body = normalizeImages(body);
  if (!skipThesisTag) body = tagOpeningThesis(body);

  const thesis = skipThesisTag ? null : extractThesis(body);
  const aboutExcerpt =
    skipThesisTag &&
    body
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith('>') && !l.startsWith('#'));
  const sections = extractSections(body);
  const dateLine = extractDateLine(rewriteRaw);
  const updatedYaml = patchYaml(yaml, {
    thesis: thesis ?? aboutExcerpt,
    sections,
    dateLine,
  });

  const out = `---\n${updatedYaml}\n---\n\n${body.trim()}\n`;
  writeFileSync(join(root, dest), out);
  console.log(`wrote ${dest} (${sections.length} sections)`);
}

console.log('\nRun: node scripts/enrichFigures.mjs && pnpm pool:build');