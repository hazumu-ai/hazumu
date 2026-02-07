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
- MCP SDK (`@modelcontextprotocol/sdk`) — Model Context Protocol クライアント
- OpenAPI は `/doc` から参照可能

## MCP サーバーとの連携

MCP（Model Context Protocol）サーバーに接続することで、LLM がツール（LED 制御など）を使用できます。

**環境変数設定:**
```bash
export MCP_SERVER_URL=http://hazumu:8000/mcp
pnpm dev
```

**Docker Compose での実行:**
```bash
# infra/docker ディレクトリから
MCP_SERVER_URL=http://hazumu:8000/mcp docker compose up
```

MCP サーバーが利用可能な場合、ゲートウェイは起動時に自動的に接続し、利用可能なツールをロードします。接続に失敗した場合は警告を表示し、MCP なしで動作を継続します。
