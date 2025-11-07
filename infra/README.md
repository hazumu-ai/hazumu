# Hazumu Infrastructure

LLM推論バックエンド（Ollama）と監視スタックの構成ファイルです。

## ディレクトリ構成

```
infra/
├── docker/
│   └── compose.yml          # Docker Compose設定
└── monitor/
    ├── prometheus/
    │   ├── prometheus.yml   # Prometheus設定
    │   └── blackbox.yml     # Blackbox Exporter設定
    └── grafana/
        └── provisioning/
            ├── datasources/ # Grafanaデータソース自動登録
            │   └── datasource.yml
            └── dashboards/  # Grafanaダッシュボード
                ├── dashboard-provider.yml
                └── ollama-dashboard.json
```

## クイックスタート

```bash
# 全サービスの起動
mise run up

# 状態確認
mise run ps

# ログ確認
mise run logs

# 停止
mise run down
```

## ドキュメント

詳細な情報は[docs/infra/](../docs/infra/)を参照してください：

- [architecture.md](../docs/infra/architecture.md) - システム構成の説明
- [setup.md](../docs/infra/setup.md) - セットアップと運用手順
- [ports.md](../docs/infra/ports.md) - ポート一覧とネットワーク設定

## サービス一覧

| サービス | ポート | 説明 |
|---------|--------|------|
| Ollama | 11434 | LLM推論サーバー |
| Prometheus | 9090 | メトリクス収集 |
| Grafana | 3000 | 可視化ダッシュボード |
| cAdvisor | 8080 | コンテナリソース監視 |
| Blackbox Exporter | 9115 | エンドポイント監視 |

## 設定のカスタマイズ

### Prometheusのスクレイプ間隔変更

`infra/monitor/prometheus/prometheus.yml`を編集：

```yaml
global:
  scrape_interval: 15s  # この値を変更
```

### Grafanaダッシュボード追加

1. Grafana UIで新しいダッシュボードを作成
2. JSON形式でエクスポート
3. `infra/monitor/grafana/provisioning/dashboards/`に配置
4. Grafanaを再起動

### Ollamaのポート変更

`infra/docker/compose.yml`を編集：

```yaml
services:
  ollama:
    ports:
      - "11434:11434"  # 左側を変更
```

## トラブルシューティング

### サービスが起動しない

```bash
# ログ確認
docker compose -f infra/docker/compose.yml logs <service-name>

# コンテナ状態確認
docker compose -f infra/docker/compose.yml ps -a
```

### Prometheusがメトリクスを取得できない

http://localhost:9090/targets で各ターゲットの状態を確認

### ポート競合

```bash
# 使用中のポート確認
lsof -i :<port-number>

# または
netstat -tulpn | grep <port-number>
```

## 本番環境での考慮事項

- Grafanaのデフォルトパスワードを変更
- TLS/SSL証明書の設定
- 適切なファイアウォール設定
- バックアップ戦略の実装
- リソース制限の設定（CPU、メモリ）
