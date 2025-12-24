# 環境変数と設定

- `OLLAMA_BASE_URL` — Ollama サーバーの URL（例: `http://ollama:11434`）。未設定ならローカルデフォルトを使用。
- `OLLAMA_MODEL` — デフォルトのモデル ID。未設定なら `gemma3`。
- `DATABASE_URL` — PostgreSQL データベース接続 URL（例: `postgresql://user:password@host:5432/database`）。ロギング機能に必須。
- ポート: 現状 3000 固定（`serve` で指定）。

実装上の主要ファイル:

- Ollama 設定: `apps/ml-gateway/src/ollama.ts`
- スキーマ: `apps/ml-gateway/src/schemas/chat.ts`
- ルート: `apps/ml-gateway/src/routes/chat.ts`
- データベース: `apps/ml-gateway/src/db.ts`
- Prisma スキーマ: `apps/ml-gateway/prisma/schema.prisma`
