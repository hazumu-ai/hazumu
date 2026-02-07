# 環境変数と設定

- `OLLAMA_BASE_URL` — Ollama サーバーの URL（例: `http://ollama:11434`）。未設定ならローカルデフォルトを使用。
- `OLLAMA_MODEL` — デフォルトのモデル ID。未設定なら `gemma3`。
- `MCP_SERVER_URL` — MCP サーバーの URL（例: `http://hazumu:8000/mcp`）。設定すると、LLM が MCP ツール（LED 点滅など）を使用できるようになります。未設定なら MCP 機能は無効。
- ポート: 現状 3000 固定（`serve` で指定）。

実装上の主要ファイル:

- Ollama 設定: `apps/ml-gateway/src/ollama.ts`
- MCP クライアント: `apps/ml-gateway/src/mcp-client.ts`
- MCP ツールアダプター: `apps/ml-gateway/src/mcp-tools-adapter.ts`
- スキーマ: `apps/ml-gateway/src/schemas/chat.ts`
- ルート: `apps/ml-gateway/src/routes/chat.ts`
