#!/usr/bin/env node
// CLI wrapper around scripts/lib/plyToSplt.mjs.
// See scripts/SHARP_PIPELINE.md for the end-to-end recipe.
//
// Usage:
//   node scripts/ply-to-splt.mjs <input.ply> <output.splt> [--count=2000000] [--radius=1.6]

import { readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';
import { plyToSplt } from './lib/plyToSplt.mjs';

const args = argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? 'true'];
    }),
);

if (positional.length < 2) {
  console.error(
    'usage: ply-to-splt.mjs <input.ply> <output.splt> [--count=2000000] [--radius=1.6]',
  );
  exit(1);
}

const [inputPath, outputPath] = positional;
const input = readFileSync(inputPath);
const { buffer, vertexCount, count } = plyToSplt(input, {
  count: flags.count,
  radius: flags.radius,
});
console.log(`PLY: ${vertexCount} vertices`);
writeFileSync(outputPath, buffer);
const inMB = (input.byteLength / 1024 / 1024).toFixed(2);
const outKB = (buffer.byteLength / 1024).toFixed(1);
console.log(
  `wrote ${outputPath} (${count} pts, ${outKB} KB; from ${inMB} MB — ${(input.byteLength / buffer.byteLength).toFixed(1)}× smaller)`,
);
