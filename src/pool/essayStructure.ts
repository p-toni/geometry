/** Radial descent structure — matches v2 single-spine handoff STRUCT. */
export type EssaySection = {
  label: string;
  concepts: string[];
};

export type EssayStructure = {
  /** Header title in spatial handoff chrome */
  lens: string;
  /** Center node label — essay title */
  centerLabel: string;
  sections: EssaySection[];
};

export type ConstellationPerson = {
  id: string;
  name: string;
  meta?: string;
  topicIds?: string[];
  /** When this inquiry is a section move — scroll anchor in read panel. */
  sectionSlug?: string;
};

export type ConstellationGraphJson = {
  people?: ConstellationPerson[];
  topicLabels?: Record<string, string>;
  title?: string;
  extraEdges?: [string, string][];
};

const STRUCTURAL = new Set(['preamble', 'thesis', 'closing']);

function labelFor(topicId: string, labels: Record<string, string>): string {
  return labels[topicId] ?? topicId.replace(/-/g, ' ');
}

export function graphToStructure(
  graph: ConstellationGraphJson,
  centerLabel: string,
): EssayStructure | null {
  const people = graph.people ?? [];
  if (!people.length) return null;

  const lensPerson = people.find((p) => p.id.endsWith('-lens')) ?? people[0];
  const lens =
    (lensPerson.meta ?? '').replace(/\s*—.*$/, '').trim() ||
    lensPerson.name ||
    centerLabel;

  const sectionPeople = people.filter((p) => p.meta?.includes('section'));
  if (!sectionPeople.length) return null;

  const labels = graph.topicLabels ?? {};

  const sections = sectionPeople.map((person) => {
    const sectionKey = person.topicIds?.find((t) => STRUCTURAL.has(t) || labels[t]);
    const sectionLabel =
      (sectionKey && labels[sectionKey]) ||
      person.name.replace(/\b\w/g, (c) => c.toUpperCase());

    const concepts = (person.topicIds ?? [])
      .filter((t) => t !== sectionKey && !STRUCTURAL.has(t))
      .map((t) => labelFor(t, labels))
      .filter((c) => c.length > 1 && c.length < 48);

    return { label: sectionLabel, concepts };
  });

  return { lens, centerLabel, sections };
}

export function structureFromExcerpt(
  centerLabel: string,
  excerpt: string[],
): EssayStructure {
  const stop = new Set([
    'which', 'these', 'their', 'there', 'about', 'stops', 'becomes', 'being',
    'every', 'where', 'after', 'still', 'enough', 'holds', 'detail', 'thing',
  ]);
  const words = excerpt.join(' ').toLowerCase().match(/[a-z]{5,}/g) ?? [];
  const uniq: string[] = [];
  for (const w of words) {
    if (!stop.has(w) && !uniq.includes(w)) uniq.push(w);
  }
  const c = uniq.length ? uniq : [centerLabel];
  return {
    lens: centerLabel,
    centerLabel,
    sections: [
      { label: 'Preamble', concepts: c.slice(0, 2) },
      { label: 'Thesis', concepts: c.slice(2, 4) },
      { label: 'Turn', concepts: c.slice(4, 6) },
      { label: 'Closing', concepts: c.slice(6, 8) },
    ].filter((s) => s.concepts.length),
  };
}