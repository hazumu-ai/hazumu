# hazumu

愛玩ロボット「はずむAIくん」- 音声・映像入力を通じて人間と自然にインタラクションできるAIロボット

## クイックスタート

### LLM推論バックエンドの起動

```bash
# miseを使用する場合
mise run up

# Docker Composeを直接使用する場合
docker compose -f infra/docker/compose.yml up -d
```

### アクセス

- **Ollama (LLM推論)**: http://localhost:11434
- **Grafana (監視ダッシュボード)**: http://localhost:3000 (admin/admin)
- **Prometheus (メトリクス)**: http://localhost:9090

## ドキュメント

- [プロジェクト概要](./docs/overview.md)
- [インフラ構成](./docs/infra/architecture.md)
- [セットアップ手順](./docs/infra/setup.md)
- [ポート一覧](./docs/infra/ports.md)

## プロジェクト構成

```
hazumu/
├── .mise.toml              # タスク定義
├── docs/                   # ドキュメント
│   ├── overview.md        # プロジェクト概要
│   └── infra/             # インフラドキュメント
└── infra/                 # インフラ構成
    ├── docker/            # Docker Compose設定
    └── monitor/           # 監視設定 (Prometheus, Grafana)
```

## ライセンス

MIT License
