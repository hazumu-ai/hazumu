## Before publishing changes
- Run format/build/tests relevant to touched areas: for gateway run `pnpm build` and any added tests; for docs run markdownlint if changed.
- If using Docker, ensure `docker compose -f infra/docker/compose.yml up -d` works or note issues.
- Verify services start (`pnpm start` or `pnpm dev` for gateway) and endpoints respond as expected.
- Update docs/README if behavior, commands, or setup changed.
- Prepare Conventional Commit message and PR title; perform self-review ensuring CI (docker builds/docs lint) will pass.