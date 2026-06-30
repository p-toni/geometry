import type { ConstellationDigest } from './constellationDigest';

export type ConstellationPerson = {
  id: string;
  name: string;
  meta: string;
  topicIds: string[];
  sectionSlug?: string;
};

export type ConstellationGraphPayload = {
  people: ConstellationPerson[];
  topicLabels: Record<string, string>;
  extraEdges?: [string, string][];
};

const LENS_SUFFIX = '-lens';
const LINK_REL = /^(cites|leads to|theme|echoes|exterior)\s*·/i;

export function isLensInquiry(person: ConstellationPerson): boolean {
  return person.id.endsWith(LENS_SUFFIX);
}

/** Exterior/backlink inquiries — no section anchor. */
export function isLinkInquiry(person: ConstellationPerson): boolean {
  if (person.sectionSlug || isLensInquiry(person)) return false;
  return LINK_REL.test(person.meta.trim());
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function scorePersonSection(person: ConstellationPerson, section: ConstellationDigest['sections'][0]): number {
  let score = 0;
  const hay = `${person.id} ${person.name} ${person.meta}`.toLowerCase();
  for (const token of section.slug.split('-')) {
    if (token.length > 3 && hay.includes(token)) score += 2;
  }
  const headingKey = slugify(section.heading);
  if (headingKey && hay.includes(headingKey.slice(0, Math.min(headingKey.length, 18)))) score += 3;

  for (const tid of person.topicIds) {
    if (section.slug.includes(tid) || tid.includes(section.slug.slice(0, 8))) score += 2;
    for (const beat of section.beats) {
      const beatSlug = slugify(beat);
      if (beatSlug.includes(tid) || tid.includes(beatSlug.slice(0, 10))) score += 1;
    }
  }
  return score;
}

function ensureLens(
  people: ConstellationPerson[],
  digest: ConstellationDigest,
): ConstellationPerson[] {
  if (people.some(isLensInquiry)) return people;
  const lensId = `${digest.id}${LENS_SUFFIX}`;
  return [
    {
      id: lensId,
      name: digest.title,
      meta: `lens · ${digest.lens}`,
      topicIds: people[0]?.topicIds.slice(0, 3) ?? [],
    },
    ...people,
  ];
}

/**
 * Apply essay section spine to any graph before write.
 * Idempotent — preserves hand-authored sectionSlug when present.
 */
export function hydrateConstellationGraph(
  graph: ConstellationGraphPayload,
  digest: ConstellationDigest,
): ConstellationGraphPayload {
  const sectionSlugs = digest.sections.map((s) => s.slug);
  let people = graph.people.map((p) => ({ ...p, topicIds: [...new Set(p.topicIds ?? [])] }));
  people = ensureLens(people, digest);

  for (const person of people) {
    if (isLensInquiry(person) || isLinkInquiry(person) || person.sectionSlug) continue;

    let best = sectionSlugs[0];
    let bestScore = -1;
    for (const section of digest.sections) {
      const score = scorePersonSection(person, section);
      if (score > bestScore) {
        bestScore = score;
        best = section.slug;
      }
    }
    person.sectionSlug = best;
  }

  return { ...graph, people };
}

export function authoredLayoutReady(
  graph: ConstellationGraphPayload,
  sectionSlugs: string[],
): boolean {
  const lens = graph.people.some(isLensInquiry);
  const sectionInquiries = graph.people.filter((p) => p.sectionSlug && !isLensInquiry(p));
  return !!(lens && sectionSlugs.length && sectionInquiries.length);
}