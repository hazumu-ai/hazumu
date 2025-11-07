# セットアップ手順

## 前提条件

- Docker Engine (20.10以降)
- Docker Compose V2
- mise (タスクランナー)

### Dockerのインストール確認

```bash
docker --version
docker compose version
```

### miseのインストール

miseがインストールされていない場合：

```bash
# Linuxの場合
curl https://mise.run | sh

# macOSの場合 (Homebrew)
brew install mise
```

## 起動手順

### 1. 環境の起動

プロジェクトルートで以下のコマンドを実行：

```bash
mise run up
```

このコマンドは以下を実行します：
- すべてのサービスをバックグラウンドで起動
- 必要なDockerボリュームの作成
- ネットワークの構成

### 2. サービスの確認

起動したサービスの状態を確認：

```bash
mise run ps
```

すべてのサービスが`running`状態であることを確認してください。

### 3. ログの確認

サービスのログをリアルタイムで確認：

```bash
mise run logs
```

特定のサービスのログのみを表示する場合：

```bash
docker compose -f infra/docker/compose.yml logs -f ollama
docker compose -f infra/docker/compose.yml logs -f prometheus
```

## サービスへのアクセス

各サービスは以下のURLでアクセスできます：

| サービス | URL | 用途 |
|---------|-----|------|
| Ollama | http://localhost:11434 | LLM推論API |
| Prometheus | http://localhost:9090 | メトリクス確認 |
| Grafana | http://localhost:3000 | ダッシュボード |
| cAdvisor | http://localhost:8080 | コンテナ統計 |
| Blackbox Exporter | http://localhost:9115 | エンドポイント監視 |

### Grafanaへのログイン

1. ブラウザで http://localhost:3000 を開く
2. 以下の認証情報でログイン：
   - ユーザー名: `admin`
   - パスワード: `admin`
3. 初回ログイン時、新しいパスワードの設定を求められます（スキップ可能）

### ダッシュボードの確認

1. Grafanaにログイン後、左メニューから「Dashboards」を選択
2. 「Hazumu Ollama Monitoring」ダッシュボードを開く
3. 以下のメトリクスが表示されます：
   - CPU使用率
   - メモリ使用量
   - ヘルスステータス
   - レスポンスタイム
   - ネットワークI/O

## Ollamaモデルの管理

### モデルのダウンロード

Ollamaコンテナ内でモデルをダウンロード：

```bash
# 例：Llama 2モデルをダウンロード
docker exec -it hazumu-ollama ollama pull llama2

# 例：Mistralモデルをダウンロード
docker exec -it hazumu-ollama ollama pull mistral
```

### モデルの確認

ダウンロード済みモデルの一覧を表示：

```bash
docker exec -it hazumu-ollama ollama list
```

### モデルの実行テスト

```bash
# インタラクティブモード
docker exec -it hazumu-ollama ollama run llama2

# API経由でテスト
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

## Prometheusでのメトリクス確認

1. http://localhost:9090 にアクセス
2. クエリ例：
   ```promql
   # Ollamaのヘルスチェック
   probe_success{job="ollama-health"}
   
   # CPU使用率
   rate(container_cpu_usage_seconds_total{name="hazumu-ollama"}[5m])
   
   # メモリ使用量
   container_memory_usage_bytes{name="hazumu-ollama"}
   ```
3. 「Graph」タブで時系列データを可視化

## サービスの停止・再起動

### サービスの停止

```bash
mise run down
```

これにより全サービスが停止し、コンテナが削除されます。
※ ボリュームデータは保持されます

### サービスの再起動

```bash
mise run restart
```

実行中のサービスを再起動します。

### 特定のサービスのみ再起動

```bash
docker compose -f infra/docker/compose.yml restart ollama
```

## データの完全削除

すべてのデータ（モデル、メトリクス、ダッシュボード設定）を削除する場合：

```bash
mise run down
docker volume rm hazumu_ollama_data hazumu_prometheus_data hazumu_grafana_data
```

⚠️ **警告**: この操作は元に戻せません。

## トラブルシューティング

### ポート競合

別のサービスがポートを使用している場合、`infra/docker/compose.yml`でポート番号を変更できます。

### コンテナの起動失敗

```bash
# ログを確認
mise run logs

# 特定のサービスの詳細確認
docker compose -f infra/docker/compose.yml logs ollama

# コンテナの状態確認
docker ps -a
```

### Prometheusがメトリクスを取得できない

1. Prometheusのtargetsページを確認: http://localhost:9090/targets
2. すべてのターゲットが`UP`状態か確認
3. `DOWN`の場合、該当サービスのログを確認

### Grafanaにダッシュボードが表示されない

1. 設定ファイルのマウント確認：
   ```bash
   docker compose -f infra/docker/compose.yml exec grafana ls -la /etc/grafana/provisioning/
   ```
2. Grafanaのログ確認：
   ```bash
   docker compose -f infra/docker/compose.yml logs grafana
   ```

## 次のステップ

- [ポート一覧](./ports.md)で詳細なポート設定を確認
- [アーキテクチャ](./architecture.md)でシステム構成を理解
- カスタムダッシュボードを作成してプロジェクト固有のメトリクスを追加
