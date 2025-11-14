# hazumu

愛玩ロボット「はずむAIくん」

## クイックスタート

### LLM推論バックエンドの起動

```bash
# miseを使用する場合
mise run up

# Docker Composeを直接使用する場合
docker compose -f infra/docker/compose.yml up -d
```

## ドキュメント

- [プロジェクト概要](./docs/overview.md)
- [インフラ](./docs/infra/)

## プロジェクト構成

```bash
hazumu/
├── .mise.toml              # タスク定義
├── docs/                   # ドキュメント
│   ├── overview.md        # プロジェクト概要
│   └── infra/             # インフラドキュメント
└── infra/                 # インフラ構成
    ├── docker/            # Docker Compose設定
    └── monitor/           # 監視設定 (Prometheus, Grafana)
```
