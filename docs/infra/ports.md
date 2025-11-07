# ポート一覧

## 概要

Hazumu推論バックエンド環境で使用されるポートの一覧です。

## サービス別ポート

### Ollama (LLM推論サーバー)

| ポート | プロトコル | 説明 | 外部公開 |
|--------|-----------|------|---------|
| 11434 | HTTP | LLM推論API | ✓ |
| 11434 | HTTP | メトリクスエンドポイント (`/metrics`) | ✓ |

**エンドポイント:**
- `GET /` - ヘルスチェック
- `POST /api/generate` - テキスト生成
- `POST /api/chat` - チャット推論
- `GET /api/tags` - モデル一覧
- `GET /metrics` - Prometheusメトリクス（存在する場合）

**アクセス例:**
```bash
curl http://localhost:11434/
```

### Prometheus (メトリクス収集)

| ポート | プロトコル | 説明 | 外部公開 |
|--------|-----------|------|---------|
| 9090 | HTTP | Web UI / API | ✓ |

**主要エンドポイント:**
- `GET /` - Web UI
- `GET /api/v1/query` - PromQL クエリ
- `GET /api/v1/targets` - ターゲット一覧
- `GET /graph` - グラフ表示

**アクセス例:**
```bash
curl http://localhost:9090/api/v1/targets
```

### Grafana (可視化)

| ポート | プロトコル | 説明 | 外部公開 |
|--------|-----------|------|---------|
| 3000 | HTTP | Web UI | ✓ |

**デフォルト認証情報:**
- ユーザー名: `admin`
- パスワード: `admin`

**アクセス例:**
```bash
# ブラウザで開く
open http://localhost:3000
```

### cAdvisor (コンテナ監視)

| ポート | プロトコル | 説明 | 外部公開 |
|--------|-----------|------|---------|
| 8080 | HTTP | Web UI / メトリクス | ✓ |

**主要エンドポイント:**
- `GET /` - Web UI（リアルタイムコンテナ統計）
- `GET /metrics` - Prometheusメトリクス

**アクセス例:**
```bash
curl http://localhost:8080/metrics
```

### Blackbox Exporter (エンドポイント監視)

| ポート | プロトコル | 説明 | 外部公開 |
|--------|-----------|------|---------|
| 9115 | HTTP | プローブエンドポイント | ✓ |

**主要エンドポイント:**
- `GET /probe?target=<url>&module=<module>` - プローブ実行
- `GET /metrics` - Exporter自身のメトリクス

**アクセス例:**
```bash
# Ollamaのヘルスチェック
curl 'http://localhost:9115/probe?target=http://ollama:11434&module=http_2xx'
```

## ポート競合の解決

### ポート変更方法

`infra/docker/compose.yml`を編集して、ホスト側のポートを変更できます：

```yaml
services:
  ollama:
    ports:
      - "11434:11434"  # 左側（ホスト）を変更: "12345:11434"
```

### よくある競合

| ポート | 競合する可能性のあるサービス | 代替ポート例 |
|--------|---------------------------|-------------|
| 3000 | Grafana, Node.js開発サーバー | 3001, 3333 |
| 8080 | 各種開発サーバー | 8081, 8888 |
| 9090 | 他のモニタリングツール | 9091, 9999 |

### ポート使用状況の確認

```bash
# Linux/macOS
lsof -i :3000

# ポートをリッスンしているプロセスを表示
netstat -tulpn | grep LISTEN

# すべてのHazumuサービスのポート確認
docker compose -f infra/docker/compose.yml ps
```

## ファイアウォール設定

### 開発環境（ローカルマシン）

デフォルトではlocalhost（127.0.0.1）のみアクセス可能です。他のマシンからアクセスする場合は、`compose.yml`でバインドアドレスを変更：

```yaml
ports:
  - "0.0.0.0:3000:3000"  # すべてのインターフェースで公開
```

⚠️ **セキュリティ注意**: 本番環境では適切なファイアウォール設定が必要です。

### 本番環境推奨設定

1. **内部ネットワークのみ**
   - Prometheus, cAdvisor, Blackbox Exporterは外部非公開
   - Nginxやリバースプロキシ経由でGrafanaのみ公開

2. **VPN/SSH トンネル**
   - 開発者アクセスはVPN経由
   - または SSH ポートフォワーディング使用

3. **認証・認可の強化**
   - Grafanaの認証強化（LDAP/OAuth）
   - Basic認証の追加（Nginx経由）

## ネットワーク図

```
外部 (インターネット/LAN)
    ↓
┌───────────────────────────────────┐
│  Host Machine                     │
│  (localhost / 127.0.0.1)         │
├───────────────────────────────────┤
│  :3000  → Grafana                │
│  :9090  → Prometheus             │
│  :11434 → Ollama                 │
│  :8080  → cAdvisor               │
│  :9115  → Blackbox Exporter      │
└───────────────────────────────────┘
         ↓
┌───────────────────────────────────┐
│  Docker Network (hazumu-network)  │
│  (172.x.x.x)                      │
├───────────────────────────────────┤
│  grafana:3000                     │
│  prometheus:9090                  │
│  ollama:11434                     │
│  cadvisor:8080                    │
│  blackbox-exporter:9115           │
└───────────────────────────────────┘
```

## 環境変数でのポート設定

より柔軟なポート管理のため、`.env`ファイルを作成することもできます：

```bash
# infra/docker/.env
OLLAMA_PORT=11434
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
CADVISOR_PORT=8080
BLACKBOX_PORT=9115
```

`compose.yml`で使用：

```yaml
services:
  ollama:
    ports:
      - "${OLLAMA_PORT:-11434}:11434"
```

## 関連ドキュメント

- [セットアップ手順](./setup.md) - 環境構築方法
- [アーキテクチャ](./architecture.md) - システム構成
