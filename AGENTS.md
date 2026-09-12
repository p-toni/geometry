# geometry — operating guide

This repository contains two coupled but deliberately distinct systems:

- `fieldwork/` is the research system.
- `content/` + `src/` are the publication system.

Do not let the publication thesis organize the research search space. Fieldwork may revise or break Geometry; Geometry does not get to pre-filter fieldwork.

## Mode 1 — fieldwork

Read `fieldwork/README.md`, `fieldwork/seed.md`, and `fieldwork/index.yml` before researching.

The anti-collapse protocol is binding:

1. **Freeze the seed.** Do not edit the current thesis during divergence.
2. **Diverge in native coordinates.** Maintain adjacent, rival, hostile, and alien branches. A branch should be phrased in the vocabulary of its own domain, not ours.
3. **Native pass before translation.** A source card must state what the source says, what evidence it gives, what it assumes, and what it does not establish before any Geometry interpretation appears.
4. **Stress internally.** Give every serious source at least one rival reading or failure condition.
5. **Privilege collisions over accumulation.** Similar vocabulary is not evidence. A collision matters when independent lines force a new distinction, contradiction, prediction, intervention, or failure diagnosis.
6. **Contact before canon.** Central claims need a path by which something outside the map can answer: experiment, proof, formal constraint, historical check, build, behavior, consequence, or another explicit probe.
7. **Synthesize source-closed first.** At the end of a round, reconstruct what changed without looking at the sources. Then reopen them and correct provenance.
8. **Preserve unresolved alternatives.** Do not invent a sentence that makes incompatible frameworks agree.

### Fieldwork file roles

```text
fieldwork/
  seed.md                 frozen starting state for the current round
  index.yml               small machine-readable research state
  branches/               question-spaces, each with a native vocabulary
  sources/                provenance cards, one source per file
  collisions/             where independent branches genuinely interact
  probes/                 ways for the world/formal system/history to answer
  synthesis/              periodic source-closed reconstructions
  templates/              schemas; keep them weak
```

### What counts as displacement

A source changes the map only if it does at least one of these:

- creates a distinction we did not have;
- contradicts or weakens an existing edge;
- generates a prediction or discriminating consequence;
- suggests an intervention or probe;
- explains a live anomaly better than a competitor;
- exposes an assumption that was previously invisible.

Otherwise record it and move on.

### Failure conditions

Stop and correct course if research starts to do any of the following:

- searching mainly for `geometry`, `invariants`, `interfaces`, `boundedness`, or other thesis vocabulary;
- translating a source into our language before it has a native account;
- counting semantic resemblance as support;
- making every branch converge on the same ontology;
- adding a published essay because a new source feels exciting;
- using the archive as a substitute for reconstruction.

For autonomous research, use `.agents/skills/anti-collapse-research/SKILL.md`.

---

## Mode 2 — publication

The site is a thesis you can operate, fed by a Markdown content pool. A build step compiles content into `public/pool.json` and `src/pool/generated.ts`.

### Workflow

```bash
pnpm pool:build   # required after any content edit
pnpm dev
pnpm test
pnpm test:browser # needs pnpm dev running
pnpm lint
pnpm build        # pool:build + typecheck + static export + seo
```

### Content layout

```text
content/{cluster}/{id}.md
```

Clusters: `writing` | `work` | `play` | `you`.

The `id` is kebab-case and must match a key in `src/pool/field.ts` `positions`. Do not add `pos` to frontmatter.

Typical frontmatter:

```yaml
---
id: allowed-ignorance
kind: essay
cluster: writing
title: allowed ignorance
date: 2026-07-28
rank: 0
excerpt:
  - "One-line thesis or hook."
links:
  - target: increasing-returns
    rel: cites
struct:
  lens: "understanding after the right omissions"
---
```

### Body → blocks

The Markdown body is parsed by `src/lib/parseBlocks.ts` and recast by `src/essaySystem/essayModel.ts`.

- `## Heading` → section
- plain paragraph → prose
- `> thesis: …` / `> **…**` → claim
- `> [aside|honesty|update] …` → callout
- `![caption](src)` → plate
- `:::contrast a | b` → comparison
- typed table → edge taxonomy
- numbered list → ladder
- `:::diagram` → diagram
- `<!-- block:motif -->` → motif
- `> pull: …` → pull quote
- `[[Title|id]]` → summoned reference

Essay chrome is rendered by `EssayReader`; do not repeat `# Title` in the body.

### Publication rules

- Edit atoms, not JSX. Never add MDX or React to content files.
- After editing `content/**/*.md` or `src/pool/field.ts`, run `pnpm pool:build`.
- New nodes require both a content file and `positions[id]` in `src/pool/field.ts`.
- Keep directed links within the relation types in `src/pool/types.ts`.
- Research notes do not belong in `content/writing/` until a synthesis round explicitly promotes them.

Anything deliberately local and untracked remains under `_local/`.