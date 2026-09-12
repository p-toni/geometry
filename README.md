# geometry

`geometry` now has two coupled systems:

1. **fieldwork/** — the research substrate. It is intentionally broader than the thesis and is governed by the anti-collapse protocol.
2. **content/** + **src/** — the publication surface at toni.ltd. Essays are outputs of fieldwork, not the ontology that organizes it.

The separation is deliberate: research should be able to break the current Geometry thesis without first passing through Geometry vocabulary.

## Fieldwork

Start at [`fieldwork/README.md`](./fieldwork/README.md).

The operating rule is:

> Attraction chooses where to look.  
> Native understanding comes before translation.  
> Difference decides what deserves attention.  
> Contact decides what survives.

Current state lives in [`fieldwork/index.yml`](./fieldwork/index.yml). The frozen starting thesis lives in [`fieldwork/seed.md`](./fieldwork/seed.md).

Research moves through:

`seed → divergence → native pass → stress → collision → probe → source-closed synthesis → revision`

Published writing in `content/writing/` is not edited merely because a new source sounds adjacent. A research round must first show displacement: a distinction, contradiction, prediction, intervention, or failure mode that changes the map.

## Site quick start

```bash
pnpm install
pnpm pool:build   # compile content/*.md → pool.json
pnpm dev          # http://localhost:5173
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local dev server |
| `pnpm pool:build` | Rebuild `public/pool.json` after content edits |
| `pnpm test` | Vitest unit tests |
| `pnpm test:browser` | agent-browser smoke test (needs `pnpm dev` running) |
| `pnpm lint` | oxlint — baseline is zero warnings |
| `pnpm typecheck` | TypeScript |
| `pnpm build` | Production static export → `dist/` |
| `pnpm preview` | Preview production build |

## Publication architecture

- **Content:** `content/{cluster}/{id}.md`
- **Home:** `src/home/next/NextHome.tsx`
- **Reader:** `src/essaySystem/`
- **Routes:** `/`, `/read/:id`, `/essay-system`
- **Design tokens:** `src/design/tokens.css`
- **Pool placement:** `src/pool/field.ts`

See [`AGENTS.md`](./AGENTS.md) for both research and publication rules.

## Deploy

```bash
pnpm build
pnpm deploy
```

Cloudflare Pages serves `dist/`.