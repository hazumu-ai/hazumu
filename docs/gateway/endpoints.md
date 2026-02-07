# エンドポイント

## GET /

- 内容: シンプルなヘルス応答 (`Hello Hono!`)

## POST /api/chat

- Request (JSON):
  - `prompt` (string, required) — 生成したいプロンプト
  - `model` (string, optional) — 使用するモデル ID。省略時は `OLLAMA_MODEL` または `gemma3`
- Response: `{ "text": string }`
- エラー:
  - 400: Zod / OpenAPI バリデーションエラー
  - 500: 推論処理中の内部エラー

**MCP ツール対応:**  
環境変数 `MCP_SERVER_URL` が設定されている場合、LLM は自動的に MCP サーバーのツール（例: `robot-mcp` の LED 点滅機能）にアクセスできます。プロンプトに応じて、LLM が適切なツールを呼び出します。

例:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "LEDを5回点滅させて"}'
```

## GET /doc

- OpenAPI ドキュメント（@hono/zod-openapi）。
