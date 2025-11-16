# hazumu

愛玩ロボット「はずむAIくん」

## クイックスタート

[mise](https://mise.jdx.dev/)が必要です。

### バックエンドの起動

```bash
mise run up
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
