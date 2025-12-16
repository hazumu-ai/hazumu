## Purpose
Hazumu AI is a pet robot project (“hazumu AI-kun”) that interacts naturally with humans via audio/video input. The repo is a monorepo (currently only `app/gateway`) plus infra/docs.

## Architecture/Components
- Robot side (Raspberry Pi): camera/mic/motor control and an MCP server interface (per docs/overview).
- Inference server: connects to robot over WebSocket, performs emotion analysis and action decisions.
- Current code: `app/gateway` is a Hono-based Node/TypeScript web service meant to sit between models and the robot. Infra uses Docker Compose to run Ollama LLM (`infra/docker/compose.yml`) and the gateway container.

## Stack
- Node.js + TypeScript (ESNext, NodeNext modules), strict TS config.
- Framework/libs: Hono (`@hono/node-server`, `hono`), `ai`, `ollama-ai-provider-v2`.
- Tooling: pnpm via corepack, tsx for dev, tsc build, distroless runtime image in Dockerfile.
- Infra: Docker Compose for Ollama + gateway.
- CI: GitHub Actions workflows `docker.yaml` (build/push Docker per app) and `docs.yaml` (markdownlint for docs/README).

## Repo Layout
- `app/gateway`: service code, Dockerfile, pnpm lock, tsconfig, src/index.ts (simple Hono server returning Hello Hono!).
- `infra/docker/compose.yml`: Ollama + gateway services.
- `docs/`: overview and development guide, plus architecture diagram in assets.
- Root tooling: `.mise.toml` defining docker compose tasks; README links to docs and quickstart.

## Entry points
- Gateway runtime: `pnpm dev` (tsx watch), `pnpm build` then `pnpm start` (node dist/index.js) inside `app/gateway`. Dockerfile runs `dist/index.js` on port 3000.
- Local stack: `mise run up` to start docker compose (Ollama + gateway); `mise run down` to stop.