# 開発・運用コマンド

`apps/ml-gateway` での主なコマンド:

```bash
pnpm dev          # 開発サーバー (tsx watch)
pnpm build        # tsc ビルド
pnpm start        # dist/index.js 実行
pnpm biome        # Biome lint/format チェック
pnpm test         # Vitest
```

テスト:

- `vitest` を使用し、推論部分は `MockLanguageModelV2` でモック済み。
- カバレッジは v8 ベース（`pnpm test -- --coverage`）。

フレームワーク/スタック:

- Hono + @hono/zod-openapi
- AI SDK + `ollama-ai-provider-v2`
- OpenAPI は `/doc` から参照可能
