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

## GET /doc

- OpenAPI ドキュメント（@hono/zod-openapi）。
