import type { ConstellationDigest } from '../../src/lib/constellationDigest.ts';

type Person = {
  id: string;
  name: string;
  meta: string;
  topicIds: string[];
  sectionSlug?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function inquiryName(section: ConstellationDigest['sections'][0], lens: string): string {
  if (section.tagline) {
    const words = section.tagline.split(/\s+/).slice(0, 3).join(' ');
    if (words.length > 4) return words;
  }
  const fromBeat = section.beats[0]?.split(/\s+/).slice(0, 4).join(' ');
  if (fromBeat && fromBeat.length > 8) return fromBeat.toLowerCase();
  return section.heading.replace(/^(I{1,3}|IV|V|VI{0,3})\.\s+/i, '').toLowerCase();
}

function inquiryMeta(section: ConstellationDigest['sections'][0]): string {
  const verb = section.role.split(/\s+/)[0] ?? 'move';
  const gloss = section.tagline || section.beats[0]?.slice(0, 42) || section.heading;
  return `${verb} · ${gloss}`;
}

function conceptsFromSection(section: ConstellationDigest['sections'][0]): string[] {
  const out: string[] = [];
  const push = (label: string) => {
    const slug = slugify(label);
    if (slug && !out.includes(slug)) out.push(slug);
  };

  push(section.heading.replace(/^(I{1,3}|IV|V|VI{0,3})\.\s+/i, ''));
  for (const c of section.contrasts) {
    for (const pole of c.split('|').map((s) => s.trim())) push(pole);
  }
  for (const beat of section.beats.slice(0, 4)) {
    const short = beat.split(/[.!?]/)[0]?.trim() ?? beat;
    push(short.slice(0, 40));
  }
  for (const pull of section.pullQuotes) push(pull);

  return out.slice(0, 6);
}

/** Deterministic unique graph per essay — demo when LLM unavailable. */
export function localGenerate(digest: ConstellationDigest) {
  const topicLabels: Record<string, string> = {};
  const labelFor = (slug: string, fallback: string) => {
    if (!topicLabels[slug]) {
      topicLabels[slug] = fallback
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .slice(0, 48);
    }
    return slug;
  };

  const people: Person[] = [];

  const lensConcepts = [
    labelFor(slugify(digest.lens), digest.lens),
    ...digest.excerpt.map((line) => labelFor(slugify(line), line)),
  ].slice(0, 4);

  people.push({
    id: `${digest.id}-lens`,
    name: digest.lens.toLowerCase().slice(0, 36),
    meta: `lens · ${digest.excerpt[0] ?? digest.title}`,
    topicIds: lensConcepts,
  });

  for (const [i, section] of digest.sections.entries()) {
    const topicIds = conceptsFromSection(section).map((slug, idx) => {
      const raw =
        section.contrasts.flatMap((c) => c.split('|').map((s) => s.trim()))[idx] ??
        section.beats[idx]?.slice(0, 40) ??
        section.heading;
      return labelFor(slug, raw);
    });

    people.push({
      id: `${digest.id}-section-${i}-${section.slug}`,
      name: inquiryName(section, digest.lens),
      meta: inquiryMeta(section),
      topicIds,
      sectionSlug: section.slug,
    });
  }

  for (const link of digest.links.slice(0, 2)) {
    const slug = labelFor(slugify(link.target), link.target);
    people.push({
      id: `${digest.id}-link-${link.target}`,
      name: link.target.replace(/-/g, ' '),
      meta: `${link.rel} · exterior pressure`,
      topicIds: [slug],
    });
  }

  const slugs = Object.keys(topicLabels);
  const extraEdges: [string, string][] = [];
  const seen = new Set<string>();

  for (const section of digest.sections) {
    for (const contrast of section.contrasts) {
      const [a, b] = contrast.split('|').map((s) => slugify(s.trim()));
      if (a && b && topicLabels[a] && topicLabels[b]) {
        const key = [a, b].sort().join('::');
        if (!seen.has(key)) {
          seen.add(key);
          extraEdges.push([a, b]);
        }
      }
    }
  }

  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const a = slugs[i]!;
      const b = slugs[j]!;
      const share = people.filter((p) => p.topicIds.includes(a) && p.topicIds.includes(b));
      if (share.length) continue;
      const pa = people.find((p) => p.topicIds.includes(a));
      const pb = people.find((p) => p.topicIds.includes(b));
      if (pa && pb && pa.sectionSlug && pb.sectionSlug && pa.sectionSlug !== pb.sectionSlug) {
        const key = [a, b].sort().join('::');
        if (!seen.has(key) && extraEdges.length < 24) {
          seen.add(key);
          extraEdges.push([a, b]);
        }
      }
    }
  }

  return { people, topicLabels, extraEdges };
}