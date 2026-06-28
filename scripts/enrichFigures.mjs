/**
 * Map argument-grammar prose onto Figures registry widgets (FIG.01–12).
 * Run after integrateRewrite.mjs: node scripts/enrichFigures.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function plate(label, caption, src) {
  return `[plate|${label}]\n*${caption}* \`${src}\``;
}

function patch(rel, fn) {
  const path = join(root, rel);
  const raw = readFileSync(path, 'utf8');
  const end = raw.indexOf('\n---\n', 4);
  const fm = raw.slice(0, end + 5);
  const body = raw.slice(end + 5);
  const next = fn(body.trim());
  writeFileSync(path, `${fm}\n${next}\n`);
  console.log(`enriched ${rel}`);
}

patch('content/writing/allowed-ignorance.md', (b) => {
  let s = b;
  s = s.replace(
    '> [thesis|thesis]\n> Understanding is a disciplined right to leave things out.',
    '> [thesis|thesis]\n> Understanding is a disciplined right to leave things out.',
  );
  s = s.replace(
    'It is:\n\n> What did I remove, and did the object survive the cut?',
    'It is:\n\n> [thesis|claim]\n> What did I remove, and did the object survive the cut?',
  );
  s = s.replace(
    '![A carved form: one object, made usable by subtraction.](/images/pieces/allowed-ignorance/plate-cut.svg)',
    plate(
      'PLATE I',
      'One object, made usable by subtraction — the first cuts.',
      '/images/pieces/allowed-ignorance/plate-cut.svg',
    ),
  );
  s = s.replace(
    'A clean explanation can be a well-lit face.',
    '> [aside|aside]\n> A clean explanation can be a well-lit face. A framework can feel complete because it hides the seam from where I happen to be standing.',
  );
  s = s.replace(
    'A good summary can be a flattering projection.\n\nA framework can feel complete because it hides the seam from where I happen to be standing.\n\nRetrieval',
    'Retrieval',
  );
  s = s.replace(
    '![The same carved form under rotation: if it disappears when turned, I only owned a face.](/images/pieces/allowed-ignorance/plate-rotation.svg)',
    plate(
      'PLATE II',
      'The same form under rotation — if it disappears when turned, I only owned a face.',
      '/images/pieces/allowed-ignorance/plate-rotation.svg',
    ),
  );
  s = s.replace(
    '> Be careful what you allow yourself to treat as the same.',
    '> [thesis|warning]\n> Be careful what you allow yourself to treat as the same.',
  );
  s = s.replace(
    /Failure often looks less like chaos than like the return of a difference I stopped paying for\.\n\nThe model holds\.\n\nThe model holds\.\n\nThe model holds\.\n\nThen one small movement and the structure cracks along a line I had decided was cosmetic\./,
    'Failure often looks less like chaos than like the return of a difference I stopped paying for.\n\n[fig|late-failure-motif]',
  );
  s = s.replace(
    '![A fracture through the form: failure is often a difference returning from the removed material.](/images/pieces/allowed-ignorance/plate-crack.svg)',
    plate(
      'PLATE III',
      'A crack reveals the difference the map stopped paying for.',
      '/images/pieces/allowed-ignorance/plate-crack.svg',
    ),
  );
  s = s.replace(
    '## Closing\n\nUnderstanding is not possession.',
    '## Closing\n\n> [thesis|closing]\n> Understanding is a disciplined right to leave things out.\n\nUnderstanding is not possession.',
  );
  return s;
});

patch('content/writing/geometry-retrieval.md', (b) => {
  let s = b;
  s = s.replace(
    '> [thesis|thesis]\n> Understanding is what remains when the source is closed.',
    '> [thesis|the standard]\n> Understanding is what remains when the source is closed.',
  );
  s = s.replace(
    '> **Standard**  \n> Understanding is what remains when the source is closed.',
    '',
  );
  s = s.replace(
    'Understanding begins when I can draw an edge and defend it:\n\n> Cache misses',
    'Understanding begins when I can draw an edge and defend it:\n\n[fig|point-to-edge]\n\n> Cache misses',
  );
  s = s.replace(
    '> **Honesty clause**  \n> I am using “curvature” as a cognitive concept, not claiming equivalence between mathematical and mental objects. The point is navigational power.',
    '> [honesty|honesty clause]\n> I am using "curvature" as a cognitive concept, not claiming equivalence between mathematical and mental objects. The point is navigational power.',
  );
  s = s.replace(
    'That pattern is what I am calling curvature.\n\n> [honesty|honesty clause]',
    'That pattern is what I am calling curvature.\n\n[fig|curvature-test]\n\n> [honesty|honesty clause]',
  );
  s = s.replace(
    /## Protocol\n\n(?:<!-- block:edge-taxonomy -->\n\n<!-- block:steps -->\n\n)?1\. \*\*Sketch the graph\.\*\*[\s\S]*?\n\nStage rule:/,
    '## Protocol\n\n<!-- block:edge-taxonomy -->\n\n<!-- block:steps -->\n\nStage rule:',
  );
  s = s.replace(
    '## Protocol\n\nStage rule:',
    '## Protocol\n\n<!-- block:edge-taxonomy -->\n\n<!-- block:steps -->\n\nStage rule:',
  );
  s = s.replace(
    'My standard going forward:\n\n> Use models to expand the search space. Use reconstruction to build the map.',
    '> [thesis|standard going forward]\n> Use models to expand the search space. Use reconstruction to build the map.',
  );
  s = s.replace(
    '**Update (2026-04-12):** [[Allowed Ignorance|allowed-ignorance]]',
    '> [update|update · 2026-04-12]\n> [[backlink:Allowed Ignorance|theme|allowed-ignorance]]',
  );
  return s.replace(/\n{3,}/g, '\n\n');
});

patch('content/writing/me-plus-ai.md', (b) => {
  let s = b;
  s = s.replace(
    '> [thesis|thesis]\n> I am not using AI. I am regulating a coupled feedback system.',
    '> [aside|aside]\n> A safety manual for keeping control in the human-AI loop.\n\n> [thesis|thesis]\n> I am not using AI. I am regulating a coupled feedback system.',
  );
  s = s.replace(
    '**Update (2026-03-15):** Bennett',
    '> [update|update · 2026-03-15]\n> Bennett',
  );
  return s;
});

patch('content/writing/weak-geometry.md', (b) => {
  let s = b;
  s = s.replace(
    '> **Rule**  \n> The map should commit less.',
    '> [thesis|the figure]\n> The map should commit less.',
  );
  s = s.replace(
    '**Update (2026-04-12):** [[Allowed Ignorance|allowed-ignorance]]',
    '> [aside|pairs with]\n> [[backlink:Allowed Ignorance|pairs|allowed-ignorance]]: be careful what you allow yourself to treat as the same.\n\n> [update|update · 2026-04-12]\n> [[backlink:Allowed Ignorance|pairs|allowed-ignorance]]',
  );
  return s;
});

// bounded-me styling is authored directly in content/writing/bounded-me.md

patch('content/writing/tools-need-edges.md', (b) => {
  let s = b;
  s = s.replace(
    '> **Design rule**  \n> A good constraint is not a wall. It is a grip.',
    '> [aside|design rule]\n> A good constraint is not a wall. It is a grip.',
  );
  return s;
});

patch('content/writing/co-owning-the-loop.md', (b) => {
  let s = b;
  s = s.replace(
    '## Seam\n\nThere is a risk here too.',
    '## Seam\n\n> [honesty|seam]\n> Strong standards, weak ontology — enough structure to prevent drift, enough weakness to remain revisable.\n\nThere is a risk here too.',
  );
  s = s.replace(
    /So the loop needs two properties at once:\n\n- enough structure to prevent drift\n- enough weakness to remain revisable\n\nThat is the shape I trust: strong standards, weak ontology\./,
    'So the loop needs two properties at once — strong standards, weak ontology.',
  );
  return s;
});

patch('content/writing/increasing-returns.md', (b) => {
  let s = b;
  s = s.replace(
    '## Source\n\n> “You need an awareness',
    '## Source\n\n> [aside|source]\n> “You need an awareness',
  );
  return s;
});

patch('content/writing/ilya.md', (b) => {
  let s = b;
  s = s.replace(
    '## Source\n\n> “if you value intelligence',
    '## Source\n\n> [aside|source]\n> “if you value intelligence',
  );
  return s;
});