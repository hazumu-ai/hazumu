## Code style
- Follow language formatter defaults (per docs/development_guide). Run the formatter for each language before committing. Keep coupling low, follow DRY and general best practices.
- Prefer explicit typing; avoid `Any`/untyped code unless justified.
- Write tests where possible using each language’s test framework; aim to cover condition branches.

## Commits/branches
- Use Conventional Commits (e.g., `feat: add xxx`). PR titles must also follow it. GitHub Flow from `main`, create issues, self-review, ensure CI passes before merge.

## Docs
- Update `docs/` and related README files to match code changes. Markdown is linted in CI via markdownlint.

## Behavior expectations
- Maintain respectful, collaborative communication (developer code of conduct).