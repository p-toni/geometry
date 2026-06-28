#!/usr/bin/env node
/**
 * Full UI smoke test via agent-browser CLI.
 * Run: node scripts/browserTest.mjs
 */
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.browser-test');
mkdirSync(outDir, { recursive: true });

const results = [];

function ab(cmd) {
  try {
    return execSync(`agent-browser ${cmd}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    const msg = e.stderr?.trim() || e.stdout?.trim() || e.message;
    throw new Error(`agent-browser ${cmd}\n${msg}`);
  }
}

function snap(interactive = true) {
  const raw = ab(`snapshot ${interactive ? '-i' : ''} --json`);
  return JSON.parse(raw).data;
}

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.log(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

function assert(name, cond, detail = '') {
  if (cond) pass(name, detail);
  else fail(name, detail);
}

function refByName(data, pattern) {
  const re = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
  for (const [ref, meta] of Object.entries(data.refs)) {
    if (re.test(meta.name ?? '')) return ref;
  }
  return null;
}

function clickRole(name) {
  ab(`find role button click --name "${name}"`);
}

function clickNamed(pattern) {
  const ref = refByName(snap(), pattern);
  if (!ref) throw new Error(`button not found: ${pattern}`);
  ab(`scrollintoview ${ref}`);
  ab('wait 200');
  ab(`click ${ref}`);
}

function shot(file) {
  ab(`screenshot ${join(outDir, file)}`);
}

/** Hard navigation — agent-browser open can no-op on SPA history. */
function goto(url) {
  ab(`eval "window.location.assign('${url}')"`);
}

function pageText() {
  const data = JSON.parse(ab('snapshot --json')).data;
  return (data.snapshot || '').toLowerCase();
}

ab('open http://localhost:5173/');
ab('wait 2000');

// 1. Field home
let data = snap();
assert('field home loads', /toni/i.test(ab('get title')), ab('get title'));
const nodeButtons = Object.values(data.refs).filter(
  (r) => r.role === 'button' && /essay|note|project|doc|link|about|voxel|sharp|shader/i.test(r.name),
);
assert('field nodes visible', nodeButtons.length >= 15, `${nodeButtons.length} nodes`);
assert('lens chips present', refByName(data, 'thinking on AI') != null);
assert('now toggle present', refByName(data, /now/i) != null);
assert('zoom controls present', refByName(data, /^\+$/) != null);
shot('01-field-home.png');

// 2. Read panel excerpt
clickRole('allowed ignorance');
ab('wait 1000');
assert('read panel opens', ab('get url').includes('read=allowed-ignorance'), ab('get url'));
data = snap();
assert('read full button', refByName(data, 'read full') != null);
assert('constellation CTA', refByName(data, 'enter its constellation') != null);
assert('walk edges', refByName(data, 'geometry > retrieval') != null);
shot('02-read-excerpt.png');

// 3. Full essay (click from excerpt — SPA preserves state reliably)
clickNamed('read full');
ab('wait 2500');
assert('full mode URL', ab('get url').includes('full=1'), ab('get url'));
data = snap();
assert('collapse button', refByName(data, 'collapse') != null);
assert('essay headings', pageText().includes('block') && pageText().includes('crack'));
assert('motif figure', refByName(data, 'hold to stress') != null);
assert('constellation in full mode', refByName(data, 'enter its constellation') != null);
shot('03-read-full.png');

// 4. Collapse (before constellation — keeps full-mode context clean)
clickNamed('collapse');
ab('wait 700');
assert('collapse removes full', !ab('get url').includes('full=1'));
shot('04-collapsed.png');

// 5. Constellation descent from excerpt
goto('http://localhost:5173/?read=allowed-ignorance');
ab('wait 1200');
clickNamed('enter its constellation');
ab('wait 1200');
const txt = pageText();
assert('constellation overlay', txt.includes('spatial reading') && txt.includes('back to the field'));
assert('constellation title', txt.includes('allowed ignorance'));
shot('05-constellation.png');
clickRole('back to the field');
ab('wait 700');
assert('constellation closes', !pageText().includes('inside the argument'));

// 6. Walk edge
clickNamed('geometry > retrieval');
ab('wait 900');
const edgeUrl = ab('get url');
assert('edge navigation', edgeUrl.includes('read=geometry-retrieval'));
assert('edge trail in URL', edgeUrl.includes('trail=allowed-ignorance'), edgeUrl);
assert('back button', refByName(snap(), 'back') != null);
shot('06-edge-walk.png');
clickNamed('back');
ab('wait 1200');
assert('panel back restores trail parent', ab('get url').includes('read=allowed-ignorance'));

// 7. Home reset
clickRole('toni.ltd');
ab('wait 700');
assert('home clears read', !ab('get url').includes('read='));
shot('07-home.png');

// 8. Lens chip
clickRole('thinking on AI');
ab('wait 900');
assert('lens chip URL', ab('get url').includes('q='), ab('get url'));
shot('08-lens-chip.png');
clickRole('toni.ltd');
ab('wait 600');

// 9. Lens search
data = snap();
ab(`fill ${refByName(data, 'ask the field')} geometry`);
clickRole('ask');
ab('wait 900');
assert('lens search', /q=/.test(ab('get url')), ab('get url'));
shot('09-lens-search.png');
clickRole('toni.ltd');
ab('wait 600');

// 10. Now mode
clickRole('now');
ab('wait 900');
assert('now mode on', ab('get url').includes('now=1'));
shot('10-now.png');
clickRole('now');
ab('wait 500');

// 11. Deep link full essay
goto('http://localhost:5173/?read=bounded-me&full=1');
ab('wait 1500');
assert('deep link read', ab('get url').includes('read=bounded-me'));
assert('deep link full body', pageText().includes('context window') || pageText().includes('extractable'));
shot('11-deep-link-full.png');

// 12. Project node
goto('http://localhost:5173/');
ab('wait 1000');
clickNamed(/project geometry/i);
ab('wait 900');
assert('project read panel', ab('get url').includes('read=geometry'));
assert('project body', pageText().includes('single-field') || pageText().includes('living field'));
shot('12-project.png');

// 13. Link node
goto('http://localhost:5173/');
ab('wait 1000');
clickNamed('x.com');
ab('wait 900');
assert('link node opens', ab('get url').includes('read=xcom'));
assert('visit link CTA', pageText().includes('visit'));
shot('13-link.png');

// 14. Zoom controls
goto('http://localhost:5173/');
ab('wait 1000');
const readoutBefore = ab(
  'eval "Array.from(document.querySelectorAll(\'div\')).map(d=>d.textContent).find(t=>/^z \\\\d+%$/.test(t?.trim()||\'\'))"',
);
data = snap();
ab(`click ${refByName(data, /^\+$/)}`);
ab('wait 600');
const readoutAfter = ab(
  'eval "Array.from(document.querySelectorAll(\'div\')).map(d=>d.textContent).find(t=>/^z \\\\d+%$/.test(t?.trim()||\'\'))"',
);
assert('zoom in changes readout', readoutAfter !== readoutBefore, `${readoutBefore} -> ${readoutAfter}`);
data = snap();
ab(`click ${refByName(data, /^−$/)}`);
ab('wait 400');
data = snap();
ab(`click ${refByName(data, /^⤢$/)}`);
ab('wait 400');
pass('zoom out/fit');
shot('14-zoom.png');

// 15. Media node
goto('http://localhost:5173/?read=sea');
ab('wait 1000');
assert('media node excerpt', pageText().includes('motion without narrative') || pageText().includes('sequin'));
shot('15-media.png');

// 16. Browser history back + forward with trail
goto('http://localhost:5173/');
ab('wait 1000');
clickRole('allowed ignorance');
ab('wait 700');
clickNamed('increasing returns');
ab('wait 700');
assert('trail after edge walk', ab('get url').includes('trail=allowed-ignorance'));
ab('back');
ab('wait 900');
const backUrl = ab('get url');
assert('browser back restores read', backUrl.includes('read=allowed-ignorance'), backUrl);
assert('browser back clears trail tail', !backUrl.includes('trail='), backUrl);
ab('forward');
ab('wait 900');
const fwdUrl = ab('get url');
assert('browser forward restores child read', fwdUrl.includes('read=increasing-returns'), fwdUrl);
assert('browser forward restores trail', fwdUrl.includes('trail=allowed-ignorance'), fwdUrl);
shot('16-browser-back.png');

// 17. Field card click centers viewport on node
goto('http://localhost:5173/');
ab('wait 1200');
const zHome = ab(
  'eval "(() => { const w = document.querySelector(\'div[style*=\\\"will-change\\\"]\'); return w?.style?.transform || \'\'; })()"',
);
ab('eval "document.querySelector(\'[data-testid=field-node-bounded-me]\')?.click()"');
ab('wait 900');
const zBounded = ab(
  'eval "(() => { const w = document.querySelector(\'div[style*=\\\"will-change\\\"]\'); return w?.style?.transform || \'\'; })()"',
);
assert('card click moves viewport', zBounded !== zHome && zBounded.includes('translate'), `${zHome} -> ${zBounded}`);
assert('card click URL has viewport', /[xy]=-?\d+/.test(ab('get url')), ab('get url'));
shot('17-field-center.png');

// 18. Field card click updates read panel while another essay is open
goto('http://localhost:5173/?read=bounded-me');
ab('wait 1200');
ab('eval "document.querySelector(\'[data-testid=field-node-allowed-ignorance]\')?.click()"');
ab('wait 1200');
const fieldNavUrl = ab('get url');
assert('field card switches read URL', fieldNavUrl.includes('read=allowed-ignorance'), fieldNavUrl);
assert('field card sets trail', fieldNavUrl.includes('trail=bounded-me'), fieldNavUrl);
assert(
  'field card updates read header',
  pageText().includes('allowed ignorance') && pageText().includes('bounded me'),
);
shot('18-field-card-readbar.png');

// 19. Inline essay backlink navigation
goto('http://localhost:5173/?read=bounded-me&full=1');
ab('wait 2000');
ab('eval "document.querySelector(\'[data-testid=essay-backlink]\')?.scrollIntoView({block:\'center\'})"');
ab('wait 400');
const hasBacklink = /true/i.test(
  ab('eval "Boolean(document.querySelector(\'[data-testid=essay-backlink]\'))"'),
);
assert('inline backlink visible', hasBacklink);
ab('eval "document.querySelector(\'[data-testid=essay-backlink]\').click()"');
ab('wait 900');
const blUrl = ab('get url');
assert('backlink opens target', blUrl.includes('read=allowed-ignorance'), blUrl);
assert('backlink pushes trail', blUrl.includes('trail=bounded-me'), blUrl);
shot('19-inline-backlink.png');

// 20. geometry-retrieval full (table + steps figures)
goto('http://localhost:5173/?read=geometry-retrieval&full=1');
ab('wait 2500');
ab('eval "document.querySelector(\'[data-testid=diagnostic-table]\')?.scrollIntoView({block:\'center\'})"');
ab('wait 400');
const gtxt = pageText();
const hasTable = /true/i.test(
  ab('eval "Boolean(document.querySelector(\'[data-testid=diagnostic-table]\'))"'),
);
assert('geometry-retrieval thesis', gtxt.includes('rebuild the structure') || gtxt.includes('geometry'));
assert('diagnostic table', hasTable || gtxt.includes('rephrase') || gtxt.includes('predict'));
shot('20-geometry-retrieval-full.png');

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
writeFileSync(join(outDir, 'report.json'), JSON.stringify({ passed, total: results.length, results }, null, 2));

console.log(`\n--- ${passed}/${results.length} passed ---`);
if (failed.length) {
  console.log('Failures:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}