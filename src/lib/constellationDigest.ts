import { sectionRailMeta } from './argumentGrammar';
import { sectionHeadingsFromBody, isSectionHeading } from './sectionHeadings';
import { sectionSlug } from './sectionSlug';
import type { Block, PoolNode } from '../pool/types';

export type DigestSection = {
  heading: string;
  slug: string;
  role: string;
  tagline: string;
  beats: string[];
  contrasts: string[];
  pullQuotes: string[];
};

export type ConstellationDigest = {
  id: string;
  title: string;
  lens: string;
  excerpt: string[];
  struct?: { lens: string; sections: { label: string; concepts: string[] }[] };
  links: { target: string; rel: string }[];
  sections: DigestSection[];
};

function plain(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\[\[([^|]+)\|[^\]]+\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function beatFromBlock(block: Block): string | null {
  switch (block.t) {
    case 'thesis':
    case 'pull':
    case 'p':
      return plain(block.x).slice(0, 120);
    case 'plate':
      return plain(block.cap).slice(0, 80);
    case 'callout':
      return plain(block.x).slice(0, 100);
    case 'contrast':
      return `${block.poles[0]} | ${block.poles[1]}`;
    case 'ladder':
      return block.rungs.map((r) => r.term).join(' → ');
    default:
      return null;
  }
}

/** Compact essay summary for LLM constellation generation. */
export function buildConstellationDigest(node: PoolNode): ConstellationDigest | null {
  const headings = sectionHeadingsFromBody(node.body);
  if (!headings.length) return null;

  const sections: DigestSection[] = [];
  let current: DigestSection | undefined;

  const openSection = (heading: string) => {
    const rail = sectionRailMeta(heading);
    current = {
      heading,
      slug: sectionSlug(heading),
      role: rail?.role ?? sectionSlug(heading),
      tagline: rail?.tagline ?? '',
      beats: [],
      contrasts: [],
      pullQuotes: [],
    };
    sections.push(current);
  };

  for (const block of node.body) {
    if (isSectionHeading(block)) {
      openSection(block.x);
      continue;
    }
    if (!current) continue;

    if (block.t === 'pull') {
      current.pullQuotes.push(plain(block.x).slice(0, 100));
      continue;
    }
    if (block.t === 'contrast') {
      current.contrasts.push(`${block.poles[0]} | ${block.poles[1]}`);
      continue;
    }

    const beat = beatFromBlock(block);
    if (beat && !current.beats.includes(beat)) current.beats.push(beat);
  }

  return {
    id: node.id,
    title: node.title,
    lens: node.struct?.lens ?? node.excerpt[0] ?? node.title,
    excerpt: node.excerpt,
    struct: node.struct,
    links: node.links.map(([target, rel]) => ({ target, rel })),
    sections,
  };
}
