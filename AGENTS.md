# Repository Guidelines

## Project Structure & Module Organization

- Monorepo root with `apps/` for components; current service lives in `apps/ml-gateway` (Hono-based LLM gateway bridging models and the robot MCP).  
- `docs/` holds project, gateway, and ops docs; update relevant pages when behavior changes.  
- `infra/docker/compose.yml` defines the local stack (Ollama + gateway). `.mise.toml` exposes helper tasks.  
- Source layout under `apps/ml-gateway/src`: `index.ts` entrypoint, `routes/` (HTTP), `schemas/` (Zod/OpenAPI), `ollama.ts` (model client). Tests sit next to code as `*.test.ts`.

## Build, Test, and Development Commands

- Ensure Node LTS and pnpm via corepack (`corepack enable && pnpm install` inside `apps/ml-gateway`).  
- Local dev: `pnpm dev` (tsx watch on port 3000).  
- Build: `pnpm build` (tsc to `dist/`); run with `pnpm start`.  
- Quality: `pnpm biome` (Biome lint/format check).  
- Tests: `pnpm test` or `pnpm test -- --coverage` (Vitest + v8 coverage, model mocked).  
- Stack with Ollama: from repo root `mise run up` to start compose; `mise run down` to stop; `mise run logs` for tails.

## Coding Style & Naming Conventions

- TypeScript `strict` + `NodeNext`; prefer explicit types and avoid `any`.  
- Follow Biome defaults for formatting; do not hand-tune spacing/quotes.  
- File names use kebab/flat (`chat.ts`, `chat.test.ts`); exports should be descriptive (`createChatRoute`, not `run`).  
- Keep modules small and route handlers pure; centralize model wiring in `ollama.ts`.

## Testing Guidelines

- Framework: Vitest; place tests alongside implementations as `*.test.ts`.  
- Mock external LLM calls (see existing chat route tests with `MockLanguageModelV2`).  
- Aim to cover validation branches and error paths; keep coverage green with `pnpm test -- --coverage`.

## Commit & Pull Request Guidelines

- Use Conventional Commits and mirror in PR titles (`feat: add chat streaming`, `fix: handle empty prompt`).  
- Work from `main` via GitHub Flow; open/assign an issue before starting.  
- Before PR: run `pnpm biome`, `pnpm test`, and build if relevant; include summary, linked issue, and notes on tests/coverage.  
- Update docs under `docs/` or `docs/gateway/` when changing endpoints, config, or ops steps; attach screenshots or curl examples for API-visible changes.

## Security & Configuration Tips

- Do not commit secrets; rely on env vars (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `NO_PROXY`).  
- Default dev port is `3000`; Ollama runs on `11434`. Keep compose volumes (`ollama_data`) persistent unless intentionally reset.
