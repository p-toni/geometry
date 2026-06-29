/**
 * Section-aware layout for essay descent.
 * Lens at center → section inquiries in essay order → concepts clustered per section.
 */

const LENS_ID_SUFFIX = '-lens';

export function isLensInquiry(person) {
  return person.id.endsWith(LENS_ID_SUFFIX);
}

export function classifyInquiries(people) {
  const lens = people.find(isLensInquiry) ?? null;
  const sectionInquiries = people.filter((p) => p.sectionSlug && !isLensInquiry(p));
  const linkInquiries = people.filter((p) => !p.sectionSlug && !isLensInquiry(p));
  return { lens, sectionInquiries, linkInquiries };
}

export function sectionSlugOrder(sectionInquiries, metaSlugs) {
  if (metaSlugs?.length) return [...metaSlugs];
  const seen = new Set();
  const order = [];
  for (const person of sectionInquiries) {
    const slug = person.sectionSlug;
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      order.push(slug);
    }
  }
  return order;
}

function conceptOwners(sectionInquiries, lens, linkInquiries) {
  const owners = new Map();
  const register = (inquiry, slug) => {
    for (const tid of inquiry.topicIds ?? []) {
      if (!owners.has(tid)) owners.set(tid, { slugs: new Set(), inquiries: new Set() });
      const entry = owners.get(tid);
      if (slug) entry.slugs.add(slug);
      entry.inquiries.add(inquiry.id);
    }
  };
  if (lens) register(lens, null);
  for (const person of sectionInquiries) register(person, person.sectionSlug);
  for (const person of linkInquiries) register(person, null);
  return owners;
}

function primarySlug(slugs, slugOrder) {
  for (const slug of slugOrder) {
    if (slugs.has(slug)) return slug;
  }
  return [...slugs][0] ?? null;
}

/**
 * @param {{
 *   cx: number,
 *   cy: number,
 *   graphRadius: (frac: number) => number,
 *   lens: object | null,
 *   sectionInquiries: object[],
 *   linkInquiries: object[],
 *   topics: object[],
 *   slugOrder: string[],
 * }} input
 */
export function layoutAuthoredEssay(input) {
  const { cx, cy, graphRadius, lens, sectionInquiries, linkInquiries, topics, slugOrder } = input;
  const nodes = {};
  const sectionAngles = new Map();

  if (lens) {
    nodes[lens.id] = {
      ...lens,
      type: 'person',
      kind: 'lens',
      x: cx,
      y: cy,
      angle: -Math.PI / 2,
    };
  }

  const sectionCount = Math.max(slugOrder.length, 1);
  const arcSpan = Math.PI * 1.65;
  const startAngle = -Math.PI / 2 - arcSpan / 2;
  const sectionR = graphRadius(0.2);
  const conceptR = graphRadius(0.34);

  const bySlug = new Map();
  for (const person of sectionInquiries) {
    const slug = person.sectionSlug;
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(person);
  }

  slugOrder.forEach((slug, i) => {
    const inquiries = bySlug.get(slug) ?? [];
    const baseAngle =
      sectionCount === 1
        ? -Math.PI / 2
        : startAngle + (i / (sectionCount - 1)) * arcSpan;
    sectionAngles.set(slug, baseAngle);

    const spread = inquiries.length > 1 ? Math.min(0.22, inquiries.length * 0.06) : 0;
    inquiries.forEach((person, j) => {
      const angle =
        inquiries.length === 1
          ? baseAngle
          : baseAngle - spread / 2 + (j / (inquiries.length - 1)) * spread;
      nodes[person.id] = {
        ...person,
        type: 'person',
        kind: 'sectionInquiry',
        x: cx + Math.cos(angle) * sectionR,
        y: cy + Math.sin(angle) * sectionR,
        angle,
      };
    });
  });

  linkInquiries.forEach((person, i) => {
    const count = Math.max(linkInquiries.length, 1);
    const angle = Math.PI / 2 + 0.25 + (i - (count - 1) / 2) * 0.14;
    nodes[person.id] = {
      ...person,
      type: 'person',
      kind: 'linkInquiry',
      x: cx + Math.cos(angle) * sectionR,
      y: cy + Math.sin(angle) * sectionR,
      angle,
    };
  });

  const owners = conceptOwners(sectionInquiries, lens, linkInquiries);
  const byPrimary = new Map();
  for (const topic of topics) {
    const owner = owners.get(topic.id);
    const slug = owner ? primarySlug(owner.slugs, slugOrder) : null;
    const key = slug ?? '__orphan__';
    if (!byPrimary.has(key)) byPrimary.set(key, []);
    byPrimary.get(key).push(topic);
  }

  for (const [key, group] of byPrimary) {
    const baseAngle = key === '__orphan__' ? Math.PI / 2 : (sectionAngles.get(key) ?? -Math.PI / 2);
    const spread = Math.min(0.58, Math.max(0.16, group.length * 0.075));
    group.forEach((topic, j) => {
      const angle =
        group.length === 1
          ? baseAngle
          : baseAngle - spread / 2 + (j / (group.length - 1)) * spread;
      nodes[topic.id] = {
        ...topic,
        type: 'topic',
        kind: 'concept',
        x: cx + Math.cos(angle) * conceptR,
        y: cy + Math.sin(angle) * conceptR,
        angle,
      };
    });
  }

  return { nodes, slugOrder, sectionAngles, mode: 'authored' };
}

/** Intro reveal order: lens → sections (essay order) → concepts → exterior links. */
export function authoredIntroOrder(nodes, slugOrder, people, topics) {
  const order = [];
  const lens = people.find(isLensInquiry);
  if (lens && nodes[lens.id]) order.push(lens.id);

  for (const slug of slugOrder) {
    for (const person of people) {
      if (person.sectionSlug === slug && nodes[person.id]) order.push(person.id);
    }
  }

  for (const topic of topics) {
    if (nodes[topic.id]) order.push(topic.id);
  }

  for (const person of people) {
    if (!person.sectionSlug && !isLensInquiry(person) && nodes[person.id]) {
      order.push(person.id);
    }
  }

  return order;
}

export function canUseAuthoredLayout(resolved) {
  return !!(resolved.lens && resolved.sectionSlugs?.length && resolved.sectionInquiries?.length);
}