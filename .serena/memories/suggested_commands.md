## Tooling
- Enable pnpm via corepack if needed: `corepack enable && corepack prepare pnpm@9.x --activate`.
- Use mise tasks (requires `mise`):
  - `mise run up` / `mise run down` / `mise run logs` / `mise run ps` / `mise run restart` (wrap docker compose at infra/docker/compose.yml).
- Docker compose directly: `docker compose -f infra/docker/compose.yml up -d` (or `down`).

## Gateway app (app/gateway)
- Install deps: `pnpm install --frozen-lockfile` (pnpm 9).
- Dev server: `pnpm dev` (tsx watch src/index.ts, serves on port 3000).
- Build: `pnpm build` (tsc -> dist).
- Start production build: `pnpm start` (node dist/index.js).

## CI checks to mirror locally
- Docs markdown lint (CI): `npx markdownlint-cli2 "docs/**/*.md" "**/README.md"` if adjusting docs/README.
- Docker images built via GitHub Actions `docker.yaml` per app (context `app/<name>`).