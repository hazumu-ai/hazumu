# hazumu

愛玩ロボット「はずむAIくん」

## クイックスタート

### Ollamaの起動

```bash
# miseを使用する場合
mise run up

# Docker Composeを直接使用する場合
docker compose -f infra/docker/compose.yml up -d
```

### Ollamaへのアクセス

Ollamaは `http://localhost:11434` でアクセスできます。

```bash
# ヘルスチェック
curl http://localhost:11434/

# モデルのダウンロード例
docker exec -it hazumu-ollama ollama pull llama2

# モデルの実行例
docker exec -it hazumu-ollama ollama run llama2
```

## ドキュメント

- [プロジェクト概要](./docs/overview.md)
- [開発者ガイド](./docs/development_guide.md)

## プロジェクト構成

```bash
hazumu/
├── .mise.toml              # タスク定義
├── docs/                   # ドキュメント
│   ├── overview.md        # プロジェクト概要
│   └── development_guide.md # 開発者ガイド
└── infra/                 # インフラ構成
    └── docker/            # Docker Compose設定
```
