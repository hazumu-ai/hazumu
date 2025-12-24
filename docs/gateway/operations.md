# 開発・運用コマンド

`apps/ml-gateway` での主なコマンド:

```bash
pnpm dev          # 開発サーバー (tsx watch)
pnpm build        # tsc ビルド
pnpm start        # dist/index.js 実行
pnpm biome        # Biome lint/format チェック
pnpm test         # Vitest
```

Prisma / データベース:

```bash
pnpm prisma:generate  # Prisma クライアントを生成
pnpm prisma:migrate   # マイグレーションを実行 (開発時)
pnpm prisma:studio    # Prisma Studio を起動 (データベース GUI)
```

テスト:

- `vitest` を使用し、推論部分は `MockLanguageModelV2` でモック済み。
- データベース接続はテスト時にモック。
- カバレッジは v8 ベース（`pnpm test -- --coverage`）。

フレームワーク/スタック:

- Hono + @hono/zod-openapi
- AI SDK + `ollama-ai-provider-v2`
- Prisma + PostgreSQL (ロギング用)
- OpenAPI は `/doc` から参照可能
