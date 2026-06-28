import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { localGenerate } from './constellation/localGenerate.ts';
import { buildConstellationDigest } from '../src/lib/constellationDigest.ts';
import { generatedPool } from '../src/pool/generated.ts';
import type { PoolNode } from '../src/pool/types.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

type ConstellationPerson = {
  id: string;
  name: string;
  meta: string;
  topicIds: string[];
  sectionSlug?: string;
};

type ConstellationGraph = {
  id: string;
  title: string;
  method: string;
  embeddingModel: string | null;
  scope: string;
  people: ConstellationPerson[];
  topicLabels: Record<string, string>;
  extraEdges: [string, string][];
  meta?: Record<string, unknown>;
};

const REFERENCE_STYLE = `Example inquiry voice (reference only — do not copy topics):
- name: "humid knowing", meta: "seeping · perception before language"
- name: "still dissolving", meta: "vanishing · the process, not the end"`;

const SYSTEM = `You design a unique spatial constellation graph for one essay.
Each essay gets its own inquiries (people) and concepts (topics) — not a fixed template.

Output JSON with this shape:
{
  "people": [{ "id": "kebab-id", "name": "short inquiry name", "meta": "verb · gloss", "topicIds": ["concept-slug", ...], "sectionSlug": "optional-anchor" }],
  "topicLabels": { "concept-slug": "Display Label" },
  "extraEdges": [["slug-a", "slug-b"], ...]
}

Rules:
- Ground every inquiry and concept in the essay digest. No invented ideas.
- 6–14 inquiries: one lens inquiry, 1–2 per major section, optional quote/backlink inquiries.
- Inquiry names: lowercase, evocative, specific to THIS essay (reference tone, not reference content).
- meta format: "verb · gloss" (two parts separated by middle dot).
- 15–35 concepts as kebab-case slugs in topicLabels.
- Each section inquiry must include sectionSlug matching the digest.
- Attach 2–6 concepts per inquiry via topicIds.
- extraEdges: 10–30 pairs linking related concepts (especially across sections).
- Use only slugs listed in topicLabels for extraEdges.
${REFERENCE_STYLE}`;

function parseArgs(argv: string[]) {
  const essayIdx = argv.indexOf('--essay');
  const dryRun = argv.includes('--dry-run');
  const local = argv.includes('--local');
  const essay = essayIdx >= 0 ? argv[essayIdx + 1] : undefined;
  return { essay, dryRun, local };
}

function sourceGraphPath(poolId: string) {
  return join(root, 'constellation/sources', `${poolId}.json`);
}

function loadSourceGraph(poolId: string) {
  const file = sourceGraphPath(poolId);
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Pick<
      ConstellationGraph,
      'people' | 'topicLabels' | 'extraEdges'
    >;
  } catch {
    return null;
  }
}

function manifestEntryFor(poolId: string) {
  const manifest = JSON.parse(
    readFileSync(join(root, 'constellation/generated/manifest.json'), 'utf8'),
  ) as {
    graphs: { id: string; title: string; path: string; kind: string }[];
  };
  const direct = manifest.graphs.find((g) => g.id.replace(/^\d+-/, '') === poolId);
  if (direct) return direct;
  const alias = poolId === 'geometry-retrieval' ? '07-geometry-over-retrieval' : null;
  return alias ? manifest.graphs.find((g) => g.id === alias) : undefined;
}

function validateGraph(
  graph: ConstellationGraph,
  digest: ReturnType<typeof buildConstellationDigest>,
) {
  if (!graph.people?.length) throw new Error('graph needs people[]');
  const slugs = new Set(digest?.sections.map((s) => s.slug) ?? []);
  const topicIds = new Set(Object.keys(graph.topicLabels ?? {}));

  for (const person of graph.people) {
    if (!person.id || !person.name || !person.meta) {
      throw new Error(`invalid person: ${JSON.stringify(person)}`);
    }
    for (const tid of person.topicIds ?? []) {
      if (!topicIds.has(tid)) throw new Error(`person ${person.id} references unknown topic ${tid}`);
    }
    if (digest && person.sectionSlug && !slugs.has(person.sectionSlug)) {
      throw new Error(`person ${person.id} has unknown sectionSlug ${person.sectionSlug}`);
    }
  }

  for (const [a, b] of graph.extraEdges ?? []) {
    if (!topicIds.has(a) || !topicIds.has(b)) {
      throw new Error(`extraEdge references unknown topic: ${a} — ${b}`);
    }
  }

  const attached = new Set(graph.people.flatMap((p) => p.topicIds ?? []));
  const orphan = [...topicIds].filter((id) => !attached.has(id));
  if (orphan.length > 8) {
    throw new Error(`too many orphan concepts (${orphan.length}): ${orphan.slice(0, 5).join(', ')}…`);
  }
}

