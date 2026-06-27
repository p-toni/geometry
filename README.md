# geometry

toni.ltd as a single living field — hand-placed nodes, lens search, read panel, constellation descent.

## Quick start

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
| `pnpm pool:migrate` | Re-seed all content from v1 MDX (one-time / recovery) |
| `pnpm test` | Vitest unit tests |
| `pnpm typecheck` | TypeScript |
| `pnpm build` | Production static export → `dist/` |
| `pnpm preview` | Preview production build |

## Authoring

See [AGENTS.md](./AGENTS.md) for the content schema, block types, and figure registry.

- **Content:** `content/{cluster}/{id}.md` with YAML frontmatter
- **Positions:** `src/pool/field.ts` (hand-placed coordinates)
- **Build:** `scripts/buildPool.ts` → `public/pool.json` + `src/pool/generated.ts`

## Deploy

Static Vite build. Any static host works:

```bash
pnpm build
# serve dist/
```

`vercel.json` is included for zero-config deploy.

## Architecture

- React 19 + Vite + TypeScript, single route `/`
- URL state: `?read=`, `?full=1`, `?q=`, `?now=1`, viewport `x/y/z`
- Essay bodies: markdown → typed `Block[]` → twelve Figure components
- Constellation: `struct` frontmatter sections → radial descent overlay

v1 (grid canvas + MDX widgets) is retired. Historical spec lives in the `spec-v1` node.