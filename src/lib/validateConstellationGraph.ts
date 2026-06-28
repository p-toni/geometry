import { buildConstellationDigest } from './constellationDigest';
import type { PoolNode } from '../pool/types';

export type ConstellationSourceGraph = {
  people: Array<{
    id: string;
    name: string;
    meta: string;
    topicIds: string[];
    sectionSlug?: string;
  }>;
  topicLabels: Record<string, string>;
  extraEdges?: [string, string][];
};

export type ValidationIssue = {
  level: 'error' | 'warn';
  code: string;
  message: string;
};

const INQUIRY_MIN = 4;
const INQUIRY_MAX = 15;
const CONCEPT_MIN = 6;
const CONCEPT_MAX = 45;
const ORPHAN_WARN = 2;
const ORPHAN_ERROR = 10;

export function validateConstellationGraph(
  graph: ConstellationSourceGraph,
  digest: ReturnType<typeof buildConstellationDigest>,
  poolId: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const topicIds = new Set(Object.keys(graph.topicLabels ?? {}));
  const slugs = new Set(digest?.sections.map((s) => s.slug) ?? []);

  if (!graph.people?.length) {
    issues.push({ level: 'error', code: 'no-people', message: 'graph needs people[]' });
    return issues;
  }

  const inquiryCount = graph.people.length;
  if (inquiryCount < INQUIRY_MIN || inquiryCount > INQUIRY_MAX) {
    issues.push({
      level: 'warn',
      code: 'inquiry-count',
      message: `${poolId}: ${inquiryCount} inquiries (target ${INQUIRY_MIN}–${INQUIRY_MAX})`,
    });
  }

  if (topicIds.size < CONCEPT_MIN || topicIds.size > CONCEPT_MAX) {
    issues.push({
      level: 'warn',
      code: 'concept-count',
      message: `${poolId}: ${topicIds.size} concepts (target ${CONCEPT_MIN}–${CONCEPT_MAX})`,
    });
  }

  for (const person of graph.people) {
    if (!person.id || !person.name || !person.meta) {
      issues.push({
        level: 'error',
        code: 'invalid-person',
        message: `invalid person in ${poolId}: ${JSON.stringify(person)}`,
      });
    }
    for (const tid of person.topicIds ?? []) {
      if (!topicIds.has(tid)) {
        issues.push({
          level: 'error',
          code: 'unknown-topic',
          message: `${poolId}: person ${person.id} references unknown topic ${tid}`,
        });
      }
    }
    if (digest && person.sectionSlug && !slugs.has(person.sectionSlug)) {
      issues.push({
        level: 'error',
        code: 'bad-section-slug',
        message: `${poolId}: person ${person.id} has unknown sectionSlug ${person.sectionSlug}`,
      });
    }
    const count = person.topicIds?.length ?? 0;
    if (count < 1) {
      issues.push({
        level: 'warn',
        code: 'empty-inquiry',
        message: `${poolId}: inquiry ${person.id} has no concepts`,
      });
    }
  }

  for (const [a, b] of graph.extraEdges ?? []) {
    if (!topicIds.has(a) || !topicIds.has(b)) {
      issues.push({
        level: 'error',
        code: 'bad-edge',
        message: `${poolId}: extraEdge references unknown topic: ${a} — ${b}`,
      });
    }
  }

  const attached = new Set(graph.people.flatMap((p) => p.topicIds ?? []));
  const orphans = [...topicIds].filter((id) => !attached.has(id));
  if (orphans.length > ORPHAN_ERROR) {
    issues.push({
      level: 'error',
      code: 'orphan-concepts',
      message: `${poolId}: ${orphans.length} orphan concepts: ${orphans.slice(0, 4).join(', ')}…`,
    });
  } else if (orphans.length > ORPHAN_WARN) {
    issues.push({
      level: 'warn',
      code: 'orphan-concepts',
      message: `${poolId}: ${orphans.length} orphan concepts: ${orphans.join(', ')}`,
    });
  }

  return issues;
}

export function validatePoolNodeGraph(
  graph: ConstellationSourceGraph,
  node: PoolNode,
): ValidationIssue[] {
  return validateConstellationGraph(graph, buildConstellationDigest(node), node.id);
}