async function callLlm(digest: NonNullable<ReturnType<typeof buildConstellationDigest>>) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set');

  const user = `Essay digest:\n${JSON.stringify(digest, null, 2)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.CONSTELLATION_MODEL ?? 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI ${response.status}: ${err}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const raw = data.choices[0]?.message?.content;
  if (!raw) throw new Error('empty LLM response');
  return JSON.parse(raw) as Pick<ConstellationGraph, 'people' | 'topicLabels' | 'extraEdges'>;
}

function writeGraph(entry: { id: string; title: string; path: string }, graph: ConstellationGraph) {
  const rel = `${entry.path}.json`;
  const targets = [
    join(root, 'constellation/generated', rel),
    join(root, 'public/generated', rel),
  ];
  for (const file of targets) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(graph, null, 2)}\n`);
  }
  return rel;
}

async function buildOne(node: PoolNode, opts: { dryRun: boolean; local: boolean }) {
  const { dryRun, local } = opts;
  const digest = buildConstellationDigest(node);
  const entry = manifestEntryFor(node.id);
  if (!entry) {
    console.warn(`skip ${node.id}: no manifest entry`);
    return null;
  }

  const sourcedEarly = !local ? loadSourceGraph(node.id) : null;
  if (!digest && !sourcedEarly) {
    console.warn(`skip ${node.id}: no ## sections and no agent source`);
    return null;
  }

  if (dryRun) {
    console.log(`--- digest: ${node.id} ---\n`);
    console.log(JSON.stringify(digest, null, 2));
    console.log('\n--- system prompt ---\n');
    console.log(SYSTEM);
    return null;
  }

  let llm: Pick<ConstellationGraph, 'people' | 'topicLabels' | 'extraEdges'>;
  let method = 'agent';

  const sourced = sourcedEarly ?? (!local ? loadSourceGraph(node.id) : null);
  if (sourced) {
    console.log(`using agent source ${node.id}…`);
    llm = sourced;
    method = 'agent';
  } else if (local) {
    console.log(`generating ${node.id} (local)…`);
    llm = localGenerate(digest);
    method = 'local';
  } else {
    console.log(`generating ${node.id} (llm api)…`);
    try {
      llm = await callLlm(digest);
      method = 'llm';
    } catch (e) {
      console.warn(`  llm failed: ${e instanceof Error ? e.message : e}`);
      const fallback = loadSourceGraph(node.id);
      if (fallback) {
        console.warn(`  using agent source ${node.id}`);
        llm = fallback;
        method = 'agent';
      } else {
        console.warn('  falling back to --local generator');
        llm = localGenerate(digest);
        method = 'local-fallback';
      }
    }
  }

  validateGraph(
    {
      id: entry.id,
      title: entry.title,
      method,
      embeddingModel: null,
      scope: 'intra',
      ...llm,
    },
    digest,
  );

  const graph: ConstellationGraph = {
    id: entry.id,
    title: entry.title,
    method,
    embeddingModel: method === 'llm' ? (process.env.CONSTELLATION_MODEL ?? 'gpt-4o-mini') : null,
    scope: 'intra',
    people: llm.people,
    topicLabels: llm.topicLabels,
    extraEdges: llm.extraEdges ?? [],
    meta: {
      scope: 'intra',
      inquiryCount: llm.people.length,
      conceptCount: Object.keys(llm.topicLabels).length,
      edgeCount: llm.people.reduce((n, p) => n + (p.topicIds?.length ?? 0), 0),
      extraEdgeCount: llm.extraEdges?.length ?? 0,
      generatedAt: new Date().toISOString(),
      poolId: node.id,
      sectionSlugs: digest?.sections.map((s) => s.slug) ?? [],
    },
  };

  const rel = writeGraph(entry, graph);
  console.log(`  → ${rel} (${graph.meta.inquiryCount} inquiries, ${graph.meta.conceptCount} concepts, ${graph.meta.extraEdgeCount} extra edges)`);
  return graph;
}

async function main() {
  const { essay, dryRun, local } = parseArgs(process.argv.slice(2));
  const nodes = Object.values(generatedPool.nodes).filter(
    (n) =>
      n.cluster === 'writing' &&
      (n.kind === 'essay' || n.kind === 'note') &&
      (hasSections(n) || manifestEntryFor(n.id)),
  );

  const targets = essay ? nodes.filter((n) => n.id === essay) : nodes;
  if (essay && !targets.length) {
    throw new Error(`essay not found or has no sections: ${essay}`);
  }

  for (const node of targets) {
    await buildOne(node, { dryRun, local });
  }
}

function hasSections(node: PoolNode) {
  return node.body.some((b) => b.t === 'h' && (b.level ?? 2) === 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});