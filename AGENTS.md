# geometry — agent authoring guide

This site is a single hand-placed field. Content lives as markdown files with YAML frontmatter. A build step compiles them into `public/pool.json` and `src/pool/generated.ts`.

## Workflow

```bash
pnpm pool:seed    # optional: re-seed from geometry v1 prose
pnpm pool:build   # required after any content edit
pnpm dev          # local preview
pnpm test         # vitest
pnpm build        # pool:build + typecheck + static export
```

## File layout

```
content/{cluster}/{id}.md
```

- **cluster:** `writing` | `work` | `play` | `you`
- **id:** kebab-case slug; must match a key in `src/pool/field.ts` `positions`

## Frontmatter schema

```yaml
---
id: allowed-ignorance
kind: essay          # essay | note | project | doc | shader | voxel | sharp | link | about
cluster: writing
title: allowed ignorance
date: today
rank: 0              # 0 = freshest; affects Now lens height
excerpt:             # optional; auto-derived from first paragraphs if omitted
  - "One-line thesis or hook."
links:
  - target: increasing-returns
    rel: cites       # see Rel type in src/pool/types.ts
struct:              # optional; powers constellation descent
  lens: "understanding after the right omissions"
  sections:
    - label: Thesis
      concepts: ["allowed cuts", "omission"]
href: https://…      # link nodes only
media: true          # play nodes with render placeholders
---
```

**Do not** add `pos` to frontmatter — coordinates are authored once in `src/pool/field.ts`.

## Body → Blocks → Figures

The markdown body (below `---`) is parsed by `src/lib/parseBlocks.ts` into typed `Block[]` atoms. Each block maps 1:1 to a Figure component (FIG.01–12).

| Markdown | Block type | Figure |
|----------|------------|--------|
| `## Heading` | `h` | — |
| plain paragraph | `p` | — |
| `> thesis: …` or `> **…**` | `thesis` | Thesis |
| `> [aside\|honesty\|update] …` | `callout` | Callout |
| `[[sidenote:anchor\|text]]` | `sidenote` | Sidenote |
| `![caption](src)` | `plate` | Plate |
| `\| table \|` (generic) | `table` | DiagnosticTable |
| `\| type \| force \|` table | `edge-taxonomy` | EdgeTaxonomy |
| `1. step` list | `steps` | ProtocolStepper |
| `<!-- block:motif -->` | `motif` | LateFailure |
| `<!-- block:point-edge -->` | `point-edge` | PointEdge |
| `<!-- block:curvature -->` | `curvature` | Curvature |
| `[[backlink:title\|rel\|targetId]]` | `backlink` | Backlink |

Full essay chrome (title, date, cluster) is rendered by **Masthead** in `ReadPanel` — do not repeat `# Title` in the body. `FigureReader` renders body blocks only.

## Reading modes

1. **Excerpt** — `excerpt` frontmatter or first two `p` blocks
2. **Full** — entire `body` via `FigureReader` (URL `?full=1`)
3. **Constellation** — `struct` frontmatter sections; fallback to curated map in `essayStructure.ts`

## Rules for agents

- Edit atoms, not JSX. Never add MDX or React in content files.
- After editing any `content/**/*.md` or `src/pool/field.ts`, run `pnpm pool:build`.
- New nodes require both a content file **and** a hand-placed `positions[id]` entry.
- Use `[[backlink:…]]` for in-essay navigation to other pool nodes.
- Keep links directed and use only relations from `Rel` in `src/pool/types.ts`.
- `struct` is the source of truth for constellation descent until embeddings land.

## Retired (v1)

- MDX essays under `/essays/`
- `bodyPath`, per-canvas JSON, zustand canvas store
- v1 widget components