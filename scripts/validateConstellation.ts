import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateConstellationGraph,
  type ConstellationSourceGraph,
  type ValidationIssue,
} from '../src/lib/validateConstellationGraph.ts';
import { buildConstellationDigest } from '../src/lib/constellationDigest.ts';
import { generatedPool } from '../src/pool/generated.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesDir = join(root, 'constellation/sources');

function loadSources(): { poolId: string; graph: ConstellationSourceGraph }[] {
  const files = readdirSync(sourcesDir).filter((f) => f.endsWith('.json'));
  return files.map((file) => {
    const poolId = file.replace(/\.json$/, '');
    const graph = JSON.parse(readFileSync(join(sourcesDir, file), 'utf8')) as ConstellationSourceGraph;
    return { poolId, graph };
  });
}

function summarize(issues: ValidationIssue[]) {
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  return { errors, warns };
}

const all: ValidationIssue[] = [];

for (const { poolId, graph } of loadSources()) {
  const node = generatedPool.nodes[poolId];
  const digest = node ? buildConstellationDigest(node) : null;
  all.push(...validateConstellationGraph(graph, digest, poolId));
}

const { errors, warns } = summarize(all);

for (const w of warns) console.warn(`warn [${w.code}] ${w.message}`);
for (const e of errors) console.error(`error [${e.code}] ${e.message}`);

console.log(
  `\nconstellation: ${loadSources().length} sources — ${errors.length} errors, ${warns.length} warnings`,
);

if (errors.length) process.exit(1);